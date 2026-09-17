"use client";

import { useEffect, useState } from "react";
import { SiteLink as Link } from "./site-link";
import { CURRENT_OFFER } from "../../lib/site-data";

const SESSION_KEY = "assistencia-simplificada-offer-dismissed";

export function WelcomeOffer() {
  const [visible, setVisible] = useState(false);

  function dismiss() {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    const timer = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [visible]);

  if (!visible) return null;

  return (
    <aside className="as-welcome-offer" aria-label="Condição especial da licença anual">
      <button type="button" className="as-offer-close" aria-label="Fechar oferta" onClick={dismiss}>
        <i className="bi bi-x-lg" />
      </button>
      <span className="as-offer-icon"><i className="bi bi-stars" /></span>
      <div>
        <small>Economize no período maior</small>
        <strong>{CURRENT_OFFER.savingsPercentage}% de economia no plano anual</strong>
        <p>{CURRENT_OFFER.annualPrice} por 1 ano, comparado a 12 licenças mensais. Sem assinatura automática.</p>
      </div>
      <Link href="/planos" className="btn btn-primary" onClick={dismiss}>Ver planos <i className="bi bi-arrow-right" /></Link>
    </aside>
  );
}
