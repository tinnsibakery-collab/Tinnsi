const DEFAULT_THEME = {
  pageStart: "#F8F4ED",
  pageEnd: "#F5E7D8",
  pageGlow: "#BC5F2F",
  heroStart: "#FFFDF9",
  heroEnd: "#F3DEC7",
  heroPanel: "#FFF8F1",
  catalogPanel: "#FFF9F3",
  detailPanel: "#FFF7F0",
  card: "#FFFFFF",
  accent: "#BC5F2F",
  accentDeep: "#7F3710",
  accentText: "#FFF8F1",
  ink: "#1D1A17",
  muted: "#6F655A",
  line: "#D4C2B3"
};

const state = {
  allProducts: [],
  activeProducts: [],
  selectedId: "",
  searchTerm: "",
  category: "全部",
  siteCurrency: "TWD"
};

const elements = {
  hero: document.querySelector(".hero"),
  heroPanel: null,
  siteTitle: document.querySelector("#site-title"),
  siteTagline: document.querySelector("#site-tagline"),
  siteContact: document.querySelector("#site-contact"),
  activeCount: null,
  lastUpdated: null,
  feedback: document.querySelector("#catalog-feedback"),
  grid: document.querySelector("#product-grid"),
  categoryFilters: document.querySelector("#category-filters"),
  searchInput: document.querySelector("#search-input"),
  detailEmpty: document.querySelector("#detail-empty"),
  detailArticle: document.querySelector("#product-detail"),
  detailImage: document.querySelector("#detail-image"),
  detailCategory: document.querySelector("#detail-category"),
  detailName: document.querySelector("#detail-name"),
  detailPrice: document.querySelector("#detail-price"),
  detailSubtitle: document.querySelector("#detail-subtitle"),
  detailSummary: document.querySelector("#detail-summary"),
  detailOrderLink: document.querySelector("#detail-order-link"),
  detailGallery: document.querySelector("#detail-gallery"),
  detailSections: document.querySelector("#detail-sections")
};

bootstrap().catch((error) => {
  console.error(error);
  elements.feedback.textContent = "商品資料載入失敗，請稍後再試。";
  elements.feedback.classList.add("is-error");
});

async function bootstrap() {
  applyRuntimeVisibility();

  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  const response = await fetch("./data/products.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load products.json: ${response.status}`);
  }

  const data = await response.json();
  state.allProducts = Array.isArray(data.products) ? data.products : [];
  state.activeProducts = state.allProducts.filter((product) => product.status === "active");

  applySiteMeta(data.site);
  renderFilters();

  const preferredId = decodeURIComponent(window.location.hash.replace("#", ""));
  const initialProduct =
    state.activeProducts.find((product) => product.id === preferredId) ||
    state.activeProducts.find((product) => product.highlight) ||
    state.activeProducts[0];

  state.selectedId = initialProduct?.id ?? "";
  renderCatalog();

  if (initialProduct) {
    renderDetail(initialProduct);
  }

  window.addEventListener("hashchange", () => {
    const nextId = decodeURIComponent(window.location.hash.replace("#", ""));
    const product = state.activeProducts.find((item) => item.id === nextId);
    if (!product) {
      return;
    }

    state.selectedId = product.id;
    renderCatalog();
    renderDetail(product);
  });
}

function applyRuntimeVisibility() {
  if (isLocalRuntime()) {
    ensureOperationalPanel();
    elements.hero?.classList.remove("hero-compact");
    return;
  }

  if (elements.heroPanel) {
    elements.heroPanel.remove();
    elements.heroPanel = null;
    elements.activeCount = null;
    elements.lastUpdated = null;
  }
  elements.hero?.classList.add("hero-compact");
}

function ensureOperationalPanel() {
  if (elements.heroPanel || !elements.hero) {
    return;
  }

  const panel = document.createElement("div");
  panel.className = "hero-panel";
  panel.innerHTML = `
    <div class="hero-stat">
      <span class="hero-stat-label">上架商品</span>
      <strong id="active-count">0</strong>
    </div>
    <div class="hero-stat">
      <span class="hero-stat-label">最新更新</span>
      <strong id="last-updated">尚未更新</strong>
    </div>
    <p class="hero-note">網站內容來自 <code>data/products.json</code>，本機後台發布後 GitHub Pages 會自動同步更新。</p>
  `;
  elements.hero.append(panel);
  elements.heroPanel = panel;
  elements.activeCount = panel.querySelector("#active-count");
  elements.lastUpdated = panel.querySelector("#last-updated");
}

function isLocalRuntime() {
  return ["127.0.0.1", "localhost", "::1"].includes(window.location.hostname);
}

