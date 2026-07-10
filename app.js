const characters = [
  { name: "Alex Pixel", skin: "#f0c09a", hair: "#2c1d18", eyes: "#2364aa", glasses: false },
  { name: "Maya Live", skin: "#8d5524", hair: "#111111", eyes: "#4f772d", glasses: true },
  { name: "Nico Clip", skin: "#c68642", hair: "#f0c04f", eyes: "#2a5f89", glasses: false },
  { name: "Sara Stream", skin: "#e0ac69", hair: "#5b2c20", eyes: "#5a3d8a", glasses: true },
  { name: "Leo Vlog", skin: "#ffdbac", hair: "#c45b26", eyes: "#1f7a5c", glasses: false },
  { name: "Giulia Cut", skin: "#a56a43", hair: "#2f211d", eyes: "#6d4c41", glasses: false },
  { name: "Omar Quest", skin: "#6b3f2a", hair: "#0f0f0f", eyes: "#1d5c8a", glasses: true },
  { name: "Riccardo Pinguino", skin: "#f1b98d", hair: "#f3c343", eyes: "#2f9b65", glasses: true, glassesColor: "#1d74d8" }
];

const customCharacterDefaults = {
  name: "Nuovo Creator",
  skin: "#d49a6a",
  hair: "#293241",
  eyes: "#111827",
  glasses: false,
  glassesColor: "#1f2937",
  shirt: "#e44b4b",
  hairStyle: "short",
  custom: true
};
const hairStyles = ["short", "fringe", "curly", "long"];
const legacySaveKey = "creatorQuestSave";
const activeSlotKey = "creatorQuestActiveSlot";
const saveSlots = ["1", "2", "3"];
let activeSaveSlot = normalizeSaveSlot(localStorage.getItem(activeSlotKey));
const movableGearIds = [
  "mic",
  "camera",
  "light",
  "chair",
  "headphones",
  "editing",
  "thumbnail",
  "streamdeck",
  "greenscreen",
  "capture",
  "assistant",
  "sponsor"
];

const rewards = {
  ttt: {
    easy: { money: 10, followers: 5 },
    medium: { money: 18, followers: 9 },
    hard: { money: 30, followers: 16 }
  },
  c4: {
    easy: { money: 18, followers: 9 },
    medium: { money: 30, followers: 15 },
    hard: { money: 45, followers: 24 }
  },
  hangman: {
    easy: { money: 14, followers: 7 },
    medium: { money: 24, followers: 12 },
    hard: { money: 38, followers: 20 }
  }
};

const hangmanWords = {
  easy: ["video", "like", "canale", "camera", "studio", "gioco", "vlog", "audio"],
  medium: ["thumbnail", "montaggio", "diretta", "iscritti", "algoritmo", "playlist", "commento", "microfono"],
  hard: ["collaborazione", "sponsorizzato", "monetizzazione", "registrazione", "pubblicazione", "intrattenimento", "programmazione"]
};

const shopItems = [
  { id: "monitor", name: "Monitor migliore", price: 30, boost: 12 },
  { id: "mic", name: "Microfono", price: 45, boost: 18 },
  { id: "camera", name: "Webcam HD", price: 60, boost: 24 },
  { id: "light", name: "Luce da studio", price: 75, boost: 32 },
  { id: "chair", name: "Sedia gaming", price: 90, boost: 38 },
  { id: "headphones", name: "Cuffie professionali", price: 110, boost: 46 },
  { id: "editing", name: "Software di montaggio", price: 135, boost: 58 },
  { id: "thumbnail", name: "Pacchetto grafiche thumbnail", price: 160, boost: 70 },
  { id: "streamdeck", name: "Console scorciatoie", price: 190, boost: 82 },
  { id: "greenscreen", name: "Green screen", price: 230, boost: 100 },
  { id: "capture", name: "Scheda acquisizione", price: 275, boost: 120 },
  { id: "assistant", name: "Assistente editor", price: 340, boost: 155 },
  { id: "sponsor", name: "Kit sponsor", price: 420, boost: 195 },
  { id: "studio", name: "Mini studio dedicato", price: 520, boost: 250 }
];

const state = {
  character: null,
  money: 0,
  followers: 0,
  subscribers: 0,
  likes: 0,
  inventory: new Set(),
  studioPositions: {},
  difficulty: {
    ttt: "easy",
    c4: "easy",
    hangman: "easy"
  },
  mode: {
    ttt: "cpu",
    c4: "cpu"
  },
  ttt: {
    board: Array(9).fill(""),
    over: false,
    turn: "X"
  },
  c4: {
    rows: 6,
    cols: 7,
    board: Array.from({ length: 6 }, () => Array(7).fill("")),
    over: false,
    turn: "player"
  },
  hangman: {
    word: "",
    guessed: new Set(),
    wrong: new Set(),
    maxWrong: 7,
    over: false
  }
};

let selectedStudioGear = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function avatarMarkup(character) {
  return `
    <span class="hair"></span>
    <span class="eye left"></span>
    <span class="eye right"></span>
    <span class="glasses"></span>
    <span class="mouth"></span>
  `;
}

function applyAvatar(element, character) {
  element.style.setProperty("--skin", character.skin);
  element.style.setProperty("--hair", character.hair);
  element.style.setProperty("--eyes", character.eyes);
  element.style.setProperty("--shirt", character.shirt ?? "#e44b4b");
  element.style.setProperty("--glasses", character.glasses ? character.glassesColor ?? "#1f2937" : "transparent");
  element.dataset.hairStyle = hairStyles.includes(character.hairStyle) ? character.hairStyle : "short";
  element.innerHTML = avatarMarkup(character);
}

