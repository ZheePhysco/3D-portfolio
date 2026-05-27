"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GEAR = [
  "Canon AE-1 Program — 35mm SLR",
  "Leica M6 TTL — Rangefinder",
  "Kodak Portra 400 / Gold 200",
  "Ilford HP5 Plus — B&W 400",
  "Fujinon 35mm f/1.4",
];
const STATS = [
  { value: 340, label: "Rolls Shot" },
  { value: 7,   label: "Years Active" },
  { value: 50,  label: "Projects" },
];
const BIO_LINES = [
  "Seorang fotografer berbasis di Padang, West Sumatra.",
  "Berfokus pada fotografi analog dan street photography —",
  "mencari keindahan dalam hal-hal yang sering terlewatkan.",
  "Setiap frame adalah sebuah keputusan. Setiap shutter",
  "adalah sebuah cerita yang tak bisa diulang.",
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const photoRef   = useRef<HTMLDivElement>(null);
  const shadowRef  = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bioRef     = useRef<HTMLDivElement>(null);
  const gearRef    = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const labelRef   = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── BG text: slow horizontal drift ──
      gsap.to(bgRef.current, {
        x: -200, scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5,
        },
      });

      // ── PHOTO: dramatic 3D entrance from left + below ──
      gsap.fromTo(photoRef.current,
        { rotateY: -42, rotateX: 18, x: -120, opacity: 0, scale: 0.88 },
        {
          rotateY: -14, rotateX: 6, x: 0, opacity: 1, scale: 1,
          duration: 2.0, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── PHOTO: subtle continuous tilt on scroll ──
      gsap.to(photoRef.current, {
        rotateY: -4, rotateX: 2, rotateZ: -1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 3,
        },
      });

      // ── SHADOW: moves opposite to photo ──
      gsap.to(shadowRef.current, {
        x: 60, y: 50, scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 3,
        },
      });

      // ── TEXT COLUMN: entire column drifts up (parallax) ──
      gsap.fromTo(textColRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.4, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        }
      );
      gsap.to(textColRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });

      // ── SECTION LABEL ──
      gsap.fromTo(labelRef.current,
        { x: -28, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── HEADING: word-by-word 3D flip (same as hero) ──
      const words = headingRef.current?.querySelectorAll<HTMLElement>(".word");
      if (words?.length) {
        gsap.set(words, {
          y: "110%", rotateX: -75, opacity: 1,
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
        });
        gsap.to(words, {
          y: "0%", rotateX: 0,
          duration: 1.1, stagger: 0.1, ease: "power4.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── BIO: lines slide in, clip-path reveal ──
      const lines = bioRef.current?.querySelectorAll<HTMLElement>(".line-reveal");
      if (lines?.length) {
        gsap.set(lines, { y: "100%", opacity: 1 });
        gsap.to(lines, {
          y: "0%",
          duration: 0.9, stagger: 0.08, ease: "power3.out",
          scrollTrigger: {
            trigger: bioRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── GEAR: items slide in from left with stagger ──
      const gearItems = gearRef.current?.querySelectorAll<HTMLElement>(".gear-item");
      if (gearItems?.length) {
        gsap.fromTo(gearItems,
          { x: -52, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 0.75, stagger: 0.075, ease: "power3.out",
            scrollTrigger: {
              trigger: gearRef.current,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── STATS counter: count up on reveal ──
      STATS.forEach((stat, i) => {
        const el = statsRef.current?.children[i]?.querySelector(".stat-number");
        if (!el) return;
        const obj = { val: 0 };
        gsap.fromTo(obj, { val: 0 }, {
          val: stat.value, duration: 2.6, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(obj.val) + "+"; },
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 84%",
            toggleActions: "play none none reset",
          },
        });
      });

    }, sectionRef);

    // ── Mousemove 3D tilt on photo (outside gsap.context for proper cleanup) ──
    const frame = photoRef.current;
    const handleMove = (e: MouseEvent) => {
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
      gsap.to(frame, {
        rotateY: -14 + dx * 14,
        rotateX:   6 - dy * 10,
        rotateZ: dx * -1.5,
        duration: 0.6, ease: "power2.out", overwrite: "auto",
      });
      if (shadowRef.current) {
        gsap.to(shadowRef.current, {
          x: dx * 24, y: dy * 16 + 36,
          duration: 0.8, ease: "power2.out", overwrite: "auto",
        });
      }
    };
    const handleLeave = () => {
      if (!frame) return;
      gsap.to(frame, {
        rotateY: -14, rotateX: 6, rotateZ: 0,
        duration: 1.4, ease: "power3.out", overwrite: "auto",
      });
      if (shadowRef.current) {
        gsap.to(shadowRef.current, {
          x: 36, y: 36,
          duration: 1.4, ease: "power3.out", overwrite: "auto",
        });
      }
    };

    frame?.addEventListener("mousemove", handleMove);
    frame?.addEventListener("mouseleave", handleLeave);

    return () => {
      ctx.revert();
      frame?.removeEventListener("mousemove", handleMove);
      frame?.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} id="about">
      <div className="about-noise" />
      <div className="about-scan-line" />

      {/* Slow drifting BG text */}
      <div ref={bgRef} className="about-bg-text">Fotografer</div>

      <div className="about-inner">

        {/* ── PHOTO COLUMN ── */}
        <div className="about-photo-wrap">
          <div
            ref={photoRef}
            className="about-photo-frame"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div ref={shadowRef} className="about-photo-shadow" />

            {/* Tape decoration */}
            <div className="photo-tape top" />
            <div className="photo-tape bottom" />

            <Image
              src="/photos/portrait/picture-01.png"
              alt="Photographer — analog portrait"
              width={941}
              height={1672}
              style={{ width: "100%", height: "auto" }}
              priority
            />

            {/* Circular film stamp */}
            <div className="photo-stamp">
              <span>35mm<br />Film<br />2024</span>
            </div>
          </div>
        </div>

        {/* ── TEXT COLUMN ── */}
        <div ref={textColRef} className="about-text">

          <div ref={labelRef} className="section-label" style={{ marginBottom: "44px" }}>
            <span className="label-number">02</span>
            <span className="label-divider">—</span>
            <span className="label-text">About</span>
          </div>

          <h2
            ref={headingRef}
            className="about-heading"
            style={{ perspective: "1200px", marginBottom: "28px" }}
          >
            <span className="word-wrap" style={{ display: "block" }}>
              <span className="word">I</span>&thinsp;
              <span className="word">capture</span>
            </span>
            <span className="word-wrap" style={{ display: "block" }}>
              <em className="word" style={{ fontStyle: "italic", color: "var(--accent)" }}>moments</em>
            </span>
            <span className="word-wrap" style={{ display: "block" }}>
              <span className="word">in</span>&thinsp;
              <span className="word">silver</span>&thinsp;
              <span className="word">grain</span>
            </span>
          </h2>

          <div ref={bioRef} className="about-bio">
            {BIO_LINES.map((line, i) => (
              <span key={i} className="line-reveal-wrap">
                <span className="line-reveal">{line}</span>
              </span>
            ))}
          </div>

          <div ref={gearRef} className="about-gear">
            {GEAR.map((g, i) => (
              <div key={i} className="gear-item">{g}</div>
            ))}
          </div>

          <div ref={statsRef} className="about-stats">
            {STATS.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-number">0+</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