function applySiteMeta(site = {}) {
  const title = site.title || "Tinnsi Bakery";
  const tagline = site.tagline || "讓產品照片、簡短介紹與訂購動線成為畫面的主角，其他資訊再由折頁展開。";
  const contact = site.contactEmail || "hello@tinnsi.example";

  state.siteCurrency = site.currency || "TWD";
  document.title = title;
  applySiteTheme(normalizeTheme(site.theme));

  elements.siteTitle.textContent = title;
  elements.siteTagline.textContent = tagline;
  elements.siteContact.textContent = `聯絡我們：${contact}`;
  if (elements.activeCount) {
    elements.activeCount.textContent = String(state.activeProducts.length);
  }
  if (elements.lastUpdated) {
    elements.lastUpdated.textContent = formatDate(site.updatedAt || latestProductUpdate(state.allProducts));
  }
}

function renderFilters() {
  const categories = ["全部", ...new Set(state.activeProducts.map((product) => product.category).filter(Boolean))];
  elements.categoryFilters.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.category === category ? " is-active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      state.category = category;
      renderFilters();
      renderCatalog();
    });
    elements.categoryFilters.append(button);
  });
}

function renderCatalog() {
  const filtered = state.activeProducts.filter((product) => {
    const categoryMatches = state.category === "全部" || product.category === state.category;
    const searchMatches =
      !state.searchTerm ||
      [product.name, product.subtitle, product.category, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(state.searchTerm));

    return categoryMatches && searchMatches;
  });

  elements.grid.innerHTML = "";
  if (!filtered.length) {
    elements.feedback.textContent = "目前沒有符合條件的商品。";
    elements.feedback.classList.remove("is-error");
    elements.detailEmpty.hidden = false;
    elements.detailArticle.hidden = true;
    return;
  }

  elements.feedback.textContent = `找到 ${filtered.length} 項商品`;
  elements.feedback.classList.remove("is-error");

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = `product-card${product.id === state.selectedId ? " is-active" : ""}`;
    card.tabIndex = 0;

    const orderLink = product.orderLink?.trim();
    card.innerHTML = `
      <div class="product-card-image">
        <img src="${escapeHtml(product.cover || "")}" alt="${escapeHtml(product.name || "")}">
      </div>
      <div class="product-card-tags">
        ${(product.badges || []).slice(0, 2).map((badge) => `<span class="tag">${escapeHtml(badge)}</span>`).join("")}
      </div>
      <h3>${escapeHtml(product.name || "")}</h3>
      <p class="product-card-subtitle">${escapeHtml(product.subtitle || "")}</p>
      <p>${escapeHtml(product.summary || "")}</p>
      <div class="product-card-footer">
        <span class="product-price">${formatPrice(product.price, product.currency || state.siteCurrency)}</span>
        <span class="product-sku">${escapeHtml(product.sku || "")}</span>
      </div>
      <div class="product-card-actions">
        <button class="button button-secondary product-card-detail" type="button">查看詳情</button>
        ${
          orderLink
            ? `<a class="button button-primary product-card-order" href="${escapeAttribute(orderLink)}" target="_blank" rel="noreferrer">前往下單</a>`
            : `<button class="button button-disabled product-card-order" type="button" disabled>尚未開放下單</button>`
        }
      </div>
    `;

    const handleSelect = () => {
      state.selectedId = product.id;
      window.location.hash = encodeURIComponent(product.id);
      renderCatalog();
      renderDetail(product);
    };

    card.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".product-card-order")) {
        return;
      }
      handleSelect();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelect();
      }
    });

    card.querySelector(".product-card-detail")?.addEventListener("click", (event) => {
      event.stopPropagation();
      handleSelect();
    });

    card.querySelector(".product-card-order")?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    elements.grid.append(card);
  });

  const selectedProduct = filtered.find((product) => product.id === state.selectedId);
  renderDetail(selectedProduct || filtered[0]);
}

function renderDetail(product) {
  if (!product) {
    elements.detailEmpty.hidden = false;
    elements.detailArticle.hidden = true;
    return;
  }

  state.selectedId = product.id;
  elements.detailEmpty.hidden = true;
  elements.detailArticle.hidden = false;
  elements.detailImage.src = product.cover || "";
  elements.detailImage.alt = product.name || "";
  elements.detailCategory.textContent = product.category || "未分類";
  elements.detailName.textContent = product.name || "未命名商品";
  elements.detailPrice.textContent = formatPrice(product.price, product.currency || state.siteCurrency);
  elements.detailSubtitle.textContent = product.subtitle || "";
  elements.detailSummary.textContent = product.summary || "";

  if (product.orderLink?.trim()) {
    elements.detailOrderLink.href = product.orderLink.trim();
    elements.detailOrderLink.textContent = "前往下單";
    elements.detailOrderLink.classList.remove("button-disabled");
    elements.detailOrderLink.setAttribute("aria-disabled", "false");
    elements.detailOrderLink.removeAttribute("tabindex");
  } else {
    elements.detailOrderLink.removeAttribute("href");
    elements.detailOrderLink.textContent = "尚未開放下單";
    elements.detailOrderLink.classList.add("button-disabled");
    elements.detailOrderLink.setAttribute("aria-disabled", "true");
    elements.detailOrderLink.setAttribute("tabindex", "-1");
  }

  renderGallery(product);
  renderAccordions(product);
}