function renderCharacters() {
  const grid = $("#character-grid");
  grid.innerHTML = "";
  characters.forEach((character, index) => {
    const card = document.createElement("button");
    card.className = "character-card";
    card.type = "button";
    card.innerHTML = `
      <div class="avatar"></div>
      <strong>${character.name}</strong>
      <span class="muted">${character.glasses ? "Con occhiali" : "Senza occhiali"}</span>
    `;
    applyAvatar(card.querySelector(".avatar"), character);
    card.addEventListener("click", () => selectCharacter(index));
    grid.appendChild(card);
  });
  grid.appendChild(createCustomCharacterCard());
}

function selectCharacter(index) {
  state.character = characters[index];
  startGame();
  saveGame();
}

function createCustomCharacterCard() {
  const card = document.createElement("article");
  card.className = "custom-card";
  card.innerHTML = `
    <div class="custom-preview">
      <div class="avatar"></div>
      <div>
        <strong>Crea il tuo</strong>
        <span class="muted">Personaggio personalizzato</span>
      </div>
    </div>
    <label>
      Nome
      <input id="custom-name" type="text" maxlength="24" value="${customCharacterDefaults.name}" autocomplete="off">
    </label>
    <div class="custom-colors" aria-label="Colori personaggio">
      <label>Capelli <input id="custom-hair" type="color" value="${customCharacterDefaults.hair}"></label>
      <label>Pelle <input id="custom-skin" type="color" value="${customCharacterDefaults.skin}"></label>
      <label>Occhi <input id="custom-eyes" type="color" value="${customCharacterDefaults.eyes}"></label>
      <label>Maglia <input id="custom-shirt" type="color" value="${customCharacterDefaults.shirt}"></label>
      <label>Occhiali <input id="custom-glasses-color" type="color" value="${customCharacterDefaults.glassesColor}"></label>
    </div>
    <label>
      Acconciatura
      <select id="custom-hair-style">
        <option value="short">Corta</option>
        <option value="fringe">Ciuffo</option>
        <option value="curly">Riccia</option>
        <option value="long">Lunga</option>
      </select>
    </label>
    <label class="custom-toggle">
      <input id="custom-glasses" type="checkbox">
      Ha gli occhiali
    </label>
    <button id="create-custom-character" class="buy-button" type="button">Crea e gioca</button>
  `;

  const preview = card.querySelector(".avatar");
  const readCustomCharacter = () => ({
    name: sanitizeCharacterName(card.querySelector("#custom-name").value),
    skin: normalizeColor(card.querySelector("#custom-skin").value, customCharacterDefaults.skin),
    hair: normalizeColor(card.querySelector("#custom-hair").value, customCharacterDefaults.hair),
    eyes: normalizeColor(card.querySelector("#custom-eyes").value, customCharacterDefaults.eyes),
    glasses: card.querySelector("#custom-glasses").checked,
    glassesColor: normalizeColor(card.querySelector("#custom-glasses-color").value, customCharacterDefaults.glassesColor),
    shirt: normalizeColor(card.querySelector("#custom-shirt").value, customCharacterDefaults.shirt),
    hairStyle: normalizeHairStyle(card.querySelector("#custom-hair-style").value),
    custom: true
  });
  const updatePreview = () => applyAvatar(preview, readCustomCharacter());

  card.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("input", updatePreview);
    control.addEventListener("change", updatePreview);
  });
  card.querySelector("#create-custom-character").addEventListener("click", () => selectCustomCharacter(readCustomCharacter()));
  updatePreview();
  return card;
}

function selectCustomCharacter(character) {
  state.character = sanitizeCharacter(character);
  startGame();
  saveGame();
}

function startGame() {
  $("#character-screen").classList.remove("active");
  $("#game-screen").classList.add("active");
  closeComputerWindow();
  $("#creator-name").textContent = state.character.name;
  applyAvatar($("#selected-avatar"), state.character);
  applyAvatar($("#studio-avatar"), state.character);
  updateUi();
  resetTicTacToe();
  resetConnectFour();
  resetHangman();
}

function updateUi() {
  $("#money-value").textContent = state.money;
  $("#followers-value").textContent = state.followers;
  $("#subscribers-value").textContent = state.subscribers;
  $("#likes-value").textContent = state.likes;
  $("#setup-value").textContent = state.inventory.size ? `${state.inventory.size}/${shopItems.length}` : "Base";
  $("#channel-status").textContent = channelStatus();
  $("#progress-text").textContent = progressText();
  renderInventory();
  renderShop();
  renderStudioGear();
  renderDifficultyButtons();
  renderModeButtons();
}

function channelStatus() {
  if (state.subscribers >= 250) return "Creator emergente";
  if (state.subscribers >= 100) return "Piccolo canale in crescita";
  if (state.subscribers >= 30) return "Primi iscritti";
  return "Canale appena creato";
}

function progressText() {
  if (state.inventory.size === shopItems.length) return "Il setup e' completo. Continua a vincere mini-giochi per far crescere il canale.";
  if (state.money >= nextAffordablePrice()) return "Hai abbastanza soldi per migliorare lo studio nel negozio.";
  return "Usa il computer dello studio per giocare ai mini-giochi, ottenere follower e comprare il prossimo upgrade.";
}

