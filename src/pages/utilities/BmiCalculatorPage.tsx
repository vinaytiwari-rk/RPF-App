import React, { useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, HeartPulse } from "lucide-react";
import UtilityPageShell from "./UtilityPageShell";

export default function BmiCalculatorPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const nav = useNavigate();
  const hi = lang === "hi";

  const [w, setW] = useState(70);
  const [h, setH] = useState(170);

  const bmi = useMemo(() => (h > 0 ? w / (h / 100) ** 2 : 0), [w, h]);

  const label =
    bmi < 18.5
      ? hi ? "कम वजन (Underweight)" : "Underweight"
      : bmi < 25
      ? hi ? "सामान्य (Normal)" : "Normal"
      : bmi < 30
      ? hi ? "अधिक वजन (Overweight)" : "Overweight"
      : hi ? "मोटापा (Obesity)" : "Obesity";

  const statusColor =
    bmi < 18.5
      ? "text-[#D97706] bg-amber-50 border-amber-200"
      : bmi < 25
      ? "text-[#167C5A] bg-emerald-50 border-emerald-200"
      : "text-[#DC2626] bg-red-50 border-red-200";

  return (
    <UtilityPageShell
      title={hi ? "BMI कैलकुलेटर" : "BMI Calculator"}
      icon={<HeartPulse className="h-4 w-4" />}
      onBack={() => nav("/tools")}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label={hi ? "वजन (kg)" : "Weight (kg)"} value={w} set={setW} />
        <Field label={hi ? "ऊंचाई (cm)" : "Height (cm)"} value={h} set={setH} />
      </div>

      <div className={`mt-6 rounded-2xl border p-6 text-center ${statusColor}`}>
        <div className="text-4xl sm:text-5xl font-extrabold">{bmi.toFixed(1)}</div>
        <div className="mt-2 text-sm font-bold">{label}</div>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500 text-center">
        {hi
          ? "यह सामान्य स्वास्थ्य सूचकांक गणना है, मेडिकल सलाह के लिए चिकित्सक से परामर्श लें।"
          : "This is a general health calculation, not a medical diagnosis."}
      </p>
    </UtilityPageShell>
  );
}

function Field({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <label className="block text-xs font-bold text-[#14213D]">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-[#14213D] focus:border-[#D97706] focus:bg-white focus:outline-none transition-all"
        type="number"
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
    </label>
  );
}
