"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

type LightboxImage = {
  src: string;
  title: string;
  description: string;
};

export function ImageLightbox({ image, onClose }: { image: LightboxImage | null; onClose: () => void }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!image) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="lightbox" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="lightbox-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <button ref={closeRef} type="button" className="lightbox-close" aria-label="Fechar imagem" onClick={onClose}><i className="bi bi-x-lg" /></button>
        <div className="lightbox-image"><Image src={image.src} width={1400} height={1000} alt={image.title} /></div>
        <div className="lightbox-caption"><strong id={titleId}>{image.title}</strong><p id={descriptionId}>{image.description}</p></div>
      </div>
    </div>
  );
}
