(() => {
  "use strict";
  const API_URL = "https://nbyezzdvxjcmlcejiiak.supabase.co/functions/v1/technician-quote";
  const $ = (id) => document.getElementById(id);
  const state = { token: "", services: [] };
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
    description.required = true;
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
  $("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const diagnosis = $("diagnosis").value.trim();
    if (diagnosis.length < 3) return $("diagnosis").focus();
    const evaluationResult = $("evaluation-result").value;
    if (!evaluationResult) return $("evaluation-result").focus();
    const values = [];
    for (const service of state.services) {
      const serviceRoot = [...$("services").querySelectorAll(".service")].find((row) => row.dataset.serviceId === service.id);
      const options = [...serviceRoot.querySelectorAll(".service-option")];
      const normalizedOptions = [];
      for (const option of options) {
        const label = option.querySelector("input[data-option-label]");
        const input = option.querySelector("input[data-option-value]");
        const unitPriceCents = cents(input.value);
        if (!label.value.trim()) {
          label.focus();
          label.setCustomValidity("Descreva a peça ou alternativa.");
          label.reportValidity();
          label.setCustomValidity("");
          return;
        }
        if (unitPriceCents === null) {
          input.focus();
          input.setCustomValidity("Informe um valor válido maior que zero.");
          input.reportValidity();
          input.setCustomValidity("");
          return;
        }
        normalizedOptions.push({ label: label.value.trim(), unitPriceCents });
      }
      values.push({ id: service.id, options: normalizedOptions });
    }
    $("submit").disabled = true;
    $("submit").textContent = "Enviando…";
    try {
      await api({ action: "submit", token: state.token, diagnosedDefect: diagnosis, evaluationResult, serviceValues: values });
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
