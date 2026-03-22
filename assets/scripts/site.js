const DEFAULT_THEME = {
  pageBg: "#F8F4ED",
  heroBg: "#F5E7D8",
  featureBg: "#FFF7F0",
  sidebarBg: "#FFF9F3",
  catalogBg: "#FFF9F3",
  detailBg: "#FFF7F0",
  cardBg: "#FFFFFF",
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
  email: ""
};

const DEFAULT_SITE = {
  title: "Tinnsi Bakery",
  tagline: "以溫暖色調與清楚分類整理出適合展示與分享的商品型錄。",
  contactEmail: "hello@tinnsi.example",
  socialLinks: structuredClone(DEFAULT_SOCIAL_LINKS),
  logoImage: "",
  heroFeatureImage: "",
  heroFeatureTitle: "",
  heroFeatureText: "",
  insuranceLabel: "產品責任險",
  insuranceImage: "",
  insuranceText: "可在後台填寫產品責任險的保險內容、保單圖片與補充說明。",
  aboutLabel: "關於我們",
  aboutImage: "",
  aboutText: "可在後台填寫品牌介紹、主視覺照片與品牌故事。",
  currency: "TWD",
  theme: structuredClone(DEFAULT_THEME)
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
  email: {
    label: "E-MAIL",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="6" width="17" height="12" rx="2"></rect>
        <path d="M4.5 7.5 12 13l7.5-5.5"></path>
      </svg>
    `
  }
};

const SITE_INFO_ITEMS = [
  {
    key: "insurance",
    labelKey: "insuranceLabel",
    imageKey: "insuranceImage",
    textKey: "insuranceText"
  },
  {
    key: "about",
    labelKey: "aboutLabel",
    imageKey: "aboutImage",
    textKey: "aboutText"
  }
];

const state = {
  site: structuredClone(DEFAULT_SITE),
  allProducts: [],
  activeProducts: [],
  selectedId: "",
  searchTerm: "",
  category: "",
  subcategory: "",
  isCategoryDrawerOpen: false,
  isDetailDrawerOpen: false,
  detailImagePath: "",
  activeSiteInfoKey: ""
};

const compactLayoutQuery = window.matchMedia("(max-width: 980px)");
const mobileDetailQuery = window.matchMedia("(max-width: 640px)");

const elements = {
  categoryPanel: document.querySelector("#category-panel"),
  categoryToggle: document.querySelector("#category-toggle"),
  categoryClose: document.querySelector("#category-close"),
  categoryBackdrop: document.querySelector("#category-backdrop"),
  detailPanel: document.querySelector("#detail-panel"),
  detailClose: document.querySelector("#detail-close"),
  detailBackdrop: document.querySelector("#detail-backdrop"),
  categoryNav: document.querySelector("#category-nav"),
  siteTitle: document.querySelector("#site-title"),
  siteTagline: document.querySelector("#site-tagline"),
  siteLogo: document.querySelector("#site-logo"),
  heroFeatureImage: document.querySelector("#hero-feature-image"),
  heroFeatureTitle: document.querySelector("#hero-feature-title"),
  heroFeatureText: document.querySelector("#hero-feature-text"),
  siteContact: document.querySelector("#site-contact"),
  siteInfoActions: document.querySelector("#site-info-actions"),
  socialLinks: document.querySelector("#site-social-links"),
  siteInfoBackdrop: document.querySelector("#site-info-backdrop"),
  siteInfoModal: document.querySelector("#site-info-modal"),
  siteInfoClose: document.querySelector("#site-info-close"),
  siteInfoTitle: document.querySelector("#site-info-title"),
  siteInfoMedia: document.querySelector("#site-info-media"),
  siteInfoImage: document.querySelector("#site-info-image"),
  siteInfoText: document.querySelector("#site-info-text"),
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

cleanupDuplicateDetailGallery();

bootstrap().catch((error) => {
  console.error(error);
  if (elements.feedback) {
    elements.feedback.textContent = "商品資料載入失敗，請稍後再試。";
    elements.feedback.classList.add("is-error");
  }
});

function cleanupDuplicateDetailGallery() {
  const detailGalleries = [...document.querySelectorAll("#detail-gallery")];
  detailGalleries.slice(1).forEach((node) => {
    node.closest("section")?.remove();
  });
}

async function bootstrap() {
  bindEvents();
  handleLayoutModeChange(compactLayoutQuery);
  handleDetailLayoutModeChange(mobileDetailQuery);
  subscribeLayoutChange();

  const response = await fetch("./data/products.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load products.json: ${response.status}`);
  }

  const data = await response.json();
  state.site = normalizeSite(data.site);
  state.allProducts = Array.isArray(data.products) ? data.products.map(normalizeProduct) : [];
  state.activeProducts = state.allProducts.filter((product) => product.status === "active");

  applySiteMeta();
  renderCategoryMenu();
  renderActiveFilters();

  const preferredId = decodeURIComponent(window.location.hash.replace("#", ""));
  const initialProduct =
    state.activeProducts.find((product) => product.id === preferredId) ||
    state.activeProducts.find((product) => product.highlight) ||
    state.activeProducts[0] ||
    null;

  if (initialProduct) {
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

    state.selectedId = product.id;
    renderCatalog();
    renderDetail(product);
    renderDetailDrawerState();
  });
}

