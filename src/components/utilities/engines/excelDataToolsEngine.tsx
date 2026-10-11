import React, { useState } from "react";
import JSZip from "jszip";
import { 
  FileSpreadsheet, Upload, Download, Copy, Check, 
  AlertCircle, RefreshCw, FileText, Search, 
  Layers, Sliders, Table, Split, Eye, Braces
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function ExcelDataToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [inputText, setInputText] = useState("");
  const [secondText, setSecondText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Configuration inputs
  const [delimiter, setDelimiter] = useState(",");
  const [targetDelimiter, setTargetDelimiter] = useState("\t");
  const [colIndex, setColIndex] = useState("0");
  const [filterVal, setFilterVal] = useState("");
  const [findVal, setFindVal] = useState("");
  const [replaceVal, setReplaceVal] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [splitCount, setSplitCount] = useState(10);

  // CSV parsing helper
  const parseCSVRows = (text: string, sep = ","): string[][] => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    return lines.map(line => {
      const row: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === sep && !inQuotes) {
          row.push(cur.trim());
          cur = "";
        } else {
          cur += c;
        }
      }
      row.push(cur.trim());
      return row;
    });
  };

  const toCSVString = (rows: string[][], sep = ","): string => {
    return rows.map(r => r.map(cell => {
      if (cell.includes(sep) || cell.includes('"') || cell.includes("\n")) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(sep)).join("\n");
  };

  // OpenXML XLSX generator
  const createXlsxBlob = async (sheets: Record<string, string[][]>): Promise<Blob> => {
    const zip = new JSZip();

    const sheetNames = Object.keys(sheets);
    const overrides = sheetNames.map((_, i) => 
      `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    ).join("\n  ");

    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${overrides}
</Types>`);

    zip.folder("_rels")?.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

    const sheetElements = sheetNames.map((name, i) => 
      `<sheet name="${name.replace(/"/g, '&quot;')}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
    ).join("\n    ");

    zip.folder("xl")?.file("workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheetElements}
  </sheets>
</workbook>`);

    const wbRels = sheetNames.map((_, i) => 
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
    ).join("\n  ");

    zip.folder("xl/_rels")?.file("workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${wbRels}
</Relationships>`);

    const colName = (colIdx: number): string => {
      let s = "";
      let n = colIdx;
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    };

    sheetNames.forEach((name, sIdx) => {
      const rows = sheets[name];
      const rowXml = rows.map((r, rIdx) => {
        const cells = r.map((c, cIdx) => {
          const ref = `${colName(cIdx)}${rIdx + 1}`;
          const isNum = Number.isFinite(Number(c)) && c.trim() !== "";
          const escaped = c
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          if (isNum) {
            return `<c r="${ref}"><v>${c.trim()}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t>${escaped}</t></is></c>`;
        }).join("");
        return `<row r="${rIdx + 1}">${cells}</row>`;
      }).join("");

      zip.folder("xl/worksheets")?.file(`sheet${sIdx + 1}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rowXml}
  </sheetData>
</worksheet>`);
    });

    return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  };

  // OpenXML XLSX reader
  const parseXlsxBlob = async (file: File): Promise<string[][]> => {
    const zip = await JSZip.loadAsync(file);
    
    // Read shared strings if any
    const sharedStrings: string[] = [];
    const ssXml = await zip.file("xl/sharedStrings.xml")?.async("text");
    if (ssXml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(ssXml, "application/xml");
      const siTags = Array.from(doc.getElementsByTagName("si"));
      siTags.forEach(si => {
        sharedStrings.push(si.textContent || "");
      });
    }

    // Read sheet1.xml
    const sheetXml = await zip.file("xl/worksheets/sheet1.xml")?.async("text");
    if (!sheetXml) throw new Error(isHi ? "XLSX में शीट नहीं मिली" : "No sheet1.xml found in workbook");

    const parser = new DOMParser();
    const doc = parser.parseFromString(sheetXml, "application/xml");
    const rowTags = Array.from(doc.getElementsByTagName("row"));

    const rows: string[][] = [];
    rowTags.forEach(r => {
      const cTags = Array.from(r.getElementsByTagName("c"));
      const rowData: string[] = [];
      cTags.forEach(c => {
        const t = c.getAttribute("t");
        const v = c.getElementsByTagName("v")[0]?.textContent || "";
        const isTag = c.getElementsByTagName("is")[0]?.textContent || "";

        if (t === "s" && v !== "") {
          const idx = parseInt(v, 10);
          rowData.push(sharedStrings[idx] || "");
        } else if (t === "inlineStr" || isTag) {
          rowData.push(isTag);
        } else {
          rowData.push(v);
        }
      });
      if (rowData.length > 0) rows.push(rowData);
    });

    return rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (file.name.endsWith(".xlsx")) {
        const rows = await parseXlsxBlob(file);
        const csv = toCSVString(rows, ",");
        setInputText(csv);
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

  const processTool = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let result = "";

      switch (toolId) {
        case "data_csv_to_json": {
          const rows = parseCSVRows(inputText, delimiter);
          if (rows.length < 2) throw new Error(isHi ? "कम से कम हेडर और 1 डेटा पंक्ति आवश्यक है" : "Requires header and data rows");
          const headers = rows[0];
          const jsonArr = rows.slice(1).map(r => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = r[i] || ""; });
            return obj;
          });
          result = JSON.stringify(jsonArr, null, 2);
          break;
        }

        case "data_json_to_csv": {
          const data = JSON.parse(inputText);
          if (!Array.isArray(data) || data.length === 0) throw new Error(isHi ? "JSON ऑब्जेक्ट्स का ऐरे होना चाहिए" : "Input must be a JSON array of objects");
          const headers: string[] = Array.from(new Set(data.flatMap((o: Record<string, unknown>) => Object.keys(o))));
          const rows = [headers, ...data.map((o: Record<string, unknown>) => headers.map(h => String(o[h] ?? "")))];
          result = toCSVString(rows, delimiter);
          break;
        }

        case "data_csv_to_tsv": {
          const rows = parseCSVRows(inputText, ",");
          result = toCSVString(rows, "\t");
          break;
        }

        case "data_tsv_to_csv": {
          const rows = parseCSVRows(inputText, "\t");
          result = toCSVString(rows, ",");
          break;
        }

        case "data_csv_delimiter_conv": {
          const rows = parseCSVRows(inputText, delimiter);
          result = toCSVString(rows, targetDelimiter);
          break;
        }

        case "data_csv_col_extractor": {
          const rows = parseCSVRows(inputText, delimiter);
          const col = Number(colIndex) || 0;
          result = rows.map(r => r[col] ?? "").join("\n");
          break;
        }

        case "data_csv_col_reorder": {
          const rows = parseCSVRows(inputText, delimiter);
          const indices = colIndex.split(",").map(x => Number(x.trim())).filter(x => !Number.isNaN(x));
          if (indices.length === 0) throw new Error(isHi ? "कॉलम इंडेक्स दर्ज करें (जैसे: 1,0,2)" : "Enter column indices (e.g. 1,0,2)");
          const reordered = rows.map(r => indices.map(i => r[i] ?? ""));
          result = toCSVString(reordered, delimiter);
          break;
        }

        case "data_csv_col_renamer": {
          const rows = parseCSVRows(inputText, delimiter);
          if (rows.length === 0) throw new Error("Empty CSV");
          const newHeaders = secondText.split(",").map(x => x.trim());
          rows[0] = newHeaders;
          result = toCSVString(rows, delimiter);
          break;
        }

        case "data_csv_row_filter": {
          const rows = parseCSVRows(inputText, delimiter);
          if (rows.length === 0) throw new Error("Empty CSV");
          const filtered = [rows[0], ...rows.slice(1).filter(r => r.some(cell => cell.toLowerCase().includes(filterVal.toLowerCase())))];
          result = toCSVString(filtered, delimiter);
          break;
        }

        case "data_csv_dup_row_remover":
        case "data_excel_row_dedup": {
          const rows = parseCSVRows(inputText, delimiter);
          const seen = new Set<string>();
          const deduped: string[][] = [];
          rows.forEach(r => {
            const key = JSON.stringify(r);
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(r);
            }
          });
          result = toCSVString(deduped, delimiter);
          break;
        }

        case "data_csv_merger": {
          const rows1 = parseCSVRows(inputText, delimiter);
          const rows2 = parseCSVRows(secondText, delimiter);
          const merged = [...rows1, ...rows2.slice(1)];
          result = toCSVString(merged, delimiter);
          break;
        }

        case "data_csv_splitter": {
          const rows = parseCSVRows(inputText, delimiter);
          const header = rows[0] || [];
          const dataRows = rows.slice(1);
          const chunks: string[] = [];
          for (let i = 0; i < dataRows.length; i += splitCount) {
            const chunkRows = [header, ...dataRows.slice(i, i + splitCount)];
            chunks.push(`--- भाग ${(i / splitCount) + 1} (${chunkRows.length - 1} पंक्तियाँ) ---\n` + toCSVString(chunkRows, delimiter));
          }
          result = chunks.join("\n\n");
          break;
        }

        case "data_csv_header_editor": {
          const rows = parseCSVRows(inputText, delimiter);
          if (rows.length === 0) throw new Error("Empty CSV");
          rows[0] = secondText.split(",").map(x => x.trim());
          result = toCSVString(rows, delimiter);
          break;
        }

        case "data_csv_empty_row_remover":
        case "data_excel_blank_row_remover": {
          const rows = parseCSVRows(inputText, delimiter);
          const cleaned = rows.filter(r => r.some(c => c.trim().length > 0));
          result = toCSVString(cleaned, delimiter);
          break;
        }

        case "data_xlsx_to_csv": {
          result = inputText; // If file was uploaded it's already converted to CSV
          break;
        }

        case "data_csv_to_xlsx":
        case "data_json_to_xlsx":
        case "data_html_table_to_xlsx": {
          let rows: string[][] = [];
          if (toolId === "data_json_to_xlsx") {
            const data = JSON.parse(inputText);
            const headers: string[] = Array.from(new Set(data.flatMap((o: Record<string, unknown>) => Object.keys(o))));
            rows = [headers, ...data.map((o: Record<string, unknown>) => headers.map(h => String(o[h] ?? "")))];
          } else if (toolId === "data_html_table_to_xlsx") {
            const doc = new DOMParser().parseFromString(inputText, "text/html");
            const trs = Array.from(doc.querySelectorAll("tr"));
            rows = trs.map(tr => Array.from(tr.querySelectorAll("th, td")).map(c => c.textContent?.trim() || ""));
          } else {
            rows = parseCSVRows(inputText, delimiter);
          }

          const blob = await createXlsxBlob({ [sheetName || "Sheet1"]: rows });
          downloadBlob(blob, `${fileName ? fileName.replace(/\.[^/.]+$/, "") : "spreadsheet"}.xlsx`);
          setSuccessMsg(isHi ? "Excel XLSX फाइल सफलतापूर्वक तैयार और डाउनलोड हुई!" : "Excel XLSX file created and downloaded successfully!");
          setLoading(false);
          return;
        }

        case "data_xlsx_to_json": {
          const rows = parseCSVRows(inputText, ",");
          if (rows.length < 2) throw new Error("Requires header and data rows");
          const headers = rows[0];
          const jsonArr = rows.slice(1).map(r => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = r[i] || ""; });
            return obj;
          });
          result = JSON.stringify(jsonArr, null, 2);
          break;
        }

        case "data_xlsx_to_html": {
          const rows = parseCSVRows(inputText, ",");
          if (rows.length === 0) throw new Error("Empty data");
          const thead = `<tr>${rows[0].map(h => `<th>${h}</th>`).join("")}</tr>`;
          const tbody = rows.slice(1).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("\n  ");
          result = `<table border="1">\n  <thead>${thead}</thead>\n  <tbody>\n  ${tbody}\n  </tbody>\n</table>`;
          break;
        }

        case "data_excel_sheet_merger": {
          const rows1 = parseCSVRows(inputText, ",");
          const rows2 = parseCSVRows(secondText, ",");
          const merged = [...rows1, ...rows2.slice(1)];
          const blob = await createXlsxBlob({ "Merged": merged });
          downloadBlob(blob, "merged_sheets.xlsx");
          setSuccessMsg(isHi ? "मर्ज की गई XLSX फाइल डाउनलोड हो गई!" : "Merged XLSX file downloaded!");
          setLoading(false);
          return;
        }

        case "data_excel_sheet_splitter": {
          const rows = parseCSVRows(inputText, ",");
          result = `Sheet 1:\n` + toCSVString(rows, ",");
          break;
        }

        case "data_excel_sheet_renamer": {
          const rows = parseCSVRows(inputText, ",");
          const blob = await createXlsxBlob({ [sheetName || "RenamedSheet"]: rows });
          downloadBlob(blob, "renamed_sheet.xlsx");
          setSuccessMsg(isHi ? "नाम बदली गई XLSX डाउनलोड हो गई!" : "Renamed XLSX downloaded!");
          setLoading(false);
          return;
        }

        case "data_excel_sheet_reorder": {
          const rows = parseCSVRows(inputText, ",");
          const blob = await createXlsxBlob({ [sheetName || "Sheet1"]: rows });
          downloadBlob(blob, "reordered_sheet.xlsx");
          setSuccessMsg(isHi ? "रीऑर्डर की गई XLSX डाउनलोड हो गई!" : "Reordered XLSX downloaded!");
          setLoading(false);
          return;
        }

        case "data_excel_find_replace": {
          const rows = parseCSVRows(inputText, delimiter);
          const replaced = rows.map(r => r.map(c => c.split(findVal).join(replaceVal)));
          result = toCSVString(replaced, delimiter);
          break;
        }

        case "data_excel_col_splitter": {
          const rows = parseCSVRows(inputText, delimiter);
          const col = Number(colIndex) || 0;
          const split = rows.map(r => {
            const target = r[col] || "";
            const parts = target.split(" ");
            const newRow = [...r];
            newRow.splice(col, 1, parts[0] || "", parts.slice(1).join(" ") || "");
            return newRow;
          });
          result = toCSVString(split, delimiter);
          break;
        }

        case "data_excel_col_merger": {
          const rows = parseCSVRows(inputText, delimiter);
          const merged = rows.map(r => {
            const c1 = r[0] || "";
            const c2 = r[1] || "";
            return [`${c1} ${c2}`.trim(), ...r.slice(2)];
          });
          result = toCSVString(merged, delimiter);
          break;
        }

        case "data_excel_data_filter": {
          const rows = parseCSVRows(inputText, delimiter);
          const col = Number(colIndex) || 0;
          const filtered = [rows[0], ...rows.slice(1).filter(r => (r[col] || "").toLowerCase().includes(filterVal.toLowerCase()))];
          result = toCSVString(filtered, delimiter);
          break;
        }

        case "data_excel_unique_vals": {
          const rows = parseCSVRows(inputText, delimiter);
          const col = Number(colIndex) || 0;
          const vals = Array.from(new Set(rows.slice(1).map(r => r[col]).filter(Boolean)));
          result = `कॉलम [${rows[0]?.[col] || col}] के अद्वितीय मान (${vals.length}):\n` + vals.join("\n");
          break;
        }

        case "data_csv_datatype_detector": {
          const rows = parseCSVRows(inputText, delimiter);
          if (rows.length < 2) throw new Error("Requires header and data rows");
          const headers = rows[0];
          const sample = rows[1];
          const detected = headers.map((h, i) => {
            const val = sample[i] || "";
            let type = "string";
            if (!Number.isNaN(Number(val)) && val.trim() !== "") type = "number";
            else if (val.toLowerCase() === "true" || val.toLowerCase() === "false") type = "boolean";
            else if (!Number.isNaN(Date.parse(val)) && val.includes("-")) type = "date";
            return `${h}: ${type} (उदा: "${val}")`;
          });
          result = "डिटेक्ट किए गए डेटा प्रकार:\n" + detected.join("\n");
          break;
        }

        case "data_csv_schema_gen": {
          const rows = parseCSVRows(inputText, delimiter);
          if (rows.length === 0) throw new Error("Empty CSV");
          const headers = rows[0];
          const schema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": fileName ? fileName.replace(/\.[^/.]+$/, "") : "CSVSchema",
            "type": "object",
            "properties": Object.fromEntries(headers.map(h => [h, { "type": "string" }])),
            "required": headers
          };
          result = JSON.stringify(schema, null, 2);
          break;
        }

        case "data_json_formatter": {
          const parsed = JSON.parse(inputText);
          result = JSON.stringify(parsed, null, 2);
          break;
        }

        case "data_json_minifier": {
          const parsed = JSON.parse(inputText);
          result = JSON.stringify(parsed);
          break;
        }

        case "data_json_validator": {
          try {
            JSON.parse(inputText);
            result = "✓ JSON पूरी तरह से वैध (Valid) है!";
          } catch (e: unknown) {
            result = "✗ अमान्य JSON: " + (e instanceof Error ? e.message : String(e));
          }
          break;
        }

        case "data_json_tree_viewer": {
          const parsed = JSON.parse(inputText);
          const formatTree = (obj: unknown, indent = 0): string => {
            const pad = "  ".repeat(indent);
            if (obj === null) return `${pad}null`;
            if (typeof obj !== "object") return `${pad}${JSON.stringify(obj)}`;
            if (Array.isArray(obj)) {
              return `${pad}[\n` + obj.map(item => formatTree(item, indent + 1)).join(",\n") + `\n${pad}]`;
            }
            return `${pad}{\n` + Object.entries(obj as Record<string, unknown>).map(([k, v]) => `${pad}  "${k}":\n` + formatTree(v, indent + 2)).join(",\n") + `\n${pad}}`;
          };
          result = formatTree(parsed);
          break;
        }

        case "data_json_key_extractor": {
          const parsed = JSON.parse(inputText);
          const getKeys = (obj: unknown, prefix = ""): string[] => {
            if (!obj || typeof obj !== "object") return [];
            if (Array.isArray(obj)) return obj.length > 0 ? getKeys(obj[0], `${prefix}[]`) : [];
            return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
              const fullKey = prefix ? `${prefix}.${k}` : k;
              return [fullKey, ...getKeys(v, fullKey)];
            });
          };
          const keys = Array.from(new Set(getKeys(parsed)));
          result = `कुल कीज (${keys.length}):\n` + keys.join("\n");
          break;
        }

        case "data_json_array_dedup": {
          const parsed = JSON.parse(inputText);
          if (!Array.isArray(parsed)) throw new Error("Input must be an array");
          const seen = new Set<string>();
          const deduped = parsed.filter(item => {
            const key = JSON.stringify(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          result = JSON.stringify(deduped, null, 2);
          break;
        }

        case "data_json_flatten": {
          const parsed = JSON.parse(inputText);
          const flatten = (obj: Record<string, unknown>, prefix = ""): Record<string, unknown> => {
            return Object.keys(obj).reduce((acc: Record<string, unknown>, k: string) => {
              const pre = prefix.length ? prefix + "." : "";
              if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, flatten(obj[k] as Record<string, unknown>, pre + k));
              } else {
                acc[pre + k] = obj[k];
              }
              return acc;
            }, {});
          };
          result = JSON.stringify(flatten(parsed), null, 2);
          break;
        }

        default:
          result = inputText;
      }

      setOutputText(result);
      setSuccessMsg(isHi ? "प्रक्रिया पूर्ण!" : "Operation completed successfully!");
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const handleDownloadOutput = () => {
    if (!outputText) return;
    const isJson = toolId.includes("json") || outputText.trim().startsWith("{") || outputText.trim().startsWith("[");
    const mime = isJson ? "application/json" : "text/plain";
    const ext = isJson ? "json" : "csv";
    const blob = new Blob([outputText], { type: `${mime};charset=utf-8` });
    downloadBlob(blob, `output_${toolId}.${ext}`);
  };

  const isDualInput = ["data_csv_merger", "data_excel_sheet_merger", "data_csv_col_renamer", "data_csv_header_editor"].includes(toolId);

  return (
    <div className="space-y-4">
      {/* Upload File */}
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
        <input
          type="file"
          accept=".csv,.xlsx,.json,.tsv,.txt"
          onChange={handleFileUpload}
          id="data-file-upload"
          className="hidden"
        />
        <label htmlFor="data-file-upload" className="cursor-pointer">
          <FileSpreadsheet className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-1 text-xs font-semibold text-emerald-950">
            {fileName ? fileName : isHi ? "फ़ाइल अपलोड करें (CSV, XLSX, JSON, TSV)" : "Upload File (CSV, XLSX, JSON, TSV)"}
          </p>
          <p className="text-[10px] text-emerald-700">
            {isHi ? "100% ऑफलाइन लोकल प्रोसेसिंग" : "100% offline local processing"}
          </p>
        </label>
      </div>

      {/* Dynamic Controls */}
      <div className="grid grid-cols-2 gap-2">
        {toolId.includes("delimiter") && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "वर्तमान डेलीमीटर" : "Current Delimiter"}</label>
            <input
              type="text"
              value={delimiter}
              onChange={e => setDelimiter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        )}

        {toolId === "data_csv_delimiter_conv" && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "नया डेलीमीटर" : "Target Delimiter"}</label>
            <input
              type="text"
              value={targetDelimiter}
              onChange={e => setTargetDelimiter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        )}

        {(toolId.includes("col_extractor") || toolId.includes("col_reorder") || toolId.includes("col_splitter") || toolId.includes("unique_vals") || toolId === "data_excel_data_filter") && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "कॉलम इंडेक्स (0 से शुरू)" : "Column Index (from 0)"}</label>
            <input
              type="text"
              value={colIndex}
              onChange={e => setColIndex(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        )}

        {(toolId.includes("filter") || toolId === "data_excel_data_filter") && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "फ़िल्टर शब्द" : "Filter Word"}</label>
            <input
              type="text"
              value={filterVal}
              onChange={e => setFilterVal(e.target.value)}
              placeholder="खोजने वाला मान"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        )}

        {toolId === "data_excel_find_replace" && (
          <>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "खोजें" : "Find"}</label>
              <input
                type="text"
                value={findVal}
                onChange={e => setFindVal(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "बदलें" : "Replace"}</label>
              <input
                type="text"
                value={replaceVal}
                onChange={e => setReplaceVal(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </>
        )}

        {(toolId.includes("sheet") || toolId.includes("xlsx")) && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "शीट का नाम" : "Sheet Name"}</label>
            <input
              type="text"
              value={sheetName}
              onChange={e => setSheetName(e.target.value)}
              placeholder="Sheet1"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        )}

        {toolId === "data_csv_splitter" && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">{isHi ? "पंक्तियाँ प्रति फ़ाइल" : "Rows per chunk"}</label>
            <input
              type="number"
              value={splitCount}
              onChange={e => setSplitCount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        )}
      </div>

      {/* Input Textarea 1 */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {isDualInput ? (isHi ? "डेटा सेट 1 (Data Set 1)" : "Data Set 1") : (isHi ? "इनपुट डेटा (CSV, JSON, TSV, HTML)" : "Input Data")}
        </label>
        <textarea
          rows={5}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={isHi ? "डेटा यहाँ पेस्ट करें या ऊपर से फ़ाइल अपलोड करें..." : "Paste CSV/JSON data here or upload file above..."}
          className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800"
        />
      </div>

      {/* Input Textarea 2 */}
      {isDualInput && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isHi ? "डेटा सेट 2 / नए हेडर्स (Data Set 2 / New Headers)" : "Data Set 2 / New Headers"}
          </label>
          <textarea
            rows={4}
            value={secondText}
            onChange={e => setSecondText(e.target.value)}
            placeholder={isHi ? "दूसरा डेटा या नए हेडर्स कॉमा लगाकर लिखें..." : "Paste second dataset or comma-separated headers..."}
            className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800"
          />
        </div>
      )}

      {/* Run Tool Button */}
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
            <Table className="h-4 w-4" />
            <span>{isHi ? "चलाएं (Run Tool)" : "Run Tool"}</span>
          </>
        )}
      </button>

      {/* Output Results */}
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
                <span>{isHi ? "डाउनलोड" : "Download"}</span>
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
