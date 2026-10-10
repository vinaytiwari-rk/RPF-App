import React, { useState } from "react";
import JSZip from "jszip";
import { 
  FileText, Upload, Download, Copy, Check, 
  AlertCircle, RefreshCw, FileCode, Search, 
  Layers, Sliders, Type, Hash, GitCompare
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function TextToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [inputText, setInputText] = useState("");
  const [secondText, setSecondText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Extra config state
  const [findWord, setFindWord] = useState("");
  const [replaceWord, setReplaceWord] = useState("");
  const [prefixVal, setPrefixVal] = useState("");
  const [suffixVal, setSuffixVal] = useState("");
  const [wrapCols, setWrapCols] = useState(80);
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState("g");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (file.name.endsWith(".docx")) {
        // Parse DOCX with JSZip
        const zip = await JSZip.loadAsync(file);
        const docXml = await zip.file("word/document.xml")?.async("text");
        if (!docXml) throw new Error(isHi ? "DOCX दस्तावेज़ पढ़ने में असमर्थ" : "Invalid DOCX: missing document.xml");

        // Parse paragraphs and text nodes
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXml, "application/xml");
        const paragraphs = Array.from(xmlDoc.getElementsByTagName("w:p"));
        const extracted = paragraphs.map(p => {
          const texts = Array.from(p.getElementsByTagName("w:t"));
          return texts.map(t => t.textContent || "").join("");
        }).join("\n\n");

        setInputText(extracted);
      } else {
        const text = await file.text();
        setInputText(text);
      }
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const createDocxBlob = async (content: string): Promise<Blob> => {
    const zip = new JSZip();

    // Standard OpenXML structures
    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

    zip.folder("_rels")?.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    const paras = content.split(/\r?\n/).map(line => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
      return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
    }).join("");

    zip.folder("word")?.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paras}
  </w:body>
