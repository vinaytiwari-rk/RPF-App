import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, Download, Copy, Check, AlertCircle, RefreshCw, 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, Heading1, Heading2, 
  Heading3, Table, Undo, Redo, Sparkles, Printer, Eraser, LayoutTemplate, Palette
} from "lucide-react";
import JSZip from "jszip";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

interface TemplateOption {
  id: string;
  nameEn: string;
  nameHi: string;
  content: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "application",
    nameEn: "Formal Application / Letter",
    nameHi: "औपचारिक आवेदन / प्रार्थना पत्र",
    content: `
      <p style="text-align: right;"><strong>दिनांक:</strong> ${new Date().toLocaleDateString("hi-IN")}</p>
      <p><strong>सेवा में,</strong><br/>श्रीमान सक्षम अधिकारी महोदय,<br/>[विभाग / कार्यालय का नाम]<br/>[शहर / पता]</p>
      <p><strong>विषय:</strong> [यहाँ आवेदन का विषय संक्षेप में लिखें]</p>
      <p><strong>महोदय,</strong></p>
      <p style="text-indent: 40px;">सविनय निवेदन है कि प्रार्थी [अपना नाम यहाँ लिखें], निवासी [पता] का स्थायी निवासी है। प्रार्थी आपको अवगत कराना चाहता है कि [यहाँ अपनी समस्या या अनुरोध का विवरण लिखें]...</p>
      <p style="text-indent: 40px;">अतः आपसे सादर नम्र निवेदन है कि उक्त विषय पर यथोचित व त्वरित संज्ञान लेने की कृपा करें। इस हेतु प्रार्थी आपका सदैव आभारी रहेगा।</p>
      <br/>
      <div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <p><strong>संलग्नक:</strong> आवश्यक दस्तावेज़</p>
        <div style="text-align: right;">
          <p><strong>भवदीय,</strong><br/>हस्ताक्षर: ________________<br/>नाम: [अपना नाम]<br/>मोबाइल: [फोन नंबर]</p>
        </div>
      </div>
    `,
  },
  {
    id: "notice",
    nameEn: "Official Public Notice",
    nameHi: "सार्वजनिक सूचना / नोटिस",
    content: `
      <div style="text-align: center; border-bottom: 2px solid #1E293B; padding-bottom: 8px; margin-bottom: 16px;">
        <h2 style="margin: 0; text-transform: uppercase;">[संस्था / संगठन का नाम]</h2>
        <p style="margin: 4px 0; font-size: 13px;">[कार्यालय पता एवं संपर्क सूत्र]</p>
      </div>
      <p style="text-align: center;"><span style="background: #FEF08A; padding: 4px 16px; font-weight: bold; border-radius: 4px; font-size: 16px;">आवश्यक सूचना / NOTICE</span></p>
      <div style="display: flex; justify-content: space-between; margin: 12px 0;">
        <p><strong>पत्रांक:</strong> RPF/2026/01</p>
        <p><strong>दिनांक:</strong> ${new Date().toLocaleDateString("hi-IN")}</p>
      </div>
      <p>सर्वसाधारण एवं सभी सदस्यों को सूचित किया जाता है कि [यहाँ सूचना का विस्तृत विवरण लिखें]...</p>
      <p>सभी संबंधित व्यक्ति कृपया समय पर उपस्थित रहें एवं निर्देशों का अनुपालन सुनिश्चित करें।</p>
      <br/>
      <p style="text-align: right;"><strong>आदेशानुसार,</strong><br/>[प्राधिकृत हस्ताक्षरकर्ता]<br/>पदभार</p>
    `,
  },
  {
    id: "biodata",
    nameEn: "Bio-Data / Resume",
    nameHi: "बायोडाटा / व्यक्तिगत विवरण",
    content: `
      <div style="text-align: center; border-bottom: 1px solid #CBD5E1; padding-bottom: 12px; margin-bottom: 16px;">
        <h1 style="margin: 0; font-size: 22px;">[आपका पूरा नाम]</h1>
        <p style="margin: 4px 0; font-size: 13px; color: #475569;">फोन: +91-XXXXXXXXXX | ईमेल: user@example.com | पता: [शहर, राज्य]</p>
      </div>
      <h3 style="background: #F1F5F9; padding: 4px 8px; border-left: 4px solid #0F766E; font-size: 14px;">1. व्यक्तिगत विवरण (Personal Details)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 4px; width: 35%;"><strong>पिता का नाम:</strong></td><td style="padding: 4px;">[पिताजी का नाम]</td></tr>
        <tr><td style="padding: 4px;"><strong>जन्म तिथि:</strong></td><td style="padding: 4px;">DD/MM/YYYY</td></tr>
        <tr><td style="padding: 4px;"><strong>वैवाहिक स्थिति:</strong></td><td style="padding: 4px;">अविवाहित / विवाहित</td></tr>
        <tr><td style="padding: 4px;"><strong>मातृभाषा:</strong></td><td style="padding: 4px;">हिंदी / अंग्रेजी</td></tr>
      </table>
      <h3 style="background: #F1F5F9; padding: 4px 8px; border-left: 4px solid #0F766E; font-size: 14px;">2. शैक्षणिक योग्यता (Education)</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1; margin-bottom: 16px;">
        <thead>
          <tr style="background: #E2E8F0;">
            <th style="border: 1px solid #CBD5E1; padding: 6px;">कक्षा/डिग्री</th>
            <th style="border: 1px solid #CBD5E1; padding: 6px;">बोर्ड/विश्वविद्यालय</th>
            <th style="border: 1px solid #CBD5E1; padding: 6px;">वर्ष</th>
            <th style="border: 1px solid #CBD5E1; padding: 6px;">प्रतिशत</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="border: 1px solid #CBD5E1; padding: 4px;">10वीं</td><td style="border: 1px solid #CBD5E1; padding: 4px;">राज्य बोर्ड</td><td style="border: 1px solid #CBD5E1; padding: 4px;">2020</td><td style="border: 1px solid #CBD5E1; padding: 4px;">75%</td></tr>
          <tr><td style="border: 1px solid #CBD5E1; padding: 4px;">12वीं</td><td style="border: 1px solid #CBD5E1; padding: 4px;">राज्य बोर्ड</td><td style="border: 1px solid #CBD5E1; padding: 4px;">2022</td><td style="border: 1px solid #CBD5E1; padding: 4px;">78%</td></tr>
          <tr><td style="border: 1px solid #CBD5E1; padding: 4px;">स्नातक</td><td style="border: 1px solid #CBD5E1; padding: 4px;">विश्वविद्यालय</td><td style="border: 1px solid #CBD5E1; padding: 4px;">2025</td><td style="border: 1px solid #CBD5E1; padding: 4px;">प्रथम श्रेणी</td></tr>
        </tbody>
      </table>
      <h3 style="background: #F1F5F9; padding: 4px 8px; border-left: 4px solid #0F766E; font-size: 14px;">3. घोषणा (Declaration)</h3>
      <p style="font-size: 12px;">मैं प्रमाणित करता हूँ कि उपर्युक्त समस्त विवरण मेरी जानकारी में पूर्णतः सत्य एवं सही हैं।</p>
      <br/>
      <div style="display: flex; justify-content: space-between;">
        <p style="font-size: 12px;">दिनांक: ____________<br/>स्थान: ____________</p>
        <p style="text-align: right; font-size: 12px;">(हस्ताक्षर)</p>
      </div>
    `,
  },
];

