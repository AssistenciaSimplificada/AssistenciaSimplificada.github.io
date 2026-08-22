"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { visualGallery } from "../../lib/site-data";

export function MediaGallery() {
  const [selected, setSelected] = useState<(typeof visualGallery)[number] | null>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return <>
    <div className="row g-4 document-gallery">
      {visualGallery.map((doc) => <div className="col-sm-6 col-lg-4" key={doc.src}><button className="document-card" onClick={() => setSelected(doc)} aria-label={`Ampliar ${doc.title}`}><span className="document-preview"><Image src={doc.src} width={1200} height={900} alt={`Prévia real: ${doc.title}`} /></span><span className="document-copy"><strong>{doc.title}</strong><small>{doc.caption}</small><em><i className="bi bi-arrows-fullscreen" /> Ampliar prévia</em></span></button></div>)}
    </div>
    {selected && <div className="lightbox" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}><div className="lightbox-panel" onClick={(event) => event.stopPropagation()}><button className="lightbox-close" aria-label="Fechar" onClick={() => setSelected(null)}><i className="bi bi-x-lg" /></button><div className="lightbox-image"><Image src={selected.src} width={1100} height={1550} alt={selected.title} /></div><div className="lightbox-caption"><strong>{selected.title}</strong><p>{selected.caption}</p></div></div></div>}
  </>;
}
