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
  heroBrandText: "#FFF8F1",
  heroFeatureTitleText: "#1D1A17",
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

resetThemeConfig();

function resetThemeConfig() {
  Object.keys(DEFAULT_THEME).forEach((key) => {
    delete DEFAULT_THEME[key];
  });
  Object.assign(DEFAULT_THEME, {
    pageBg: "#F8F4ED",
    heroBg: "#F5E7D8",
    featureBg: "#FFF7F0",
    heroBrandText: "#FFF8F1",
    heroFeatureTitleText: "#1D1A17",
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
  });

  THEME_GROUPS.length = 0;
  THEME_GROUPS.push(
    {
      title: "首頁頂部",
      note: "首頁頂部的背景、照片卡與兩個主標題文字顏色都在這裡調整。",
      fields: [
        { key: "pageBg", label: "整頁背景", description: "網站最外層底色" },
        { key: "heroBg", label: "左上品牌區", description: "網站標題與 Logo 所在區域底色" },
        { key: "featureBg", label: "本週精選卡片", description: "頂部照片與短文資訊卡底色" },
        { key: "heroBrandText", label: "網站標題文字", description: "左上品牌標題與說明文字色" },
        { key: "heroFeatureTitleText", label: "頂部短標文字", description: "本週精選標題文字色" }
      ]
    },
    {
      title: "商品內容區",
      note: "分類、商品列表、詳情與商品卡可各自設定單色。",
      fields: [
        { key: "sidebarBg", label: "分類側欄", description: "桌機側欄與手機抽屜底色" },
        { key: "catalogBg", label: "商品列表", description: "商品列表區塊底色" },
        { key: "detailBg", label: "商品詳情", description: "商品詳情區塊底色" },
        { key: "cardBg", label: "商品卡片", description: "商品卡片與小卡片底色" }
      ]
    },
    {
      title: "按鈕與通用文字",
      note: "按鈕、重點色、內文字色與邊線都集中在這裡調整。",
      fields: [
        { key: "accent", label: "主按鈕", description: "主按鈕與重點色" },
        { key: "accentDeep", label: "深色點綴", description: "標題、分類與次重點色" },
        { key: "accentText", label: "主按鈕文字", description: "主按鈕上的文字顏色" },
        { key: "ink", label: "主要文字", description: "大標與主要內容文字色" },
        { key: "muted", label: "次要文字", description: "說明文字與輔助資訊色" },
        { key: "line", label: "框線", description: "邊框與分隔線顏色" }
      ]
    }
  );

  THEME_KEYS.length = 0;
  THEME_KEYS.push(...THEME_GROUPS.flatMap((group) => group.fields.map((field) => field.key)));
}

