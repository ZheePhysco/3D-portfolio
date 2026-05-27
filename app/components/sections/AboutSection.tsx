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

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Background text drift ──
      gsap.to(bgRef.current, {
        x: -180,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });

      // ── Photo 3D entrance ──
      gsap.fromTo(
        photoRef.current,
        { rotateY: -30, rotateX: 12, x: -80, opacity: 0 },
        {
          rotateY: -8, rotateX: 3, x: 0, opacity: 1,
          duration: 1.8, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Photo: drift on scroll ──
      gsap.to(photoRef.current, {
        rotateY: 4, rotateX: -2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5,
        },
      });

      // ── Shadow shifts ──
      gsap.to(shadowRef.current, {
        x: 50, y: 40,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5,
        },
      });

      // ── Section label ──
      gsap.fromTo(
        labelRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 68%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ── Heading: word-by-word clip-path reveal ──
      const words = headingRef.current?.querySelectorAll<HTMLElement>(".word");
      if (words?.length) {
        gsap.set(words, { y: "105%", opacity: 1 });
        gsap.to(words, {
          y: "0%",
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── Bio: line-by-line reveal ──
      const lines = bioRef.current?.querySelectorAll<HTMLElement>(".line-reveal");
      if (lines?.length) {
        gsap.set(lines, { y: "100%", opacity: 1 });
        gsap.to(lines, {
          y: "0%",
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bioRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ── Gear: stagger from left ──
      const gearItems = gearRef.current?.querySelectorAll<HTMLElement>(".gear-item");
      if (gearItems?.length) {
        gsap.fromTo(
          gearItems,
          { x: -40, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gearRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── Stats counter ──
      STATS.forEach((stat, i) => {
        const el = statsRef.current?.children[i]?.querySelector(".stat-number");
        if (!el) return;
        const obj = { val: 0 };
        gsap.fromTo(
          obj, { val: 0 },
          {
            val: stat.value,
            duration: 2.4,
            ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.val) + "+"; },
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 82%",
              toggleActions: "play none none reset",
            },
          }
        );
      });

    }, sectionRef);

    // ✅ Mousemove tilt di luar gsap.context agar cleanup-nya terikat ke useEffect
    const frame = photoRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
      gsap.to(frame, {
        rotateY: -8 + dx * 10,
        rotateX:  3 - dy *  8,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const handleMouseLeave = () => {
      if (!frame) return;
      gsap.to(frame, {
        rotateY: -8, rotateX: 3,
        duration: 1.0, ease: "power3.out", overwrite: "auto",
      });
    };

    frame?.addEventListener("mousemove", handleMouseMove);
    frame?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ctx.revert();
      frame?.removeEventListener("mousemove", handleMouseMove);
      frame?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} id="about">
      <div className="about-noise" />
      <div ref={bgRef} className="about-bg-text">Fotografer</div>

      <div className="about-inner">

        {/* Photo column */}
        <div className="about-photo-wrap">
          <div
            ref={photoRef}
            className="about-photo-frame"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div ref={shadowRef} className="about-photo-shadow" />
            <div className="photo-film-border" />
            <div className="photo-tape top" />
            <div className="photo-tape bottom" />
            <Image
              src="/photos/portrait/picture-01.png"
              alt="Photographer — analog portrait"
              width={600}
              height={800}
              style={{ width: "100%", height: "auto" }}
              priority
            />
            <div className="photo-stamp">
              <span>35mm<br />Film<br />2024</span>
            </div>
          </div>
        </div>

        {/* Text column */}
        <div className="about-text">
          <div ref={labelRef} className="section-label" style={{ marginBottom: "52px" }}>
            <span className="label-number">02</span>
            <span className="label-divider">—</span>
            <span className="label-text">About</span>
          </div>

          <h2 ref={headingRef} className="about-heading">
            <span className="word-wrap">
              <span className="word">I</span>&nbsp;
              <span className="word">capture</span>
            </span>
            <br />
            <span className="word-wrap">
              <em className="word" style={{ fontStyle: "italic", color: "var(--accent)" }}>moments</em>
            </span>
            <br />
            <span className="word-wrap">
              <span className="word">in</span>&nbsp;
              <span className="word">silver</span>&nbsp;
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
                <div className="stat-number" data-value={s.value}>0+</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
