"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

// Helper: split text into char spans
function splitChars(el: HTMLElement) {
  const text = el.textContent ?? "";
  el.innerHTML = "";
  return text.split("").map(ch => {
    const s = document.createElement("span");
    s.className = "cs-char";
    s.textContent = ch === " " ? "\u00a0" : ch;
    el.appendChild(s);
    return s;
  });
}

// Helper: split text into word spans
function splitWords(el: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  el.querySelectorAll<HTMLElement>(".hero-title-word").forEach(w => words.push(w));
  return words;
}

export default function HeroSequence() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stickyRef   = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const frameRef    = useRef<HTMLDivElement>(null);
  const textBarRef  = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const counterRef  = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

  const imagesRef  = useRef<HTMLImageElement[]>([]);
  const curFrame   = useRef(0);
  const gsapCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    // Canvas = full viewport
    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(curFrame.current);
    };

    const drawFrame = (i: number) => {
      const img = imagesRef.current[i];
      if (!img?.complete || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;

      // ✅ Math.max = COVER: gambar mengisi penuh layar (seperti semula)
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const sw = img.naturalWidth  * scale;
      const sh = img.naturalHeight * scale;
      const dx = (cw - sw) / 2;
      const dy = (ch - sh) / 2;

      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, dx, dy, sw, sh);
    };

    // ── Preload frames ──
    let loaded = 0;
    const barEl    = document.querySelector(".loading-bar-fill") as HTMLElement | null;
    const pctEl    = document.querySelector(".loading-pct")      as HTMLElement | null;
    const screenEl = document.querySelector(".loading-screen")   as HTMLElement | null;

    imagesRef.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

      const onDone = () => {
        loaded++;
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
        if (barEl) barEl.style.width = pct + "%";
        if (pctEl) pctEl.textContent  = pct + "%";
        if (i === 0 && img.complete && img.naturalWidth) { setSize(); drawFrame(0); }
        if (loaded === TOTAL_FRAMES) onAllLoaded();
      };
      img.onload  = onDone;
      img.onerror = onDone;
      return img;
    });

    const onAllLoaded = () => {
      drawFrame(0);
      setTimeout(() => {
        if (screenEl) screenEl.classList.add("done");

        const gCtx = gsap.context(() => {

          // ── EYEBROW: char-by-char typewriter ──
          const eyebrow = eyebrowRef.current;
          if (eyebrow) {
            const chars = splitChars(eyebrow);
            // Stagger: each char fades in via setTimeout for simplicity
            chars.forEach((ch, idx) => {
              ch.style.opacity = "0";
              setTimeout(() => {
                ch.style.transition = "opacity 0.1s ease";
                ch.style.opacity = "1";
              }, 500 + idx * 40);
            });
          }

          // ── TITLE WORDS: 3D perspective flip (rotateX) ──
          // Set initial: words start flipped back on Y axis (like a page fold)
          const titleEl = titleRef.current;
          const words   = titleEl ? splitWords(titleEl) : [];
          if (words.length) {
            gsap.set(words, {
              y: "102%",
              rotateX: -80,
              transformOrigin: "50% 100%",
              transformPerspective: 1400,
              opacity: 1,
            });
            gsap.to(words, {
              y: "0%", rotateX: 0,
              duration: 1.4, stagger: 0.16, ease: "power4.out",
              delay: 0.5,
            });
          }

          // ── SUBTITLE: fade + slide ──
          const subtitleEl = textBarRef.current?.querySelector(".hero-subtitle");
          if (subtitleEl) {
            gsap.set(subtitleEl, { opacity: 0, y: 12 });
            gsap.to(subtitleEl, {
              opacity: 1, y: 0,
              duration: 1.1, ease: "power3.out", delay: 1.3,
            });
          }

          // ── NAVBAR: show ──
          setTimeout(() => {
            document.querySelector(".navbar")?.classList.add("nav-visible");
          }, 300);

          // ═══════════════════════════════
          //   SCROLL-DRIVEN ANIMATIONS
          // ═══════════════════════════════

          // ── FRAME SEQUENCE: 240 frames ──
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              const idx = Math.min(
                Math.round(self.progress * (TOTAL_FRAMES - 1)),
                TOTAL_FRAMES - 1
              );
              if (idx !== curFrame.current) {
                curFrame.current = idx;
                drawFrame(idx);
                if (counterRef.current)
                  counterRef.current.textContent =
                    `${String(idx + 1).padStart(3, "0")} / ${String(TOTAL_FRAMES).padStart(3, "0")}`;
              }
            },
          });

          // ── TEXT BAR: slides up when sequence near completion ──
          // Appears from translateY(100%) → translateY(0%) at 78%-95% scroll
          gsap.fromTo(textBarRef.current,
            { y: "100%", opacity: 1 },
            {
              y: "0%", ease: "power3.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "78% top",
                end:   "94% top",
                scrub: 1.2,
              },
            }
          );

          // ── TITLE WORDS: stagger exit as bar rises — each word has parallax ──
          // When bar fully in, scroll continues a bit so words drift + tilt  
          const wordEls = Array.from(
            titleRef.current?.querySelectorAll<HTMLElement>(".hero-title-word") ?? []
          );
          wordEls.forEach((word, i) => {
            gsap.to(word, {
              y: -(24 + i * 18),
              rotateX: 8 + i * 4,
              opacity: 0.6,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "90% top",
                end:   "99% top",
                scrub: 1.2,
              },
            });
          });

          // ✅ Canvas: subtle 3D tilt only (no scale — would re-crop the image)
          gsap.to(canvas, {
            rotateX: 1.2, rotateY: -0.8,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end:   "60% top",
              scrub: 3,
            },
          });

          // ── FRAME BORDER: tilt in response to scroll ──
          if (frameRef.current) {
            gsap.to(frameRef.current, {
              rotateX: 3, rotateY: -2, rotateZ: 0.4,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "60% top",
                scrub: 2,
              },
            });
          }

          // ── SCROLL HINT: fade out early ──
          gsap.to(scrollRef.current, {
            opacity: 0, y: 10, ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "2% top",
              end:   "5% top",
              scrub: 1,
            },
          });

          // ── COUNTER: subtle fade at very end ──
          gsap.to(counterRef.current, {
            opacity: 0, ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "96% top",
              end:   "100% top",
              scrub: 1,
            },
          });

        }, sectionRef);

        gsapCtxRef.current = gCtx;
        setTimeout(() => ScrollTrigger.refresh(), 200);

      }, 700);
    };

    setSize();
    const onResize = () => { setSize(); ScrollTrigger.refresh(); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      gsapCtxRef.current?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="hero">
      {/* ── STICKY CANVAS CONTAINER ── */}
      <div ref={stickyRef} className="hero-canvas-sticky">

        {/* Full-screen canvas */}
        <canvas ref={canvasRef} className="hero-canvas" />

        {/* Vignette */}
        <div className="hero-vignette" />

        {/* Top gradient (navbar area) */}
        <div className="hero-top-fade" />

        {/* Film frame border */}
        <div ref={frameRef} className="hero-frame" style={{ transformStyle: "preserve-3d" }}>
          <div className="hero-frame-line top" />
          <div className="hero-frame-line bottom" />
          <div className="hero-frame-line left" />
          <div className="hero-frame-line right" />
          <div className="hero-corner tl" />
          <div className="hero-corner tr" />
          <div className="hero-corner bl" />
          <div className="hero-corner br" />
        </div>

        {/* Frame counter — top right */}
        <div ref={counterRef} className="hero-counter">001 / 240</div>

        {/* Camera info — top left */}
        <div className="hero-info">
          Canon AE-1 Program · 35mm<br />Analog · Film Photography
        </div>

        {/* Scroll hint — bottom center */}
        <div ref={scrollRef} className="hero-scroll">
          <div className="hero-scroll-dot" />
          <span className="hero-scroll-text">Scroll</span>
        </div>

        {/* ── TEXT BAR: slides up from below ── */}
        <div ref={textBarRef} className="hero-text-bar">

          {/* Eyebrow */}
          <div ref={eyebrowRef} className="hero-title-eyebrow" />

          {/* Title: 3D word flip */}
          <h1 ref={titleRef} className="hero-title" style={{ perspective: "1400px" }}>
            <span className="hero-title-line">
              <span className="hero-title-word">Through</span>
            </span>
            <span className="hero-title-line">
              {/* Italic accent word */}
              <span className="hero-title-word">
                <em className="title-italic">The</em>
              </span>
            </span>
            <span className="hero-title-line">
              <span className="hero-title-word">Lens</span>
            </span>
          </h1>

          {/* Meta row */}
          <div className="hero-meta-row">
            <p className="hero-subtitle">Analog · Storytelling · West Sumatra</p>
            <div className="hero-meta-sep" />
          </div>

        </div>
      </div>
    </section>
  );
}
