const CONTACT = {
  email: "sofiaaaa.ivanova@gmail.com",
  telegram: "https://t.me/soffff277",
  vk: "https://vk.ru/id1133786912",
  whatsapp: "",
  calendly: "",
};

const PRICES = {
  landing: { title: "Лендинг", base: 15000, days: "5–7 дней", included: 1 },
  corporate: { title: "Корпоративный сайт", base: 40000, days: "2–3 недели", included: 5 },
  shop: { title: "Интернет-магазин", base: 75000, days: "4–6 недель", included: 8 },
  app: { title: "Веб-приложение", base: 125000, days: "от 2 месяцев", included: 6 },
  page: 4000,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let estimateLine = "";

function formatRub(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function initTheme() {
  const button = document.getElementById("theme");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!button) return;

  function sync(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (meta) meta.setAttribute("content", theme === "light" ? "#F4F5F1" : "#0F1115");
    button.setAttribute(
      "aria-label",
      theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
    );
  }

  sync(document.documentElement.getAttribute("data-theme") || "dark");
  button.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    sync(next);
    try {
      localStorage.setItem("stack-theme", next);
    } catch (error) {
      /* приватный режим может запретить запись */
    }
  });
}

function initMenu() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("site-nav");
  if (!burger || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("lock", open);
  }

  burger.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

function initHeader() {
  const header = document.querySelector(".nav");
  if (!header) return;
  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

function initSpy() {
  const links = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));
}

function initServices() {
  const plates = [...document.querySelectorAll(".plate")];
  const services = [...document.querySelectorAll(".service")];
  if (!plates.length || !services.length) return;

  function setActive(id) {
    plates.forEach((plate) => plate.classList.toggle("is-active", plate.dataset.layer === id));
    services.forEach((service) => service.classList.toggle("is-active", service.id === id));
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
  );
  services.forEach((service) => observer.observe(service));

  plates.forEach((plate) => {
    plate.addEventListener("click", () => {
      const target = document.getElementById(plate.dataset.layer);
      target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  });
}

function initFilters() {
  const buttons = [...document.querySelectorAll(".chip")];
  const cards = [...document.querySelectorAll(".case")];
  const empty = document.getElementById("work-empty");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => {
        const on = item === button;
        item.classList.toggle("is-on", on);
        item.setAttribute("aria-pressed", String(on));
      });
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.kind === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });
}

function initCalc() {
  const sumNode = document.getElementById("calc-sum");
  const linesNode = document.getElementById("calc-lines");
  const hint = document.getElementById("pages-hint");
  const pages = document.getElementById("pages");
  const pagesOut = document.getElementById("pages-out");
  if (!sumNode || !pages) return;

  function currentKind() {
    return document.querySelector('input[name="kind"]:checked')?.value || "landing";
  }

  function render() {
    const item = PRICES[currentKind()];
    const pageCount = Number(pages.value);
    pagesOut.textContent = String(pageCount);
    const extraPages = Math.max(0, pageCount - item.included);
    const lines = [{ name: item.title, value: item.base }];
    if (extraPages) {
      lines.push({
        name: `Страницы сверх базы (${extraPages})`,
        value: extraPages * PRICES.page,
      });
    }
    document.querySelectorAll("[data-extra]").forEach((box) => {
      if (box.checked) lines.push({ name: box.dataset.label, value: Number(box.dataset.extra) });
    });
    const low = lines.reduce((total, line) => total + line.value, 0);
    const high = Math.max(low, Math.round((low * 1.25) / 1000) * 1000);
    linesNode.replaceChildren();
    lines.forEach((line) => {
      const row = document.createElement("li");
      const name = document.createElement("span");
      const value = document.createElement("span");
      name.textContent = line.name;
      value.textContent = formatRub(line.value);
      row.append(name, value);
      linesNode.append(row);
    });
    sumNode.textContent = `${formatRub(low)} – ${formatRub(high)}`;
    hint.textContent = `В базе до ${item.included} стр. Каждая следующая +${formatRub(PRICES.page)}. Срок ориентира: ${item.days}.`;
    estimateLine = `Ориентир калькулятора: ${item.title}, ${pageCount} стр., ${formatRub(low)} – ${formatRub(high)}.`;
  }

  document.querySelectorAll('input[name="kind"]').forEach((input) => {
    input.addEventListener("change", () => {
      pages.value = String(PRICES[currentKind()].included);
      render();
    });
  });
  pages.addEventListener("input", render);
  document.querySelectorAll("[data-extra]").forEach((box) => box.addEventListener("change", render));
  render();

  document.getElementById("to-form")?.addEventListener("click", () => {
    const type = document.getElementById("type");
    const note = document.getElementById("estimate-note");
    if (type) type.value = currentKind();
    if (note) {
      note.hidden = false;
      note.textContent = estimateLine;
    }
    document.getElementById("contact")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
    document.getElementById("name")?.focus();
  });
}

