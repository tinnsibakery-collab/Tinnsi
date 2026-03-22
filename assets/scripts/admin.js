const STORAGE_KEYS = {
  settings: "catalog-admin-settings",
  token: "catalog-admin-token",
  sessionToken: "catalog-admin-session-token",
  publishNote: "catalog-admin-publish-note"
};

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

const THEME_GROUPS = [
  {
    title: "頁面背景",
    note: "控制整體背景漸層與空間氛圍。",
    fields: [
      { key: "pageStart", label: "背景起點", description: "頁面漸層左上色" },
      { key: "pageEnd", label: "背景終點", description: "頁面漸層底色" },
      { key: "pageGlow", label: "背景光暈", description: "背景裝飾色" }
    ]
  },
  {
    title: "主視覺",
    note: "控制首頁頭圖、資訊小卡與第一眼主色。",
    fields: [
      { key: "heroStart", label: "主視覺起點", description: "Hero 區塊漸層起點" },
      { key: "heroEnd", label: "主視覺終點", description: "Hero 區塊漸層終點" },
      { key: "heroPanel", label: "資訊面板", description: "Hero 右側資訊卡底色" }
    ]
  },
  {
    title: "內容區塊",
    note: "商品列表、商品詳情與卡片都能分開調整。",
    fields: [
      { key: "catalogPanel", label: "列表面板", description: "商品列表區塊底色" },
      { key: "detailPanel", label: "詳情面板", description: "商品詳情區塊底色" },
      { key: "card", label: "商品卡片", description: "商品卡與折疊卡底色" }
    ]
  },
  {
    title: "重點色與文字",
    note: "按鈕、標題、邊線與文字閱讀性。",
    fields: [
      { key: "accent", label: "主要按鈕", description: "主按鈕與重點色" },
      { key: "accentDeep", label: "深色強調", description: "標題、分類與次強調色" },
      { key: "accentText", label: "按鈕文字", description: "主按鈕上的文字色" },
      { key: "ink", label: "主要文字", description: "正文與標題文字色" },
      { key: "muted", label: "次要文字", description: "說明文與輔助文字色" },
      { key: "line", label: "邊線", description: "卡片與分隔線顏色" }
    ]
  }
];

const THEME_KEYS = THEME_GROUPS.flatMap((group) => group.fields.map((field) => field.key));

const DEFAULT_SITE = {
  title: "Tinnsi 產品型錄",
  tagline: "用靜態站穩定呈現產品內容，並從本機後台直接發佈到 GitHub。",
  contactEmail: "",
  currency: "TWD",
  theme: structuredClone(DEFAULT_THEME),
  updatedAt: ""
};

const PRODUCT_TEMPLATE = {
  id: "",
  name: "",
  subtitle: "",
  summary: "",
  price: null,
  currency: "TWD",
  category: "",
  sku: "",
  status: "draft",
  highlight: false,
  cover: "",
  gallery: [],
  badges: [],
  orderLink: "",
  sections: [],
  updatedAt: ""
};

const state = {
  site: structuredClone(DEFAULT_SITE),
  products: [],
  currentIndex: 0,
  dataFileSha: "",
  siteDirty: false,
  settings: {
    owner: "",
    repo: "",
    branch: "main",
    token: "",
    rememberToken: false,
    publishNote: ""
  }
};

const elements = {
  githubOwner: document.querySelector("#github-owner"),
  githubRepo: document.querySelector("#github-repo"),
  githubBranch: document.querySelector("#github-branch"),
  githubToken: document.querySelector("#github-token"),
  githubTokenGroup: document.querySelector("#github-token")?.closest("label"),
  rememberToken: document.querySelector("#remember-token"),
  rememberTokenGroup: document.querySelector("#remember-token")?.closest("label"),
  githubPanel: document.querySelector("#github-form")?.closest(".panel"),
  githubPanelHeading: document.querySelector("#github-form")?.closest(".panel")?.querySelector(".panel-heading"),
  publishNote: document.querySelector("#publish-note"),
  testConnection: document.querySelector("#test-connection"),
  loadRepo: document.querySelector("#load-repo"),
  publishAll: document.querySelector("#publish-all"),
  downloadBackup: document.querySelector("#download-backup"),
  importBackup: document.querySelector("#import-backup"),
  statusLog: document.querySelector("#status-log"),
  pagesLink: document.querySelector("#pages-link"),
  siteTitle: document.querySelector("#site-title-input"),
  siteTagline: document.querySelector("#site-tagline-input"),
  siteContact: document.querySelector("#site-contact-input"),
  siteCurrency: document.querySelector("#site-currency-input"),
  themeEditor: document.querySelector("#theme-editor"),
  addProduct: document.querySelector("#add-product"),
  duplicateProduct: document.querySelector("#duplicate-product"),
  deleteProduct: document.querySelector("#delete-product"),
  dirtyIndicator: document.querySelector("#dirty-indicator"),
  productList: document.querySelector("#product-list"),
  addSection: document.querySelector("#add-section"),
  sectionsEditor: document.querySelector("#sections-editor"),
  imageInput: document.querySelector("#image-input"),
  setCoverOnUpload: document.querySelector("#set-cover-on-upload"),
  uploadImages: document.querySelector("#upload-images"),
  galleryPreview: document.querySelector("#gallery-preview"),
  productFields: {
    id: document.querySelector("#product-id"),
    name: document.querySelector("#product-name"),
    subtitle: document.querySelector("#product-subtitle"),
    summary: document.querySelector("#product-summary"),
    category: document.querySelector("#product-category"),
    sku: document.querySelector("#product-sku"),
    price: document.querySelector("#product-price"),
    currency: document.querySelector("#product-currency"),
    status: document.querySelector("#product-status"),
    highlight: document.querySelector("#product-highlight"),
    orderLink: document.querySelector("#product-order-link"),
    cover: document.querySelector("#product-cover"),
    badges: document.querySelector("#product-badges"),
    gallery: document.querySelector("#product-gallery")
  }
};

let hydratingProductForm = false;
let hydratingSiteForm = false;
let busy = false;
const DESKTOP_BRIDGE = {
  available: false,
  hasToken: false,
  autoPublish: false,
  settingsSignature: "",
  snapshotSignature: "",
  snapshotLoopId: 0
};
let desktopSyncTimerId = 0;
let githubPanelManualState = false;

