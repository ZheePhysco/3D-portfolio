"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const cur   = useRef({ x: -100, y: -100 });
  const tgt   = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const ring = ringRef.current;
    const dot  = dotRef.current;
    if (!ring || !dot) return;

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    let currentSection = "hero";

    const applySectionStyle = (section: string) => {
      if (section === currentSection) return;
      currentSection = section;

      // Reset all modifiers
      ring.classList.remove("crosshair", "cursor-plus", "on-dark", "has-label");
      if (labelRef.current) labelRef.current.textContent = "";

      switch (section) {
        case "hero":
          // Crosshair — camera viewfinder
          ring.classList.add("crosshair");
          dot.style.background = "var(--fg)";
          break;
        case "about":
          // Circle with VIEW text
          ring.classList.add("on-dark", "has-label");
          if (labelRef.current) labelRef.current.textContent = "VIEW";
          dot.style.background = "var(--paper)";
          break;
        case "gallery":
          // Plus symbol — add to collection
          ring.classList.add("cursor-plus", "on-dark");
          dot.style.background = "var(--paper)";
          break;
        case "picture":
          dot.style.background = "var(--fg)";
          break;
        case "footer":
          ring.classList.add("on-dark");
          dot.style.background = "var(--paper)";
          break;
        default:
          dot.style.background = "var(--fg)";
      }
    };

    const onMove = (e: MouseEvent) => {
      tgt.current = { x: e.clientX, y: e.clientY };
      dot.style.left = e.clientX + "px";
      dot.style.top  = e.clientY + "px";

      // Section personality detection
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      if (el.closest("#hero"))          applySectionStyle("hero");
      else if (el.closest("#about"))    applySectionStyle("about");
      else if (el.closest("#gallery"))  applySectionStyle("gallery");
      else if (el.closest("#picture"))  applySectionStyle("picture");
      else if (el.closest("footer"))    applySectionStyle("footer");
      else                              applySectionStyle("default");
    };

    const onEnter = () => ring.classList.add("hovering");
    const onLeave = () => ring.classList.remove("hovering");
    const onDown  = () => ring.classList.add("clicking");
    const onUp    = () => ring.classList.remove("clicking");

    const tick = () => {
      cur.current.x = lerp(cur.current.x, tgt.current.x, 0.11);
      cur.current.y = lerp(cur.current.y, tgt.current.y, 0.11);
      ring.style.left = cur.current.x + "px";
      ring.style.top  = cur.current.y + "px";
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    // Attach hover detection via event delegation for dynamic elements
    const onDocEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("a, button, .gallery-item, .photo-card, .filter-btn, .gear-item, .photo-stamp")) {
        onEnter();
      }
    };
    const onDocLeave = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("a, button, .gallery-item, .photo-card, .filter-btn, .gear-item, .photo-stamp")) {
        onLeave();
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    document.addEventListener("mouseover",  onDocEnter);
    document.addEventListener("mouseout",   onDocLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      document.removeEventListener("mouseover",  onDocEnter);
      document.removeEventListener("mouseout",   onDocLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden>
        <span ref={labelRef} className="cursor-label" aria-hidden />
      </div>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden />
    </>
  );
}
