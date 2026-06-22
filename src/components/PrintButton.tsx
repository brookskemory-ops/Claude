"use client";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-primary mt-8 print:hidden">
      {label}
    </button>
  );
}