bootstrap().catch((error) => {
  appendStatus(`初始化失敗：${error.message}`, true);
  console.error(error);
});

async function bootstrap() {
  restoreSettings();
  bindEvents();
  setupThemeEditor();
  setupGitHubPanel();
  setGitHubPanelCollapsed(true);
  setupPublishShortcut();
  await loadLocalSeedData();
  renderEverything();
  await bootstrapDesktopBridge();
  appendStatus("已載入本機示範資料，完成 GitHub 設定後即可開始發佈。");
}

function bindEvents() {
  [
    elements.githubOwner,
    elements.githubRepo,
    elements.githubBranch,
    elements.githubToken,
    elements.rememberToken,
    elements.publishNote
  ].forEach((input) => {
    input.addEventListener("input", persistSettings);
    input.addEventListener("change", persistSettings);
  });

  [
    elements.siteTitle,
    elements.siteTagline,
    elements.siteContact,
    elements.siteCurrency
  ].forEach((field) => {
    field.addEventListener("input", handleSiteInput);
  });

  Object.values(elements.productFields).forEach((field) => {
    field.addEventListener("input", handleProductInput);
    field.addEventListener("change", handleProductInput);
  });

  elements.testConnection.addEventListener("click", handleTestConnection);
  elements.loadRepo.addEventListener("click", handleLoadFromGitHub);
  elements.publishAll.addEventListener("click", handlePublish);
  elements.downloadBackup.addEventListener("click", downloadBackup);
  elements.importBackup.addEventListener("change", importBackup);
  elements.addProduct.addEventListener("click", createProduct);
  elements.duplicateProduct.addEventListener("click", duplicateProduct);
  elements.deleteProduct.addEventListener("click", deleteCurrentProduct);
  elements.addSection.addEventListener("click", addSection);
  elements.uploadImages.addEventListener("click", uploadSelectedImages);
}

async function loadLocalSeedData() {
  const response = await fetch("../data/products.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("無法載入本機 data/products.json");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("本機商品資料格式錯誤，請重新載入或匯入備份。");
  }
  applyData(data);
  state.dataFileSha = "";
}

function applyData(data) {
  state.site = normalizeSite(data.site);
  state.products = Array.isArray(data.products) && data.products.length
    ? data.products.map(normalizeProduct)
    : [createEmptyProduct()];
  state.currentIndex = Math.min(state.currentIndex, state.products.length - 1);
  state.siteDirty = false;
}

function renderEverything() {
  renderSettings();
  renderSiteForm();
  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  renderPagesLink();
}

function restoreSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    const saved = raw ? JSON.parse(raw) : {};
    const rememberToken = Boolean(saved.rememberToken);
    const persistedToken = rememberToken
      ? localStorage.getItem(STORAGE_KEYS.token) || ""
      : sessionStorage.getItem(STORAGE_KEYS.sessionToken) || "";

    state.settings = {
      owner: saved.owner || "",
      repo: saved.repo || "",
      branch: saved.branch || "main",
      token: persistedToken,
      rememberToken,
      publishNote: localStorage.getItem(STORAGE_KEYS.publishNote) || ""
    };
  } catch (error) {
    localStorage.removeItem(STORAGE_KEYS.settings);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.publishNote);
    sessionStorage.removeItem(STORAGE_KEYS.sessionToken);
    state.settings = {
      owner: "",
      repo: "",
      branch: "main",
      token: "",
      rememberToken: false,
      publishNote: ""
    };
  }
}

function persistSettings() {
  state.settings.owner = elements.githubOwner.value.trim();
  state.settings.repo = elements.githubRepo.value.trim();
  state.settings.branch = elements.githubBranch.value.trim() || "main";
  state.settings.token = elements.githubToken.value.trim();
  state.settings.rememberToken = elements.rememberToken.checked;
  state.settings.publishNote = elements.publishNote.value.trim();

  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({
      owner: state.settings.owner,
      repo: state.settings.repo,
      branch: state.settings.branch,
      rememberToken: state.settings.rememberToken
    })
  );
  localStorage.setItem(STORAGE_KEYS.publishNote, state.settings.publishNote);

  if (state.settings.rememberToken) {
    localStorage.setItem(STORAGE_KEYS.token, state.settings.token);
    sessionStorage.removeItem(STORAGE_KEYS.sessionToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
    if (state.settings.token) {
      sessionStorage.setItem(STORAGE_KEYS.sessionToken, state.settings.token);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.sessionToken);
    }
  }

  renderPagesLink();
  void syncDesktopSettings(true);
  if (hasDirtyChanges()) {
    scheduleDesktopSync({ force: true });
  }
}

function setupThemeEditor() {
  if (!elements.themeEditor) {
    return;
  }

  elements.themeEditor.innerHTML = THEME_GROUPS.map((group) => `
    <section class="theme-group">
      <div class="theme-group-header">
        <div>
          <p class="eyebrow">THEME</p>
          <h3>${escapeHtml(group.title)}</h3>
        </div>
        <p class="panel-note">${escapeHtml(group.note)}</p>
      </div>
      <div class="theme-grid">
        ${group.fields.map((field) => `
          <label class="theme-field" data-theme-key="${field.key}">
            <span class="theme-field-copy">
              <strong>${escapeHtml(field.label)}</strong>
              <small>${escapeHtml(field.description)}</small>
            </span>
            <span class="theme-field-controls">
              <input class="theme-color" type="color" data-theme-key="${field.key}">
              <input class="theme-hex" type="text" inputmode="text" maxlength="7" spellcheck="false" data-theme-key="${field.key}">
            </span>
          </label>
        `).join("")}
      </div>
    </section>
  `).join("");

  elements.themeEditor.addEventListener("input", handleThemeInput);
  elements.themeEditor.addEventListener("change", handleThemeInput);
  renderThemeForm();
}

function renderThemeForm() {
  if (!elements.themeEditor) {
    return;
  }

  const theme = normalizeTheme(state.site.theme);
  THEME_KEYS.forEach((key) => {
    const colorInput = elements.themeEditor.querySelector(`.theme-color[data-theme-key="${key}"]`);
    const hexInput = elements.themeEditor.querySelector(`.theme-hex[data-theme-key="${key}"]`);
    if (colorInput instanceof HTMLInputElement) {
      colorInput.value = theme[key];
    }
    if (hexInput instanceof HTMLInputElement) {
      hexInput.value = theme[key];
      hexInput.classList.remove("is-invalid");
    }
  });
}

