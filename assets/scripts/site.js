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

const ALL_CATEGORY = "全部";

const state = {
  allProducts: [],
  activeProducts: [],
  selectedId: "",
  searchTerm: "",
  category: ALL_CATEGORY,
  siteCurrency: "TWD"
};

const elements = {
  siteTitle: document.querySelector("#site-title"),
  siteTagline: document.querySelector("#site-tagline"),
  siteContact: document.querySelector("#site-contact"),
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
  elements.searchInput?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  const response = await fetch("./data/products.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load products.json: ${response.status}`);
  }

  const data = await response.json();
  state.allProducts = Array.isArray(data.products) ? data.products : [];
  state.activeProducts = state.allProducts.filter((product) => product?.status === "active");

  applySiteMeta(data.site);
  renderFilters();

  const preferredId = decodeURIComponent(window.location.hash.replace("#", ""));
  const initialProduct =
    state.activeProducts.find((product) => product.id === preferredId) ||
    state.activeProducts.find((product) => product.highlight) ||
    state.activeProducts[0] ||
    null;

  state.selectedId = initialProduct?.id ?? "";
  renderCatalog();
  renderDetail(initialProduct);

  window.addEventListener("hashchange", () => {
    const nextId = decodeURIComponent(window.location.hash.replace("#", ""));
    const product = state.activeProducts.find((item) => item.id === nextId) || null;
    if (!product) {
      return;
    }

    state.selectedId = product.id;
    renderCatalog();
    renderDetail(product);
  });
}

function applySiteMeta(site = {}) {
  const title = asText(site.title, "Tinnsi Bakery");
  const tagline = asText(
    site.tagline,
    "以溫暖選物與細膩陳列，整理出適合送禮與日常收藏的靜態型錄。"
  );
  const contact = asText(site.contactEmail, "hello@tinnsi.example");

  state.siteCurrency = asText(site.currency, "TWD");
  document.title = title;
  applySiteTheme(normalizeTheme(site.theme));

  if (elements.siteTitle) {
    elements.siteTitle.textContent = title;
  }
  if (elements.siteTagline) {
    elements.siteTagline.textContent = tagline;
  }
  if (elements.siteContact) {
    elements.siteContact.textContent = `聯絡我們：${contact}`;
  }
}

