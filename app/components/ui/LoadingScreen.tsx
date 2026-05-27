"use client";
import { useEffect, useRef, useState } from "react";

const LOGO_TEXT = "Frame";
const TYPEWRITER_SPEED = 90; // ms per char

export default function LoadingScreen() {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(LOGO_TEXT.slice(0, i));
      if (i >= LOGO_TEXT.length) clearInterval(id);
    }, TYPEWRITER_SPEED);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-logo">
        {displayed}
        <span style={{
          display: "inline-block",
          width: "2px",
          height: "0.8em",
          background: "var(--accent)",
          marginLeft: "3px",
          animation: "cornerPulse 0.8s ease-in-out infinite",
          verticalAlign: "middle",
        }} />
      </div>
      <div className="loading-sub">Photography Portfolio</div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
      <div className="loading-pct">0%</div>
    </div>
  );
}
