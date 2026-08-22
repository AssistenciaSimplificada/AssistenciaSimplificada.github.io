"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PRODUCT } from "../../lib/site-data";

const links = [
  ["/", "Início"], ["/recursos", "Recursos"], ["/guia", "Guia"], ["/planos", "Planos"], ["/faq", "FAQ"],
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header sticky-top">
      <nav className="navbar navbar-expand-lg" aria-label="Navegação principal">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" href="/" onClick={() => setOpen(false)}>
            <Image src="/assets/branding/icon-192.png" width={42} height={42} alt="" />
            <span><strong>Orçamentos</strong><small>Simplificados</small></span>
          </Link>
          <button className="navbar-toggler" type="button" aria-expanded={open} aria-controls="site-menu" aria-label="Abrir menu" onClick={() => setOpen((value) => !value)}>
            <i className={open ? "bi bi-x-lg" : "bi bi-list"} />
          </button>
          <div id="site-menu" className={`navbar-collapse ${open ? "is-open" : ""}`}>
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              {links.map(([href, label]) => <Link key={href} className={`nav-link ${pathname === href ? "active" : ""}`} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
              <Link className="btn btn-primary ms-lg-3" href={PRODUCT.purchaseLink} onClick={() => setOpen(false)}>Quero adquirir</Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
