import React, { useState, useEffect, useCallback } from "react";
import { 
  FileSpreadsheet, Download, Plus, Trash2, Copy, Check, 
  AlertCircle, RefreshCw, Hash, Table, LayoutTemplate, Calculator
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

interface SheetTemplate {
  id: string;
  nameEn: string;
  nameHi: string;
  headers: string[];
  data: string[][];
}

const DEFAULT_COLS = ["A", "B", "C", "D", "E", "F"];
const INITIAL_ROW_COUNT = 15;

const TEMPLATES: SheetTemplate[] = [
  {
    id: "budget",
    nameEn: "Monthly Expense & Budget",
    nameHi: "मासिक खर्च व बजट बहीखाता",
    headers: ["दिनांक", "विवरण (Item)", "मद (Category)", "माध्यम", "राशि (₹)", "टिप्पणी"],
    data: [
      ["01/10/2026", "किराना व राशन", "घर खर्च", "UPI", "3500", "मासिक किराना"],
      ["03/10/2026", "बिजली बिल", "उपयोगिता", "NetBanking", "1450", "अक्टूबर बिल"],
      ["05/10/2026", "दवाइयां व क्लिनिक", "स्वास्थ्य", "नकद", "850", "दवाइयां"],
      ["08/10/2026", "पेट्रोल व वाहन", "ईंधन", "UPI", "1200", "बाइक"],
      ["10/10/2026", "मोबाइल व वाईफाई", "उपयोगिता", "UPI", "799", "रिचार्ज"],
      ["कुल योग", "", "", "", "=SUM(E1:E5)", ""],
    ],
  },
  {
    id: "donation",
    nameEn: "Samiti Donation / Chanda",
    nameHi: "चंदा व दान प्राप्ति रजिस्टर",
    headers: ["क्र.सं.", "दानदाता का नाम", "मोबाइल नंबर", "गाँव / वार्ड", "राशि (₹)", "रसीद नं."],
    data: [
      ["1", "रमेश कुमार तिवारी", "9876543210", "वार्ड नं. 4", "2100", "REC-101"],
      ["2", "दिनेश प्रसाद वर्मा", "9812345678", "मेन रोड", "1100", "REC-102"],
      ["3", "श्रीमती सुनीता देवी", "9834567890", "पुराना बाजार", "5100", "REC-103"],
      ["4", "राजेश सिंह", "9765432109", "वार्ड नं. 2", "1500", "REC-104"],
      ["कुल दान राशि", "", "", "", "=SUM(E1:E4)", ""],
    ],
  },
  {
    id: "attendance",
    nameEn: "Duty & Attendance Ledger",
    nameHi: "उपस्थिति व मानदेय रजिस्टर",
    headers: ["क्र.सं.", "कार्यकर्ता का नाम", "पद / भूमिका", "उपस्थित दिन", "दैनिक दर (₹)", "कुल मानदेय (₹)"],
    data: [
      ["1", "विकास यादव", "फील्ड सुपरवाइजर", "26", "600", "=D1*E1"],
      ["2", "अमित शर्मा", "सहायक", "24", "450", "=D2*E2"],
      ["3", "पूजा पटेल", "कंप्यूटर ऑपरेटर", "25", "500", "=D3*E3"],
      ["4", "संतोष कुमार", "सुरक्षा गार्ड", "28", "400", "=D4*E4"],
      ["कुल बजट", "", "", "", "", "=SUM(F1:F4)"],
    ],
  },
];

export default function ExcelStudioEditorEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [docTitle, setDocTitle] = useState("RPF_Spreadsheet");
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLS);
  const [rows, setRows] = useState<number>(INITIAL_ROW_COUNT);
  const [gridData, setGridData] = useState<string[][]>(() => {
    return Array.from({ length: INITIAL_ROW_COUNT }, () => Array(DEFAULT_COLS.length).fill(""));
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [formulaInput, setFormulaInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dedicated formula calculator expression state
  const [calcExpr, setCalcExpr] = useState("SUM(1250, 450, 3200, 890)");
  const [calcResult, setCalcResult] = useState<string>("5790");

  const evaluateCell = useCallback((raw: string): string => {
    if (!raw) return "";
    if (!raw.startsWith("=")) return raw;

    const formula = raw.substring(1).toUpperCase().trim();

    // 1. SUM function: e.g. SUM(A1:A5) or SUM(E1:E4)
    const sumMatch = formula.match(/^SUM\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (sumMatch) {
      const startColChar = sumMatch[1];
      const startRowIdx = parseInt(sumMatch[2], 10) - 1;
      const endColChar = sumMatch[3];
      const endRowIdx = parseInt(sumMatch[4], 10) - 1;

      const startColIdx = columns.indexOf(startColChar);
      const endColIdx = columns.indexOf(endColChar);
      if (startColIdx === -1 || endColIdx === -1) return "#REF!";

      let total = 0;
      for (let r = Math.min(startRowIdx, endRowIdx); r <= Math.max(startRowIdx, endRowIdx); r++) {
        for (let c = Math.min(startColIdx, endColIdx); c <= Math.max(startColIdx, endColIdx); c++) {
          const val = parseFloat(gridData[r]?.[c] || "0");
          if (!isNaN(val)) total += val;
        }
      }
      return total.toString();
    }

    // 2. AVERAGE function: e.g. AVERAGE(A1:A5)
    const avgMatch = formula.match(/^AVERAGE\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (avgMatch) {
      const startColChar = avgMatch[1];
      const startRowIdx = parseInt(avgMatch[2], 10) - 1;
      const endColChar = avgMatch[3];
      const endRowIdx = parseInt(avgMatch[4], 10) - 1;

      const startColIdx = columns.indexOf(startColChar);
      const endColIdx = columns.indexOf(endColChar);
      if (startColIdx === -1 || endColIdx === -1) return "#REF!";

      let total = 0;
      let count = 0;
      for (let r = Math.min(startRowIdx, endRowIdx); r <= Math.max(startRowIdx, endRowIdx); r++) {
        for (let c = Math.min(startColIdx, endColIdx); c <= Math.max(startColIdx, endColIdx); c++) {
          const val = parseFloat(gridData[r]?.[c] || "");
          if (!isNaN(val)) {
            total += val;
            count++;
          }
        }
      }
      return count > 0 ? (total / count).toFixed(2) : "0";
    }

    // 3. Simple two-cell arithmetic: e.g. D1*E1, A1+B1
    const mathMatch = formula.match(/^([A-Z])(\d+)([\+\-\*\/])([A-Z])(\d+)$/);
    if (mathMatch) {
      const c1 = columns.indexOf(mathMatch[1]);
      const r1 = parseInt(mathMatch[2], 10) - 1;
      const op = mathMatch[3];
      const c2 = columns.indexOf(mathMatch[4]);
      const r2 = parseInt(mathMatch[5], 10) - 1;

      if (c1 === -1 || c2 === -1) return "#REF!";

      const v1 = parseFloat(gridData[r1]?.[c1] || "0");
      const v2 = parseFloat(gridData[r2]?.[c2] || "0");
      if (isNaN(v1) || isNaN(v2)) return "0";

      if (op === "+") return (v1 + v2).toString();
      if (op === "-") return (v1 - v2).toString();
      if (op === "*") return (v1 * v2).toString();
      if (op === "/") return v2 !== 0 ? (v1 / v2).toFixed(2) : "#DIV/0!";
    }

    return raw;
  }, [columns, gridData]);

  // Load starter templates
  const loadTemplate = (tpl: SheetTemplate) => {
    setDocTitle(tpl.id.toUpperCase() + "_Register");
    const neededCols = Math.max(DEFAULT_COLS.length, tpl.headers.length);
    const cols = Array.from({ length: neededCols }, (_, i) => String.fromCharCode(65 + i));
    setColumns(cols);

    const totalRows = Math.max(INITIAL_ROW_COUNT, tpl.data.length + 3);
    const newGrid = Array.from({ length: totalRows }, () => Array(cols.length).fill(""));

    tpl.headers.forEach((h, cIdx) => {
      newGrid[0][cIdx] = h;
    });

    tpl.data.forEach((rowVals, rIdx) => {
      rowVals.forEach((val, cIdx) => {
        newGrid[rIdx + 1][cIdx] = val;
      });
    });

    setRows(totalRows);
    setGridData(newGrid);
    setSelectedCell({ row: 1, col: 0 });
    setFormulaInput(newGrid[1]?.[0] || "");
  };

  useEffect(() => {
    if (toolId === "excel_budget_sheet") {
      loadTemplate(TEMPLATES[0]);
    } else if (toolId === "excel_formula_calc") {
      loadTemplate(TEMPLATES[0]);
    }
  }, [toolId]);

  useEffect(() => {
    const raw = gridData[selectedCell.row]?.[selectedCell.col] || "";
    setFormulaInput(raw);
  }, [selectedCell, gridData]);

  const handleCellChange = (row: number, col: number, value: string) => {
    setGridData(prev => {
      const next = prev.map(r => [...r]);
      if (!next[row]) next[row] = Array(columns.length).fill("");
      next[row][col] = value;
      return next;
    });
  };

  const handleFormulaCommit = (val: string) => {
    setFormulaInput(val);
    handleCellChange(selectedCell.row, selectedCell.col, val);
  };

  const addColumn = () => {
    if (columns.length >= 12) return;
    const nextChar = String.fromCharCode(65 + columns.length);
    setColumns(prev => [...prev, nextChar]);
    setGridData(prev => prev.map(r => [...r, ""]));
  };

  const addRow = () => {
    if (rows >= 50) return;
    setRows(r => r + 1);
    setGridData(prev => [...prev, Array(columns.length).fill("")]);
  };

  const deleteActiveRow = () => {
    if (rows <= 2) return;
    setGridData(prev => prev.filter((_, idx) => idx !== selectedCell.row));
    setRows(r => r - 1);
    setSelectedCell(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
  };

  const exportCsv = () => {
    setLoading(true);
    try {
      const csvContent = gridData
        .map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
      const filename = `${docTitle.trim() || "RPF_Sheet"}.csv`;
      downloadBlob(blob, filename);
      setSuccessMsg(isHi ? `CSV डाउनलोड हुआ: ${filename}` : `CSV downloaded: ${filename}`);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const exportXlsx = () => {
    setLoading(true);
    try {
      let rowsXml = "";
      gridData.forEach((row) => {
        let cellsXml = "";
        row.forEach((cell) => {
          const evalVal = evaluateCell(cell);
          const isNum = !isNaN(parseFloat(evalVal)) && isFinite(Number(evalVal));
          cellsXml += `
            <Cell>
              <Data ss:Type="${isNum ? "Number" : "String"}">${(evalVal || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data>
            </Cell>
          `;
        });
        rowsXml += `<Row>${cellsXml}</Row>`;
      });

      const excelXml = `<?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
          <Worksheet ss:Name="Sheet1">
            <Table>
              ${rowsXml}
            </Table>
          </Worksheet>
        </Workbook>
      `;

      const blob = new Blob([excelXml], { type: "application/vnd.ms-excel" });
      const filename = `${docTitle.trim() || "RPF_Excel"}.xls`;
      downloadBlob(blob, filename);
      setSuccessMsg(isHi ? `Excel (.xls) फ़ाइल डाउनलोड हुई: ${filename}` : `Excel file downloaded: ${filename}`);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const evaluateCalculatorExpr = (expr: string) => {
    setCalcExpr(expr);
    try {
      const clean = expr.trim().toUpperCase();
      if (clean.startsWith("SUM(") && clean.endsWith(")")) {
        const inner = clean.slice(4, -1);
        const parts = inner.split(",").map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
        const sum = parts.reduce((a, b) => a + b, 0);
        setCalcResult(sum.toString());
      } else if (clean.startsWith("AVERAGE(") && clean.endsWith(")")) {
        const inner = clean.slice(8, -1);
        const parts = inner.split(",").map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
        const avg = parts.length ? (parts.reduce((a, b) => a + b, 0) / parts.length).toFixed(2) : "0";
        setCalcResult(avg);
      } else {
        // Safe basic arithmetic evaluator
        const sanitized = clean.replace(/[^0-9\+\-\*\/\.\(\)]/g, "");
        if (sanitized) {
          // eslint-disable-next-line no-new-func
          const res = Function(`'use strict'; return (${sanitized})`)();
          setCalcResult(Number(res).toFixed(2).replace(/\.00$/, ""));
        }
      }
    } catch {
      setCalcResult("#ERROR");
    }
  };

  return (
    <div className="space-y-3">
      {/* Title & Register Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs font-bold text-slate-500">{isHi ? "शीट का नाम:" : "Sheet Name:"}</span>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => loadTemplate(tpl)}
              className="rounded-xl border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 shadow-2xs"
            >
              {isHi ? tpl.nameHi : tpl.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Mode Panel */}
      {toolId === "excel_formula_calc" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
            <Calculator className="h-4 w-4 text-indigo-600" />
            <span>{isHi ? "त्वरित फॉर्मूला कैलकुलेटर" : "Instant Formula Evaluator"}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={calcExpr}
              onChange={(e) => evaluateCalculatorExpr(e.target.value)}
              placeholder="e.g. SUM(100, 250, 450) or 500 * 18 / 100"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
            />
            <div className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-mono font-black text-white flex items-center justify-center min-w-[80px]">
              = {calcResult}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
            <span className="font-bold">{isHi ? "उदाहरण:" : "Presets:"}</span>
            <button type="button" onClick={() => evaluateCalculatorExpr("SUM(1500, 2400, 890)")} className="underline hover:text-indigo-700">SUM(1500, 2400, 890)</button>
            <button type="button" onClick={() => evaluateCalculatorExpr("AVERAGE(78, 85, 92, 88)")} className="underline hover:text-indigo-700">AVERAGE(78, 85, 92, 88)</button>
            <button type="button" onClick={() => evaluateCalculatorExpr("45000 * 0.18")} className="underline hover:text-indigo-700">45000 * 0.18 (GST)</button>
          </div>
        </div>
      )}

      {/* Formula Bar */}
      <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-2 shadow-2xs">
        <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-emerald-100 font-mono text-xs font-bold text-emerald-900 shrink-0">
          {columns[selectedCell.col]}{selectedCell.row + 1}
        </span>
        <span className="font-mono text-xs font-bold text-slate-400">ƒx</span>
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => handleFormulaCommit(e.target.value)}
          placeholder="=SUM(A1:A5) or text / numbers"
          className="flex-1 bg-transparent text-xs font-mono font-semibold text-slate-800 outline-none"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={addRow}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
          >
            + {isHi ? "पंक्ति" : "Row"}
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
          >
            + {isHi ? "कॉलम" : "Col"}
          </button>
          <button
            type="button"
            onClick={deleteActiveRow}
            className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Matrix Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white max-h-[380px] shadow-inner">
        <table className="w-full border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10">
              <th className="w-10 border-b border-r border-slate-200 py-1.5 px-2 text-center">#</th>
              {columns.map((c) => (
                <th key={c} className="border-b border-r border-slate-200 py-1.5 px-3 min-w-[110px] text-center font-mono">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                <td className="border-b border-r border-slate-200 py-1 px-2 text-center font-mono font-bold text-slate-400 bg-slate-50">
                  {rIdx + 1}
                </td>
                {columns.map((_, cIdx) => {
                  const raw = gridData[rIdx]?.[cIdx] || "";
                  const evalVal = evaluateCell(raw);
                  const isSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
                  const isHeader = rIdx === 0;

                  return (
                    <td
                      key={cIdx}
                      onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                      className={`border-b border-r border-slate-200 p-0 relative ${
                        isSelected ? "ring-2 ring-emerald-500 z-10" : ""
                      } ${isHeader ? "bg-slate-50/80 font-bold text-slate-900" : ""}`}
                    >
                      <input
                        type="text"
                        value={isSelected ? raw : evalVal}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        className={`w-full h-full py-1.5 px-2 bg-transparent text-xs outline-none ${
                          isHeader ? "font-bold text-slate-900 text-center" : "text-slate-800"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportXlsx}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{isHi ? "Excel (.xls) डाउनलोड करें" : "Download Excel (.xls)"}</span>
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            const csv = gridData.map(r => r.join("\t")).join("\n");
            copyToClipboard(csv);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>{isHi ? "डेटा कॉपी करें" : "Copy Data"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
