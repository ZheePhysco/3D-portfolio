"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

export default function HeroSequence() {
  const sectionRef    = useRef<HTMLElement>(null);
  const leftRef       = useRef<HTMLDivElement>(null);
  const rightRef      = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const frameRef      = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLHeadingElement>(null);
  const subtitleRef   = useRef<HTMLParagraphElement>(null);
  const eyebrowRef    = useRef<HTMLDivElement>(null);
  const counterRef    = useRef<HTMLDivElement>(null);
  const scrollBarRef  = useRef<HTMLDivElement>(null);
  const bgLetterRef   = useRef<HTMLDivElement>(null);

  const imagesRef  = useRef<HTMLImageElement[]>([]);
  const curFrame   = useRef(0);
  const gsapCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const right  = rightRef.current;
    if (!canvas || !right) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    // ── Canvas fills the RIGHT panel only ──
    const setSize = () => {
      const rect = right.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
      drawFrame(curFrame.current);
    };

    const drawFrame = (i: number) => {
      const img = imagesRef.current[i];
      if (!img?.complete || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const sw = img.naturalWidth  * scale;
      const sh = img.naturalHeight * scale;
      canvasCtx.clearRect(0, 0, cw, ch);
      canvasCtx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
    };

    // ── Preload 240 frames ──
    let loaded = 0;
    const barEl    = document.querySelector(".loading-bar-fill") as HTMLElement | null;
    const pctEl    = document.querySelector(".loading-pct")      as HTMLElement | null;
    const screenEl = document.querySelector(".loading-screen")   as HTMLElement | null;

    imagesRef.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

      const onComplete = () => {
        loaded++;
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
        if (barEl) barEl.style.width = pct + "%";
        if (pctEl) pctEl.textContent  = pct + "%";
        if (i === 0 && img.complete && img.naturalWidth) { setSize(); drawFrame(0); }
        if (loaded === TOTAL_FRAMES) onAllLoaded();
      };
      img.onload  = onComplete;
      img.onerror = onComplete;
      return img;
    });

    const onAllLoaded = () => {
      drawFrame(0);

      setTimeout(() => {
        if (screenEl) screenEl.classList.add("done");

        // ── Single gsap.context for all animations ──
        const gCtx = gsap.context(() => {

          // ── LEFT PANEL: slide in from left ──
          gsap.fromTo(leftRef.current,
            { x: -60, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.1 }
          );

          // ── BG letter drift ──
          gsap.fromTo(bgLetterRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 2, ease: "power3.out", delay: 0.5 }
          );

          // ── Eyebrow typewriter ──
          const eyebrow = eyebrowRef.current;
          if (eyebrow) {
            const text = "Photography Portfolio";
            eyebrow.innerHTML = "";
            text.split("").forEach((ch, idx) => {
              const s = document.createElement("span");
              s.className = "char";
              s.textContent = ch === " " ? "\u00a0" : ch;
              s.style.opacity = "0";
              s.style.display = "inline-block";
              eyebrow.appendChild(s);
              setTimeout(() => {
                s.style.transition = "opacity 0.08s ease";
                s.style.opacity = "1";
              }, 400 + idx * 42);
            });
          }

          // ── TITLE: 3D perspective flip per word ──
          // Each word flips IN from rotateX(-90deg) like pages turning
          const words = titleRef.current?.querySelectorAll<HTMLElement>(".hero-title-word");
          if (words?.length) {
            gsap.set(titleBlockRef.current, { perspective: 1200 });
            gsap.set(words, {
              y: "100%",
              rotateX: -85,
              opacity: 1,
              transformOrigin: "50% 100%",
            });
            gsap.to(words, {
              y: "0%",
              rotateX: 0,
              duration: 1.3,
              stagger: { each: 0.14, from: "start" },
              ease: "power4.out",
              delay: 0.35,
            });
          }

          // ── Subtitle: reveal after title ──
          if (subtitleRef.current) {
            gsap.set(subtitleRef.current, { y: 16, opacity: 0 });
            gsap.to(subtitleRef.current, {
              y: 0, opacity: 1,
              duration: 1.0, ease: "power3.out", delay: 1.1,
            });
          }
          if (scrollBarRef.current) {
            gsap.set(scrollBarRef.current, { y: 10, opacity: 0 });
            gsap.to(scrollBarRef.current, {
              y: 0, opacity: 1,
              duration: 0.9, ease: "power3.out", delay: 1.4,
            });
          }

          // ═══════════════════════════════════════════════
          // SCROLL-DRIVEN ANIMATIONS
          // ═══════════════════════════════════════════════

          // ── FRAME SEQUENCE: 240 frames ──
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
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

          // ── WORDS: each exits at DIFFERENT speed (depth parallax) ──
          // Word 0: "Through" — exits fastest (feels closest to viewer)
          // Word 1: "The"     — medium speed
          // Word 2: "Lens"    — slowest (feels furthest)
          const wordEls = Array.from(
            titleRef.current?.querySelectorAll<HTMLElement>(".hero-title-word") ?? []
          );
          const exitOffsets = [-160, -220, -140];  // different Y exit per word
          const exitX       = [-24, 18, -12];       // slight X drift per word
          const exitRotX    = [16, -10, 14];         // rotateX exit per word
          const exitStarts  = ["6% top", "8% top", "10% top"];
          const exitEnds    = ["22% top", "28% top", "20% top"];

          wordEls.forEach((word, i) => {
            gsap.to(word, {
              y: exitOffsets[i] ?? -180,
              x: exitX[i] ?? 0,
              rotateX: exitRotX[i] ?? 10,
              opacity: 0,
              transformOrigin: "50% 100%",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: exitStarts[i] ?? "6% top",
                end: exitEnds[i] ?? "22% top",
                scrub: 1.4,
              },
            });
          });

          // ── TITLE BLOCK: 3D tilt as page scrolls (feels ALIVE) ──
          gsap.to(titleBlockRef.current, {
            rotateX: 14,
            rotateY: -4,
            y: -48,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "2% top",
              end: "30% top",
              scrub: 1.8,
            },
          });

          // ── EYEBROW: fade out faster ──
          gsap.to(eyebrowRef.current, {
            opacity: 0, y: -20,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "3% top",
              end: "12% top",
              scrub: 1,
            },
          });

          // ── SCROLL HINT: disappear ──
          gsap.to(scrollBarRef.current, {
            opacity: 0, y: 10,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "2% top",
              end: "6% top",
              scrub: 1,
            },
          });

          // ── LEFT PANEL: subtle leftward drift while scrolling ──
          gsap.to(leftRef.current, {
            x: -32,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "35% top",
              scrub: 2.2,
            },
          });

          // ── BG LETTER: slow drift ──
          gsap.to(bgLetterRef.current, {
            y: 120, x: -60,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "40% top",
              scrub: 3,
            },
          });

          // ── CANVAS: subtle scale + right drift ──
          gsap.fromTo(canvas,
            { scale: 1.0 },
            {
              scale: 1.07,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 2.5,
              },
            }
          );

          // ── FRAME border: 3D tilt on scroll ──
          if (frameRef.current) {
            gsap.fromTo(frameRef.current,
              { rotateX: 0, rotateY: 0, rotateZ: 0 },
              {
                rotateX: 4, rotateY: -3, rotateZ: 0.6,
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top top",
                  end: "40% top",
                  scrub: 2,
                },
              }
            );
          }

          // ── RIGHT PANEL: subtle parallax ──
          gsap.to(rightRef.current, {
            y: -20,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "50% top",
              scrub: 2,
            },
          });

          // ── Corner flash at sequence start ──
          const corners = frameRef.current?.querySelectorAll<HTMLElement>(".hero-corner");
          if (corners?.length) {
            gsap.to(corners, {
              opacity: 0.7, duration: 0.25,
              yoyo: true, repeat: 7, ease: "power1.inOut", delay: 0.3,
            });
          }

        }, sectionRef);

        gsapCtxRef.current = gCtx;
        setTimeout(() => ScrollTrigger.refresh(), 200);

      }, 600);
    };

    // ── Mouse parallax on LEFT panel ──
    const left = leftRef.current;
    const onMouseMove = (e: MouseEvent) => {
      if (!left || !titleBlockRef.current) return;
      const cx = window.innerWidth  * 0.2; // center of left panel
      const cy = window.innerHeight * 0.5;
      const dx = (e.clientX - cx) / (window.innerWidth * 0.4);
      const dy = (e.clientY - cy) / window.innerHeight;
      gsap.to(titleBlockRef.current, {
        rotateY:  dx * 4,
        rotateX: -dy * 3,
        duration: 1.0,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (bgLetterRef.current) {
        gsap.to(bgLetterRef.current, {
          x: dx * -18, y: dy * -12,
          duration: 1.4, ease: "power2.out", overwrite: "auto",
        });
      }
    };
    const onMouseLeave = () => {
      if (!titleBlockRef.current) return;
      gsap.to(titleBlockRef.current, {
        rotateY: 0, rotateX: 0,
        duration: 1.5, ease: "power3.out", overwrite: "auto",
      });
    };

    left?.addEventListener("mousemove", onMouseMove);
    left?.addEventListener("mouseleave", onMouseLeave);

    setSize();
    const onResize = () => { setSize(); ScrollTrigger.refresh(); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      left?.removeEventListener("mousemove", onMouseMove);
      left?.removeEventListener("mouseleave", onMouseLeave);
      gsapCtxRef.current?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="hero">
      <div className="hero-sticky">

        {/* ── LEFT DARK TEXT PANEL ── */}
        <div ref={leftRef} className="hero-left">

          {/* Ghost editorial BG letter */}
          <div ref={bgLetterRef} className="hero-bg-letter">A</div>

          {/* Top row */}
          <div className="hero-left-top">
            <div ref={eyebrowRef} className="hero-eyebrow" />
            <span className="hero-badge">01 / 03</span>
          </div>

          {/* Title block — 3D tilt wrapper */}
          <div ref={titleBlockRef} className="hero-title-block" style={{ transformStyle: "preserve-3d" }}>
            <h1 ref={titleRef} className="hero-title">
              <span className="hero-title-line">
                <span className="hero-title-word">Through</span>
              </span>
              <span className="hero-title-line">
                <span className="hero-title-word accent-word"><em>The</em></span>
              </span>
              <span className="hero-title-line">
                <span className="hero-title-word">Lens</span>
              </span>
            </h1>
          </div>

          {/* Bottom */}
          <div className="hero-left-bottom">
            <p ref={subtitleRef} className="hero-subtitle">
              Analog · Film Photography<br />Padang, West Sumatra
            </p>
            <div ref={scrollBarRef} className="hero-scroll-bar">
              <div className="hero-scroll-line" />
              <span className="hero-scroll-text">Scroll</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT CANVAS PANEL ── */}
        <div ref={rightRef} className="hero-right">

          {/* Canvas — 240 frame sequence */}
          <canvas ref={canvasRef} className="hero-canvas" />

          {/* Vignette edge softener */}
          <div className="hero-vignette" />

          {/* Film frame overlay */}
          <div
            ref={frameRef}
            className="hero-frame"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="hero-frame-line top" />
            <div className="hero-frame-line bottom" />
            <div className="hero-frame-line left" />
            <div className="hero-frame-line right" />
            <div className="hero-corner tl" />
            <div className="hero-corner tr" />
            <div className="hero-corner bl" />
            <div className="hero-corner br" />
            <div className="hero-corner-accent h" style={{ left: 0, bottom: 0, top: "auto" }} />
            <div className="hero-corner-accent v" style={{ bottom: 0, right: 0, top: "auto", left: "auto" }} />
          </div>

          {/* Info tags */}
          <div className="hero-tag top-left">Canon AE-1 Program · 35mm</div>
          <div className="hero-tag top-right">
            Analog · Film<br />West Sumatra
          </div>

          {/* Frame counter */}
          <div ref={counterRef} className="frame-counter">001 / 240</div>

        </div>

      </div>
    </section>
  );
}