export default function WordToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [docTitle, setDocTitle] = useState("RPF_Document");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Document Stats
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Page setup states
  const [pageSize, setPageSize] = useState<"A4" | "Letter">("A4");
  const [marginSize, setMarginSize] = useState<"normal" | "narrow" | "wide">("normal");

  // Table builder parameters
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      if (toolId === "word_template_draft") {
        editorRef.current.innerHTML = TEMPLATES[0].content;
        setDocTitle("Formal_Application");
      } else if (toolId === "word_table_builder") {
        insertInitialTable(tableRows, tableCols);
        setDocTitle("Table_Document");
      } else {
        editorRef.current.innerHTML = `
          <h1>${isHi ? "दस्तावेज़ शीर्षक" : "Document Title"}</h1>
          <p>${isHi ? "यहाँ अपना पत्र, रिपोर्ट, बायोडाटा या प्रारूप टाइप करें। ऊपर दिए गए टूलबार से हेडिंग, टेबल, सूचियां और फॉर्मेटिंग बदलें।" : "Start typing your letter, report, agreement or article here. Use the Word toolbar above to format headings, bold, lists, and colors."}</p>
          <p><br></p>
        `;
      }
      updateStats();
    }
  }, [toolId, isHi]);

  const execCmd = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      updateStats();
    }
  };

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const insertInitialTable = (rows: number, cols: number) => {
    let html = `<table style="width:100%; border-collapse:collapse; margin:16px 0; border:1px solid #94A3B8;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          html += `<th style="border:1px solid #94A3B8; padding:8px; background-color:#F1F5F9; font-weight:bold;">शीर्षक ${c + 1}</th>`;
        } else {
          html += `<td style="border:1px solid #94A3B8; padding:8px;">डेटा ${r},${c + 1}</td>`;
        }
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      updateStats();
    }
  };

  const insertTable = (rows: number, cols: number) => {
    let html = `<table style="width:100%; border-collapse:collapse; margin:16px 0; border:1px solid #94A3B8;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          html += `<th style="border:1px solid #94A3B8; padding:8px; background-color:#F1F5F9; font-weight:bold;">शीर्षक ${c + 1}</th>`;
        } else {
          html += `<td style="border:1px solid #94A3B8; padding:8px;">डेटा ${r},${c + 1}</td>`;
        }
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;
    execCmd("insertHTML", html);
  };

  const exportToDocx = async () => {
    if (!editorRef.current) return;
    setLoading(true);
    setError(null);

    try {
      const text = editorRef.current.innerText || "";
      const zip = new JSZip();

      zip.file(
        "[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>`
      );

      zip.folder("_rels")?.file(
        ".rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>`
      );

      const paragraphsXml = text.split(/\r?\n/).map(line => {
        const safe = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<w:p><w:r><w:t>${safe}</w:t></w:r></w:p>`;
      }).join("");

      zip.folder("word")?.file(
        "document.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            ${paragraphsXml}
          </w:body>
        </w:document>`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const outName = `${docTitle.trim() || "document"}.docx`;
      downloadBlob(blob, outName);
      setSuccessMsg(isHi ? `DOCX फ़ाइल डाउनलोड हुई: ${outName}` : `DOCX file downloaded: ${outName}`);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to export DOCX");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Title & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs font-bold text-slate-500">{isHi ? "दस्तावेज़ नाम:" : "Doc Title:"}</span>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
          <span><strong>{wordCount}</strong> {isHi ? "शब्द" : "words"}</span>
          <span><strong>{charCount}</strong> {isHi ? "अक्षर" : "chars"}</span>
        </div>
      </div>

      {/* Tool-specific Options */}
      {toolId === "word_template_draft" && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-3 space-y-2">
          <span className="text-xs font-bold text-teal-900">{isHi ? "टेम्पलेट चुनें:" : "Choose Template:"}</span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  if (editorRef.current) {
                    editorRef.current.innerHTML = tpl.content;
                    updateStats();
                    setDocTitle(tpl.id);
                  }
                }}
                className="rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-50 shadow-2xs"
              >
                {isHi ? tpl.nameHi : tpl.nameEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {toolId === "word_table_builder" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-blue-900">{isHi ? "टेबल का आकार:" : "Table Dimensions:"}</span>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span>{isHi ? "पंक्तियाँ:" : "Rows:"}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={tableRows}
              onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span>{isHi ? "कॉलम:" : "Cols:"}</span>
            <input
              type="number"
              min={1}
              max={10}
              value={tableCols}
              onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center font-mono"
            />
          </div>
          <button
            type="button"
            onClick={() => insertTable(tableRows, tableCols)}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
          >
            {isHi ? "टेबल जोड़ें +" : "Insert Table +"}
          </button>
        </div>
      )}

      {toolId === "word_page_setup" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span>{isHi ? "पेज साइज:" : "Page Size:"}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as "A4" | "Letter")}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1"
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="Letter">Letter (8.5 x 11 in)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>{isHi ? "मार्जिन:" : "Margins:"}</span>
            <select
              value={marginSize}
              onChange={(e) => setMarginSize(e.target.value as "normal" | "narrow" | "wide")}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1"
            >
              <option value="normal">{isHi ? "सामान्य (1 in)" : "Normal (1 in)"}</option>
              <option value="narrow">{isHi ? "संकीर्ण (0.5 in)" : "Narrow (0.5 in)"}</option>
              <option value="wide">{isHi ? "चौड़ा (1.5 in)" : "Wide (1.5 in)"}</option>
            </select>
          </div>
        </div>
      )}

      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-slate-100 border border-slate-200 p-2">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          title="Bold"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          title="Italic"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="Underline"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("strikeThrough")}
          title="Strikethrough"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => execCmd("formatBlock", "<h1>")}
          title="Heading 1"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "<h2>")}
          title="Heading 2"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "<p>")}
          title="Paragraph"
          className="rounded-lg p-1.5 hover:bg-white text-xs font-bold text-slate-700 hover:text-slate-900 transition"
        >
          P
        </button>

        <span className="h-4 w-[1px] bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => execCmd("justifyLeft")}
          title="Align Left"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyCenter")}
          title="Align Center"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyRight")}
          title="Align Right"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyFull")}
          title="Justify"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          title="Bullet List"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          title="Numbered List"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => insertTable(3, 3)}
          title="Insert Table"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Table className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("removeFormat")}
          title="Clear Format"
          className="rounded-lg p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 transition"
        >
          <Eraser className="h-4 w-4" />
        </button>
      </div>

      {/* Document Editable Canvas */}
      <div 
        className={`min-h-[280px] max-h-[460px] overflow-y-auto rounded-2xl border border-slate-300 bg-white shadow-inner font-serif text-slate-900 outline-none leading-relaxed focus:ring-2 focus:ring-teal-500/30 ${
          marginSize === "narrow" ? "p-4" : marginSize === "wide" ? "p-8" : "p-6"
        }`}
        style={{
          maxWidth: pageSize === "Letter" ? "8.5in" : "210mm",
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateStats}
          className="outline-none min-h-[220px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={exportToDocx}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>{isHi ? "Word (.docx) फ़ाइल डाउनलोड करें" : "Download Word (.docx)"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (editorRef.current) copyToClipboard(editorRef.current.innerText);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>{isHi ? "टेक्स्ट कॉपी करें" : "Copy Text"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