const DEFAULT_SITE = {
  title: "Tinnsi 產品型錄",
  tagline: "用靜態站穩定呈現產品內容，並從本機後台直接發佈到 GitHub。",
  contactEmail: "",
  currency: "TWD",
  socialLinks: {
    instagram: "",
    facebook: "",
    email: ""
  },
  logoImage: "",
  heroFeatureImage: "",
  heroFeatureTitle: "",
  heroFeatureText: "",
  insuranceLabel: "產品責任險",
  insuranceImage: "",
  insuranceText: "可在這裡填寫產品責任險的保險說明、承保資訊與補充文字。",
  aboutLabel: "關於我們",
  aboutImage: "",
  aboutText: "可在這裡填寫品牌介紹、店家故事與圖片。",
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
  subcategory: "",
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
  siteInstagram: document.querySelector("#site-instagram-input"),
  siteFacebook: document.querySelector("#site-facebook-input"),
  siteSocialEmail: document.querySelector("#site-social-email-input"),
  siteLogoImage: document.querySelector("#site-logo-image-input"),
  siteFeatureImage: document.querySelector("#site-feature-image-input"),
  siteFeatureTitle: document.querySelector("#site-feature-title-input"),
  siteFeatureText: document.querySelector("#site-feature-text-input"),
  siteInsuranceLabel: document.querySelector("#site-insurance-label-input"),
  siteInsuranceImage: document.querySelector("#site-insurance-image-input"),
  siteInsuranceText: document.querySelector("#site-insurance-text-input"),
  siteAboutLabel: document.querySelector("#site-about-label-input"),
  siteAboutImage: document.querySelector("#site-about-image-input"),
  siteAboutText: document.querySelector("#site-about-text-input"),
  siteLogoFile: document.querySelector("#site-logo-file"),
  uploadSiteLogo: document.querySelector("#upload-site-logo"),
  siteFeatureFile: document.querySelector("#site-feature-file"),
  uploadSiteFeatureImage: document.querySelector("#upload-site-feature-image"),
  siteInsuranceFile: document.querySelector("#site-insurance-file"),
  uploadSiteInsuranceImage: document.querySelector("#upload-site-insurance-image"),
  siteAboutFile: document.querySelector("#site-about-file"),
  uploadSiteAboutImage: document.querySelector("#upload-site-about-image"),
  siteLogoPreview: document.querySelector("#site-logo-preview"),
  siteFeaturePreview: document.querySelector("#site-feature-preview"),
  siteInsurancePreview: document.querySelector("#site-insurance-preview"),
  siteAboutPreview: document.querySelector("#site-about-preview"),
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
    subcategory: document.querySelector("#product-subcategory"),
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
    elements.siteCurrency,
    elements.siteInstagram,
    elements.siteFacebook,
    elements.siteSocialEmail,
    elements.siteLogoImage,
    elements.siteFeatureImage,
    elements.siteFeatureTitle,
    elements.siteFeatureText,
    elements.siteInsuranceLabel,
    elements.siteInsuranceImage,
    elements.siteInsuranceText,
    elements.siteAboutLabel,
    elements.siteAboutImage,
    elements.siteAboutText
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
  elements.uploadSiteLogo.addEventListener("click", () => uploadSiteAsset("logo"));
  elements.uploadSiteFeatureImage.addEventListener("click", () => uploadSiteAsset("hero"));
  elements.uploadSiteInsuranceImage.addEventListener("click", () => uploadSiteAsset("insurance"));
  elements.uploadSiteAboutImage.addEventListener("click", () => uploadSiteAsset("about"));
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

  const delay = force ? 250 : 1600;
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
    currency: elements.siteCurrency.value,
    socialLinks: {
      instagram: elements.siteInstagram.value,
      facebook: elements.siteFacebook.value,
      email: elements.siteSocialEmail.value
    },
    logoImage: elements.siteLogoImage.value,
    heroFeatureImage: elements.siteFeatureImage.value,
    heroFeatureTitle: elements.siteFeatureTitle.value,
    heroFeatureText: elements.siteFeatureText.value,
    insuranceLabel: elements.siteInsuranceLabel.value,
    insuranceImage: elements.siteInsuranceImage.value,
    insuranceText: elements.siteInsuranceText.value,
    aboutLabel: elements.siteAboutLabel.value,
    aboutImage: elements.siteAboutImage.value,
    aboutText: elements.siteAboutText.value
  });
  state.siteDirty = true;
  renderDirtyIndicator();
  renderSiteAssetPreviews();
  scheduleDesktopSync();
}

