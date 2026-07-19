import React from "react";
import { useOutletContext } from "react-router-dom";
import GovernmentSchemes from "../components/GovernmentSchemes";

export default function SchemesPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();

  return (
    <div className="p-4 pb-24">
      <GovernmentSchemes lang={lang} />
    </div>
  );
}
