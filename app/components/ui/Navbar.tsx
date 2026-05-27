"use client";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Show navbar when loading screen exits
    const observer = new MutationObserver(() => {
      const screen = document.querySelector(".loading-screen");
      if (screen?.classList.contains("done")) {
        setTimeout(() => nav.classList.add("nav-visible"), 400);
        observer.disconnect();
      }
    });
    const screen = document.querySelector(".loading-screen");
    if (screen?.classList.contains("done")) {
      nav.classList.add("nav-visible");
    } else if (screen) {
      observer.observe(screen, { attributes: true, attributeFilter: ["class"] });
    } else {
      nav.classList.add("nav-visible");
    }

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 60);

      // Switch to dark mode when over dark sections
      const darkIds = ["about", "gallery", "contact"];
      const inDark  = darkIds.some(id => {
        const el = document.getElementById(id) ?? document.querySelector(`footer`);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 0 && rect.bottom >= 0;
      });
      // Also check gallery section
      const galEl = document.getElementById("gallery");
      const footEl = document.querySelector("footer");
      const overDark = [
        document.getElementById("about"),
        galEl,
        footEl,
      ].some(el => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= 0 && r.bottom >= 0;
      });
      nav.classList.toggle("dark", overDark);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav ref={navRef} className="navbar">
      <div className="nav-logo">Frame</div>
      <div className="nav-links">
        {[
          ["about",   "About"],
          ["picture", "Work"],
          ["gallery", "Gallery"],
          ["contact", "Contact"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={e => { e.preventDefault(); scrollTo(id); }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