function renderGallery(product) {
  elements.detailGallery.innerHTML = "";
  const gallery = [product.cover, ...(product.gallery || []).filter(Boolean)].filter(Boolean);
  const uniqueGallery = [...new Set(gallery)];

  uniqueGallery.forEach((imagePath) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-thumb";
    button.innerHTML = `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(product.name || "")}">`;
    button.addEventListener("click", () => {
      elements.detailImage.src = imagePath;
    });
    elements.detailGallery.append(button);
  });
}

function renderAccordions(product) {
  elements.detailSections.innerHTML = "";
  const sections = Array.isArray(product.sections) ? product.sections.filter(isFilledSection) : [];

  if (!sections.length) {
    elements.detailSections.innerHTML = `
      <details class="accordion-item" open>
        <summary>商品介紹</summary>
        <div class="accordion-content">目前還沒有更多介紹內容，之後可在後台補上。</div>
      </details>
    `;
    return;
  }

  sections.forEach((section, index) => {
    const details = document.createElement("details");
    details.className = "accordion-item";
    if (index === 0) {
      details.open = true;
    }
    details.innerHTML = `
      <summary>${escapeHtml(section.title)}</summary>
      <div class="accordion-content">${formatSectionContent(section.content)}</div>
    `;
    elements.detailSections.append(details);
  });
}

function applySiteTheme(theme) {
  const root = document.documentElement;
  const values = {
    "--page-bg-start": theme.pageStart,
    "--page-bg-end": theme.pageEnd,
    "--page-bg-glow": theme.pageGlow,
    "--hero-start": theme.heroStart,
    "--hero-end": theme.heroEnd,
    "--hero-panel": theme.heroPanel,
    "--catalog-panel": theme.catalogPanel,
    "--detail-panel": theme.detailPanel,
    "--card": theme.card,
    "--accent": theme.accent,
    "--accent-deep": theme.accentDeep,
    "--accent-text": theme.accentText,
    "--ink": theme.ink,
    "--muted": theme.muted,
    "--line-color": theme.line,
    "--line": withAlpha(theme.line, 0.44),
    "--line-strong": withAlpha(theme.line, 0.72),
    "--accent-08": withAlpha(theme.accent, 0.08),
    "--accent-10": withAlpha(theme.accent, 0.1),
    "--accent-12": withAlpha(theme.accent, 0.12),
    "--accent-14": withAlpha(theme.accent, 0.14),
    "--accent-16": withAlpha(theme.accent, 0.16),
    "--accent-20": withAlpha(theme.accent, 0.2),
    "--accent-28": withAlpha(theme.accent, 0.28),
    "--accent-deep-08": withAlpha(theme.accentDeep, 0.08),
    "--accent-deep-10": withAlpha(theme.accentDeep, 0.1),
    "--accent-deep-12": withAlpha(theme.accentDeep, 0.12),
    "--accent-deep-18": withAlpha(theme.accentDeep, 0.18),
    "--card-shadow": `0 20px 40px ${withAlpha(theme.accentDeep, 0.14)}`,
    "--shadow": `0 24px 60px ${withAlpha(theme.accentDeep, 0.16)}`
  };

  Object.entries(values).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function normalizeTheme(theme = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_THEME).map(([key, fallback]) => [key, normalizeHexColor(theme[key], fallback)])
  );
}

function normalizeHexColor(value, fallback) {
  const input = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(input)) {
    return input.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(input)) {
    return `#${input.toUpperCase()}`;
  }
  return fallback;
}

function withAlpha(hex, alpha) {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex, "#000000").replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}

function formatSectionContent(content) {
  return escapeHtml(content || "").replaceAll("\n", "<br>");
}

function isFilledSection(section) {
  return section && typeof section.title === "string" && typeof section.content === "string" && (section.title.trim() || section.content.trim());
}

function latestProductUpdate(products) {
  return products
    .map((product) => product.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function formatPrice(value, currency = "TWD") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "價格未定";
  }

  try {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency
    }).format(value);
  } catch (error) {
    return `${value} ${currency}`;
  }
}

function formatDate(value) {
  if (!value) {
    return "尚未更新";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