function handleThemeInput(event) {
  if (hydratingSiteForm || !elements.themeEditor) {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const key = target.dataset.themeKey;
  if (!key || !THEME_KEYS.includes(key)) {
    return;
  }

  const currentValue = normalizeTheme(state.site.theme)[key];
  let nextValue = currentValue;

  if (target.classList.contains("theme-color")) {
    nextValue = normalizeHexColor(target.value, currentValue);
    const pair = elements.themeEditor.querySelector(`.theme-hex[data-theme-key="${key}"]`);
    if (pair instanceof HTMLInputElement) {
      pair.value = nextValue;
      pair.classList.remove("is-invalid");
    }
  } else {
    const normalized = normalizeHexColor(target.value, "");
    if (!normalized) {
      target.classList.add("is-invalid");
      if (event.type === "change") {
        target.value = currentValue;
        target.classList.remove("is-invalid");
      }
      return;
    }

    nextValue = normalized;
    target.value = nextValue;
    target.classList.remove("is-invalid");
    const pair = elements.themeEditor.querySelector(`.theme-color[data-theme-key="${key}"]`);
    if (pair instanceof HTMLInputElement) {
      pair.value = nextValue;
    }
  }

  state.site = normalizeSite({
    ...state.site,
    theme: {
      ...state.site.theme,
      [key]: nextValue
    }
  });
  state.siteDirty = true;
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function clearStoredPageToken() {
  state.settings.token = "";
  state.settings.rememberToken = false;
  localStorage.removeItem(STORAGE_KEYS.token);
  sessionStorage.removeItem(STORAGE_KEYS.sessionToken);
  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({
      owner: state.settings.owner,
      repo: state.settings.repo,
      branch: state.settings.branch,
      rememberToken: false
    })
  );
}

function updateTokenControls() {
  const shouldHideToken = DESKTOP_BRIDGE.available && DESKTOP_BRIDGE.hasToken;

  if (shouldHideToken) {
    clearStoredPageToken();
    elements.githubToken.value = "";
    elements.rememberToken.checked = false;
  }

  if (elements.githubTokenGroup) {
    elements.githubTokenGroup.hidden = shouldHideToken;
  }
  if (elements.rememberTokenGroup) {
    elements.rememberTokenGroup.hidden = shouldHideToken;
  }

  updateGitHubPanel();
}

function setupGitHubPanel() {
  if (!elements.githubPanel || !elements.githubPanelHeading || elements.githubPanelToggle) {
    return;
  }

  const toggle = document.createElement("button");
  toggle.id = "github-panel-toggle";
  toggle.type = "button";
  toggle.className = "button button-ghost panel-toggle";
  toggle.addEventListener("click", () => {
    githubPanelManualState = true;
    const collapsed = elements.githubPanel.classList.contains("is-collapsed");
    setGitHubPanelCollapsed(!collapsed);
  });

  const summary = document.createElement("p");
  summary.className = "panel-inline-summary";
  summary.hidden = true;

  elements.githubPanel.classList.add("is-collapsible");
  elements.githubPanelHeading.append(toggle);
  elements.githubPanel.insertBefore(summary, elements.githubPanelHeading.nextSibling);
  elements.githubPanelToggle = toggle;
  elements.githubPanelSummary = summary;
}

function getGitHubPanelBodyNodes() {
  if (!elements.githubPanel) {
    return [];
  }

  return Array.from(elements.githubPanel.children).filter((node) =>
    node !== elements.githubPanelHeading && node !== elements.githubPanelSummary
  );
}

function setGitHubPanelCollapsed(collapsed) {
  if (!elements.githubPanel || !elements.githubPanelToggle || !elements.githubPanelSummary) {
    return;
  }

  elements.githubPanel.classList.toggle("is-collapsed", collapsed);
  getGitHubPanelBodyNodes().forEach((node) => {
    node.hidden = collapsed;
  });

  elements.githubPanelToggle.textContent = collapsed ? "展開 GitHub 設定" : "收合 GitHub 設定";
  elements.githubPanelToggle.setAttribute("aria-expanded", String(!collapsed));

  const summaryText = DESKTOP_BRIDGE.available && DESKTOP_BRIDGE.hasToken
    ? "本機已連好 GitHub，平常不需要手動打開這裡。"
    : "目前顯示的是 GitHub 發布設定。";
  elements.githubPanelSummary.textContent = summaryText;
  elements.githubPanelSummary.hidden = !collapsed;
}

function updateGitHubPanel() {
  setupGitHubPanel();
  if (!elements.githubPanel || !elements.githubPanelToggle) {
    return;
  }

  const shouldCollapse = DESKTOP_BRIDGE.available && DESKTOP_BRIDGE.hasToken;
  if (!githubPanelManualState) {
    setGitHubPanelCollapsed(shouldCollapse);
    return;
  }

  setGitHubPanelCollapsed(elements.githubPanel.classList.contains("is-collapsed"));
}

function setupPublishShortcut() {
  if (elements.publishShortcutButton) {
    return;
  }

  if (elements.publishAll) {
    elements.publishAll.textContent = "發布到網頁";
  }

  const container = document.createElement("div");
  container.className = "publish-shortcut";

  const note = document.createElement("p");
  note.className = "publish-shortcut-note";

  const button = document.createElement("button");
  button.id = "publish-shortcut-button";
  button.type = "button";
  button.className = "button button-primary publish-shortcut-button";
  button.textContent = "發布到網頁";
  button.addEventListener("click", handlePublish);

  container.append(note, button);
  document.body.append(container);

  elements.publishShortcut = container;
  elements.publishShortcutNote = note;
  elements.publishShortcutButton = button;
  updatePublishShortcut();
}

function updatePublishShortcut() {
  if (!elements.publishShortcut || !elements.publishShortcutButton || !elements.publishShortcutNote) {
    return;
  }

  const dirty = hasDirtyChanges();
  elements.publishShortcut.classList.toggle("is-dirty", dirty);
  elements.publishShortcutButton.disabled = busy;

  if (busy) {
    elements.publishShortcutNote.textContent = "發布中，請稍候";
    return;
  }

  if (dirty) {
    elements.publishShortcutNote.textContent = DESKTOP_BRIDGE.autoPublish
      ? "有改動，按這裡可立即發布；不按也會自動同步"
      : "有改動，按這裡同步到前台";
    return;
  }

  elements.publishShortcutNote.textContent = DESKTOP_BRIDGE.autoPublish
    ? "目前內容已同步，後續改動也會自動推送"
    : "目前內容已同步，可隨時再發布";
}

function scheduleDesktopSync({ force = false } = {}) {
  if (!canUseDesktopGitHub()) {
    return;
  }

  if (desktopSyncTimerId) {
    window.clearTimeout(desktopSyncTimerId);
  }

  const delay = force ? 200 : 800;
  desktopSyncTimerId = window.setTimeout(async () => {
    desktopSyncTimerId = 0;

    if (!canUseDesktopGitHub() || busy || !hasDirtyChanges()) {
      return;
    }

    try {
      await syncDesktopSnapshot(force);
    } catch (error) {
      appendStatus(`自動同步失敗：${error.message}`, true);
    }
  }, delay);
}

function renderSettings() {
  elements.githubOwner.value = state.settings.owner;
  elements.githubRepo.value = state.settings.repo;
  elements.githubBranch.value = state.settings.branch;
  elements.githubToken.value = state.settings.token;
  elements.rememberToken.checked = state.settings.rememberToken;
  elements.publishNote.value = state.settings.publishNote;
  updateTokenControls();
}

function handleSiteInput() {
  if (hydratingSiteForm) {
    return;
  }

  state.site = normalizeSite({
    ...state.site,
    title: elements.siteTitle.value,
    tagline: elements.siteTagline.value,
    contactEmail: elements.siteContact.value,
    currency: elements.siteCurrency.value
  });
  state.siteDirty = true;
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function renderSiteForm() {
  hydratingSiteForm = true;
  elements.siteTitle.value = state.site.title;
  elements.siteTagline.value = state.site.tagline;
  elements.siteContact.value = state.site.contactEmail;
  elements.siteCurrency.value = state.site.currency;
  renderThemeForm();
  hydratingSiteForm = false;
}

function renderProductList() {
  elements.productList.innerHTML = "";

  state.products.forEach((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `product-item${index === state.currentIndex ? " is-active" : ""}`;
    button.innerHTML = `
      <h3>${escapeHtml(product.name || "未命名商品")}</h3>
      <div class="product-item-meta">
        <span class="product-status">${escapeHtml(product.status || "draft")}</span>
        <span>${escapeHtml(product.category || "未分類")}</span>
        <span>${escapeHtml(product.id || "no-id")}</span>
      </div>
    `;
    button.addEventListener("click", () => {
      state.currentIndex = index;
      renderProductList();
      renderCurrentProduct();
    });
    elements.productList.append(button);
  });
}

function renderCurrentProduct() {
  const product = state.products[state.currentIndex];
  if (!product) {
    return;
  }

  hydratingProductForm = true;
  elements.productFields.id.value = product.id;
  elements.productFields.name.value = product.name;
  elements.productFields.subtitle.value = product.subtitle;
  elements.productFields.summary.value = product.summary;
  elements.productFields.category.value = product.category;
  elements.productFields.sku.value = product.sku;
  elements.productFields.price.value = typeof product.price === "number" ? String(product.price) : "";
  elements.productFields.currency.value = product.currency;
  elements.productFields.status.value = product.status;
  elements.productFields.highlight.checked = Boolean(product.highlight);
  elements.productFields.orderLink.value = product.orderLink;
  elements.productFields.cover.value = product.cover;
  elements.productFields.badges.value = product.badges.join("\n");
  elements.productFields.gallery.value = product.gallery.join("\n");
  hydratingProductForm = false;

  renderSectionsEditor(product);
  renderGalleryPreview(product);
}

function renderSectionsEditor(product) {
  elements.sectionsEditor.innerHTML = "";

  if (!product.sections.length) {
    elements.sectionsEditor.innerHTML = '<p class="panel-note">尚未設定任何折頁，按「新增折頁」即可加入。</p>';
    return;
  }

  product.sections.forEach((section, index) => {
    const item = document.createElement("div");
    item.className = "section-item";
    item.innerHTML = `
      <label>
        折頁標題
        <input type="text" value="${escapeAttribute(section.title)}">
      </label>
      <label>
        折頁內容
        <textarea rows="5">${escapeHtml(section.content)}</textarea>
      </label>
      <div class="section-item-actions">
        <button type="button" class="button button-ghost">刪除折頁</button>
      </div>
    `;

    const titleInput = item.querySelector("input");
    const contentInput = item.querySelector("textarea");
    const removeButton = item.querySelector("button");

    titleInput?.addEventListener("input", () => {
      updateSection(index, "title", titleInput.value);
    });

    contentInput?.addEventListener("input", () => {
      updateSection(index, "content", contentInput.value);
    });

    removeButton?.addEventListener("click", () => {
      removeSection(index);
    });

    elements.sectionsEditor.append(item);
  });
}

function updateSection(index, key, value) {
  const product = state.products[state.currentIndex];
  if (!product || !product.sections[index]) {
    return;
  }

  product.sections[index][key] = value;
  product._dirty = true;
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function addSection() {
  const product = state.products[state.currentIndex];
  if (!product) {
    return;
  }

  product.sections.push({
    title: `折頁 ${product.sections.length + 1}`,
    content: ""
  });
  product._dirty = true;
  renderSectionsEditor(product);
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function removeSection(index) {
  const product = state.products[state.currentIndex];
  if (!product) {
    return;
  }

  product.sections.splice(index, 1);
  product._dirty = true;
  renderSectionsEditor(product);
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function renderGalleryPreview(product) {
  elements.galleryPreview.innerHTML = "";
  const images = [product.cover, ...product.gallery.slice().reverse()].filter(Boolean);

  if (!images.length) {
    elements.galleryPreview.innerHTML = '<p class="panel-note">尚未設定任何圖片。</p>';
    return;
  }

  [...new Set(images)].forEach((imagePath) => {
    const previewUrl = buildPreviewUrl(imagePath);
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <a class="gallery-card-link" href="${escapeAttribute(previewUrl)}" target="_blank" rel="noreferrer">
        <img src="${escapeAttribute(previewUrl)}" alt="${escapeHtml(product.name || "product image")}">
      </a>
      <p><a class="gallery-path" href="${escapeAttribute(previewUrl)}" target="_blank" rel="noreferrer">${escapeHtml(imagePath)}</a></p>
    `;
    elements.galleryPreview.append(card);
  });
}

function buildPreviewUrl(imagePath) {
  const value = String(imagePath || "").trim();
  if (!value) {
    return "";
  }

  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/") || value.startsWith("../") || value.startsWith("./")) {
    return value;
  }

  if (value.startsWith("assets/")) {
    return `../${value}`;
  }

  return value;
}

function handleProductInput() {
  if (hydratingProductForm) {
    return;
  }

  const product = state.products[state.currentIndex];
  if (!product) {
    return;
  }

  product.id = elements.productFields.id.value.trim();
  product.name = elements.productFields.name.value.trim();
  product.subtitle = elements.productFields.subtitle.value.trim();
  product.summary = elements.productFields.summary.value.trim();
  product.category = elements.productFields.category.value.trim();
  product.sku = elements.productFields.sku.value.trim();
  product.price = elements.productFields.price.value === "" ? null : Number(elements.productFields.price.value);
  product.currency = elements.productFields.currency.value.trim() || state.site.currency || "TWD";
  product.status = elements.productFields.status.value;
  product.highlight = elements.productFields.highlight.checked;
  product.orderLink = elements.productFields.orderLink.value.trim();
  product.cover = elements.productFields.cover.value.trim();
  product.badges = parseLines(elements.productFields.badges.value);
  product.gallery = parseLines(elements.productFields.gallery.value);
  product._dirty = true;

  renderProductList();
  renderGalleryPreview(product);
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function syncEditorStateBeforeCommit() {
  state.site = normalizeSite({
    ...state.site,
    title: elements.siteTitle.value,
    tagline: elements.siteTagline.value,
    contactEmail: elements.siteContact.value,
    currency: elements.siteCurrency.value
  });

  const product = state.products[state.currentIndex];
  if (!product) {
    state.siteDirty = true;
    return;
  }

  product.id = elements.productFields.id.value.trim();
  product.name = elements.productFields.name.value.trim();
  product.subtitle = elements.productFields.subtitle.value.trim();
  product.summary = elements.productFields.summary.value.trim();
  product.category = elements.productFields.category.value.trim();
  product.sku = elements.productFields.sku.value.trim();
  product.price = elements.productFields.price.value === "" ? null : Number(elements.productFields.price.value);
  product.currency = elements.productFields.currency.value.trim() || state.site.currency || "TWD";
  product.status = elements.productFields.status.value;
  product.highlight = elements.productFields.highlight.checked;
  product.orderLink = elements.productFields.orderLink.value.trim();
  product.cover = elements.productFields.cover.value.trim();
  product.badges = parseLines(elements.productFields.badges.value);
  product.gallery = parseLines(elements.productFields.gallery.value);
  product._dirty = true;
  state.siteDirty = true;
}

function createProduct() {
  const product = createEmptyProduct();
  state.products.unshift(product);
  state.currentIndex = 0;
  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  appendStatus("已新增空白商品，請填入基本資料。");
  scheduleDesktopSync();
}

function duplicateProduct() {
  const current = state.products[state.currentIndex];
  if (!current) {
    return;
  }

  const clone = normalizeProduct({
    ...structuredClone(stripPrivateFields(current)),
    id: `${current.id || "product"}-copy-${Date.now().toString(36)}`,
    name: `${current.name || "商品"} 複製`,
    status: "draft",
    updatedAt: ""
  });
  clone._dirty = true;
  state.products.splice(state.currentIndex + 1, 0, clone);
  state.currentIndex += 1;
  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  appendStatus("已複製目前商品，並改成 draft。");
  scheduleDesktopSync();
}

function deleteCurrentProduct() {
  if (state.products.length === 1) {
    appendStatus("至少需要保留一項商品，若不想上架可改成 draft。", true);
    return;
  }

  const current = state.products[state.currentIndex];
  const confirmed = window.confirm(`確定刪除「${current.name || current.id || "未命名商品"}」嗎？`);
  if (!confirmed) {
    return;
  }

  state.products.splice(state.currentIndex, 1);
  state.currentIndex = Math.max(0, state.currentIndex - 1);
  state.siteDirty = true;
  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  appendStatus("商品已從目前草稿移除。發佈後才會同步到 GitHub。");
  scheduleDesktopSync();
}

async function handleTestConnection() {
  if (busy) {
    return;
  }

  try {
    setBusy(true);
    persistSettings();
    ensureRepositorySettings({ requireToken: false });
    const repo = await fetchRepoInfo();
    await fetchBranchInfo();
    appendStatus(`GitHub 連線成功：${repo.full_name}`);
  } catch (error) {
    appendStatus(`GitHub 連線失敗：${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

async function handleLoadFromGitHub() {
  if (busy) {
    return;
  }

  try {
    setBusy(true);
    persistSettings();
    if (!state.settings.owner || !state.settings.repo || !state.settings.branch) {
      throw new Error("請先填寫 GitHub Owner、Repository 與 Branch");
    }
    ensureRepositorySettings({ requireToken: false });
    const remoteFile = await fetchRepoFile("data/products.json");

    if (!remoteFile) {
      state.dataFileSha = "";
      appendStatus("GitHub Repo 內尚未找到 data/products.json，第一次發佈時會自動建立。");
      return;
    }

    const data = JSON.parse(remoteFile.content);
    applyData(data);
    state.dataFileSha = remoteFile.sha;
    renderEverything();
    appendStatus("已從 GitHub 讀取最新產品資料。");
  } catch (error) {
    appendStatus(`載入 GitHub 內容失敗：${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

async function handlePublish() {
  if (busy) {
    return;
  }

  try {
    setBusy(true);
    persistSettings();
    syncEditorStateBeforeCommit();
    if (!state.settings.owner || !state.settings.repo || !state.settings.branch) {
      throw new Error("請先填寫 GitHub Owner、Repository 與 Branch");
    }
    if (!state.settings.token && !canUseDesktopGitHub()) {
      throw new Error("請先設定 GitHub Token，或啟用本機加密發布。");
    }
    ensureRepositorySettings({ requireToken: true });
    validateData();

    const payload = buildCatalogPayload(true);

    if (canUseDesktopGitHub()) {
      await syncDesktopSettings(true);
      const snapshotResult = await postDesktop("/_desktop/snapshot", payload);
      const publishResult = snapshotResult?.published
        ? snapshotResult
        : await postDesktop("/_desktop/publish-now", {});

      DESKTOP_BRIDGE.snapshotSignature = JSON.stringify(payload);
      applyData(payload);
      renderEverything();
      appendStatus(`已發布到前台，GitHub Commit：${publishResult.commitSha || "已送出"}`);
      return;
    }

    const result = await putRepoFile(
      "data/products.json",
      encodeStringToBase64(`${JSON.stringify(payload, null, 2)}\n`),
      buildPublishMessage(),
      state.dataFileSha
    );

    state.dataFileSha = result.content.sha;
    DESKTOP_BRIDGE.snapshotSignature = JSON.stringify(payload);
    void syncDesktopSettings(true);
    applyData(payload);
    renderEverything();
    appendStatus("已發布到 GitHub，前台更新中。");
    return;
    appendStatus("發佈完成，GitHub Pages 會在幾分鐘內更新。");
  } catch (error) {
    appendStatus(`發佈失敗：${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

async function uploadSelectedImages() {
  if (busy) {
    return;
  }

  const product = state.products[state.currentIndex];
  const files = Array.from(elements.imageInput.files || []);
  if (!product) {
    appendStatus("請先選擇商品。", true);
    return;
  }

  if (!files.length) {
    appendStatus("請先選擇至少一張圖片。", true);
    return;
  }

  try {
    setBusy(true);
    persistSettings();
    const useDesktopBridge = canUseDesktopGitHub();
    if (!state.settings.owner || !state.settings.repo || !state.settings.branch) {
      throw new Error("請先填寫 GitHub Owner、Repository 與 Branch");
    }
    if (!state.settings.token && !canUseDesktopGitHub()) {
      throw new Error("請先設定 GitHub Token，或啟用本機加密發布。");
    }
    ensureRepositorySettings({ requireToken: true });

    const uploadedPaths = [];
    for (const [index, file] of files.entries()) {
      const targetPath = buildImagePath(product.id || "product", file.name);
      const base64 = await encodeFileToBase64(file);
      if (useDesktopBridge) {
        await syncDesktopSettings(true);
        await postDesktop("/_desktop/upload-image", {
          targetPath,
          base64,
          message: `chore: upload ${file.name}`
        });
      } else {
        await putRepoFile(targetPath, base64, `chore: upload ${file.name}`);
      }
      uploadedPaths.push(targetPath);

      if (index === 0 && elements.setCoverOnUpload.checked) {
        product.cover = targetPath;
      }
    }

    product.gallery = uniqueStrings([...product.gallery, ...uploadedPaths]);
    product._dirty = true;
    renderCurrentProduct();
    renderDirtyIndicator();
    elements.imageInput.value = "";
    if (useDesktopBridge) {
      const snapshotResult = await syncDesktopSnapshot(true, { silentSuccess: true });

      if (snapshotResult?.published) {
        appendStatus(`已上傳 ${uploadedPaths.length} 張圖片，並同步到前台。GitHub Commit：${snapshotResult.commitSha || "已送出"}`);
      } else {
        const publishResult = await postDesktop("/_desktop/publish-now", {});
        appendStatus(`已上傳 ${uploadedPaths.length} 張圖片，並同步到前台。GitHub Commit：${publishResult.commitSha || "已送出"}`);
      }
    } else {
      appendStatus(`已上傳 ${uploadedPaths.length} 張圖片，記得再按「發布到前台」同步前台內容。`);
    }
    return;
    appendStatus(`已上傳 ${uploadedPaths.length} 張圖片到 GitHub，記得再按一次「發佈到 GitHub」更新商品資料。`);
  } catch (error) {
    appendStatus(`圖片上傳失敗：${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

function downloadBackup() {
  try {
    const payload = {
      site: stripPrivateFields(state.site),
      products: state.products.map(stripPrivateFields)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    appendStatus("已下載目前內容的 JSON 備份。");
  } catch (error) {
    appendStatus(`下載備份失敗：${error.message}`, true);
  }
}

async function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    applyData(data);
    state.siteDirty = true;
    state.products.forEach((product) => {
      product._dirty = true;
    });
    renderEverything();
    scheduleDesktopSync({ force: true });
    appendStatus("JSON 備份匯入成功，請確認內容後再發佈。");
  } catch (error) {
    appendStatus(`匯入備份失敗：${error.message}`, true);
  } finally {
    event.target.value = "";
  }
}

function validateData() {
  if (!state.site.title.trim()) {
    throw new Error("網站標題不可空白");
  }

  state.site.theme = normalizeTheme(state.site.theme);

  const ids = new Set();
  state.products.forEach((product, index) => {
    if (!product.id.trim()) {
      throw new Error(`第 ${index + 1} 項商品缺少商品 ID`);
    }
    if (ids.has(product.id)) {
      throw new Error(`商品 ID 重複：${product.id}`);
    }
    ids.add(product.id);

    if (!product.name.trim()) {
      throw new Error(`商品 ${product.id} 缺少名稱`);
    }
    if (!["active", "draft", "archived"].includes(product.status)) {
      throw new Error(`商品 ${product.id} 的狀態不正確`);
    }

    if (product.status !== "active") {
      return;
    }

    if (!product.summary.trim()) {
      throw new Error(`商品 ${product.id} 缺少簡短介紹`);
    }
    if (!product.cover.trim()) {
      throw new Error(`商品 ${product.id} 缺少封面圖片路徑`);
    }
    if (!product.orderLink.trim()) {
      throw new Error(`商品 ${product.id} 缺少 Google 表單連結`);
    }
    if (!product.sections.some(isFilledSection)) {
      throw new Error(`商品 ${product.id} 至少需要一個折頁內容`);
    }
  });
}

function ensureRepositorySettings({ requireToken }) {
  if (!state.settings.owner || !state.settings.repo || !state.settings.branch) {
    throw new Error("請先填寫 GitHub Owner、Repository 與 Branch");
  }
  if (requireToken && !state.settings.token && !canUseDesktopGitHub()) {
    throw new Error("發佈與圖片上傳需要 GitHub Token");
  }
}

async function fetchRepoInfo() {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(state.settings.owner)}/${encodeURIComponent(state.settings.repo)}`,
    { headers: buildHeaders(false) }
  );
  if (!response.ok) {
    throw new Error(await extractApiError(response));
  }
  return response.json();
}

async function fetchBranchInfo() {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(state.settings.owner)}/${encodeURIComponent(state.settings.repo)}/branches/${encodeURIComponent(state.settings.branch)}`,
    { headers: buildHeaders(false) }
  );
  if (!response.ok) {
    throw new Error(await extractApiError(response));
  }
  return response.json();
}

async function fetchRepoFile(filePath) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(state.settings.owner)}/${encodeURIComponent(state.settings.repo)}/contents/${encodeRepoPath(filePath)}?ref=${encodeURIComponent(state.settings.branch)}`,
    { headers: buildHeaders(false) }
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await extractApiError(response));
  }

  const data = await response.json();
  return {
    sha: data.sha,
    content: decodeBase64ToString(data.content || "")
  };
}

async function putRepoFile(filePath, content, message, sha = "") {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(state.settings.owner)}/${encodeURIComponent(state.settings.repo)}/contents/${encodeRepoPath(filePath)}`,
    {
      method: "PUT",
      headers: buildHeaders(true),
      body: JSON.stringify({
        message,
        content,
        branch: state.settings.branch,
        ...(sha ? { sha } : {})
      })
    }
  );

  if (!response.ok) {
    throw new Error(await extractApiError(response));
  }

  return response.json();
}

function buildHeaders(includeJsonBody) {
  const headers = {
    Accept: "application/vnd.github+json"
  };
  if (state.settings.token) {
    headers.Authorization = `Bearer ${state.settings.token}`;
  }
  if (includeJsonBody) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

function buildPublishMessage() {
  const note = state.settings.publishNote.trim();
  if (note) {
    return `content: ${note}`;
  }
  return `content: update catalog ${new Date().toISOString()}`;
}

async function bootstrapDesktopBridge() {
  try {
    const [statusResponse, settingsResponse] = await Promise.all([
      fetch("/_desktop/status", { cache: "no-store" }),
      fetch("/_desktop/settings", { cache: "no-store" })
    ]);
    if (!statusResponse.ok) {
      return;
    }

    const status = await statusResponse.json();
    const desktopSettings = settingsResponse.ok ? await settingsResponse.json() : null;
    DESKTOP_BRIDGE.available = true;
    DESKTOP_BRIDGE.hasToken = Boolean(status?.gitHub?.hasToken || desktopSettings?.hasToken);
    DESKTOP_BRIDGE.autoPublish = Boolean(status?.autoPublish);
    applyDesktopSettings(status, desktopSettings);
    startDesktopSnapshotLoop();
    await syncDesktopSettings(true);
  } catch (error) {
    DESKTOP_BRIDGE.available = false;
    DESKTOP_BRIDGE.autoPublish = false;
  }
}

function startDesktopSnapshotLoop() {
  if (DESKTOP_BRIDGE.snapshotLoopId) {
    return;
  }

  DESKTOP_BRIDGE.snapshotLoopId = window.setInterval(() => {
    if (!DESKTOP_BRIDGE.available || busy || !hasDirtyChanges()) {
      return;
    }

    void syncDesktopSnapshot();
  }, 1500);
}

function hasDirtyChanges() {
  return state.siteDirty || state.products.some((product) => product._dirty);
}

function buildCatalogPayload(stampUpdates) {
  const now = new Date().toISOString();
  return {
    site: {
      ...stripPrivateFields(state.site),
      updatedAt: stampUpdates ? now : state.site.updatedAt
    },
    products: state.products.map((product) => ({
      ...stripPrivateFields(product),
      currency: product.currency || state.site.currency || "TWD",
      updatedAt: stampUpdates && (product._dirty || !product.updatedAt) ? now : product.updatedAt
    }))
  };
}

function buildDesktopSettingsPayload() {
  const payload = {
    owner: state.settings.owner,
    repo: state.settings.repo,
    branch: state.settings.branch,
    publishNote: state.settings.publishNote
  };
  if (state.settings.token) {
    payload.token = state.settings.token;
  }
  return payload;
}

function applyDesktopSettings(status, desktopSettings) {
  const source = desktopSettings || {};
  const owner = source.owner || status?.gitHub?.owner || "";
  const repo = source.repo || status?.gitHub?.repo || "";
  const branch = source.branch || status?.gitHub?.branch || "main";
  const publishNote = source.publishNote || state.settings.publishNote || "";

  state.settings = {
    ...state.settings,
    owner,
    repo,
    branch,
    publishNote
  };
  DESKTOP_BRIDGE.autoPublish = Boolean(status?.autoPublish ?? DESKTOP_BRIDGE.autoPublish);
  renderSettings();
  renderPagesLink();
  updatePublishShortcut();
}

function canUseDesktopGitHub() {
  return DESKTOP_BRIDGE.available && DESKTOP_BRIDGE.hasToken && !state.settings.token;
}

async function postDesktop(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Desktop bridge request failed: ${response.status}`);
  }

  return response.json();
}

async function syncDesktopSettings(force = false) {
  if (!DESKTOP_BRIDGE.available) {
    return null;
  }

  const payload = buildDesktopSettingsPayload();
  const signature = JSON.stringify(payload);
  if (!force && signature === DESKTOP_BRIDGE.settingsSignature) {
    return null;
  }

  const result = await postDesktop("/_desktop/settings", payload);
  DESKTOP_BRIDGE.hasToken = Boolean(result?.gitHub?.hasToken || DESKTOP_BRIDGE.hasToken);
  DESKTOP_BRIDGE.settingsSignature = signature;
  return result;
}

async function syncDesktopSnapshot(force = false, { silentSuccess = false } = {}) {
  if (!DESKTOP_BRIDGE.available) {
    return null;
  }

  await syncDesktopSettings(force);

  const payload = buildCatalogPayload(true);
  const signature = JSON.stringify(payload);
  if (!force && signature === DESKTOP_BRIDGE.snapshotSignature) {
    return null;
  }

  const result = await postDesktop("/_desktop/snapshot", payload);
  DESKTOP_BRIDGE.snapshotSignature = signature;

  if (result?.published) {
    applyData(payload);
    renderEverything();
    DESKTOP_BRIDGE.snapshotSignature = JSON.stringify(payload);
    if (!silentSuccess) {
      appendStatus("本機自動推送已完成，前台內容已更新。");
    }
  }

  return result;
}

function renderPagesLink() {
  if (!state.settings.owner || !state.settings.repo) {
    elements.pagesLink.textContent = "";
    return;
  }

  const isUserPagesRepo = state.settings.repo.toLowerCase() === `${state.settings.owner.toLowerCase()}.github.io`;
  const href = isUserPagesRepo
    ? `https://${state.settings.owner}.github.io/`
    : `https://${state.settings.owner}.github.io/${state.settings.repo}/`;
  elements.pagesLink.innerHTML = `預計網站網址：<a href="${href}" target="_blank" rel="noreferrer">${href}</a>`;
}

function renderDirtyIndicator() {
  updatePublishShortcut();
  const dirtyProducts = state.products.filter((product) => product._dirty).length;
  if (!state.siteDirty && dirtyProducts === 0) {
    elements.dirtyIndicator.textContent = "目前沒有未發佈變更";
    return;
  }

  const parts = [];
  if (dirtyProducts > 0) {
    parts.push(`${dirtyProducts} 項商品`);
  }
  if (state.siteDirty) {
    parts.push("網站設定");
  }
  elements.dirtyIndicator.textContent = `尚有未發佈變更：${parts.join("、")}`;
}

function appendStatus(message, isError = false) {
  const entry = document.createElement("div");
  entry.className = `status-entry${isError ? " is-error" : ""}`;
  entry.textContent = `[${new Date().toLocaleTimeString("zh-TW", { hour12: false })}] ${message}`;
  elements.statusLog.prepend(entry);
}

function setBusy(nextBusy) {
  busy = nextBusy;
  [
    elements.testConnection,
    elements.loadRepo,
    elements.publishAll,
    elements.downloadBackup,
    elements.addProduct,
    elements.duplicateProduct,
    elements.deleteProduct,
    elements.addSection,
    elements.uploadImages
  ].forEach((button) => {
    button.disabled = nextBusy;
  });

  [
    elements.githubOwner,
    elements.githubRepo,
    elements.githubBranch,
    elements.githubToken,
    elements.rememberToken,
    elements.publishNote,
    elements.importBackup,
    elements.siteTitle,
    elements.siteTagline,
    elements.siteContact,
    elements.siteCurrency,
    elements.imageInput,
    elements.setCoverOnUpload,
    ...(elements.themeEditor ? Array.from(elements.themeEditor.querySelectorAll("input")) : []),
    ...Object.values(elements.productFields)
  ].forEach((control) => {
    control.disabled = nextBusy;
  });

  updatePublishShortcut();
}

function normalizeSite(site = {}) {
  return {
    ...structuredClone(DEFAULT_SITE),
    ...site,
    theme: normalizeTheme(site.theme)
  };
}

function normalizeTheme(theme = {}) {
  return Object.fromEntries(
    THEME_KEYS.map((key) => [key, normalizeHexColor(theme[key], DEFAULT_THEME[key])])
  );
}

function normalizeHexColor(value, fallback = "#000000") {
  const normalized = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `#${normalized.toUpperCase()}`;
  }
  return fallback;
}

function normalizeProduct(product = {}) {
  return {
    ...structuredClone(PRODUCT_TEMPLATE),
    ...product,
    price: typeof product.price === "number" ? product.price : product.price ? Number(product.price) : null,
    gallery: Array.isArray(product.gallery) ? uniqueStrings(product.gallery.filter(Boolean)) : [],
    badges: Array.isArray(product.badges) ? product.badges.filter(Boolean) : [],
    sections: Array.isArray(product.sections)
      ? product.sections
          .filter((section) => section && typeof section === "object")
          .map((section) => ({
            title: String(section.title || ""),
            content: String(section.content || "")
          }))
      : [],
    orderLink: String(product.orderLink || ""),
    _dirty: false
  };
}

function createEmptyProduct() {
  const product = normalizeProduct({
    id: `product-${Date.now().toString(36)}`,
    currency: state.site.currency || "TWD",
    status: "draft",
    sections: [
      {
        title: "產品介紹",
        content: ""
      }
    ]
  });
  product._dirty = true;
  return product;
}

function parseLines(value) {
  return uniqueStrings(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function uniqueStrings(list) {
  return [...new Set(list)];
}

function stripPrivateFields(record) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith("_")));
}

function isFilledSection(section) {
  return section && typeof section.title === "string" && typeof section.content === "string" && (section.title.trim() || section.content.trim());
}

function buildImagePath(productId, fileName) {
  const safeProductId = sanitizeSegment(productId || "product");
  const safeName = sanitizeFileName(fileName);
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  return `assets/products/${safeProductId}/${timestamp}-${uniqueSuffix}-${safeName}`;
}

function sanitizeSegment(value) {
  return String(value)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
}

function sanitizeFileName(value) {
  const dotIndex = value.lastIndexOf(".");
  const base = dotIndex >= 0 ? value.slice(0, dotIndex) : value;
  const ext = dotIndex >= 0 ? value.slice(dotIndex).toLowerCase() : ".png";
  return `${sanitizeSegment(base)}${ext}`;
}

function encodeRepoPath(filePath) {
  return filePath.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function decodeBase64ToString(value) {
  const sanitized = value.replace(/\n/g, "");
  const binary = atob(sanitized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeStringToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  return bytesToBase64(bytes);
}

async function encodeFileToBase64(file) {
  const buffer = await file.arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function extractApiError(response) {
  try {
    const data = await response.json();
    return data.message || `${response.status} ${response.statusText}`;
  } catch (error) {
    return `${response.status} ${response.statusText}`;
  }
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
