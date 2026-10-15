"use client";
import { useEffect, useRef } from "react";
import { siteMedia } from "../lib/site-media";

export default function HeroVideo() {
  const video = useRef(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    // Explicitly enforce muted on DOM element for bulletproof cross-browser autoplay
    element.defaultMuted = true;
    element.muted = true;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const playVideo = () => {
      if (media.matches || navigator.connection?.saveData) {
        element.pause();
      } else {
        const promise = element.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Browser autoplay policy graceful catch
          });
        }
      }
    };

    // Attempt autoplay immediately
    playVideo();

    media.addEventListener("change", playVideo);

    // Performance optimization: automatically pause playback when scrolled out of view to save GPU/CPU
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!media.matches && !navigator.connection?.saveData) {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            element.pause();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      media.removeEventListener("change", playVideo);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="p-hero-media" aria-hidden="true">
      <video
        ref={video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="is-loaded"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-label="Driving showroom film"
      >
        <source src={siteMedia("video/hero-showroom.mp4")} type="video/mp4" />
      </video>
    </div>
  );
}