function nextAffordablePrice() {
  const next = shopItems.find((item) => !state.inventory.has(item.id));
  return next ? next.price : Infinity;
}

function renderInventory() {
  const list = $("#inventory-list");
  const owned = shopItems.filter((item) => state.inventory.has(item.id));
  list.innerHTML = owned.length
    ? owned.map((item) => `<div>${item.name}</div>`).join("")
    : "<div>Nessun equipaggiamento comprato</div>";
}

function renderShop() {
  const list = $("#shop-list");
  list.innerHTML = "";
  shopItems.forEach((item) => {
    const owned = state.inventory.has(item.id);
    const article = document.createElement("article");
    article.className = `shop-item${owned ? " owned" : ""}`;
    article.innerHTML = `
      <h3>${item.name}</h3>
      <p class="muted">+${item.boost} follower bonus quando vinci una partita.</p>
      <strong>${owned ? "Comprato" : `${item.price} soldi`}</strong>
      <button class="buy-button" ${owned || state.money < item.price ? "disabled" : ""}>${owned ? "Gia' tuo" : "Compra"}</button>
    `;
    article.querySelector("button").addEventListener("click", () => buyItem(item));
    list.appendChild(article);
  });
}

function renderStudioGear() {
  shopItems.forEach((item) => {
    const element = $(`#gear-${item.id}`);
    if (!element) return;
    const owned = state.inventory.has(item.id);
    element.classList.toggle("owned", owned);
    element.classList.toggle("movable", owned && movableGearIds.includes(item.id));
    applyStudioPosition(item.id, element);
  });
}

function buyItem(item) {
  if (state.inventory.has(item.id) || state.money < item.price) return;
  state.money -= item.price;
  state.inventory.add(item.id);
  updateUi();
  saveGame();
}

function reward(amount, baseFollowers) {
  const boost = shopItems
    .filter((item) => state.inventory.has(item.id))
    .reduce((sum, item) => sum + item.boost, 0);
  state.money += amount;
  state.followers += baseFollowers + boost;
  state.subscribers += baseFollowers + Math.ceil(boost / 2);
  state.likes += amount * 8 + baseFollowers * 3 + boost * 2;
  updateUi();
  saveGame();
}

function saveGame() {
  if (!state.character) return;
  activeSaveSlot = normalizeSaveSlot(activeSaveSlot);
  localStorage.setItem(getSaveKey(activeSaveSlot), JSON.stringify(createSavePayload()));
  localStorage.setItem(activeSlotKey, activeSaveSlot);
  updateSaveSlotUi();
}

function createSavePayload() {
  return {
    characterName: state.character.name,
    character: serializeCharacter(state.character),
    money: state.money,
    followers: state.followers,
    subscribers: state.subscribers,
    likes: state.likes,
    inventory: [...state.inventory],
    studioPositions: { ...state.studioPositions },
    mode: { ...state.mode },
    difficulty: { ...state.difficulty }
  };
}

function loadGame(slot = activeSaveSlot) {
  activeSaveSlot = normalizeSaveSlot(slot);
  const raw = localStorage.getItem(getSaveKey(activeSaveSlot)) || (activeSaveSlot === "1" ? localStorage.getItem(legacySaveKey) : null);
  if (!raw) return false;
  try {
    const save = JSON.parse(raw);
    if (!applySavePayload(save)) return false;
    localStorage.setItem(activeSlotKey, activeSaveSlot);
    startGame();
    saveGame();
    return true;
  } catch {
    return false;
  }
}

function applySavePayload(save) {
  if (!save || typeof save !== "object") return false;
  const character = save.character ? sanitizeCharacter(save.character) : findSavedCharacter(save.characterName);
  if (!character) return false;

  state.character = character;
  state.money = sanitizeStat(save.money);
  state.followers = sanitizeStat(save.followers);
  state.subscribers = sanitizeStat(save.subscribers);
  state.likes = sanitizeStat(save.likes);
  state.inventory = new Set(sanitizeInventory(save.inventory));
  state.studioPositions = sanitizeStudioPositions(save.studioPositions);
  state.difficulty = {
    ttt: rewards.ttt[save.difficulty?.ttt] ? save.difficulty.ttt : "easy",
    c4: rewards.c4[save.difficulty?.c4] ? save.difficulty.c4 : "easy",
    hangman: rewards.hangman[save.difficulty?.hangman] ? save.difficulty.hangman : "easy"
  };
  state.mode = {
    ttt: ["cpu", "local"].includes(save.mode?.ttt) ? save.mode.ttt : "cpu",
    c4: ["cpu", "local"].includes(save.mode?.c4) ? save.mode.c4 : "cpu"
  };
  return true;
}

function findSavedCharacter(name) {
  const character = characters.find((item) => item.name === name);
  if (character) return character;
  if (name === "Rina Maker") {
    return sanitizeCharacter({ ...customCharacterDefaults, name: "Rina Maker" });
  }
  return null;
}

function serializeCharacter(character) {
  return sanitizeCharacter(character);
}

function sanitizeCharacter(character) {
  if (!character || typeof character !== "object") return null;
  return {
    name: sanitizeCharacterName(character.name),
    skin: normalizeColor(character.skin, customCharacterDefaults.skin),
    hair: normalizeColor(character.hair, customCharacterDefaults.hair),
    eyes: normalizeColor(character.eyes, customCharacterDefaults.eyes),
    glasses: Boolean(character.glasses),
    glassesColor: normalizeColor(character.glassesColor, customCharacterDefaults.glassesColor),
    shirt: normalizeColor(character.shirt, customCharacterDefaults.shirt),
    hairStyle: normalizeHairStyle(character.hairStyle),
    custom: Boolean(character.custom)
  };
}

