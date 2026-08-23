"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { visualGallery } from "../../lib/site-data";
import { ImageLightbox } from "./image-lightbox";

export function MediaGallery() {
  const [selected, setSelected] = useState<(typeof visualGallery)[number] | null>(null);
  const close = useCallback(() => setSelected(null), []);
  return <>
    <div className="row g-4 document-gallery">
      {visualGallery.map((doc) => <div className="col-sm-6 col-lg-4" key={doc.src}><button type="button" className="document-card" onClick={() => setSelected(doc)} aria-label={`Ampliar ${doc.title}`}><span className="document-preview"><Image src={doc.src} width={1200} height={900} alt={`Prévia: ${doc.title}`} /></span><span className="document-copy"><strong>{doc.title}</strong><small>{doc.caption}</small><em><i className="bi bi-arrows-fullscreen" /> Ampliar prévia</em></span></button></div>)}
    </div>
    <ImageLightbox image={selected ? { src: selected.src, title: selected.title, description: selected.caption } : null} onClose={close} />
  </>;
}
