// js/script.js
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
    prefSection.className = 'chat-prefs-section';
    prefSection.innerHTML = `
      <h4 class="chat-prefs-header">
        <i class="fas fa-sliders-h"></i> 聊天偏好
      </h4>

      <div class="chat-prefs-row">
        <label><i class="fas fa-eye-slash"></i> 已读不回</label>
        <div class="apple-toggle" id="readIgnoreToggle"></div>
      </div>
      <div class="probability-bar">
        <label class="probability-label">触发概率</label>
        <input type="range" min="0" max="100" value="${chatPreferences.readIgnoreProbability}" class="apple-slider" id="readIgnoreProbSlider">
        <span id="readIgnoreProbVal" class="probability-value">${chatPreferences.readIgnoreProbability}%</span>
      </div>

      <div class="chat-prefs-row mt-16">
        <label><i class="fas fa-clock"></i> 长时间未读</label>
        <div class="apple-toggle" id="longUnreadToggle"></div>
      </div>
      <div class="probability-bar">
        <label class="probability-label">触发概率</label>
        <input type="range" min="0" max="100" value="${chatPreferences.longUnreadProbability}" class="apple-slider" id="longUnreadProbSlider">
        <span id="longUnreadProbVal" class="probability-value">${chatPreferences.longUnreadProbability}%</span>
      </div>
      <div class="chat-prefs-info">
        已读不回：已读后 AI 可能不回复（晚安等类似场景更易触发）。<br>
        长时间未读：AI 可能在说出“稍等”等理由后暂时不读你的消息。
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
    // 加载配置到表单
    if (config.characterName) {
      const names = config.characterName.split(' ');
      charNameInput.value = names[0] || '';
      characterNameInput.value = names[1] || '';
    }
    characterBioInput.value = config.characterBio || '';
    charAgeInput.value = config.characterAge || '';
    charGenderInput.value = config.characterGender || '';
    charMemoriesInput.value = config.characterMemories || '';
    charExamplesInput.value = config.exampleDialog || '';
    systemPromptInput.value = config.systemPrompt;

    // 更新 UI 显示
    updateChatTitle();
    updateApiStatusBadge();
    populateSelectsFromConfig();
    updateCharacterPreview();
    updateMemoriesCards();
    updateExampleBubbles();
  }

  function saveConfigToStorage() {
    try { localStorage.setItem('chat_roleplay_config_v2', JSON.stringify(config)); } catch(e) {}
  }

  function updateChatTitle() {
    const namePart1 = charNameInput.value.trim();
    const namePart2 = characterNameInput.value.trim();
    const fullName = [namePart1, namePart2].filter(Boolean).join(' ') || '青绿角色';
    chatTitleDisplay.textContent = fullName;
  }

  function updateApiStatusBadge() {
    if (config.apiKey && config.apiKey.trim().length > 5) {
      apiStatus.textContent = '已设置密钥';
      apiStatus.className = 'status-badge active';
    } else {
      apiStatus.textContent = '未设置密钥';
      apiStatus.className = 'status-badge inactive';
    }
  }

  function syncConfigFromForm() {
    config.apiKey = apiKeyInput.value.trim();
    config.apiUrl = apiUrlInput.value.trim();
    config.model = modelInput.value.trim();

    const namePart1 = charNameInput.value.trim();
    const namePart2 = characterNameInput.value.trim();
    config.characterName = [namePart1, namePart2].filter(Boolean).join(' ') || '青绿角色';

    config.characterBio = characterBioInput.value.trim();
    config.characterAge = charAgeInput.value.trim();
    config.characterGender = charGenderInput.value.trim();
    config.characterMemories = charMemoriesInput.value.trim();
    config.exampleDialog = charExamplesInput.value.trim();
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

      if (msg.isReset) {
        const d = new Date(msgTime);
        const fullTime = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        html += `<div class="message-separator reset-separator">
          <div class="line line-left"></div>
          <span>${fullTime}</span>
          <div class="line line-right"></div>
        </div>`;
        lastTimestamp = msgTime;
        lastDateKey = msgDateKey;
        return;
      }

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

      // 已读未读状态，移动到气泡末尾部分
      let statusHtml = '';
      if (msg.role === 'user' && msg.readStatus) {
        const readClass = msg.readStatus === 'read' ? 'read' : 'unread';
        const readText = msg.readStatus === 'read' ? '已读' : '未读';
        statusHtml = `<span class="read-status-inline ${readClass}">${readText}</span>`;
      }

      let bubble = `
        <div class="message-bubble" data-index="${index}" onclick="handleBubbleClick(event, ${index})">
          <div class="bubble-content">${safe}</div>
          <div class="message-info">
            <div class="message-time">${formatTime(msgTime)}</div>
            ${statusHtml}
          </div>
          <!-- 悬停操作菜单 -->
          <div class="bubble-actions">
            <i class="fas fa-trash-alt" title="删除" onclick="deleteMessage(${index})"></i>
            <i class="fas fa-star" title="收藏" onclick="favoriteMessage(${index})"></i>
            <i class="fas fa-edit" title="修改" onclick="editMessage(${index})"></i>
          </div>
        </div>`;

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

  // 消息操作函数
  window.handleBubbleClick = function(e, index) {
    if (window.innerWidth <= 768) { // 手机端
      const actions = e.currentTarget.querySelector('.bubble-actions');
      if (actions.classList.contains('show')) {
        actions.classList.remove('show');
      } else {
        // 先关闭其他所有已打开的
        document.querySelectorAll('.bubble-actions').forEach(el => el.classList.remove('show'));
        actions.classList.add('show');
      }
      e.stopPropagation();
    }
  };

  window.deleteMessage = function(index) {
    if (confirm('确定删除这条消息吗？')) {
      messages.splice(index, 1);
      saveMessagesToStorage();
      renderMessages();
    }
  };

  window.favoriteMessage = function(index) {
    const msg = messages[index];
    const currentMemories = charMemoriesInput.value.trim();
    const newMemory = (currentMemories ? '\n' : '') + `收藏：${msg.content}`;
    charMemoriesInput.value = currentMemories + newMemory;
    updateMemoriesCards();
    saveCharacterToStorage();
    showToast('已将该消息内容收藏至核心记忆！');
  };

  window.editMessage = function(index) {
    const msg = messages[index];
    const newContent = prompt('修改消息内容：', msg.content);
    if (newContent !== null && newContent !== msg.content) {
      const oldContent = msg.content;
      msg.content = newContent;

      // 如果是 AI 的回复被修改，触发 AI 自主学习
      if (msg.role === 'assistant') {
        analyzeAndLearn(oldContent, newContent);
      }

      saveMessagesToStorage();
      renderMessages();
    }
  };

  async function analyzeAndLearn(oldVal, newVal) {
    try {
      const prompt = `用户修改了你的回复：
