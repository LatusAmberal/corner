// js/script.js
(function(){
  "use strict";

  // ---------- 消息渲染增强：已读/未读标签样式（通过JS注入） ----------
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
      // 迁移旧消息，添加 readStatus
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

  // ---------- 聊天偏好加载与保存 ----------
  function loadChatPreferences() {
    try {
      const saved = localStorage.getItem('chat_preferences');
      if (saved) chatPreferences = { ...chatPreferences, ...JSON.parse(saved) };
    } catch(e) {}
    // 更新 UI
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
    try {
      localStorage.setItem('chat_preferences', JSON.stringify(chatPreferences));
    } catch(e) {}
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
    // 插入到清空按钮之前（第一个子元素是清空按钮的父级？）
    const clearBtnContainer = document.querySelector('.drawer-content > div:first-child');
    if (clearBtnContainer) {
      clearBtnContainer.before(prefSection);
    } else {
      drawerContent.prepend(prefSection);
    }

    // 绑定事件
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

    // 初始化开关状态
    loadChatPreferences();
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

      // 用户消息添加已读状态标签
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

  // 更新某条消息的已读状态
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
    // ... (保持不变，省略重复)
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
      content: `[世界观]...
[重要：当前真实时间]
现在是 ${currentTimeStr}。请根据这个时间调整你的对话，不要说错时间。请像真人聊天一样，避免使用括号描述动作，直接说话。`
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

  // 判断是否应该触发“长时间未读”
  function shouldTriggerLongUnread() {
    if (!chatPreferences.enableLongUnread) return false;
    if (Math.random() * 100 > chatPreferences.longUnreadProbability) return false;

    const aiLastMsg = getLastAssistantContent();
    // 简单关键词检查
    return /稍等|没空|晚点|等等|等一下|忙|暂时不|回头|待会/.test(aiLastMsg);
  }

  // 判断是否应该“已读不回”
  function shouldTriggerReadIgnore() {
    if (!chatPreferences.enableReadIgnore) return false;
    const lastUser = getLastUserContent();
    // 互道晚安场景提高概率
    const isGoodnight = /晚安/.test(lastUser);
    const baseProb = chatPreferences.readIgnoreProbability;
    const adjustedProb = isGoodnight ? Math.min(100, baseProb * 3) : baseProb; // 晚安时概率翻三倍
    return Math.random() * 100 < adjustedProb;
  }

  // 处理待未读消息（用户连续发送时，将上一条未读强制标记为已读）
  function resolvePendingUnreads() {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user' && messages[i].readStatus === 'unread') {
        updateMessageReadStatus(i, 'read');
      } else {
        break; // 只处理最后的连续未读用户消息
      }
    }
  }

  // 核心发送逻辑改写
  async function handleSendMessage() {
    const content = messageInput.value.trim();
    if (!content || isGenerating) return;

    // 拆分用户输入（按空行）
    const userSegments = content.split(/\n\s*\n/).filter(s => s.trim() !== '');
    if (userSegments.length === 0) return;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    isGenerating = true;
    sendBtn.disabled = true;

    // 先解决之前的未读消息（长时间未读导致未处理的消息）
    resolvePendingUnreads();

    for (let segIdx = 0; segIdx < userSegments.length; segIdx++) {
      const text = userSegments[segIdx].trim();
      if (!text) continue;

      // 添加用户消息（默认为未读）
      const userMsg = addMessage('user', text);
      const msgIndex = messages.length - 1; // 刚添加的索引

      // 未读到已读的延迟处理
      let markReadTimer = null;
      const clearReadTimer = () => {
        if (markReadTimer) { clearTimeout(markReadTimer); markReadTimer = null; }
      };

      // 判断长时间未读
      const longUnread = shouldTriggerLongUnread();
      if (longUnread) {
        // 长时间未读：不标记已读，显示输入状态但实际不回复
        showTypingIndicator();
        // 模拟一个较长的“对方正在输入…”然后消失，但并不发送任何消息
        setTimeout(() => {
          removeTypingIndicator();
          // 保持未读状态
        }, 3000 + Math.random() * 2000);
        // 直接跳过后续处理
        continue;
      }

      // 正常延迟后标记已读（默认2-3秒）
      const readDelay = 2000 + Math.random() * 1500;
      markReadTimer = setTimeout(() => {
        updateMessageReadStatus(msgIndex, 'read');
        // 标记已读后，进入回复判断逻辑
        handleAfterRead(msgIndex);
      }, readDelay);
    }

    isGenerating = false;
    sendBtn.disabled = false;
    messageInput.focus();

    // 已读后处理（异步）
    async function handleAfterRead(userMsgIdx) {
      // 如果界面中该消息已经不存在（被清空），取消
      if (!messages[userMsgIdx]) return;

      // 已读不回判断
      if (shouldTriggerReadIgnore()) {
        // 直接放弃回复，无任何输入提示
        return;
      }

      // 正常回复流程
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

  // 测试连接函数不变
  async function testConnection() {
    // ... (保持不变)
  }

  // ---------- 抽屉控制 ----------
  function openDrawer() { drawer.classList.add('open'); overlay.classList.add('show'); }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('show'); }

  // ---------- 预设地址（省略，保持原样） ----------
  // ... (apiUrlPresets 等其余函数不变)

  // ---------- 初始化 ----------
  function init() {
    loadTheme();
    loadConfigFromStorage();
    loadCharacterFromStorage();
    loadProfile();
    loadUserImages();
    loadMessagesFromStorage();
    renderMessages();
    buildChatPreferencesUI(); // 动态创建聊天偏好 UI

    // 事件绑定（省略，保持原样）
    // 在原有绑定上确保新增的聊天偏好元素能被绑定（已通过 buildChatPreferencesUI 处理）

    // 其他初始化事件...
    // (注意：需要保留原 init 中的事件绑定，这里省略重复)
  }

  // 执行 init
  init();
})();