function bindEvents() {
  elements.searchInput?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  elements.categoryToggle?.addEventListener("click", () => {
    state.isCategoryDrawerOpen = true;
    renderCategoryDrawerState();
  });

  elements.categoryClose?.addEventListener("click", () => {
    state.isCategoryDrawerOpen = false;
    renderCategoryDrawerState();
  });

  elements.categoryBackdrop?.addEventListener("click", () => {
    state.isCategoryDrawerOpen = false;
    renderCategoryDrawerState();
  });

  elements.detailClose?.addEventListener("click", () => {
    closeDetailDrawer();
  });

  elements.detailBackdrop?.addEventListener("click", () => {
    closeDetailDrawer();
  });

  elements.siteInfoClose?.addEventListener("click", () => {
    closeSiteInfoModal();
  });

  elements.siteInfoBackdrop?.addEventListener("click", () => {
    closeSiteInfoModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (state.isCategoryDrawerOpen) {
      state.isCategoryDrawerOpen = false;
      renderCategoryDrawerState();
    }

    if (state.isDetailDrawerOpen) {
      closeDetailDrawer();
    }

    if (state.activeSiteInfoKey) {
      closeSiteInfoModal();
    }
  });
}

function subscribeLayoutChange() {
  if (typeof compactLayoutQuery.addEventListener === "function") {
    compactLayoutQuery.addEventListener("change", handleLayoutModeChange);
  } else if (typeof compactLayoutQuery.addListener === "function") {
    compactLayoutQuery.addListener(handleLayoutModeChange);
  }

  if (typeof mobileDetailQuery.addEventListener === "function") {
    mobileDetailQuery.addEventListener("change", handleDetailLayoutModeChange);
  } else if (typeof mobileDetailQuery.addListener === "function") {
    mobileDetailQuery.addListener(handleDetailLayoutModeChange);
  }
}

function handleLayoutModeChange(event) {
  if (!event.matches) {
    state.isCategoryDrawerOpen = false;
  }
  renderCategoryDrawerState();
}

function handleDetailLayoutModeChange(event) {
  if (!event.matches) {
    state.isDetailDrawerOpen = false;
  }
  renderDetailDrawerState();
}

