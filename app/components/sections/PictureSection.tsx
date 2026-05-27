"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { src: "/photos/portrait/picture-01.png", category: "Portrait", index: "001", w: 600, h: 800 },
  { src: "/photos/portrait/picture-02.png", category: "Analog",   index: "002", w: 600, h: 800 },
  { src: "/photos/portrait/picture-03.png", category: "Street",   index: "003", w: 600, h: 800 },
  { src: "/photos/portrait/picture-04.png", category: "Gallery",  index: "004", w: 600, h: 800 },
  { src: "/photos/portrait/picture-05.png", category: "Portrait", index: "005", w: 600, h: 800 },
];

export default function PictureSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stackRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const ghostRef    = useRef<HTMLDivElement>(null);
  const total       = CARDS.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = Array.from(
        stackRef.current?.querySelectorAll<HTMLElement>(".photo-card") ?? []
      );
      if (!cards.length) return;

      // ── Initial deck fan ──
      cards.forEach((card, i) => {
        const depth = total - 1 - i;
        gsap.set(card, {
          rotateZ:         depth * -1.8,
          y:               depth * 7,
          zIndex:          total - i,
          transformOrigin: "50% 110%",
          transformStyle:  "preserve-3d",
        });
      });

      // ── Header reveal ──
      gsap.fromTo(
        headerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Word split on heading ──
      const headingWords = headerRef.current?.querySelectorAll<HTMLElement>(".picture-word");
      if (headingWords?.length) {
        gsap.set(headingWords, { y: "110%", opacity: 1 });
        gsap.to(headingWords, {
          y: "0%", duration: 1.0, stagger: 0.1, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── Stack entrance ──
      gsap.fromTo(
        stackRef.current,
        { y: 100, opacity: 0, rotateX: 20, scale: 0.88 },
        {
          y: 0, opacity: 1, rotateX: 0, scale: 1,
          duration: 1.4, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 68%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Card fly-out on scroll ──
      cards.forEach((card, i) => {
        const segStart = (i / total) * 75 + 5;
        const segEnd   = ((i + 1) / total) * 75 + 5;
        const dir      = i % 2 === 0 ? 1 : -1;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: `${segStart}% top`,
          end:   `${segEnd}% top`,
          scrub: 0.7,
          onUpdate: (self) => {
            const p    = self.progress;
            const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            const fast = Math.pow(p, 0.5);

            gsap.set(card, {
              rotateZ: (total - 1 - i) * -1.8 + ease * dir * 42,
              rotateX: ease * -20,
              rotateY: ease * dir * 10,
              y:       (total - 1 - i) * 7 - fast * window.innerHeight * 0.88,
              x:       ease * dir * window.innerWidth  * 0.35,
              opacity: 1 - fast * 0.92,
              scale:   1 - ease * 0.06,
            });

            // Compress remaining cards
            for (let j = i + 1; j < total; j++) {
              const d = total - 1 - j;
              gsap.set(cards[j], {
                rotateZ: d * -1.8 + p * 1.2,
                y:       d * 7   - p * 5,
              });
            }

            // Progress bar
            const fill  = progressRef.current?.querySelector<HTMLElement>(".progress-fill");
            const label = progressRef.current?.querySelector<HTMLElement>(".progress-label");
            const overall = (i + self.progress) / total;
            if (fill)  fill.style.width  = overall * 100 + "%";
            if (label) label.textContent = `${String(i + 1).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;
            if (ghostRef.current) {
              ghostRef.current.textContent = String(i + 1).padStart(2, "0");
            }
          },
        });
      });

    }, sectionRef);

    // ✅ Mousemove listeners di luar gsap.context agar cleanup benar
    const cardEls = Array.from(
      stackRef.current?.querySelectorAll<HTMLElement>(".photo-card") ?? []
    );

    type CardHandler = { card: HTMLElement; move: (e: MouseEvent) => void; leave: () => void };
    const handlers: CardHandler[] = cardEls.map(card => {
      const move = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        gsap.to(card, {
          rotateY:  dx * 12,
          rotateX: -dy * 10,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      const leave = () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0,
          duration: 0.9, ease: "power3.out", overwrite: "auto",
        });
      };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      return { card, move, leave };
    });

    return () => {
      ctx.revert();
      // ✅ Remove semua mousemove listeners
      handlers.forEach(({ card, move, leave }) => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
    };
  }, [total]);

  return (
    <section ref={sectionRef} id="picture">
      <div className="picture-sticky">

        {/* Header */}
        <div ref={headerRef} className="picture-header">
          <div className="section-label">
            <span className="label-number">03</span>
            <span className="label-divider">—</span>
            <span className="label-text">Selected Work</span>
          </div>
          <h2 className="picture-heading">
            <span className="picture-line">
              <span className="picture-word">Every</span>&nbsp;
              <span className="picture-word">frame</span>
            </span>
            <br />
            <span className="picture-line">
              <em className="picture-word" style={{ fontStyle: "italic", color: "var(--accent)" }}>tells</em>&nbsp;
              <span className="picture-word">a</span>&nbsp;
              <span className="picture-word">story</span>
            </span>
          </h2>
        </div>

        {/* 3D card stack */}
        <div
          ref={stackRef}
          className="card-stack"
          style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
        >
          {CARDS.map((card, i) => (
            <div key={i} className="photo-card">
              <div className="photo-card-inner">
                <Image
                  src={card.src}
                  alt={`${card.category} photography`}
                  width={card.w}
                  height={card.h}
                  style={{ width: "100%", height: "86%", objectFit: "cover" }}
                />
                <div className="photo-card-meta">
                  <span className="card-category">{card.category}</span>
                  <span className="card-index">{card.index}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div ref={progressRef} className="picture-progress">
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
          <span className="progress-label">01 / 05</span>
        </div>

        {/* Ghost number */}
        <div ref={ghostRef} className="count-current">01</div>

      </div>
    </section>
  );
}
