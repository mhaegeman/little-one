"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useSyncExternalStore } from "react";

const PORTRAIT_SRC = "/reel/lille-liv-portrait.mp4";
const PORTRAIT_POSTER = "/reel/lille-liv-portrait-poster.jpg";

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }
  mql.addListener(callback);
  return () => mql.removeListener(callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

export function BrandReel() {
  const t = useTranslations("marketing.reel");
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t("ariaLabel")}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-[40px] bg-canvas shadow-[0_30px_60px_rgba(31,28,22,0.18),0_6px_12px_rgba(31,28,22,0.08)]">
        {reducedMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={PORTRAIT_POSTER}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={PORTRAIT_SRC}
            poster={PORTRAIT_POSTER}
            muted
            playsInline
            loop
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
