(() => {
  "use strict";
  const API_URL = window.__ASSISTENCIA_PUBLIC_CONFIG__?.apiUrl;
  if (!API_URL) throw new Error("A configuração pública do painel técnico não foi carregada.");
  const DEFAULT_DIAGNOSIS = "O defeito relatado pelo cliente foi constatado durante a avaliação técnica.";
  const $ = (id) => document.getElementById(id);
  const state = { token: "", pin: "", services: [] };
  const fail = (message) => {
    $("loading").hidden = true;
    $("form").hidden = true;
    $("pin-form").hidden = true;
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
    if (!response.ok) {
      const error = new Error(data.message || "Este link expirou ou já foi utilizado.");
      error.code = data.error || "request_failed";
      error.requiresPin = data.requiresPin === true;
      throw error;
    }
    return data;
  };
  const cents = (value) => {
    const normalized = String(value).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
    const result = Math.round(Number(normalized) * 100);
    return Number.isSafeInteger(result) && result >= 1 && result <= 99999999 ? result : null;
  };
  const addOption = (serviceRoot, service, optionIndex) => {
    const option = document.createElement("div");
    option.className = "service-option";
    const fields = document.createElement("div");
    fields.className = "service-option-fields";
    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Peça / alternativa";
    const description = document.createElement("input");
    description.type = "text";
    description.autocomplete = "off";
    description.maxLength = 80;
    description.value = `Opção ${optionIndex + 1}`;
    description.placeholder = "Ex.: Tela original com mensagem";
    description.dataset.optionLabel = service.id;
    descriptionLabel.append(description);
    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Valor unitário";
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
    input.dataset.optionValue = service.id;
    input.setAttribute("aria-label", `Valor de ${service.name}, opção ${optionIndex + 1}`);
    wrap.append(prefix, input);
    priceLabel.append(wrap);
    fields.append(descriptionLabel, priceLabel);
    option.append(fields);
    const optionsRoot = serviceRoot.querySelector(".service-options");
    optionsRoot.append(option);
    if (optionsRoot.children.length > 1) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-option";
      remove.textContent = "Remover esta opção";
      remove.addEventListener("click", () => {
        option.remove();
        const addButton = serviceRoot.querySelector(".add-option");
        if (addButton) addButton.disabled = false;
      });
      option.append(remove);
    }
  };
  const render = (invite) => {
    state.services = Array.isArray(invite.services) ? invite.services : [];
    $("store").textContent = invite.storeName;
    $("number").textContent = invite.publicNumber;
    $("device").textContent = invite.deviceSummary;
    $("reported").textContent = invite.reportedDefect;
    $("expiry").textContent = `Disponível até ${new Date(invite.expiresAt).toLocaleString("pt-BR")}.`;
    const root = $("services");
    for (const [index, service] of invite.services.entries()) {
      const row = document.createElement("div");
      row.className = "service";
      row.dataset.serviceId = service.id;
      const name = document.createElement("strong");
      name.textContent = `${index + 1}. ${service.name}`;
      row.append(name);
      if (service.description) {
        const description = document.createElement("small");
        description.textContent = service.description;
        row.append(description);
      }
      const options = document.createElement("div");
      options.className = "service-options";
      row.append(options);
      addOption(row, service, 0);
      row.dataset.nextOptionNumber = "2";
      const add = document.createElement("button");
      add.type = "button";
      add.className = "add-option";
      add.textContent = "+ Adicionar outra peça / valor";
      add.addEventListener("click", () => {
        if (options.children.length >= 8) return;
        const nextOptionNumber = Number(row.dataset.nextOptionNumber || 2);
        addOption(row, service, nextOptionNumber - 1);
        row.dataset.nextOptionNumber = String(nextOptionNumber + 1);
        if (options.children.length >= 8) add.disabled = true;
      });
      row.append(add);
      root.append(row);
    }
    $("loading").hidden = true;
    $("form").hidden = false;
  };
  const showPinGate = (message = "") => {
    $("loading").hidden = true;
    $("error").hidden = true;
    $("form").hidden = true;
    $("pin-form").hidden = false;
    $("pin-error").textContent = message;
    $("pin-error").hidden = !message;
    $("pin").focus();
  };
  $("pin").addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 12);
    $("pin-error").hidden = true;
  });
  $("pin-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const pin = $("pin").value.trim();
    if (!/^\d{4,12}$/.test(pin)) return showPinGate("Digite de 4 a 12 números.");
    $("pin-submit").disabled = true;
    $("pin-submit").textContent = "Verificando…";
    try {
      const data = await api({ action: "read", token: state.token, pin });
      state.pin = pin;
      $("pin").value = "";
      $("pin-form").hidden = true;
      render(data.invite);
    } catch (error) {
      if (error.code === "pin_invalid") showPinGate(error.message);
      else fail(error.message);
    } finally {
      $("pin-submit").disabled = false;
      $("pin-submit").textContent = "Abrir atendimento";
    }
  });
  $("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const diagnosis = $("diagnosis").value.trim() || DEFAULT_DIAGNOSIS;
    const evaluationResult = $("evaluation-result").value || "repair_recommended";
    const values = [];
    for (const service of state.services) {
      const serviceRoot = [...$("services").querySelectorAll(".service")].find((row) => row.dataset.serviceId === service.id);
      const options = [...serviceRoot.querySelectorAll(".service-option")];
      const normalizedOptions = [];
      for (const option of options) {
        const label = option.querySelector("input[data-option-label]");
        const input = option.querySelector("input[data-option-value]");
        const unitPriceCents = cents(input.value);
        if (unitPriceCents === null) {
          input.focus();
          input.setCustomValidity("Informe um valor válido maior que zero.");
          input.reportValidity();
          input.setCustomValidity("");
          return;
        }
        normalizedOptions.push({
          label: label.value.trim() || `Opção ${normalizedOptions.length + 1}`,
          unitPriceCents,
        });
      }
      values.push({ id: service.id, options: normalizedOptions });
    }
    $("submit").disabled = true;
    $("submit").textContent = "Enviando…";
    try {
      await api({ action: "submit", token: state.token, pin: state.pin, diagnosedDefect: diagnosis, evaluationResult, serviceValues: values });
      $("form").hidden = true;
      $("success").hidden = false;
      state.pin = "";
      history.replaceState(null, "", location.pathname);
    } catch (error) {
      fail(error instanceof Error ? error.message : "Não foi possível enviar agora.");
    }
  });
  const params = new URLSearchParams(location.hash.slice(1));
  state.token = params.get("token") || "";
  history.replaceState(null, "", location.pathname);
  if (!/^[A-Za-z0-9_-]{43}$/.test(state.token)) return fail("O endereço está incompleto ou inválido.");
  api({ action: "read", token: state.token })
    .then((data) => render(data.invite))
    .catch((error) => {
      if (error.code === "pin_required") showPinGate();
      else fail(error.message);
    });
})();
