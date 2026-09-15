(() => {
  "use strict";
  const API = "https://catalogo.assistenciasimplificada.site";
  const catalogNode = document.querySelector("#catalog");
  const detailNode = document.querySelector("#detail");
  const statusNode = document.querySelector("#status");
  const searchNode = document.querySelector("#search");
  const kindNode = document.querySelector("#kind");
  const sortNode = document.querySelector("#sort");
  const bestSellerNode = document.querySelector("#best-seller");
  let catalog = null;
  const money = value => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(Number(value || 0) / 100);
  const salePrice = item => Number(item.discountPriceCents || item.priceCents);
  const priceHtml = item => item.discountPriceCents ? `<small class="previous-price">${money(item.priceCents)}</small><div class="price">${money(item.discountPriceCents)}</div>` : `<div class="price">${money(item.priceCents)}</div>`;
  const esc = value => String(value || "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const imageUrl = value => `${API}${String(value || "").startsWith("/") ? value : `/${value}`}`;
  const rgb = hex => [1,3,5].map(index => Number.parseInt(hex.slice(index,index + 2),16));
  const shade = (hex, factor) => `#${rgb(hex).map(value => Math.round(value * factor).toString(16).padStart(2,"0")).join("")}`;
  function applyStoreBranding() {
    const primary = /^#[0-9a-f]{6}$/i.test(catalog.primaryColor || "") ? catalog.primaryColor : "#E1BD00";
    const [red,green,blue] = rgb(primary).map(value => value / 255);
    const luminance = .2126 * red + .7152 * green + .0722 * blue;
    const accent = luminance > .42 ? shade(primary,.52) : primary;
    const root = document.documentElement.style;
    root.setProperty("--store-primary",primary); root.setProperty("--store-contrast",luminance > .48 ? "#111418" : "#ffffff"); root.setProperty("--blue",accent); root.setProperty("--blue-dark",shade(accent,.72));
    const logo = document.querySelector("#store-logo");
    logo.src = catalog.logoUrl ? imageUrl(catalog.logoUrl) : "/favicon.svg"; logo.alt = `Logo de ${catalog.storeName}`; logo.onerror = () => { logo.onerror = null; logo.src = "/favicon.svg"; };
    document.querySelector('meta[name="theme-color"]').content = primary;
  }
  const card = item => `<article class="card ${item.featured ? "featured" : ""}" data-code="${esc(item.code)}" tabindex="0"><div class="picture"><img loading="lazy" src="${imageUrl(item.imageUrls[0])}" alt="${esc(item.title)}"></div><div class="content"><div class="tags"><span>${esc(item.purchaseKind)}</span>${item.storage ? `<span>${esc(item.storage)}</span>` : ""}${item.discountPriceCents ? `<span>Oferta</span>` : ""}${Number(item.salesCount || 0) > 0 ? `<span>${item.salesCount} venda${item.salesCount === 1 ? "" : "s"}</span>` : ""}</div><h2>${esc(item.title)}</h2><p>${esc([item.color,item.condition].filter(Boolean).join(" • "))}</p>${priceHtml(item)}<small class="cash-label">Valor anunciado pela loja</small></div></article>`;
  function renderBestSeller() {
    const item = [...catalog.items].sort((a,b) => Number(b.salesCount || 0)-Number(a.salesCount || 0) || Number(b.featured)-Number(a.featured))[0];
    if (!item) { bestSellerNode.hidden = true; return; }
    const hasSales = Number(item.salesCount || 0) > 0;
    bestSellerNode.hidden = false;
    bestSellerNode.innerHTML = `<div class="best-thumb"><img src="${imageUrl(item.imageUrls[0])}" alt=""></div><div class="best-copy"><small>${hasSales ? "MAIS VENDIDO DA LOJA" : "DESTAQUE DA LOJA"}</small><strong>${esc(item.title)}</strong><span>${esc([item.purchaseKind,item.storage,item.color].filter(Boolean).join(" • "))}</span></div><div class="best-price"><small>A partir de</small><strong>${money(salePrice(item))}</strong></div><button type="button" data-code="${esc(item.code)}">Ver aparelho</button>`;
    bestSellerNode.querySelector("button").addEventListener("click", () => { location.hash = `${catalog.storeCode}/${item.code}`; render(); });
  }
  const bindCards = () => document.querySelectorAll(".card").forEach(node => {
    const open = () => { location.hash = `${catalog.storeCode}/${node.dataset.code}`; render(); };
    node.addEventListener("click", open); node.addEventListener("keydown", event => { if (event.key === "Enter") open(); });
  });
  function filtered() {
    const query = searchNode.value.trim().toLocaleLowerCase("pt-BR");
    const items = catalog.items.filter(item => (!kindNode.value || item.purchaseKind === kindNode.value) && (!query || [item.title,item.brand,item.model,item.storage,item.color].join(" ").toLocaleLowerCase("pt-BR").includes(query)));
    return items.sort((a,b) => sortNode.value === "lowest" ? salePrice(a)-salePrice(b) : sortNode.value === "highest" ? salePrice(b)-salePrice(a) : sortNode.value === "recent" ? b.updatedAt.localeCompare(a.updatedAt) : Number(b.salesCount || 0)-Number(a.salesCount || 0) || Number(b.featured)-Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
  }
  function renderList() {
    detailNode.hidden = true; document.body.classList.remove("detail-open"); catalogNode.hidden = false; bestSellerNode.hidden = !catalog.items.length; document.querySelector(".toolbar").hidden = false;
    const items = filtered(); statusNode.textContent = `${items.length} aparelho${items.length === 1 ? "" : "s"} disponível${items.length === 1 ? "" : "is"}`;
    catalogNode.innerHTML = items.length ? items.map(card).join("") : '<div class="empty"><h2>Nenhum aparelho encontrado</h2><p>Tente outra busca ou fale com a loja.</p></div>';
    bindCards();
  }
  function closeDetail() {
    location.hash = catalog.storeCode;
  }
  function renderDetail(item) {
    detailNode.hidden = false; document.body.classList.add("detail-open");
    const phone = String(catalog.storePhone || "").replace(/\D/g, "");
    const wa = phone ? `https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(`Olá! Tenho interesse no ${item.title} anunciado por ${money(salePrice(item))}.`)}` : "";
    const facts = [["Condição",item.purchaseKind],["Armazenamento",item.storage],["Cor",item.color],["Garantia",item.warranty],["Bateria",item.batteryHealth],["Memória RAM",item.ram]].filter(([,value]) => value);
    detailNode.innerHTML = `<div class="detail-shell" role="document"><button class="detail-close" type="button" aria-label="Fechar detalhes">×</button><div class="detail-layout"><div class="picture"><img src="${imageUrl(item.imageUrls[0])}" alt="${esc(item.title)}"></div><div><div class="tags"><span>${esc(item.purchaseKind)}</span>${item.featured ? '<span>Destaque</span>' : ""}${item.discountPriceCents ? '<span>Oferta</span>' : ""}${Number(item.salesCount || 0) > 0 ? `<span>${item.salesCount} venda${item.salesCount === 1 ? "" : "s"}</span>` : ""}</div><h1>${esc(item.title)}</h1><div class="detail-pricebox"><small>Valor anunciado</small>${priceHtml(item)}<span>Consulte as condições de pagamento com a loja</span></div><p class="description">${esc(item.description || "Consulte a loja para mais informações.")}</p><div class="facts">${facts.map(([label,value]) => `<div><small>${label}</small><strong>${esc(value)}</strong></div>`).join("")}</div>${wa ? `<a class="contact" href="${wa}" target="_blank" rel="noopener">Tenho interesse pelo WhatsApp</a>` : ""}</div></div></div>`;
    detailNode.setAttribute("role", "dialog"); detailNode.setAttribute("aria-modal", "true"); detailNode.setAttribute("aria-label", `Detalhes de ${item.title}`);
    const closeButton = detailNode.querySelector(".detail-close");
    closeButton.addEventListener("click", closeDetail); closeButton.focus();
  }
  function render() {
    if (!catalog) return;
    const [, itemCode] = location.hash.slice(1).split("/");
    const item = itemCode && catalog.items.find(entry => entry.code === itemCode);
    renderList();
    if (item) renderDetail(item);
  }
  async function load() {
    const [storeCode] = location.hash.slice(1).split("/");
    if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode || "")) throw new Error("link_invalid");
    const response = await fetch(`${API}/public/${encodeURIComponent(storeCode)}`);
    const body = await response.json();
    if (!response.ok || !body.catalog) throw new Error("not_found");
    catalog = body.catalog; applyStoreBranding(); document.querySelector("#store-name").textContent = catalog.storeName; document.querySelector("#total-items").textContent = catalog.items.length; document.querySelector("#new-items").textContent = catalog.items.filter(item => item.purchaseKind === "Novo").length; document.querySelector("#used-items").textContent = catalog.items.filter(item => item.purchaseKind === "Usado").length; document.title = `Aparelhos • ${catalog.storeName}`; renderBestSeller(); render();
  }
  searchNode.addEventListener("input", renderList); kindNode.addEventListener("change", renderList); sortNode.addEventListener("change", renderList); window.addEventListener("hashchange", render);
  detailNode.addEventListener("click", event => { if (event.target === detailNode) closeDetail(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !detailNode.hidden) closeDetail(); });
  document.querySelector("#share").addEventListener("click", async () => { try { if (navigator.share) await navigator.share({ title:document.title, url:location.href }); else await navigator.clipboard.writeText(location.href); } catch {} });
  load().catch(error => { statusNode.textContent = error.message === "link_invalid" ? "Este endereço de vitrine está incompleto." : "Esta vitrine não está disponível no momento."; catalogNode.innerHTML = '<div class="empty"><h2>Vitrine indisponível</h2><p>Peça à loja um novo endereço.</p></div>'; });
})();
