const STORAGE_KEYS = {
  settings: "catalog-admin-settings",
  token: "catalog-admin-token",
  sessionToken: "catalog-admin-session-token",
  publishNote: "catalog-admin-publish-note"
};

const DEFAULT_SITE = {
  title: "Tinnsi 產品型錄",
  tagline: "用靜態站穩定呈現產品內容，並從本機後台直接發佈到 GitHub。",
  contactEmail: "",
  currency: "TWD",
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
  rememberToken: document.querySelector("#remember-token"),
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

bootstrap().catch((error) => {
  appendStatus(`初始化失敗：${error.message}`, true);
  console.error(error);
});

async function bootstrap() {
  restoreSettings();
  bindEvents();
  await loadLocalSeedData();
  renderEverything();
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

  const data = await response.json();
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
}

function renderSettings() {
  elements.githubOwner.value = state.settings.owner;
  elements.githubRepo.value = state.settings.repo;
  elements.githubBranch.value = state.settings.branch;
  elements.githubToken.value = state.settings.token;
  elements.rememberToken.checked = state.settings.rememberToken;
  elements.publishNote.value = state.settings.publishNote;
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
}

function renderSiteForm() {
  hydratingSiteForm = true;
  elements.siteTitle.value = state.site.title;
  elements.siteTagline.value = state.site.tagline;
  elements.siteContact.value = state.site.contactEmail;
  elements.siteCurrency.value = state.site.currency;
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
}

function renderGalleryPreview(product) {
  elements.galleryPreview.innerHTML = "";
  const images = [product.cover, ...product.gallery].filter(Boolean);

  if (!images.length) {
    elements.galleryPreview.innerHTML = '<p class="panel-note">尚未設定任何圖片。</p>';
    return;
  }

  [...new Set(images)].forEach((imagePath) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(product.name || "product image")}">
      <p>${escapeHtml(imagePath)}</p>
    `;
    elements.galleryPreview.append(card);
  });
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
}

function createProduct() {
  const product = createEmptyProduct();
  state.products.unshift(product);
  state.currentIndex = 0;
  renderProductList();
  renderCurrentProduct();
  renderDirtyIndicator();
  appendStatus("已新增空白商品，請填入基本資料。");
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
    ensureRepositorySettings({ requireToken: true });
    validateData();

    const now = new Date().toISOString();
    const payload = {
      site: {
        ...stripPrivateFields(state.site),
        updatedAt: now
      },
      products: state.products.map((product) => ({
        ...stripPrivateFields(product),
        currency: product.currency || state.site.currency || "TWD",
        updatedAt: product._dirty || !product.updatedAt ? now : product.updatedAt
      }))
    };

    const result = await putRepoFile(
      "data/products.json",
      encodeStringToBase64(`${JSON.stringify(payload, null, 2)}\n`),
      buildPublishMessage(),
      state.dataFileSha
    );

    state.dataFileSha = result.content.sha;
    applyData(payload);
    renderEverything();
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
    ensureRepositorySettings({ requireToken: true });

    const uploadedPaths = [];
    for (const [index, file] of files.entries()) {
      const targetPath = buildImagePath(product.id || "product", file.name);
      const base64 = await encodeFileToBase64(file);
      await putRepoFile(targetPath, base64, `chore: upload ${file.name}`);
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
  if (requireToken && !state.settings.token) {
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
}

function normalizeSite(site = {}) {
  return {
    ...structuredClone(DEFAULT_SITE),
    ...site
  };
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
