(function(){
"use strict";

// ---------- DOM 元素 ----------
const apiProviderSelect = document.getElementById('apiProviderSelect');
const modelSelect = document.getElementById('modelSelect');
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatTitleDisplay = document.getElementById('chatTitleDisplay');
const configBtn = document.getElementById('configMenuBtn');
const drawer = document.getElementById('configDrawer');
const overlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const modelInput = document.getElementById('modelInput');
const characterNameInput = document.getElementById('characterNameInput');
const systemPromptInput = document.getElementById('systemPromptInput');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiUrlInput = document.getElementById('apiUrlInput');
const apiStatus = document.getElementById('apiStatus');
const themeToggleSettings = document.getElementById('themeToggleSettings');
const themeLabelTextSettings = document.getElementById('themeLabelTextSettings');
const gearIcon = document.querySelector('.sidebar-icon[title="设置"]');
const chatIcon = document.querySelector('.sidebar-icon[title="当前对话"]');
const characterIcon = document.getElementById('characterIcon');
const dataManagerIcon = document.getElementById('dataManagerIcon');
const userAvatarBtn = document.getElementById('userAvatarBtn');
const chatMain = document.getElementById('chatMain');
const profileDisplayName = document.getElementById('profileDisplayName');
const profileBioDisplay = document.getElementById('profileBioDisplay');
const editProfileNameInput = document.getElementById('editProfileNameInput');
const editProfileBioInput = document.getElementById('editProfileBioInput');
const worldBookInput = document.getElementById('worldBookInput');
const charNameInput = document.getElementById('charNameInput');
const charAgeInput = document.getElementById('charAgeInput');
const charGenderInput = document.getElementById('charGenderInput');
const charAppearanceInput = document.getElementById('charAppearanceInput');
const charPersonalityInput = document.getElementById('charPersonalityInput');
const charBackstoryInput = document.getElementById('charBackstoryInput');
const charMemoriesInput = document.getElementById('charMemoriesInput');
const charStyleInput = document.getElementById('charStyleInput');
const charExamplesInput = document.getElementById('charExamplesInput');
const saveCharacterBtn = document.getElementById('saveCharacterBtn');
const resetCharacterBtn = document.getElementById('resetCharacterBtn');
const characterBioInput = document.getElementById('characterBioInput');
const characterPreviewBg = document.getElementById('characterPreviewBg');
const characterPreviewAvatar = document.getElementById('characterPreviewAvatar');
const characterPreviewName = document.getElementById('characterPreviewName');
const characterPreviewBio = document.getElementById('characterPreviewBio');
const editCharacterAvatarBtn = document.getElementById('editCharacterAvatarBtn');
const editCharacterCoverBtn = document.getElementById('editCharacterCoverBtn');

// ---------- 状态 ----------
let messages = [
  { role: 'assistant', content: '你好！我是青绿色调的角色。点击右上角「···」配置 API 或切换白天/黑夜模式。', timestamp: Date.now() }
];
let config = {
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  characterName: '青绿助手',
  systemPrompt: '你是一个冷静又带点青涩的助手，说话简洁但偶尔流露出温柔。请用中文交流，保持角色。'
};
let isGenerating = false;
let currentTypingMessageId = null;
let currentTheme = 'dark';

let characterData = {
  worldBook: '',
  name: '',
  avatar: '',
  cover: '',
  bio: '',
  age: '',
  gender: '',
  appearance: '',
  personality: '',
  backstory: '',
  memories: '',
  style: '',
  examples: ''
};

// ---------- 清除括号及其内容（中英文括号） ----------
function cleanParentheses(text) {
  // 匹配左括号（中/英）到右括号（中/英）之间的任意内容，非贪婪，支持换行
  return text.replace(/[（(][^）)]*?[）)]/g, '').trim();
}

// ---------- 主题管理 ----------
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  currentTheme = theme;
  localStorage.setItem('chat_theme', theme);
  if (themeToggleSettings) themeToggleSettings.classList.toggle('active', theme === 'light');
  if (themeLabelTextSettings) themeLabelTextSettings.textContent = theme === 'light' ? '浅色模式' : '深色模式';
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function loadTheme() {
  const saved = localStorage.getItem('chat_theme') || 'dark';
  applyTheme(saved);
}

// ---------- 配置管理 ----------
function loadConfigFromStorage() {
  try {
    const saved = localStorage.getItem('chat_roleplay_config_v2');
    if (saved) config = { ...config, ...JSON.parse(saved) };
  } catch(e) {}
  apiKeyInput.value = config.apiKey || '';
  apiUrlInput.value = config.apiUrl;
  modelInput.value = config.model;
  characterNameInput.value = config.characterName;
  systemPromptInput.value = config.systemPrompt;
  updateChatTitle();
  updateApiStatusBadge();
  populateSelectsFromConfig();
}

function saveConfigToStorage() {
  try {
    localStorage.setItem('chat_roleplay_config_v2', JSON.stringify(config));
  } catch(e) {}
}

function updateChatTitle() {
  chatTitleDisplay.textContent = config.characterName || '青绿角色';
}

function updateApiStatusBadge() {
  if (config.apiKey && config.apiKey.trim().length > 5) {
    apiStatus.textContent = '已设置密钥';
    apiStatus.style.background = '#0f9960';
  } else {
    apiStatus.textContent = '未设置密钥';
    apiStatus.style.background = 'var(--border-strong)';
  }
}

function syncConfigFromForm() {
  config.apiKey = apiKeyInput.value.trim();
  config.apiUrl = apiUrlInput.value.trim();
  config.model = modelInput.value.trim();
  config.characterName = characterNameInput.value.trim() || '青绿';
  config.systemPrompt = systemPromptInput.value.trim();
}

function applyConfig() {
  syncConfigFromForm();
  saveConfigToStorage();
  updateChatTitle();
  updateApiStatusBadge();
}

// ---------- 消息渲染 ----------
function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDateSeparator(ts) {
  const d = new Date(ts);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

function renderMessages() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneHour = 60 * 60 * 1000;

  let html = '';
  let lastTimestamp = 0;
  let lastDateKey = '';

  messages.forEach((msg, index) => {
    const msgTime = msg.timestamp;
    const msgDateKey = new Date(msgTime).toDateString();

    if (index === 0 || msgDateKey !== lastDateKey) {
      const isToday = (msgTime >= todayStart && msgTime < todayStart + 86400000);
      const label = isToday ? '今天' : formatDateSeparator(msgTime);
      html += `<div class="message-separator"><span>${label}</span></div>`;
    } else if (index > 0 && (msgTime - lastTimestamp > oneHour)) {
      const d = new Date(msgTime);
      const timeLabel = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
      html += `<div class="message-separator"><span>${timeLabel}</span></div>`;
    }

    const safe = escapeHtml(msg.content).replace(/\n/g, '<br>');
    html += `<div class="message-row ${msg.role}"><div class="message-bubble">${safe}<div class="message-time">${formatTime(msgTime)}</div></div></div>`;

    lastTimestamp = msgTime;
    lastDateKey = msgDateKey;
  });

  if (currentTypingMessageId) {
    html += `<div class="message-row assistant" id="${currentTypingMessageId}"><div class="message-bubble typing-indicator"><span></span><span></span><span></span></div></div>`;
  }

  messagesArea.innerHTML = html;
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function addMessage(role, content) {
  messages.push({ role, content, timestamp: Date.now() });
  saveMessagesToStorage();
  renderMessages();
}

function saveMessagesToStorage() {
  try { localStorage.setItem('chat_messages', JSON.stringify(messages)); } catch(e) {}
}
function loadMessagesFromStorage() {
  try {
    const saved = localStorage.getItem('chat_messages');
    if (saved) messages = JSON.parse(saved);
  } catch(e) {}
  if (!messages.length) {
    messages = [{ role: 'assistant', content: '你好！我是青绿色调的角色……', timestamp: Date.now() }];
  }
}

function removeTypingIndicator() {
  if (currentTypingMessageId) {
    const el = document.getElementById(currentTypingMessageId);
    if (el) el.remove();
    currentTypingMessageId = null;
  }
}

function showTypingIndicator() {
  removeTypingIndicator();
  currentTypingMessageId = 'typing-' + Date.now();
  renderMessages();
}

function resetConversation() {
  messages = [{ role: 'assistant', content: '对话已重置。', timestamp: Date.now() }];
  removeTypingIndicator();
  saveMessagesToStorage();
  renderMessages();
}

// ---------- 人物设定管理 ----------
function loadCharacterFromStorage() {
  try {
    const saved = localStorage.getItem('character_data');
    if (saved) characterData = { ...characterData, ...JSON.parse(saved) };
  } catch(e) {}
  worldBookInput.value = characterData.worldBook || '';
  charNameInput.value = characterData.name || '';
  charAgeInput.value = characterData.age || '';
  charGenderInput.value = characterData.gender || '';
  charAppearanceInput.value = characterData.appearance || '';
  charPersonalityInput.value = characterData.personality || '';
  charBackstoryInput.value = characterData.backstory || '';
  charMemoriesInput.value = characterData.memories || '';
  charStyleInput.value = characterData.style || '';
  charExamplesInput.value = characterData.examples || '';
  characterBioInput.value = characterData.bio || '温柔而冷静的陪伴';
  updateCharacterPreview();
}

function saveCharacterToStorage() {
  characterData = {
    worldBook: worldBookInput.value.trim(),
    name: charNameInput.value.trim(),
    age: charAgeInput.value.trim(),
    gender: charGenderInput.value.trim(),
    appearance: charAppearanceInput.value.trim(),
    personality: charPersonalityInput.value.trim(),
    backstory: charBackstoryInput.value.trim(),
    memories: charMemoriesInput.value.trim(),
    style: charStyleInput.value.trim(),
    examples: charExamplesInput.value.trim(),
    avatar: characterData.avatar,
    cover: characterData.cover,
    bio: characterBioInput.value.trim()
  };
  try {
    localStorage.setItem('character_data', JSON.stringify(characterData));
    updateCharacterPreview();
    config.characterName = characterNameInput.value.trim() || '青绿助手';
    updateChatTitle();
    alert('人物设定已保存');
  } catch(e) {
    alert('保存失败，可能是存储空间已满');
  }
}

function updateCharacterPreview() {
  if (characterData.cover) {
    characterPreviewBg.style.backgroundImage = `url(${characterData.cover})`;
  } else {
    characterPreviewBg.style.backgroundImage = '';
  }
  if (characterData.avatar) {
    characterPreviewAvatar.innerHTML = `<img src="${characterData.avatar}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    characterPreviewAvatar.innerHTML = '<i class="fas fa-user-astronaut"></i>';
  }
  const name = characterNameInput.value.trim() || '青绿助手';
  const bio = characterBioInput.value.trim() || '温柔而冷静的陪伴';
  characterPreviewName.textContent = name;
  characterPreviewBio.innerHTML = `<i class="fas fa-quote-left" style="margin-right:6px;"></i>${bio}`;
}

// ---------- API调用 ----------
async function callAI(userMessage) {
  if (!config.apiKey) throw new Error('请先配置 API Key');

  const now = new Date();
  const currentTimeStr = now.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long'
  });

  const systemMsg = {
    role: 'system',
    content: `[世界观]...
[重要：当前真实时间]
现在是 ${currentTimeStr}。请根据这个时间调整你的对话，不要说错时间（如晚上不说早上好，过了午夜请用新的一天逻辑）。请像真人聊天一样，避免使用括号描述动作，直接说话。`
  };

  const history = messages.filter(m => m.role==='user'||m.role==='assistant').slice(-30).map(m => ({ role: m.role, content: m.content }));

  const payload = {
    model: config.model,
    messages: [systemMsg, ...history],
    temperature: 0.8,
  };

  const res = await fetch(config.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let err = `HTTP ${res.status}`;
    try { const d = await res.json(); err = d.error?.message || JSON.stringify(d); } catch(e) {}
    throw new Error(err);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// 核心修改：发送消息后的处理逻辑
async function handleSendMessage() {
  const content = messageInput.value.trim();
  if (!content || isGenerating) return;

  // 用户消息按空行拆分
  const userSegments = content.split(/\n\s*\n/).filter(s => s.trim() !== '');
  if (userSegments.length === 0) return;

  messageInput.value = '';
  messageInput.style.height = 'auto';

  isGenerating = true;
  sendBtn.disabled = true;

  for (let i = 0; i < userSegments.length; i++) {
    const text = userSegments[i].trim();
    if (!text) continue;

    addMessage('user', text);
    showTypingIndicator();

    try {
      const reply = await callAI(text);

      // 1. 清理括号动作描写
      const cleaned = cleanParentheses(reply);

      // 2. 按句子拆分（句号、感叹号、问号作为分割点，保留标点）
      const sentences = cleaned.split(/(?<=[。！？!?])/g)
                               .map(s => s.trim())
                               .filter(s => s.length > 0);

      // 如果拆分后没有句子（例如全是括号被删光了），则以原文作为一条消息
      const finalSentences = sentences.length > 0 ? sentences : [cleaned];

      // 移除总体的 typing indicator，准备逐条发送
      removeTypingIndicator();

      for (const sentence of finalSentences) {
        // 每条句子前显示“正在输入...”
        showTypingIndicator();
        // 根据句子长度计算打字时间（每字 80ms，最少 1.5 秒，最多 8 秒）
        const charCount = sentence.length;
        let typingDelay = Math.min(8000, Math.max(1500, charCount * 80));
        // 加入一些随机波动，更自然
        typingDelay += (Math.random() * 400 - 200);
        await new Promise(resolve => setTimeout(resolve, Math.max(0, typingDelay)));

        removeTypingIndicator();
        addMessage('assistant', sentence);
      }
    } catch(e) {
      removeTypingIndicator();
      addMessage('assistant', `❌ 错误: ${e.message}`);
    }
  }

  isGenerating = false;
  sendBtn.disabled = false;
  messageInput.focus();
}

async function testConnection() {
  syncConfigFromForm();
  if (!config.apiKey) { alert('请填写 API Key'); return; }
  try {
    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{role:'user',content:'ping'}], max_tokens:5 })
    });
    const data = await res.json();
    if (res.ok) alert('✅ 连接成功！');
    else alert('❌ 失败: ' + (data.error?.message || res.status));
  } catch(e) { alert('网络错误: ' + e.message); }
}

// ---------- 抽屉控制 ----------
function openDrawer() { drawer.classList.add('open'); overlay.classList.add('show'); }
function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('show'); }

// ---------- 预设地址 ----------
const apiUrlPresets = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  custom: ''
};
function updateApiUrlFromProvider() {
  const provider = apiProviderSelect.value;
  if (provider !== 'custom') apiUrlInput.value = apiUrlPresets[provider];
}
function updateModelInputFromSelect() {
  const selected = modelSelect.value;
  if (selected !== 'custom') modelInput.value = selected;
}
function populateSelectsFromConfig() {
  const url = config.apiUrl;
  if (url.includes('deepseek.com')) apiProviderSelect.value = 'deepseek';
  else if (url.includes('openrouter.ai')) apiProviderSelect.value = 'openrouter';
  else if (url.includes('groq.com')) apiProviderSelect.value = 'groq';
  else if (url.includes('api.openai.com')) apiProviderSelect.value = 'openai';
  else apiProviderSelect.value = 'custom';
  const model = config.model;
  let found = false;
  for (let opt of modelSelect.options) {
    if (opt.value === model) { modelSelect.value = model; found = true; break; }
  }
  if (!found) modelSelect.value = 'custom';
  apiUrlInput.value = config.apiUrl;
  modelInput.value = config.model;
}

// ---------- 裁剪相关 ----------
let cropper = null;
let currentCropType = 'avatar';
const cropModalOverlay = document.getElementById('cropModalOverlay');
const cropImage = document.getElementById('cropImage');
const closeCropModal = document.getElementById('closeCropModal');
const cancelCropBtn = document.getElementById('cancelCropBtn');
const saveCropBtn = document.getElementById('saveCropBtn');

function openCropModal(file, type) {
  currentCropType = type;
  const reader = new FileReader();
  reader.onload = (e) => {
    cropImage.src = e.target.result;
    cropModalOverlay.style.display = 'flex';
    if (cropper) cropper.destroy();
    cropper = new Cropper(cropImage, {
      aspectRatio: type === 'avatar' ? 1 : 16 / 9,
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
    });
  };
  reader.readAsDataURL(file);
}

function openCropModalForCharacter(file, type) {
  currentCropType = type;
  window._cropTarget = 'character';
  const reader = new FileReader();
  reader.onload = (e) => {
    cropImage.src = e.target.result;
    cropModalOverlay.style.display = 'flex';
    if (cropper) cropper.destroy();
    cropper = new Cropper(cropImage, {
      aspectRatio: type === 'avatar' ? 1 : 16 / 9,
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
    });
  };
  reader.readAsDataURL(file);
}

function closeCropModalFunc() {
  cropModalOverlay.style.display = 'none';
  if (cropper) { cropper.destroy(); cropper = null; }
}

function saveCroppedImage() {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas();
  const dataURL = canvas.toDataURL('image/jpeg', 0.9);

  if (window._cropTarget === 'character') {
    if (currentCropType === 'avatar') {
      characterData.avatar = dataURL;
    } else {
      characterData.cover = dataURL;
    }
    updateCharacterPreview();
  } else {
    if (currentCropType === 'avatar') {
      const avatarContainer = document.getElementById('userAvatarBtn');
      avatarContainer.innerHTML = '';
      const img = document.createElement('img');
      img.src = dataURL;
      img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover';
      avatarContainer.appendChild(img);
      const largeAvatar = document.getElementById('profileAvatarLarge');
      largeAvatar.innerHTML = '';
      const largeImg = document.createElement('img');
      largeImg.src = dataURL;
      largeImg.style.width = '100%'; largeImg.style.height = '100%'; largeImg.style.objectFit = 'cover';
      largeAvatar.appendChild(largeImg);
      try { localStorage.setItem('user_avatar', dataURL); } catch(e) {}
    } else {
      document.documentElement.style.setProperty('--profile-bg-image', `url(${dataURL})`);
      try { localStorage.setItem('user_cover', dataURL); } catch(e) {}
    }
  }
  closeCropModalFunc();
  window._cropTarget = null;
}

function initUploadButtons() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  const editUploadAvatarBtn = document.getElementById('editUploadAvatarBtn');
  const editUploadCoverBtn = document.getElementById('editUploadCoverBtn');
  if (editUploadAvatarBtn) {
    editUploadAvatarBtn.addEventListener('click', () => {
      fileInput.onchange = (e) => { const f = e.target.files[0]; if (f) openCropModal(f, 'avatar'); fileInput.value = ''; };
      fileInput.click();
    });
  }
  if (editUploadCoverBtn) {
    editUploadCoverBtn.addEventListener('click', () => {
      fileInput.onchange = (e) => { const f = e.target.files[0]; if (f) openCropModal(f, 'cover'); fileInput.value = ''; };
      fileInput.click();
    });
  }
  closeCropModal.addEventListener('click', closeCropModalFunc);
  cancelCropBtn.addEventListener('click', closeCropModalFunc);
  saveCropBtn.addEventListener('click', saveCroppedImage);
  cropModalOverlay.addEventListener('click', (e) => { if (e.target === cropModalOverlay) closeCropModalFunc(); });
}

function loadUserImages() {
  try {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      const avatarContainer = document.getElementById('userAvatarBtn');
      avatarContainer.innerHTML = '';
      const img = document.createElement('img');
      img.src = savedAvatar;
      img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover';
      avatarContainer.appendChild(img);
      const largeAvatar = document.getElementById('profileAvatarLarge');
      largeAvatar.innerHTML = '';
      const largeImg = document.createElement('img');
      largeImg.src = savedAvatar;
      largeImg.style.width = '100%'; largeImg.style.height = '100%'; largeImg.style.objectFit = 'cover';
      largeAvatar.appendChild(largeImg);
    }
    const savedCover = localStorage.getItem('user_cover');
    if (savedCover) document.documentElement.style.setProperty('--profile-bg-image', `url(${savedCover})`);
  } catch(e) {}
}

function loadProfile() {
  try {
    const savedName = localStorage.getItem('profile_name') || '用户';
    const savedBio = localStorage.getItem('profile_bio') || '在一隅，遇见自己。';
    profileDisplayName.textContent = savedName;
    profileBioDisplay.innerHTML = `<i class="fas fa-quote-left" style="margin-right: 8px;"></i>${savedBio}`;
    editProfileNameInput.value = savedName;
    editProfileBioInput.value = savedBio;
  } catch(e) {}
}

// ---------- 视图切换逻辑 ----------
function setActiveView(view) {
  chatMain.classList.remove('chat-hidden', 'profile-hidden', 'character-hidden', 'data-hidden');
  document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
  userAvatarBtn.classList.remove('active');
  if (view === 'chat') {
    chatIcon.classList.add('active');
  } else if (view === 'settings') {
    chatMain.classList.add('chat-hidden');
    gearIcon.classList.add('active');
  } else if (view === 'profile') {
    chatMain.classList.add('profile-hidden');
    userAvatarBtn.classList.add('active');
  } else if (view === 'character') {
    chatMain.classList.add('character-hidden');
    characterIcon.classList.add('active');
  } else if (view === 'data') {
    chatMain.classList.add('data-hidden');
    dataManagerIcon.classList.add('active');
    refreshStorageStats();
  }
}

// ---------- 数据管理功能 ----------
function getByteSize(str) {
  return new Blob([str]).size;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function refreshStorageStats() {
  try {
    const items = [];
    let totalBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const bytes = getByteSize(key) + getByteSize(value);
      totalBytes += bytes;

      let displayName = key;
      if (key.startsWith('chat_roleplay_config')) displayName = 'API 配置';
      else if (key === 'character_data') displayName = '人物设定';
      else if (key === 'chat_theme') displayName = '主题设置';
      else if (key === 'profile_name' || key === 'profile_bio') displayName = '个人资料';
      else if (key === 'user_avatar' || key === 'user_cover') displayName = '图片数据';
      else if (key === 'messages') displayName = '聊天记录';
      else displayName = key;

      items.push({ key, displayName, bytes });
    }

    const merged = {};
    items.forEach(item => {
      if (!merged[item.displayName]) {
        merged[item.displayName] = { displayName: item.displayName, bytes: 0, count: 0 };
      }
      merged[item.displayName].bytes += item.bytes;
      merged[item.displayName].count += 1;
    });

    const mergedList = Object.values(merged).sort((a, b) => b.bytes - a.bytes);

    document.getElementById('totalStorageSize').textContent = formatSize(totalBytes);
    document.getElementById('totalStorageItems').textContent = localStorage.length;

    const tbody = document.getElementById('storageDetailsTable');
    tbody.innerHTML = '';
    mergedList.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-light)';
      tr.innerHTML = `
        <td style="padding: 10px 0;">${item.displayName} ${item.count > 1 ? `(${item.count}项)` : ''}</td>
        <td style="text-align: right; padding: 10px 0;">${formatSize(item.bytes)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {
    console.warn('刷新存储统计失败:', e);
  }
}

function exportAllData() {
  const exportObj = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    exportObj[key] = localStorage.getItem(key);
  }
  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `acorner_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== 'object' || data === null) throw new Error('无效的数据格式');
      if (!confirm('导入将覆盖当前所有数据，确定继续吗？')) return;
      localStorage.clear();
      Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value));
      alert('导入成功！页面将刷新以应用新数据。');
      location.reload();
    } catch (err) {
      alert('导入失败：' + err.message);
    }
  };
  reader.readAsText(file);
}

// ---------- 初始化 ----------
function init() {
  loadTheme();
  loadConfigFromStorage();
  loadCharacterFromStorage();
  loadProfile();
  loadUserImages();
  loadMessagesFromStorage();
  renderMessages();

  if (themeToggleSettings) themeToggleSettings.addEventListener('click', toggleTheme);
  sendBtn.addEventListener('click', handleSendMessage);
  messageInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } });
  messageInput.addEventListener('input', function(){ this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; });
  configBtn.addEventListener('click', openDrawer);
  closeDrawerBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  saveConfigBtn.addEventListener('click', ()=>{ applyConfig(); closeDrawer(); });
  testConnectionBtn.addEventListener('click', testConnection);
  clearChatBtn.addEventListener('click', ()=>{ if(confirm('清空对话？')) resetConversation(); });
  apiProviderSelect.addEventListener('change', updateApiUrlFromProvider);
  modelSelect.addEventListener('change', updateModelInputFromSelect);

  chatIcon.addEventListener('click', () => setActiveView('chat'));
  gearIcon.addEventListener('click', () => setActiveView('settings'));
  userAvatarBtn.addEventListener('click', () => setActiveView('profile'));
  characterIcon.addEventListener('click', () => setActiveView('character'));
  dataManagerIcon.addEventListener('click', () => setActiveView('data'));

  saveCharacterBtn.addEventListener('click', saveCharacterToStorage);
  resetCharacterBtn.addEventListener('click', () => {
    if (confirm('重置所有人物设定？')) {
      try { localStorage.removeItem('character_data'); } catch(e) {}
      characterData = {
        worldBook: '', name: '', avatar: '', cover: '', bio: '',
        age: '', gender: '', appearance: '', personality: '',
        backstory: '', memories: '', style: '', examples: ''
      };
      loadCharacterFromStorage();
    }
  });

  editCharacterAvatarBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) openCropModalForCharacter(file, 'avatar');
    };
    fileInput.click();
  });

  editCharacterCoverBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) openCropModalForCharacter(file, 'cover');
    };
    fileInput.click();
  });

  characterNameInput.addEventListener('input', updateCharacterPreview);
  characterBioInput.addEventListener('input', updateCharacterPreview);

  const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModalOverlay = document.getElementById('editProfileModalOverlay');
  const closeEditProfileModal = document.getElementById('closeEditProfileModal');
  const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
  const saveEditProfileBtn = document.getElementById('saveEditProfileBtn');

  function closeEditModal() { editProfileModalOverlay.style.display = 'none'; }
  editProfileBtn.addEventListener('click', () => { editProfileModalOverlay.style.display = 'flex'; });
  closeEditProfileModal.addEventListener('click', closeEditModal);
  cancelEditProfileBtn.addEventListener('click', closeEditModal);
  editProfileModalOverlay.addEventListener('click', (e) => { if (e.target === editProfileModalOverlay) closeEditModal(); });
  saveEditProfileBtn.addEventListener('click', () => {
    const name = editProfileNameInput.value.trim() || '用户';
    const bio = editProfileBioInput.value.trim() || '在一隅，遇见自己。';
    try {
      localStorage.setItem('profile_name', name);
      localStorage.setItem('profile_bio', bio);
    } catch(e) {}
    profileDisplayName.textContent = name;
    profileBioDisplay.innerHTML = `<i class="fas fa-quote-left" style="margin-right: 8px;"></i>${bio}`;
    closeEditModal();
  });

  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importFileInput = document.getElementById('importFileInput');

  if (exportDataBtn) exportDataBtn.addEventListener('click', exportAllData);
  if (importDataBtn) importDataBtn.addEventListener('click', () => importFileInput.click());
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) { importDataFromFile(file); importFileInput.value = ''; }
    });
  }

  setTimeout(() => {
    if (typeof refreshStorageStats === 'function') refreshStorageStats();
  }, 100);

  initUploadButtons();
  updateCharacterPreview();
}

init();
})();