function renderSiteForm() {
  hydratingSiteForm = true;
  elements.siteTitle.value = state.site.title;
  elements.siteTagline.value = state.site.tagline;
  elements.siteContact.value = state.site.contactEmail;
  elements.siteCurrency.value = state.site.currency;
  elements.siteInstagram.value = state.site.socialLinks.instagram;
  elements.siteFacebook.value = state.site.socialLinks.facebook;
  elements.siteSocialEmail.value = state.site.socialLinks.email;
  elements.siteLogoImage.value = state.site.logoImage;
  elements.siteFeatureImage.value = state.site.heroFeatureImage;
  elements.siteFeatureTitle.value = state.site.heroFeatureTitle;
  elements.siteFeatureText.value = state.site.heroFeatureText;
  elements.siteInsuranceLabel.value = state.site.insuranceLabel;
  elements.siteInsuranceImage.value = state.site.insuranceImage;
  elements.siteInsuranceText.value = state.site.insuranceText;
  elements.siteAboutLabel.value = state.site.aboutLabel;
  elements.siteAboutImage.value = state.site.aboutImage;
  elements.siteAboutText.value = state.site.aboutText;
  renderThemeForm();
  renderSiteAssetPreviews();
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
  elements.productFields.subcategory.value = product.subcategory;
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
  const images = uniqueStrings([product.cover, ...product.gallery.slice().reverse()].filter(Boolean));

  if (!images.length) {
    elements.galleryPreview.innerHTML = '<p class="panel-note">尚未設定任何圖片。</p>';
    return;
  }

  images.forEach((imagePath) => {
    const previewUrl = buildPreviewUrl(imagePath);
    const card = document.createElement("article");
    card.className = "gallery-card";
    if (product.cover === imagePath) {
      card.classList.add("is-cover");
    }

    const media = document.createElement("div");
    media.className = "gallery-card-media";

    const image = document.createElement("img");
    image.src = previewUrl;
    image.alt = product.name || "product image";
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);

    const badge = document.createElement("span");
    badge.className = "gallery-card-badge";
    badge.textContent = product.cover === imagePath ? "封面" : "商品圖";
    media.append(badge);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button button-secondary gallery-card-delete";
    deleteButton.textContent = "×";
    deleteButton.title = "刪除這張圖片";
    deleteButton.setAttribute("aria-label", `刪除圖片 ${imagePath}`);
    deleteButton.addEventListener("click", () => {
      void removeCurrentProductImage(imagePath);
    });
    media.append(deleteButton);

    const body = document.createElement("div");
    body.className = "gallery-card-body";

    const path = document.createElement("p");
    path.className = "gallery-card-path";
    path.textContent = imagePath;
    path.title = imagePath;
    body.append(path);

    const actions = document.createElement("div");
    actions.className = "gallery-card-actions";

    if (product.cover !== imagePath) {
      const coverButton = document.createElement("button");
      coverButton.type = "button";
      coverButton.className = "button button-secondary gallery-card-action";
      coverButton.textContent = "設為封面";
      coverButton.addEventListener("click", () => {
        setCurrentProductCoverImage(imagePath);
      });
      actions.append(coverButton);
    } else {
      const coverIndicator = document.createElement("span");
      coverIndicator.className = "gallery-card-current";
      coverIndicator.textContent = "目前封面";
      actions.append(coverIndicator);
    }

    body.append(actions);
    card.append(media, body);
    elements.galleryPreview.append(card);
  });
}

function setCurrentProductCoverImage(imagePath) {
  const product = state.products[state.currentIndex];
  if (!product || !imagePath || product.cover === imagePath) {
    return;
  }

  product.cover = imagePath;
  product._dirty = true;
  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  scheduleDesktopSync();
  appendStatus("已將圖片設為封面。");
}

