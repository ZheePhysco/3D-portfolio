"use client";
// Label kategori tipografis — muncul di sudut section

interface SectionLabelProps {
  number: string;
  label: string;
  className?: string;
}

export default function SectionLabel({ number, label, className = "" }: SectionLabelProps) {
  return (
    <div className={`section-label ${className}`}>
      <span className="label-number">{number}</span>
      <span className="label-divider">—</span>
      <span className="label-text">{label}</span>
    </div>
  );
}