</w:document>`);

    return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  };

  const processTool = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let result = "";

      switch (toolId) {
        case "text_docx_to_txt":
        case "text_docx_to_md":
          result = inputText;
          break;

        case "text_txt_to_docx":
        case "text_md_to_docx": {
          const blob = await createDocxBlob(inputText);
          downloadBlob(blob, "converted_document.docx");
          setSuccessMsg(isHi ? "DOCX फ़ाइल डाउनलोड हो गई!" : "DOCX file downloaded successfully!");
          setLoading(false);
          return;
        }

        case "text_md_to_html": {
          result = inputText
            .replace(/^# (.*$)/gim, "<h1>$1</h1>")
            .replace(/^## (.*$)/gim, "<h2>$1</h2>")
            .replace(/^### (.*$)/gim, "<h3>$1</h3>")
            .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
            .replace(/\*(.*)\*/gim, "<i>$1</i>")
            .replace(/`([^`]+)`/gim, "<code>$1</code>")
            .replace(/\n\n/gim, "<br/><br/>");
          break;
        }

        case "text_html_to_md": {
          result = inputText
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
            .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
            .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
            .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
            .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
            .replace(/<[^>]+>/g, "");
          break;
        }

        case "text_txt_to_html": {
          const escaped = inputText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          result = `<p>${escaped.split(/\r?\n\r?\n/).map(p => p.replace(/\r?\n/g, "<br/>")).join("</p>\n<p>")}</p>`;
          break;
        }

        case "text_html_to_txt": {
          const doc = new DOMParser().parseFromString(inputText, "text/html");
          result = doc.body.textContent || "";
          break;
        }

        case "text_rtf_to_txt": {
          // Strip RTF control commands and extract plain text
          result = inputText
            .replace(/\\par[d]?/g, "\n")
            .replace(/\{\\*?\\[^{}]+;\}|[{}]|\\\n?[A-Za-z]+-?\d* ?/g, "")
            .trim();
          break;
        }

        case "text_case_converter": {
          result = inputText.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
          break;
        }

        case "text_uppercase":
          result = inputText.toUpperCase();
          break;

        case "text_lowercase":
          result = inputText.toLowerCase();
          break;

        case "text_title_case": {
          result = inputText.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          break;
        }

        case "text_sentence_case": {
          result = inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
          break;
        }

        case "text_reverser":
          result = inputText.split("").reverse().join("");
          break;

        case "text_word_counter": {
          const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
          const chars = inputText.length;
          const charsNoSpace = inputText.replace(/\s/g, "").length;
          const lines = inputText ? inputText.split(/\r?\n/).length : 0;
          result = `Words (कुल शब्द): ${words}\nCharacters (कुल अक्षर): ${chars}\nCharacters without spaces: ${charsNoSpace}\nLines (कुल पंक्तियां): ${lines}`;
          break;
        }

        case "text_char_counter": {
          result = `Total Characters (अक्षर): ${inputText.length}\nLetters: ${(inputText.match(/[a-zA-Z\u0900-\u097F]/g) || []).length}\nDigits: ${(inputText.match(/\d/g) || []).length}\nWhitespace: ${(inputText.match(/\s/g) || []).length}`;
          break;
        }

        case "text_line_counter": {
          const lines = inputText ? inputText.split(/\r?\n/) : [];
          const nonEmpty = lines.filter(l => l.trim().length > 0);
          result = `Total Lines (कुल पंक्तियां): ${lines.length}\nNon-empty Lines (भरी हुई पंक्तियां): ${nonEmpty.length}\nBlank Lines (खाली पंक्तियां): ${lines.length - nonEmpty.length}`;
          break;
        }

        case "text_sort_alpha": {
          const lines = inputText.split(/\r?\n/);
          result = lines.sort((a, b) => a.localeCompare(b)).join("\n");
          break;
        }

        case "text_line_dedup": {
          const lines = inputText.split(/\r?\n/);
          result = Array.from(new Set(lines)).join("\n");
          break;
        }

        case "text_whitespace_cleaner": {
          result = inputText
            .split(/\r?\n/)
            .map(l => l.trim().replace(/\s+/g, " "))
            .join("\n");
          break;
        }

        case "text_blank_line_remover": {
          result = inputText.split(/\r?\n/).filter(l => l.trim().length > 0).join("\n");
          break;
        }

        case "text_line_number_adder": {
          result = inputText.split(/\r?\n/).map((l, i) => `${i + 1}. ${l}`).join("\n");
          break;
        }

        case "text_line_number_remover": {
          result = inputText.split(/\r?\n/).map(l => l.replace(/^\s*\d+[\.\)\:\-]\s*/, "")).join("\n");
          break;
        }

        case "text_prefix_adder": {
          result = inputText.split(/\r?\n/).map(l => `${prefixVal}${l}`).join("\n");
          break;
        }

        case "text_suffix_adder": {
          result = inputText.split(/\r?\n/).map(l => `${l}${suffixVal}`).join("\n");
          break;
        }

        case "text_wrap_formatter": {
          const limit = Number(wrapCols) || 80;
          const words = inputText.split(/\s+/);
          const lines: string[] = [];
          let current = "";
          for (const w of words) {
            if ((current + " " + w).trim().length > limit) {
              lines.push(current.trim());
              current = w;
            } else {
              current += " " + w;
            }
          }
          if (current.trim()) lines.push(current.trim());
          result = lines.join("\n");
          break;
        }

        case "text_word_frequency": {
          const words = (inputText.toLowerCase().match(/[\w\u0900-\u097F]+/g) || []);
          const freq: Record<string, number> = {};
          words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
          result = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([w, c]) => `${w}: ${c} बार (${((c / words.length) * 100).toFixed(1)}%)`)
            .join("\n");
          break;
        }

        case "text_stopword_remover": {
          const stops = new Set(["a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with", "is", "was", "है", "हैं", "का", "के", "की", "और", "में", "पर", "से", "को"]);
          result = inputText.split(/\s+/).filter(w => !stops.has(w.toLowerCase())).join(" ");
          break;
        }

        case "text_unicode_normalizer": {
          result = inputText.normalize("NFC");
          break;
        }

        case "text_smart_quotes": {
          result = inputText
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2013\u2014]/g, "-");
          break;
        }

        case "text_diff_viewer": {
          const l1 = inputText.split(/\r?\n/);
          const l2 = secondText.split(/\r?\n/);
          const only1 = l1.filter(l => !l2.includes(l));
          const only2 = l2.filter(l => !l1.includes(l));
          result = `--- केवल पहले टेक्स्ट में (${only1.length}) ---\n${only1.join("\n")}\n\n--- केवल दूसरे टेक्स्ट में (${only2.length}) ---\n${only2.join("\n")}`;
          break;
        }

        case "text_inline_diff": {
          const w1 = inputText.split(/\s+/);
          const w2 = secondText.split(/\s+/);
          result = w1.map((w, i) => {
            if (w2[i] === undefined) return `[-${w}-]`;
            if (w2[i] !== w) return `[-${w}-]{+${w2[i]}+}`;
            return w;
          }).join(" ");
          break;
        }

        case "text_unified_diff": {
          const l1 = inputText.split(/\r?\n/);
          const l2 = secondText.split(/\r?\n/);
          const max = Math.max(l1.length, l2.length);
          const diff: string[] = ["--- Original", "+++ Modified"];
          for (let i = 0; i < max; i++) {
            if (l1[i] !== l2[i]) {
              if (l1[i] !== undefined) diff.push(`- ${l1[i]}`);
              if (l2[i] !== undefined) diff.push(`+ ${l2[i]}`);
            } else {
              diff.push(`  ${l1[i]}`);
            }
          }
          result = diff.join("\n");
          break;
        }

        case "text_regex_tester": {
          const re = new RegExp(regexPattern || ".*", regexFlags);
          const matches = Array.from(inputText.matchAll(re));
          result = `कुल मैच: ${matches.length}\n` + matches.map((m, i) => `#${i + 1}: "${m[0]}" (Index: ${m.index})`).join("\n");
          break;
        }

        case "text_regex_validator": {
          try {
            new RegExp(regexPattern);
            result = `✓ Regular Expression वैध (Valid) है!\nPattern: /${regexPattern}/`;
          } catch (e: unknown) {
            result = `✗ अमान्य (Invalid) Regular Expression:\n${e instanceof Error ? e.message : String(e)}`;
          }
          break;
        }

        case "text_search_replace": {
          if (!findWord) {
            result = inputText;
          } else {
            result = inputText.split(findWord).join(replaceWord);
          }
          break;
        }

        case "text_snippet_extractor": {
          const paras = inputText.split(/\r?\n\r?\n/).filter(p => p.trim());
          result = paras.slice(0, 3).map((p, i) => `[स्निपेट ${i + 1}]:\n${p.slice(0, 200)}...`).join("\n\n");
          break;
        }

        case "text_punctuation_remover": {
          result = inputText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, "").replace(/\s{2,}/g, " ");
          break;
        }

        case "text_similarity_comparator": {
          // Jaccard similarity index on unique words
          const setA = new Set(inputText.toLowerCase().match(/\w+/g) || []);
          const setB = new Set(secondText.toLowerCase().match(/\w+/g) || []);
          const intersection = new Set([...setA].filter(x => setB.has(x)));
          const union = new Set([...setA, ...setB]);
          const sim = union.size === 0 ? 100 : (intersection.size / union.size) * 100;
          result = `समानता दर (Similarity): ${sim.toFixed(2)}%\nउभयनिष्ठ शब्द (Common Words): ${intersection.size}\nकुल अलग शब्द (Total Unique): ${union.size}`;
          break;
        }

        default:
          result = inputText;
      }

      setOutputText(result);
      setSuccessMsg(isHi ? "परिणाम तैयार है!" : "Result generated successfully!");
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const handleDownloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `output_${toolId}.txt`);
  };

  const isDualInput = ["text_diff_viewer", "text_inline_diff", "text_unified_diff", "text_similarity_comparator"].includes(toolId);

  return (
    <div className="space-y-4">
      {/* File Upload Option */}
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input
          type="file"
          accept=".txt,.docx,.md,.html,.rtf"
          onChange={handleFileUpload}
          id="text-file-upload"
          className="hidden"
        />
        <label htmlFor="text-file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-1 text-xs font-semibold text-emerald-950">
            {fileName ? fileName : isHi ? "फ़ाइल अपलोड करें (TXT, DOCX, Markdown, HTML, RTF)" : "Upload File (TXT, DOCX, Markdown, HTML, RTF)"}
          </p>
          <p className="text-[10px] text-emerald-700">
            {isHi ? "या नीचे सीधे टेक्स्ट टाइप / पेस्ट करें" : "or type/paste text directly below"}
          </p>
        </label>
      </div>

      {/* Extra Config Controls */}
      {toolId === "text_search_replace" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "खोजें (Find)" : "Find"}</label>
            <input
              type="text"
              value={findWord}
              onChange={e => setFindWord(e.target.value)}
              placeholder="खोजने वाला शब्द"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "बदलें (Replace with)" : "Replace with"}</label>
            <input
              type="text"
              value={replaceWord}
              onChange={e => setReplaceWord(e.target.value)}
              placeholder="नया शब्द"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        </div>
      )}

      {toolId === "text_prefix_adder" && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "प्रत्येक पंक्ति के आगे जोड़ें (Prefix)" : "Prefix for each line"}</label>
          <input
            type="text"
            value={prefixVal}
            onChange={e => setPrefixVal(e.target.value)}
            placeholder="जैसे: > या • "
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "text_suffix_adder" && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "प्रत्येक पंक्ति के पीछे जोड़ें (Suffix)" : "Suffix for each line"}</label>
          <input
            type="text"
            value={suffixVal}
            onChange={e => setSuffixVal(e.target.value)}
            placeholder="जैसे: ; या ,"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "text_wrap_formatter" && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "पंक्ति चौड़ाई सीमा (वर्ण)" : "Characters per line"}: {wrapCols}</label>
          <input
            type="range"
            min="20"
            max="120"
            value={wrapCols}
            onChange={e => setWrapCols(Number(e.target.value))}
            className="w-full accent-emerald-600 mt-1"
          />
        </div>
      )}

      {(toolId === "text_regex_tester" || toolId === "text_regex_validator") && (
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "Regex Pattern" : "Regex Pattern"}</label>
            <input
              type="text"
              value={regexPattern}
              onChange={e => setRegexPattern(e.target.value)}
              placeholder="[a-zA-Z0-9]+"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "Flags" : "Flags"}</label>
            <input
              type="text"
              value={regexFlags}
              onChange={e => setRegexFlags(e.target.value)}
              placeholder="g, i, m"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Input Textarea 1 */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {isDualInput ? (isHi ? "मूल टेक्स्ट 1 (Original Text)" : "Original Text 1") : (isHi ? "इनपुट टेक्स्ट" : "Input Text")}
        </label>
        <textarea
          rows={5}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={isHi ? "यहाँ टेक्स्ट लिखें या पेस्ट करें..." : "Type or paste text here..."}
          className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800"
        />
      </div>

      {/* Input Textarea 2 (For Diff / Comparison) */}
      {isDualInput && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isHi ? "संशोधित टेक्स्ट 2 (Modified Text 2)" : "Modified Text 2"}
          </label>
          <textarea
            rows={5}
            value={secondText}
            onChange={e => setSecondText(e.target.value)}
            placeholder={isHi ? "दूसरा टेक्स्ट लिखें तुलना के लिए..." : "Type or paste second text to compare..."}
            className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800"
          />
        </div>
      )}

      {/* Process Button */}
      <button
        type="button"
        onClick={processTool}
        disabled={loading || !inputText.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{isHi ? "प्रोसेसिंग..." : "Processing..."}</span>
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            <span>{isHi ? "चलाएं (Run Tool)" : "Run Tool"}</span>
          </>
        )}
      </button>

      {/* Results View */}
      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{isHi ? "परिणाम (Output)" : "Output Result"}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(outputText)}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy className="h-3 w-3" />
                <span>{isHi ? "कॉपी" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadOutput}
                className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Download className="h-3 w-3" />
                <span>{isHi ? "डाउनलोड" : "Download TXT"}</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            rows={6}
            value={outputText}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800"
          />
        </div>
      )}

      {/* Status Messages */}
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
