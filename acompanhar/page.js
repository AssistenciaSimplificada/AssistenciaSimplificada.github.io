(() => {
  "use strict";
  const API_URL = window.__ASSISTENCIA_CUSTOMER_CONFIG__?.apiUrl;
  if (!API_URL) throw new Error("A configuração pública não foi carregada.");
  const $ = (id) => document.getElementById(id);
  const state = { token: "", pin: "", tracking: null, timer: null, expiryTimer: null, loading: false, approving: false };
  const statusIndex = (status) =>
    status === "Aguardando técnico"
      ? 2
      : status === "Aguardando aprovação"
        ? 3
        : status === "Em manutenção"
          ? 4
          : ["Pronto para retirada", "Abandonado"].includes(status)
            ? 5
            : status === "Finalizado"
              ? 6
              : 0;
  const statusHelp = (status, detail) => {
    if (
      status === "Em manutenção" && String(detail || "")
        .toLocaleLowerCase("pt-BR")
        .includes("peça")
    ) {
      return "O atendimento está pausado enquanto a assistência aguarda a chegada das peças.";
    }
    return (
      {
        "Aguardando técnico": "O aparelho está na etapa de avaliação técnica.",
        "Aguardando aprovação":
          "A assistência aguarda a confirmação do orçamento.",
        "Em manutenção": "O serviço aprovado está sendo realizado.",
        "Pronto para retirada":
          "O aparelho está pronto. Combine a retirada com a assistência.",
        Finalizado: "Atendimento concluído e registrado.",
        Cancelado:
          "O atendimento foi cancelado. Fale com a assistência para mais informações.",
        Rejeitado: "O orçamento não foi aprovado.",
        Expirado: "A validade do orçamento terminou.",
        Abandonado: "O aparelho continua aguardando retirada.",
      }[status] || "Consulte abaixo as informações publicadas pela assistência."
    );
  };
  const money = (cents) =>
    (Number(cents) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  const date = (value) => {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime())
      ? parsed.toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";
  };
  const duration = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const days = Math.floor(total / 86400),
      hours = Math.floor((total % 86400) / 3600),
      minutes = Math.floor((total % 3600) / 60);
    return [days ? `${days}d` : "", hours ? `${hours}h` : "", `${minutes}min`]
      .filter(Boolean)
      .join(" ");
  };
  const show = (id, visible = true) => {
    $(id).hidden = !visible;
  };
  const renderBranding = (tracking) => {
    const branding = tracking?.snapshot?.storeBranding;
    const name = [branding?.name, tracking?.storeName]
      .find((value) => typeof value === "string" && value.trim())?.trim().slice(0, 160)
      || "Assistência técnica";
    $("store-name").textContent = tracking ? name : "Acompanhe seu atendimento";
    $("store").textContent = name;
    document.title = tracking ? `Acompanhar atendimento | ${name}` : "Acompanhar atendimento";
    const logo = $("store-logo");
    logo.onload = null;
    logo.onerror = null;
    show("store-logo", false);
    logo.removeAttribute("src");
    logo.alt = "";
    const dataUrl = branding?.logoDataUrl;
    if (typeof dataUrl === "string" && dataUrl.length <= 32000 &&
        /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) {
      logo.onload = () => show("store-logo");
      logo.onerror = () => { show("store-logo", false); logo.removeAttribute("src"); };
      logo.alt = `Logo da loja ${name}`;
      logo.src = dataUrl;
    }
  };
  const fail = (message, retryable = false) => {
    clearTimeout(state.expiryTimer);
    state.tracking = null;
    renderBranding(null);
    clearInterval(state.timer);
    show("loading", false);
    show("pin-form", false);
    show("tracking", false);
    show("approval-card", false);
    $("photo-gallery").replaceChildren();
    $("services").replaceChildren();
    $("timeline").replaceChildren();
    $("photo-dialog").close();
    $("photo-large").removeAttribute("src");
    $("error-text").textContent = message;
    show("retry", retryable);
    $("error-help").textContent = retryable
      ? "Seu endereço de acesso foi mantido nesta aba. Tente novamente quando a conexão voltar."
      : "Fale com a assistência se precisar de ajuda ou de uma cópia do PDF.";
    show("error");
  };
  const api = async (action = "read", decision = "") => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      body: JSON.stringify({
        action,
        token: state.token,
        pin: state.pin,
        ...(action !== "read" ? { decision } : {}),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data.message || "Não foi possível consultar o atendimento.",
      );
      error.code = data.error || "request_failed";
      error.retryable = response.status >= 500 || response.status === 429 || response.status === 408;
      throw error;
    }
    if (!data.tracking || typeof data.tracking !== "object" || !data.tracking.snapshot) {
      const error = new Error("A assistência não respondeu como esperado. Tente novamente.");
      error.retryable = true;
      throw error;
    }
    return data.tracking;
    } catch (error) {
      if (controller.signal.aborted || error instanceof TypeError) {
        const unavailable = new Error("Não foi possível conectar à assistência. Confira sua conexão e tente novamente. Isso não significa que o link expirou.");
        unavailable.retryable = true;
        throw unavailable;
      }
      throw error;
    } finally { clearTimeout(timeout); }
  };
  const renderProgress = (status) => {
    const steps = [
        "Recebido",
        "Avaliação",
        "Aprovação",
        "Manutenção",
        "Retirada",
      ],
      current = statusIndex(status);
    $("progress").replaceChildren(
      ...steps.map((label, index) => {
        const li = document.createElement("li");
        const step = index + 1;
        li.className =
          step < current ? "done" : step === current ? "current" : "";
        if (step === current) li.setAttribute("aria-current", "step");
        const icon = document.createElement("i");
        icon.textContent = step < current ? "✓" : String(step);
        const text = document.createElement("span");
        text.textContent = label;
        li.append(icon, text);
        return li;
      }),
    );
    $("progress-count").textContent = current
      ? `Etapa ${Math.min(current, 5)} de 5`
      : "Encerrado";
  };
  const render = (tracking) => {
    clearInterval(state.timer);
    clearTimeout(state.expiryTimer);
    const expiresAt = Date.parse(tracking.expiresAt);
    if (Number.isFinite(expiresAt)) {
      const checkExpiry = () => {
        const remaining = expiresAt - Date.now();
        if (remaining <= 0) {
          fail("Este link expirou. Consulte o PDF enviado pela loja para as informações do atendimento e da garantia, quando aplicável. Se precisar, solicite uma cópia à loja.");
          return false;
        }
        state.expiryTimer = setTimeout(checkExpiry, Math.min(remaining, 60000));
        return true;
      };
      if (!checkExpiry()) return;
    }
    state.tracking = tracking;
    const snapshot = tracking.snapshot || {};
    const approvalState = String(tracking.approvalState || snapshot.approvalState || "not_applicable");
    const approvalMode = snapshot.portalMode === "approval" || tracking.accessKind === "approval";
    show("approval-card", approvalMode && snapshot.status === "Aguardando aprovação");
    if (approvalMode) {
      const check = $("approval-check");
      const approve = $("approve-quote");
      const reject = $("reject-quote");
      const feedback = $("approval-feedback");
      const resolved = approvalState !== "pending";
      check.checked = false;
      check.disabled = resolved;
      approve.disabled = resolved;
      reject.disabled = resolved;
      feedback.hidden = !resolved;
      feedback.className = `approval-feedback ${approvalState === "approved" ? "success" : ""}`;
      feedback.textContent = approvalState === "approved"
        ? `Aprovação registrada em ${date(tracking.approvedAt)}. A assistência já pode iniciar o serviço.`
        : approvalState === "rejected"
          ? "Sua decisão foi registrada como não aprovado. Fale com a assistência se quiser revisar o atendimento."
          : "";
    }
    const deliveredAt = Date.parse(snapshot.deliveredAt);
    show("pickup-notice", Number.isFinite(deliveredAt));
    if (Number.isFinite(deliveredAt)) {
      $("pickup-date").textContent = `Retirada registrada em ${date(snapshot.deliveredAt)}.`;
      $("pickup-expiry").textContent = Number.isFinite(expiresAt)
        ? `Disponível até ${date(tracking.expiresAt)}.` : "";
    }
    renderBranding(tracking);
    $("number").textContent = tracking.publicNumber || "Atendimento";
    $("status").textContent = snapshot.statusDetail || snapshot.status;
    $("status-detail").textContent = snapshot.statusDetail || snapshot.status;
    $("status-help").textContent = statusHelp(
      snapshot.status,
      snapshot.statusDetail,
    );
    $("updated").textContent =
      `Atualizado em ${date(snapshot.updatedAt || tracking.updatedAt)}`;
    $("next-step").textContent = {
      "Aguardando técnico": "Próximo passo: a assistência confere a avaliação e informa o orçamento.",
      "Aguardando aprovação": "Sua ação: informe à loja se deseja aprovar o serviço.",
      "Em manutenção": "Próximo passo: aguarde a confirmação de que o aparelho está pronto.",
      "Pronto para retirada": "Sua ação: combine a retirada com a loja. A data de entrega ainda será registrada.",
      Abandonado: "Sua ação: entre em contato com a loja para combinar a retirada.",
      Finalizado: "Guarde o PDF do atendimento para consultar as informações e a garantia, quando aplicável.",
    }[snapshot.status] || "Dúvidas sobre este atendimento? Converse diretamente com a loja.";
    $("device").textContent =
      snapshot.deviceSummary || "Aparelho em atendimento";
    $("reported").textContent = snapshot.reportedDefect
      ? `Relato: ${snapshot.reportedDefect}`
      : "";
    $("deadline").textContent =
      snapshot.estimatedDeadline || "Consulte a assistência";
    const deviceDetails = snapshot.deviceDetails && typeof snapshot.deviceDetails === "object"
      ? snapshot.deviceDetails : {};
    const detailValues = [
      deviceDetails.physicalStatusLabel,
      deviceDetails.capacity,
      deviceDetails.imeiLast4,
      deviceDetails.serialLast4,
      deviceDetails.receivedAt,
      deviceDetails.accessories,
      deviceDetails.visualNotes,
    ].filter(Boolean);
    if (detailValues.length) {
      show("device-details-card");
      $("device-physical-status").textContent = deviceDetails.physicalStatusLabel || "Situação física não informada";
      const setDetail = (rowId, valueId, value, formatter = (item) => item) => {
        const present = Boolean(String(value || "").trim());
        show(rowId, present);
        if (present) $(valueId).textContent = formatter(value);
      };
      setDetail("device-capacity-detail", "device-capacity", deviceDetails.capacity);
      setDetail("device-imei-detail", "device-imei", deviceDetails.imeiLast4);
      setDetail("device-serial-detail", "device-serial", deviceDetails.serialLast4);
      setDetail("device-received-detail", "device-received", deviceDetails.receivedAt, date);
      setDetail("device-accessories", "device-accessories", deviceDetails.accessories, (value) => `Acessórios registrados: ${value}`);
      setDetail("device-visual-notes", "device-visual-notes", deviceDetails.visualNotes, (value) => `Condição registrada: ${value}`);
    } else show("device-details-card", false);
    renderProgress(snapshot.status);
    const receivingPhotos = Array.isArray(snapshot.receivingPhotos)
      ? snapshot.receivingPhotos
      : snapshot.photo?.dataUrl ? [snapshot.photo] : [];
    const deliveryPhotos = Array.isArray(snapshot.deliveryPhotos)
      ? snapshot.deliveryPhotos : [];
    const photos = [
      ...receivingPhotos.map((photo) => ({ ...photo, stage: "Recebimento" })),
      ...deliveryPhotos.map((photo) => ({ ...photo, stage: "Entrega" })),
    ].filter((photo) => typeof photo?.dataUrl === "string" && photo.dataUrl.length <= 360000 &&
      /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(photo.dataUrl)).slice(0, 8);
    if (photos.length) {
      $("photo-gallery").replaceChildren(...photos.map((photo, index) => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        const expand = document.createElement("button");
        expand.type = "button";
        expand.className = "photo-expand";
        expand.setAttribute("aria-label", `Ampliar foto ${index + 1} — ${photo.stage.toLowerCase()}`);
        const caption = document.createElement("figcaption");
        image.src = photo.dataUrl;
        image.alt = `Foto ${index + 1} do aparelho — ${photo.stage.toLowerCase()}`;
        image.loading = "lazy";
        image.decoding = "async";
        caption.textContent = `${photo.stage} · ${photo.caption || "Foto registrada pela assistência"}`;
        expand.addEventListener("click", () => {
          $("photo-large").src = photo.dataUrl;
          $("photo-large").alt = image.alt;
          $("photo-title").textContent = `${photo.stage} · foto ${index + 1}`;
          $("photo-caption").textContent = caption.textContent;
          $("photo-dialog").showModal();
        });
        expand.append(image);
        figure.append(expand, caption);
        return figure;
      }));
      show("photo-wrap");
    } else show("photo-wrap", false);
    if (snapshot.maintenanceStartedAt) {
      show("maintenance-card");
      const tick = () => {
        const updatedAt = Date.parse(snapshot.updatedAt);
        const extra =
          snapshot.maintenanceClockRunning && Number.isFinite(updatedAt)
            ? Math.max(0, Math.floor((Date.now() - updatedAt) / 1000))
            : 0;
        $("maintenance-time").textContent = duration(
          (snapshot.maintenanceElapsedSeconds || 0) + extra,
        );
        $("maintenance-note").textContent = snapshot.maintenanceClockRunning
          ? "Contagem ativa desde a última atualização."
          : snapshot.statusDetail?.includes("peças")
            ? "Contagem pausada enquanto aguarda peças."
            : "Tempo registrado pela assistência.";
      };
      tick();
      clearInterval(state.timer);
      state.timer = setInterval(tick, 30000);
    } else show("maintenance-card", false);
    if (Number.isInteger(snapshot.totalCents)) {
      show("total-card");
      $("total").textContent = money(snapshot.totalCents);
    } else show("total-card", false);
    if (snapshot.diagnosedDefect) {
      show("diagnosis-card");
      $("diagnosis").textContent = snapshot.diagnosedDefect;
    } else show("diagnosis-card", false);
    const services = Array.isArray(snapshot.services) ? snapshot.services : [];
    if (services.length) {
      show("services-card");
      $("services").replaceChildren(
        ...services.map((item) => {
          const li = document.createElement("li");
          li.textContent = item.name;
          return li;
        }),
      );
    } else show("services-card", false);
    const timeline = Array.isArray(snapshot.timeline)
      ? [...snapshot.timeline].reverse()
      : [];
    if (timeline.length) {
      show("timeline-card");
      $("timeline").replaceChildren(
        ...timeline.map((item) => {
          const row = document.createElement("div");
          row.className = "timeline-item";
          const dot = document.createElement("span");
          dot.className = "timeline-dot";
          const copy = document.createElement("div");
          const strong = document.createElement("strong");
          strong.textContent = item.status;
          const when = document.createElement("span");
          when.textContent = date(item.changedAt);
          copy.append(strong, when);
          row.append(dot, copy);
          return row;
        }),
      );
    } else show("timeline-card", false);
    show("loading", false);
    show("pin-form", false);
    show("error", false);
    show("tracking");
  };
  const load = async () => {
    if (state.loading) return;
    state.loading = true;
    try {
      render(await api());
    } catch (error) {
      if (error.code === "pin_required") {
        show("error", false);
        show("loading", false);
        show("pin-form");
        $("pin").focus();
      } else if (error.code === "pin_invalid") {
        show("loading", false);
        show("error", false);
        show("pin-form");
        show("pin-error");
        $("pin-error").textContent = error.message;
        $("pin").focus();
      } else fail(error.message, error.retryable === true);
    } finally { state.loading = false; }
  };
  $("close-photo").addEventListener("click", () => $("photo-dialog").close());
  $("photo-dialog").addEventListener("close", () => $("photo-large").removeAttribute("src"));
  $("retry").addEventListener("click", async () => {
    $("retry").disabled = true;
    $("retry").textContent = "Consultando…";
    await load();
    $("retry").disabled = false;
    $("retry").textContent = "Tentar novamente";
  });
  $("pin").addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
    show("pin-error", false);
  });
  $("pin-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const pin = $("pin").value.trim();
    if (!/^\d{4}$/.test(pin)) {
      show("pin-error");
      $("pin-error").textContent = "Digite os 4 números.";
      return;
    }
    state.pin = pin;
    $("pin-submit").disabled = true;
    $("pin-submit").textContent = "Consultando…";
    await load();
    $("pin-submit").disabled = false;
    $("pin-submit").textContent = "Ver acompanhamento";
  });
  $("refresh").addEventListener("click", async () => {
    $("refresh").disabled = true;
    $("refresh").textContent = "Atualizando…";
    await load();
    $("refresh").disabled = false;
    $("refresh").textContent = "Atualizar agora";
  });
  const submitApproval = async (decision) => {
    if (state.approving) return;
    if (!$("approval-check").checked) {
      show("approval-feedback");
      $("approval-feedback").className = "approval-feedback error";
      $("approval-feedback").textContent = "Marque a confirmação de ciência antes de responder.";
      return;
    }
    state.approving = true;
    $("approve-quote").disabled = true;
    $("reject-quote").disabled = true;
    $("approval-feedback").hidden = false;
    $("approval-feedback").className = "approval-feedback";
    $("approval-feedback").textContent = "Registrando sua decisão…";
    try {
      render(await api("approve", decision));
    } catch (error) {
      $("approval-feedback").className = "approval-feedback error";
      $("approval-feedback").textContent = error.message || "Não foi possível registrar sua decisão.";
      $("approve-quote").disabled = false;
      $("reject-quote").disabled = false;
    } finally { state.approving = false; }
  };
  $("approve-quote").addEventListener("click", () => void submitApproval("approved"));
  $("reject-quote").addEventListener("click", () => void submitApproval("rejected"));
  const params = new URLSearchParams(location.hash.slice(1));
  state.token = params.get("token") || "";
  history.replaceState(null, "", location.pathname);
  if (!/^[A-Za-z0-9_-]{43}$/.test(state.token))
    return fail(
      "O endereço está incompleto. Abra novamente o link enviado pela assistência.",
    );
  void load();
})();
