"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./icon";

export default function VehicleImage({ src, alt, sampleId, ...props }) {
  const element = useRef(null);
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const fallback = ["bmw", "mercedes", "audi"].includes(sampleId) ? `/site-media/assets/${sampleId}.jpg` : "";
  const image = failed || !src ? (!fallbackFailed && fallback) : src;
  useEffect(() => {
    if (element.current?.complete && !element.current.naturalWidth) {
      if (failed || !src) setFallbackFailed(true); else setFailed(true);
    }
  }, [src, failed, image]);
  return image ? <img ref={element} {...props} src={image} alt={alt} onError={() => failed || !src ? setFallbackFailed(true) : setFailed(true)} /> : <div className="p-photo-unavailable" role="img" aria-label={`${alt}: photo unavailable`}><Icon name="car" size={42} /><span>Photo unavailable</span></div>;
}