async function removeCurrentProductImage(imagePath) {
  if (busy) {
    return;
  }

  const product = state.products[state.currentIndex];
  if (!product || !imagePath) {
    return;
  }

  const nextGallery = product.gallery.filter((path) => path !== imagePath);
  const nextCover = product.cover === imagePath ? nextGallery[0] || "" : product.cover;

  if (product.status === "active" && !nextCover) {
    appendStatus("上架中的商品至少要保留一張圖片，請先上傳新圖片，或先改成 draft 再刪除。", true);
    return;
  }

  const useDesktopBridge = canUseDesktopGitHub();
  product.gallery = uniqueStrings(nextGallery);
  product.cover = nextCover;
  product._dirty = true;

  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  scheduleDesktopSync();

  try {
    setBusy(true);
    persistSettings();

    if (useDesktopBridge) {
      const snapshotResult = await syncDesktopSnapshot(true, { silentSuccess: true });
      if (!snapshotResult?.published) {
        await postDesktop("/_desktop/publish-now", {});
      }

      if (isRepoManagedAsset(imagePath, ["assets/products/"])) {
        await syncDesktopSettings(true);
        try {
          await postDesktop("/_desktop/delete-image", {
            targetPath: imagePath,
            message: `chore: delete ${getFileNameFromPath(imagePath)}`
          });
          appendStatus("已刪除圖片，並同步更新到前台。");
        } catch (cleanupError) {
          appendStatus(`圖片已從商品移除，但原始檔案清理失敗：${cleanupError.message}`, true);
        }
      } else {
        appendStatus("已刪除圖片，並同步更新到前台。");
      }
    } else {
      appendStatus("已從商品移除圖片。發布到前台後就會生效，原始檔案會先保留在 GitHub。");
    }
  } catch (error) {
    appendStatus(`圖片已從商品草稿移除，但同步失敗：${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

function renderSiteAssetPreviews() {
  renderSiteAssetPreview(elements.siteLogoPreview, state.site.logoImage, "Logo 預覽", "logo");
  renderSiteAssetPreview(elements.siteFeaturePreview, state.site.heroFeatureImage, "頂部照片預覽", "hero");
  renderSiteAssetPreview(elements.siteInsurancePreview, state.site.insuranceImage, "產品責任險預覽", "insurance");
  renderSiteAssetPreview(elements.siteAboutPreview, state.site.aboutImage, "關於我們預覽", "about");
}

function renderSiteAssetPreview(container, assetPath, altText, kind) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  if (!assetPath) {
    container.innerHTML = '<p class="panel-note">尚未設定圖片。</p>';
    return;
  }

  const previewUrl = buildPreviewUrl(assetPath);
  const card = document.createElement("article");
  card.className = "gallery-card";

  const media = document.createElement("div");
  media.className = "gallery-card-media";

  const image = document.createElement("img");
  image.src = previewUrl;
  image.alt = altText;
  image.loading = "lazy";
  image.decoding = "async";
  media.append(image);

  const badge = document.createElement("span");
  badge.className = "gallery-card-badge";
  badge.textContent = "網站圖片";
  media.append(badge);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "button button-secondary gallery-card-delete";
  deleteButton.textContent = "×";
  deleteButton.title = "移除這張圖片";
  deleteButton.setAttribute("aria-label", `移除圖片 ${altText}`);
  deleteButton.addEventListener("click", () => {
    void removeSiteAsset(kind);
  });
  media.append(deleteButton);

  const body = document.createElement("div");
  body.className = "gallery-card-body";

  const path = document.createElement("p");
  path.className = "gallery-card-path";
  path.textContent = assetPath;
  path.title = assetPath;
  body.append(path);

  const actions = document.createElement("div");
  actions.className = "gallery-card-actions";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "button button-secondary gallery-card-action";
  clearButton.textContent = "移除圖片";
  clearButton.addEventListener("click", () => {
    void removeSiteAsset(kind);
  });
  actions.append(clearButton);

  body.append(actions);
  card.append(media, body);
  container.append(card);
}

function getSiteAssetConfig(kind) {
  const assetConfig = {
    logo: {
      fileInput: elements.siteLogoFile,
      pathInput: elements.siteLogoImage,
      stateKey: "logoImage",
      assetType: "logo",
      label: "Logo"
    },
    hero: {
      fileInput: elements.siteFeatureFile,
      pathInput: elements.siteFeatureImage,
      stateKey: "heroFeatureImage",
      assetType: "hero",
      label: "頂部照片"
    },
    insurance: {
      fileInput: elements.siteInsuranceFile,
      pathInput: elements.siteInsuranceImage,
      stateKey: "insuranceImage",
      assetType: "insurance",
      label: "產品責任險圖片"
    },
    about: {
      fileInput: elements.siteAboutFile,
      pathInput: elements.siteAboutImage,
      stateKey: "aboutImage",
      assetType: "about",
      label: "關於我們圖片"
    }
  };

  return assetConfig[kind] || null;
}

async function removeSiteAsset(kind) {
  if (busy) {
    return;
  }

  const config = getSiteAssetConfig(kind);
  if (!config) {
    return;
  }

  const currentPath = String(state.site[config.stateKey] || "").trim();
  if (!currentPath) {
    appendStatus(`${config.label}目前沒有圖片可移除。`, true);
    return;
  }

  const useDesktopBridge = canUseDesktopGitHub();
  state.site[config.stateKey] = "";
  config.pathInput.value = "";
  if (config.fileInput) {
    config.fileInput.value = "";
  }
  state.siteDirty = true;
  renderSiteAssetPreviews();
  renderDirtyIndicator();
  scheduleDesktopSync();

  try {
    setBusy(true);
    persistSettings();

    if (useDesktopBridge) {
      const snapshotResult = await syncDesktopSnapshot(true, { silentSuccess: true });
      if (!snapshotResult?.published) {
        await postDesktop("/_desktop/publish-now", {});
      }

      if (isRepoManagedAsset(currentPath, ["assets/site/"])) {
        await syncDesktopSettings(true);
        try {
          await postDesktop("/_desktop/delete-image", {
            targetPath: currentPath,
            message: `chore: delete ${getFileNameFromPath(currentPath)}`
          });
          appendStatus(`${config.label}已移除，並同步更新到前台。`);
        } catch (cleanupError) {
          appendStatus(`${config.label}已從設定移除，但原始檔案清理失敗：${cleanupError.message}`, true);
        }
      } else {
        appendStatus(`${config.label}已移除，並同步更新到前台。`);
      }
    } else {
      appendStatus(`${config.label}已從設定移除。發布到前台後就會生效，原始檔案會先保留在 GitHub。`);
    }
  } catch (error) {
    appendStatus(`${config.label}已從設定移除，但同步失敗：${error.message}`, true);
  } finally {
    setBusy(false);
  }
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

function isRepoManagedAsset(imagePath, allowedPrefixes = ["assets/products/", "assets/site/"]) {
  const value = String(imagePath || "").trim();
  if (!value) {
    return false;
  }

  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return false;
  }

  return allowedPrefixes.some((prefix) => value.startsWith(prefix));
}

function getFileNameFromPath(imagePath) {
  const value = String(imagePath || "").trim();
  if (!value) {
    return "image";
  }

  const segments = value.split("/");
  return segments[segments.length - 1] || "image";
}

function handleProductInput() {
  if (hydratingProductForm) {
    return;
  }

  const product = state.products[state.currentIndex];
  if (!product) {
    return;
  }

  const previousListSignature = JSON.stringify({
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    price: product.price,
    status: product.status,
    highlight: product.highlight,
    cover: product.cover,
    category: product.category,
    subcategory: product.subcategory
  });
  const previousGallerySignature = JSON.stringify({
    cover: product.cover,
    gallery: product.gallery
  });

  product.id = elements.productFields.id.value.trim();
  product.name = elements.productFields.name.value.trim();
  product.subtitle = elements.productFields.subtitle.value.trim();
  product.summary = elements.productFields.summary.value.trim();
  product.category = elements.productFields.category.value.trim();
  product.subcategory = elements.productFields.subcategory.value.trim();
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

  const nextListSignature = JSON.stringify({
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    price: product.price,
    status: product.status,
    highlight: product.highlight,
    cover: product.cover,
    category: product.category,
    subcategory: product.subcategory
  });
  const nextGallerySignature = JSON.stringify({
    cover: product.cover,
    gallery: product.gallery
  });

  if (previousListSignature !== nextListSignature) {
    renderProductList();
  }
  if (previousGallerySignature !== nextGallerySignature) {
    renderGalleryPreview(product);
  }
  renderDirtyIndicator();
  scheduleDesktopSync();
}

function syncEditorStateBeforeCommit() {
  state.site = normalizeSite({
    ...state.site,
    title: elements.siteTitle.value,
    tagline: elements.siteTagline.value,
    contactEmail: elements.siteContact.value,
    currency: elements.siteCurrency.value,
    socialLinks: {
      instagram: elements.siteInstagram.value,
      facebook: elements.siteFacebook.value,
      email: elements.siteSocialEmail.value
    },
    logoImage: elements.siteLogoImage.value,
    heroFeatureImage: elements.siteFeatureImage.value,
    heroFeatureTitle: elements.siteFeatureTitle.value,
    heroFeatureText: elements.siteFeatureText.value,
    insuranceLabel: elements.siteInsuranceLabel.value,
    insuranceImage: elements.siteInsuranceImage.value,
    insuranceText: elements.siteInsuranceText.value,
    aboutLabel: elements.siteAboutLabel.value,
    aboutImage: elements.siteAboutImage.value,
    aboutText: elements.siteAboutText.value
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
  product.subcategory = elements.productFields.subcategory.value.trim();
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

async function uploadSiteAsset(kind) {
  if (busy) {
    return;
  }

  const assetConfig = {
    logo: {
      fileInput: elements.siteLogoFile,
      pathInput: elements.siteLogoImage,
      stateKey: "logoImage",
      assetType: "logo",
      label: "Logo"
    },
    hero: {
      fileInput: elements.siteFeatureFile,
      pathInput: elements.siteFeatureImage,
      stateKey: "heroFeatureImage",
      assetType: "hero",
      label: "頂部照片"
    },
    insurance: {
      fileInput: elements.siteInsuranceFile,
      pathInput: elements.siteInsuranceImage,
      stateKey: "insuranceImage",
      assetType: "insurance",
      label: "產品責任險圖片"
    },
    about: {
      fileInput: elements.siteAboutFile,
      pathInput: elements.siteAboutImage,
      stateKey: "aboutImage",
      assetType: "about",
      label: "關於我們圖片"
    }
  };

  const config = getSiteAssetConfig(kind) || assetConfig[kind];
  if (!config) {
    appendStatus("不支援的網站圖片類型。", true);
    return;
  }

  const { fileInput, pathInput, stateKey, assetType, label } = config;
  const isLogo = kind === "logo";
  const file = fileInput?.files?.[0];

  if (!file) {
    appendStatus(`請先選擇${label}檔案。`, true);
    return;
    appendStatus(`請先選擇${isLogo ? " Logo" : "頂部照片"}檔案。`, true);
    return;
  }

  try {
    setBusy(true);
    persistSettings();
    const useDesktopBridge = canUseDesktopGitHub();
    ensureRepositorySettings({ requireToken: true });

    const targetPath = buildSiteAssetPath(assetType, file.name);
    const base64 = await encodeFileToBase64(file);
    if (useDesktopBridge) {
      await syncDesktopSettings(true);
      await postDesktop("/_desktop/upload-image", {
        targetPath,
        base64,
        message: `chore: upload site asset ${file.name}`
      });
    } else {
      await putRepoFile(targetPath, base64, `chore: upload site asset ${file.name}`);
    }

    state.site[stateKey] = targetPath;
    pathInput.value = targetPath;
    fileInput.value = "";

    state.siteDirty = true;
    renderSiteAssetPreviews();
    renderDirtyIndicator();

    if (useDesktopBridge) {
      const snapshotResult = await syncDesktopSnapshot(true, { silentSuccess: true });
      if (!snapshotResult?.published) {
        await postDesktop("/_desktop/publish-now", {});
      }
    }

    appendStatus(`${isLogo ? "Logo" : "頂部照片"}已上傳並更新路徑。`);
    appendStatus(`${label}已上傳並更新設定。`);
    return;
  } catch (error) {
    appendStatus(`${label}上傳失敗：${error.message}`, true);
    return;
    appendStatus(`${isLogo ? "Logo" : "頂部照片"}上傳失敗：${error.message}`, true);
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
    if (!DESKTOP_BRIDGE.available || busy || !hasDirtyChanges() || desktopSyncTimerId || isEditorFieldFocused()) {
      return;
    }

    void syncDesktopSnapshot();
  }, 1500);
}

function hasDirtyChanges() {
  return state.siteDirty || state.products.some((product) => product._dirty);
}

function isEditorFieldFocused() {
  const active = document.activeElement;
  return active instanceof HTMLInputElement
    || active instanceof HTMLTextAreaElement
    || active instanceof HTMLSelectElement
    || Boolean(active?.isContentEditable);
}

function applyPublishedSnapshot(payload) {
  const currentProductId = state.products[state.currentIndex]?.id || "";
  applyData(payload);

  if (currentProductId) {
    const nextIndex = state.products.findIndex((product) => product.id === currentProductId);
    if (nextIndex >= 0) {
      state.currentIndex = nextIndex;
    }
  }

  renderProductList();
  renderDirtyIndicator();
  renderPagesLink();

  if (!isEditorFieldFocused()) {
    renderSiteForm();
    renderCurrentProduct();
  }
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
    applyPublishedSnapshot(payload);
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
    elements.uploadImages,
    elements.uploadSiteLogo,
    elements.uploadSiteFeatureImage,
    elements.uploadSiteInsuranceImage,
    elements.uploadSiteAboutImage
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
    elements.siteInstagram,
    elements.siteFacebook,
    elements.siteSocialEmail,
    elements.siteLogoImage,
    elements.siteFeatureImage,
    elements.siteFeatureTitle,
    elements.siteFeatureText,
    elements.siteInsuranceLabel,
    elements.siteInsuranceImage,
    elements.siteInsuranceText,
    elements.siteAboutLabel,
    elements.siteAboutImage,
    elements.siteAboutText,
    elements.siteLogoFile,
    elements.siteFeatureFile,
    elements.siteInsuranceFile,
    elements.siteAboutFile,
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
    contactEmail: String(site.contactEmail || ""),
    currency: String(site.currency || DEFAULT_SITE.currency),
    logoImage: String(site.logoImage || ""),
    heroFeatureImage: String(site.heroFeatureImage || ""),
    heroFeatureTitle: String(site.heroFeatureTitle || ""),
    heroFeatureText: String(site.heroFeatureText || ""),
    insuranceLabel: String(site.insuranceLabel || DEFAULT_SITE.insuranceLabel),
    insuranceImage: String(site.insuranceImage || ""),
    insuranceText: String(site.insuranceText || DEFAULT_SITE.insuranceText),
    aboutLabel: String(site.aboutLabel || DEFAULT_SITE.aboutLabel),
    aboutImage: String(site.aboutImage || ""),
    aboutText: String(site.aboutText || DEFAULT_SITE.aboutText),
    socialLinks: {
      ...structuredClone(DEFAULT_SITE.socialLinks),
      ...(site.socialLinks || {}),
      email: String(site.socialLinks?.email || site.contactEmail || "")
    },
    theme: normalizeTheme(site.theme)
  };
}

function normalizeTheme(theme = {}) {
  const aliases = {
    pageBg: ["pageBg", "pageStart", "pageEnd"],
    heroBg: ["heroBg", "heroStart", "heroEnd"],
    featureBg: ["featureBg", "heroPanel", "heroEnd"],
    heroBrandText: ["heroBrandText"],
    heroFeatureTitleText: ["heroFeatureTitleText"],
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
    THEME_KEYS.map((key) => {
      const sourceKey = aliases[key].find((candidate) => theme[candidate]);
      return [key, normalizeHexColor(sourceKey ? theme[sourceKey] : "", DEFAULT_THEME[key])];
    })
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
    subcategory: String(product.subcategory || ""),
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

function buildSiteAssetPath(assetType, fileName) {
  const safeType = sanitizeSegment(assetType || "site");
  const safeName = sanitizeFileName(fileName);
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  return `assets/site/${safeType}/${timestamp}-${uniqueSuffix}-${safeName}`;
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