function sanitizeCharacterName(name) {
  const normalized = String(name ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
  return normalized || customCharacterDefaults.name;
}

function normalizeColor(value, fallback) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function normalizeHairStyle(value) {
  return hairStyles.includes(value) ? value : customCharacterDefaults.hairStyle;
}

function normalizeSaveSlot(slot) {
  const normalized = String(slot ?? "1");
  return saveSlots.includes(normalized) ? normalized : "1";
}

function sanitizeStat(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function sanitizeInventory(inventory) {
  if (!Array.isArray(inventory)) return [];
  const validItemIds = new Set(shopItems.map((item) => item.id));
  return inventory.filter((id) => validItemIds.has(id));
}

function sanitizeStudioPositions(positions) {
  if (!positions || typeof positions !== "object" || Array.isArray(positions)) return {};
  return movableGearIds.reduce((validPositions, id) => {
    const position = positions[id];
    if (!position || typeof position !== "object") return validPositions;
    const x = Number(position.x);
    const y = Number(position.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return validPositions;
    validPositions[id] = {
      x: clamp(x, 0, 1),
      y: clamp(y, 0, 1)
    };
    return validPositions;
  }, {});
}

function getSaveKey(slot) {
  return `${legacySaveKey}:slot:${normalizeSaveSlot(slot)}`;
}

function resetProgress() {
  localStorage.removeItem(getSaveKey(activeSaveSlot));
  if (activeSaveSlot === "1") localStorage.removeItem(legacySaveKey);
  state.character = null;
  state.money = 0;
  state.followers = 0;
  state.subscribers = 0;
  state.likes = 0;
  state.inventory = new Set();
  state.studioPositions = {};
  state.difficulty = { ttt: "easy", c4: "easy", hangman: "easy" };
  state.mode = { ttt: "cpu", c4: "cpu" };
  $("#game-screen").classList.remove("active");
  $("#character-screen").classList.add("active");
  closeComputerWindow();
  switchView("dashboard");
  renderCharacters();
  updateSaveSlotUi();
}

function switchView(viewId) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewId));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  if (viewId === "dashboard") renderStudioGear();
}

function setupTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });
}

function setupComputerWindow() {
  $("#gear-monitor").addEventListener("click", (event) => {
    event.stopPropagation();
    openComputerWindow();
  });
  $("#close-computer").addEventListener("click", closeComputerWindow);
  $("#computer-window").addEventListener("click", (event) => {
    if (event.target.id === "computer-window") closeComputerWindow();
  });
  $$(".computer-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchComputerGame(tab.dataset.gamePanel));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeComputerWindow();
  });
}

function openComputerWindow() {
  const window = $("#computer-window");
  window.classList.add("open");
  window.setAttribute("aria-hidden", "false");
  switchComputerGame($(".computer-tab.active")?.dataset.gamePanel ?? "tic-tac-toe");
}

function closeComputerWindow() {
  const window = $("#computer-window");
  if (!window) return;
  window.classList.remove("open");
  window.setAttribute("aria-hidden", "true");
}

function switchComputerGame(gamePanelId) {
  $$(".computer-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.gamePanel === gamePanelId);
  });
  $$(".game-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === gamePanelId);
  });
}

function setupDifficulty() {
  $$(".difficulty-button").forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.closest(".difficulty").dataset.game;
      state.difficulty[game] = button.dataset.difficulty;
      renderDifficultyButtons();
      if (game === "ttt") resetTicTacToe();
      if (game === "c4") resetConnectFour();
      if (game === "hangman") resetHangman();
      saveGame();
    });
  });
}

function setupModeSwitches() {
  $$(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.closest(".mode-switch").dataset.game;
      state.mode[game] = button.dataset.mode;
      renderModeButtons();
      if (game === "ttt") resetTicTacToe();
      if (game === "c4") resetConnectFour();
      saveGame();
    });
  });
}

function setupSaveSlots() {
  const slotSelect = $("#save-slot");
  slotSelect.value = activeSaveSlot;
  slotSelect.addEventListener("change", () => {
    updateSaveSlotUi();
    setSaveStatus(`Slot ${normalizeSaveSlot(slotSelect.value)} selezionato`);
  });
  $("#manual-save").addEventListener("click", () => {
    activeSaveSlot = normalizeSaveSlot(slotSelect.value);
    saveGame();
    setSaveStatus(`Salvato slot ${activeSaveSlot}`);
  });
  $("#manual-load").addEventListener("click", () => {
    const slotToLoad = normalizeSaveSlot(slotSelect.value);
    const loaded = loadGame(slotToLoad);
    if (!loaded) {
      slotSelect.value = slotToLoad;
      $("#channel-status").textContent = `Slot ${slotToLoad} vuoto`;
      setSaveStatus(`Slot ${slotToLoad} vuoto`);
      updateSaveSlotUi();
      return;
    }
    setSaveStatus(`Caricato slot ${activeSaveSlot}`);
  });
  updateSaveSlotUi();
}