function renderCategoryDrawerState() {
  const isCompact = compactLayoutQuery.matches;
  const isOpen = isCompact ? state.isCategoryDrawerOpen : true;

  if (elements.categoryPanel) {
    elements.categoryPanel.classList.toggle("is-open", isOpen);
  }
  if (elements.categoryBackdrop) {
    elements.categoryBackdrop.hidden = !isCompact || !isOpen;
  }
  if (elements.categoryToggle) {
    elements.categoryToggle.hidden = !isCompact;
    elements.categoryToggle.setAttribute("aria-expanded", String(isOpen));
  }
  if (elements.categoryClose) {
    elements.categoryClose.hidden = !isCompact;
  }
}

function renderDetailDrawerState() {
  const isMobileDetail = mobileDetailQuery.matches;
  const isOpen = isMobileDetail ? state.isDetailDrawerOpen : true;

  if (elements.detailPanel) {
    elements.detailPanel.classList.toggle("is-open", isOpen);
  }
  if (elements.detailBackdrop) {
    elements.detailBackdrop.hidden = !isMobileDetail || !isOpen;
  }
  if (elements.detailClose) {
    elements.detailClose.hidden = !isMobileDetail;
  }
}

function closeDetailDrawer() {
  state.isDetailDrawerOpen = false;
  renderDetailDrawerState();
}

