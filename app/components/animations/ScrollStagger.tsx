"use client";
// Stagger entrance animation untuk list of elements saat masuk viewport

import { useRef, ReactNode } from "react";

interface ScrollStaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollStagger({ children, className = "", delay = 0 }: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={`scroll-stagger ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
