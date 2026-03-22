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

const DEFAULT_SOCIAL_LINKS = {
  instagram: "",
  facebook: "",
  line: ""
};

const ALL_PRODUCTS_LABEL = "全部商品";

const SOCIAL_META = {
  instagram: {
    label: "Instagram",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.25"></rect>
        <circle cx="12" cy="12" r="3.5"></circle>
        <circle cx="16.75" cy="7.25" r="1"></circle>
      </svg>
    `
  },
  facebook: {
    label: "Facebook",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5"></circle>
        <path d="M13.15 18v-5.1h1.9l.4-2.4h-2.3V9.05c0-.78.26-1.3 1.36-1.3H15.6V5.7c-.54-.08-1.2-.15-2.13-.15-2.1 0-3.55 1.28-3.55 3.62v1.33H7.95v2.4h1.97V18Z"></path>
      </svg>
    `
  },
  line: {
    label: "LINE",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6.5C6 5.12 7.12 4 8.5 4h7C16.88 4 18 5.12 18 6.5v6C18 13.88 16.88 15 15.5 15H11l-3 2.4V15H8.5C7.12 15 6 13.88 6 12.5Z"></path>
        <path d="M9.5 8.4v3.15"></path>
        <path d="M12 8.4v3.15"></path>
        <path d="M14.5 8.4h-1.7v3.15h1.7"></path>
      </svg>
    `
  }
};

const state = {
  site: {
    title: "Tinnsi Bakery",
    tagline: "以溫暖色調與清楚的商品分類，整理出適合展示與分享的前台型錄。",
    contactEmail: "hello@tinnsi.example",
    currency: "TWD",
    socialLinks: { ...DEFAULT_SOCIAL_LINKS },
    theme: structuredClone(DEFAULT_THEME)
  },
  allProducts: [],
  activeProducts: [],
  selectedId: "",
  searchTerm: "",
  category: "",
  subcategory: "",
  categoryPanelOpen: false
};

const compactLayoutQuery = window.matchMedia("(max-width: 980px)");

const elements = {
  categoryPanel: document.querySelector("#category-panel"),
  categoryToggle: document.querySelector("#category-toggle"),
  categoryNav: document.querySelector("#category-nav"),
  siteTitle: document.querySelector("#site-title"),
  siteTagline: document.querySelector("#site-tagline"),
  siteContact: document.querySelector("#site-contact"),
  socialLinks: document.querySelector("#site-social-links"),
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
  if (elements.feedback) {
    elements.feedback.textContent = "商品資料載入失敗，請稍後再試。";
    elements.feedback.classList.add("is-error");
  }
});

async function bootstrap() {
  elements.searchInput?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  elements.categoryToggle?.addEventListener("click", () => {
    state.categoryPanelOpen = !state.categoryPanelOpen;
    renderCategoryPanelState();
  });

  if (typeof compactLayoutQuery.addEventListener === "function") {
    compactLayoutQuery.addEventListener("change", handleLayoutChange);
  } else if (typeof compactLayoutQuery.addListener === "function") {
    compactLayoutQuery.addListener(handleLayoutChange);
  }

  handleLayoutChange(compactLayoutQuery);

  const response = await fetch("./data/products.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load products.json: ${response.status}`);
  }

  const data = await response.json();
  state.site = normalizeSite(data.site);
  state.allProducts = Array.isArray(data.products) ? data.products.map(normalizeProduct) : [];
  state.activeProducts = state.allProducts.filter((product) => product.status === "active");

  applySiteMeta(state.site);
  renderCategoryMenu();
  renderActiveFilters();

  const preferredId = decodeURIComponent(window.location.hash.replace("#", ""));
  const initialProduct =
    state.activeProducts.find((product) => product.id === preferredId) ||
    state.activeProducts.find((product) => product.highlight) ||
    state.activeProducts[0] ||
    null;

  if (initialProduct) {
    syncFilterToProduct(initialProduct, { closePanel: false, renderMenu: true });
    state.selectedId = initialProduct.id;
  }

  renderCatalog();
  renderDetail(initialProduct);

  window.addEventListener("hashchange", () => {
    const nextId = decodeURIComponent(window.location.hash.replace("#", ""));
    const product = state.activeProducts.find((item) => item.id === nextId) || null;
    if (!product) {
      return;
    }

    syncFilterToProduct(product, { closePanel: false, renderMenu: true });
    state.selectedId = product.id;
    renderCatalog();
    renderDetail(product);
  });
}

function handleLayoutChange(event) {
  state.categoryPanelOpen = !event.matches;
  renderCategoryPanelState();
}

function renderCategoryPanelState() {
  if (!elements.categoryPanel || !elements.categoryToggle) {
    return;
  }

  const isCompact = compactLayoutQuery.matches;
  const isOpen = isCompact ? state.categoryPanelOpen : true;

  elements.categoryPanel.classList.toggle("is-open", isOpen);
  elements.categoryToggle.setAttribute("aria-expanded", String(isOpen));
  elements.categoryToggle.textContent = isOpen ? "收合分類" : "展開分類";
}

