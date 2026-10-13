"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const video = useRef(null);
  const [loaded, setLoaded] = useState(false);

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
        poster="/site-media/assets/optimized/bmw-900-24d7056e377e.webp"
        onLoadedData={() => setLoaded(true)}
        className={loaded ? "is-loaded" : ""}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-label="Driving showroom film"
      >
        <source src="/site-media/video/hero-video.MP4" type="video/mp4" />
      </video>
    </div>
  );
}
