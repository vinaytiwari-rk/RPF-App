import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Download, FileSpreadsheet, Plus, Trash2, Printer,
  Copy, RefreshCw, LayoutTemplate, Bold, Italic, AlignLeft,
  AlignCenter, AlignRight, IndianRupee, Percent, Hash, Upload,
  ChevronRight, Sparkles, Check, Table, Undo, Redo, Search
} from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import toast from "react-hot-toast";

interface NativeDownloadsPlugin {
  saveToDownloads(options: { filename: string; mimeType: string; data: string }): Promise<{ uri: string; filename: string }>;
}
const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  color?: string;
  bgColor?: string;
  format?: "text" | "currency" | "percent" | "number";
}

interface SheetTemplate {
  id: string;
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  headers: string[];
  data: string[][];
}

const DEFAULT_COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const INITIAL_ROW_COUNT = 25;

const SHEET_TEMPLATES: SheetTemplate[] = [
  {
    id: "budget",
    nameEn: "Monthly Expense & Budget",
    nameHi: "मासिक खर्च व बजट बहीखाता",
    descEn: "Track household or office expenses with category and auto sum",
    descHi: "दैनिक खर्च, मद (Category), भुगतान माध्यम और कुल योग की गणना",
    headers: ["दिनांक", "विवरण (Item)", "श्रेणी (Category)", "माध्यम (Mode)", "राशि (₹)", "टिप्पणी"],
    data: [
      ["01/10/2026", "किराना व राशन", "घर खर्च", "UPI", "3500", "मासिक किराना"],
      ["03/10/2026", "बिजली बिल", "उपयोगिता", "NetBanking", "1450", "अक्टूबर बिल"],
      ["05/10/2026", "दवाइयां व स्वास्थ्य", "स्वास्थ्य", "नकद", "850", "क्लिनिक"],
      ["08/10/2026", "पेट्रोल व ईंधन", "यात्रा", "UPI", "1200", "बाइक/कार"],
      ["10/10/2026", "मोबाइल व वाईफाई", "उपयोगिता", "UPI", "799", "रिचार्ज"],
      ["कुल योग", "", "", "", "=SUM(E1:E5)", ""],
    ],
  },
  {
    id: "donation",
    nameEn: "Samiti Donation & Chanda Register",
    nameHi: "चंदा व दान प्राप्ति रजिस्टर",
    descEn: "Village or trust donation collection record with receipt numbers",
    descHi: "ग्राम समिति या ट्रस्ट हेतु दानदाताओं का नाम, मोबाइल व रसीद संख्या",
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
    descEn: "Staff and volunteer attendance with daily rate and payout calculation",
    descHi: "कार्यकर्ताओं की कुल उपस्थिति, दैनिक दर और कुल देय मानदेय",
    headers: ["क्र.सं.", "कार्यकर्ता का नाम", "पद / भूमिका", "उपस्थित दिन", "दैनिक दर (₹)", "कुल मानदेय (₹)"],
    data: [
      ["1", "विकास यादव", "फील्ड सुपरवाइजर", "26", "600", "=D1*E1"],
      ["2", "अमित शर्मा", "सहायक", "24", "450", "=D2*E2"],
      ["3", "पूजा पटेल", "कंप्यूटर ऑपरेटर", "25", "500", "=D3*E3"],
      ["4", "संतोष कुमार", "सुरक्षा गार्ड", "28", "400", "=D4*E4"],
      ["कुल बजट", "", "", "", "", "=SUM(F1:F4)"],
    ],
  },
  {
    id: "marksheet",
    nameEn: "Student Marks & Grade Sheet",
    nameHi: "छात्र अंकतालिका व परीक्षा परिणाम",
    descEn: "Class test scores, total calculation and percentage",
    descHi: "हिंदी, अंग्रेजी, गणित, विज्ञान के अंक, कुल प्राप्तांक व प्रतिशत",
    headers: ["रोल नं.", "छात्र का नाम", "हिंदी (100)", "अंग्रेजी (100)", "गणित (100)", "विज्ञान (100)", "कुल (400)"],
    data: [
      ["101", "राहुल कुमार", "78", "82", "94", "88", "=SUM(C1:F1)"],
      ["102", "अंजली कुमारी", "85", "89", "76", "92", "=SUM(C2:F2)"],
      ["103", "मोहित सिंह", "65", "70", "84", "78", "=SUM(C3:F3)"],
      ["104", "प्रिया मिश्रा", "92", "95", "98", "94", "=SUM(C4:F4)"],
    ],
  },
];