function updateSaveSlotUi() {
  const slotSelect = $("#save-slot");
  const selectedSlot = normalizeSaveSlot(slotSelect?.value ?? activeSaveSlot);
  if (slotSelect) slotSelect.value = selectedSlot;
  $$("#save-slot option").forEach((option) => {
    const hasSave = Boolean(localStorage.getItem(getSaveKey(option.value)) || (option.value === "1" && localStorage.getItem(legacySaveKey)));
    option.textContent = hasSave ? `${option.value} - salvato` : `${option.value} - vuoto`;
  });
}

function setSaveStatus(message) {
  const status = $("#save-status");
  if (status) status.textContent = message;
}

function setupStudioDragging() {
  movableGearIds.forEach((id) => {
    const element = $(`#gear-${id}`);
    if (!element) return;
    element.addEventListener("pointerdown", (event) => startStudioDrag(event, id, element));
    element.addEventListener("dblclick", (event) => selectStudioGear(event, id, element));
  });
  $(".studio").addEventListener("click", placeSelectedStudioGear);
}

function selectStudioGear(event, id, element) {
  if (!state.inventory.has(id)) return;
  event.preventDefault();
  event.stopPropagation();
  selectedStudioGear = id;
  $$(".movable").forEach((item) => item.classList.remove("selected"));
  element.classList.add("selected");
}

function placeSelectedStudioGear(event) {
  if (!selectedStudioGear) return;
  const element = $(`#gear-${selectedStudioGear}`);
  if (!element || event.target.closest(".movable")) return;
  moveStudioElementToPoint(selectedStudioGear, element, event.clientX, event.clientY);
  element.classList.remove("selected");
  selectedStudioGear = null;
  saveGame();
}

function startStudioDrag(event, id, element) {
  if (!state.inventory.has(id)) return;
  const studio = $(".studio");
  const studioRect = studio.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  moveElementToStudioLayer(element, studio, studioRect, elementRect);

  element.classList.add("placed", "dragging");

  const offsetX = event.clientX - elementRect.left;
  const offsetY = event.clientY - elementRect.top;

  element.setPointerCapture(event.pointerId);

  const move = (moveEvent) => {
    const latestStudioRect = studio.getBoundingClientRect();
    const latestElementRect = element.getBoundingClientRect();
    const maxX = latestStudioRect.width - latestElementRect.width;
    const maxY = latestStudioRect.height - latestElementRect.height;
    const x = clamp(moveEvent.clientX - latestStudioRect.left - offsetX, 0, Math.max(0, maxX));
    const y = clamp(moveEvent.clientY - latestStudioRect.top - offsetY, 0, Math.max(0, maxY));
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    state.studioPositions[id] = {
      x: latestStudioRect.width ? x / latestStudioRect.width : 0,
      y: latestStudioRect.height ? y / latestStudioRect.height : 0
    };
  };

  const stop = () => {
    element.classList.remove("dragging");
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", stop);
    element.removeEventListener("pointercancel", stop);
    saveGame();
  };

  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", stop);
  element.addEventListener("pointercancel", stop);
}

function moveStudioElementToPoint(id, element, clientX, clientY) {
  const studio = $(".studio");
  const studioRect = studio.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  moveElementToStudioLayer(element, studio, studioRect, elementRect);

  const latestElementRect = element.getBoundingClientRect();
  const maxX = studioRect.width - latestElementRect.width;
  const maxY = studioRect.height - latestElementRect.height;
  const x = clamp(clientX - studioRect.left - latestElementRect.width / 2, 0, Math.max(0, maxX));
  const y = clamp(clientY - studioRect.top - latestElementRect.height / 2, 0, Math.max(0, maxY));
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  state.studioPositions[id] = {
    x: studioRect.width ? x / studioRect.width : 0,
    y: studioRect.height ? y / studioRect.height : 0
  };
}

function moveElementToStudioLayer(element, studio, studioRect, elementRect) {
  if (element.parentElement !== studio) {
    studio.appendChild(element);
  }
  element.classList.add("placed");
  element.style.left = `${elementRect.left - studioRect.left}px`;
  element.style.top = `${elementRect.top - studioRect.top}px`;
  element.style.width = `${elementRect.width}px`;
  element.style.height = `${elementRect.height}px`;
}

function applyStudioPosition(id, element) {
  const position = state.studioPositions[id];
  if (!position || !movableGearIds.includes(id)) return;
  const studio = $(".studio");
  const studioRect = studio.getBoundingClientRect();
  if (!studioRect.width || !studioRect.height) return;
  if (element.parentElement !== studio) {
    studio.appendChild(element);
  }
  element.classList.add("placed");
  element.style.left = `${position.x * studioRect.width}px`;
  element.style.top = `${position.y * studioRect.height}px`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renderDifficultyButtons() {
  $$(".difficulty").forEach((group) => {
    const game = group.dataset.game;
    group.querySelectorAll(".difficulty-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.difficulty === state.difficulty[game]);
    });
  });
}

function renderModeButtons() {
  $$(".mode-switch").forEach((group) => {
    const game = group.dataset.game;
    group.querySelectorAll(".mode-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === state.mode[game]);
    });
  });
}

function resetTicTacToe() {
  state.ttt.board = Array(9).fill("");
  state.ttt.over = false;
  state.ttt.turn = "X";
  if (state.mode.ttt === "local") {
    $("#ttt-message").textContent = "2 giocatori: turno di X.";
  } else {
    const reward = rewards.ttt[state.difficulty.ttt].money;
    $("#ttt-message").textContent = `Tocca una casella per iniziare. Vittoria: ${reward} soldi.`;
  }
  renderTicTacToe();
}

