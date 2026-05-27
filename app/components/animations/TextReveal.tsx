"use client";
import { useRef, ReactNode, ElementType } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  tag?: ElementType;
}

export default function TextReveal({ children, className = "", tag: Tag = "div" }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Tag ref={ref} className={`text-reveal ${className}`}>
      {children}
    </Tag>
  );
}
