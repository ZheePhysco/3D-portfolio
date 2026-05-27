"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SOCIAL = ["Instagram", "Email", "Vsco", "Behance"];

export default function Footer() {
  const ref     = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Logo: char-by-char reveal ──
      const logoEl = logoRef.current;
      if (logoEl) {
        const text = "Frame.";
        logoEl.innerHTML = "";
        const chars = text.split("").map(ch => {
          const s = document.createElement("span");
          s.style.opacity = "0";
          s.style.display = "inline-block";
          s.textContent   = ch;
          logoEl.appendChild(s);
          return s;
        });
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── Remaining items stagger ──
      const items = Array.from(ref.current?.querySelectorAll(".footer-anim") ?? []);
      gsap.fromTo(
        items,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={ref} id="contact">
      <div className="footer-inner">
        <div ref={logoRef} className="footer-logo" />

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: "36px", justifyContent: "center", marginBottom: "20px" }}>
            {SOCIAL.map(l => (
              <a key={l} href="#" className="footer-link footer-anim">{l}</a>
            ))}
          </div>
          <div className="footer-copy footer-anim">© 2024 Frame — All Rights Reserved</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="footer-copy footer-anim" style={{ marginBottom: "8px" }}>
            Padang, West Sumatra
          </div>
          <div className="footer-copy footer-anim" style={{ opacity: 0.5 }}>
            Crafted frame by frame
          </div>
        </div>
      </div>
    </footer>
  );
}