function renderTicTacToe() {
  const board = $("#ttt-board");
  board.innerHTML = "";
  state.ttt.board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "ttt-cell";
    cell.type = "button";
    cell.textContent = value;
    cell.setAttribute("aria-label", `Casella ${index + 1}`);
    cell.addEventListener("click", () => playTicTacToe(index));
    board.appendChild(cell);
  });
}

function playTicTacToe(index) {
  if (state.ttt.over || state.ttt.board[index]) return;
  if (state.mode.ttt === "local") {
    state.ttt.board[index] = state.ttt.turn;
    const result = getTicTacToeWinner(state.ttt.board);
    if (finishTicTacToeIfNeeded(result)) return;
    state.ttt.turn = state.ttt.turn === "X" ? "O" : "X";
    $("#ttt-message").textContent = `2 giocatori: turno di ${state.ttt.turn}.`;
    renderTicTacToe();
    return;
  }

  state.ttt.board[index] = "X";
  const playerResult = getTicTacToeWinner(state.ttt.board);
  if (finishTicTacToeIfNeeded(playerResult)) return;

  const cpuMove = chooseTicTacToeMove();
  if (cpuMove !== -1) state.ttt.board[cpuMove] = "O";
  finishTicTacToeIfNeeded(getTicTacToeWinner(state.ttt.board));
  renderTicTacToe();
}

function chooseTicTacToeMove() {
  const empty = state.ttt.board.map((value, index) => (value ? null : index)).filter((value) => value !== null);
  if (state.difficulty.ttt === "easy") {
    const tacticalMove = findWinningMove("O") ?? findWinningMove("X");
    return Math.random() < 0.45 ? tacticalMove ?? randomFrom(empty) : randomFrom(empty);
  }
  if (state.difficulty.ttt === "medium") {
    const bestMove = chooseBestTicTacToeMove(empty);
    return Math.random() < 0.65 ? bestMove : findWinningMove("O") ?? findWinningMove("X") ?? randomFrom(empty);
  }
  return findWinningMove("O") ?? findWinningMove("X") ?? chooseBestTicTacToeMove(empty);
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)] ?? -1;
}