function renderFilters() {
  if (!elements.categoryFilters) {
    return;
  }

  const categories = [
    ALL_CATEGORY,
    ...new Set(
      state.activeProducts
        .map((product) => asText(product.category))
        .filter(Boolean)
    )
  ];

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
    const categoryMatches =
      state.category === ALL_CATEGORY || asText(product.category) === state.category;
    const searchMatches =
      !state.searchTerm ||
      [product.name, product.subtitle, product.category, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(state.searchTerm));

    return categoryMatches && searchMatches;
  });

  if (elements.grid) {
    elements.grid.innerHTML = "";
  }

  if (!filtered.length) {
    if (elements.feedback) {
      elements.feedback.textContent = "目前沒有符合條件的商品。";
      elements.feedback.classList.remove("is-error");
    }
    if (elements.detailEmpty) {
      elements.detailEmpty.hidden = false;
    }
    if (elements.detailArticle) {
      elements.detailArticle.hidden = true;
    }
    return;
  }

  if (elements.feedback) {
    elements.feedback.textContent = `找到 ${filtered.length} 項商品`;
    elements.feedback.classList.remove("is-error");
  }

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = `product-card${product.id === state.selectedId ? " is-active" : ""}`;
    card.tabIndex = 0;

    const orderLink = asText(product.orderLink).trim();
    card.innerHTML = `
      <div class="product-card-image">
        <img src="${escapeHtml(asText(product.cover))}" alt="${escapeHtml(asText(product.name))}">
      </div>
      <div class="product-card-tags">
        ${(Array.isArray(product.badges) ? product.badges : [])
          .slice(0, 2)
          .map((badge) => `<span class="tag">${escapeHtml(asText(badge))}</span>`)
          .join("")}
      </div>
      <h3>${escapeHtml(asText(product.name))}</h3>
      <p class="product-card-subtitle">${escapeHtml(asText(product.subtitle))}</p>
      <p>${escapeHtml(asText(product.summary))}</p>
      <div class="product-card-footer">
        <span class="product-price">${formatPrice(product.price, product.currency || state.siteCurrency)}</span>
        <span class="product-sku">${escapeHtml(asText(product.sku))}</span>
      </div>
      <div class="product-card-actions">
        <button class="button button-secondary product-card-detail" type="button">查看詳情</button>
        ${
          orderLink
            ? `<a class="button button-primary product-card-order" href="${escapeAttribute(orderLink)}" target="_blank" rel="noreferrer">前往下單</a>`
            : `<button class="button button-disabled product-card-order" type="button" disabled>尚未設定下單</button>`
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

    elements.grid?.append(card);
  });

  const selectedProduct = filtered.find((product) => product.id === state.selectedId) || filtered[0];
  renderDetail(selectedProduct);
}

function renderDetail(product) {
  if (!product) {
    if (elements.detailEmpty) {
      elements.detailEmpty.hidden = false;
    }
    if (elements.detailArticle) {
      elements.detailArticle.hidden = true;
    }
    return;
  }

  state.selectedId = product.id;

  if (elements.detailEmpty) {
    elements.detailEmpty.hidden = true;
  }
  if (elements.detailArticle) {
    elements.detailArticle.hidden = false;
  }
  if (elements.detailImage) {
    elements.detailImage.src = asText(product.cover);
    elements.detailImage.alt = asText(product.name);
  }
  if (elements.detailCategory) {
    elements.detailCategory.textContent = asText(product.category, "未分類");
  }
  if (elements.detailName) {
    elements.detailName.textContent = asText(product.name, "未命名商品");
  }
  if (elements.detailPrice) {
    elements.detailPrice.textContent = formatPrice(product.price, product.currency || state.siteCurrency);
  }
  if (elements.detailSubtitle) {
    elements.detailSubtitle.textContent = asText(product.subtitle);
  }
  if (elements.detailSummary) {
    elements.detailSummary.textContent = asText(product.summary);
  }

  const orderLink = asText(product.orderLink).trim();
  if (elements.detailOrderLink) {
    if (orderLink) {
      elements.detailOrderLink.href = orderLink;
      elements.detailOrderLink.textContent = "前往下單";
      elements.detailOrderLink.classList.remove("button-disabled");
      elements.detailOrderLink.setAttribute("aria-disabled", "false");
      elements.detailOrderLink.removeAttribute("tabindex");
    } else {
      elements.detailOrderLink.removeAttribute("href");
      elements.detailOrderLink.textContent = "尚未設定下單";
      elements.detailOrderLink.classList.add("button-disabled");
      elements.detailOrderLink.setAttribute("aria-disabled", "true");
      elements.detailOrderLink.setAttribute("tabindex", "-1");
    }
  }

  renderGallery(product);
  renderAccordions(product);
}

function renderGallery(product) {
  if (!elements.detailGallery) {
    return;
  }

  elements.detailGallery.innerHTML = "";
  const gallery = [product.cover, ...(Array.isArray(product.gallery) ? product.gallery : [])]
    .filter(Boolean)
    .map((item) => asText(item));
  const uniqueGallery = [...new Set(gallery)];

  uniqueGallery.forEach((imagePath) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-thumb";
    button.innerHTML = `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(asText(product.name))}">`;
    button.addEventListener("click", () => {
      if (elements.detailImage) {
        elements.detailImage.src = imagePath;
      }
    });
    elements.detailGallery.append(button);
  });
}

function renderAccordions(product) {
  if (!elements.detailSections) {
    return;
  }

  elements.detailSections.innerHTML = "";
  const sections = Array.isArray(product.sections) ? product.sections.filter(isFilledSection) : [];

  if (!sections.length) {
    elements.detailSections.innerHTML = `
      <details class="accordion-item" open>
        <summary>商品介紹</summary>
        <div class="accordion-content">目前尚未提供更多說明。</div>
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
      <summary>${escapeHtml(asText(section.title))}</summary>
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
  return escapeHtml(asText(content)).replaceAll("\n", "<br>");
}

function isFilledSection(section) {
  return (
    section &&
    typeof section.title === "string" &&
    typeof section.content === "string" &&
    (section.title.trim() || section.content.trim())
  );
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

function asText(value, fallback = "") {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
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
