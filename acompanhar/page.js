(() => {
  "use strict";
  const API_URL = window.__ASSISTENCIA_CUSTOMER_CONFIG__?.apiUrl;
  if (!API_URL) throw new Error("A configuração pública não foi carregada.");
  const $ = (id) => document.getElementById(id);
  const state = { token: "", pin: "", tracking: null, timer: null, expiryTimer: null };
  const statusIndex = (status) =>
    status === "Aguardando técnico"
      ? 1
      : status === "Aguardando aprovação"
        ? 2
        : status === "Em manutenção"
          ? 3
          : ["Pronto para retirada", "Abandonado"].includes(status)
            ? 4
            : status === "Finalizado"
              ? 5
              : 0;
  const statusHelp = (status, detail) => {
    if (
      String(detail || "")
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
  const fail = (message) => {
    clearTimeout(state.expiryTimer);
    state.tracking = null;
    renderBranding(null);
    clearInterval(state.timer);
    show("loading", false);
    show("pin-form", false);
    show("tracking", false);
    $("photo").removeAttribute("src");
    $("services").replaceChildren();
    $("timeline").replaceChildren();
    $("error-text").textContent = message;
    show("error");
  };
  const api = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      body: JSON.stringify({
        action: "read",
        token: state.token,
        pin: state.pin,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data.message || "Não foi possível consultar o atendimento.",
      );
      error.code = data.error || "request_failed";
      throw error;
    }
    return data.tracking;
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
      `Atualizado em ${date(tracking.updatedAt || snapshot.updatedAt)}`;
    $("device").textContent =
      snapshot.deviceSummary || "Aparelho em atendimento";
    $("reported").textContent = snapshot.reportedDefect
      ? `Relato: ${snapshot.reportedDefect}`
      : "";
    $("deadline").textContent =
      snapshot.estimatedDeadline || "Consulte a assistência";
    renderProgress(snapshot.status);
    const photo = snapshot.photo;
    if (photo?.dataUrl) {
      $("photo").src = photo.dataUrl;
      $("photo-caption").textContent =
        photo.caption || "Foto registrada na entrada";
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
    try {
      render(await api());
    } catch (error) {
      if (error.code === "pin_required") {
        show("loading", false);
        show("pin-form");
        $("pin").focus();
      } else if (error.code === "pin_invalid") {
        show("pin-error");
        $("pin-error").textContent = error.message;
        $("pin").focus();
      } else fail(error.message);
    }
  };
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
  const params = new URLSearchParams(location.hash.slice(1));
  state.token = params.get("token") || "";
  history.replaceState(null, "", location.pathname);
  if (!/^[A-Za-z0-9_-]{43}$/.test(state.token))
    return fail(
      "O endereço está incompleto. Abra novamente o link enviado pela assistência.",
    );
  void load();
})();