function selectProduct(product, { openDetail = false } = {}) {
  if (!product) {
    return;
  }

  state.selectedId = product.id;

  const nextHash = `#${encodeURIComponent(product.id)}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = encodeURIComponent(product.id);
  }

  renderCatalog();
  renderDetail(product);

  if (mobileDetailQuery.matches) {
    state.isDetailDrawerOpen = openDetail;
    renderDetailDrawerState();
  }
}

function applySiteMeta() {
  const site = state.site;
  const featuredProduct =
    state.activeProducts.find((product) => product.highlight) ||
    state.activeProducts[0] ||
    null;
  const featureImage = site.heroFeatureImage || featuredProduct?.cover || "";
  const featureTitle = site.heroFeatureTitle || featuredProduct?.name || "本週精選";
  const featureText =
    site.heroFeatureText ||
    site.tagline ||
    "以一張主視覺照片搭配一句短文，呈現目前主打商品與品牌氛圍。";

  document.title = site.title;
  applySiteTheme(normalizeTheme(site.theme));

  if (elements.siteTitle) {
    elements.siteTitle.textContent = site.title;
  }
  if (elements.siteTagline) {
    elements.siteTagline.textContent = site.tagline;
  }
  if (elements.siteContact) {
    elements.siteContact.textContent = `聯絡我們：${site.contactEmail}`;
  }
  if (elements.siteLogo) {
    if (site.logoImage) {
      elements.siteLogo.hidden = false;
      elements.siteLogo.src = site.logoImage;
      elements.siteLogo.alt = `${site.title} Logo`;
    } else {
      elements.siteLogo.hidden = true;
      elements.siteLogo.removeAttribute("src");
      elements.siteLogo.alt = "";
    }
  }
  if (elements.heroFeatureImage) {
    elements.heroFeatureImage.src = featureImage;
    elements.heroFeatureImage.alt = featureTitle;
  }
  if (elements.heroFeatureTitle) {
    elements.heroFeatureTitle.textContent = featureTitle;
  }
  if (elements.heroFeatureText) {
    elements.heroFeatureText.textContent = featureText;
  }

  renderSiteInfoActions(site);
  renderSocialLinks(site.socialLinks, site.contactEmail);
}

function renderSocialLinks(socialLinks = {}, contactEmail = "") {
  if (!elements.socialLinks) {
    return;
  }

  const links = normalizeSocialLinks(socialLinks, contactEmail);
  const availableEntries = Object.entries(SOCIAL_META).filter(([key]) => Boolean(links[key]));
  elements.socialLinks.innerHTML = "";

  if (!availableEntries.length) {
    elements.socialLinks.hidden = true;
    return;
  }

  availableEntries.forEach(([key, meta]) => {
    const anchor = document.createElement("a");
    anchor.className = "social-link";
    anchor.href = links[key];
    anchor.setAttribute("aria-label", meta.label);

    if (links[key].startsWith("mailto:")) {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    } else {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }

    anchor.innerHTML = `${meta.icon}<span class="sr-only">${meta.label}</span>`;
    elements.socialLinks.append(anchor);
  });

  elements.socialLinks.hidden = false;
}

function renderSiteInfoActions(site) {
  if (!elements.siteInfoActions) {
    return;
  }

  elements.siteInfoActions.innerHTML = "";
  const entries = getSiteInfoEntries(site);

  if (!entries.length) {
    elements.siteInfoActions.hidden = true;
    closeSiteInfoModal();
    return;
  }

  elements.siteInfoActions.hidden = false;

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "site-info-trigger";
    button.textContent = entry.label;
    button.addEventListener("click", () => {
      openSiteInfoModal(entry.key);
    });
    elements.siteInfoActions.append(button);
  });
}

function getSiteInfoEntries(site) {
  return SITE_INFO_ITEMS
    .map((item) => ({
      key: item.key,
      label: asText(site[item.labelKey]).trim(),
      image: asText(site[item.imageKey]).trim(),
      text: asText(site[item.textKey]).trim()
    }))
    .filter((item) => item.label && (item.image || item.text));
}

function openSiteInfoModal(key) {
  const entry = getSiteInfoEntries(state.site).find((item) => item.key === key);
  if (!entry || !elements.siteInfoModal) {
    return;
  }

  state.activeSiteInfoKey = key;

  if (elements.siteInfoTitle) {
    elements.siteInfoTitle.textContent = entry.label;
  }
  if (elements.siteInfoText) {
    elements.siteInfoText.textContent = entry.text || "";
  }
  if (elements.siteInfoImage && elements.siteInfoMedia) {
    if (entry.image) {
      elements.siteInfoMedia.hidden = false;
      elements.siteInfoImage.src = entry.image;
      elements.siteInfoImage.alt = entry.label;
    } else {
      elements.siteInfoMedia.hidden = true;
      elements.siteInfoImage.removeAttribute("src");
      elements.siteInfoImage.alt = "";
    }
  }

  elements.siteInfoModal.hidden = false;
  if (elements.siteInfoBackdrop) {
    elements.siteInfoBackdrop.hidden = false;
  }
}

function closeSiteInfoModal() {
  state.activeSiteInfoKey = "";
  if (elements.siteInfoModal) {
    elements.siteInfoModal.hidden = true;
  }
  if (elements.siteInfoBackdrop) {
    elements.siteInfoBackdrop.hidden = true;
  }
}

function renderCategoryMenu() {
  if (!elements.categoryNav) {
    return;
  }

  const groups = buildCategoryTree(state.activeProducts);
  elements.categoryNav.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = `category-menu-button${!state.category && !state.subcategory ? " is-active" : ""}`;
  allButton.textContent = ALL_PRODUCTS_LABEL;
  allButton.addEventListener("click", () => {
    updateFilters({ category: "", subcategory: "" });
  });
  elements.categoryNav.append(allButton);

  groups.forEach((group) => {
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

    const categoryButton = document.createElement("button");
    categoryButton.type = "button";
    categoryButton.className = `category-submenu-button${state.category === group.name && !state.subcategory ? " is-active" : ""}`;
    categoryButton.innerHTML = `
      <span>全部 ${escapeHtml(group.name)}</span>
      <span class="category-count">${group.count}</span>
    `;
    categoryButton.addEventListener("click", () => {
      updateFilters({ category: group.name, subcategory: "" });
    });
    submenu.append(categoryButton);

    group.subcategories.forEach((subcategory) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `category-submenu-button${
        state.category === group.name && state.subcategory === subcategory.name ? " is-active" : ""
      }`;
      button.innerHTML = `
        <span>${escapeHtml(subcategory.name)}</span>
        <span class="category-count">${subcategory.count}</span>
      `;
      button.addEventListener("click", () => {
        updateFilters({ category: group.name, subcategory: subcategory.name });
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
    const categoryChip = document.createElement("span");
    categoryChip.className = "chip is-active";
    categoryChip.textContent = state.category;
    elements.categoryFilters.append(categoryChip);
  }

  if (state.subcategory) {
    const subcategoryChip = document.createElement("span");
    subcategoryChip.className = "chip is-active";
    subcategoryChip.textContent = state.subcategory;
    elements.categoryFilters.append(subcategoryChip);
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
    state.isCategoryDrawerOpen = false;
    renderCategoryDrawerState();
  }
}

function syncFiltersToProduct(product, { renderMenus = false } = {}) {
  state.category = asText(product?.category, "未分類");
  state.subcategory = asText(product?.subcategory);

  if (renderMenus) {
    renderCategoryMenu();
    renderActiveFilters();
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
    closeDetailDrawer();
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
    const handleSelect = ({ openDetail = false } = {}) => {
      selectProduct(product, { openDetail });
    };

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
      <p class="product-card-meta">${escapeHtml(formatCategoryLabel(product))}</p>
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
      handleSelect({ openDetail: mobileDetailQuery.matches });
    });

    card.querySelector(".product-card-order")?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    elements.grid?.append(card);
  });

  const selectedProduct = filtered.find((product) => product.id === state.selectedId) || filtered[0];
  renderDetail(selectedProduct);
  renderDetailDrawerState();
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
  const galleryImages = getUniqueGalleryImages(product);
  state.detailImagePath = galleryImages[0] || "";

  if (elements.detailEmpty) {
    elements.detailEmpty.hidden = true;
  }
  if (elements.detailArticle) {
    elements.detailArticle.hidden = false;
  }
  if (elements.detailImage) {
    elements.detailImage.src = state.detailImagePath;
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
  const uniqueGallery = getUniqueGalleryImages(product);

  uniqueGallery.forEach((imagePath) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `gallery-thumb${state.detailImagePath === imagePath ? " is-active" : ""}`;
    button.setAttribute("aria-pressed", String(state.detailImagePath === imagePath));
    button.innerHTML = `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(asText(product.name))}">`;
    button.addEventListener("click", () => {
      state.detailImagePath = imagePath;
      if (elements.detailImage) {
        elements.detailImage.src = imagePath;
        elements.detailImage.alt = asText(product.name);
      }
      elements.detailGallery
        ?.querySelectorAll(".gallery-thumb")
        .forEach((thumb) => {
          const isActive = thumb === button;
          thumb.classList.toggle("is-active", isActive);
          thumb.setAttribute("aria-pressed", String(isActive));
        });
    });
    elements.detailGallery.append(button);
  });
}