function chooseBestTicTacToeMove(empty) {
  let bestScore = -Infinity;
  let bestMove = empty[0] ?? -1;
  empty.forEach((move) => {
    const test = [...state.ttt.board];
    test[move] = "O";
    const score = minimaxTicTacToe(test, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });
  return bestMove;
}

function minimaxTicTacToe(board, cpuTurn) {
  const result = getTicTacToeWinner(board);
  if (result === "O") return 10;
  if (result === "X") return -10;
  if (result === "draw") return 0;

  const empty = board.map((value, index) => (value ? null : index)).filter((value) => value !== null);
  if (cpuTurn) {
    return Math.max(...empty.map((move) => {
      const test = [...board];
      test[move] = "O";
      return minimaxTicTacToe(test, false);
    }));
  }
  return Math.min(...empty.map((move) => {
    const test = [...board];
    test[move] = "X";
    return minimaxTicTacToe(test, true);
  }));
}

function findWinningMove(symbol) {
  for (let i = 0; i < state.ttt.board.length; i += 1) {
    if (state.ttt.board[i]) continue;
    const test = [...state.ttt.board];
    test[i] = symbol;
    if (getTicTacToeWinner(test) === symbol) return i;
  }
  return null;
}

function getTicTacToeWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

function finishTicTacToeIfNeeded(result) {
  if (!result) {
    renderTicTacToe();
    return false;
  }
  state.ttt.over = true;
  if (result === "X") {
    if (state.mode.ttt === "local") {
      $("#ttt-message").textContent = "X ha vinto.";
    } else {
      const prize = rewards.ttt[state.difficulty.ttt];
      $("#ttt-message").textContent = `Hai vinto. +${prize.money} soldi e nuovi follower.`;
      reward(prize.money, prize.followers);
    }
  } else if (result === "O") {
    $("#ttt-message").textContent = state.mode.ttt === "local" ? "O ha vinto." : "La CPU ha vinto. Riprova.";
  } else {
    $("#ttt-message").textContent = "Pareggio. Nuova strategia?";
  }
  renderTicTacToe();
  return true;
}

function resetConnectFour() {
  state.c4.board = Array.from({ length: state.c4.rows }, () => Array(state.c4.cols).fill(""));
  state.c4.over = false;
  state.c4.turn = "player";
  if (state.mode.c4 === "local") {
    $("#c4-message").textContent = "2 giocatori: turno rosso.";
  } else {
    const reward = rewards.c4[state.difficulty.c4].money;
    $("#c4-message").textContent = `Scegli una colonna. Vittoria: ${reward} soldi.`;
  }
  renderConnectFour();
}

function renderConnectFour() {
  const board = $("#c4-board");
  board.innerHTML = "";
  for (let row = 0; row < state.c4.rows; row += 1) {
    for (let col = 0; col < state.c4.cols; col += 1) {
      const cell = document.createElement("button");
      const value = state.c4.board[row][col];
      cell.className = `c4-cell ${value}`;
      cell.type = "button";
      cell.setAttribute("aria-label", `Colonna ${col + 1}`);
      cell.addEventListener("click", () => playConnectFour(col));
      board.appendChild(cell);
    }
  }
}

function playConnectFour(col) {
  if (state.c4.over) return;
  if (state.mode.c4 === "local") {
    const symbol = state.c4.turn;
    if (!dropToken(col, symbol)) return;
    if (finishConnectFourIfNeeded(symbol)) return;
    state.c4.turn = state.c4.turn === "player" ? "cpu" : "player";
    $("#c4-message").textContent = `2 giocatori: turno ${state.c4.turn === "player" ? "rosso" : "giallo"}.`;
    renderConnectFour();
    return;
  }

  if (!dropToken(col, "player")) return;
  if (finishConnectFourIfNeeded("player")) return;

  const cpuCol = chooseConnectFourMove();
  if (cpuCol !== -1) dropToken(cpuCol, "cpu");
  finishConnectFourIfNeeded("cpu");
  renderConnectFour();
}

function dropToken(col, symbol) {
  for (let row = state.c4.rows - 1; row >= 0; row -= 1) {
    if (!state.c4.board[row][col]) {
      state.c4.board[row][col] = symbol;
      return true;
    }
  }
  return false;
}

function chooseConnectFourMove() {
  const playable = playableConnectFourColumns();
  if (state.difficulty.c4 === "easy") {
    const winning = findConnectFourMove("cpu");
    return Math.random() < 0.35 ? winning !== -1 ? winning : randomFrom(playable) : randomFrom(playable);
  }

  const winning = findConnectFourMove("cpu");
  if (winning !== -1) return winning;
  const blocking = findConnectFourMove("player");
  if (blocking !== -1) return blocking;

  if (state.difficulty.c4 === "medium") {
    return chooseMinimaxConnectFourMove(playable, 4);
  }
  return chooseMinimaxConnectFourMove(playable, 6);
}

function chooseMinimaxConnectFourMove(playable, depth) {
  let bestScore = -Infinity;
  let bestColumns = [];
  playable.forEach((col) => {
    const row = getDropRow(col);
    state.c4.board[row][col] = "cpu";
    const score = minimaxConnectFour(depth - 1, false, -Infinity, Infinity);
    state.c4.board[row][col] = "";
    if (score > bestScore) {
      bestScore = score;
      bestColumns = [col];
    } else if (score === bestScore) {
      bestColumns.push(col);
    }
  });
  return preferCenterColumn(bestColumns);
}

function minimaxConnectFour(depth, cpuTurn, alpha, beta) {
  if (hasConnectFour("cpu")) return 100000 + depth;
  if (hasConnectFour("player")) return -100000 - depth;
  const playable = playableConnectFourColumns();
  if (depth === 0 || playable.length === 0) return evaluateConnectFourBoard();

  if (cpuTurn) {
    let value = -Infinity;
    for (const col of orderColumnsByCenter(playable)) {
      const row = getDropRow(col);
      state.c4.board[row][col] = "cpu";
      value = Math.max(value, minimaxConnectFour(depth - 1, false, alpha, beta));
      state.c4.board[row][col] = "";
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  }

  let value = Infinity;
  for (const col of orderColumnsByCenter(playable)) {
    const row = getDropRow(col);
    state.c4.board[row][col] = "player";
    value = Math.min(value, minimaxConnectFour(depth - 1, true, alpha, beta));
    state.c4.board[row][col] = "";
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return value;
}

function evaluateConnectFourBoard() {
  const centerColumn = state.c4.board.map((row) => row[3]);
  const cpuCenter = centerColumn.filter((cell) => cell === "cpu").length;
  const playerCenter = centerColumn.filter((cell) => cell === "player").length;
  return scoreConnectFourBoard("cpu") - scoreConnectFourBoard("player") + (cpuCenter - playerCenter) * 10;
}

function preferCenterColumn(columns) {
  const ordered = orderColumnsByCenter(columns);
  return ordered[0] ?? -1;
}

function orderColumnsByCenter(columns) {
  const centerOrder = [3, 2, 4, 1, 5, 0, 6];
  return centerOrder.filter((col) => columns.includes(col));
}

function chooseBestConnectFourMove(playable) {
  let bestScore = -Infinity;
  let bestColumns = [];
  playable.forEach((col) => {
    const row = getDropRow(col);
    state.c4.board[row][col] = "cpu";
    const givesPlayerWin = findConnectFourMove("player") !== -1;
    const score = scoreConnectFourBoard("cpu") - scoreConnectFourBoard("player") - (givesPlayerWin ? 500 : 0);
    state.c4.board[row][col] = "";
    if (score > bestScore) {
      bestScore = score;
      bestColumns = [col];
    } else if (score === bestScore) {
      bestColumns.push(col);
    }
  });
  return randomFrom(bestColumns);
}

function scoreConnectFourBoard(symbol) {
  const lines = collectConnectFourLines();
  return lines.reduce((score, line) => {
    const own = line.filter((cell) => cell === symbol).length;
    const empty = line.filter((cell) => !cell).length;
    const opponent = line.length - own - empty;
    if (opponent > 0 || own === 0) return score;
    if (own === 4) return score + 100000;
    if (own === 3 && empty === 1) return score + 80;
    if (own === 2 && empty === 2) return score + 18;
    if (own === 1 && empty === 3) return score + 4;
    return score;
  }, 0);
}

function collectConnectFourLines() {
  const lines = [];
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let row = 0; row < state.c4.rows; row += 1) {
    for (let col = 0; col < state.c4.cols; col += 1) {
      for (const [dr, dc] of directions) {
        const line = [];
        for (let step = 0; step < 4; step += 1) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;
          if (nextRow < 0 || nextRow >= state.c4.rows || nextCol < 0 || nextCol >= state.c4.cols) break;
          line.push(state.c4.board[nextRow][nextCol]);
        }
        if (line.length === 4) lines.push(line);
      }
    }
  }
  return lines;
}

function playableConnectFourColumns() {
  const playable = [];
  for (let col = 0; col < state.c4.cols; col += 1) {
    if (!state.c4.board[0][col]) playable.push(col);
  }
  return playable;
}

function findConnectFourMove(symbol) {
  for (const col of playableConnectFourColumns()) {
    const row = getDropRow(col);
    state.c4.board[row][col] = symbol;
    const wins = hasConnectFour(symbol);
    state.c4.board[row][col] = "";
    if (wins) return col;
  }
  return -1;
}

function getDropRow(col) {
  for (let row = state.c4.rows - 1; row >= 0; row -= 1) {
    if (!state.c4.board[row][col]) return row;
  }
  return -1;
}

function finishConnectFourIfNeeded(symbol) {
  if (hasConnectFour(symbol)) {
    state.c4.over = true;
    if (symbol === "player") {
      if (state.mode.c4 === "local") {
        $("#c4-message").textContent = "Rosso ha vinto.";
      } else {
        const prize = rewards.c4[state.difficulty.c4];
        $("#c4-message").textContent = `Hai vinto a Forza 4. +${prize.money} soldi.`;
        reward(prize.money, prize.followers);
      }
    } else {
      $("#c4-message").textContent = state.mode.c4 === "local" ? "Giallo ha vinto." : "La CPU ha fatto Forza 4.";
    }
    renderConnectFour();
    return true;
  }
  if (state.c4.board[0].every(Boolean)) {
    state.c4.over = true;
    $("#c4-message").textContent = "Tabellone pieno. Pareggio.";
    renderConnectFour();
    return true;
  }
  return false;
}

function resetHangman() {
  const difficulty = state.difficulty.hangman;
  const words = hangmanWords[difficulty] ?? hangmanWords.easy;
  state.hangman.word = randomFrom(words).toUpperCase();
  state.hangman.guessed = new Set();
  state.hangman.wrong = new Set();
  state.hangman.maxWrong = difficulty === "hard" ? 5 : difficulty === "medium" ? 6 : 7;
  state.hangman.over = false;
  $("#hangman-message").textContent = `Scegli una lettera. Vittoria: ${rewards.hangman[difficulty].money} soldi.`;
  renderHangman();
}

function renderHangman() {
  const word = $("#hangman-word");
  word.innerHTML = "";
  [...state.hangman.word].forEach((letter) => {
    const slot = document.createElement("span");
    slot.textContent = state.hangman.guessed.has(letter) ? letter : "";
    word.appendChild(slot);
  });

  const wrongCount = state.hangman.wrong.size;
  $(".hangman-drawing").dataset.wrong = Math.min(7, Math.ceil((wrongCount / state.hangman.maxWrong) * 7));
  $("#hangman-errors").textContent = `Errori rimasti: ${Math.max(0, state.hangman.maxWrong - wrongCount)}`;

  const letters = $("#hangman-letters");
  letters.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const button = document.createElement("button");
    button.className = "letter-button";
    button.type = "button";
    button.textContent = letter;
    button.disabled = state.hangman.over || state.hangman.guessed.has(letter) || state.hangman.wrong.has(letter);
    button.addEventListener("click", () => playHangman(letter));
    letters.appendChild(button);
  });
}

