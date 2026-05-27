"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { src: "/photos/portrait/picture-01.png", category: "Portrait", index: "001", w: 941, h: 1672 },
  { src: "/photos/portrait/picture-02.png", category: "Analog",   index: "002", w: 941, h: 1672 },
  { src: "/photos/portrait/picture-03.png", category: "Street",   index: "003", w: 941, h: 1672 },
  { src: "/photos/portrait/picture-04.png", category: "Gallery",  index: "004", w: 941, h: 1672 },
  { src: "/photos/portrait/picture-05.png", category: "Portrait", index: "005", w: 941, h: 1672 },
];

export default function PictureSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const textColRef   = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const stackRef     = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const ghostRef     = useRef<HTMLDivElement>(null);
  const total = CARDS.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = Array.from(
        stackRef.current?.querySelectorAll<HTMLElement>(".photo-card") ?? []
      );
      if (!cards.length) return;

      // ── Initial: stagger-fan the deck ──
      cards.forEach((card, i) => {
        gsap.set(card, {
          rotateZ: (total - 1 - i) * -2.2,
          y:       (total - 1 - i) * 8,
          zIndex:  total - i,
          transformOrigin: "50% 110%",
          transformStyle: "preserve-3d",
        });
      });

      // ── Text column entrance ──
      gsap.fromTo(textColRef.current,
        { x: -48, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.3, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Heading: 3D word flip ──
      const words = headingRef.current?.querySelectorAll<HTMLElement>(".ws-word");
      if (words?.length) {
        gsap.set(words, {
          y: "105%", rotateX: -78,
          transformOrigin: "50% 100%",
          transformPerspective: 1300, opacity: 1,
        });
        gsap.to(words, {
          y: "0%", rotateX: 0,
          duration: 1.2, stagger: 0.12, ease: "power4.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── Card stack entrance ──
      gsap.fromTo(stackRef.current,
        { y: 80, opacity: 0, rotateX: 18, scale: 0.9 },
        {
          y: 0, opacity: 1, rotateX: 0, scale: 1,
          duration: 1.5, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Cards fly off on scroll ──
      cards.forEach((card, i) => {
        const startPct = (i / total) * 74 + 6;
        const endPct   = ((i + 1) / total) * 74 + 6;
        const dir      = i % 2 === 0 ? 1 : -1;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: `${startPct}% top`,
          end:   `${endPct}% top`,
          scrub: 0.8,
          onUpdate: (self) => {
            const p    = self.progress;
            // Ease-in-out: slow start, fast exit
            const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            const fast = Math.pow(p, 0.6);

            gsap.set(card, {
              rotateZ: (total - 1 - i) * -2.2 + ease * dir * 50,
              rotateX: ease * -28,
              rotateY: ease * dir * 14,
              y:       (total - 1 - i) * 8 - fast * window.innerHeight * 0.95,
              x:       ease * dir * window.innerWidth  * 0.38,
              opacity: 1 - fast * 0.95,
              scale:   1 - ease * 0.05,
            });

            // Compress remaining deck
            for (let j = i + 1; j < total; j++) {
              const d = total - 1 - j;
              gsap.set(cards[j], {
                rotateZ: d * -2.2 + p * 1.5,
                y:       d * 8   - p * 6,
              });
            }

            // Update progress
            const overall = (i + p) / total;
            const fill  = progressRef.current?.querySelector<HTMLElement>(".progress-fill");
            const lbl   = progressRef.current?.querySelector<HTMLElement>(".progress-label");
            if (fill)  fill.style.width  = overall * 100 + "%";
            if (lbl)   lbl.textContent   = `${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
            if (ghostRef.current) ghostRef.current.textContent = String(i + 1).padStart(2, "0");
          },
        });
      });

    }, sectionRef);

    // ── Mousemove tilt per card (outside context for cleanup) ──
    const cardEls = Array.from(
      stackRef.current?.querySelectorAll<HTMLElement>(".photo-card") ?? []
    );
    type H = { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void };
    const handlers: H[] = cardEls.map(card => {
      const move = (e: MouseEvent) => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        gsap.to(card, {
          rotateY: dx * 13, rotateX: -dy * 10,
          duration: 0.45, ease: "power2.out", overwrite: "auto",
        });
      };
      const leave = () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0,
          duration: 1.0, ease: "power3.out", overwrite: "auto",
        });
      };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      return { el: card, move, leave };
    });

    return () => {
      ctx.revert();
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, [total]);

  return (
    <section ref={sectionRef} id="picture">
      <div className="picture-sticky">

        {/* Left: Text */}
        <div ref={textColRef} className="picture-text-col">
          <div className="label" style={{ marginBottom: "20px" }}>
            <span className="label-num">03</span>
            <span className="label-sep">—</span>
            <span>Selected Work</span>
          </div>

          <h2
            ref={headingRef}
            className="picture-heading"
          >
            <span className="ws-wrap">
              <span className="ws-word">Every</span>&nbsp;
              <span className="ws-word">frame</span>
            </span>
            <br />
            <span className="ws-wrap">
              <em className="ws-word" style={{ fontStyle: "italic", color: "var(--accent)" }}>tells</em>&nbsp;
              <span className="ws-word">a</span>
            </span>
            <br />
            <span className="ws-wrap">
              <span className="ws-word">story</span>
            </span>
          </h2>

          {/* Progress */}
          <div ref={progressRef} className="picture-progress" style={{ position: "static", marginTop: "40px" }}>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
            <span className="progress-label">01 / 05</span>
          </div>
        </div>

        {/* Right: Card stack */}
        <div className="picture-card-col">
          <div
            ref={stackRef}
            className="card-stack"
            style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
          >
            {CARDS.map((card, i) => (
              <div key={i} className="photo-card">
                <div className="photo-card-inner">
                  <Image
                    src={card.src}
                    alt={`${card.category} photography`}
                    width={941}
                    height={1672}
                    style={{
                      width: "100%",
                      height: "84%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                  />
                  <div className="photo-card-meta">
                    <span className="card-cat">{card.category}</span>
                    <span className="card-idx">{card.index}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ghost number */}
          <div ref={ghostRef} className="ghost-num">01</div>
        </div>

      </div>
    </section>
  );
}
