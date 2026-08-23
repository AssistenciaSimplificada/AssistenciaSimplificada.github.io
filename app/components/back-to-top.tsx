"use client";
export function BackToTop() { return <button type="button" className="back-to-top" aria-label="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><i className="bi bi-arrow-up" /></button>; }
