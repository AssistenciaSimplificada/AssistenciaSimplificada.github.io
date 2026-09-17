"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const automaticNodes = Array.from(document.querySelectorAll<HTMLElement>(
      ".as-secondary-page .guide-article, .as-secondary-page .faq-list details, .as-secondary-page .pricing-card, .as-secondary-page .resource-detail",
    ));
    automaticNodes.forEach((node, index) => {
      node.classList.add("motion-auto");
      node.style.setProperty("--motion-auto-delay", `${(index % 4) * 65}ms`);
    });
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-motion], [data-reveal], .motion-auto"));
    document.documentElement.classList.add("motion-ready");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return () => document.documentElement.classList.remove("motion-ready");
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      automaticNodes.forEach((node) => node.classList.remove("motion-auto", "is-visible"));
      document.documentElement.classList.remove("motion-ready");
    };
  }, [pathname]);
  return null;
}
