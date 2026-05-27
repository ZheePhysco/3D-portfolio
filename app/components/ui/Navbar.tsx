"use client";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Entrance: reveal after loading is done (listen for loading-screen.done)
    const observer = new MutationObserver(() => {
      const screen = document.querySelector(".loading-screen");
      if (screen?.classList.contains("done")) {
        setTimeout(() => nav.classList.add("nav-visible"), 200);
        observer.disconnect();
      }
    });
    const screen = document.querySelector(".loading-screen");
    if (screen) {
      if (screen.classList.contains("done")) {
        nav.classList.add("nav-visible");
      } else {
        observer.observe(screen, { attributes: true, attributeFilter: ["class"] });
      }
    }

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 60);

      // Switch to dark variant when over dark sections
      const about   = document.getElementById("about");
      const gallery = document.getElementById("gallery");
      const footer  = document.querySelector("footer");
      const inDark  = [about, gallery, footer].some(el => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 0 && rect.bottom >= 0;
      });
      nav.classList.toggle("dark", inDark);
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
        {[["about","About"],["picture","Work"],["gallery","Gallery"],["contact","Contact"]].map(([id,label]) => (
          <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