function fieldError(input, valid, message) {
  const field = input.closest(".field, .check");
  const error = field?.querySelector(".error");
  field?.classList.toggle("is-invalid", !valid);
  input.setAttribute("aria-invalid", String(!valid));
  if (error) {
    error.hidden = valid;
    error.textContent = valid ? "" : message;
  }
  return valid;
}

function initForm() {
  const form = document.getElementById("brief");
  const success = document.getElementById("success");
  if (!form || !success) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.website && form.website.value.trim()) return;

    const nameOk = fieldError(form.name, form.name.value.trim().length >= 2, "Напишите, как к вам обращаться.");
    const contactOk = fieldError(form.contact, form.contact.value.trim().length >= 5, "Нужен телефон, почта или @telegram.");
    const typeOk = fieldError(form.type, form.type.value !== "", "Выберите тип проекта.");
    const messageOk = fieldError(form.message, form.message.value.trim().length >= 10, "Пара предложений о задаче — и можно считать.");
    const consentOk = fieldError(form.consent, form.consent.checked, "Нужно согласие, чтобы ответить по заявке.");
    const alert = document.getElementById("form-alert");
    const valid = nameOk && contactOk && typeOk && messageOk && consentOk;
    if (alert) alert.hidden = valid;
    if (!valid) {
      form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea")?.focus();
      return;
    }

    const typeLabel = form.type.options[form.type.selectedIndex].text;
    const lines = [
      "Заявка со Stack",
      `Имя: ${form.name.value.trim()}`,
      `Контакт: ${form.contact.value.trim()}`,
      form.company.value.trim() ? `Компания: ${form.company.value.trim()}` : null,
      `Тип: ${typeLabel}`,
      form.budget.value ? `Бюджет: ${form.budget.value}` : null,
      form.deadline.value.trim() ? `Сроки: ${form.deadline.value.trim()}` : null,
      form.links.value.trim() ? `Примеры: ${form.links.value.trim()}` : null,
      "",
      form.message.value.trim(),
      estimateLine ? "" : null,
      estimateLine || null,
    ].filter((line) => line !== null);

    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      /* буфер может быть закрыт — текст остаётся на экране */
    }

    const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Заявка со Stack")}&body=${encodeURIComponent(text)}`;
    const preview = document.getElementById("success-text");
    const note = document.getElementById("success-note");
    if (preview) preview.textContent = text;
    if (note) {
      note.textContent = `Текст скопирован. Почтовая программа откроется на ${CONTACT.email}.`;
    }
    form.hidden = true;
    success.hidden = false;
    window.location.href = mail;
  });

  document.getElementById("edit-again")?.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
  });

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (input instanceof HTMLElement && input.closest(".is-invalid")) {
      fieldError(input, true, "");
    }
  });
}

function initContacts() {
  document.querySelectorAll("[data-contact='email']").forEach((node) => {
    node.href = `mailto:${CONTACT.email}`;
    if (node.dataset.write === "text") node.textContent = CONTACT.email;
  });

  [
    ["telegram", CONTACT.telegram],
    ["vk", CONTACT.vk],
    ["whatsapp", CONTACT.whatsapp],
  ].forEach(([key, url]) => {
    document.querySelectorAll(`[data-contact='${key}']`).forEach((node) => {
      if (!url) {
        node.href = "#contact";
        return;
      }
      node.href = url;
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    });
  });

  const call = document.getElementById("call-link");
  if (call && CONTACT.calendly) {
    call.href = CONTACT.calendly;
    call.target = "_blank";
    call.rel = "noopener noreferrer";
  }
}

function initTerminal() {
  const out = document.getElementById("term-out");
  if (!out || reduceMotion) return;
  const script = [
    ["cmd", "stack new atlas"],
    ["line", "layer 1  brief"],
    ["line", "layer 2  prototype"],
    ["line", "layer 3  design"],
    ["line", "layer 4  frontend"],
    ["line", "layer 5  backend"],
    ["ok", "ready  atlas.site"],
  ];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loop() {
    while (out.isConnected) {
      out.replaceChildren();
      for (const [type, text] of script) {
        const row = document.createElement("div");
        if (type === "ok") row.className = "term-ok";
        out.append(row);
        const full = type === "cmd" ? `$ ${text}` : text;
        if (type === "cmd") {
          for (let index = 0; index < full.length; index += 1) {
            row.textContent = full.slice(0, index + 1);
            await sleep(26);
          }
        } else {
          row.textContent = full;
          await sleep(150);
        }
      }
      await sleep(1700);
    }
  }

  loop();
}

function initReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 }
  );
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

function initPointer() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  window.addEventListener(
    "pointermove",
    (event) => {
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    },
    { passive: true }
  );
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

initTheme();
initMenu();
initHeader();
initSpy();
initServices();
initFilters();
initCalc();
initForm();
initContacts();
initTerminal();
initReveal();
initPointer();