function getUniqueGalleryImages(product) {
  const gallery = [product.cover, ...(Array.isArray(product.gallery) ? product.gallery : [])]
    .filter(Boolean)
    .map((item) => asText(item));
  return [...new Set(gallery)];
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

function normalizeSite(site = {}) {
  return {
    title: asText(site.title, DEFAULT_SITE.title),
    tagline: asText(site.tagline, DEFAULT_SITE.tagline),
    contactEmail: asText(site.contactEmail, DEFAULT_SITE.contactEmail),
    socialLinks: normalizeSocialLinks(site.socialLinks, site.contactEmail),
    logoImage: asText(site.logoImage),
    heroFeatureImage: asText(site.heroFeatureImage),
    heroFeatureTitle: asText(site.heroFeatureTitle),
    heroFeatureText: asText(site.heroFeatureText),
    insuranceLabel: asText(site.insuranceLabel, DEFAULT_SITE.insuranceLabel),
    insuranceImage: asText(site.insuranceImage),
    insuranceText: asText(site.insuranceText, DEFAULT_SITE.insuranceText),
    aboutLabel: asText(site.aboutLabel, DEFAULT_SITE.aboutLabel),
    aboutImage: asText(site.aboutImage),
    aboutText: asText(site.aboutText, DEFAULT_SITE.aboutText),
    currency: asText(site.currency, DEFAULT_SITE.currency),
    theme: normalizeTheme(site.theme)
  };
}

function normalizeSocialLinks(socialLinks = {}, contactEmail = "") {
  const emailValue = asText(socialLinks.email || contactEmail).trim();
  return {
    instagram: asText(socialLinks.instagram).trim(),
    facebook: asText(socialLinks.facebook).trim(),
    email: normalizeEmailLink(emailValue)
  };
}

function normalizeEmailLink(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("mailto:")) {
    return value;
  }

  if (value.includes("@") && !value.includes("://")) {
    return `mailto:${value}`;
  }

  return value;
}