function applySiteMeta(site) {
  const title = asText(site.title, "Tinnsi Bakery");
  const tagline = asText(
    site.tagline,
    "以溫暖色調與清楚的商品分類，整理出適合展示與分享的前台型錄。"
  );
  const contact = asText(site.contactEmail, "hello@tinnsi.example");

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

  renderSocialLinks(site.socialLinks);
}

function renderSocialLinks(socialLinks = {}) {
  if (!elements.socialLinks) {
    return;
  }

  const links = normalizeSocialLinks(socialLinks);
  const availableEntries = Object.entries(SOCIAL_META).filter(([key]) => links[key]);
  elements.socialLinks.innerHTML = "";

  if (!availableEntries.length) {
    elements.socialLinks.hidden = true;
    return;
  }

  availableEntries.forEach(([key, meta]) => {
    const anchor = document.createElement("a");
    anchor.className = "social-link";
    anchor.href = links[key];
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.setAttribute("aria-label", meta.label);
    anchor.innerHTML = `${meta.icon}<span class="sr-only">${meta.label}</span>`;
    elements.socialLinks.append(anchor);
  });

  elements.socialLinks.hidden = false;
}

function renderCategoryMenu() {
  if (!elements.categoryNav) {
    return;
  }

  const tree = buildCategoryTree(state.activeProducts);
  elements.categoryNav.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = `category-menu-button category-menu-button-all${
    !state.category && !state.subcategory ? " is-active" : ""
  }`;
  allButton.textContent = ALL_PRODUCTS_LABEL;
  allButton.addEventListener("click", () => {
    updateFilters({ category: "", subcategory: "" });
  });
  elements.categoryNav.append(allButton);

  tree.forEach((group) => {
    const details = document.createElement("details");
    details.className = "category-group";
    details.open = state.category === group.name;

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <span class="category-label">${escapeHtml(group.name)}</span>
      <span class="category-count">${group.count}</span>
    `;
    details.append(summary);

    const submenu = document.createElement("div");
    submenu.className = "category-submenu";

    const allWithinCategory = document.createElement("button");
    allWithinCategory.type = "button";
    allWithinCategory.className = `category-submenu-button${
      state.category === group.name && !state.subcategory ? " is-active" : ""
    }`;
    allWithinCategory.textContent = `全部 ${group.name}`;
    allWithinCategory.addEventListener("click", () => {
      updateFilters({ category: group.name, subcategory: "" });
    });
    submenu.append(allWithinCategory);

    group.subcategories.forEach((child) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `category-submenu-button${
        state.category === group.name && state.subcategory === child.name ? " is-active" : ""
      }`;
      button.innerHTML = `
        <span>${escapeHtml(child.name)}</span>
        <span class="category-count">${child.count}</span>
      `;
      button.addEventListener("click", () => {
        updateFilters({ category: group.name, subcategory: child.name });
      });
      submenu.append(button);
    });

    details.append(submenu);
    elements.categoryNav.append(details);
  });
}

function renderActiveFilters() {
  if (!elements.categoryFilters) {
    return;
  }

  elements.categoryFilters.innerHTML = "";

  if (!state.category && !state.subcategory) {
    const chip = document.createElement("span");
    chip.className = "chip is-active";
    chip.textContent = ALL_PRODUCTS_LABEL;
    elements.categoryFilters.append(chip);
    return;
  }

  if (state.category) {
    const chip = document.createElement("span");
    chip.className = "chip is-active";
    chip.textContent = state.category;
    elements.categoryFilters.append(chip);
  }

  if (state.subcategory) {
    const chip = document.createElement("span");
    chip.className = "chip is-active";
    chip.textContent = state.subcategory;
    elements.categoryFilters.append(chip);
  }

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "chip";
  resetButton.textContent = "清除篩選";
  resetButton.addEventListener("click", () => {
    updateFilters({ category: "", subcategory: "" });
  });
  elements.categoryFilters.append(resetButton);
}

function updateFilters({ category, subcategory }) {
  state.category = category;
  state.subcategory = category ? subcategory : "";

  renderCategoryMenu();
  renderActiveFilters();
  renderCatalog();

  if (compactLayoutQuery.matches) {
    state.categoryPanelOpen = false;
    renderCategoryPanelState();
  }
}

function syncFilterToProduct(product, { closePanel = false, renderMenu = false } = {}) {
  state.category = asText(product?.category);
  state.subcategory = asText(product?.subcategory);

  if (renderMenu) {
    renderCategoryMenu();
    renderActiveFilters();
  }

  if (closePanel && compactLayoutQuery.matches) {
    state.categoryPanelOpen = false;
    renderCategoryPanelState();
  }
}

function renderCatalog() {
  const filtered = getFilteredProducts();

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

  if (!filtered.some((product) => product.id === state.selectedId)) {
    state.selectedId = filtered[0].id;
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
    const categoryMeta = formatCategoryLabel(product);
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
      <p class="product-card-meta">${escapeHtml(categoryMeta)}</p>
      <h3>${escapeHtml(asText(product.name))}</h3>
      <p class="product-card-subtitle">${escapeHtml(asText(product.subtitle))}</p>
      <p>${escapeHtml(asText(product.summary))}</p>
      <div class="product-card-footer">
        <span class="product-price">${formatPrice(product.price, product.currency || state.site.currency)}</span>
        <span class="product-sku">${escapeHtml(asText(product.sku))}</span>
      </div>
      <div class="product-card-actions">
        <button class="button button-secondary product-card-detail" type="button">查看詳情</button>
        ${
          orderLink
            ? `<a class="button button-primary product-card-order" href="${escapeAttribute(orderLink)}" target="_blank" rel="noreferrer">前往下單</a>`
            : `<button class="button button-disabled product-card-order" type="button" disabled>尚未設定</button>`
        }
      </div>
    `;

    const handleSelect = () => {
      state.selectedId = product.id;
      syncFilterToProduct(product, { closePanel: true, renderMenu: true });
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
    elements.detailCategory.textContent = formatCategoryLabel(product);
  }
  if (elements.detailName) {
    elements.detailName.textContent = asText(product.name, "未命名商品");
  }
  if (elements.detailPrice) {
    elements.detailPrice.textContent = formatPrice(product.price, product.currency || state.site.currency);
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
      elements.detailOrderLink.textContent = "尚未設定";
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
    details.open = index === 0;
    details.innerHTML = `
      <summary>${escapeHtml(asText(section.title))}</summary>
      <div class="accordion-content">${formatSectionContent(section.content)}</div>
    `;
    elements.detailSections.append(details);
  });
}

function getFilteredProducts() {
  return state.activeProducts.filter((product) => {
    const categoryMatches = !state.category || product.category === state.category;
    const subcategoryMatches = !state.subcategory || product.subcategory === state.subcategory;
    const searchMatches =
      !state.searchTerm ||
      [product.name, product.subtitle, product.category, product.subcategory, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(state.searchTerm));

    return categoryMatches && subcategoryMatches && searchMatches;
  });
}

function buildCategoryTree(products) {
  const groups = new Map();

  products.forEach((product) => {
    const categoryName = asText(product.category, "未分類");
    const subcategoryName = asText(product.subcategory);
    if (!groups.has(categoryName)) {
      groups.set(categoryName, {
        name: categoryName,
        count: 0,
        subcategories: new Map()
      });
    }

    const group = groups.get(categoryName);
    group.count += 1;

    if (subcategoryName) {
      const nextCount = group.subcategories.get(subcategoryName) || 0;
      group.subcategories.set(subcategoryName, nextCount + 1);
    }
  });

  return [...groups.values()]
    .sort((left, right) => left.name.localeCompare(right.name, "zh-Hant"))
    .map((group) => ({
      name: group.name,
      count: group.count,
      subcategories: [...group.subcategories.entries()]
        .sort(([left], [right]) => left.localeCompare(right, "zh-Hant"))
        .map(([name, count]) => ({ name, count }))
    }));
}

function formatCategoryLabel(product) {
  const category = asText(product.category, "未分類");
  const subcategory = asText(product.subcategory);
  return subcategory ? `${category} / ${subcategory}` : category;
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

function normalizeSite(site = {}) {
  return {
    title: asText(site.title, "Tinnsi Bakery"),
    tagline: asText(
      site.tagline,
      "以溫暖色調與清楚的商品分類，整理出適合展示與分享的前台型錄。"
    ),
    contactEmail: asText(site.contactEmail, "hello@tinnsi.example"),
    currency: asText(site.currency, "TWD"),
    socialLinks: normalizeSocialLinks(site.socialLinks),
    theme: normalizeTheme(site.theme)
  };
}

function normalizeSocialLinks(socialLinks = {}) {
  return {
    instagram: asText(socialLinks.instagram).trim(),
    facebook: asText(socialLinks.facebook).trim(),
    line: asText(socialLinks.line).trim()
  };
}

function normalizeProduct(product = {}) {
  return {
    id: asText(product.id),
    name: asText(product.name),
    subtitle: asText(product.subtitle),
    summary: asText(product.summary),
    price: typeof product.price === "number" ? product.price : product.price ? Number(product.price) : null,
    currency: asText(product.currency, "TWD"),
    category: asText(product.category, "未分類"),
    subcategory: asText(product.subcategory),
    sku: asText(product.sku),
    status: asText(product.status, "draft"),
    highlight: Boolean(product.highlight),
    cover: asText(product.cover),
    gallery: Array.isArray(product.gallery) ? uniqueStrings(product.gallery.filter(Boolean).map(asText)) : [],
    badges: Array.isArray(product.badges) ? uniqueStrings(product.badges.filter(Boolean).map(asText)) : [],
    orderLink: asText(product.orderLink),
    sections: Array.isArray(product.sections)
      ? product.sections
          .filter((section) => section && typeof section === "object")
          .map((section) => ({
            title: asText(section.title),
            content: asText(section.content)
          }))
      : []
  };
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

function uniqueStrings(list) {
  return [...new Set(list)];
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
