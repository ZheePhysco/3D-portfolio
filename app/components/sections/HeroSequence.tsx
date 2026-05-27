"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

export default function HeroSequence() {
  const sectionRef    = useRef<HTMLElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const frameRef      = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLDivElement>(null);
  const subtitleRef   = useRef<HTMLParagraphElement>(null);
  const eyebrowRef    = useRef<HTMLDivElement>(null);
  const counterRef    = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const imagesRef     = useRef<HTMLImageElement[]>([]);
  const curFrame      = useRef(0);
  // Single ref untuk menyimpan gsap context agar bisa di-cleanup dengan benar
  const gsapCtxRef    = useRef<ReturnType<typeof gsap.context> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    // ── Canvas sizing ──
    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
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

    // ── Preload frames ──
    let loaded = 0;
    const barEl    = document.querySelector(".loading-bar-fill") as HTMLElement | null;
    const pctEl    = document.querySelector(".loading-pct")      as HTMLElement | null;
    const screenEl = document.querySelector(".loading-screen")   as HTMLElement | null;

    imagesRef.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      // ✅ Nama file: ezgif-frame-001.jpg s/d ezgif-frame-240.jpg (index mulai 1)
      img.src = `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

      const onComplete = () => {
        loaded++;
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
        if (barEl) barEl.style.width = pct + "%";
        if (pctEl) pctEl.textContent  = pct + "%";
        // Render frame 0 segera setelah berhasil load
        if (i === 0 && img.complete && img.naturalWidth) {
          setSize();
          drawFrame(0);
        }
        if (loaded === TOTAL_FRAMES) onAllLoaded();
      };

      img.onload  = onComplete;
      // ✅ FIX 1: onerror handler — jika frame gagal load, tetap hitung agar onAllLoaded terpanggil
      img.onerror = onComplete;
      return img;
    });

    const onAllLoaded = () => {
      // Render frame pertama dipastikan tampil
      drawFrame(0);

      setTimeout(() => {
        if (screenEl) screenEl.classList.add("done");

        // ✅ FIX 2: SATU gsap.context tunggal yang disimpan di ref
        // Semua animasi masuk ke dalam context ini
        const gCtx = gsap.context(() => {

          // ── Set initial states via GSAP (bukan CSS) ──
          // ✅ FIX 3: Gunakan fromTo bukan gsap.to agar start state eksplisit
          const words = titleRef.current?.querySelectorAll<HTMLElement>(".hero-title-word");
          if (words?.length) {
            // Set awal dulu sebelum animate
            gsap.set(words, { y: "110%", opacity: 1 });
            gsap.to(words, {
              y: "0%",
              duration: 1.1,
              stagger: 0.14,
              ease: "power3.out",
              delay: 0.4,
            });
          }

          // ── Eyebrow: character-by-character typewriter ──
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
              // Stagger typewriter manual agar tidak perlu gsap.to pada NodeList
              setTimeout(() => { s.style.opacity = "1"; }, 300 + idx * 45);
            });
          }

          // ── Subtitle ──
          if (subtitleRef.current) {
            gsap.set(subtitleRef.current, { opacity: 0, y: 16 });
            gsap.to(subtitleRef.current, {
              opacity: 1, y: 0,
              duration: 1.0, ease: "power3.out", delay: 1.1,
            });
          }

          // ── FRAME SEQUENCE: kunci utama — 240 frame digerakkan scroll ──
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

          // ── 3D frame tilt on scroll ──
          if (frameRef.current) {
            gsap.fromTo(frameRef.current,
              { rotateX: 0, rotateY: 0, rotateZ: 0 },
              {
                rotateX: 5, rotateY: -4, rotateZ: 0.8,
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top top",
                  end: "35% bottom",
                  scrub: 1.5,
                },
              }
            );
          }

          // ── Title parallax fade out ──
          if (titleRef.current) {
            gsap.to(titleRef.current, {
              y: -200, opacity: 0,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "8% top",
                end: "25% top",
                scrub: 1,
              },
            });
          }

          // ── Eyebrow fade out ──
          if (eyebrowRef.current) {
            gsap.to(eyebrowRef.current, {
              opacity: 0, y: -30,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "5% top",
                end: "18% top",
                scrub: 1,
              },
            });
          }

          // ── Scroll hint fade ──
          if (scrollHintRef.current) {
            gsap.to(scrollHintRef.current, {
              opacity: 0, y: 10,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "3% top",
                end: "7% top",
                scrub: 1,
              },
            });
          }

          // ── Canvas subtle zoom ──
          gsap.fromTo(canvas,
            { scale: 1.0 },
            {
              scale: 1.08,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 2,
              },
            }
          );

          // ── Corner flash pada boundary sequence ──
          const corners = frameRef.current?.querySelectorAll<HTMLElement>(".hero-corner");
          const accents = frameRef.current?.querySelectorAll<HTMLElement>(".hero-corner-accent");

          if (corners?.length) {
            gsap.to(corners, {
              opacity: 0.85, duration: 0.2,
              yoyo: true, repeat: 5, ease: "power1.inOut",
              delay: 0.2,
            });
          }

        }, sectionRef);

        // ✅ FIX 4: Simpan context di ref agar cleanup benar
        gsapCtxRef.current = gCtx;

        // ✅ FIX 5: ScrollTrigger.refresh() setelah semua trigger setup
        // Delay kecil untuk pastikan Lenis sudah siap
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);

      }, 600);
    };

    setSize();
    window.addEventListener("resize", () => {
      setSize();
      ScrollTrigger.refresh();
    });

    // ✅ FIX 6: Cleanup yang benar — revert SEMUA gsap animations
    return () => {
      window.removeEventListener("resize", setSize);
      gsapCtxRef.current?.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="hero">
      <div className="hero-sticky">

        {/* Canvas */}
        <div className="hero-canvas-wrap">
          <canvas ref={canvasRef} className="hero-canvas" />
        </div>

        {/* Vignette */}
        <div className="hero-vignette" />

        {/* 3D Frame border */}
        <div ref={frameRef} className="hero-frame">
          <div className="hero-frame-line top" />
          <div className="hero-frame-line bottom" />
          <div className="hero-frame-line left" />
          <div className="hero-frame-line right" />
          <div className="hero-corner tl" />
          <div className="hero-corner tr" />
          <div className="hero-corner bl" />
          <div className="hero-corner br" />
          <div className="hero-corner-accent h" style={{ left: 0 }} />
          <div className="hero-corner-accent v" style={{ top: 0, left: 0 }} />
        </div>

        {/* Info tags */}
        <div className="hero-tag top-left">Canon AE-1 Program · 35mm</div>
        <div className="hero-tag top-right">
          Analog · Film Photography<br />Padang, West Sumatra
        </div>

        {/* Title */}
        <div className="hero-text-overlay">
          <div ref={eyebrowRef} className="hero-eyebrow" />

          <div ref={titleRef}>
            <h1 className="hero-title">
              <span className="hero-title-line">
                <span className="hero-title-word">Through</span>
              </span>
              <span className="hero-title-line">
                <span className="hero-title-word"><em>The</em></span>
              </span>
              <span className="hero-title-line">
                <span className="hero-title-word">Lens</span>
              </span>
            </h1>
          </div>

          <p ref={subtitleRef} className="hero-subtitle">
            Analog · Storytelling · West Sumatra
          </p>
        </div>

        {/* Frame counter */}
        <div ref={counterRef} className="frame-counter">001 / 240</div>

        {/* Scroll hint */}
        <div ref={scrollHintRef} className="hero-scroll-hint">
          <span className="scroll-label">Scroll</span>
          <div className="scroll-line" />
        </div>

      </div>
    </section>
  );
}
