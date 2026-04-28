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
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const globalMenuBtn = document.getElementById('globalMenuBtn');
  const modelInput = document.getElementById('modelInput');
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
  const focusIcon = document.getElementById('focusIcon');
  const focusUserTimerDisplay = document.getElementById('focusUserTimerDisplay');
  const focusUserActivityDisplay = document.getElementById('focusUserActivityDisplay');
  const focusModeToggle = document.getElementById('focusModeToggle');
  const focusSettingsBtn = document.getElementById('focusSettingsBtn');
  const focusStartBtn = document.getElementById('focusStartBtn');
  const focusResetBtn = document.getElementById('focusResetBtn');
  const inviteToggleMain = document.getElementById('inviteToggleMain');
  const focusAiCard = document.getElementById('focusAiCard');
  const focusAiTimerDisplay = document.getElementById('focusAiTimerDisplay');
  const focusAiActivityDisplay = document.getElementById('focusAiActivityDisplay');
  const editAiFocusBtn = document.getElementById('editAiFocusBtn');
  const endAiFocusBtn = document.getElementById('endAiFocusBtn');

  const commonDialogOverlay = document.getElementById('commonDialogOverlay');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogMessage = document.getElementById('dialogMessage');
  const dialogCustomBody = document.getElementById('dialogCustomBody');
  const dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
  const dialogCancelBtn = document.getElementById('dialogCancelBtn');
  const closeCommonDialog = document.getElementById('closeCommonDialog');

  const batchSendBtn = document.getElementById('batchSendBtn');
  const batchSendModalOverlay = document.getElementById('batchSendModalOverlay');
  const closeBatchSendModal = document.getElementById('closeBatchSendModal');
  const cancelBatchSendBtn = document.getElementById('cancelBatchSendBtn');
  const confirmBatchSendBtn = document.getElementById('confirmBatchSendBtn');
  const batchMessageInput = document.getElementById('batchMessageInput');

  // ---------- 状态 ----------
  let messages = (() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(m => m.role === 'user' ? { ...m, readStatus: m.readStatus || 'read' } : m);
    }
    return [{ role: 'assistant', content: '你好！我是青绿。点击右上角「···」打开控制中心调整聊天偏好和聊天记录。左上角呼出菜单，点击齿轮进入设置配置api，点击角色进入角色设置界面修改角色指令。', timestamp: Date.now() }];
  })();

  let config = {
    apiKey: '',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    characterName: '青绿',
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

  let focusState = {
    user: { activity: '学习', mode: 'down', durationSec: 25 * 60, remainingSec: 25 * 60, elapsedSec: 0, running: false, lastStartTs: 0, startRemainingSec: 25 * 60, startElapsedSec: 0 },
    ai: { enabled: false, locked: false, activity: '陪你专注', mode: 'down', durationSec: 25 * 60, remainingSec: 25 * 60, elapsedSec: 0, running: false, lastStartTs: 0, startRemainingSec: 25 * 60, startElapsedSec: 0 }
  };
  let focusTickerId = null;

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
        长时间未读：AI 可能在说出"稍等"等理由后暂时不读你的消息。
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
    // 滑动条填充色动态更新
    function updateSliderFill(slider) {
      if (!slider) return;
      const min = Number(slider.min) || 0;
      const max = Number(slider.max) || 100;
      const val = Number(slider.value) || 0;
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--border-strong) ${pct}%)`;
    }

    readIgnoreProbSlider?.addEventListener('input', (e) => {
      chatPreferences.readIgnoreProbability = parseInt(e.target.value);
      readIgnoreProbVal.textContent = chatPreferences.readIgnoreProbability + '%';
      updateSliderFill(e.target);
      saveChatPreferences();
    });
    longUnreadProbSlider?.addEventListener('input', (e) => {
      chatPreferences.longUnreadProbability = parseInt(e.target.value);
      longUnreadProbVal.textContent = chatPreferences.longUnreadProbability + '%';
      updateSliderFill(e.target);
      saveChatPreferences();
    });

    loadChatPreferences();
    // 初始化填充色
    setTimeout(() => {
      updateSliderFill(document.getElementById('readIgnoreProbSlider'));
      updateSliderFill(document.getElementById('longUnreadProbSlider'));
    }, 0);
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

    const setVal = (el, val) => { if (el) el.value = val; };

    setVal(apiKeyInput, config.apiKey || '');
    setVal(apiUrlInput, config.apiUrl);
    setVal(modelInput, config.model);

    // 加载配置到表单
    if (config.characterName) {
      setVal(charNameInput, config.characterName);
    }
    setVal(characterBioInput, config.characterBio || '');
    setVal(charAgeInput, config.characterAge || '');
    setVal(charGenderInput, config.characterGender || '');
    setVal(charMemoriesInput, config.characterMemories || '');
    setVal(charExamplesInput, config.exampleDialog || '');
    setVal(systemPromptInput, config.systemPrompt);

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
    const fullName = namePart1 || '青绿';
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
    const getVal = (el) => el ? el.value.trim() : '';

    config.apiKey = getVal(apiKeyInput);
    config.apiUrl = getVal(apiUrlInput);
    config.model = getVal(modelInput);

    config.characterName = getVal(charNameInput) || '青绿';

    config.characterBio = getVal(characterBioInput);
    config.characterAge = getVal(charAgeInput);
    config.characterGender = getVal(charGenderInput);
    config.characterMemories = getVal(charMemoriesInput);
    config.exampleDialog = getVal(charExamplesInput);
    config.systemPrompt = getVal(systemPromptInput);
  }

  function applyConfig() {
    syncConfigFromForm();
    saveConfigToStorage();
    updateChatTitle();
    updateApiStatusBadge();
  }

  function updateModelVisibility() {
    const provider = apiProviderSelect.value;
    const optgroups = modelSelect.querySelectorAll('optgroup');
    optgroups.forEach(group => {
      if (group.label.toLowerCase().includes(provider.toLowerCase()) ||
          (provider === 'custom' && group.label === '其他')) {
        group.style.display = '';
      } else {
        group.style.display = 'none';
      }
    });

    // 如果当前选中的模型在隐藏的组里，自动选择该组的第一个
    const currentOption = modelSelect.options[modelSelect.selectedIndex];
    const currentGroup = currentOption.parentElement;
    if (currentGroup.style.display === 'none') {
      const firstVisibleGroup = Array.from(optgroups).find(g => g.style.display !== 'none');
      if (firstVisibleGroup && firstVisibleGroup.options.length > 0) {
        modelSelect.value = firstVisibleGroup.options[0].value;
        updateModelInputFromSelect();
      }
    }
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

    const getUserAvatarUrl = () => {
      try { return localStorage.getItem('user_avatar') || ''; } catch(e) { return ''; }
    };
    const getAssistantAvatarUrl = () => characterData?.avatar || '';
    const buildAvatarHtml = (role) => {
      const url = role === 'user' ? getUserAvatarUrl() : getAssistantAvatarUrl();
      if (url) return `<div class="message-avatar ${role}"><img src="${url}" alt=""></div>`;
      const icon = role === 'user' ? 'fa-user' : 'fa-user-astronaut';
      return `<div class="message-avatar ${role}"><i class="fas ${icon}"></i></div>`;
    };

    let html = '';
    let lastTimestamp = 0;
    let lastDateKey = '';

    messages.forEach((msg, index) => {
      const msgTime = msg.timestamp;
      const msgDateKey = new Date(msgTime).toDateString();

      if (msg.isReset) {
        // 显示消息的 content 内容（如"对方专注结束 · HH:MM"）
        const displayText = msg.content || '';
        html += `<div class="message-separator reset-separator">
          <div class="line line-left"></div>
          <span>${displayText}</span>
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

      // 已读未读状态，移动到气泡外侧（左侧下方）
      let statusHtml = '';
      if (msg.role === 'user' && msg.readStatus) {
        const readClass = msg.readStatus === 'read' ? 'read' : 'unread';
        const readText = msg.readStatus === 'read' ? '已读' : '未读';
        statusHtml = `<span class="read-status-outside ${readClass}">${readText}</span>`;
      }

      let bubble = `
        <div class="message-bubble" data-index="${index}" onclick="handleBubbleClick(event, ${index})">
          <div class="bubble-content">${safe}</div>
          <div class="message-info">
            <div class="message-time">${formatTime(msgTime)}</div>
          </div>
          <!-- 悬停操作菜单 -->
          <div class="bubble-actions">
            <i class="fas fa-trash-alt" title="删除" onclick="deleteMessage(${index})"></i>
            <i class="fas fa-star" title="收藏" onclick="favoriteMessage(${index})"></i>
            <i class="fas fa-edit" title="修改" onclick="editMessage(${index})"></i>
          </div>
        </div>`;

      if (msg.role === 'user' && statusHtml) {
        html += `<div class="message-row ${msg.role}">${statusHtml}${bubble}${buildAvatarHtml('user')}</div>`;
      } else {
        if (msg.role === 'assistant') {
          html += `<div class="message-row assistant">${buildAvatarHtml('assistant')}${bubble}</div>`;
        } else {
          html += `<div class="message-row user">${bubble}${buildAvatarHtml('user')}</div>`;
        }
      }

      lastTimestamp = msgTime;
      lastDateKey = msgDateKey;
    });

    if (currentTypingMessageId) {
      html += `<div class="message-row assistant" id="${currentTypingMessageId}">${buildAvatarHtml('assistant')}<div class="message-bubble typing-indicator"><span></span><span></span><span></span></div></div>`;
    }

    messagesArea.innerHTML = html;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // 消息操作函数
  window.handleBubbleClick = function(e, index) {
    if (window.innerWidth <= 600) { // 手机端
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
    showCommonDialog({
      title: '删除消息',
      message: '确定要删除这条消息吗？此操作不可撤销。',
      confirmText: '删除',
      onConfirm: () => {
        messages.splice(index, 1);
        saveMessagesToStorage();
        renderMessages();
      }
    });
  };

  window.favoriteMessage = function(index) {
    const msg = messages[index];
    const currentMemories = charMemoriesInput.value.trim();
    const newMemory = (currentMemories ? '\n' : '') + `收藏：${msg.content}`;
    charMemoriesInput.value = currentMemories + newMemory;
    updateMemoriesCards();
    saveCharacterToStorage();

    showCommonDialog({
      title: '收藏成功',
      message: '已将该消息内容收藏至核心记忆！',
      showCancel: false,
      confirmText: '知道了'
    });
  };

  window.editMessage = function(index) {
    const msg = messages[index];
    const inputId = 'editMessageInput_' + index;
    const customBody = `<textarea id="${inputId}" class="w-full mt-10" rows="5" style="padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-side); color:var(--text-main);">${msg.content}</textarea>`;

    showCommonDialog({
      title: '修改消息',
      customBody: customBody,
      confirmText: '保存修改',
      onConfirm: () => {
        const newContent = document.getElementById(inputId).value.trim();
        if (newContent && newContent !== msg.content) {
          const oldContent = msg.content;
          msg.content = newContent;
          if (msg.role === 'assistant') analyzeAndLearn(oldContent, newContent);
          saveMessagesToStorage();
          renderMessages();
        }
      }
    });
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
3. 输出格式：只输出风格指令，不要其他文字`;

      const learningResult = await callAI(prompt, "你是一个对话风格分析助手。");
      if (learningResult && learningResult.trim()) {
        // 添加到词条池
        learnedTraits.push({
          id: 'trait_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          text: learningResult.trim(),
          selected: false,
          timestamp: Date.now()
        });
        saveLearnedTraits();
        renderLearnedTraits();

        // 如果累积到5条词条，自动总结
        if (learnedTraits.length >= 5) {
          summarizeTraitsToStyle();
        }
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

    const setVal = (el, val) => { if (el) el.value = val; };

    setVal(worldBookInput, characterData.worldBook || '');
    setVal(charNameInput, characterData.name || '');
    setVal(charAgeInput, characterData.age || '');
    setVal(charGenderInput, characterData.gender || '');
    setVal(charAppearanceInput, characterData.appearance || '');
    setVal(charPersonalityInput, characterData.personality || '');
    setVal(charBackstoryInput, characterData.backstory || '');
    setVal(charMemoriesInput, characterData.memories || '');
    setVal(charStyleInput, characterData.style || '');
    setVal(charExamplesInput, characterData.examples || '');
    setVal(characterBioInput, characterData.bio || '温柔而冷静的陪伴');

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
    const text = charExamplesInput ? charExamplesInput.value.trim() : '';
    const lines = text.split('\n').filter(l => l.trim());

    container.innerHTML = '';

    lines.forEach((line, idx) => {
      let role = 'assistant';
      let content = line;
      let prefix = '';
      if (line.startsWith('用户：') || line.startsWith('User:')) {
        role = 'user';
        prefix = line.startsWith('用户：') ? '用户：' : 'User:';
        content = line.replace(/^(用户：|User:)/, '');
      } else if (line.startsWith('角色：') || line.startsWith('Assistant:') || line.startsWith('Bot:')) {
        role = 'assistant';
        prefix = line.startsWith('角色：') ? '角色：' : (line.startsWith('Assistant:') ? 'Assistant:' : 'Bot:');
        content = line.replace(/^(角色：|Assistant:|Bot:)/, '');
      } else {
        prefix = '';
      }

      const bubbleClass = role === 'user' ? 'user' : 'assistant';

      const row = document.createElement('div');
      // 使用与主聊天界面完全一致的 message-row user/assistant 类
      row.className = `message-row ${bubbleClass}`;
      row.style.alignItems = 'center';
      row.style.gap = '6px';

      // 气泡（可点击编辑）
      const bubble = document.createElement('div');
      bubble.className = `example-bubble ${bubbleClass} editable-bubble`;
      bubble.title = '点击编辑';
      bubble.textContent = content;
      bubble.dataset.idx = idx;
      bubble.dataset.prefix = prefix;

      bubble.addEventListener('click', () => {
        if (bubble.querySelector('textarea')) return; // 已在编辑
        const ta = document.createElement('textarea');
        ta.className = 'bubble-inline-editor';
        ta.value = content;
        ta.rows = Math.max(1, content.split('\n').length);
        bubble.textContent = '';
        bubble.appendChild(ta);
        ta.focus();
        ta.select();

        const commit = () => {
          const newVal = ta.value.trim();
          const allLines = charExamplesInput.value.split('\n');
          allLines[idx] = prefix + newVal;
          charExamplesInput.value = allLines.join('\n');
          content = newVal;
          updateExampleBubbles();
        };
        ta.addEventListener('blur', commit);
        ta.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { bubble.textContent = content; }
        });
      });

      // 删除按钮
      const delBtn = document.createElement('button');
      delBtn.className = 'bubble-del-btn';
      delBtn.title = '删除此行';
      delBtn.innerHTML = '<i class="fas fa-times"></i>';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const allLines = charExamplesInput.value.split('\n');
        allLines.splice(idx, 1);
        charExamplesInput.value = allLines.join('\n');
        updateExampleBubbles();
      });

      if (role === 'user') {
        row.appendChild(delBtn);
        row.appendChild(bubble);
      } else {
        row.appendChild(bubble);
        row.appendChild(delBtn);
      }

      container.appendChild(row);
    });

    // 添加"+"按钮
    const addRow = document.createElement('div');
    addRow.className = 'flex-center mt-10';
    addRow.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="addExampleGroup()">
        <i class="fas fa-plus mr-5"></i> 添加一组对话
      </button>
    `;
    container.appendChild(addRow);

    // 提示（仅无内容时显示）
    if (lines.length === 0) {
      const hint = document.createElement('div');
      hint.className = 'fs-13 text-secondary mt-8';
      hint.style.textAlign = 'center';
      hint.textContent = '点击「添加一组对话」开始，然后点击气泡直接编辑内容';
      container.insertBefore(hint, addRow);
    }
  }

  window.addExampleGroup = function() {
    const currentText = charExamplesInput ? charExamplesInput.value.trim() : '';
    const newGroup = (currentText ? '\n' : '') + "用户：你好\n角色：你好，有什么我可以帮你的吗？";
    if (charExamplesInput) charExamplesInput.value = currentText + newGroup;
    updateExampleBubbles();
    if (charExamplesInput) charExamplesInput.dispatchEvent(new Event('input'));
  };

  charMemoriesInput?.addEventListener('input', updateMemoriesCards);
  charExamplesInput?.addEventListener('input', updateExampleBubbles);

  function saveCharacterToStorage() {
    const getVal = (el) => el ? el.value.trim() : '';

    characterData = {
      worldBook: getVal(worldBookInput),
      name: getVal(charNameInput),
      age: getVal(charAgeInput),
      gender: getVal(charGenderInput),
      appearance: getVal(charAppearanceInput),
      personality: getVal(charPersonalityInput),
      backstory: getVal(charBackstoryInput),
      memories: getVal(charMemoriesInput),
      style: getVal(charStyleInput),
      examples: getVal(charExamplesInput),
      avatar: characterData.avatar,
      cover: characterData.cover,
      bio: getVal(characterBioInput)
    };
    try {
      localStorage.setItem('character_data', JSON.stringify(characterData));
      updateCharacterPreview();
      config.characterName = getVal(charNameInput) || '青绿';
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
    const getVal = (el) => el ? el.value.trim() : '';
    const namePart1 = getVal(charNameInput);
    const fullName = namePart1 || '角色名称';

    const bio = getVal(characterBioInput) || '温柔而冷静的陪伴';
    if (characterPreviewName) characterPreviewName.textContent = fullName;
    if (characterPreviewBio) characterPreviewBio.innerHTML = `<i class="fas fa-quote-left mr-8"></i>${bio}`;

    // 更新标题栏
    updateChatTitle();
  }

  // ---------- AI 调用 ----------
    async function callAI(userMessage, customSystemPrompt = null) {
        if (!config.apiKey) throw new Error('请先配置 API Key');

        const getVal = (el) => el ? el.value : '';
        // 整合人设信息
        const charInfo = `
    【角色信息】
    姓名：${getVal(charNameInput)}
    年龄：${getVal(charAgeInput)}
    性别：${getVal(charGenderInput)}
    外貌：${getVal(charAppearanceInput)}
    性格：${getVal(charPersonalityInput)}
    经历：${getVal(charBackstoryInput)}
    记忆：${getVal(charMemoriesInput)}
    对话风格：${getVal(charStyleInput)}
    对话示例（必须严格模仿）：
    ${getVal(charExamplesInput)}
    `.trim();

        const systemMsg = {
            role: 'system',
            content: customSystemPrompt || `
    ${getVal(systemPromptInput)}

    ${charInfo}

    【核心指令】
    1. 你必须完全遵守上述"对话风格"和"对话示例"，将其视为唯一的交流方式，不得偏离。
    2. 禁止主动提及当前时间、年份、日期、季节等具体时间信息。你只需要根据对话上下文确认早晚、是否周末等模糊时间概念，但绝不能出现"2026年"、"今天4月26日"等具体描述。
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
        const choice0 = data?.choices?.[0];
        const content = choice0?.message?.content ?? choice0?.delta?.content ?? choice0?.text;
        if (typeof content === 'string') return content;
        const errPayload = (() => {
          try { return JSON.stringify(data); } catch(e) { return '[unserializable]'; }
        })();
        throw new Error(`API 返回格式异常：缺少内容字段（choices[0].message.content）。返回：${errPayload.slice(0, 800)}`);
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
  async function handleSendMessage(overrideSegments = null) {
    const content = messageInput.value.trim();
    if (!overrideSegments && (!content || isGenerating)) return;

    // 分割多条消息（如果是批量发送，按行分割；如果是普通发送，按空行分割）
    const userSegments = overrideSegments || content.split(/\n\s*\n/).filter(s => s.trim() !== '');
    if (userSegments.length === 0) return;

    if (!overrideSegments) {
      messageInput.value = '';
      messageInput.style.height = 'auto';
    }
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

        // 按照句号、问号、感叹号以及换行符进行拆分
        // 修改：对方换行和使用句号=发送下一条消息到气泡
        const sentences = cleaned.split(/(?<=[。\.！？!?\n])/g)
                                 .map(s => s.trim())
                                 .filter(s => s.length > 0);

        removeTypingIndicator();
        for (const sentence of sentences) {
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

  function openSidebar() {
    document.body.classList.add('sidebar-open');
    if (globalMenuBtn) globalMenuBtn.style.display = 'none';
  }
  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    if (globalMenuBtn) globalMenuBtn.style.display = '';
  }
  function toggleSidebar() {
    if (document.body.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  }

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
    window._cropTarget = 'user';
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
    window._cropTarget = null;
  }

  function saveCroppedImage() {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas();
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);

    const cropTarget = window._cropTarget || 'user';
    if (cropTarget === 'character') {
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
    chatMain.classList.remove('chat-hidden', 'profile-hidden', 'character-hidden', 'data-hidden', 'focus-hidden');
    document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
    userAvatarBtn.classList.remove('active');
    if (view === 'chat') chatIcon.classList.add('active');
    else if (view === 'settings') { chatMain.classList.add('chat-hidden'); gearIcon.classList.add('active'); }
    else if (view === 'profile') { chatMain.classList.add('profile-hidden'); userAvatarBtn.classList.add('active'); }
    else if (view === 'character') { chatMain.classList.add('character-hidden'); characterIcon.classList.add('active'); }
    else if (view === 'focus') { chatMain.classList.add('focus-hidden'); focusIcon?.classList.add('active'); }
    else if (view === 'data') {
      chatMain.classList.add('data-hidden');
      dataManagerIcon.classList.add('active');
      refreshStorageStats();
    }
  }

  function formatCountdown(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function computeDownRemaining(timer) {
    if (!timer.running) return Math.max(0, timer.remainingSec || 0);
    const elapsed = (Date.now() - (timer.lastStartTs || 0)) / 1000;
    return Math.max(0, (timer.startRemainingSec || 0) - elapsed);
  }

  function computeUpElapsed(timer) {
    if (!timer.running) return Math.max(0, timer.elapsedSec || 0);
    const elapsed = (Date.now() - (timer.lastStartTs || 0)) / 1000;
    return Math.max(0, (timer.startElapsedSec || 0) + elapsed);
  }

  function computeTimerSeconds(timer) {
    return (timer.mode === 'up') ? computeUpElapsed(timer) : computeDownRemaining(timer);
  }

  function saveFocusState() {
    try { localStorage.setItem('focus_state', JSON.stringify(focusState)); } catch(e) {}
  }

  function loadFocusState() {
    try {
      const saved = localStorage.getItem('focus_state');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object') return;
      focusState = {
        user: { ...focusState.user, ...(parsed.user || {}) },
        ai: { ...focusState.ai, ...(parsed.ai || {}) }
      };
    } catch(e) {}
  }

  function normalizeFocusAfterLoad() {
    focusState.user.mode = focusState.user.mode === 'up' ? 'up' : 'down';
    focusState.ai.mode = focusState.ai.mode === 'up' ? 'up' : 'down';
    if (typeof focusState.ai.locked !== 'boolean') focusState.ai.locked = false;
    // 如果AI专注没有在运行，清除locked状态（防止上次会话异常结束导致按钮被锁死）
    if (!focusState.ai.running) focusState.ai.locked = false;

    focusState.user.durationSec = Math.max(0, Number(focusState.user.durationSec) || 0);
    focusState.user.remainingSec = Math.max(0, Number(focusState.user.remainingSec) || 0);
    focusState.user.elapsedSec = Math.max(0, Number(focusState.user.elapsedSec) || 0);
    focusState.user.startRemainingSec = Math.max(0, Number(focusState.user.startRemainingSec) || 0);
    focusState.user.startElapsedSec = Math.max(0, Number(focusState.user.startElapsedSec) || 0);
    focusState.user.lastStartTs = Number(focusState.user.lastStartTs) || 0;

    focusState.ai.durationSec = Math.max(0, Number(focusState.ai.durationSec) || 0);
    focusState.ai.remainingSec = Math.max(0, Number(focusState.ai.remainingSec) || 0);
    focusState.ai.elapsedSec = Math.max(0, Number(focusState.ai.elapsedSec) || 0);
    focusState.ai.startRemainingSec = Math.max(0, Number(focusState.ai.startRemainingSec) || 0);
    focusState.ai.startElapsedSec = Math.max(0, Number(focusState.ai.startElapsedSec) || 0);
    focusState.ai.lastStartTs = Number(focusState.ai.lastStartTs) || 0;

    if (focusState.user.durationSec <= 0) focusState.user.durationSec = 25 * 60;
    if (focusState.ai.durationSec <= 0) focusState.ai.durationSec = focusState.user.durationSec;

    if (focusState.user.mode === 'up') {
      const uElapsed = computeUpElapsed(focusState.user);
      focusState.user.elapsedSec = uElapsed;
      if (focusState.user.running) {
        focusState.user.startElapsedSec = uElapsed;
        focusState.user.lastStartTs = Date.now();
      } else {
        focusState.user.lastStartTs = 0;
      }
    } else {
      const uRem = computeDownRemaining(focusState.user);
      if (uRem <= 0) {
        focusState.user.remainingSec = 0;
        focusState.user.running = false;
        focusState.user.lastStartTs = 0;
        focusState.user.startRemainingSec = 0;
      } else if (focusState.user.running) {
        focusState.user.remainingSec = uRem;
        focusState.user.startRemainingSec = uRem;
        focusState.user.lastStartTs = Date.now();
      }
    }

    if (!focusState.ai.enabled) {
      focusState.ai.running = false;
      focusState.ai.lastStartTs = 0;
    } else if (focusState.ai.mode === 'up') {
      const aElapsed = computeUpElapsed(focusState.ai);
      focusState.ai.elapsedSec = aElapsed;
      if (focusState.ai.running) {
        focusState.ai.startElapsedSec = aElapsed;
        focusState.ai.lastStartTs = Date.now();
      } else {
        focusState.ai.lastStartTs = 0;
      }
    } else {
      const aRem = computeDownRemaining(focusState.ai);
      if (aRem <= 0) {
        focusState.ai.remainingSec = 0;
        focusState.ai.running = false;
        focusState.ai.lastStartTs = 0;
        focusState.ai.startRemainingSec = 0;
      } else if (focusState.ai.running) {
        focusState.ai.remainingSec = aRem;
        focusState.ai.startRemainingSec = aRem;
        focusState.ai.lastStartTs = Date.now();
      }
    }
  }

  function syncFocusUI() {
    if (focusUserTimerDisplay) focusUserTimerDisplay.textContent = formatCountdown(computeTimerSeconds(focusState.user));
    if (focusUserActivityDisplay) focusUserActivityDisplay.textContent = focusState.user.activity || '专注';
    if (focusModeToggle) {
      focusModeToggle.classList.toggle('active', focusState.user.mode === 'up');
      // 专注进行中（running 或已有进度）时，禁用模式切换
      const isLocked = !!focusState.user.running;
      focusModeToggle.style.pointerEvents = isLocked ? 'none' : 'auto';
      focusModeToggle.style.opacity       = isLocked ? '0.4' : '1';
      focusModeToggle.title               = isLocked ? '专注中无法切换计时模式' : '';
    }

    if (focusStartBtn) {
      const hasProgress = focusState.user.mode === 'up'
        ? (Number(focusState.user.elapsedSec) > 0)
        : (Number(focusState.user.remainingSec) > 0 && Number(focusState.user.remainingSec) < Number(focusState.user.durationSec || 0));

      if (focusState.user.running) {
        // 正在运行：按钮变为「暂停」
        focusStartBtn.innerHTML = `<i class="fas fa-pause mr-8"></i>暂停`;
        focusStartBtn.classList.remove('btn-primary');
        focusStartBtn.classList.add('btn-secondary');
        focusStartBtn.disabled = false;
      } else if (hasProgress) {
        // 有进度但已暂停：「继续」
        focusStartBtn.innerHTML = `<i class="fas fa-play mr-8"></i>继续`;
        focusStartBtn.classList.remove('btn-secondary');
        focusStartBtn.classList.add('btn-primary');
        focusStartBtn.disabled = false;
      } else {
        // 未开始：「开始」
        focusStartBtn.innerHTML = `<i class="fas fa-play mr-8"></i>开始`;
        focusStartBtn.classList.remove('btn-secondary');
        focusStartBtn.classList.add('btn-primary');
        focusStartBtn.disabled = false;
      }
    }

    // 结束专注按钮：只有在开始专注后（有进度）才可交互
    if (focusResetBtn) {
      const hasProgress = focusState.user.mode === 'up'
        ? (Number(focusState.user.elapsedSec) > 0)
        : (Number(focusState.user.startRemainingSec) > 0 && Number(focusState.user.startRemainingSec) < Number(focusState.user.durationSec || 0));
      const isRunning = !!focusState.user.running;
      // 可交互：当正在运行 或 有进度（已暂停）
      focusResetBtn.disabled = !isRunning && !hasProgress;
    }

    if (focusAiCard) focusAiCard.style.display = focusState.ai.enabled ? 'block' : 'none';
    if (inviteToggleMain) {
        inviteToggleMain.classList.toggle('active', focusState.ai.enabled);
        const disabled = focusState.ai.enabled && focusState.ai.running || !!focusState.ai.locked;
        inviteToggleMain.style.pointerEvents = disabled ? 'none' : 'auto';
        inviteToggleMain.style.opacity = disabled ? '0.5' : '1';
    }
    if (editAiFocusBtn) editAiFocusBtn.style.display = (focusState.ai.enabled && !focusState.ai.locked) ? 'inline-flex' : 'none';
    if (endAiFocusBtn) endAiFocusBtn.style.display = (focusState.ai.enabled && focusState.ai.running) ? 'inline-flex' : 'none';
    if (focusAiTimerDisplay) focusAiTimerDisplay.textContent = formatCountdown(computeTimerSeconds(focusState.ai));
    if (focusAiActivityDisplay) focusAiActivityDisplay.textContent = focusState.ai.activity || '专注';

    // ===== 更新专注动画 =====
    syncFocusAnim();
  }

  function ensureFocusTicker() {
    if (focusTickerId) return;
    focusTickerId = setInterval(() => {
        const userRunning = !!focusState.user.running;
        const aiRunning = !!(focusState.ai.enabled && focusState.ai.running);

        // 只要还有一个在运行，就继续滴答
        if (!userRunning && !aiRunning) {
            clearInterval(focusTickerId);
            focusTickerId = null;
            syncFocusUI();
            saveFocusState();
            return;
        }

      if (focusState.user.running && focusState.user.mode !== 'up') {
        const uRem = computeDownRemaining(focusState.user);
        if (uRem <= 0) {
          focusState.user.running = false;
          focusState.user.remainingSec = 0;
          focusState.user.lastStartTs = 0;
          focusState.user.startRemainingSec = 0;
        }
      }

      if (focusState.ai.enabled && focusState.ai.running && focusState.ai.mode !== 'up') {
        const aRem = computeDownRemaining(focusState.ai);
        if (aRem <= 0) {
            focusState.ai.running = false;
            focusState.ai.remainingSec = 0;
            focusState.ai.lastStartTs = 0;
            focusState.ai.startRemainingSec = 0;
            // 对方自主结束，发送消息
            sendFocusEndMessage();
            saveFocusState();
        }
      }

      // 上限检查（3小时）
    function enforceTimeLimit(timer, owner) {
        const maxSec = 3 * 60 * 60;
        let elapsed = 0;
        if (timer.mode === 'up') {
            elapsed = computeUpElapsed(timer);
        } else {
            elapsed = (timer.durationSec || 0) - (timer.running ? computeDownRemaining(timer) : timer.remainingSec);
        }
        if (elapsed >= maxSec) {
            timer.running = false;
            timer.lastStartTs = 0;
            if (timer.mode === 'up') {
                timer.elapsedSec = maxSec;
                timer.startElapsedSec = maxSec;
            } else {
                timer.remainingSec = 0;
                timer.startRemainingSec = 0;
            }
            if (owner === 'ai') {
                sendFocusEndMessage();
            }
            saveFocusState();
            return true; // 表示已强制结束
        }
        return false;
    }

    // 在 setInterval 回调中调用
    if (focusState.user.running) enforceTimeLimit(focusState.user, 'user');
    if (focusState.ai.enabled && focusState.ai.running) enforceTimeLimit(focusState.ai, 'ai');

      syncFocusUI();
    }, 250);
  }

  function startAiFocusAuto() {
    if (focusState.ai.running) return;
    focusState.ai.enabled = true;
    focusState.ai.locked = true;
    focusState.ai.mode = focusState.user.mode;
    focusState.ai.activity = (focusState.ai.activity || '').trim() || `陪你一起${focusState.user.activity || '专注'}`;
    if (!focusState.ai.durationSec || focusState.ai.durationSec <= 0) focusState.ai.durationSec = focusState.user.durationSec;
    // 上限3小时
    const maxSec = 3 * 60 * 60;
    if (focusState.ai.durationSec > maxSec) focusState.ai.durationSec = maxSec;

    focusState.ai.running = true;
    focusState.ai.lastStartTs = Date.now();
    if (focusState.ai.mode === 'up') {
      focusState.ai.elapsedSec = 0;
      focusState.ai.startElapsedSec = 0;
    } else {
      focusState.ai.remainingSec = focusState.ai.durationSec;
      focusState.ai.startRemainingSec = focusState.ai.remainingSec;
    }
  }

  function startUserFocus() {
    if (focusState.user.running) return;

    focusState.user.running = true;
    focusState.user.lastStartTs = Date.now();
    if (focusState.user.mode === 'up') {
        focusState.user.startElapsedSec = Math.max(0, focusState.user.elapsedSec || 0);
    } else {
        const rem = computeDownRemaining(focusState.user);
        if (rem <= 0) focusState.user.remainingSec = focusState.user.durationSec;
        focusState.user.startRemainingSec = focusState.user.remainingSec;
    }

    if (focusState.ai.enabled) startAiFocusAuto();

    saveFocusState();
    syncFocusUI();
    ensureFocusTicker();
  }

  function stopUserFocus() {
    if (!focusState.user.running) return;
    if (focusState.user.mode === 'up') focusState.user.elapsedSec = computeUpElapsed(focusState.user);
    else focusState.user.remainingSec = computeDownRemaining(focusState.user);
    focusState.user.running = false;
    focusState.user.lastStartTs = 0;
    focusState.user.startRemainingSec = focusState.user.remainingSec;
    focusState.user.startElapsedSec = focusState.user.elapsedSec || 0;
    // 注意：这里不停止对方的计时，对方继续自主运行
    saveFocusState();
    syncFocusUI();
  }

  function endUserFocus() {
    // 计算专注时长
    const elapsed = focusState.user.mode === 'up'
      ? focusState.user.elapsedSec
      : (focusState.user.startRemainingSec - focusState.user.remainingSec);
    const duration = focusState.user.durationSec || 0;
    const elapsedMin = Math.round(elapsed / 60);
    const durationMin = Math.round(duration / 60);
    const activity = focusState.user.activity || '专注';

    const timeStr = elapsedMin > 0 ? `${elapsedMin}分钟` : `${durationMin}分钟`;
    const message = `${activity} · ${timeStr}`;

    resetUserOnly();
    // 显示专注结束弹窗
    showCommonDialog({
      title: '⭐专注结束',
      message: message,
      showCancel: false,
      confirmText: '好的',
      onConfirm: null
    });
  }

  function resetUserOnly() {
    focusState.user.running = false;
    focusState.user.lastStartTs = 0;
    if (focusState.user.mode === 'up') {
        focusState.user.elapsedSec = 0;
        focusState.user.startElapsedSec = 0;
    } else {
        focusState.user.remainingSec = focusState.user.durationSec;
        focusState.user.startRemainingSec = focusState.user.remainingSec;
    }
    // 不碰 AI 的任何状态
    saveFocusState();
    syncFocusUI();
  }

  function endAiFocus() {
    if (!focusState.ai.enabled) return;
    focusState.ai.running = false;
    focusState.ai.lastStartTs = 0;
    // 重置计时（无论是否运行，直接归零）
    if (focusState.ai.mode === 'up') {
        focusState.ai.elapsedSec = 0;
        focusState.ai.startElapsedSec = 0;
    } else {
        focusState.ai.remainingSec = focusState.ai.durationSec;
        focusState.ai.startRemainingSec = focusState.ai.remainingSec;
    }
    focusState.ai.enabled = false;   // 卡片隐藏
    focusState.ai.locked = false;    // 解锁，下次可重新设置

    // 添加分割线标识
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    messages.push({
      role: 'assistant',
      content: `对方专注结束 · ${timeStr}`,
      timestamp: Date.now(),
      isReset: true
    });
    saveMessagesToStorage();
    renderMessages();

    saveFocusState();
    syncFocusUI();
  }

  function resetUserFocus() {
    focusState.user.running = false;
    focusState.user.lastStartTs = 0;
    if (focusState.user.mode === 'up') {
        focusState.user.elapsedSec = 0;
        focusState.user.startElapsedSec = 0;
    } else {
        focusState.user.remainingSec = focusState.user.durationSec;
        focusState.user.startRemainingSec = focusState.user.remainingSec;
    }

    // 重置对方（停止并恢复初始状态）
    if (focusState.ai.enabled) {
        focusState.ai.running = false;
        focusState.ai.lastStartTs = 0;
        if (focusState.ai.mode === 'up') {
            focusState.ai.elapsedSec = 0;
            focusState.ai.startElapsedSec = 0;
        } else {
            focusState.ai.remainingSec = focusState.ai.durationSec;
            focusState.ai.startRemainingSec = focusState.ai.remainingSec;
        }
    }
    saveFocusState();
    syncFocusUI();
  }

  async function generateAiFocusActivity() {
    // 收集最近20条消息作为聊天上下文
    const recentMsgs = messages.slice(-20)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => `[${m.role === 'user' ? '用户' : '角色'}] ${m.content}`)
        .join('\n');

    const prompt = `你是一个角色扮演AI，请根据以下信息推荐一个专注活动名称和时长（分钟）。
  近期聊天记录：
  ${recentMsgs || '无'}

  你的角色设定：
  - 姓名：${charNameInput.value}
  - 性格：${charPersonalityInput.value}
  - 经历：${charBackstoryInput.value}
  - 当前用户的活动是：${focusState.user.activity}（${focusState.user.durationSec ? Math.round(focusState.user.durationSec/60) + '分钟' : '未设置'}）

  请综合考虑：
  - 如果近期聊天中提到了具体的活动（如阅读、运动、写作等），优先采用（约50%权重）。
  - 其次基于角色设定、习惯推荐合适的活动（45%权重）。
  - 极少数情况下可以模仿用户的活动（5%权重）。

  返回严格JSON格式，不要任何其他文字：
  {"activity":"活动名称","minutes":数字}

  活动名称应简短（2-4字），分钟数在10-180之间。`;

    const reply = await callAI(prompt, '你是一个专注活动推荐助手，只输出JSON。');
    try {
        const json = JSON.parse(reply.trim());
        if (json.activity && typeof json.minutes === 'number') {
            return {
                activity: json.activity,
                minutes: Math.max(10, Math.min(180, json.minutes))
            };
        }
    } catch(e) {}
    // 后备
    return {
        activity: '陪你专注',
        minutes: 25
    };
  }

  function sendFocusEndMessage() {
    // 当对方自主完成专注时，添加带时间的分割线标识
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    // 添加分割线消息，标记为 reset 类型
    messages.push({
      role: 'assistant',
      content: `对方专注结束 · ${timeStr}`,
      timestamp: Date.now(),
      isReset: true
    });
    saveMessagesToStorage();
    renderMessages();
  }

  function setUserFocusActivity(activity) {
    focusState.user.activity = (activity || '').trim() || '专注';
    saveFocusState();
    syncFocusUI();
  }

  function setUserFocusMinutes(minutes) {
    const m = Math.max(1, Math.min(180, Number(minutes) || 25)); // 限制最大180分钟
    stopUserFocus();
    focusState.user.durationSec = Math.round(m * 60);
    if (focusState.user.mode === 'up') {
      focusState.user.elapsedSec = 0;
      focusState.user.startElapsedSec = 0;
    } else {
      focusState.user.remainingSec = focusState.user.durationSec;
      focusState.user.startRemainingSec = focusState.user.remainingSec;
    }
    saveFocusState();
    syncFocusUI();
  }

  function setUserFocusMode(mode) {
    const next = mode === 'up' ? 'up' : 'down';
    if (focusState.user.mode === next) return;
    stopUserFocus();
    focusState.user.mode = next;
    resetUserFocus();
    saveFocusState();
    syncFocusUI();
  }

  function openFocusSettingsDialog() {
    const activitySelectId = 'focusActivitySelectModal';
    const activityCustomId = 'focusActivityCustomModal';
    const minutesId = 'focusMinutesModal';

    // 根据正计时/倒计时决定是否显示时间设置
    const showMinutes = focusState.user.mode !== 'up';

    const body = `
      <div class="config-group">
        <label>我的活动</label>
        <select id="${activitySelectId}">
          <option value="学习">学习</option>
          <option value="阅读">阅读</option>
          <option value="写作">写作</option>
          <option value="工作">工作</option>
          <option value="运动">运动</option>
          <option value="冥想">冥想</option>
          <option value="自定义">自定义…</option>
        </select>
        <input type="text" id="${activityCustomId}" class="hidden" placeholder="输入自定义活动…">
      </div>
      ${showMinutes ? `
      <div class="config-group" id="focusMinutesGroup">
        <label>我的时间（分钟）</label>
        <input type="number" id="${minutesId}" min="1" max="180">
      </div>` : ''}
      <div class="mt-8 fs-13 text-secondary">对方专注请在主界面"邀请对方一起"中设置。</div>
    `;

    showCommonDialog({
        title: '专注设置',
        customBody: body,
        confirmText: '保存',
        onConfirm: () => {
            const sel = document.getElementById(activitySelectId);
            const custom = document.getElementById(activityCustomId);
            const mins = Number(document.getElementById(minutesId)?.value || 25);
            const activity = (sel?.value === '自定义' ? (custom?.value || '') : (sel?.value || '')).trim();

            setUserFocusActivity(activity || '专注');
            if (showMinutes) setUserFocusMinutes(mins);

            saveFocusState();
            syncFocusUI();
        }
    });

    setTimeout(() => {
        const sel = document.getElementById(activitySelectId);
        const custom = document.getElementById(activityCustomId);
        const minsEl = document.getElementById(minutesId);

        const presets = ['学习','阅读','写作','工作','运动','冥想'];
        const currentActivity = (focusState.user.activity || '').trim();
        const matched = presets.includes(currentActivity);
        if (sel) sel.value = matched ? currentActivity : '自定义';
        if (custom) {
            custom.classList.toggle('hidden', matched);
            custom.value = matched ? '' : currentActivity;
        }
        if (minsEl) minsEl.value = String(Math.max(1, Math.round((focusState.user.durationSec || 1500) / 60)));

        sel?.addEventListener('change', () => {
            if (!custom) return;
            const isCustom = sel.value === '自定义';
            custom.classList.toggle('hidden', !isCustom);
            if (isCustom) custom.focus();
        });
    }, 0);
  }

  function openAiInviteDialog({ autoGenerate = false, onCancel = null } = {}) {
    const aiActivityId = 'aiInviteActivityInput';
    const aiMinutesId = 'aiInviteMinutesInput';
    const aiSuggestedTimeDisplayId = 'aiInviteTimeDisplay';
    const aiSuggestBtnId = 'aiInviteSuggestBtn';

    // 正计时模式下不显示时间输入框
    const showMinutes = focusState.user.mode !== 'up';

    const body = `
      <div class="config-group">
        <label>对方活动（可手动修改）</label>
        <input type="text" id="${aiActivityId}" placeholder="例如：陪你专注 / 看书 / 写作">
        <button class="btn btn-sm btn-secondary mt-8" id="${aiSuggestBtnId}" type="button"><i class="fas fa-magic"></i> AI 生成</button>
      </div>
      ${showMinutes ? `
      <div class="config-group">
        <label>对方时间（分钟）</label>
        <input type="number" id="${aiMinutesId}" min="1" max="180">
      </div>
      <div class="mt-8 fs-13 text-secondary" id="${aiSuggestedTimeDisplayId}">对方预计时长：未设置</div>
      ` : ''}
    `;

    showCommonDialog({
      title: '对方专注',
      customBody: body,
      confirmText: '确认',
      onConfirm: () => {
        const aiActivity = (document.getElementById(aiActivityId)?.value || '').trim() || '陪你专注';
        const aiMinsRaw = Number(document.getElementById(aiMinutesId)?.value || 25);
        const aiMins = Math.max(1, Math.min(180, aiMinsRaw || 25));

        focusState.ai.enabled = true;
        focusState.ai.locked = false;
        focusState.ai.running = false;
        focusState.ai.lastStartTs = 0;
        focusState.ai.mode = focusState.user.mode;
        focusState.ai.activity = aiActivity;
        // 正计时模式下时间框不存在，使用当前已存的时长或默认
        if (showMinutes) {
          focusState.ai.durationSec = Math.round(aiMins * 60);
        } else {
          if (!focusState.ai.durationSec || focusState.ai.durationSec <= 0) {
            focusState.ai.durationSec = 25 * 60;
          }
        }
        if (focusState.ai.mode === 'up') {
          focusState.ai.elapsedSec = 0;
          focusState.ai.startElapsedSec = 0;
        } else {
          focusState.ai.remainingSec = focusState.ai.durationSec;
          focusState.ai.startRemainingSec = focusState.ai.remainingSec;
        }

        saveFocusState();
        syncFocusUI();
      }
    });

    const closeAndCancel = () => {
      commonDialogOverlay.classList.remove('show');
      if (onCancel) onCancel();
    };
    dialogCancelBtn.onclick = closeAndCancel;
    closeCommonDialog.onclick = closeAndCancel;
    commonDialogOverlay.onclick = (e) => { if (e.target === commonDialogOverlay) closeAndCancel(); };

    setTimeout(() => {
      const actEl = document.getElementById(aiActivityId);
      const minsEl = document.getElementById(aiMinutesId);
      const timeDisplay = document.getElementById(aiSuggestedTimeDisplayId);
      const suggestBtn = document.getElementById(aiSuggestBtnId);

      if (actEl) actEl.value = (focusState.ai.activity || '').trim();
      if (minsEl) minsEl.value = String(Math.max(1, Math.round((focusState.ai.durationSec || 1500) / 60)));
      if (timeDisplay) {
        const mins = focusState.ai.durationSec ? Math.round(focusState.ai.durationSec / 60) : null;
        timeDisplay.textContent = mins ? `对方预计时长：${mins} 分钟` : '对方预计时长：未设置';
      }

      const runSuggest = async () => {
        if (!actEl) return;
        if (suggestBtn) suggestBtn.disabled = true;
        actEl.disabled = true;
        const oldVal = actEl.value;
        actEl.value = '生成中…';
        try {
          const result = await generateAiFocusActivity();
          if (result) {
            actEl.value = result.activity;
            if (minsEl) minsEl.value = String(result.minutes);
            if (timeDisplay) timeDisplay.textContent = `对方预计时长：${result.minutes} 分钟`;
          } else {
            actEl.value = oldVal || '陪你专注';
          }
        } catch (e) {
          actEl.value = oldVal || '陪你专注';
          if (minsEl) minsEl.value = '25';
          if (timeDisplay) timeDisplay.textContent = '对方预计时长：25 分钟';
        } finally {
          actEl.disabled = false;
          if (suggestBtn) suggestBtn.disabled = false;
        }
      };

      if (suggestBtn) suggestBtn.addEventListener('click', runSuggest);

      const shouldAuto = autoGenerate || !(focusState.ai.activity || '').trim() || !focusState.ai.durationSec;
      if (shouldAuto) runSuggest();
    }, 0);
  }

  // ---------- 通用弹窗逻辑 ----------
  function showCommonDialog({ title = '提示', message = '', customBody = '', confirmText = '确定', cancelText = '取消', showCancel = true, onConfirm = null }) {
    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    dialogMessage.style.display = message ? 'block' : 'none';
    dialogCustomBody.innerHTML = customBody;
    dialogConfirmBtn.textContent = confirmText;
    dialogCancelBtn.textContent = cancelText;
    dialogCancelBtn.style.display = showCancel ? 'inline-block' : 'none';

    commonDialogOverlay.classList.add('show');

    const close = () => { commonDialogOverlay.classList.remove('show'); };

    dialogConfirmBtn.onclick = () => {
      if (onConfirm) onConfirm();
      close();
    };
    dialogCancelBtn.onclick = close;
    closeCommonDialog.onclick = close;
    commonDialogOverlay.onclick = (e) => { if (e.target === commonDialogOverlay) close(); };
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
        showCommonDialog({
          title: '导入数据',
          message: '导入将覆盖当前所有数据，确定继续吗？',
          confirmText: '确定导入',
          onConfirm: () => {
            localStorage.clear();
            Object.entries(data).forEach(([k,v])=>localStorage.setItem(k,v));
            alert('导入成功，页面将刷新。');
            location.reload();
          }
        });
      } catch(err) { alert('导入失败：'+err.message); }
    };
    reader.readAsText(file);
  }

  // ---------- 初始化 ----------
  async function init() {
    loadTheme();
    loadConfigFromStorage();
    loadCharacterFromStorage();
    loadLearnedTraits();
    loadProfile();
    loadUserImages();
    loadFocusState();
    await loadFocusAnimData();   // IndexedDB 异步读取
    normalizeFocusAfterLoad();
    renderMessages();
    buildChatPreferencesUI();
    renderLearnedTraits();
    syncFocusUI();
    if (focusState.user.running || (focusState.ai.enabled && focusState.ai.running)) ensureFocusTicker();

    if (themeToggleSettings) themeToggleSettings.addEventListener('click', toggleTheme);
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); handleSendMessage(); } });
    messageInput.addEventListener('input', ()=>{ messageInput.style.height='auto'; messageInput.style.height=Math.min(messageInput.scrollHeight,120)+'px'; });
    configBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    globalMenuBtn?.addEventListener('click', toggleSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);
    sidebar?.addEventListener('click', (e) => {
      const icon = e.target.closest('.sidebar-icon');
      const avatar = e.target.closest('#userAvatarBtn');
      if (icon || avatar) closeSidebar();
    });

    // ===== 快速回到底部按钮 =====
    const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    if (messagesArea && scrollToBottomBtn) {
      // 滚动监听：距离底部超过 120px 时显示按钮
      messagesArea.addEventListener('scroll', () => {
        const distFromBottom = messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight;
        if (distFromBottom > 120) {
          scrollToBottomBtn.classList.add('visible');
          scrollToBottomBtn.style.display = '';
        } else {
          scrollToBottomBtn.classList.remove('visible');
          // 动画结束后再 display:none，防止闪烁
          setTimeout(() => {
            if (!scrollToBottomBtn.classList.contains('visible')) {
              scrollToBottomBtn.style.display = 'none';
            }
          }, 260);
        }
      });
      // 点击回到底部
      scrollToBottomBtn.addEventListener('click', () => {
        messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
      });
    }
    saveConfigBtn.addEventListener('click', ()=>{ applyConfig(); closeDrawer(); });
    testConnectionBtn.addEventListener('click', testConnection);
    clearChatBtn.addEventListener('click', ()=>{
      showCommonDialog({
        title: '清空对话',
        message: '确定要清空所有对话记录吗？此操作不可撤销。',
        confirmText: '清空',
        onConfirm: () => resetConversation()
      });
    });
    apiProviderSelect.addEventListener('change', () => {
      updateApiUrlFromProvider();
      updateModelVisibility();
    });
    modelSelect.addEventListener('change', updateModelInputFromSelect);

    chatIcon.addEventListener('click', ()=>setActiveView('chat'));
    gearIcon.addEventListener('click', ()=>setActiveView('settings'));
    userAvatarBtn.addEventListener('click', ()=>setActiveView('profile'));
    focusIcon?.addEventListener('click', ()=>setActiveView('focus'));
    characterIcon.addEventListener('click', ()=>setActiveView('character'));
    dataManagerIcon.addEventListener('click', ()=>setActiveView('data'));

    focusSettingsBtn?.addEventListener('click', openFocusSettingsDialog);
    focusModeToggle?.addEventListener('click', () => {
      focusModeToggle.classList.toggle('active');
      setUserFocusMode(focusModeToggle.classList.contains('active') ? 'up' : 'down');
    });
    // 开始按钮：三态切换（开始 → 暂停 → 继续）
    focusStartBtn?.addEventListener('click', () => {
      if (focusState.user.running) {
        stopUserFocus();
      } else {
        startUserFocus();
      }
    });
    focusResetBtn?.addEventListener('click', endUserFocus);
    // 结束对方专注
    endAiFocusBtn?.addEventListener('click', () => {
      endAiFocus();
    });
    inviteToggleMain?.addEventListener('click', () => {
      const enabling = !focusState.ai.enabled;
      if (!enabling) {
        focusState.ai.enabled = false;
        focusState.ai.running = false;
        focusState.ai.locked = false;
        saveFocusState();
        syncFocusUI();
        return;
      }

      inviteToggleMain.classList.add('active');
      openAiInviteDialog({
        autoGenerate: true,
        onCancel: () => {
          inviteToggleMain.classList.remove('active');
          focusState.ai.enabled = false;
          focusState.ai.running = false;
          focusState.ai.locked = false;
          saveFocusState();
          syncFocusUI();
        }
      });
    });
    editAiFocusBtn?.addEventListener('click', () => {
      if (!focusState.ai.enabled || focusState.ai.locked) return;
      openAiInviteDialog({ autoGenerate: false });
    });

    saveCharacterBtn.addEventListener('click', saveCharacterToStorage);
    resetCharacterBtn.addEventListener('click', ()=>{
      showCommonDialog({
        title: '重置设定',
        message: '确定要重置所有人物设定吗？',
        confirmText: '重置',
        onConfirm: () => {
          localStorage.removeItem('character_data');
          localStorage.removeItem('learned_traits');
          characterData = { worldBook:'',name:'',avatar:'',cover:'',bio:'',age:'',gender:'',appearance:'',personality:'',backstory:'',memories:'',style:'',examples:'' };
          learnedTraits = [];
          loadCharacterFromStorage();
          renderLearnedTraits();
        }
      });
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

    // ===== 清除所有数据按钮 =====
    document.getElementById('clearAllDataBtn')?.addEventListener('click', openClearAllConfirm);

    setTimeout(refreshStorageStats, 100);
    initUploadButtons();
    updateCharacterPreview();
    updateModelVisibility();

    // 批量发送相关
    const closeBatchModal = () => { batchSendModalOverlay.classList.remove('show'); };
    const handleBatchSend = () => {
      const content = batchMessageInput.value.trim();
      if (!content) return;
      const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length > 0) {
        handleSendMessage(lines);
        batchMessageInput.value = '';
        closeBatchModal();
      }
    };

    batchSendBtn?.addEventListener('click', () => {
      batchSendModalOverlay.classList.add('show');
      batchMessageInput.focus();
    });
    closeBatchSendModal?.addEventListener('click', closeBatchModal);
    cancelBatchSendBtn?.addEventListener('click', closeBatchModal);
    batchSendModalOverlay?.addEventListener('click', (e) => {
      if(e.target === batchSendModalOverlay) closeBatchModal();
    });
    confirmBatchSendBtn?.addEventListener('click', handleBatchSend);

    // ===== 专注动画自定义按钮 =====
    document.getElementById('focusAnimCustomizeBtn')?.addEventListener('click', openFocusAnimManager);

    // 占位区快速上传按钮（默认上传用户动画）
    document.getElementById('focusAnimQuickUploadBtn')?.addEventListener('click', e => {
      e.stopPropagation();
      triggerFocusAnimUpload('user');
    });
  }

  // ============================================================
  // ===== IndexedDB 动画存储系统 =====
  // 替代 localStorage，突破 5MB 限制，支持存储更大文件
  // ============================================================
  
  const DB_NAME = 'focus_anim_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'anims';
  let dbInstance = null;

  function openAnimDB() {
    return new Promise((resolve, reject) => {
      if (dbInstance) { resolve(dbInstance); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance); };
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  /** 保存动画数据到 IndexedDB */
  async function saveAnimToDB(id, data) {
    const db = await openAnimDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ id, data, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** 从 IndexedDB 读取所有动画数据 */
  async function loadAnimsFromDB() {
    const db = await openAnimDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /** 删除单个动画 */
  async function deleteAnimFromDB(id) {
    const db = await openAnimDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** 清除所有动画数据 */
  async function clearAnimsFromDB() {
    const db = await openAnimDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** 获取 IndexedDB 总存储用量（估算） */
  async function getAnimDBUsage() {
    try {
      const animes = await loadAnimsFromDB();
      let total = 0;
      animes.forEach(a => {
        total += a.data.library ? JSON.stringify(a.data.library).length : 0;
      });
      return { count: animes.length, size: total };
    } catch(e) { return { count: 0, size: 0 }; }
  }

  // ============================================================
  // ===== 专注动画系统 v2 =====
  // ============================================================
  //
  // 3个分类: user=用户专注 / character=AI角色专注 / duo=双人
  // 双人模式: duoMode='single'(播一个双人GIF) | 'dual'(同时播两个单人GIF)
  // 匹配逻辑: 谁在专注就播放谁的动画
  //

  let focusAnimLibrary  = { user: [], character: [], duo: [] };
  let focusAnimSelected = { user: null, character: null, duo: null };
  let focusAnimDuoMode  = 'single'; // 'single' | 'dual'

  // ===== AI学习词条系统 =====
  let learnedTraits = []; // { id, text, selected, timestamp }

  function loadLearnedTraits() {
    try {
      const raw = localStorage.getItem('learned_traits');
      if (raw) learnedTraits = JSON.parse(raw);
    } catch(e) {}
  }

  function saveLearnedTraits() {
    localStorage.setItem('learned_traits', JSON.stringify(learnedTraits));
  }

  function renderLearnedTraits() {
    const container = document.getElementById('learnedTraitsContainer');
    const countEl = document.getElementById('learnedTraitsCount');
    if (!container) return;

    if (learnedTraits.length === 0) {
      container.innerHTML = '<div class="learned-traits-empty text-secondary fs-13">暂无AI学习的词条</div>';
      if (countEl) countEl.textContent = '（0/5）';
      return;
    }

    container.innerHTML = '';
    learnedTraits.forEach(trait => {
      const tag = document.createElement('div');
      tag.className = 'learned-trait-tag' + (trait.selected ? ' selected' : '');
      tag.innerHTML = `
        <span class="trait-text" title="${trait.text}">${trait.text}</span>
        <span class="trait-remove" title="删除">×</span>
      `;
      tag.querySelector('.trait-text').addEventListener('click', () => {
        trait.selected = !trait.selected;
        saveLearnedTraits();
        renderLearnedTraits();
        updateStyleFromTraits();
      });
      tag.querySelector('.trait-remove').addEventListener('click', e => {
        e.stopPropagation();
        learnedTraits = learnedTraits.filter(t => t.id !== trait.id);
        saveLearnedTraits();
        renderLearnedTraits();
        updateStyleFromTraits();
      });
      container.appendChild(tag);
    });

    if (countEl) countEl.textContent = `（${learnedTraits.length}/5）`;
  }

  function updateStyleFromTraits() {
    if (!charStyleInput) return;
    // 获取用户手动输入的风格描述（非AI学习部分）
    const manualStyle = charStyleInput.value.split('* AI学习：').filter((_, i) => i === 0)[0] || charStyleInput.value;
    const manualLines = manualStyle.split('\n').filter(l => l.trim());
    // 获取选中的词条
    const selectedTraits = learnedTraits.filter(t => t.selected).map(t => `* AI学习：${t.text}`);
    const allLines = [...manualLines.filter(l => l.trim()), ...selectedTraits].filter(l => l.trim());
    charStyleInput.value = allLines.join('\n');
    saveCharacterToStorage();
  }

  async function summarizeTraitsToStyle() {
    if (learnedTraits.length < 5) return;
    const traitsText = learnedTraits.map(t => t.text).join('\n');
    try {
      const prompt = `请将以下5条对话风格词条总结为1条综合的对话风格描述：

${traitsText}

要求：
1. 保留核心要点，去除冗余
2. 简洁明了，直接以指令形式输出
3. 不要输出其他废话`;

      const result = await callAI(prompt, "你是一个对话风格分析助手。");
      if (result && result.trim()) {
        // 清空词条
        learnedTraits = [];
        saveLearnedTraits();
        renderLearnedTraits();
        // 添加总结结果
        learnedTraits.push({
          id: 'trait_' + Date.now(),
          text: result.trim(),
          selected: true,
          timestamp: Date.now()
        });
        saveLearnedTraits();
        renderLearnedTraits();
        updateStyleFromTraits();
      }
    } catch(e) {
      console.error('Summarize traits error:', e);
    }
  }

  /** 异步加载动画数据（优先 IndexedDB，兼容旧 localStorage） */
  async function loadFocusAnimData() {
    try {
      // 优先从 IndexedDB 加载
      const dbRecords = await loadAnimsFromDB();
      if (dbRecords.length > 0) {
        const latest = dbRecords.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        if (latest.data) {
          focusAnimLibrary  = latest.data.library  || { user: [], character: [], duo: [] };
          focusAnimSelected = latest.data.selected || { user: null, character: null, duo: null };
          focusAnimDuoMode  = latest.data.duoMode || 'single';
          return;
        }
      }
      // 兼容旧 localStorage 数据（首次迁移）
      const raw = localStorage.getItem('focus_anim_data');
      if (raw) {
        const data = JSON.parse(raw);
        focusAnimLibrary  = data.library  || { user: [], character: [], duo: [] };
        focusAnimSelected = data.selected || { user: null, character: null, duo: null };
        focusAnimDuoMode  = data.duoMode || 'single';
        // 迁移到 IndexedDB
        await saveFocusAnimData();
        localStorage.removeItem('focus_anim_data');
      }
    } catch(e) {
      console.error('Load anim data error:', e);
    }
  }

  /** 异步保存动画数据到 IndexedDB */
  async function saveFocusAnimData() {
    try {
      const data = {
        library:  focusAnimLibrary,
        selected: focusAnimSelected,
        duoMode:  focusAnimDuoMode
      };
      await saveAnimToDB('main', data);
      // 清理旧 localStorage
      localStorage.removeItem('focus_anim_data');
    } catch(e) {
      console.error('Save anim data error:', e);
      // 降级：仍尝试存 localStorage（可能存不下）
      try {
        localStorage.setItem('focus_anim_data', JSON.stringify({
          library:  focusAnimLibrary,
          selected: focusAnimSelected,
          duoMode:  focusAnimDuoMode
        }));
      } catch(e2) {
        console.error('localStorage also failed:', e2);
      }
    }
  }

  /** 取某个分类当前选中动画的src，没有则自动选第一个 */
  function getAnimSrc(category) {
    const list = focusAnimLibrary[category] || [];
    let id = focusAnimSelected[category];
    if (!id && list.length > 0) {
      id = list[0].id;
      focusAnimSelected[category] = id;
    }
    if (!id) return null;
    const found = list.find(a => a.id === id);
    return found ? found.src : (list[0] ? (focusAnimSelected[category] = list[0].id, list[0].src) : null);
  }

  /** 根据专注状态决定显示哪些动画 */
  function syncFocusAnim() {
    const placeholder  = document.getElementById('focusAnimPlaceholder');
    const singleVideo   = document.getElementById('focusAnimSingle');
    const duoContainer  = document.getElementById('focusAnimDuoContainer');
    const duoUserVideo  = document.getElementById('focusAnimDuoUser');
    const duoCharVideo  = document.getElementById('focusAnimDuoChar');
    if (!placeholder || !singleVideo || !duoContainer) return;

    const userRunning = !!focusState.user.running;
    const charRunning = !!(focusState.ai.enabled && focusState.ai.running);
    const bothRunning = userRunning && charRunning;

    // 无人在专注：停止所有动画
    if (!userRunning && !charRunning) {
      stopAndHide(singleVideo);
      stopAndHide(duoUserVideo);
      stopAndHide(duoCharVideo);
      duoContainer.style.display = 'none';
      placeholder.style.display = 'none';
      return;
    }

    // === 双人均专注 ===
    if (bothRunning) {
      stopAndHide(singleVideo); // 停止单人视频
      duoContainer.style.display = 'flex';
      placeholder.style.display = 'none';
      if (focusAnimDuoMode === 'single') {
        const src = getAnimSrc('duo');
        if (src) {
          showDuoSingle(src);
        } else {
          showDuoDual();
        }
      } else {
        showDuoDual();
      }
      return;
    }

    // === 单人专注 ===
    duoContainer.style.display = 'none';
    const src = userRunning ? getAnimSrc('user') : getAnimSrc('character');
    if (src) {
      loadAndPlay(singleVideo, src);
      placeholder.style.display = 'none';
    } else {
      stopAndHide(singleVideo);
      placeholder.style.display = 'flex';
    }
  }

  /** 隐藏动画元素并清空 src */
  function stopAndHide(el) {
    if (!el) return;
    el.src = '';
    el.style.display = 'none';
  }

  /** 显示动画（img.src 直接赋值，GIF/PNG/WEBP 全支持） */
  function loadAndPlay(el, src) {
    if (!el || !src) return;
    // 已经在显示同一张，不重复赋值
    if (el.src === src) {
      el.style.display = 'block';
      return;
    }
    el.src = src;
    el.style.display = 'block';
  }

  function showDuoDual() {
    const duoContainer = document.getElementById('focusAnimDuoContainer');
    const duoUserEl    = document.getElementById('focusAnimDuoUser');
    const duoCharEl    = document.getElementById('focusAnimDuoChar');
    duoContainer.style.display = 'flex';
    const userRunning = !!focusState.user.running;
    const charRunning = !!(focusState.ai.enabled && focusState.ai.running);
    if (userRunning) {
      const src = getAnimSrc('user');
      if (src) loadAndPlay(duoUserEl, src); else stopAndHide(duoUserEl);
    } else {
      stopAndHide(duoUserEl);
    }
    if (charRunning) {
      const src = getAnimSrc('character');
      if (src) loadAndPlay(duoCharEl, src); else stopAndHide(duoCharEl);
    } else {
      stopAndHide(duoCharEl);
    }
  }

  function showDuoSingle(duoSrc) {
    const duoContainer = document.getElementById('focusAnimDuoContainer');
    const duoUserEl    = document.getElementById('focusAnimDuoUser');
    const duoCharEl    = document.getElementById('focusAnimDuoChar');
    duoContainer.style.display = 'flex';
    loadAndPlay(duoUserEl, duoSrc);
    stopAndHide(duoCharEl);
  }



  /**
   * 压缩图片到指定大小（仅限非 GIF，GIF 直接存原文件）
   * 目标：<2MB，quality 逐步降低直到满足要求
   */
  function compressImageFile(file) {
    return new Promise(resolve => {
      // GIF 无法通过 Canvas 保留动画，直接原样返回
      if (file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
        return;
      }
      // 其他格式（PNG/JPEG/WEBP）用 Canvas 压缩
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_PX = 1200; // 最长边限制
        let { width, height } = img;
        if (width > MAX_PX || height > MAX_PX) {
          const ratio = Math.min(MAX_PX / width, MAX_PX / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        // 逐级降低质量，目标 2MB dataURL（约 1.5MB 原文件）
        const TARGET = 2 * 1024 * 1024;
        let quality = 0.9;
        let dataURL;
        do {
          dataURL = canvas.toDataURL('image/webp', quality);
          quality -= 0.1;
        } while (dataURL.length > TARGET && quality > 0.1);

        resolve(dataURL);
      };
      img.onerror = () => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      };
      img.src = url;
    });
  }

  /** 直接触发上传到指定分类（无大小限制，自动压缩非GIF图片） */
  function triggerFocusAnimUpload(category) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/gif,image/png,image/jpeg,image/webp,image/apng';
    inp.multiple = true;
    inp.onchange = async e => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      for (const file of files) {
        const isGif = file.type === 'image/gif';
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        // GIF 超过 10MB 给提示，但还是允许存（IndexedDB 能承受）
        if (isGif && file.size > 10 * 1024 * 1024) {
          const ok = confirm(`GIF "${file.name}"（${sizeMB}MB）较大，可能加载较慢。\n继续添加？`);
          if (!ok) continue;
        }

        // 自动压缩（非GIF）或直接读取（GIF）
        const src = await compressImageFile(file);
        const id = 'anim_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const entry = { id, name: file.name.replace(/\.[^.]+$/, ''), src };
        if (!focusAnimLibrary[category]) focusAnimLibrary[category] = [];
        focusAnimLibrary[category].push(entry);
        if (focusAnimSelected[category] === null) focusAnimSelected[category] = id;
      }

      await saveFocusAnimData();
      renderFocusAnimGrid();
      syncFocusAnim();
    };
    inp.click();
  }

  // ---------- 动画管理弹窗 ----------
  let focusAnimManagerTab = 'user';

  function openFocusAnimManager() {
    let overlay = document.getElementById('focusAnimManagerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'focusAnimManagerOverlay';
      overlay.className = 'modal-overlay focus-anim-modal';
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h3><i class="fas fa-images mr-8"></i>专注动画管理</h3>
            <button class="modal-close" id="closeFocusAnimModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="focus-anim-tabs" id="focusAnimTabs">
              <button class="focus-anim-tab active" data-cat="user">用户动画</button>
              <button class="focus-anim-tab" data-cat="character">角色动画</button>
              <button class="focus-anim-tab" data-cat="duo">双人动画</button>
            </div>
            <div class="focus-anim-grid" id="focusAnimGrid"></div>
            <!-- 双人模式切换（仅在双人tab时显示） -->
            <div class="focus-anim-duo-toggle" id="focusAnimDuoToggle" style="display:none;">
              <div class="focus-anim-duo-mode-label">双人模式</div>
              <div class="focus-anim-mode-btns">
                <button class="focus-anim-mode-btn active" id="duoModeSingleBtn" data-mode="single">
                  <i class="fas fa-user-friends mr-4"></i>一个双人GIF
                </button>
                <button class="focus-anim-mode-btn" id="duoModeDualBtn" data-mode="dual">
                  <i class="fas fa-columns mr-4"></i>两个单人GIF并排
                </button>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="closeFocusAnimModalBtn">关闭</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const close = () => overlay.classList.remove('show');
      overlay.querySelector('#closeFocusAnimModal').addEventListener('click', close);
      overlay.querySelector('#closeFocusAnimModalBtn').addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

      // tab 切换
      overlay.querySelector('#focusAnimTabs').addEventListener('click', e => {
        const tab = e.target.closest('[data-cat]');
        if (!tab) return;
        focusAnimManagerTab = tab.dataset.cat;
        overlay.querySelectorAll('.focus-anim-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === focusAnimManagerTab));
        renderFocusAnimGrid();
        // 显示/隐藏双人模式切换器
        const toggle = document.getElementById('focusAnimDuoToggle');
        if (toggle) {
          toggle.style.display = focusAnimManagerTab === 'duo' ? 'flex' : 'none';
          document.getElementById('duoModeSingleBtn')?.classList.toggle('active', focusAnimDuoMode === 'single');
          document.getElementById('duoModeDualBtn')?.classList.toggle('active', focusAnimDuoMode === 'dual');
        }
      });

      // 双人模式切换
      overlay.querySelector('#focusAnimDuoToggle').addEventListener('click', async e => {
        const btn = e.target.closest('[data-mode]');
        if (!btn) return;
        focusAnimDuoMode = btn.dataset.mode;
        await saveFocusAnimData();
        syncFocusAnim();
        overlay.querySelectorAll('.focus-anim-mode-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.mode === focusAnimDuoMode);
        });
      });
    }

    focusAnimManagerTab = 'user';
    overlay.querySelectorAll('.focus-anim-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'user'));
    renderFocusAnimGrid();

    const toggle = document.getElementById('focusAnimDuoToggle');
    if (toggle) {
      toggle.style.display = 'none';
    }

    overlay.classList.add('show');
  }

  function renderFocusAnimGrid() {
    const grid = document.getElementById('focusAnimGrid');
    if (!grid) return;
    const cat = focusAnimManagerTab;
    const list = focusAnimLibrary[cat] || [];
    const selectedId = focusAnimSelected[cat];

    grid.innerHTML = '';

    const catLabel = { user: '用户动画', character: '角色动画', duo: '双人动画' }[cat] || '动画';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'focus-anim-empty';
      empty.innerHTML = `<i class="fas fa-film fa-2x mb-8" style="display:block;opacity:0.3;"></i>暂无${catLabel}，点击 + 上传`;
      grid.appendChild(empty);
    } else {
      list.forEach(anim => {
        const item = document.createElement('div');
        item.className = 'focus-anim-item' + (anim.id === selectedId ? ' selected' : '');
        item.title = anim.name;

        const imgEl = document.createElement('img');
        imgEl.src = anim.src;
        imgEl.alt = anim.name;

        const delBtn = document.createElement('button');
        delBtn.className = 'focus-anim-item-del';
        delBtn.title = '删除';
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', async e => {
          e.stopPropagation();
          focusAnimLibrary[cat] = focusAnimLibrary[cat].filter(a => a.id !== anim.id);
          if (focusAnimSelected[cat] === anim.id) focusAnimSelected[cat] = null;
          await saveFocusAnimData();
          syncFocusAnim();
          renderFocusAnimGrid();
        });

        item.appendChild(imgEl);
        item.appendChild(delBtn);
        item.addEventListener('click', async () => {
          focusAnimSelected[cat] = anim.id;
          await saveFocusAnimData();
          syncFocusAnim();
          renderFocusAnimGrid();
        });

        grid.appendChild(item);
      });
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'focus-anim-add-btn';
    addBtn.title = '上传动画（GIF/图片，自动压缩）';
    addBtn.innerHTML = '<i class="fas fa-plus"></i>';
    addBtn.addEventListener('click', () => {
      triggerFocusAnimUpload(cat);
    });
    grid.appendChild(addBtn);
  }

  // ============================================================
  // ===== 清除所有数据确认弹窗 =====
  // ============================================================
  let clearConfirmStep = 1;

  function openClearAllConfirm() {
    let overlay = document.getElementById('clearAllConfirmOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'clearAllConfirmOverlay';
      overlay.className = 'modal-overlay clear-confirm-modal';
      document.body.appendChild(overlay);
    }

    function renderStep(step) {
      clearConfirmStep = step;
      if (step === 1) {
        overlay.innerHTML = `
          <div class="modal-container">
            <div class="modal-header">
              <h3><i class="fas fa-exclamation-triangle mr-8" style="color:#e05555;"></i>确认清除</h3>
              <button class="modal-close" onclick="closeClearConfirm()">&times;</button>
            </div>
            <div class="modal-body">
              <div class="clear-confirm-icon"><i class="fas fa-skull-crossbones"></i></div>
              <p class="clear-confirm-text">
                确定要清除 <strong>所有本地数据</strong> 吗？<br>
                包括：消息记录、角色设定、专注数据、上传的动画等。<br>
                此操作 <strong>不可恢复</strong>。
              </p>
              <button class="btn btn-danger-outline w-full" id="clearConfirmStep2Btn">
                <i class="fas fa-arrow-right mr-6"></i>是的，继续
              </button>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary w-full" onclick="closeClearConfirm()">取消</button>
            </div>
          </div>
        `;
        overlay.querySelector('#clearConfirmStep2Btn').addEventListener('click', () => renderStep(2));
      } else {
        overlay.innerHTML = `
          <div class="modal-container">
            <div class="modal-header">
              <h3><i class="fas fa-skull-crossbones mr-8" style="color:#e05555;"></i>最后确认</h3>
              <button class="modal-close" onclick="closeClearConfirm()">&times;</button>
            </div>
            <div class="modal-body">
              <div class="clear-confirm-icon"><i class="fas fa-fire-alt"></i></div>
              <p class="clear-confirm-text">
                如果你确定要清除一切，<br>请在下方输入 <strong>我确认</strong> 并点击删除。
              </p>
              <input type="text" id="clearConfirmInput" class="modal-input" placeholder="请输入：我确认" autocomplete="off">
            </div>
            <div class="modal-footer" style="flex-direction:column;gap:8px;">
              <button class="btn btn-danger-solid w-full" id="clearConfirmExecuteBtn" disabled>
                <i class="fas fa-trash-alt mr-6"></i>删除所有数据
              </button>
              <button class="btn btn-secondary w-full" onclick="closeClearConfirm()">取消</button>
            </div>
          </div>
        `;
        const inp = overlay.querySelector('#clearConfirmInput');
        const execBtn = overlay.querySelector('#clearConfirmExecuteBtn');
        inp.addEventListener('input', () => {
          execBtn.disabled = inp.value.trim() !== '我确认';
        });
        execBtn.addEventListener('click', executeClearAllData);
      }
      overlay.classList.add('show');
    }

    window.closeClearConfirm = () => overlay.classList.remove('show');
    overlay.onclick = e => { if (e.target === overlay) window.closeClearConfirm(); };
    renderStep(1);
  }

  function executeClearAllData() {
    localStorage.clear();
    if (typeof focusState !== 'undefined') {
      focusState.user = { running: false, remainingSeconds: 0, startTime: null, activity: '学习', mode: 'countdown' };
      focusState.ai   = { enabled: false, running: false, remainingSeconds: 0, startTime: null, activity: '专注' };
    }
    focusAnimLibrary  = { user: [], character: [], duo: [] };
    focusAnimSelected = { user: null, character: null, duo: null };
    focusAnimDuoMode  = 'single';
    if (typeof resetAppState === 'function') resetAppState();
    if (window.closeClearConfirm) window.closeClearConfirm();
    setTimeout(() => location.reload(), 300);
  }

  init();
})();
