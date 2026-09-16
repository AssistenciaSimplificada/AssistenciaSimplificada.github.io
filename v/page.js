(() => {
  "use strict";
  const API = "https://catalogo.assistenciasimplificada.site";
  const catalogNode = document.querySelector("#catalog");
  const detailNode = document.querySelector("#detail");
  const statusNode = document.querySelector("#status");
  const searchNode = document.querySelector("#search");
  const kindNode = document.querySelector("#kind");
  const availabilityNode = document.querySelector("#availability");
  const sortNode = document.querySelector("#sort");
  const bestSellerNode = document.querySelector("#best-seller");
  let catalog = null;
  const money = value => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(Number(value || 0) / 100);
  const salePrice = item => Number(item.discountPriceCents || item.priceCents);
  const cashPrice = item => Number(item.cashDiscountBasisPoints || 0) > 0 ? Number(item.cashPriceCents || salePrice(item)) : salePrice(item);
  const percent = basisPoints => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits:2 }).format(Number(basisPoints || 0) / 100)}%`;
  const priceHtml = item => item.discountPriceCents ? `<small class="previous-price">${money(item.priceCents)}</small><div class="price">${money(item.discountPriceCents)}</div>` : `<div class="price">${money(item.priceCents)}</div>`;
  const esc = value => String(value || "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const imageUrl = value => String(value || "").startsWith("/v/") ? String(value) : `${API}${String(value || "").startsWith("/") ? value : `/${value}`}`;
  const rgb = hex => [1,3,5].map(index => Number.parseInt(hex.slice(index,index + 2),16));
  const formatCapacity = value => /^\d+$/.test(String(value || "").trim()) ? `${value} GB` : String(value || "");
  const formatBattery = value => /^\d+$/.test(String(value || "").trim()) ? `${value}%` : String(value || "");
  const displayCondition = value => value === "Usado" ? "Seminovo" : String(value || "");
  const offerPercent = item => item.discountPriceCents && Number(item.priceCents) > Number(item.discountPriceCents) ? Math.round((1 - Number(item.discountPriceCents) / Number(item.priceCents)) * 100) : 0;
  const slug = value => String(value || "aparelho").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "aparelho";
  const productRouteKey = item => `${slug(item.title)}--${String(item.code || "item").slice(-6).toLowerCase()}`;
  const availabilityLabel = item => item.availability === "order" ? "Sob encomenda" : "Pronta entrega";
  const shareContent = (title, text, url) => ({ title, text, url });
  const copyShare = async (title, text, url) => navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
  const demoCatalog = {
    storeCode: "mostruario", storeName: "Mostruário Assistência Simplificada", storePhone: "", primaryColor: "#176bb5", logoUrl: "/v/demo-logo.svg", updatedAt: new Date().toISOString(),
    items: [
      { code: "demo-iphone", title: "Apple iPhone 15", description: "Exemplo de anúncio com fotos, condição, pagamento e disponibilidade.", brand: "Apple", model: "iPhone 15", deviceType: "Celular", purchaseKind: "Novo", condition: "Novo", color: "Preto", storage: "128", ram: "6", batteryHealth: "100", warranty: "90 dias", priceCents: 399900, discountPriceCents: 379900, conditionDetails: "Exemplo de descrição do aparelho.", includedItems: "Caixa e cabo", acceptedPaymentMethods: ["Pix", "Cartão de crédito"], cashDiscountBasisPoints: 500, cashDiscountMethods: ["Pix"], cashPriceCents: 360905, paymentMachineName: "Padrão", interestFreeInstallments: 10, maxInstallments: 12, availability: "ready", orderLeadTime: "", specsUrl: "https://www.apple.com/br/iphone-15/specs/", interestInstallment: null, featured: true, salesCount: 12, imageUrls: ["/v/demo-iphone.svg"], updatedAt: "2026-09-16T12:00:00.000Z" },
      { code: "demo-samsung", title: "Samsung Galaxy A55", description: "Modelo ilustrativo para mostrar como o catálogo apresenta um aparelho.", brand: "Samsung", model: "Galaxy A55", deviceType: "Celular", purchaseKind: "Novo", condition: "Novo", color: "Azul", storage: "256", ram: "8", batteryHealth: "100", warranty: "12 meses", priceCents: 229900, discountPriceCents: null, conditionDetails: "Exemplo de descrição do aparelho.", includedItems: "Caixa, cabo e nota", acceptedPaymentMethods: ["Pix", "Dinheiro", "Cartão de crédito"], cashDiscountBasisPoints: 0, cashDiscountMethods: [], cashPriceCents: 229900, paymentMachineName: "Padrão", interestFreeInstallments: 10, maxInstallments: 12, availability: "order", orderLeadTime: "Consulte o prazo com a loja", specsUrl: "https://www.samsung.com/br/smartphones/galaxy-a/galaxy-a55-5g/", interestInstallment: null, featured: false, salesCount: 5, imageUrls: ["/v/demo-samsung.svg"], updatedAt: "2026-09-15T12:00:00.000Z" },
      { code: "demo-motorola", title: "Motorola Edge 50", description: "Mostruário de vitrine com condição, memória e forma de pagamento.", brand: "Motorola", model: "Edge 50", deviceType: "Celular", purchaseKind: "Usado", condition: "Seminovo", color: "Verde", storage: "256", ram: "8", batteryHealth: "94", warranty: "90 dias", priceCents: 189900, discountPriceCents: 174900, conditionDetails: "Exemplo de detalhes do estado.", includedItems: "Aparelho e cabo", acceptedPaymentMethods: ["Pix", "Cartão de crédito"], cashDiscountBasisPoints: 300, cashDiscountMethods: ["Pix"], cashPriceCents: 169653, paymentMachineName: "Padrão", interestFreeInstallments: 6, maxInstallments: 10, availability: "ready", orderLeadTime: "", specsUrl: "https://www.motorola.com.br/", interestInstallment: null, featured: false, salesCount: 3, imageUrls: ["/v/demo-motorola.svg"], updatedAt: "2026-09-14T12:00:00.000Z" },
    ],
  };
  const factIcons = { "Condição":"📱", "Armazenamento":"💾", "Cor":"🎨", "Garantia":"🛡️", "Bateria":"🔋", "Memória RAM":"🧠", "Itens inclusos":"📦", "Detalhes do estado":"🔎" };
  function applyStoreBranding() {
    const primary = /^#[0-9a-f]{6}$/i.test(catalog.primaryColor || "") ? catalog.primaryColor : "#E1BD00";
    const [red,green,blue] = rgb(primary).map(value => value / 255);
    const luminance = .2126 * red + .7152 * green + .0722 * blue;
    const root = document.documentElement.style;
    root.setProperty("--store-primary",primary); root.setProperty("--store-contrast",luminance > .48 ? "#111418" : "#ffffff");
    const logo = document.querySelector("#store-logo");
    logo.src = catalog.logoUrl ? imageUrl(catalog.logoUrl) : "/favicon.svg"; logo.alt = `Logo de ${catalog.storeName}`; logo.onerror = () => { logo.onerror = null; logo.src = "/favicon.svg"; };
  }
  const paymentMethods = item => (Array.isArray(item.acceptedPaymentMethods) ? item.acceptedPaymentMethods : []).join(" • ");
  const cardPaymentHtml = item => {
    const base = salePrice(item);
    const cashOffer = Number(item.cashDiscountBasisPoints || 0) > 0;
    const free = Math.max(1, Number(item.interestFreeInstallments || 1));
    return `${item.discountPriceCents || cashOffer ? `<div class="offer-heading"><small class="previous-price">${money(item.priceCents)}</small>${offerPercent(item) ? `<span class="offer-badge">-${offerPercent(item)}%</span>` : ""}</div>` : ""}<div class="price">${money(cashPrice(item))}</div>${cashOffer ? `<strong class="cash-offer">✨ ${percent(item.cashDiscountBasisPoints)} OFF no ${esc((item.cashDiscountMethods || []).join(" e ") || "pagamento à vista")}</strong>` : ""}<span class="card-price">💳 ${money(base)} no cartão</span><span class="installment-line">Até ${free}x de ${money(Math.ceil(base/free))} sem juros</span>${item.interestInstallment ? `<span class="installment-line muted">Ou ${item.interestInstallment.installments}x de ${money(item.interestInstallment.installmentCents)} com juros</span>` : ""}${paymentMethods(item) ? `<small class="payment-methods">${esc(paymentMethods(item))}</small>` : ""}`;
  };
  const card = item => `<article class="card ${item.featured ? "featured" : ""}" data-code="${esc(item.code)}" tabindex="0"><div class="picture"><img loading="lazy" src="${imageUrl(item.imageUrls[0])}" alt="${esc(item.title)}"></div><div class="content"><div class="tags"><span>📱 ${esc(displayCondition(item.purchaseKind))}</span><span class="availability-tag ${item.availability === "order" ? "order" : "ready"}">${item.availability === "order" ? "🚚" : "✓"} ${availabilityLabel(item)}</span>${item.storage ? `<span>💾 ${esc(formatCapacity(item.storage))}</span>` : ""}${item.batteryHealth ? `<span>🔋 ${esc(formatBattery(item.batteryHealth))}</span>` : ""}</div><h2>${esc(item.title)}</h2><p>${item.color ? `🎨 ${esc(item.color)}` : ""}${item.color && item.condition && item.condition !== item.purchaseKind ? " • " : ""}${item.condition && item.condition !== item.purchaseKind ? esc(item.condition) : ""}</p><div class="card-payment">${cardPaymentHtml(item)}</div></div></article>`;
  function renderBestSeller() {
    const item = [...catalog.items].sort((a,b) => Number(b.salesCount || 0)-Number(a.salesCount || 0) || Number(b.featured)-Number(a.featured))[0];
    if (!item) { bestSellerNode.hidden = true; return; }
    const hasSales = Number(item.salesCount || 0) > 0;
    bestSellerNode.hidden = false;
    bestSellerNode.innerHTML = `<div class="best-thumb"><img src="${imageUrl(item.imageUrls[0])}" alt=""></div><div class="best-copy"><small>${hasSales ? "MAIS VENDIDO DA LOJA" : "DESTAQUE DA LOJA"}</small><strong>${esc(item.title)}</strong><span>${item.availability === "order" ? "🚚" : "✓"} ${availabilityLabel(item)} • 📱 ${esc(displayCondition(item.purchaseKind))}${item.storage ? ` • 💾 ${esc(formatCapacity(item.storage))}` : ""}${item.color ? ` • 🎨 ${esc(item.color)}` : ""}</span></div><div class="best-price"><small>A partir de</small><strong>${money(cashPrice(item))}</strong></div><button type="button" data-code="${esc(item.code)}">Ver aparelho</button>`;
    bestSellerNode.querySelector("button").addEventListener("click", () => { location.hash = `${catalog.storeCode}/${productRouteKey(item)}`; render(); });
  }
  const bindCards = () => document.querySelectorAll(".card").forEach(node => {
    const open = () => { const item = catalog.items.find(entry => entry.code === node.dataset.code); if (item) location.hash = `${catalog.storeCode}/${productRouteKey(item)}`; render(); };
    node.addEventListener("click", open); node.addEventListener("keydown", event => { if (event.key === "Enter") open(); });
  });
  function filtered() {
    const query = searchNode.value.trim().toLocaleLowerCase("pt-BR");
    const items = catalog.items.filter(item => (!kindNode.value || item.purchaseKind === kindNode.value) && (!availabilityNode.value || (item.availability === "order" ? "order" : "ready") === availabilityNode.value) && (!query || [item.title,item.brand,item.model,item.storage,item.color].join(" ").toLocaleLowerCase("pt-BR").includes(query)));
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
    const wa = phone ? `https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(`Olá! Quero adquirir o aparelho ${item.title}, anunciado por ${money(cashPrice(item))}. ${item.availability === "order" ? "Qual é o prazo para encomenda?" : "Ele ainda está disponível para pronta entrega?"}`)}` : "";
    const facts = [["Condição",displayCondition(item.purchaseKind)],["Armazenamento",formatCapacity(item.storage)],["Cor",item.color],["Garantia",item.warranty],["Bateria",formatBattery(item.batteryHealth)],["Memória RAM",formatCapacity(item.ram)],["Itens inclusos",item.includedItems],["Detalhes do estado",item.conditionDetails]].filter(([,value]) => value);
    const images = (Array.isArray(item.imageUrls) ? item.imageUrls : []).filter(Boolean);
    const free = Math.max(1, Number(item.interestFreeInstallments || 1));
    const base = salePrice(item);
    const purchaseInfo = `<section class="purchase-info"><h2>Compra e disponibilidade</h2><div><span class="purchase-icon">${item.availability === "order" ? "🚚" : "✓"}</span><p><strong>${availabilityLabel(item)}</strong><small>${item.availability === "order" ? esc(item.orderLeadTime || "Consulte a loja para confirmar o prazo") : "Disponível para retirada ou envio após confirmação da loja"}</small></p></div>${item.warranty ? `<div><span class="purchase-icon">🛡️</span><p><strong>Garantia</strong><small>${esc(item.warranty)}</small></p></div>` : ""}${item.specsUrl ? `<a href="${esc(item.specsUrl)}" target="_blank" rel="noopener"><span class="purchase-icon">📋</span><p><strong>Ficha técnica oficial</strong><small>Consulte especificações completas do fabricante</small></p><b>↗</b></a>` : ""}</section>`;
    detailNode.innerHTML = `<div class="detail-shell" role="document"><button class="detail-close" type="button" aria-label="Fechar detalhes">×</button><div class="detail-layout"><div class="detail-gallery"><div class="picture zoomable"><img src="${imageUrl(images[0])}" alt="${esc(item.title)}"><span class="zoom-hint">Passe o mouse ou use dois dedos para ampliar</span><div class="zoom-controls" aria-label="Controles de zoom"><button type="button" data-zoom="out" aria-label="Diminuir foto">−</button><output aria-live="polite">100%</output><button type="button" data-zoom="in" aria-label="Ampliar foto">+</button></div></div>${images.length ? `<div class="thumbnails" role="group" aria-label="Fotos do aparelho">${images.map((source,index) => `<button type="button" class="${index === 0 ? "selected" : ""}" data-image="${esc(imageUrl(source))}" aria-label="Ver foto ${index + 1}"><img src="${imageUrl(source)}" alt=""></button>`).join("")}</div>` : ""}${purchaseInfo}</div><div class="detail-copy"><div class="tags"><span>${esc(item.purchaseKind)}</span><span class="availability-tag ${item.availability === "order" ? "order" : "ready"}">${item.availability === "order" ? "🚚" : "✓"} ${availabilityLabel(item)}</span>${item.featured ? '<span class="featured-tag">Destaque</span>' : ""}${item.discountPriceCents ? '<span>Oferta</span>' : ""}</div><h1>${esc(item.title)}</h1><div class="detail-pricebox"><small>Preço à vista</small>${item.discountPriceCents || item.cashDiscountBasisPoints ? `<small class="previous-price">${money(item.priceCents)}</small>` : ""}<div class="price">${money(cashPrice(item))}</div>${item.cashDiscountBasisPoints ? `<strong class="cash-offer">${percent(item.cashDiscountBasisPoints)} OFF no ${esc((item.cashDiscountMethods || []).join(" e ") || "pagamento à vista")}</strong>` : ""}<span>${money(base)} no cartão</span><b>Até ${free}x de ${money(Math.ceil(base/free))} sem juros</b>${item.interestInstallment ? `<span>Ou ${item.interestInstallment.installments}x de ${money(item.interestInstallment.installmentCents)} com juros</span>` : ""}</div>${paymentMethods(item) ? `<section class="payment-box"><small>FORMAS DE PAGAMENTO ACEITAS</small><div>${item.acceptedPaymentMethods.map(method => `<span>${esc(method)}</span>`).join("")}</div>${item.paymentMachineName ? `<p>Condições calculadas pela maquininha ${esc(item.paymentMachineName)}.</p>` : ""}</section>` : ""}<p class="description">${esc(item.description || "Consulte a loja para mais informações.")}</p><div class="facts">${facts.map(([label,value]) => `<div><small>${label}</small><strong>${esc(value)}</strong></div>`).join("")}</div>${wa ? `<a class="contact" href="${wa}" target="_blank" rel="noopener">Quero adquirir pelo WhatsApp</a>` : '<p class="contact-unavailable">A loja ainda não informou um WhatsApp para contato.</p>'}<button class="share-product" type="button">Compartilhar este aparelho</button></div></div></div>`;
    const detailTags = detailNode.querySelector(".detail-copy .tags");
    detailTags.querySelector("span").textContent = `📱 ${displayCondition(item.purchaseKind)}`;
    if (item.storage) detailTags.insertAdjacentHTML("beforeend", `<span>💾 ${esc(formatCapacity(item.storage))}</span>`);
    if (item.ram) detailTags.insertAdjacentHTML("beforeend", `<span>🧠 RAM ${esc(formatCapacity(item.ram))}</span>`);
    detailNode.querySelectorAll(".facts div").forEach(fact => {
      const label = fact.querySelector("small");
      const name = label.textContent;
      label.textContent = `${factIcons[name] || "ℹ️"} ${name}`;
      if (name === "Bateria" || name === "Garantia") fact.classList.add("key-fact");
    });
    const previousPrice = detailNode.querySelector(".detail-pricebox .previous-price");
    if (previousPrice && offerPercent(item)) previousPrice.insertAdjacentHTML("afterend", `<span class="offer-badge">-${offerPercent(item)}%</span>`);
    detailNode.querySelectorAll(".payment-box > div > span").forEach(method => {
      method.textContent = `${/cartão/i.test(method.textContent) ? "💳" : /dinheiro/i.test(method.textContent) ? "💵" : /pix/i.test(method.textContent) ? "⚡" : "✓"} ${method.textContent}`;
    });
    detailNode.setAttribute("role", "dialog"); detailNode.setAttribute("aria-modal", "true"); detailNode.setAttribute("aria-label", `Detalhes de ${item.title}`);
    const closeButton = detailNode.querySelector(".detail-close");
    closeButton.addEventListener("click", closeDetail); closeButton.focus();
    const mainImage = detailNode.querySelector(".detail-gallery .picture img");
    const zoom = detailNode.querySelector(".zoomable");
    const zoomOutput = zoom.querySelector("output");
    let zoomLevel = 1;
    let pinchStart = 0;
    let pinchBase = 1;
    let lastTap = 0;
    const clampZoom = value => Math.min(3, Math.max(1, value));
    const applyZoom = (value, origin) => {
      zoomLevel = clampZoom(value);
      if (origin) mainImage.style.transformOrigin = origin;
      mainImage.style.transform = `scale(${zoomLevel})`;
      zoom.classList.toggle("is-zoomed", zoomLevel > 1);
      zoomOutput.value = `${Math.round(zoomLevel * 100)}%`;
    };
    const resetZoom = () => applyZoom(1, "50% 50%");
    detailNode.querySelectorAll(".thumbnails button").forEach((button) => button.addEventListener("click", () => { mainImage.src = button.dataset.image; resetZoom(); detailNode.querySelectorAll(".thumbnails button").forEach((entry) => entry.classList.toggle("selected", entry === button)); }));
    zoom.addEventListener("mousemove", event => { const box = zoom.getBoundingClientRect(); mainImage.style.transformOrigin = `${((event.clientX-box.left)/box.width)*100}% ${((event.clientY-box.top)/box.height)*100}%`; });
    zoom.querySelector('[data-zoom="in"]').addEventListener("click", event => { event.stopPropagation(); applyZoom(zoomLevel + .5); });
    zoom.querySelector('[data-zoom="out"]').addEventListener("click", event => { event.stopPropagation(); applyZoom(zoomLevel - .5); });
    zoom.addEventListener("dblclick", () => applyZoom(zoomLevel > 1 ? 1 : 2));
    zoom.addEventListener("touchstart", event => {
      if (event.touches.length === 2) {
        pinchStart = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
        pinchBase = zoomLevel;
      } else if (event.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 320) applyZoom(zoomLevel > 1 ? 1 : 2);
        lastTap = now;
      }
    }, { passive:true });
    zoom.addEventListener("touchmove", event => {
      if (event.touches.length !== 2 || !pinchStart) return;
      event.preventDefault();
      const box = zoom.getBoundingClientRect();
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
      applyZoom(pinchBase * distance / pinchStart, `${((centerX-box.left)/box.width)*100}% ${((centerY-box.top)/box.height)*100}%`);
    }, { passive:false });
    zoom.addEventListener("touchend", event => { if (event.touches.length < 2) pinchStart = 0; });
    detailNode.querySelector(".share-product").addEventListener("click", async () => { const url = location.href; const title = `${item.title} — Vitrine ${catalog.storeName}`; const text = `Confira este aparelho na vitrine de ${catalog.storeName}.`; try { if (navigator.share) await navigator.share(shareContent(title,text,url)); else await copyShare(title,text,url); } catch {} });
  }
  function render() {
    if (!catalog) return;
    const [, itemCode] = location.hash.slice(1).split("/");
    const item = itemCode && catalog.items.find(entry => entry.code === itemCode || productRouteKey(entry) === itemCode);
    renderList();
    if (item) renderDetail(item);
  }
  async function load() {
    const [storeCode] = location.hash.slice(1).split("/");
    if (!storeCode) {
      catalog = demoCatalog;
      applyStoreBranding(); document.querySelector("#store-name").textContent = catalog.storeName; document.querySelector("#total-items").textContent = catalog.items.length; document.querySelector("#ready-items").textContent = catalog.items.filter(item => item.availability !== "order").length; document.querySelector("#order-items").textContent = catalog.items.filter(item => item.availability === "order").length; document.querySelector("#used-items").textContent = catalog.items.filter(item => item.purchaseKind === "Usado").length; document.querySelector("#status").textContent = "Mostruário demonstrativo · dados ilustrativos"; document.querySelector("#catalog-mode").hidden = false; document.querySelector("#hero-description").textContent = "Conheça a experiência da vitrine pública. Os aparelhos abaixo são exemplos e não representam estoque real."; document.title = "Mostruário de vitrine — Assistência Simplificada"; renderBestSeller(); render(); return;
    }
    if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode || "")) throw new Error("link_invalid");
    const response = await fetch(`${API}/public/${encodeURIComponent(storeCode)}`);
    const body = await response.json();
    if (!response.ok || !body.catalog) throw new Error("not_found");
    catalog = body.catalog; document.querySelector("#catalog-mode").hidden = true; document.querySelector("#hero-description").textContent = "Consulte os modelos disponíveis e chame nossa equipe para confirmar a compra."; applyStoreBranding(); document.querySelector("#store-name").textContent = catalog.storeName; document.querySelector("#total-items").textContent = catalog.items.length; document.querySelector("#ready-items").textContent = catalog.items.filter(item => item.availability !== "order").length; document.querySelector("#order-items").textContent = catalog.items.filter(item => item.availability === "order").length; document.querySelector("#used-items").textContent = catalog.items.filter(item => item.purchaseKind === "Usado").length; document.title = `Vitrine — ${catalog.storeName}`; renderBestSeller(); render();
  }
  searchNode.addEventListener("input", renderList); kindNode.addEventListener("change", renderList); availabilityNode.addEventListener("change", renderList); sortNode.addEventListener("change", renderList); window.addEventListener("hashchange", render);
  detailNode.addEventListener("click", event => { if (event.target === detailNode) closeDetail(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !detailNode.hidden) closeDetail(); });
  document.querySelector("#share").addEventListener("click", async () => { const title = `Vitrine — ${catalog?.storeName || "Loja"}`; const text = `Confira os aparelhos disponíveis na vitrine de ${catalog?.storeName || "nossa loja"}.`; try { if (navigator.share) await navigator.share(shareContent(title,text,location.href)); else await copyShare(title,text,location.href); } catch {} });
  load().catch(error => { statusNode.textContent = error.message === "link_invalid" ? "Este endereço de vitrine está incompleto." : "Esta vitrine não está disponível no momento."; catalogNode.innerHTML = '<div class="empty"><h2>Vitrine indisponível</h2><p>Peça à loja um novo endereço.</p></div>'; });
})();
