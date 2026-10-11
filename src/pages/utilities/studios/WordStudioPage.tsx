import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Download, FileText, Printer, Copy, Check, Sparkles,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Heading1, Heading2,
  Heading3, Table, Minus, Quote, Calendar, Undo, Redo, RefreshCw,
  FolderOpen, LayoutTemplate, Palette, Highlighter
} from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import toast from "react-hot-toast";

interface NativeDownloadsPlugin {
  saveToDownloads(options: { filename: string; mimeType: string; data: string }): Promise<{ uri: string; filename: string }>;
}
const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

interface TemplateOption {
  id: string;
  nameEn: string;
  nameHi: string;
  content: string;
}

const DOCUMENT_TEMPLATES: TemplateOption[] = [
  {
    id: "blank",
    nameEn: "Blank Document",
    nameHi: "कोरा दस्तावेज़",
    content: "<p>यहाँ अपना दस्तावेज़ लिखना शुरू करें...</p>",
  },
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
      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <p><strong>संलग्नक:</strong> आवश्यक दस्तावेज़</p>
        <div style="text-align: right;">
          <p><strong>भवदीय,</strong><br/>हस्ताक्षर: ________________<br/>नाम: [अपना नाम]<br/>मोबाइल: [फोन नंबर]</p>
        </div>
      </div>
    `,
  },
  {
    id: "notice",
    nameEn: "Official Notice / सूचना",
    nameHi: "सार्वजनिक सूचना / नोटिस",
    content: `
      <div style="text-align: center; border-bottom: 2px solid #1E293B; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; text-transform: uppercase;">[संस्था / संगठन का नाम]</h2>
        <p style="margin: 4px 0; font-size: 14px;">[कार्यालय पता एवं संपर्क सूत्र]</p>
      </div>
      <p style="text-align: center;"><span style="background: #FEF08A; padding: 4px 16px; font-weight: bold; border-radius: 4px; font-size: 18px;">आवश्यक सूचना / NOTICE</span></p>
      <div style="display: flex; justify-content: space-between; margin: 15px 0;">
        <p><strong>पत्रांक:</strong> RPF/2026/01</p>
        <p><strong>दिनांक:</strong> ${new Date().toLocaleDateString("hi-IN")}</p>
      </div>
      <p>सर्वसाधारण एवं सभी सदस्यों को सूचित किया जाता है कि [यहाँ सूचना का विस्तृत विवरण लिखें]...</p>
      <p>सभी संबंधित व्यक्ति कृपया समय पर उपस्थित रहें एवं निर्देशों का अनुपालन सुनिश्चित करें।</p>
      <br/><br/>
      <p style="text-align: right;"><strong>आदेशानुसार,</strong><br/>[प्राधिकृत हस्ताक्षरकर्ता]<br/>पदभार</p>
    `,
  },
  {
    id: "biodata",
    nameEn: "Bio-Data / Resume",
    nameHi: "बायोडाटा / व्यक्तिगत विवरण",
    content: `
      <div style="text-align: center; border-bottom: 1px solid #CBD5E1; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 26px;">[आपका पूरा नाम]</h1>
        <p style="margin: 5px 0; color: #475569;">फोन: +91-XXXXXXXXXX | ईमेल: user@example.com | पता: [शहर, राज्य]</p>
      </div>
      <h3 style="background: #F1F5F9; padding: 6px 10px; border-left: 4px solid #0F766E;">1. व्यक्तिगत विवरण (Personal Details)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 6px; width: 35%;"><strong>पिता का नाम:</strong></td><td style="padding: 6px;">[पिताजी का नाम]</td></tr>
        <tr><td style="padding: 6px;"><strong>जन्म तिथि:</strong></td><td style="padding: 6px;">DD/MM/YYYY</td></tr>
        <tr><td style="padding: 6px;"><strong>वैवाहिक स्थिति:</strong></td><td style="padding: 6px;">अविवाहित / विवाहित</td></tr>
        <tr><td style="padding: 6px;"><strong>मातृभाषा:</strong></td><td style="padding: 6px;">हिंदी / अंग्रेजी</td></tr>
      </table>
      <h3 style="background: #F1F5F9; padding: 6px 10px; border-left: 4px solid #0F766E;">2. शैक्षणिक योग्यता (Education)</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1; margin-bottom: 20px;">
        <thead>
          <tr style="background: #E2E8F0;">
            <th style="border: 1px solid #CBD5E1; padding: 8px;">कक्षा/डिग्री</th>
            <th style="border: 1px solid #CBD5E1; padding: 8px;">बोर्ड/विश्वविद्यालय</th>
            <th style="border: 1px solid #CBD5E1; padding: 8px;">वर्ष</th>
            <th style="border: 1px solid #CBD5E1; padding: 8px;">प्रतिशत/ग्रेड</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="border: 1px solid #CBD5E1; padding: 6px;">10वीं (हाईस्कूल)</td><td style="border: 1px solid #CBD5E1; padding: 6px;">राज्य बोर्ड</td><td style="border: 1px solid #CBD5E1; padding: 6px;">2020</td><td style="border: 1px solid #CBD5E1; padding: 6px;">75%</td></tr>
          <tr><td style="border: 1px solid #CBD5E1; padding: 6px;">12वीं (इंटरमीडिएट)</td><td style="border: 1px solid #CBD5E1; padding: 6px;">राज्य बोर्ड</td><td style="border: 1px solid #CBD5E1; padding: 6px;">2022</td><td style="border: 1px solid #CBD5E1; padding: 6px;">78%</td></tr>
          <tr><td style="border: 1px solid #CBD5E1; padding: 6px;">स्नातक (Graduation)</td><td style="border: 1px solid #CBD5E1; padding: 6px;">विश्वविद्यालय</td><td style="border: 1px solid #CBD5E1; padding: 6px;">2025</td><td style="border: 1px solid #CBD5E1; padding: 6px;">प्रथम श्रेणी</td></tr>
        </tbody>
      </table>
      <h3 style="background: #F1F5F9; padding: 6px 10px; border-left: 4px solid #0F766E;">3. घोषणा (Declaration)</h3>
      <p>मैं प्रमाणित करता हूँ कि उपर्युक्त समस्त विवरण मेरी जानकारी व विश्वास में पूर्णतः सत्य एवं सही हैं।</p>
      <br/>
      <div style="display: flex; justify-content: space-between;">
        <p>दिनांक: ____________<br/>स्थान: ____________</p>
        <p style="text-align: right;">(हस्ताक्षर)</p>
      </div>
    `,
  },
];

export default function WordStudioPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ lang?: "en" | "hi" }>() || {};
  const isHi = context.lang === "hi";

  // Document metadata
  const [docTitle, setDocTitle] = useState<string>("RPF_Document");
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Editor Ref
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Initial Content Load
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = DOCUMENT_TEMPLATES[1].content;
      updateStats();
    }
  }, []);

  // Update statistics (Word & Character counts)
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  // Rich-text command execution
  const executeCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateStats();
    }
  };

  // Insert Custom Table
  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #94A3B8; margin: 12px 0;">
        <thead>
          <tr style="background: #F1F5F9;">
            <th style="border: 1px solid #94A3B8; padding: 8px;">शीर्षक 1</th>
            <th style="border: 1px solid #94A3B8; padding: 8px;">शीर्षक 2</th>
            <th style="border: 1px solid #94A3B8; padding: 8px;">शीर्षक 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #94A3B8; padding: 8px;">डेटा 1</td>
            <td style="border: 1px solid #94A3B8; padding: 8px;">डेटा 2</td>
            <td style="border: 1px solid #94A3B8; padding: 8px;">डेटा 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #94A3B8; padding: 8px;">डेटा 4</td>
            <td style="border: 1px solid #94A3B8; padding: 8px;">डेटा 5</td>
            <td style="border: 1px solid #94A3B8; padding: 8px;">डेटा 6</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    executeCmd("insertHTML", tableHtml);
  };

  // Insert Divider Line
  const insertDivider = () => {
    executeCmd("insertHorizontalRule");
  };

  // Insert Date Stamp
  const insertDate = () => {
    const today = new Date().toLocaleDateString(isHi ? "hi-IN" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    executeCmd("insertText", today);
  };

  // Load Template
  const applyTemplate = (tpl: TemplateOption) => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = tpl.content;
    updateStats();
    setIsTemplateModalOpen(false);
    toast.success(isHi ? `टेम्पलेट लागू: ${tpl.nameHi}` : `Template applied: ${tpl.nameEn}`);
  };

  // Copy Plain Text
  const copyText = async () => {
    if (!editorRef.current) return;
    try {
      await navigator.clipboard.writeText(editorRef.current.innerText);
      toast.success(isHi ? "टेक्स्ट कॉपी हो गया" : "Text copied to clipboard");
    } catch {
      toast.error(isHi ? "कॉपी विफल" : "Failed to copy");
    }
  };

  // Export to .DOCX (Microsoft Word HTML format standard)
  const exportDocx = async () => {
    if (!editorRef.current) return;
    setLoading(true);

    try {
      const contentHtml = editorRef.current.innerHTML;
      const title = docTitle.trim() || "RPF_Document";
      const filename = `${title}_${Date.now()}.docx`;

      // Word-compliant HTML wrapper
      const wordDocumentHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${title}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: A4;
              margin: 1in;
            }
            body {
              font-family: 'Segoe UI', Calibri, Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000000;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            td, th {
              border: 1px solid #333333;
              padding: 6px;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
        </html>
      `;

      const blob = new Blob(["\ufeff", wordDocumentHtml], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            data: dataUrl,
          });
          toast.success(isHi ? `DOCX फ़ाइल Downloads में सेव हुई: ${filename}` : `DOCX saved to Downloads: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `DOCX डाउनलोड हुआ: ${filename}` : `DOCX downloaded: ${filename}`);
      }

      setLoading(false);
    } catch {
      setLoading(false);
      toast.error(isHi ? "DOCX एक्सपोर्ट विफल" : "Failed to export DOCX");
    }
  };

  // Print Document (Clean A4 Print or Save to PDF via Browser)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans select-none fixed inset-0 z-50 print:bg-white print:p-0">
      {/* 1. TOP PREMIUM HEADER BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/utilities")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
            title="Back to Utilities"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="text-sm font-black tracking-tight text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-none max-w-[200px] sm:max-w-[300px]"
                title="Click to rename document"
              />
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200/60">
                Word Studio Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {wordCount} {isHi ? "शब्द" : "words"} · {charCount} {isHi ? "अक्षर" : "chars"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Templates Selector Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <LayoutTemplate className="h-4 w-4 text-teal-600" />
            <span>{isHi ? "रेडीमेड प्रारूप" : "Templates"}</span>
          </button>

          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={copyText}
            title="Copy Text"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <Copy className="h-4 w-4" />
          </button>

          {/* Print / Save as PDF */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print or Save PDF"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <Printer className="h-4 w-4" />
          </button>

          {/* Save as .DOCX */}
          <button
            type="button"
            onClick={exportDocx}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-2 text-xs font-black text-white shadow-md hover:from-teal-600 hover:to-emerald-600 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isHi ? "DOCX सेव करें" : "Save Word (.docx)"}</span>
          </button>
        </div>
      </header>

      {/* 2. RICH TEXT TOOLBAR (MS WORD / GOOGLE DOCS STYLE) */}
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-slate-200 bg-white px-3 overflow-x-auto scrollbar-none shadow-2xs print:hidden">
        {/* Undo & Redo */}
        <button
          type="button"
          onClick={() => executeCmd("undo")}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("redo")}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Headings */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") executeCmd("formatBlock", "<p>");
            else if (val) executeCmd("formatBlock", `<${val}>`);
          }}
          className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 focus:outline-none"
        >
          <option value="p">{isHi ? "सामान्य टेक्स्ट" : "Normal Text"}</option>
          <option value="h1">Heading 1 (शीर्षक १)</option>
          <option value="h2">Heading 2 (शीर्षक २)</option>
          <option value="h3">Heading 3 (शीर्षक ३)</option>
        </select>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onClick={() => executeCmd("bold")}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("italic")}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("underline")}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("strikeThrough")}
          title="Strikethrough"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 line-through"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Color pickers */}
        <div className="flex items-center gap-1" title="Text Color">
          <span className="text-[11px] font-bold text-slate-400">A</span>
          <input
            type="color"
            onChange={(e) => executeCmd("foreColor", e.target.value)}
            className="h-6 w-6 rounded cursor-pointer border border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1" title="Highlight Color">
          <Highlighter className="h-3.5 w-3.5 text-amber-500" />
          <input
            type="color"
            defaultValue="#FEF08A"
            onChange={(e) => executeCmd("hiliteColor", e.target.value)}
            className="h-6 w-6 rounded cursor-pointer border border-slate-200"
          />
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => executeCmd("justifyLeft")}
          title="Align Left"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("justifyCenter")}
          title="Align Center"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("justifyRight")}
          title="Align Right"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("justifyFull")}
          title="Justify"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCmd("insertUnorderedList")}
          title="Bullet List"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCmd("insertOrderedList")}
          title="Numbered List"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Inserts */}
        <button
          type="button"
          onClick={insertTable}
          title="Insert Table"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          <Table className="h-3.5 w-3.5 text-teal-600" />
          <span>Table</span>
        </button>
        <button
          type="button"
          onClick={insertDivider}
          title="Insert Horizontal Divider"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertDate}
          title="Insert Today's Date"
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <Calendar className="h-4 w-4 text-emerald-600" />
        </button>
      </div>

      {/* 3. A4 VIRTUAL PAGE WORKSPACE */}
      <main className="flex flex-1 justify-center overflow-auto p-4 sm:p-8 bg-[#E2E8F0] print:p-0 print:bg-white">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateStats}
          className="w-full max-w-[800px] min-h-[1050px] bg-white p-8 sm:p-14 shadow-xl border border-slate-300 rounded-sm focus:outline-none text-slate-900 leading-relaxed font-serif text-[15px] print:shadow-none print:border-none print:max-w-none print:w-full print:p-0"
          style={{
            minHeight: "297mm",
          }}
          spellCheck
        />
      </main>

      {/* TEMPLATE PICKER MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>{isHi ? "दस्तावेज़ प्रारूप चुनें" : "Select Document Template"}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {DOCUMENT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer transition text-left"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isHi ? tpl.nameHi : tpl.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {tpl.id === "blank"
                        ? "कोरा सफेद पृष्ठ"
                        : tpl.id === "application"
                        ? "अधिकारियों को दिया जाने वाला प्रार्थना पत्र प्रारूप"
                        : tpl.id === "notice"
                        ? "कार्यालय/संस्था का नोटिस बोर्ड प्रारूप"
                        : "नौकरी व व्यक्तिगत परिचय के लिए सारणीबद्ध विवरण"}
                    </p>
                  </div>
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-teal-600 hover:text-white transition">
                    {isHi ? "चुनें" : "Use"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
