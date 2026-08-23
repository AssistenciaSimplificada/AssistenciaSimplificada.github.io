"use client";

import Image from "next/image";
import { SiteLink as Link } from "./site-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { assetPath, PRODUCT } from "../../lib/site-data";

const links = [
  ["/", "Início"],
  ["/recursos", "Recursos"],
  ["/guia", "Guia"],
  ["/planos", "Planos"],
  ["/faq", "FAQ"],
];

export function SiteHeader() {
  const pathname = usePathname();
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);
  return (
    <header className="site-header sticky-top">
      <nav className="navbar navbar-expand-lg" aria-label="Navegação principal">
        <div className="container" ref={menuRef}>
          <Link className="navbar-brand d-flex align-items-center gap-2" href="/" onClick={() => setOpen(false)}>
            <Image src={assetPath("/assets/branding/icon-192.png")} width={42} height={42} alt="" />
            <span><strong>Orçamentos</strong><small>Simplificados</small></span>
          </Link>
          <button ref={toggleRef} className="navbar-toggler" type="button" aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((value) => !value)}>
            <i className={open ? "bi bi-x-lg" : "bi bi-list"} />
          </button>
          <div id="site-menu" className={`navbar-collapse ${open ? "is-open" : ""}`} aria-hidden={!open ? undefined : false}>
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              {links.map(([href, label]) => <Link key={href} className={`nav-link ${normalizedPathname === href ? "active" : ""}`} href={href} aria-current={normalizedPathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
              <a className="btn btn-trial ms-lg-3" href={PRODUCT.trialLink} onClick={() => setOpen(false)}><i className="bi bi-clock" /> Teste grátis</a>
              <Link className="btn btn-primary" href={PRODUCT.purchaseLink} onClick={() => setOpen(false)}>Ver planos</Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
