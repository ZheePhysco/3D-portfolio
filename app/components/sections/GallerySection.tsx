"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Cat = "all" | "portrait" | "street" | "analog" | "gallery";

const PHOTOS = [
  { src: "/photos/portrait/picture-01.png", cat: "portrait", label: "Portrait · 01", w: 600, h: 800 },
  { src: "/photos/gallery/gallery-01.png",  cat: "gallery",  label: "Analog · 01",   w: 800, h: 600 },
  { src: "/photos/portrait/picture-02.png", cat: "analog",   label: "Film · 02",     w: 600, h: 750 },
  { src: "/photos/gallery/gallery-02.png",  cat: "street",   label: "Street · 01",   w: 800, h: 550 },
  { src: "/photos/portrait/picture-03.png", cat: "portrait", label: "Portrait · 03", w: 600, h: 900 },
  { src: "/photos/gallery/gallery-03.png",  cat: "gallery",  label: "Gallery · 03",  w: 800, h: 600 },
  { src: "/photos/portrait/picture-04.png", cat: "street",   label: "Street · 04",   w: 600, h: 700 },
  { src: "/photos/gallery/gallery-04.png",  cat: "analog",   label: "Analog · 04",   w: 800, h: 600 },
  { src: "/photos/portrait/picture-05.png", cat: "portrait", label: "Portrait · 05", w: 600, h: 800 },
  { src: "/photos/gallery/gallery-05.png",  cat: "gallery",  label: "Gallery · 05",  w: 800, h: 620 },
];

const FILTERS: { key: Cat; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "portrait", label: "Portrait" },
  { key: "street",   label: "Street"   },
  { key: "analog",   label: "Analog"   },
  { key: "gallery",  label: "Gallery"  },
];

export default function GallerySection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const filterRef   = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Cat>("all");

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Section label ──
      gsap.fromTo(
        labelRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Heading: word-by-word reveal ──
      const words = headingRef.current?.querySelectorAll<HTMLElement>(".word");
      if (words?.length) {
        gsap.set(words, { y: "105%", opacity: 1 });
        gsap.to(words, {
          y: "0%", duration: 1.1, stagger: 0.18, ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── Filter buttons: stagger up ──
      const filterBtns = Array.from(filterRef.current?.children ?? []);
      if (filterBtns.length) {
        gsap.fromTo(
          filterBtns,
          { y: 24, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "power3.out",
            scrollTrigger: {
              trigger: filterRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── Grid items: column-aware cascade ──
      const items = Array.from(
        gridRef.current?.querySelectorAll<HTMLElement>(".gallery-item") ?? []
      );
      items.forEach((item, i) => {
        const colIndex = i % 3;
        gsap.fromTo(
          item,
          { y: 90, opacity: 0, scale: 0.92 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.95,
            delay: colIndex * 0.08 + Math.floor(i / 3) * 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

    }, sectionRef);

    // ✅ Gallery item 3D tilt — di luar gsap.context agar bisa di-cleanup
    const items = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>(".gallery-item") ?? []
    );

    type Handler = { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void };
    const handlers: Handler[] = items.map(item => {
      const move = (e: MouseEvent) => {
        const rect = item.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
        const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
        gsap.to(item, {
          rotateY: dx * 6, rotateX: -dy * 4,
          duration: 0.4, ease: "power2.out", overwrite: "auto",
          transformPerspective: 800,
        });
      };
      const leave = () => {
        gsap.to(item, {
          rotateY: 0, rotateX: 0,
          duration: 0.8, ease: "power3.out", overwrite: "auto",
        });
      };
      item.addEventListener("mousemove", move);
      item.addEventListener("mouseleave", leave);
      return { el: item, move, leave };
    });

    return () => {
      ctx.revert();
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  const handleFilter = (cat: Cat) => {
    setActive(cat);
    const items = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>(".gallery-item") ?? []
    );

    const hiding  = items.filter(item => cat !== "all" && item.dataset.cat !== cat);
    const showing = items.filter(item => cat === "all" || item.dataset.cat === cat);

    const tl = gsap.timeline();
    if (hiding.length) {
      tl.to(hiding, {
        scale: 0.85, opacity: 0, y: 20,
        duration: 0.35, ease: "power2.in", stagger: 0.03,
        pointerEvents: "none",
      });
    }
    if (showing.length) {
      tl.to(showing, {
        scale: 1, opacity: 1, y: 0,
        duration: 0.5, ease: "power2.out", stagger: 0.04,
        pointerEvents: "auto",
      }, hiding.length ? "-=0.15" : "0");
    }
  };

  return (
    <section ref={sectionRef} id="gallery">

      <div className="gallery-header">
        <div>
          <div
            ref={labelRef}
            className="section-label"
            style={{ color: "rgba(245,242,235,0.25)", marginBottom: "20px" }}
          >
            <span className="label-number">04</span>
            <span className="label-divider" style={{ color: "rgba(245,242,235,0.15)" }}>—</span>
            <span className="label-text">Gallery</span>
          </div>

          <h2 ref={headingRef} className="gallery-heading">
            <span className="word-wrap">
              <span className="word">The</span>
            </span>
            <br />
            <span className="word-wrap">
              <em className="word" style={{ fontStyle: "italic" }}>Archive</em>
            </span>
          </h2>
        </div>

        <div ref={filterRef} className="gallery-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              className={`filter-btn${active === f.key ? " active" : ""}`}
              onClick={() => handleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="gallery-grid">
        {PHOTOS.map((p, i) => (
          <div key={i} className="gallery-item" data-cat={p.cat}>
            <Image
              src={p.src}
              alt={`${p.cat} photography ${i + 1}`}
              width={p.w}
              height={p.h}
              style={{ width: "100%", height: "auto" }}
            />
            <div className="gallery-item-overlay">
              <span className="gallery-item-label">{p.label}</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