原回复：${oldVal}
新回复：${newVal}

请分析用户修改的意图，并根据新回复总结出一种对话风格规则。
要求：
1. 总结简洁，直接以指令形式输出。
2. 比较原回复和新回复，找出差异点。
3. 输出格式：[总结出的风格指令]
4. 不要输出其他废话。`;

      const learningResult = await callAI(prompt, "你是一个对话风格分析助手。");
      if (learningResult) {
        const currentStyle = charStyleInput.value.trim();
        // 用 * 标注 AI 修改的部分
        const newStyle = currentStyle + (currentStyle ? '\n' : '') + `* AI自动学习：${learningResult}`;
        charStyleInput.value = newStyle;
        saveCharacterToStorage();
      }
    } catch(e) {
      console.error('AI Learning error:', e);
    }
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
    messages = [{ role: 'system', content: '', timestamp: Date.now(), isReset: true }];
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
    updateMemoriesCards();
    updateExampleBubbles();
  }

  function updateMemoriesCards() {
    const container = document.getElementById('memoriesCardContainer');
    if (!container) return;
    const text = charMemoriesInput.value.trim();
    const lines = text.split('\n').filter(l => l.trim());

    container.innerHTML = lines.map(line => {
      let title = '记忆片段';
      let description = line;

      if (line.includes('：') || line.includes(':')) {
        const parts = line.split(/[：:]/);
        title = parts[0].trim().replace(/^-\s*/, '');
        description = parts.slice(1).join('：').trim();
      } else if (line.startsWith('- ')) {
        description = line.substring(2).trim();
      }

      return `
        <div class="memory-card">
          <div class="memory-card-header">
            <i class="fas fa-bookmark memory-card-icon"></i>
            ${escapeHtml(title)}
          </div>
          <div class="memory-card-content">
            ${escapeHtml(description)}
          </div>
        </div>
      `;
    }).join('');
  }

  function updateExampleBubbles() {
    const container = document.getElementById('exampleBubblePreview');
    if (!container) return;
    const text = charExamplesInput.value.trim();
    const lines = text.split('\n').filter(l => l.trim());

    let bubblesHtml = lines.map(line => {
      let role = 'assistant';
      let content = line;
      if (line.startsWith('用户：') || line.startsWith('User:')) {
        role = 'user';
        content = line.replace(/^(用户：|User:)/, '');
      } else if (line.startsWith('角色：') || line.startsWith('Assistant:') || line.startsWith('Bot:')) {
        role = 'assistant';
        content = line.replace(/^(角色：|Assistant:|Bot:)/, '');
      }

      const safe = escapeHtml(content);
      const alignClass = role === 'user' ? 'flex-end' : 'flex-start';
      const bubbleClass = role === 'user' ? 'user' : 'assistant';

      return `
        <div class="message-row ${alignClass}">
          <div class="example-bubble ${bubbleClass}">
            ${safe}
          </div>
        </div>
      `;
    }).join('');

    // 添加“+”按钮
    const addBtnHtml = `
      <div class="flex-center mt-10">
        <button class="btn btn-secondary btn-sm" onclick="addExampleGroup()">
          <i class="fas fa-plus mr-5"></i> 添加一组对话
        </button>
      </div>
    `;

    container.innerHTML = bubblesHtml + addBtnHtml;
  }

  window.addExampleGroup = function() {
    const currentText = charExamplesInput.value.trim();
    const newGroup = (currentText ? '\n' : '') + "用户：你好\n角色：你好，有什么我可以帮你的吗？";
    charExamplesInput.value = currentText + newGroup;
    updateExampleBubbles();
    // 自动触发一次输入事件以同步其他逻辑
    charExamplesInput.dispatchEvent(new Event('input'));
  };

  charMemoriesInput?.addEventListener('input', updateMemoriesCards);
  charExamplesInput?.addEventListener('input', updateExampleBubbles);

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
      showToast('人物设定已保存');
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
        characterPreviewAvatar.innerHTML = `<img src="${characterData.avatar}" class="avatar-img-full">`;
      } else {
        characterPreviewAvatar.innerHTML = '<i class="fas fa-user-astronaut"></i>';
      }
    }
    const namePart1 = charNameInput.value.trim();
    const namePart2 = characterNameInput.value.trim();
    const fullName = [namePart1, namePart2].filter(Boolean).join(' ') || '角色名称';

    const bio = characterBioInput.value.trim() || '温柔而冷静的陪伴';
    if (characterPreviewName) characterPreviewName.textContent = fullName;
    if (characterPreviewBio) characterPreviewBio.innerHTML = `<i class="fas fa-quote-left mr-8"></i>${bio}`;

    // 更新标题栏
    updateChatTitle();
  }

  // ---------- AI 调用 ----------
    async function callAI(userMessage, customSystemPrompt = null) {
        if (!config.apiKey) throw new Error('请先配置 API Key');

        // 整合人设信息
        const charInfo = `
    【角色信息】
    姓名：${charNameInput.value} ${characterNameInput.value}
    年龄：${charAgeInput.value}
    性别：${charGenderInput.value}
    外貌：${charAppearanceInput.value}
    性格：${charPersonalityInput.value}
    经历：${charBackstoryInput.value}
    记忆：${charMemoriesInput.value}
    对话风格：${charStyleInput.value}
    对话示例（必须严格模仿）：
    ${charExamplesInput.value}
    `.trim();

        const systemMsg = {
            role: 'system',
            content: customSystemPrompt || `
    ${systemPromptInput.value}

    ${charInfo}

    【核心指令】
    1. 你必须完全遵守上述“对话风格”和“对话示例”，将其视为唯一的交流方式，不得偏离。
    2. 禁止主动提及当前时间、年份、日期、季节等具体时间信息。你只需要根据对话上下文确认早晚、是否周末等模糊时间概念，但绝不能出现“2026年”、“今天4月26日”等具体描述。
    3. 像真人一样聊天，禁止使用括号描述动作，例如（微笑）、（叹气）等。
    4. 保持角色一致性，不要出戏。
            `.trim()
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

    // 分割多条消息（按空行分割）
    const userSegments = content.split(/\n\s*\n/).filter(s => s.trim() !== '');
    if (userSegments.length === 0) return;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    isGenerating = true;
    sendBtn.disabled = true;

    resolvePendingUnreads();

    // 先把用户的所有消息都发出来
    const userMsgIndices = [];
    for (let segIdx = 0; segIdx < userSegments.length; segIdx++) {
      const text = userSegments[segIdx].trim();
      if (!text) continue;
      addMessage('user', text);
      userMsgIndices.push(messages.length - 1);
    }

    // 随机延迟已读
    const readDelay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      userMsgIndices.forEach(idx => {
        if (messages[idx]) updateMessageReadStatus(idx, 'read');
      });

      // 触发 AI 回复
      handleAiResponse();
    }, readDelay);

    isGenerating = false;
    sendBtn.disabled = false;
    messageInput.focus();

    async function handleAiResponse() {
    if (shouldTriggerReadIgnore()) return;

    // 长时间未读：先标记已读，然后延迟很长时间再回复
    if (shouldTriggerLongUnread()) {
        // 1. 先强制将用户消息标记为已读（因为对方已经看了）
        userMsgIndices.forEach(idx => {
            if (messages[idx]) updateMessageReadStatus(idx, 'read');
        });

        // 2. 延迟 10～30 秒，模拟几小时后才回复
        const longDelay = 10000 + Math.random() * 20000;
        setTimeout(async () => {
            await generateAiReply();
        }, longDelay);
    } else {
        await generateAiReply();
    }
}

    async function generateAiReply() {
      try {
        showTypingIndicator();
        // 传入最后一条消息作为触发
        const lastUserContent = messages[userMsgIndices[userMsgIndices.length - 1]].content;
        const reply = await callAI(lastUserContent);
        const cleaned = cleanParentheses(reply);

        // 限制回复的消息条数，不要因为用户发了多条就回更多
        const sentences = cleaned.split(/(?<=[。！？!?])/g)
                                 .map(s => s.trim())
                                 .filter(s => s.length > 0);

        // 限制最多回复 2-3 条消息，使回复更真实
        const maxReplies = Math.floor(Math.random() * 2) + 1; // 1-2条
        const finalSentences = sentences.slice(0, maxReplies);

        removeTypingIndicator();
        for (const sentence of finalSentences) {
          showTypingIndicator();
          const charCount = sentence.length;
          let typingDelay = Math.min(6000, Math.max(1000, charCount * 60));
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
      cropModalOverlay.classList.add('show');
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
      cropModalOverlay.classList.add('show');
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
    cropModalOverlay.classList.remove('show');
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
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const profileAvatarLarge = document.getElementById('profileAvatarLarge');
        if (userAvatarBtn) userAvatarBtn.innerHTML = `<img src="${dataURL}" class="avatar-img-full">`;
        if (profileAvatarLarge) profileAvatarLarge.innerHTML = `<img src="${dataURL}" class="avatar-img-full">`;
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
    fileInput.className = 'hidden';
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
        document.getElementById('userAvatarBtn').innerHTML = `<img src="${savedAvatar}" class="avatar-img-full">`;
        document.getElementById('profileAvatarLarge').innerHTML = `<img src="${savedAvatar}" class="avatar-img-full">`;
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
      profileBioDisplay.innerHTML = `<i class="fas fa-quote-left mr-8"></i>${savedBio}`;
      editProfileNameInput.value = savedName;
      editProfileBioInput.value = savedBio;
    } catch(e) {}
  }

  // ---------- 提示弹窗 ----------
  function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }, 10);
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
          tr.innerHTML = `<td>${item.displayName} ${item.count>1?'('+item.count+'项)':''}</td><td class="text-right">${formatSize(item.bytes)}</td>`;
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
    charNameInput.addEventListener('input', updateCharacterPreview);
    characterBioInput.addEventListener('input', updateCharacterPreview);
    charAgeInput.addEventListener('input', updateCharacterPreview);
    charGenderInput.addEventListener('input', updateCharacterPreview);

    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModalOverlay = document.getElementById('editProfileModalOverlay');
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');
    const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
    const saveEditProfileBtn = document.getElementById('saveEditProfileBtn');

    const closeEditModal = () => { editProfileModalOverlay.classList.remove('show'); };
    editProfileBtn?.addEventListener('click', ()=> editProfileModalOverlay.classList.add('show'));
    closeEditProfileModal?.addEventListener('click', closeEditModal);
    cancelEditProfileBtn?.addEventListener('click', closeEditModal);
    editProfileModalOverlay?.addEventListener('click', e => { if(e.target===editProfileModalOverlay) closeEditModal(); });
    saveEditProfileBtn?.addEventListener('click', ()=>{
      const name = editProfileNameInput.value.trim()||'用户';
      const bio = editProfileBioInput.value.trim()||'在一隅，遇见自己。';
      localStorage.setItem('profile_name', name);
      localStorage.setItem('profile_bio', bio);
      profileDisplayName.textContent = name;
      profileBioDisplay.innerHTML = `<i class="fas fa-quote-left mr-8"></i>${bio}`;
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