export default function SheetEditorPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ lang?: "en" | "hi" }>() || {};
  const isHi = context.lang === "hi";

  // Document Title
  const [docTitle, setDocTitle] = useState<string>("RPF_Sheet_2026");

  // Grid Dimensions & Headers
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLS);
  const [rows, setRows] = useState<number>(INITIAL_ROW_COUNT);

  // Cell Data: matrix of raw values [rowIndex][colIndex]
  const [gridData, setGridData] = useState<string[][]>(() => {
    return Array.from({ length: INITIAL_ROW_COUNT }, () => Array(DEFAULT_COLS.length).fill(""));
  });

  // Cell Styles: key `${row}:${col}` -> CellStyle
  const [cellStyles, setCellStyles] = useState<Record<string, CellStyle>>({});

  // Active Selected Cell
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [formulaInput, setFormulaInput] = useState<string>("");

  // Modals & UI States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Load Budget template by default on mount
  useEffect(() => {
    loadTemplate(SHEET_TEMPLATES[0]);
  }, []);

  // Sync formula bar when active cell changes
  useEffect(() => {
    const raw = gridData[selectedCell.row]?.[selectedCell.col] || "";
    setFormulaInput(raw);
  }, [selectedCell, gridData]);

  // Parse and evaluate cell formula or value
  const evaluateCell = useCallback((raw: string, curRow: number, curCol: number): string => {
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

    // 3. Simple two-cell arithmetic: e.g. D1*E1, A1+B1, A1-B1, A1/B1
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

  // Update Cell Value
  const handleCellChange = (row: number, col: number, value: string) => {
    setGridData(prev => {
      const next = prev.map(r => [...r]);
      if (!next[row]) next[row] = Array(columns.length).fill("");
      next[row][col] = value;
      return next;
    });
  };

  // Apply Formula Input change
  const handleFormulaCommit = (val: string) => {
    setFormulaInput(val);
    handleCellChange(selectedCell.row, selectedCell.col, val);
  };

  // Apply Cell Style
  const updateActiveCellStyle = (updates: Partial<CellStyle>) => {
    const key = `${selectedCell.row}:${selectedCell.col}`;
    setCellStyles(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...updates },
    }));
  };

  // Add Column
  const addColumn = () => {
    const nextChar = String.fromCharCode(65 + columns.length);
    if (columns.length >= 26) {
      toast.error(isHi ? "अधिकतम 26 कॉलम समर्थित हैं" : "Maximum 26 columns supported");
      return;
    }
    setColumns(prev => [...prev, nextChar]);
    setGridData(prev => prev.map(r => [...r, ""]));
    toast.success(isHi ? `कॉलम ${nextChar} जोड़ा गया` : `Column ${nextChar} added`);
  };

  // Add Row
  const addRow = () => {
    setRows(r => r + 1);
    setGridData(prev => [...prev, Array(columns.length).fill("")]);
    toast.success(isHi ? `पंक्ति ${rows + 1} जोड़ी गई` : `Row ${rows + 1} added`);
  };

  // Delete Row
  const deleteActiveRow = () => {
    if (rows <= 2) return;
    setGridData(prev => prev.filter((_, idx) => idx !== selectedCell.row));
    setRows(r => r - 1);
    setSelectedCell(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
    toast.success(isHi ? "पंक्ति हटाई गई" : "Row deleted");
  };

  // Load Pre-made Template
  const loadTemplate = (tpl: SheetTemplate) => {
    setDocTitle(tpl.id.toUpperCase() + "_Register");

    // Ensure enough columns
    const neededCols = Math.max(DEFAULT_COLS.length, tpl.headers.length);
    const cols = Array.from({ length: neededCols }, (_, i) => String.fromCharCode(65 + i));
    setColumns(cols);

    // Prepare grid
    const totalRows = Math.max(INITIAL_ROW_COUNT, tpl.data.length + 3);
    const newGrid = Array.from({ length: totalRows }, () => Array(cols.length).fill(""));

    // Set headers at Row 0
    tpl.headers.forEach((h, cIdx) => {
      newGrid[0][cIdx] = h;
    });

    // Set data
    tpl.data.forEach((rowVals, rIdx) => {
      rowVals.forEach((val, cIdx) => {
        newGrid[rIdx + 1][cIdx] = val;
      });
    });

    setRows(totalRows);
    setGridData(newGrid);

    // Apply header bold styling
    const newStyles: Record<string, CellStyle> = {};
    for (let c = 0; c < tpl.headers.length; c++) {
      newStyles[`0:${c}`] = { bold: true, bgColor: "#E2E8F0", align: "center" };
    }
    setCellStyles(newStyles);

    setSelectedCell({ row: 1, col: 0 });
    setIsTemplateModalOpen(false);
    toast.success(isHi ? `प्रारूप लागू: ${tpl.nameHi}` : `Template loaded: ${tpl.nameEn}`);
  };

  // Export to CSV
  const exportCsv = () => {
    setLoading(true);
    try {
      const csvContent = gridData
        .map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
      const filename = `${docTitle.trim() || "RPF_Sheet"}_${Date.now()}.csv`;

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "text/csv",
            data: dataUrl,
          });
          toast.success(isHi ? `CSV Downloads में सेव हुआ: ${filename}` : `CSV saved to Downloads: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `CSV डाउनलोड हुआ: ${filename}` : `CSV downloaded: ${filename}`);
      }
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error(isHi ? "CSV एक्सपोर्ट विफल" : "Failed to export CSV");
    }
  };

  // Export to Excel .XLSX (XML Spreadsheet 2003 / Office XML standard)
  const exportXlsx = () => {
    setLoading(true);
    try {
      let rowsXml = "";
      gridData.forEach((row) => {
        let cellsXml = "";
        row.forEach((cell, colIdx) => {
          const evalVal = evaluateCell(cell, 0, colIdx);
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
      const filename = `${docTitle.trim() || "RPF_Excel"}_${Date.now()}.xls`;

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "application/vnd.ms-excel",
            data: dataUrl,
          });
          toast.success(isHi ? `Excel Downloads में सेव हुआ: ${filename}` : `Excel saved to Downloads: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `Excel डाउनलोड हुआ: ${filename}` : `Excel downloaded: ${filename}`);
      }
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error(isHi ? "Excel एक्सपोर्ट विफल" : "Failed to export Excel");
    }
  };

  // Import CSV File from Device
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      const parsedGrid = lines.map(line => {
        // Simple comma split handling quotes
        const row: string[] = [];
        let insideQuote = false;
        let currentCell = "";
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === "," && !insideQuote) {
            row.push(currentCell.trim());
            currentCell = "";
          } else {
            currentCell += char;
          }
        }
        row.push(currentCell.trim());
        return row;
      });

      if (parsedGrid.length > 0) {
        const maxCols = Math.max(...parsedGrid.map(r => r.length), DEFAULT_COLS.length);
        const cols = Array.from({ length: maxCols }, (_, i) => String.fromCharCode(65 + i));
        setColumns(cols);
        setRows(Math.max(INITIAL_ROW_COUNT, parsedGrid.length + 5));

        const filledGrid = parsedGrid.map(r => {
          const diff = cols.length - r.length;
          return diff > 0 ? [...r, ...Array(diff).fill("")] : r;
        });

        while (filledGrid.length < INITIAL_ROW_COUNT) {
          filledGrid.push(Array(cols.length).fill(""));
        }

        setGridData(filledGrid);
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
        toast.success(isHi ? `CSV फ़ाइल लोड हुई: ${file.name}` : `CSV loaded: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const activeStyle = cellStyles[`${selectedCell.row}:${selectedCell.col}`] || {};
  const activeCoord = `${columns[selectedCell.col] || "A"}${selectedCell.row + 1}`;

  return (
    <div className="flex h-screen w-screen flex-col bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans select-none fixed inset-0 z-50">
      {/* 1. TOP PREMIUM HEADER BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs text-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/utilities")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition"
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
                className="text-sm font-black tracking-tight text-slate-900 bg-transparent border-b border-transparent hover:border-[#245D45] focus:border-[#245D45] focus:outline-none max-w-[200px] sm:max-w-[280px]"
                title="Click to rename sheet"
              />
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#245D45] border border-emerald-200">
                Spreadsheet & Formula Editor (XLSX)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {rows} {isHi ? "पंक्तियां" : "rows"} × {columns.length} {isHi ? "कॉलम" : "cols"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Templates Selector */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-[#245D45]" />
            <span>{isHi ? "रेडीमेड बहीखाता" : "Templates"}</span>
          </button>

          {/* Import CSV */}
          <label className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer transition" title="Import CSV">
            <Upload className="h-4 w-4" />
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading}
            className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <span>.CSV</span>
          </button>

          {/* Save Excel .XLSX */}
          <button
            type="button"
            onClick={exportXlsx}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-black text-white shadow-xs hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{isHi ? "Excel सेव करें" : "Save Excel"}</span>
          </button>
        </div>
      </header>

      {/* 2. EXCEL RIBBON & FORMULA BAR */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        {/* Formatting Toolbar */}
        <div className="flex h-11 items-center gap-1 px-3 border-b border-slate-100 overflow-x-auto scrollbar-none text-xs">
          {/* Active Cell Coord Badge */}
          <span className="flex items-center justify-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200/80 w-12 text-center">
            {activeCoord}
          </span>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Bold, Italic */}
          <button
            type="button"
            onClick={() => updateActiveCellStyle({ bold: !activeStyle.bold })}
            className={`p-1.5 rounded-lg transition ${
              activeStyle.bold ? "bg-emerald-100 text-emerald-900 font-black" : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => updateActiveCellStyle({ italic: !activeStyle.italic })}
            className={`p-1.5 rounded-lg transition ${
              activeStyle.italic ? "bg-emerald-100 text-emerald-900" : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Text Color */}
          <div className="flex items-center gap-1" title="Text Color">
            <span className="text-[10px] font-bold text-slate-400">A</span>
            <input
              type="color"
              value={activeStyle.color || "#000000"}
              onChange={(e) => updateActiveCellStyle({ color: e.target.value })}
              className="h-6 w-6 rounded cursor-pointer border border-slate-200"
            />
          </div>

          {/* Cell Bg Color */}
          <div className="flex items-center gap-1" title="Cell Fill Color">
            <span className="text-[10px] font-bold text-slate-400">Fill</span>
            <input
              type="color"
              value={activeStyle.bgColor || "#FFFFFF"}
              onChange={(e) => updateActiveCellStyle({ bgColor: e.target.value })}
              className="h-6 w-6 rounded cursor-pointer border border-slate-200"
            />
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => updateActiveCellStyle({ align: "left" })}
            className={`p-1.5 rounded-lg ${activeStyle.align === "left" ? "bg-emerald-100 text-emerald-900" : "text-slate-700 hover:bg-slate-100"}`}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateActiveCellStyle({ align: "center" })}
            className={`p-1.5 rounded-lg ${activeStyle.align === "center" ? "bg-emerald-100 text-emerald-900" : "text-slate-700 hover:bg-slate-100"}`}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateActiveCellStyle({ align: "right" })}
            className={`p-1.5 rounded-lg ${activeStyle.align === "right" ? "bg-emerald-100 text-emerald-900" : "text-slate-700 hover:bg-slate-100"}`}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Add / Delete Row & Col */}
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition font-bold"
            title="Add Row"
          >
            <Plus className="h-3 w-3" />
            <span>Row</span>
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition font-bold"
            title="Add Column"
          >
            <Plus className="h-3 w-3" />
            <span>Col</span>
          </button>
          <button
            type="button"
            onClick={deleteActiveRow}
            className="p-1 rounded-lg text-red-600 hover:bg-red-50"
            title="Delete Selected Row"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Formula Bar */}
        <div className="flex h-10 items-center gap-2 px-3 bg-slate-50">
          <span className="text-xs font-black italic text-emerald-700">fx</span>
          <input
            type="text"
            value={formulaInput}
            onChange={(e) => handleFormulaCommit(e.target.value)}
            placeholder="सूत्र दर्ज करें e.g. =SUM(A1:A5), =A1*B1 या सीधा टेक्स्ट"
            className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. EXCEL SPREADSHEET GRID */}
      <main className="flex-1 overflow-auto bg-[#F1F5F9]">
        <table className="border-collapse bg-white text-xs w-full select-text">
          <thead>
            <tr className="sticky top-0 z-20 bg-[#E2E8F0] shadow-xs">
              {/* Corner header */}
              <th className="w-12 border border-slate-300 bg-slate-200 p-1.5 text-center font-bold text-slate-600">
                #
              </th>
              {columns.map((col, colIdx) => (
                <th
                  key={col}
                  className={`min-w-[120px] max-w-[200px] border border-slate-300 p-1.5 text-center font-black transition ${
                    selectedCell.col === colIdx ? "bg-emerald-200 text-emerald-950" : "text-slate-700"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridData.map((rowVals, rIdx) => {
              const isRowSelected = selectedCell.row === rIdx;
              return (
                <tr key={rIdx}>
                  {/* Row Number Header */}
                  <td
                    className={`border border-slate-300 p-1.5 text-center font-black select-none ${
                      isRowSelected ? "bg-emerald-200 text-emerald-950" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {rIdx + 1}
                  </td>

                  {/* Row Cells */}
                  {columns.map((_, cIdx) => {
                    const rawVal = rowVals[cIdx] || "";
                    const displayVal = evaluateCell(rawVal, rIdx, cIdx);
                    const isCellSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
                    const style = cellStyles[`${rIdx}:${cIdx}`] || {};

                    return (
                      <td
                        key={cIdx}
                        onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                        style={{
                          backgroundColor: style.bgColor || (isCellSelected ? "#ECFDF5" : "#FFFFFF"),
                          color: style.color || "#0F172A",
                          textAlign: style.align || "left",
                        }}
                        className={`border border-slate-200 p-0 relative min-w-[120px] transition-colors ${
                          isCellSelected ? "ring-2 ring-emerald-600 z-10 font-bold" : ""
                        }`}
                      >
                        <input
                          type="text"
                          value={isCellSelected ? rawVal : displayVal}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          onFocus={() => setSelectedCell({ row: rIdx, col: cIdx })}
                          className={`w-full h-full px-2 py-1.5 bg-transparent focus:outline-none text-xs ${
                            style.bold ? "font-black" : "font-medium"
                          } ${style.italic ? "italic" : ""}`}
                          style={{ textAlign: style.align || "left" }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>

      {/* TEMPLATE PICKER MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>{isHi ? "स्प्रेडशीट प्रारूप चुनें" : "Select Spreadsheet Template"}</span>
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
              {SHEET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition text-left"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isHi ? tpl.nameHi : tpl.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isHi ? tpl.descHi : tpl.descEn}
                    </p>
                  </div>
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-600 hover:text-white transition">
                    {isHi ? "खोलें" : "Load"}
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
