(() => {
  "use strict";
  const API_URL = "https://nbyezzdvxjcmlcejiiak.supabase.co/functions/v1/technician-quote";
  const $ = (id) => document.getElementById(id);
  const state = { token: "" };
  const fail = (message) => {
    $("loading").hidden = true;
    $("form").hidden = true;
    $("error-text").textContent = message;
    $("error").hidden = false;
  };
  const api = async (body) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Este link expirou ou já foi utilizado.");
    return data;
  };
  const cents = (value) => {
    const normalized = String(value).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
    const result = Math.round(Number(normalized) * 100);
    return Number.isSafeInteger(result) && result >= 1 && result <= 99999999 ? result : null;
  };
  const render = (invite) => {
    $("store").textContent = invite.storeName;
    $("number").textContent = invite.publicNumber;
    $("device").textContent = invite.deviceSummary;
    $("reported").textContent = invite.reportedDefect;
    $("expiry").textContent = `Disponível até ${new Date(invite.expiresAt).toLocaleString("pt-BR")}.`;
    const root = $("services");
    for (const [index, service] of invite.services.entries()) {
      const row = document.createElement("div");
      row.className = "service";
      const name = document.createElement("strong");
      name.textContent = `${index + 1}. ${service.name}`;
      row.append(name);
      if (service.description) {
        const description = document.createElement("small");
        description.textContent = service.description;
        row.append(description);
      }
      const label = document.createElement("label");
      label.textContent = "Valor unitário";
      const wrap = document.createElement("span");
      wrap.className = "price-wrap";
      const prefix = document.createElement("span");
      prefix.textContent = "R$";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.autocomplete = "off";
      input.placeholder = "0,00";
      input.required = true;
      input.dataset.serviceId = service.id;
      input.setAttribute("aria-label", `Valor de ${service.name}`);
      wrap.append(prefix, input);
      label.append(wrap);
      row.append(label);
      root.append(row);
    }
    $("loading").hidden = true;
    $("form").hidden = false;
  };
  $("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const diagnosis = $("diagnosis").value.trim();
    if (diagnosis.length < 3) return $("diagnosis").focus();
    const inputs = [...$("services").querySelectorAll("input[data-service-id]")];
    const values = inputs.map((input) => ({ id: input.dataset.serviceId, unitPriceCents: cents(input.value) }));
    const invalid = values.findIndex((value) => value.unitPriceCents === null);
    if (invalid >= 0) {
      inputs[invalid].focus();
      inputs[invalid].setCustomValidity("Informe um valor válido maior que zero.");
      inputs[invalid].reportValidity();
      return inputs[invalid].setCustomValidity("");
    }
    $("submit").disabled = true;
    $("submit").textContent = "Enviando…";
    try {
      await api({ action: "submit", token: state.token, diagnosedDefect: diagnosis, serviceValues: values });
      $("form").hidden = true;
      $("success").hidden = false;
      history.replaceState(null, "", location.pathname);
    } catch (error) {
      fail(error instanceof Error ? error.message : "Não foi possível enviar agora.");
    }
  });
  const params = new URLSearchParams(location.hash.slice(1));
  state.token = params.get("token") || "";
  history.replaceState(null, "", location.pathname);
  if (!/^[A-Za-z0-9_-]{43}$/.test(state.token)) return fail("O endereço está incompleto ou inválido.");
  api({ action: "read", token: state.token }).then((data) => render(data.invite)).catch((error) => fail(error.message));
})();
