"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { guideArticles } from "../../lib/site-data";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function GuideSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; caption: string } | null>(null);
  const categories = ["Todos", ...Array.from(new Set(guideArticles.map((article) => article.category)))];
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return guideArticles.filter((article) => (category === "Todos" || article.category === category) && (!needle || normalize(`${article.title} ${article.summary} ${article.body.join(" ")} ${(article.steps || []).join(" ")} ${(article.tips || []).join(" ")}`).includes(needle)));
  }, [query, category]);
  return <div className="guide-layout">
    <aside className="guide-sidebar">
      <label className="guide-search"><i className="bi bi-search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no guia" aria-label="Buscar no guia" /></label>
      <div className="guide-categories" aria-label="Categorias do guia">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}<span>{item === "Todos" ? guideArticles.length : guideArticles.filter((article) => article.category === item).length}</span></button>)}</div>
    </aside>
    <div className="guide-content">
      <div className="guide-result-head"><span>{filtered.length} conteúdo(s)</span>{(query || category !== "Todos") && <button onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpar filtros</button>}</div>
      {filtered.length ? filtered.map((article, index) => <article className="guide-article" id={article.id} key={article.id}><div className="guide-number">{String(index + 1).padStart(2, "0")}</div><div><span className="guide-category">{article.category}</span><h2>{article.title}</h2><p className="guide-summary">{article.summary}</p>{article.image && <button className="guide-image" onClick={() => setSelectedImage(article.image)} aria-label={`Ampliar imagem de ${article.title}`}><Image src={article.image.src} width={1200} height={800} alt={article.image.alt} /><span><i className="bi bi-arrows-fullscreen" /> {article.image.caption}</span></button>}{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{article.steps && <ol className="step-list">{article.steps.map((step) => <li key={step}><span>{step}</span></li>)}</ol>}{article.tips && <div className="tip-box"><i className="bi bi-lightbulb" /><div>{article.tips.map((tip) => <p key={tip}>{tip}</p>)}</div></div>}</div></article>) : <div className="empty-guide"><i className="bi bi-search" /><h2>Nenhum conteúdo encontrado</h2><p>Tente outra palavra ou limpe os filtros.</p></div>}
    </div>
    {selectedImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={selectedImage.alt} onClick={() => setSelectedImage(null)}><div className="lightbox-panel" onClick={(event) => event.stopPropagation()}><button className="lightbox-close" aria-label="Fechar" onClick={() => setSelectedImage(null)}><i className="bi bi-x-lg" /></button><div className="lightbox-image"><Image src={selectedImage.src} width={1400} height={1000} alt={selectedImage.alt} /></div><div className="lightbox-caption"><strong>{selectedImage.alt}</strong><p>{selectedImage.caption}</p></div></div></div>}
  </div>;
}
