"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/app/lib/gsap";
import { getLenis } from "./useLenis";

export function useSyncLenisScrollTrigger() {
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);
}

export function useScrollReveal(
  selector: string,
  options?: {
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    start?: string;
  }
) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          y: options?.y ?? 60,
          opacity: options?.opacity ?? 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: options?.duration ?? 1,
          stagger: options?.stagger ?? 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: elements[0],
            start: options?.start ?? "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [selector, options]);
}