function normalizeProduct(product = {}) {
  return {
    id: asText(product.id),
    name: asText(product.name),
    subtitle: asText(product.subtitle),
    summary: asText(product.summary),
    price: typeof product.price === "number" ? product.price : product.price ? Number(product.price) : null,
    currency: asText(product.currency, DEFAULT_SITE.currency),
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
  const aliases = {
    pageBg: ["pageBg", "pageStart", "pageEnd"],
    heroBg: ["heroBg", "heroStart", "heroEnd"],
    featureBg: ["featureBg", "heroPanel", "heroEnd"],
    sidebarBg: ["sidebarBg", "catalogPanel"],
    catalogBg: ["catalogBg", "catalogPanel"],
    detailBg: ["detailBg", "detailPanel"],
    cardBg: ["cardBg", "card"],
    accent: ["accent"],
    accentDeep: ["accentDeep"],
    accentText: ["accentText"],
    ink: ["ink"],
    muted: ["muted"],
    line: ["line"]
  };

  return Object.fromEntries(
    Object.entries(DEFAULT_THEME).map(([key, fallback]) => {
      const sourceKey = aliases[key].find((candidate) => theme?.[candidate]);
      return [key, normalizeHexColor(sourceKey ? theme[sourceKey] : "", fallback)];
    })
  );
}

function applySiteTheme(theme) {
  const root = document.documentElement;
  const values = {
    "--page-bg": theme.pageBg,
    "--hero-bg": theme.heroBg,
    "--feature-bg": theme.featureBg,
    "--sidebar-bg": theme.sidebarBg,
    "--catalog-bg": theme.catalogBg,
    "--detail-bg": theme.detailBg,
    "--card-bg": theme.cardBg,
    "--accent": theme.accent,
    "--accent-deep": theme.accentDeep,
    "--accent-text": theme.accentText,
    "--ink": theme.ink,
    "--muted": theme.muted,
    "--line-color": theme.line,
    "--line": withAlpha(theme.line, 0.4),
    "--line-strong": withAlpha(theme.line, 0.68),
    "--accent-08": withAlpha(theme.accent, 0.08),
    "--accent-10": withAlpha(theme.accent, 0.1),
    "--accent-12": withAlpha(theme.accent, 0.12),
    "--accent-16": withAlpha(theme.accent, 0.16),
    "--accent-20": withAlpha(theme.accent, 0.2),
    "--accent-28": withAlpha(theme.accent, 0.28),
    "--accent-deep-08": withAlpha(theme.accentDeep, 0.08),
    "--accent-deep-10": withAlpha(theme.accentDeep, 0.1),
    "--accent-deep-12": withAlpha(theme.accentDeep, 0.12),
    "--accent-deep-18": withAlpha(theme.accentDeep, 0.18),
    "--shadow": `0 24px 60px ${withAlpha(theme.accentDeep, 0.14)}`,
    "--card-shadow": `0 20px 40px ${withAlpha(theme.accentDeep, 0.12)}`
  };

  Object.entries(values).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
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
