import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, Download, Copy, Check, AlertCircle, RefreshCw, 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, Heading1, Heading2, 
  Heading3, Table, FileCode, Undo, Redo, Sparkles, Printer, Eraser
} from "lucide-react";
import JSZip from "jszip";

interface Props {
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function WordStudioEditorEngine({ isHi, downloadBlob, copyToClipboard }: Props) {
  const [docTitle, setDocTitle] = useState("Untitled_Document");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Document Stats
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Formatting state
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textColor, setTextColor] = useState("#1E293B");
  const [highlightColor, setHighlightColor] = useState("#FEF08A");

  const editorRef = useRef<HTMLDivElement | null>(null);

  // Initial starter document template
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = `
        <h1>${isHi ? "दस्तावेज़ शीर्षक (Document Title)" : "Document Title"}</h1>
        <p>${isHi ? "यहाँ अपना पत्र, रिपोर्ट, बायोडाटा या अनुबंध टाइप करें। आप ऊपर दिए गए एमएस-वर्ड टूलबार से हेडिंग, टेबल, सूचियां और फॉन्ट्स बदल सकते हैं।" : "Start typing your letter, report, agreement or article here. Use the Word toolbar above to format headings, bold, lists, tables, and colors."}</p>
        <p><br></p>
      `;
      updateStats();
    }
  }, [isHi]);

  // Execute standard Rich Text command
  const execCmd = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      updateStats();
    }
  };

  // Update Word & Character Count
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  };

  // Insert Table
  const insertTable = (rows: number = 3, cols: number = 3) => {
    let html = `<table style="width:100%; border-collapse:collapse; margin:16px 0; border:1px solid #CBD5E1;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          html += `<th style="border:1px solid #CBD5E1; padding:8px; background-color:#F1F5F9; font-weight:bold;">Header ${c + 1}</th>`;
        } else {
          html += `<td style="border:1px solid #CBD5E1; padding:8px;">Data ${r},${c + 1}</td>`;
        }
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;
    execCmd("insertHTML", html);
  };

  // Clear Formatting
  const clearFormatting = () => {
    execCmd("removeFormat");
  };

  // Export to .DOCX (Pure Offline Standards-Compliant Word XML Package via JSZip)
  const exportToDocx = async () => {
    if (!editorRef.current) return;
    setLoading(true);
    setError(null);

    try {
      const text = editorRef.current.innerText || "";
      const zip = new JSZip();

      // [Content_Types].xml
      zip.file(
        "[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>`
      );

      // _rels/.rels
      zip.folder("_rels")?.file(
        ".rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>`
      );

      // Paragraph XML generation
      const paragraphsXml = text.split(/\r?\n/).map(line => {
        const safe = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<w:p><w:r><w:t>${safe}</w:t></w:r></w:p>`;
      }).join("");

      // word/document.xml
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

  // Export to .HTML
  const exportToHtml = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${docTitle}</title>
<style>
body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1E293B; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { border: 1px solid #CBD5E1; padding: 8px; }
th { background-color: #F1F5F9; font-weight: bold; }
</style>
</head>
<body>
${content}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const outName = `${docTitle.trim() || "document"}.html`;
    downloadBlob(blob, outName);
    setSuccessMsg(isHi ? `HTML फ़ाइल डाउनलोड हुई: ${outName}` : `HTML file downloaded: ${outName}`);
  };

  // Export to .TXT
  const exportToTxt = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const outName = `${docTitle.trim() || "document"}.txt`;
    downloadBlob(blob, outName);
    setSuccessMsg(isHi ? `TXT फ़ाइल डाउनलोड हुई: ${outName}` : `TXT file downloaded: ${outName}`);
  };

  return (
    <div className="space-y-3">
      {/* 1. Header Bar: Document Title & Live Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <FileText className="h-5 w-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={docTitle}
            onChange={e => setDocTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Word Count Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1">
            {isHi ? "शब्द:" : "Words:"} <b className="text-slate-800">{wordCount}</b>
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-1">
            {isHi ? "अक्षर:" : "Chars:"} <b className="text-slate-800">{charCount}</b>
          </span>
          <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-1">
            ⏱ {readingTime} min read
          </span>
        </div>
      </div>

      {/* 2. Professional Word Ribbon / Toolbar */}
      <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => execCmd("undo")}
            title="Undo"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("redo")}
            title="Redo"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Redo className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Headings Dropdown */}
        <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1 gap-1">
          <button
            type="button"
            onClick={() => execCmd("formatBlock", "<h1>")}
            title="Heading 1"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-black text-xs"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("formatBlock", "<h2>")}
            title="Heading 2"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-black text-xs"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("formatBlock", "<p>")}
            title="Normal Paragraph"
            className="px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            P
          </button>
        </div>

        {/* Font Style Toggles */}
        <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => execCmd("bold")}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Underline className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("strikeThrough")}
            title="Strikethrough"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => execCmd("justifyLeft")}
            title="Align Left"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyCenter")}
            title="Align Center"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyRight")}
            title="Align Right"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyFull")}
            title="Justify"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Lists & Table */}
        <div className="flex items-center border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            title="Bullet List"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            title="Numbered List"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertTable(3, 3)}
            title="Insert Table (3x3)"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Table className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Text Color & Highlight */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1" title="Font Color">
            <span className="text-[10px] font-bold text-slate-600">A</span>
            <input
              type="color"
              value={textColor}
              onChange={e => {
                setTextColor(e.target.value);
                execCmd("foreColor", e.target.value);
              }}
              className="h-6 w-6 rounded cursor-pointer border border-slate-300"
            />
          </div>

          <div className="flex items-center gap-1" title="Highlight Color">
            <span className="text-[10px] font-bold text-slate-600">HL</span>
            <input
              type="color"
              value={highlightColor}
              onChange={e => {
                setHighlightColor(e.target.value);
                execCmd("hiliteColor", e.target.value);
              }}
              className="h-6 w-6 rounded cursor-pointer border border-slate-300"
            />
          </div>

          <button
            type="button"
            onClick={clearFormatting}
            title="Clear Formatting"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Word Document Page Canvas (A4 Paper Style) */}
      <div className="flex justify-center rounded-2xl border border-slate-300 bg-slate-100/90 p-4 sm:p-6 overflow-y-auto max-h-[580px] shadow-inner">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateStats}
          onBlur={updateStats}
          spellCheck={false}
          className="min-h-[650px] w-full max-w-[720px] rounded-lg bg-white p-8 sm:p-12 shadow-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 leading-relaxed font-sans text-sm"
          style={{
            minHeight: "650px",
          }}
        />
      </div>

      {/* 4. Export & Download Bar (.DOCX, .HTML, .TXT) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 shadow-xs">
        <div className="text-xs text-blue-900 font-semibold">
          <span>{isHi ? "100% ऑफलाइन वर्ड प्रोसेसर (सुरक्षित)" : "100% offline document processor"}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToDocx}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-blue-800 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isHi ? "DOCX (Word) डाउनलोड" : "Export .DOCX"}</span>
          </button>

          <button
            type="button"
            onClick={exportToHtml}
            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>.HTML</span>
          </button>

          <button
            type="button"
            onClick={exportToTxt}
            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
          >
            <span>.TXT</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