function playHangman(letter) {
  if (state.hangman.over || state.hangman.guessed.has(letter) || state.hangman.wrong.has(letter)) return;
  const correct = state.hangman.word.includes(letter);
  if (correct) {
    state.hangman.guessed.add(letter);
  } else {
    state.hangman.wrong.add(letter);
  }
  if (!finishHangmanIfNeeded()) {
    $("#hangman-message").textContent = correct ? "Lettera giusta." : "Lettera sbagliata.";
  }
  renderHangman();
}

function finishHangmanIfNeeded() {
  const won = [...state.hangman.word].every((letter) => state.hangman.guessed.has(letter));
  if (won) {
    state.hangman.over = true;
    const prize = rewards.hangman[state.difficulty.hangman];
    $("#hangman-message").textContent = `Hai indovinato ${state.hangman.word}. +${prize.money} soldi.`;
    reward(prize.money, prize.followers);
    return true;
  }
  if (state.hangman.wrong.size >= state.hangman.maxWrong) {
    state.hangman.over = true;
    $("#hangman-message").textContent = `Hai perso. La parola era ${state.hangman.word}.`;
    return true;
  }
  return false;
}

function hasConnectFour(symbol) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let row = 0; row < state.c4.rows; row += 1) {
    for (let col = 0; col < state.c4.cols; col += 1) {
      if (state.c4.board[row][col] !== symbol) continue;
      for (const [dr, dc] of directions) {
        let count = 1;
        for (let step = 1; step < 4; step += 1) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;
          if (state.c4.board[nextRow]?.[nextCol] === symbol) count += 1;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}

renderCharacters();
setupTabs();
setupComputerWindow();
setupDifficulty();
setupModeSwitches();
setupSaveSlots();
setupStudioDragging();
loadGame();
$("#reset-ttt").addEventListener("click", resetTicTacToe);
$("#reset-c4").addEventListener("click", resetConnectFour);
$("#reset-hangman").addEventListener("click", resetHangman);
$("#reset-progress").addEventListener("click", resetProgress);
