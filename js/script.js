// js/script.js
(function(){
  "use strict";

  // ---------- 注入额外样式（用于已读状态和滑动条） ----------
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .read-status {
      font-size: 10px;
      margin-top: 4px;
      text-align: right;
      line-height: 1;
    }
    .read-status.unread { color: #9ab3c0; }
    .read-status.read { color: #0f9960; }
    .apple-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      background: var(--toggle-bg);
      border-radius: 2px;
      outline: none;
      margin: 8px 0;
    }
    .apple-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: var(--accent);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .chat-prefs-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 8px 0;
    }
    .chat-prefs-row label {
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .probability-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
    }
    .probability-bar input[type=range] { flex: 1; }
    .probability-bar span { min-width: 40px; text-align: right; }
  `;
  document.head.appendChild(styleSheet);

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
  let messages = (() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(m => m.role === 'user' ? { ...m, readStatus: m.readStatus || 'read' } : m);
    }
    return [{ role: 'assistant', content: '你好！我是青绿色调的角色。点击右上角「···」配置 API 或切换白天/黑夜模式。', timestamp: Date.now() }];
  })();

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

  // 聊天偏好状态
  let chatPreferences = {
    enableReadIgnore: false,
    readIgnoreProbability: 5,
    enableLongUnread: false,
    longUnreadProbability: 5
  };

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

  // ---------- 清除括号及其内容 ----------
  function cleanParentheses(text) {
    return text.replace(/[（(][^）)]*?[）)]/g, '').trim();
  }

  // ---------- 主题管理 ----------
  function applyTheme(theme) {
    if (theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
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

  // ---------- 聊天偏好 ----------
  function loadChatPreferences() {
    try {
      const saved = localStorage.getItem('chat_preferences');
      if (saved) chatPreferences = { ...chatPreferences, ...JSON.parse(saved) };
    } catch(e) {}
    const readIgnoreToggle = document.getElementById('readIgnoreToggle');
    const longUnreadToggle = document.getElementById('longUnreadToggle');
    const readIgnoreProbSlider = document.getElementById('readIgnoreProbSlider');
    const longUnreadProbSlider = document.getElementById('longUnreadProbSlider');
    const readIgnoreProbVal = document.getElementById('readIgnoreProbVal');
    const longUnreadProbVal = document.getElementById('longUnreadProbVal');
    if (readIgnoreToggle) readIgnoreToggle.classList.toggle('active', chatPreferences.enableReadIgnore);
    if (longUnreadToggle) longUnreadToggle.classList.toggle('active', chatPreferences.enableLongUnread);
    if (readIgnoreProbSlider) readIgnoreProbSlider.value = chatPreferences.readIgnoreProbability;
    if (longUnreadProbSlider) longUnreadProbSlider.value = chatPreferences.longUnreadProbability;
    if (readIgnoreProbVal) readIgnoreProbVal.textContent = chatPreferences.readIgnoreProbability + '%';
    if (longUnreadProbVal) longUnreadProbVal.textContent = chatPreferences.longUnreadProbability + '%';
  }

  function saveChatPreferences() {
    try { localStorage.setItem('chat_preferences', JSON.stringify(chatPreferences)); } catch(e) {}
  }

  function buildChatPreferencesUI() {
    const drawerContent = document.querySelector('.drawer-content');
    if (!drawerContent) return;

    const prefSection = document.createElement('div');
    prefSection.innerHTML = `
      <div style="margin-top: 20px; border-top: 1px solid var(--border-light); padding-top: 20px;">
        <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-sliders-h"></i> 聊天偏好
        </h4>

        <div class="chat-prefs-row">
          <label><i class="fas fa-eye-slash"></i> 已读不回</label>
          <div class="apple-toggle" id="readIgnoreToggle"></div>
        </div>
        <div class="probability-bar">
          <label style="font-size: 12px; color: var(--text-secondary);">触发概率</label>
          <input type="range" min="0" max="100" value="${chatPreferences.readIgnoreProbability}" class="apple-slider" id="readIgnoreProbSlider">
          <span id="readIgnoreProbVal" style="font-size:12px;">${chatPreferences.readIgnoreProbability}%</span>
        </div>

        <div class="chat-prefs-row" style="margin-top: 16px;">
          <label><i class="fas fa-clock"></i> 长时间未读</label>
          <div class="apple-toggle" id="longUnreadToggle"></div>
        </div>
        <div class="probability-bar">
          <label style="font-size: 12px; color: var(--text-secondary);">触发概率</label>
          <input type="range" min="0" max="100" value="${chatPreferences.longUnreadProbability}" class="apple-slider" id="longUnreadProbSlider">
          <span id="longUnreadProbVal" style="font-size:12px;">${chatPreferences.longUnreadProbability}%</span>
        </div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 8px;">
          已读不回：已读后 AI 可能不回复（晚安等类似场景更易触发）。<br>
          长时间未读：AI 可能在说出“稍等”等理由后暂时不读你的消息。
        </div>
      </div>
    `;
    const clearBtnContainer = document.querySelector('.drawer-content > div:first-child');
    if (clearBtnContainer) {
      clearBtnContainer.before(prefSection);
    } else {
      drawerContent.prepend(prefSection);
    }

    const readIgnoreToggle = document.getElementById('readIgnoreToggle');
    const longUnreadToggle = document.getElementById('longUnreadToggle');
    const readIgnoreProbSlider = document.getElementById('readIgnoreProbSlider');
    const longUnreadProbSlider = document.getElementById('longUnreadProbSlider');
    const readIgnoreProbVal = document.getElementById('readIgnoreProbVal');
    const longUnreadProbVal = document.getElementById('longUnreadProbVal');

    readIgnoreToggle?.addEventListener('click', () => {
      chatPreferences.enableReadIgnore = !chatPreferences.enableReadIgnore;
      readIgnoreToggle.classList.toggle('active', chatPreferences.enableReadIgnore);
      saveChatPreferences();
    });
    longUnreadToggle?.addEventListener('click', () => {
      chatPreferences.enableLongUnread = !chatPreferences.enableLongUnread;
      longUnreadToggle.classList.toggle('active', chatPreferences.enableLongUnread);
      saveChatPreferences();
    });
    readIgnoreProbSlider?.addEventListener('input', (e) => {
      chatPreferences.readIgnoreProbability = parseInt(e.target.value);
      readIgnoreProbVal.textContent = chatPreferences.readIgnoreProbability + '%';
      saveChatPreferences();
    });
    longUnreadProbSlider?.addEventListener('input', (e) => {
      chatPreferences.longUnreadProbability = parseInt(e.target.value);
      longUnreadProbVal.textContent = chatPreferences.longUnreadProbability + '%';
      saveChatPreferences();
    });

    loadChatPreferences();
  }

  // ---------- 配置管理 ----------
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
      if (opt.value === model) {
        modelSelect.value = model;
        found = true;
        break;
      }
    }
    if (!found) modelSelect.value = 'custom';

    apiUrlInput.value = config.apiUrl;
    modelInput.value = config.model;
  }

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
    try { localStorage.setItem('chat_roleplay_config_v2', JSON.stringify(config)); } catch(e) {}
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
      let bubble = `<div class="message-bubble">${safe}<div class="message-time">${formatTime(msgTime)}</div>`;

      if (msg.role === 'user' && msg.readStatus) {
        const readClass = msg.readStatus === 'read' ? 'read' : 'unread';
        bubble += `<div class="read-status ${readClass}">${msg.readStatus === 'read' ? '已读' : '未读'}</div>`;
      }
      bubble += `</div>`;

      html += `<div class="message-row ${msg.role}">${bubble}</div>`;

      lastTimestamp = msgTime;
      lastDateKey = msgDateKey;
    });

    if (currentTypingMessageId) {
      html += `<div class="message-row assistant" id="${currentTypingMessageId}"><div class="message-bubble typing-indicator"><span></span><span></span><span></span></div></div>`;
    }

    messagesArea.innerHTML = html;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function addMessage(role, content, options = {}) {
    const msg = { role, content, timestamp: Date.now(), ...options };
    if (role === 'user' && !msg.readStatus) msg.readStatus = 'unread';
    messages.push(msg);
    saveMessagesToStorage();
    renderMessages();
    return msg;
  }

  function updateMessageReadStatus(msgIndex, status) {
    if (messages[msgIndex] && messages[msgIndex].role === 'user') {
      messages[msgIndex].readStatus = status;
      saveMessagesToStorage();
      renderMessages();
    }
  }

  function saveMessagesToStorage() {
    try { localStorage.setItem('chat_messages', JSON.stringify(messages)); } catch(e) {}
  }

  function loadMessagesFromStorage() {
    // 已经在一开始加载了，但为了兼容保留函数
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      messages = parsed.map(m => m.role === 'user' ? { ...m, readStatus: m.readStatus || 'read' } : m);
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
    if (characterPreviewBg) {
      if (characterData.cover) {
        characterPreviewBg.style.backgroundImage = `url(${characterData.cover})`;
      } else {
        characterPreviewBg.style.backgroundImage = '';
      }
    }
    if (characterPreviewAvatar) {
      if (characterData.avatar) {
        characterPreviewAvatar.innerHTML = `<img src="${characterData.avatar}" style="width:100%;height:100%;object-fit:cover;">`;
      } else {
        characterPreviewAvatar.innerHTML = '<i class="fas fa-user-astronaut"></i>';
      }
    }
    const name = characterNameInput.value.trim() || '青绿助手';
    const bio = characterBioInput.value.trim() || '温柔而冷静的陪伴';
    if (characterPreviewName) characterPreviewName.textContent = name;
    if (characterPreviewBio) characterPreviewBio.innerHTML = `<i class="fas fa-quote-left" style="margin-right:6px;"></i>${bio}`;
  }

  // ---------- AI 调用 ----------
  async function callAI(userMessage) {
    if (!config.apiKey) throw new Error('请先配置 API Key');

    const now = new Date();
    const currentTimeStr = now.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      weekday: 'long'
    });

    const systemMsg = {
      role: 'system',
      content: `[世界观]...\n[重要：当前真实时间]\n现在是 ${currentTimeStr}。请根据这个时间调整你的对话，不要说错时间。请像真人聊天一样，避免使用括号描述动作，直接说话。`
    };

    const history = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-30)
      .map(m => ({ role: m.role, content: m.content }));

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

  // ---------- 聊天偏好辅助函数 ----------
  function getLastAssistantContent() {
    const reversed = [...messages].reverse();
    const lastAsst = reversed.find(m => m.role === 'assistant');
    return lastAsst ? lastAsst.content : '';
  }

  function getLastUserContent() {
    const reversed = [...messages].reverse();
    const lastUser = reversed.find(m => m.role === 'user');
    return lastUser ? lastUser.content : '';
  }

  function shouldTriggerLongUnread() {
    if (!chatPreferences.enableLongUnread) return false;
    if (Math.random() * 100 > chatPreferences.longUnreadProbability) return false;

    const aiLastMsg = getLastAssistantContent();
    return /稍等|没空|晚点|等等|等一下|忙|暂时不|回头|待会/.test(aiLastMsg);
  }

  function shouldTriggerReadIgnore() {
    if (!chatPreferences.enableReadIgnore) return false;
    const lastUser = getLastUserContent();
    const isGoodnight = /晚安/.test(lastUser);
    const baseProb = chatPreferences.readIgnoreProbability;
    const adjustedProb = isGoodnight ? Math.min(100, baseProb * 3) : baseProb;
    return Math.random() * 100 < adjustedProb;
  }

  function resolvePendingUnreads() {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user' && messages[i].readStatus === 'unread') {
        updateMessageReadStatus(i, 'read');
      } else {
        break;
      }
    }
  }

  // ---------- 发送消息 ----------
  async function handleSendMessage() {
    const content = messageInput.value.trim();
    if (!content || isGenerating) return;

    const userSegments = content.split(/\n\s*\n/).filter(s => s.trim() !== '');
    if (userSegments.length === 0) return;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    isGenerating = true;
    sendBtn.disabled = true;

    resolvePendingUnreads();

    for (let segIdx = 0; segIdx < userSegments.length; segIdx++) {
      const text = userSegments[segIdx].trim();
      if (!text) continue;

      const userMsg = addMessage('user', text);
      const msgIndex = messages.length - 1;

      if (shouldTriggerLongUnread()) {
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
        }, 3000 + Math.random() * 2000);
        continue;
      }

      const readDelay = 2000 + Math.random() * 1500;
      setTimeout(() => {
        if (!messages[msgIndex]) return;
        updateMessageReadStatus(msgIndex, 'read');
        handleAfterRead(msgIndex);
      }, readDelay);
    }

    isGenerating = false;
    sendBtn.disabled = false;
    messageInput.focus();

    async function handleAfterRead(userMsgIdx) {
      if (!messages[userMsgIdx]) return;
      if (shouldTriggerReadIgnore()) return;

      try {
        showTypingIndicator();
        const userContent = messages[userMsgIdx].content;
        const reply = await callAI(userContent);
        const cleaned = cleanParentheses(reply);
        const sentences = cleaned.split(/(?<=[。！？!?])/g)
                                 .map(s => s.trim())
                                 .filter(s => s.length > 0);
        const finalSentences = sentences.length > 0 ? sentences : [cleaned];

        removeTypingIndicator();
        for (const sentence of finalSentences) {
          showTypingIndicator();
          const charCount = sentence.length;
          let typingDelay = Math.min(8000, Math.max(1500, charCount * 80));
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
  }

  // ---------- 测试连接 ----------
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

  // ---------- 抽屉 ----------
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

  // ---------- 裁剪 ----------
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
        aspectRatio: type === 'avatar' ? 1 : 16/9,
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
        aspectRatio: type === 'avatar' ? 1 : 16/9,
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
      if (currentCropType === 'avatar') characterData.avatar = dataURL;
      else characterData.cover = dataURL;
      updateCharacterPreview();
    } else {
      if (currentCropType === 'avatar') {
        document.getElementById('userAvatarBtn').innerHTML = `<img src="${dataURL}" style="width:100%;height:100%;object-fit:cover;">`;
        document.getElementById('profileAvatarLarge').innerHTML = `<img src="${dataURL}" style="width:100%;height:100%;object-fit:cover;">`;
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
    document.getElementById('editUploadAvatarBtn')?.addEventListener('click', () => {
      fileInput.onchange = (e) => { const f = e.target.files[0]; if (f) openCropModal(f, 'avatar'); fileInput.value = ''; };
      fileInput.click();
    });
    document.getElementById('editUploadCoverBtn')?.addEventListener('click', () => {
      fileInput.onchange = (e) => { const f = e.target.files[0]; if (f) openCropModal(f, 'cover'); fileInput.value = ''; };
      fileInput.click();
    });
    closeCropModal?.addEventListener('click', closeCropModalFunc);
    cancelCropBtn?.addEventListener('click', closeCropModalFunc);
    saveCropBtn?.addEventListener('click', saveCroppedImage);
    cropModalOverlay?.addEventListener('click', (e) => { if (e.target === cropModalOverlay) closeCropModalFunc(); });
  }

  function loadUserImages() {
    try {
      const savedAvatar = localStorage.getItem('user_avatar');
      if (savedAvatar) {
        document.getElementById('userAvatarBtn').innerHTML = `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;">`;
        document.getElementById('profileAvatarLarge').innerHTML = `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;">`;
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

  // ---------- 视图切换 ----------
  function setActiveView(view) {
    chatMain.classList.remove('chat-hidden', 'profile-hidden', 'character-hidden', 'data-hidden');
    document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
    userAvatarBtn.classList.remove('active');
    if (view === 'chat') chatIcon.classList.add('active');
    else if (view === 'settings') { chatMain.classList.add('chat-hidden'); gearIcon.classList.add('active'); }
    else if (view === 'profile') { chatMain.classList.add('profile-hidden'); userAvatarBtn.classList.add('active'); }
    else if (view === 'character') { chatMain.classList.add('character-hidden'); characterIcon.classList.add('active'); }
    else if (view === 'data') {
      chatMain.classList.add('data-hidden');
      dataManagerIcon.classList.add('active');
      refreshStorageStats();
    }
  }

  // ---------- 数据管理 ----------
  function getByteSize(str) { return new Blob([str]).size; }
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(2) + ' KB';
    return (bytes/(1024*1024)).toFixed(2) + ' MB';
  }
  function refreshStorageStats() {
    try {
      let totalBytes = 0;
      const items = [];
      for (let i=0; i<localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        const bytes = getByteSize(key)+getByteSize(val);
        totalBytes += bytes;
        let displayName = key;
        if (key.startsWith('chat_roleplay_config')) displayName='API配置';
        else if (key==='character_data') displayName='人物设定';
        else if (key==='chat_theme') displayName='主题设置';
        else if (key==='profile_name'||key==='profile_bio') displayName='个人资料';
        else if (key==='user_avatar'||key==='user_cover') displayName='图片数据';
        else if (key==='chat_messages') displayName='聊天记录';
        items.push({key,displayName,bytes});
      }
      const merged = {};
      items.forEach(item => {
        if (!merged[item.displayName]) merged[item.displayName] = {displayName:item.displayName, bytes:0, count:0};
        merged[item.displayName].bytes += item.bytes;
        merged[item.displayName].count++;
      });
      const list = Object.values(merged).sort((a,b)=>b.bytes-a.bytes);
      const totalEl = document.getElementById('totalStorageSize');
      const itemsEl = document.getElementById('totalStorageItems');
      const tbody = document.getElementById('storageDetailsTable');
      if (totalEl) totalEl.textContent = formatSize(totalBytes);
      if (itemsEl) itemsEl.textContent = localStorage.length;
      if (tbody) {
        tbody.innerHTML = '';
        list.forEach(item => {
          const tr = document.createElement('tr');
          tr.style.borderBottom='1px solid var(--border-light)';
          tr.innerHTML = `<td style="padding:10px 0;">${item.displayName} ${item.count>1?'('+item.count+'项)':''}</td><td style="text-align:right;padding:10px 0;">${formatSize(item.bytes)}</td>`;
          tbody.appendChild(tr);
        });
      }
    } catch(e) {}
  }

  function exportAllData() {
    const obj = {};
    for (let i=0; i<localStorage.length; i++) obj[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
    const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `acorner_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  }

  function importDataFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!confirm('导入将覆盖当前所有数据，确定继续吗？')) return;
        localStorage.clear();
        Object.entries(data).forEach(([k,v])=>localStorage.setItem(k,v));
        alert('导入成功，页面将刷新。');
        location.reload();
      } catch(err) { alert('导入失败：'+err.message); }
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
    renderMessages();
    buildChatPreferencesUI();

    if (themeToggleSettings) themeToggleSettings.addEventListener('click', toggleTheme);
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); handleSendMessage(); } });
    messageInput.addEventListener('input', ()=>{ messageInput.style.height='auto'; messageInput.style.height=Math.min(messageInput.scrollHeight,120)+'px'; });
    configBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    saveConfigBtn.addEventListener('click', ()=>{ applyConfig(); closeDrawer(); });
    testConnectionBtn.addEventListener('click', testConnection);
    clearChatBtn.addEventListener('click', ()=>{ if(confirm('清空对话？')) resetConversation(); });
    apiProviderSelect.addEventListener('change', updateApiUrlFromProvider);
    modelSelect.addEventListener('change', updateModelInputFromSelect);

    chatIcon.addEventListener('click', ()=>setActiveView('chat'));
    gearIcon.addEventListener('click', ()=>setActiveView('settings'));
    userAvatarBtn.addEventListener('click', ()=>setActiveView('profile'));
    characterIcon.addEventListener('click', ()=>setActiveView('character'));
    dataManagerIcon.addEventListener('click', ()=>setActiveView('data'));

    saveCharacterBtn.addEventListener('click', saveCharacterToStorage);
    resetCharacterBtn.addEventListener('click', ()=>{
      if(confirm('重置所有人物设定？')) {
        localStorage.removeItem('character_data');
        characterData = { worldBook:'',name:'',avatar:'',cover:'',bio:'',age:'',gender:'',appearance:'',personality:'',backstory:'',memories:'',style:'',examples:'' };
        loadCharacterFromStorage();
      }
    });

    editCharacterAvatarBtn.addEventListener('click', ()=>{
      const inp = document.createElement('input');
      inp.type='file'; inp.accept='image/*';
      inp.onchange = e => { const f=e.target.files[0]; if(f) openCropModalForCharacter(f,'avatar'); };
      inp.click();
    });
    editCharacterCoverBtn.addEventListener('click', ()=>{
      const inp = document.createElement('input');
      inp.type='file'; inp.accept='image/*';
      inp.onchange = e => { const f=e.target.files[0]; if(f) openCropModalForCharacter(f,'cover'); };
      inp.click();
    });

    characterNameInput.addEventListener('input', updateCharacterPreview);
    characterBioInput.addEventListener('input', updateCharacterPreview);

    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModalOverlay = document.getElementById('editProfileModalOverlay');
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');
    const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
    const saveEditProfileBtn = document.getElementById('saveEditProfileBtn');

    const closeEditModal = () => { editProfileModalOverlay.style.display='none'; };
    editProfileBtn?.addEventListener('click', ()=> editProfileModalOverlay.style.display='flex');
    closeEditProfileModal?.addEventListener('click', closeEditModal);
    cancelEditProfileBtn?.addEventListener('click', closeEditModal);
    editProfileModalOverlay?.addEventListener('click', e => { if(e.target===editProfileModalOverlay) closeEditModal(); });
    saveEditProfileBtn?.addEventListener('click', ()=>{
      const name = editProfileNameInput.value.trim()||'用户';
      const bio = editProfileBioInput.value.trim()||'在一隅，遇见自己。';
      localStorage.setItem('profile_name', name);
      localStorage.setItem('profile_bio', bio);
      profileDisplayName.textContent = name;
      profileBioDisplay.innerHTML = `<i class="fas fa-quote-left" style="margin-right:8px;"></i>${bio}`;
      closeEditModal();
    });

    document.getElementById('exportDataBtn')?.addEventListener('click', exportAllData);
    const importFileInput = document.getElementById('importFileInput');
    document.getElementById('importDataBtn')?.addEventListener('click', ()=> importFileInput.click());
    importFileInput?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) { importDataFromFile(file); importFileInput.value=''; }
    });

    setTimeout(refreshStorageStats, 100);
    initUploadButtons();
    updateCharacterPreview();
  }

  init();
})();
