"use client";
// Wrapper component: memberikan efek 3D perspective pada setiap section
// children di-render dalam "frame" 3D yang bisa di-tilt saat scroll

import { useRef, useEffect, ReactNode } from "react";

interface Frame3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // 0–1, default 0.5
}

export default function Frame3D({ children, className = "", intensity = 0.5 }: Frame3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
