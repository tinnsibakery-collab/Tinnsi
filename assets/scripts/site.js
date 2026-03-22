const state = {
  allProducts: [],
  activeProducts: [],
  selectedId: "",
  searchTerm: "",
  category: "全部",
  siteCurrency: "TWD"
};

const elements = {
  siteTitle: document.querySelector("#site-title"),
  siteTagline: document.querySelector("#site-tagline"),
  siteContact: document.querySelector("#site-contact"),
  activeCount: document.querySelector("#active-count"),
  lastUpdated: document.querySelector("#last-updated"),
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
  elements.feedback.textContent = "產品資料載入失敗，請確認 data/products.json 是否存在。";
});

async function bootstrap() {
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
    if (product) {
      state.selectedId = product.id;
      renderCatalog();
      renderDetail(product);
    }
  });
}

function applySiteMeta(site = {}) {
  const title = site.title || "Tinnsi 產品型錄";
  state.siteCurrency = site.currency || "TWD";
  document.title = title;
  elements.siteTitle.textContent = title;
  elements.siteTagline.textContent = site.tagline || "讓產品照片、簡短介紹與訂購動線成為畫面的主角。";
  elements.siteContact.textContent = site.contactEmail
    ? `聯絡信箱：${site.contactEmail}`
    : "如需合作或客製化，請在商品訂購單中留下需求。";
  elements.activeCount.textContent = String(state.activeProducts.length);
  elements.lastUpdated.textContent = formatDate(site.updatedAt || latestProductUpdate(state.allProducts));
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
        .some((value) => value.toLowerCase().includes(state.searchTerm));

    return categoryMatches && searchMatches;
  });

  elements.grid.innerHTML = "";
  if (!filtered.length) {
    elements.feedback.textContent = "目前沒有符合條件的商品。";
    elements.detailEmpty.hidden = false;
    elements.detailArticle.hidden = true;
    return;
  }

  elements.feedback.textContent = `共顯示 ${filtered.length} 項商品`;

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
        <button class="button button-secondary product-card-detail" type="button">查看內容</button>
        ${
          orderLink
            ? `<a class="button button-primary product-card-order" href="${escapeAttribute(orderLink)}" target="_blank" rel="noreferrer">填寫訂購單</a>`
            : `<button class="button button-disabled product-card-order" type="button" disabled>尚未設定訂購單</button>`
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

    const detailButton = card.querySelector(".product-card-detail");
    detailButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      handleSelect();
    });

    const orderButton = card.querySelector(".product-card-order");
    orderButton?.addEventListener("click", (event) => {
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
  elements.detailName.textContent = product.name || "未命名產品";
  elements.detailPrice.textContent = formatPrice(product.price, product.currency || state.siteCurrency);
  elements.detailSubtitle.textContent = product.subtitle || "";
  elements.detailSummary.textContent = product.summary || "";

  if (product.orderLink?.trim()) {
    elements.detailOrderLink.href = product.orderLink.trim();
    elements.detailOrderLink.textContent = "填寫訂購單";
    elements.detailOrderLink.classList.remove("button-disabled");
    elements.detailOrderLink.setAttribute("aria-disabled", "false");
    elements.detailOrderLink.removeAttribute("tabindex");
  } else {
    elements.detailOrderLink.removeAttribute("href");
    elements.detailOrderLink.textContent = "尚未設定訂購單";
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
        <summary>更多資訊</summary>
        <div class="accordion-content">此商品目前尚未設定折頁內容，可在本機後台新增。</div>
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
    return "價格待洽";
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
    return "尚未設定";
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
