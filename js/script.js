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
  const statsIcon = document.getElementById('statsIcon');
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
    systemPrompt: ''
  };

  let isGenerating = false;
  let currentTypingMessageId = null;
  let currentTheme = 'dark';
  
  // ---------- 核心记忆自动提取状态 ----------
  let messagesSinceLastMemoryCheck = 0;
  const MEMORY_CHECK_THRESHOLD = 20; // 多少条用户+AI消息后触发一次检查
  let lastMemoryCheckTime = 0;
  const MEMORY_CHECK_COOLDOWN = 60000; // 检查冷却时间：1分钟
  let memorySuggestionPending = false;

  // 聊天偏好状态
  let chatPreferences = {
    enableReadIgnore: false,
    readIgnoreProbability: 5,
    enableLongUnread: false,
    longUnreadProbability: 5
  };

  // 主动发消息状态
  let proactiveMsgPrefs = {
    enabled: false,
    intervalMinutes: 60,
    probability: 50
  };
  let proactiveLastCheckTs = 0;  // 上次主动消息检查时间戳
  let proactiveTickerId = null;

  // 通知状态
  let notificationPrefs = {
    enabled: false
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
    user: { activity: '学习', mode: 'down', durationSec: 25 * 60, remainingSec: 25 * 60, elapsedSec: 0, running: false, lastStartTs: 0, startRemainingSec: 25 * 60, startElapsedSec: 0, overlapStartTs: 0 },
    ai: { enabled: false, locked: false, activity: '陪你专注', mode: 'down', durationSec: 25 * 60, remainingSec: 25 * 60, elapsedSec: 0, running: false, lastStartTs: 0, startRemainingSec: 25 * 60, startElapsedSec: 0, overlapStartTs: 0 }
  };
  let focusTickerId = null;

  // ---------- 统计数据存储 ----------
  const statsData = {
    // 专注记录
    focusRecords: [],  // [{owner: 'user'|'char', activity: string, durationSec: number, date: 'YYYY-MM-DD', time: 'HH:MM'}]
    // 日程
    schedules: [],      // [{owner: 'user'|'char', activity: string, time: 'HH:MM', date: 'YYYY-MM-DD'}]
    // 聊天统计
    chatStats: {
      firstChatDate: null,
      totalMessages: 0,
      userMessages: 0,
      charMessages: 0,
      dailyMessages: {}  // {'YYYY-MM-DD': count}
    },
    // 共同专注总时长（秒）
    totalOverlapSec: 0
  };

  // 加载统计数据
  function loadStatsData() {
    try {
      const saved = localStorage.getItem('stats_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.focusRecords) statsData.focusRecords = parsed.focusRecords;
        if (parsed.schedules) statsData.schedules = parsed.schedules;
        if (parsed.chatStats) statsData.chatStats = { ...statsData.chatStats, ...parsed.chatStats };
        if (typeof parsed.totalOverlapSec === 'number') statsData.totalOverlapSec = parsed.totalOverlapSec;
      }
    } catch(e) {}
  }

  // 保存统计数据
  function saveStatsData() {
    try {
      localStorage.setItem('stats_data', JSON.stringify(statsData));
    } catch(e) {}
  }

  // 添加专注记录（只在满足条件时添加）
  // 返回值：true=已记录，false=未记录，'confirm'=需要用户确认
  function addFocusRecord(owner, activity, durationSec, mode) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    
    // 判断是否应该记录
    // 规则：1. 任何专注小于1分钟不计入 2. 用户正计时小于5分钟不计入
    // 3. 倒计时提前结束不计入 4. 角色倒计时正常结束计入，角色正计时>=1分钟计入
    
    const MINute = 60;  // 1分钟
    const FIVE_MINUTES = 5 * 60;  // 5分钟
    
    // 规则1：小于1分钟不计入
    if (durationSec < MINute) {
      showToast('专注时长不足1分钟，不计入记录');
      return false;
    }
    
    if (mode === 'up') {
      // 正计时模式
      if (owner === 'user') {
        // 用户正计时：必须>=5分钟
        if (durationSec < FIVE_MINUTES) {
          return 'confirm_under_5min';  // 需要确认弹窗
        }
      }
      // 角色正计时：>=1分钟即可（已在规则1中处理）
      // 记录
      statsData.focusRecords.push({
        owner: owner,
        activity: activity,
        durationSec: durationSec,
        date: dateStr,
        time: timeStr
      });
      saveStatsData();
      return true;
    } else {
      // 倒计时模式：正常结束才记录
      // durationSec 在倒计时模式下就是设定的时长，所以通过实际经过时间来验证
      // 已在上面判断了1分钟，这里倒计时正常结束直接记录
      statsData.focusRecords.push({
        owner: owner,
        activity: activity,
        durationSec: durationSec,
        date: dateStr,
        time: timeStr
      });
      saveStatsData();
      return true;
    }
  }
  
  // 确认提前结束专注（用户点击确认后调用）
  function confirmEarlyEndFocus() {
    const elapsed = focusState.user.mode === 'up'
      ? focusState.user.elapsedSec
      : (focusState.user.startRemainingSec - focusState.user.remainingSec);
    const duration = focusState.user.durationSec || 0;
    const activity = focusState.user.activity || '专注';
    
    // 直接结束，不记录
    resetUserOnly();
    showToast('本次专注不计入记录');
  }

  // 添加日程
  function addSchedule(owner, activity, time) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    statsData.schedules.push({
      owner: owner,
      activity: activity,
      time: time,
      date: dateStr
    });
    saveStatsData();
  }

  // 删除日程
  function deleteSchedule(index) {
    if (index >= 0 && index < statsData.schedules.length) {
      statsData.schedules.splice(index, 1);
      saveStatsData();
    }
  }

  // 更新聊天统计
  function updateChatStats(role) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    if (!statsData.chatStats.firstChatDate) {
      statsData.chatStats.firstChatDate = dateStr;
    }
    
    statsData.chatStats.totalMessages++;
    statsData.chatStats.dailyMessages[dateStr] = (statsData.chatStats.dailyMessages[dateStr] || 0) + 1;
    
    if (role === 'user') {
      statsData.chatStats.userMessages++;
    } else {
      statsData.chatStats.charMessages++;
    }
    
    saveStatsData();
  }

  // 从历史消息重建聊天统计（确保历史记录都被统计）
  function rebuildChatStatsFromHistory() {
    const realMsgs = messages.filter(m => (m.role === 'user' || m.role === 'assistant') && !m.isReset && m.timestamp);
    if (realMsgs.length === 0) return;

    // 重置统计数据
    let userCount = 0, charCount = 0;
    const daily = {};
    let firstDate = null;

    realMsgs.forEach(m => {
      const d = new Date(m.timestamp);
      const dateStr = d.toISOString().split('T')[0];
      daily[dateStr] = (daily[dateStr] || 0) + 1;
      if (!firstDate || dateStr < firstDate) firstDate = dateStr;
      if (m.role === 'user') userCount++;
      else charCount++;
    });

    statsData.chatStats.totalMessages = userCount + charCount;
    statsData.chatStats.userMessages = userCount;
    statsData.chatStats.charMessages = charCount;
    statsData.chatStats.dailyMessages = daily;
    statsData.chatStats.firstChatDate = firstDate;
    saveStatsData();
  }

  // 获取高频词
  function getTopWords(count = 20) {
    const wordCount = {};
    const stopWords = new Set(['的', '了', '在', '是', '我', '你', '他', '她', '它', '们', '这', '那', '有', '和', '与', '也', '都', '就', '不', '很', '要', '会', '可以', '一个', '什么', '怎么', '为什么', '没有', '什么', '这个', '那个', '但是', '如果', '因为', '所以', '虽然', '然后', '还是', '或者', '而且', '不过', '已经', '可能', '应该', '自己', '现在', '这里', '那里', '知道', '觉得', '想', '能', '啊', '呢', '吧', '吗', '呀', '哦', '嗯', '哈哈', '...', '……', '。', '，', '？', '！', ':', ';', '...']);
    
    messages.forEach(msg => {
      // 跳过时间戳消息（isReset类型）
      if (msg.isReset) return;
      if (msg.content) {
        const words = msg.content.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/);
        words.forEach(word => {
          if (word.length >= 2 && !stopWords.has(word.toLowerCase())) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word, count]) => ({ word, count }));
  }

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

  // ---------- 主动发消息 ----------
  function loadProactiveMsgPrefs() {
    try {
      const saved = localStorage.getItem('proactive_msg_prefs');
      if (saved) proactiveMsgPrefs = { ...proactiveMsgPrefs, ...JSON.parse(saved) };
    } catch(e) {}
    try {
      const saved2 = localStorage.getItem('notification_prefs');
      if (saved2) notificationPrefs = { ...notificationPrefs, ...JSON.parse(saved2) };
    } catch(e) {}
  }

  function saveProactiveMsgPrefs() {
    try { localStorage.setItem('proactive_msg_prefs', JSON.stringify(proactiveMsgPrefs)); } catch(e) {}
  }

  function saveNotificationPrefs() {
    try { localStorage.setItem('notification_prefs', JSON.stringify(notificationPrefs)); } catch(e) {}
  }

  function buildProactiveMsgUI() {
    const drawerContent = document.querySelector('.drawer-content');
    if (!drawerContent) return;

    // 在聊天偏好上方插入
    const prefsSection = document.querySelector('.chat-prefs-section');
    if (!prefsSection) return;

    // --- 主动发消息功能 ---
    const proactiveSection = document.createElement('div');
    proactiveSection.id = 'proactiveMsgSection';
    proactiveSection.innerHTML = `
      <div class="drawer-divider-label">主动发消息</div>
      <div class="chat-prefs-row">
        <label><i class="fas fa-bolt"></i> 主动发消息</label>
        <div class="apple-toggle" id="proactiveMsgToggle"></div>
      </div>
      <div class="proactive-controls" id="proactiveControls" style="display:none;">
        <div class="probability-bar">
          <label class="probability-label"><i class="fas fa-clock"></i> 间隔时间</label>
          <input type="range" min="10" max="240" value="${proactiveMsgPrefs.intervalMinutes}" class="apple-slider" id="proactiveIntervalSlider">
          <span id="proactiveIntervalVal" class="probability-value">${proactiveMsgPrefs.intervalMinutes}分钟</span>
        </div>
        <div class="probability-bar">
          <label class="probability-label"><i class="fas fa-percentage"></i> 触发概率</label>
          <input type="range" min="5" max="100" value="${proactiveMsgPrefs.probability}" class="apple-slider" id="proactiveProbSlider">
          <span id="proactiveProbVal" class="probability-value">${proactiveMsgPrefs.probability}%</span>
        </div>
        <div class="chat-prefs-info">
          AI 将在间隔时间后，以概率触发主动发消息
        </div>
      </div>
    `;
    prefsSection.before(proactiveSection);

    // --- 通知功能 ---
    const notifySection = document.createElement('div');
    notifySection.id = 'notifySection';
    notifySection.innerHTML = `
      <div class="drawer-divider-label">通知</div>
      <div class="chat-prefs-row">
        <label><i class="fas fa-bell"></i> 通知</label>
        <div class="apple-toggle" id="notifyToggle"></div>
      </div>
      <div class="chat-prefs-info" id="notifyStatusInfo">
        开启后，AI 回复时将发送通知
      </div>
    `;
    proactiveSection.after(notifySection);

    // 绑定事件
    const toggleEl = document.getElementById('proactiveMsgToggle');
    const controlsEl = document.getElementById('proactiveControls');
    const intervalSlider = document.getElementById('proactiveIntervalSlider');
    const probSlider = document.getElementById('proactiveProbSlider');
    const intervalVal = document.getElementById('proactiveIntervalVal');
    const probVal = document.getElementById('proactiveProbVal');
    const notifyToggle = document.getElementById('notifyToggle');
    const notifyInfo = document.getElementById('notifyStatusInfo');

    function updateSliderFill2(slider) {
      if (!slider) return;
      const min = Number(slider.min), max = Number(slider.max), val = Number(slider.value);
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--border-strong) ${pct}%)`;
    }

    // 初始化状态
    toggleEl.classList.toggle('active', proactiveMsgPrefs.enabled);
    controlsEl.style.display = proactiveMsgPrefs.enabled ? '' : 'none';
    notifyToggle.classList.toggle('active', notificationPrefs.enabled);
    updateSliderFill2(intervalSlider);
    updateSliderFill2(probSlider);

    toggleEl.addEventListener('click', () => {
      proactiveMsgPrefs.enabled = !proactiveMsgPrefs.enabled;
      toggleEl.classList.toggle('active', proactiveMsgPrefs.enabled);
      controlsEl.style.display = proactiveMsgPrefs.enabled ? '' : 'none';
      saveProactiveMsgPrefs();
      if (proactiveMsgPrefs.enabled) startProactiveTicker();
      else stopProactiveTicker();
    });

    intervalSlider.addEventListener('input', (e) => {
      proactiveMsgPrefs.intervalMinutes = parseInt(e.target.value);
      intervalVal.textContent = proactiveMsgPrefs.intervalMinutes + '分钟';
      updateSliderFill2(e.target);
      saveProactiveMsgPrefs();
    });

    probSlider.addEventListener('input', (e) => {
      proactiveMsgPrefs.probability = parseInt(e.target.value);
      probVal.textContent = proactiveMsgPrefs.probability + '%';
      updateSliderFill2(e.target);
      saveProactiveMsgPrefs();
    });

    notifyToggle.addEventListener('click', async () => {
      if (!notificationPrefs.enabled) {
        // 请求通知权限
        if (!('Notification' in window)) {
          showCommonDialog({ title: '不支持通知', message: '当前浏览器不支持通知功能' });
          return;
        }
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          notificationPrefs.enabled = true;
          notifyToggle.classList.add('active');
          notifyInfo.textContent = '通知已开启 ✓';
          saveNotificationPrefs();
        } else {
          showCommonDialog({ title: '权限被拒绝', message: '请在浏览器设置中允许通知权限' });
        }
      } else {
        notificationPrefs.enabled = false;
        notifyToggle.classList.remove('active');
        notifyInfo.textContent = '开启后，AI 回复时将发送通知';
        saveNotificationPrefs();
      }
    });

    // 如果已开启，启动 ticker
    if (proactiveMsgPrefs.enabled) startProactiveTicker();
  }

  /** 主动发消息计时器 */
  function startProactiveTicker() {
    if (proactiveTickerId) clearInterval(proactiveTickerId);
    proactiveLastCheckTs = Date.now();
    proactiveTickerId = setInterval(() => {
      checkProactiveMessage();
      checkProactiveFollowUp();
    }, 60 * 1000); // 每分钟检查一次
  }

  function stopProactiveTicker() {
    if (proactiveTickerId) { clearInterval(proactiveTickerId); proactiveTickerId = null; }
  }

  // 主动消息追问：记录上次主动消息发出时间 & 是否已等待催问
  let proactiveLastSentTs = 0;     // 上次主动消息发出时间
  let proactiveFollowUpSent = false; // 本轮是否已发过催消息
  // 无回复多少分钟后催问（固定15分钟）
  const PROACTIVE_FOLLOWUP_MINUTES = 15;

  /** 检查是否应该主动发消息 */
  async function checkProactiveMessage() {
    if (!proactiveMsgPrefs.enabled || isGenerating) return;
    const elapsed = (Date.now() - proactiveLastCheckTs) / 1000 / 60; // 分钟
    if (elapsed < proactiveMsgPrefs.intervalMinutes) return;

    // 已到达间隔，掷骰子
    proactiveLastCheckTs = Date.now();
    const roll = Math.random() * 100;
    if (roll > proactiveMsgPrefs.probability) return;

    // 检查：最后一条消息是否是 assistant（避免 AI 主动发消息后没人理又立刻再发）
    const lastMsg = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-1)[0];
    if (lastMsg && lastMsg.role === 'assistant') return; // 上条是AI发的，跳过

    // 触发主动消息
    isGenerating = true;
    try {
      // 只用少量历史（5条），避免 AI 接续自己发的消息导致自问自答
      const shortHistory = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-5)
        .map(m => ({ role: m.role, content: m.content }));
      const systemMsg = {
        role: 'system',
        content: `你是角色${charNameInput ? charNameInput.value || '角色' : '角色'}，现在你主动联系对方说一句话。要求：只输出一句话，简洁自然，符合你的角色设定，不要其他内容。`
      };
      const res = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model, messages: [systemMsg, ...shortHistory], temperature: 0.9 })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const triggerMsg = data?.choices?.[0]?.message?.content;
      if (triggerMsg && triggerMsg.trim()) {
        const cleaned = cleanParentheses(triggerMsg.trim());
        addMessage('assistant', cleaned);
        triggerNotification((charNameInput?.value || '角色') + ' 发来消息', cleaned);
        proactiveLastSentTs = Date.now();
        proactiveFollowUpSent = false; // 重置催问状态
      }
    } catch(e) {
      console.warn('主动消息生成失败:', e);
    } finally {
      isGenerating = false;
    }
  }

  /** 检查是否需要发催消息（主动消息发出后长时间无回复） */
  async function checkProactiveFollowUp() {
    if (!proactiveMsgPrefs.enabled || isGenerating) return;
    if (!proactiveLastSentTs || proactiveFollowUpSent) return;

    // 检查距离主动消息发出是否超过阈值
    const waitedMin = (Date.now() - proactiveLastSentTs) / 1000 / 60;
    if (waitedMin < PROACTIVE_FOLLOWUP_MINUTES) return;

    // 检查：最后一条消息是否还是 assistant（用户仍未回复）
    const lastMsg = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-1)[0];
    if (!lastMsg || lastMsg.role !== 'assistant') {
      // 用户已回复，重置
      proactiveLastSentTs = 0;
      proactiveFollowUpSent = false;
      return;
    }

    proactiveFollowUpSent = true; // 标记已发，不重复催
    isGenerating = true;
    try {
      const charName = charNameInput?.value || '角色';
      // 取最近5条上下文（不含刚发的那条，避免再接自己话题）
      const shortHistory = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-5)
        .map(m => ({ role: m.role, content: m.content }));
      const systemMsg = {
        role: 'system',
        content: `你是角色${charName}。你之前发了消息但对方一直没有回复，现在你想问问对方为什么不回你，语气和表达方式要符合你的角色设定，只输出一句话，自然且不刻意。`
      };
      const res = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model, messages: [systemMsg, ...shortHistory], temperature: 0.9 })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const followUpMsg = data?.choices?.[0]?.message?.content;
      if (followUpMsg && followUpMsg.trim()) {
        const cleaned = cleanParentheses(followUpMsg.trim());
        addMessage('assistant', cleaned);
        triggerNotification(charName + ' 发来消息', cleaned);
        proactiveLastSentTs = 0; // 重置，避免再次触发
      }
    } catch(e) {
      console.warn('催消息生成失败:', e);
    } finally {
      isGenerating = false;
    }
  }

  /** 触发浏览器通知 */
  function triggerNotification(title, body) {
    if (!notificationPrefs.enabled || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, { body, icon: 'logos/icon.png', silent: false });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 8000);
    } catch(e) { console.warn('Notification error:', e); }
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
    const hhmm = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msgDay = new Date(d);
    msgDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return hhmm;
    if (diffDays === 1) return `昨天 ${hhmm}`;
    if (diffDays === 2) return `前天 ${hhmm}`;
    if (diffDays < 30) return `${diffDays}天前 ${hhmm}`;
    return `${d.getMonth()+1}/${d.getDate()} ${hhmm}`;
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

      // 已读未读状态，放在气泡外部底部（用户气泡的左下角外侧）
      const readStatusHtml = (msg.role === 'user' && msg.readStatus) 
        ? `<span class="read-status-outside ${msg.readStatus === 'read' ? 'read' : 'unread'}">${msg.readStatus === 'read' ? '已读' : '未读'}</span>` 
        : '';

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

      if (msg.role === 'assistant') {
        html += `<div class="message-row assistant">${buildAvatarHtml('assistant')}${bubble}</div>`;
      } else {
        // 用户消息：已读标签放在气泡外部下方
        html += `<div class="message-row user">
          <div class="user-message-wrapper">
            ${bubble}
            ${readStatusHtml}
          </div>
          ${buildAvatarHtml('user')}
        </div>`;
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
    // 点击操作按钮本身（修改/删除/收藏），不触发动作菜单切换
    const isActionIcon = e.target.closest('.bubble-actions i');
    if (isActionIcon) return;

    const actions = e.currentTarget.querySelector('.bubble-actions');
    if (actions.classList.contains('show')) {
      actions.classList.remove('show');
    } else {
      // 关闭其他所有已打开的
      document.querySelectorAll('.bubble-actions').forEach(el => el.classList.remove('show'));
      actions.classList.add('show');
    }
    e.stopPropagation();
  };

  // 点击页面任意位置，关闭所有气泡操作菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bubble-actions')) {
      document.querySelectorAll('.bubble-actions.show').forEach(el => el.classList.remove('show'));
    }
  });

  // 滚动聊天记录时关闭气泡菜单
  if (messagesArea) {
    let scrollTimer;
    messagesArea.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.querySelectorAll('.bubble-actions.show').forEach(el => el.classList.remove('show'));
      }, 100);
    });
  }

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

  // ---------- 核心记忆自动提取 ----------
  async function checkAndSuggestMemories() {
    // 检查冷却时间，避免频繁触发
    const now = Date.now();
    if (now - lastMemoryCheckTime < MEMORY_CHECK_COOLDOWN) return;
    if (memorySuggestionPending) return;
    if (!config.apiKey) return;
    
    lastMemoryCheckTime = now;
    memorySuggestionPending = true;
    
    try {
      // 收集最近30条对话（不含系统消息和重置标记）
      const recentMsgs = messages.slice(-60)
        .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.isReset)
        .slice(-30);
      
      if (recentMsgs.length < 5) {
        memorySuggestionPending = false;
        return; // 对话太少，不需要检查
      }
      
      const chatHistory = recentMsgs.map(m => 
        `[${m.role === 'user' ? '用户' : '角色'}] ${m.content}`
      ).join('\n\n');
      
      // 获取当前已有记忆，避免重复
      const existingMemories = charMemoriesInput ? charMemoriesInput.value.trim() : '';
      
      const prompt = `【对话记录】
${chatHistory}

【已有记忆】（请忽略已存在的内容）
${existingMemories || '暂无'}

请分析上述对话记录，提取其中可能有意义的"重要事件"、"人物关系"、"偏好习惯"等信息。
这些信息应该对AI角色理解和记住用户有帮助。

判断标准：
1. 用户明确提及的重要事件（如生日、纪念日、经历）
2. 用户表达的偏好或习惯（如喜欢/讨厌某事物）
3. 用户与角色之间的重要互动（如角色做出的承诺、用户的请求）
4. 值得记住的人物关系或身份信息

请严格判断，只有"确实值得记录"的内容才输出。如果对话中没有值得记录的内容，请只输出"[无建议]"。
输出格式：每条记忆一行，格式为"主题：具体内容"。最多输出3条，不要过度提取。`;
      
      const suggestion = await callAI(prompt, "你是记忆分析助手，帮助用户管理重要的对话记忆。");
      
      if (!suggestion || suggestion.trim() === '[无建议]' || suggestion.trim() === '') {
        memorySuggestionPending = false;
        return;
      }
      
      // 解析建议的记忆
      const lines = suggestion.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('[') && (l.includes('：') || l.includes(':')));
      
      if (lines.length === 0) {
        memorySuggestionPending = false;
        return;
      }
      
      // 显示建议弹窗
      const suggestionsHtml = lines.map((line, i) => 
        `<div class="memory-suggestion-item">
          <label class="memory-suggestion-label">
            <input type="checkbox" class="memory-suggestion-checkbox" data-idx="${i}" checked>
            <span class="memory-suggestion-text">${escapeHtml(line)}</span>
          </label>
        </div>`
      ).join('');
      
      showCommonDialog({
        title: '✨ 发现可记录的内容',
        customBody: `
          <div class="memory-suggestion-container">
            <p class="memory-suggestion-hint">根据最近的对话，AI建议添加以下记忆：</p>
            ${suggestionsHtml}
            <p class="memory-suggestion-tip">勾选要添加的记忆，点击确定保存</p>
          </div>
        `,
        confirmText: '添加选中记忆',
        cancelText: '忽略',
        onConfirm: () => {
          const checkboxes = document.querySelectorAll('.memory-suggestion-checkbox:checked');
          if (checkboxes.length === 0) return;
          
          let currentMemories = charMemoriesInput ? charMemoriesInput.value.trim() : '';
          let newMemories = [];
          
          checkboxes.forEach(cb => {
            const idx = parseInt(cb.dataset.idx);
            const text = lines[idx];
            if (text && !currentMemories.includes(text)) {
              newMemories.push(text);
            }
          });
          
          if (newMemories.length > 0) {
            const prefix = currentMemories ? '\n' : '';
            charMemoriesInput.value = currentMemories + prefix + newMemories.map(m => `- ${m}`).join('\n');
            // 保存到角色数据
            characterData.memories = charMemoriesInput.value;
            saveCharacterToStorage();
            // 更新卡片显示
            updateMemoriesCards();
            
            showToast(`已添加 ${newMemories.length} 条记忆`);
          }
        }
      });
      
    } catch(e) {
      console.error('Memory suggestion error:', e);
    } finally {
      memorySuggestionPending = false;
    }
  }
  
  // 更新消息计数并触发检查
  function trackMessageForMemoryCheck() {
    messagesSinceLastMemoryCheck++;
    if (messagesSinceLastMemoryCheck >= MEMORY_CHECK_THRESHOLD) {
      messagesSinceLastMemoryCheck = 0;
      // 异步检查，不阻塞用户操作
      setTimeout(() => checkAndSuggestMemories(), 500);
    }
  }

  function addMessage(role, content, options = {}) {
    const msg = { role, content, timestamp: Date.now(), ...options };
    if (role === 'user' && !msg.readStatus) msg.readStatus = 'unread';
    messages.push(msg);
    saveMessagesToStorage();
    renderMessages();
    // 更新聊天统计
    updateChatStats(role);
    // 触发记忆检查
    trackMessageForMemoryCheck();
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
    ${getVal(systemPromptInput) || '你是一个冷静又带点青涩的助手，说话简洁但偶尔流露出温柔。请用中文交流，保持角色。'}

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

    // 用户发消息：重置主动消息催问状态
    proactiveLastSentTs = 0;
    proactiveFollowUpSent = false;

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
          // AI 回复时触发通知
          triggerNotification(charNameInput.value + ' 发来消息', sentence);
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
  let drawerClickHandler = null;
  function openDrawer() { 
    drawer.classList.add('open'); 
    overlay.classList.add('show'); 
    
    // 延迟添加点击监听，避免触发当前点击事件
    setTimeout(() => {
      drawerClickHandler = (e) => {
        // 如果点击的是抽屉内部，不关闭
        if (drawer.contains(e.target)) return;
        // 如果点击的是触发按钮，不关闭
        if (configBtn.contains(e.target)) return;
        closeDrawer();
      };
      document.addEventListener('click', drawerClickHandler);
    }, 0);
  }
  function closeDrawer() { 
    drawer.classList.remove('open'); 
    overlay.classList.remove('show'); 
    // 移除点击监听
    if (drawerClickHandler) {
      document.removeEventListener('click', drawerClickHandler);
      drawerClickHandler = null;
    }
  }

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
    chatMain.classList.remove('chat-hidden', 'profile-hidden', 'character-hidden', 'data-hidden', 'focus-hidden', 'stats-hidden');
    document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
    userAvatarBtn.classList.remove('active');
    if (view === 'chat') chatIcon.classList.add('active');
    else if (view === 'settings') { chatMain.classList.add('chat-hidden'); gearIcon.classList.add('active'); }
    else if (view === 'profile') { chatMain.classList.add('profile-hidden'); userAvatarBtn.classList.add('active'); }
    else if (view === 'character') { chatMain.classList.add('character-hidden'); characterIcon.classList.add('active'); }
    else if (view === 'focus') { chatMain.classList.add('focus-hidden'); focusIcon?.classList.add('active'); }
    else if (view === 'stats') { 
      chatMain.classList.add('stats-hidden'); 
      statsIcon?.classList.add('active'); 
      // 打开统计视图时默认显示今日统计tab
      document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.stats-content').forEach(c => c.classList.remove('active'));
      document.querySelector('.stats-tab[data-tab="today"]')?.classList.add('active');
      document.getElementById('statsTodayContent')?.classList.add('active');
      refreshStatsView();
    }
    else if (view === 'data') {
      chatMain.classList.add('data-hidden');
      dataManagerIcon.classList.add('active');
      refreshStorageStats();
    }
  }

  // ---------- 统计视图 ----------
  function refreshStatsView() {
    // 设置当前日期
    const now = new Date();
    document.getElementById('scheduleDateDisplay').textContent = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${['周日','周一','周二','周三','周四','周五','周六'][now.getDay()]}`;
    
    // 刷新各统计内容
    renderTodaySchedule();
    renderChatStats();
    renderFocusStats();
  }

  // 渲染今日日程
  function renderTodaySchedule() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySchedules = statsData.schedules.filter(s => s.date === todayStr);
    const todayRecords = statsData.focusRecords.filter(r => r.date === todayStr);
    
    const container = document.getElementById('scheduleTimeline');
    if (todaySchedules.length === 0 && todayRecords.length === 0) {
      container.innerHTML = `<div class="schedule-empty"><i class="fas fa-clock opacity-5"></i><p>暂无日程安排</p></div>`;
      return;
    }
    
    // 合并所有项目，按时间排序
    const allItems = [
      ...todaySchedules.map(s => ({ type: 'schedule', ...s })),
      ...todayRecords.map(r => ({ type: 'focus', ...r }))
    ].sort((a, b) => a.time.localeCompare(b.time));
    
    if (allItems.length === 0) {
      container.innerHTML = `<div class="schedule-empty"><i class="fas fa-clock opacity-5"></i><p>暂无日程安排</p></div>`;
      return;
    }
    
    // 生成时间线HTML
    let html = '<div class="timeline-container">';
    
    allItems.forEach((item, index) => {
      const isLast = index === allItems.length - 1;
      if (item.type === 'schedule') {
        const scheduleIndex = statsData.schedules.findIndex(s => s.date === item.date && s.time === item.time && s.activity === item.activity);
        const isChar = item.owner === 'char';
        html += `
          <div class="timeline-row ${isChar ? 'char-side' : 'user-side'}">
            <div class="timeline-left">
              ${isChar ? `<span class="timeline-content char-content">${item.activity}</span><span class="timeline-time">${item.time}</span><span class="timeline-marker char-marker">·</span>` : ''}
            </div>
            <div class="timeline-center">
              <div class="timeline-dot ${isChar ? 'char-dot' : 'user-dot'}"></div>
              ${!isLast ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="timeline-right">
              ${!isChar ? `<span class="timeline-marker user-marker">·</span><span class="timeline-time">${item.time}</span><span class="timeline-content user-content">${item.activity}</span>` : ''}
            </div>
          </div>`;
      } else {
        const minutes = Math.round(item.durationSec / 60);
        const isChar = item.owner === 'char';
        const focusText = `专注 ${minutes}分钟`;
        html += `
          <div class="timeline-row ${isChar ? 'char-side' : 'user-side'}">
            <div class="timeline-left">
              ${isChar ? `<span class="timeline-content char-content"><i class="fas fa-hourglass-half"></i> ${focusText}</span><span class="timeline-time">${item.time}</span><span class="timeline-marker char-marker">·</span>` : ''}
            </div>
            <div class="timeline-center">
              <div class="timeline-dot ${isChar ? 'char-dot' : 'user-dot'}"></div>
              ${!isLast ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="timeline-right">
              ${!isChar ? `<span class="timeline-marker user-marker">·</span><span class="timeline-time">${item.time}</span><span class="timeline-content user-content"><i class="fas fa-hourglass-half"></i> ${focusText}</span>` : ''}
            </div>
          </div>`;
      }
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  // 删除日程并刷新
  window.deleteScheduleAndRefresh = function(index) {
    deleteSchedule(index);
    renderTodaySchedule();
  };

  // 渲染聊天统计
  function renderChatStats() {
    const stats = statsData.chatStats;
    
    // 对话概况
    document.getElementById('chatStatCount').textContent = stats.totalMessages;
    document.getElementById('userMsgCount').textContent = stats.userMessages;
    document.getElementById('charMsgCount').textContent = stats.charMessages;
    
    // 计算对话天数
    if (stats.firstChatDate) {
      const firstDate = new Date(stats.firstChatDate);
      const today = new Date();
      const days = Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
      document.getElementById('chatStatDays').textContent = days;
      document.getElementById('chatStatStartDate').textContent = stats.firstChatDate;
    } else {
      document.getElementById('chatStatDays').textContent = '0';
      document.getElementById('chatStatStartDate').textContent = '-';
    }
    
    // 词排行
    renderWordRanking();
  }
  
  // 渲染词排行
  function renderWordRanking() {
    const container = document.getElementById('wordRankingList');
    if (!container) return;
    
    const topWords = getTopWords(10);
    if (topWords.length === 0) {
      container.innerHTML = `<div class="word-ranking-empty"><i class="fas fa-list opacity-5"></i><p>暂无数据</p></div>`;
      return;
    }
    
    let html = '';
    topWords.forEach((item, index) => {
      html += `
        <div class="word-ranking-item">
          <div class="word-ranking-rank">${index + 1}</div>
          <div class="word-ranking-word">${item.word}</div>
          <div class="word-ranking-count">${item.count}次</div>
        </div>`;
    });
    
    container.innerHTML = html;
  }

  // 渲染专注统计
  function renderFocusStats() {
    const records = statsData.focusRecords;
    
    // 计算总时长
    let userSec = 0, charSec = 0;
    records.forEach(r => {
      if (r.owner === 'user') userSec += r.durationSec;
      else charSec += r.durationSec;
    });
    
    // 共同专注时长 = 双方同时专注的时间总和
    const overlapSec = statsData.totalOverlapSec || 0;
    
    const formatHours = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.round((sec % 3600) / 60);
      return h > 0 ? `${h}h${m}m` : `${m}m`;
    };
    
    document.getElementById('totalFocusHours').textContent = formatHours(overlapSec);
    document.getElementById('userFocusHours').textContent = formatHours(userSec);
    document.getElementById('charFocusHours').textContent = formatHours(charSec);
    
    // 专注记录列表
    const container = document.getElementById('focusRecordsList');
    if (records.length === 0) {
      container.innerHTML = `
        <div class="focus-record-empty">
          <i class="fas fa-hourglass-half opacity-5"></i>
          <p>暂无专注记录</p>
          <p class="fs-12 text-secondary">正计时超过5分钟、倒计时正常结束的专注会被记录</p>
        </div>`;
      return;
    }
    
    // 按时间倒序排序（最新在最上面）
    const sortedRecords = [...records].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
    
    // 分页：每页5条
    const pageSize = 5;
    let currentPage = window.focusRecordsPage || 1;
    const totalPages = Math.ceil(sortedRecords.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const pageRecords = sortedRecords.slice(startIdx, startIdx + pageSize);
    
    // 格式化日期显示
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${month}月${day}日`;
    };
    
    let html = '';
    pageRecords.forEach(record => {
      const minutes = Math.round(record.durationSec / 60);
      const dateDisplay = formatDate(record.date);
      html += `
        <div class="focus-record-item">
          <div class="focus-record-time">${dateDisplay} ${record.time}</div>
          <div class="focus-record-dot ${record.owner === 'user' ? 'user-dot' : 'char-dot'}"></div>
          <div class="focus-record-info">
            <div class="focus-record-owner">${record.owner === 'user' ? '我的专注' : '角色专注'}</div>
            <div class="focus-record-activity">${record.activity}</div>
          </div>
          <div class="focus-record-duration">${minutes}分钟</div>
        </div>`;
    });
    
    // 添加分页控件
    if (totalPages > 1) {
      html += `
        <div class="focus-records-pagination">
          <span class="focus-records-info">${startIdx + 1}-${Math.min(startIdx + pageSize, sortedRecords.length)} / 共${sortedRecords.length}条</span>
          <div class="focus-records-btns">
            <button class="focus-page-btn" onclick="goToFocusPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="focus-page-num">${currentPage} / ${totalPages}</span>
            <button class="focus-page-btn" onclick="goToFocusPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>`;
    }
    
    container.innerHTML = html;
  }
  
  // 专注记录分页函数
  window.goToFocusPage = function(page) {
    const totalRecords = statsData.focusRecords.length;
    const totalPages = Math.ceil(totalRecords / 5);
    if (page < 1 || page > totalPages) return;
    window.focusRecordsPage = page;
    renderFocusStats();
  };
  
  // 渲染历史专注记录抽屉
  function renderFocusHistoryDrawer() {
    const container = document.getElementById('focusHistoryList');
    const records = statsData.focusRecords;
    
    if (records.length === 0) {
      container.innerHTML = `
        <div class="focus-history-empty">
          <i class="fas fa-hourglass-half opacity-5" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
          <p>暂无专注记录</p>
        </div>`;
      return;
    }
    
    // 按时间倒序排序
    const sortedRecords = [...records].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
    
    // 格式化日期显示
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${month}月${day}日`;
    };
    
    let html = '';
    sortedRecords.slice(0, 50).forEach(record => {
      const minutes = Math.round(record.durationSec / 60);
      const dateDisplay = formatDate(record.date);
      html += `
        <div class="focus-history-item">
          <div class="focus-history-time">${dateDisplay} ${record.time}</div>
          <div class="focus-history-dot ${record.owner === 'user' ? 'user-dot' : 'char-dot'}"></div>
          <div class="focus-history-info">
            <div class="focus-history-owner">${record.owner === 'user' ? '我的专注' : '角色专注'}</div>
            <div class="focus-history-activity">${record.activity}</div>
          </div>
          <div class="focus-history-duration">${minutes}分钟</div>
        </div>`;
    });
    
    container.innerHTML = html;
  }
  
  // 打开/关闭历史专注抽屉
  function openFocusHistoryDrawer() {
    renderFocusHistoryDrawer();
    document.getElementById('focusHistoryDrawer')?.classList.add('open');
    document.getElementById('focusHistoryOverlay')?.classList.add('show');
  }
  
  function closeFocusHistoryDrawer() {
    document.getElementById('focusHistoryDrawer')?.classList.remove('open');
    document.getElementById('focusHistoryOverlay')?.classList.remove('show');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // 历史专注记录按钮
    document.getElementById('focusHistoryBtn')?.addEventListener('click', openFocusHistoryDrawer);
    // 关闭按钮
    document.getElementById('closeFocusHistoryBtn')?.addEventListener('click', closeFocusHistoryDrawer);
    // 点击遮罩关闭
    document.getElementById('focusHistoryOverlay')?.addEventListener('click', closeFocusHistoryDrawer);
  });

  // 统计栏目切换
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stats-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // 切换tab按钮样式
        document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 切换内容
        document.querySelectorAll('.stats-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`stats${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Content`)?.classList.add('active');
      });
    });
  });

  // 添加日程弹窗
  document.addEventListener('DOMContentLoaded', () => {
    const addScheduleBtn = document.getElementById('addScheduleBtn');
    addScheduleBtn?.addEventListener('click', () => {
      showAddScheduleDialog();
    });
  });

  // 预设日程活动列表
  const presetActivities = [
    { name: '晨跑', icon: 'fa-running', color: '#0f9960' },
    { name: '阅读', icon: 'fa-book', color: '#3498db' },
    { name: '写作', icon: 'fa-pen', color: '#e74c3c' },
    { name: '冥想', icon: 'fa-spa', color: '#9b59b6' },
    { name: '学习', icon: 'fa-graduation-cap', color: '#f39c12' },
    { name: '锻炼', icon: 'fa-dumbbell', color: '#e67e22' },
    { name: '休息', icon: 'fa-bed', color: '#95a5a6' },
    { name: '工作', icon: 'fa-briefcase', color: '#34495e' }
  ];

  function showAddScheduleDialog() {
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    // 生成预设卡片HTML
    const presetCardsHtml = presetActivities.map((act, index) => `
      <div class="schedule-preset-card" data-activity="${act.name}" data-icon="${act.icon}" data-color="${act.color}" style="--card-color: ${act.color}">
        <i class="fas ${act.icon}"></i>
        <span>${act.name}</span>
      </div>
    `).join('');
    
    const formHtml = `
      <div class="schedule-dialog-container">
        <!-- 添加对象选择 -->
        <div class="schedule-form-group">
          <label>添加对象</label>
          <div class="schedule-owner-toggle">
            <button class="schedule-owner-btn active" data-owner="user" type="button">我的日程</button>
            <button class="schedule-owner-btn char-btn" data-owner="char" type="button">角色日程</button>
          </div>
        </div>
        
        <!-- 预设活动卡片 -->
        <div class="schedule-preset-section">
          <label>选择活动</label>
          <div class="schedule-preset-grid">
            ${presetCardsHtml}
          </div>
          <button class="schedule-custom-btn" id="showCustomForm">
            <i class="fas fa-plus"></i> 自定义活动
          </button>
        </div>
        
        <!-- 自定义活动表单（默认隐藏） -->
        <div class="schedule-custom-form" id="customFormSection" style="display: none;">
          <div class="schedule-form-row">
            <div class="schedule-form-group">
              <label>活动名称</label>
              <input type="text" id="scheduleActivityInput" placeholder="例如：瑜伽、编程...">
            </div>
          </div>
          <div class="schedule-form-row">
            <div class="schedule-form-group">
              <label>备注（可选）</label>
              <input type="text" id="scheduleNoteInput" placeholder="例如：30分钟后休息">
            </div>
          </div>
        </div>
        
        <!-- 时间选择 -->
        <div class="schedule-form-group">
          <label>时间</label>
          <input type="time" id="scheduleTimeInput" value="${currentTime}">
        </div>
      </div>
    `;
    
    showCommonDialog({
      title: '添加日程',
      message: '',
      customBody: formHtml,
      showCancel: true,
      confirmText: '添加',
      cancelText: '取消',
      onConfirm: () => {
        const activityInput = document.getElementById('scheduleActivityInput');
        const activity = activityInput?.value.trim() || '';
        const note = document.getElementById('scheduleNoteInput')?.value.trim() || '';
        const time = document.getElementById('scheduleTimeInput').value;
        const ownerBtn = document.querySelector('.schedule-owner-btn.active');
        const owner = ownerBtn?.dataset.owner || 'user';
        
        if (!activity) {
          showToast('请选择或输入活动');
          return;
        }
        
        // 如果有备注，附加到活动名称
        const finalActivity = note ? `${activity}（${note}）` : activity;
        addSchedule(owner, finalActivity, time);
        renderTodaySchedule();
        showToast('日程已添加');
      }
    });
    
    // 切换日程对象按钮
    setTimeout(() => {
      document.querySelectorAll('.schedule-owner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.schedule-owner-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
      
      // 预设卡片点击
      document.querySelectorAll('.schedule-preset-card').forEach(card => {
        card.addEventListener('click', () => {
          // 移除其他卡片的选中状态
          document.querySelectorAll('.schedule-preset-card').forEach(c => c.classList.remove('selected'));
          // 选中当前卡片
          card.classList.add('selected');
          // 填充到输入框
          const activityInput = document.getElementById('scheduleActivityInput');
          if (activityInput) {
            activityInput.value = card.dataset.activity;
          }
          // 隐藏自定义表单
          const customForm = document.getElementById('customFormSection');
          if (customForm) customForm.style.display = 'none';
        });
      });
      
      // 自定义按钮
      document.getElementById('showCustomForm')?.addEventListener('click', () => {
        const customForm = document.getElementById('customFormSection');
        if (customForm) {
          customForm.style.display = customForm.style.display === 'none' ? 'block' : 'none';
        }
        // 取消预设卡片选中
        document.querySelectorAll('.schedule-preset-card').forEach(c => c.classList.remove('selected'));
        // 清空输入框并聚焦
        const activityInput = document.getElementById('scheduleActivityInput');
        if (activityInput) {
          activityInput.value = '';
          activityInput.focus();
        }
      });
    }, 0);
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
    // 专注页面内的结束AI专注按钮
    const endAiFocusBtn2 = document.getElementById('endAiFocusBtn2');
    if (endAiFocusBtn2) endAiFocusBtn2.style.display = (focusState.ai.enabled && focusState.ai.running) ? 'flex' : 'none';
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

        // 共同专注时间追踪：每秒滴答时检查是否双方都在专注
        if (userRunning && aiRunning) {
          // 双方都在专注，累计重叠时间
          statsData.totalOverlapSec++;
          saveStatsData();
        }

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
          // 倒计时归零，自动结束并记录
          focusState.user.running = false;
          focusState.user.remainingSec = 0;
          focusState.user.lastStartTs = 0;
          focusState.user.startRemainingSec = 0;
          // 触发结束专注流程
          const elapsed = focusState.user.durationSec || 0;
          const activity = focusState.user.activity || '专注';
          addFocusRecord('user', activity, elapsed, 'down');
          resetUserOnly();
          // 显示专注结束弹窗
          const elapsedMin = Math.round(elapsed / 60);
          const durationMin = Math.round(focusState.user.durationSec / 60);
          const timeStr = elapsedMin > 0 ? `${elapsedMin}分钟` : `${durationMin}分钟`;
          showCommonDialog({
            title: '⭐专注结束',
            message: `${activity} · ${timeStr}`,
            showCancel: false,
            confirmText: '好的',
            onConfirm: null
          });
        }
      }

      if (focusState.ai.enabled && focusState.ai.running && focusState.ai.mode !== 'up') {
        const aRem = computeDownRemaining(focusState.ai);
        if (aRem <= 0) {
            // 计算AI专注时长并记录
            const elapsed = focusState.ai.durationSec || 0;
            const activity = focusState.ai.activity || '专注';
            addFocusRecord('char', activity, elapsed, 'down');
            
            focusState.ai.running = false;
            focusState.ai.remainingSec = 0;
            focusState.ai.lastStartTs = 0;
            focusState.ai.startRemainingSec = 0;
            // 对方专注结束，发送消息
            sendFocusEndMessage();
            // 倒计时归零，自动退出邀请（需用户重新邀请）
            focusState.ai.enabled = false;
            focusState.ai.locked = false;
            saveFocusState();
            syncFocusUI();
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
    const activity = focusState.user.activity || '专注';
    
    const MINute = 60;
    const FIVE_MINUTES = 5 * 60;
    
    // 判断是否需要确认弹窗
    if (focusState.user.mode === 'up') {
      // 正计时模式
      if (elapsed < MINute) {
        // 小于1分钟：不记录
        resetUserOnly();
        showToast('专注时长不足1分钟，不计入记录');
        return;
      }
      if (elapsed < FIVE_MINUTES) {
        // 大于等于1分钟但小于5分钟：需要确认
        showCommonDialog({
          title: '⚠️ 确认结束',
          message: '此次专注未满五分钟将不会被计入专注统计，是否确认结束？',
          showCancel: true,
          confirmText: '确认结束',
          cancelText: '继续专注',
          onConfirm: () => {
            resetUserOnly();
            showToast('本次专注不计入记录');
          }
        });
        return;
      }
      // 大于等于5分钟：正常记录
    } else {
      // 倒计时模式：提前结束需要确认
      const remaining = focusState.user.remainingSec || 0;
      if (remaining > 0) {
        showCommonDialog({
          title: '⚠️ 确认结束',
          message: '提前结束专注将不会计入专注统计，是否确认结束？',
          showCancel: true,
          confirmText: '确认结束',
          cancelText: '继续专注',
          onConfirm: () => {
            resetUserOnly();
            showToast('本次专注不计入记录');
          }
        });
        return;
      }
      // 正常结束：正常记录
    }
    
    // 正常结束，记录并显示弹窗
    const elapsedMin = Math.round(elapsed / 60);
    const durationMin = Math.round(duration / 60);
    const timeStr = elapsedMin > 0 ? `${elapsedMin}分钟` : `${durationMin}分钟`;
    const message = `${activity} · ${timeStr}`;
    
    // 记录到统计数据
    addFocusRecord('user', activity, elapsed, focusState.user.mode);
    
    resetUserOnly();
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
    
    // 计算AI专注时长并记录
    const elapsed = Math.round(computeUpElapsed(focusState.ai));
    const activity = focusState.ai.activity || '专注';
    // AI专注也记录（和用户专注一样判断条件）
    if (elapsed >= 5 * 60 || (focusState.ai.mode === 'down' && elapsed > 0)) {
      addFocusRecord('char', activity, elapsed, focusState.ai.mode);
    }
    
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

  // ---------- 分模块导入导出 ----------
  function downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function readJSONFile(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      try { callback(JSON.parse(e.target.result)); }
      catch(err) { showToast('文件解析失败：' + err.message); }
    };
    reader.readAsText(file);
  }

  // 聊天数据 + 控制中心配置
  function exportChatData() {
    const obj = {
      chat_messages: localStorage.getItem('chat_messages'),
      chat_preferences: localStorage.getItem('chat_preferences'),
      chat_roleplay_config_v2: localStorage.getItem('chat_roleplay_config_v2'),
      proactive_msg_prefs: localStorage.getItem('proactive_msg_prefs'),
      notification_prefs: localStorage.getItem('notification_prefs'),
      learned_traits: localStorage.getItem('learned_traits'),
    };
    downloadJSON(`corner_chat_${new Date().toISOString().slice(0,10)}.json`, obj);
  }

  function importChatData(file) {
    readJSONFile(file, data => {
      showCommonDialog({
        title: '导入聊天数据',
        message: '将覆盖当前聊天记录和控制中心配置，确定继续？',
        confirmText: '确定导入',
        onConfirm: () => {
          const keys = ['chat_messages','chat_preferences','chat_roleplay_config_v2','proactive_msg_prefs','notification_prefs','learned_traits'];
          keys.forEach(k => { if (data[k] != null) localStorage.setItem(k, data[k]); });
          showToast('导入成功，页面即将刷新');
          setTimeout(() => location.reload(), 800);
        }
      });
    });
  }

  // 人物设定
  function exportCharacterData() {
    const obj = {
      character_data: localStorage.getItem('character_data'),
    };
    downloadJSON(`corner_character_${new Date().toISOString().slice(0,10)}.json`, obj);
  }

  function importCharacterData(file) {
    readJSONFile(file, data => {
      showCommonDialog({
        title: '导入人物设定',
        message: '将覆盖当前人物设定，确定继续？',
        confirmText: '确定导入',
        onConfirm: () => {
          if (data.character_data != null) localStorage.setItem('character_data', data.character_data);
          showToast('导入成功，页面即将刷新');
          setTimeout(() => location.reload(), 800);
        }
      });
    });
  }

  // 用户个人资料
  function exportProfileData() {
    const obj = {
      profile_name: localStorage.getItem('profile_name'),
      profile_bio: localStorage.getItem('profile_bio'),
      user_avatar: localStorage.getItem('user_avatar'),
      user_cover: localStorage.getItem('user_cover'),
    };
    downloadJSON(`corner_profile_${new Date().toISOString().slice(0,10)}.json`, obj);
  }

  function importProfileData(file) {
    readJSONFile(file, data => {
      showCommonDialog({
        title: '导入个人资料',
        message: '将覆盖当前个人资料，确定继续？',
        confirmText: '确定导入',
        onConfirm: () => {
          ['profile_name','profile_bio','user_avatar','user_cover'].forEach(k => {
            if (data[k] != null) localStorage.setItem(k, data[k]);
          });
          showToast('导入成功，页面即将刷新');
          setTimeout(() => location.reload(), 800);
        }
      });
    });
  }

  // 统计数据
  function exportStatsData() {
    const obj = { stats_data: localStorage.getItem('stats_data') };
    downloadJSON(`corner_stats_${new Date().toISOString().slice(0,10)}.json`, obj);
  }

  function importStatsData(file) {
    readJSONFile(file, data => {
      showCommonDialog({
        title: '导入统计数据',
        message: '将覆盖当前统计数据，确定继续？',
        confirmText: '确定导入',
        onConfirm: () => {
          if (data.stats_data != null) localStorage.setItem('stats_data', data.stats_data);
          showToast('导入成功，页面即将刷新');
          setTimeout(() => location.reload(), 800);
        }
      });
    });
  }

  // 设置界面数据（主题、API配置）
  function exportSettingsData() {
    const obj = {
      chat_theme: localStorage.getItem('chat_theme'),
      chat_roleplay_config_v2: localStorage.getItem('chat_roleplay_config_v2'),
    };
    downloadJSON(`corner_settings_${new Date().toISOString().slice(0,10)}.json`, obj);
  }

  function importSettingsData(file) {
    readJSONFile(file, data => {
      showCommonDialog({
        title: '导入设置',
        message: '将覆盖当前设置，确定继续？',
        confirmText: '确定导入',
        onConfirm: () => {
          ['chat_theme','chat_roleplay_config_v2'].forEach(k => {
            if (data[k] != null) localStorage.setItem(k, data[k]);
          });
          showToast('导入成功，页面即将刷新');
          setTimeout(() => location.reload(), 800);
        }
      });
    });
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
    loadStatsData();  // 加载统计数据
    rebuildChatStatsFromHistory(); // 根据历史消息重建聊天统计（防止遗漏）
    await loadFocusAnimData();   // IndexedDB 异步读取
    normalizeFocusAfterLoad();
    renderMessages();
    buildChatPreferencesUI();
    loadProactiveMsgPrefs();
    buildProactiveMsgUI();
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
    statsIcon?.addEventListener('click', ()=>setActiveView('stats'));
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
    // 专注页面内的结束对方专注按钮
    const endAiFocusBtn2 = document.getElementById('endAiFocusBtn2');
    endAiFocusBtn2?.addEventListener('click', () => {
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

    // ---------- 分模块导入导出按钮绑定 ----------
    // 控制中心：聊天数据
    document.getElementById('chatDataExportBtn')?.addEventListener('click', exportChatData);
    document.getElementById('chatDataImportBtn')?.addEventListener('click', () => document.getElementById('chatDataImportInput').click());
    document.getElementById('chatDataImportInput')?.addEventListener('change', e => { if(e.target.files[0]) { importChatData(e.target.files[0]); e.target.value=''; } });

    // 人物设定
    document.getElementById('characterExportBtn')?.addEventListener('click', exportCharacterData);
    document.getElementById('characterImportBtn')?.addEventListener('click', () => document.getElementById('characterImportInput').click());
    document.getElementById('characterImportInput')?.addEventListener('change', e => { if(e.target.files[0]) { importCharacterData(e.target.files[0]); e.target.value=''; } });

    // 个人资料
    document.getElementById('profileExportBtn')?.addEventListener('click', exportProfileData);
    document.getElementById('profileImportBtn')?.addEventListener('click', () => document.getElementById('profileImportInput').click());
    document.getElementById('profileImportInput')?.addEventListener('change', e => { if(e.target.files[0]) { importProfileData(e.target.files[0]); e.target.value=''; } });

    // 统计数据
    document.getElementById('statsExportBtn')?.addEventListener('click', exportStatsData);
    document.getElementById('statsImportBtn')?.addEventListener('click', () => document.getElementById('statsImportInput').click());
    document.getElementById('statsImportInput')?.addEventListener('change', e => { if(e.target.files[0]) { importStatsData(e.target.files[0]); e.target.value=''; } });

    // 设置界面
    document.getElementById('settingsExportBtn')?.addEventListener('click', exportSettingsData);
    document.getElementById('settingsImportBtn')?.addEventListener('click', () => document.getElementById('settingsImportInput').click());
    document.getElementById('settingsImportInput')?.addEventListener('change', e => { if(e.target.files[0]) { importSettingsData(e.target.files[0]); e.target.value=''; } });

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
