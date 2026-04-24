<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>一隅·aCorner</title>

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="logos/favicon-32.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="logos/logo-180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="logos/logo-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="logos/logo-512.png">
    <link rel="apple-touch-icon" href="logos/logo-180.png">

    <!-- PWA 设置 -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="一隅">
    <meta name="theme-color" content="#0f9960">
    <meta name="msapplication-TileColor" content="#0f9960">

    <!-- 外部样式 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="app">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
        <div class="sidebar-icon active" title="当前对话"><i class="fas fa-comment-dots"></i></div>
        <div class="sidebar-icon" title="人物管理" id="characterIcon"><i class="fas fa-user-tag"></i></div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-icon" title="设置"><i class="fas fa-cog"></i></div>
        <div class="sidebar-icon" title="数据管理" id="dataManagerIcon"><i class="fas fa-database"></i></div>
        <div class="sidebar-icon" title="更多"><i class="fas fa-plus"></i></div>
        <div class="sidebar-footer">
            <div class="user-avatar" id="userAvatarBtn" title="个人主页">
                <i class="fas fa-user"></i>
            </div>
        </div>
    </aside>

    <!-- 聊天主体 -->
    <main class="chat-main" id="chatMain">
        <!-- 聊天视图 -->
        <div class="chat-view" id="chatView">
            <header class="chat-header">
                <div class="header-left"></div>
                <div class="chat-title" id="chatTitleDisplay">✨ 青绿角色</div>
                <div class="header-right">
                    <button class="menu-btn" id="configMenuBtn" title="API 设置 · 主题切换"><i class="fas fa-ellipsis-h"></i></button>
                </div>
            </header>
            <div class="messages-area" id="messagesArea">
                <div class="message-row assistant">
                    <div class="message-bubble">
                        你好！我是青绿色调的角色。点击左侧齿轮设置 API。
                        <div class="message-time">刚刚</div>
                    </div>
                </div>
            </div>
            <div class="input-area">
                <div class="input-container">
                    <textarea id="messageInput" placeholder="输入消息… (Enter发送)" rows="1"></textarea>
                    <button class="send-btn" id="sendBtn" title="发送"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>

        <!-- 设置视图 -->
        <div class="settings-view" id="settingsView">
            <h2 style="margin-bottom: 20px; font-weight: 500;"><i class="fas fa-cog" style="margin-right: 12px;"></i>设置</h2>
            <div class="settings-card">
                <h3><i class="fas fa-palette"></i> 外观</h3>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span class="theme-toggle-label"><i class="fas fa-moon"></i> 深色模式</span>
                    <div class="apple-toggle" id="themeToggleSettings"></div>
                </div>
                <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
                    <span id="themeLabelTextSettings">深色模式</span>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-cloud"></i> API 配置</h3>
                <div class="config-group">
                    <label>API 服务商</label>
                    <select id="apiProviderSelect">
                        <option value="deepseek">DeepSeek</option>
                        <option value="openai">OpenAI</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="groq">Groq</option>
                        <option value="custom">自定义</option>
                    </select>
                </div>
                <div class="config-group">
                    <label>API 地址</label>
                    <input type="text" id="apiUrlInput" placeholder="https://..." value="https://api.deepseek.com/v1/chat/completions">
                </div>
                <div class="config-group">
                    <label>模型</label>
                    <select id="modelSelect">
                        <optgroup label="DeepSeek">
                            <option value="deepseek-chat">DeepSeek Chat</option>
                            <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                        </optgroup>
                        <optgroup label="OpenAI">
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4o">GPT-4o</option>
                        </optgroup>
                        <optgroup label="OpenRouter (免费/收费)">
                            <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (免费)</option>
                            <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (免费)</option>
                            <option value="openai/gpt-3.5-turbo">GPT-3.5 (OpenRouter)</option>
                        </optgroup>
                        <optgroup label="Groq">
                            <option value="llama3-8b-8192">Llama 3 8B</option>
                            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                        </optgroup>
                        <optgroup label="其他">
                            <option value="custom">自定义</option>
                        </optgroup>
                    </select>
                    <input type="text" id="modelInput" placeholder="自定义模型ID" value="deepseek-chat" style="margin-top: 8px;">
                </div>
                <div class="config-group">
                    <label>API Key</label>
                    <input type="password" id="apiKeyInput" placeholder="sk-..." autocomplete="off">
                    <span class="status-badge" id="apiStatus">未设置</span>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="btn btn-primary" id="saveConfigBtn"><i class="fas fa-save"></i> 保存配置</button>
                    <button class="btn btn-secondary" id="testConnectionBtn"><i class="fas fa-vial"></i> 测试连接</button>
                </div>
                <div style="margin-top: 16px; font-size: 12px; color: var(--text-secondary); background: var(--input-bg); padding: 12px; border-radius: 8px; border-left: 3px solid var(--accent);">
                    <i class="fas fa-info-circle"></i> <strong>免费 API 推荐</strong><br>
                    • DeepSeek：注册送额度，地址 <code>https://api.deepseek.com/v1/chat/completions</code><br>
                    • Groq：免费，地址 <code>https://api.groq.com/openai/v1/chat/completions</code><br>
                    • OpenRouter：有免费模型，地址 <code>https://openrouter.ai/api/v1/chat/completions</code>
                </div>
            </div>
        </div>

        <!-- 个人主页视图 -->
        <div class="profile-view" id="profileView">
            <div class="profile-banner">
                <div class="profile-banner-content">
                    <div class="profile-avatar-large" id="profileAvatarLarge"><i class="fas fa-user"></i></div>
                    <div class="profile-info">
                        <h2 id="profileDisplayName">用户</h2>
                        <p id="profileBioDisplay"><i class="fas fa-quote-left" style="margin-right: 8px;"></i>在一隅，遇见自己。</p>
                    </div>
                    <button class="btn btn-secondary" id="editProfileBtn"><i class="fas fa-pen"></i> 编辑个人资料</button>
                </div>
            </div>
            <div class="profile-content">
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3 style="font-weight: 400; margin-bottom: 8px;">更多功能开发中</h3>
                    <p>敬请期待</p>
                </div>
            </div>
        </div>

        <!-- 人物管理视图 -->
        <div class="character-view" id="characterView">
            <h2 style="margin-bottom: 20px; font-weight: 500;"><i class="fas fa-user-tag" style="margin-right: 12px;"></i>人物设定</h2>
            <div style="display: flex; align-items: baseline; margin-bottom: 6px;">
                <span style="font-size: 16px; font-weight: 500; color: var(--text-primary);"><i class="fas fa-image" style="margin-right: 8px;"></i>角色卡片预览</span>
            </div>
            <div class="character-preview-card" id="characterPreviewCard">
                <div class="character-preview-bg" id="characterPreviewBg"></div>
                <div class="character-preview-content">
                    <div class="character-preview-avatar" id="characterPreviewAvatar"><i class="fas fa-user-astronaut"></i></div>
                    <div class="character-preview-info">
                        <h3 id="characterPreviewName">角色名称</h3>
                        <p id="characterPreviewBio"><i class="fas fa-quote-left" style="margin-right: 6px;"></i>温柔而冷静的陪伴</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" id="editCharacterAvatarBtn" style="padding: 8px 12px; white-space: nowrap;"><i class="fas fa-camera"></i> 头像</button>
                        <button class="btn btn-secondary" id="editCharacterCoverBtn" style="padding: 8px 12px; white-space: nowrap;"><i class="fas fa-image"></i> 背景</button>
                    </div>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-globe"></i> 世界书 · 世界观</h3>
                <div class="config-group">
                    <label>背景设定（不变的世界规则）</label>
                    <textarea id="worldBookInput" rows="4" placeholder="例如：这是一个魔法与科技并存的近未来世界，人类与精灵共存，但龙族已灭绝千年……"></textarea>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-id-card"></i> 人物表单</h3>
                <div class="config-group">
                    <label>角色名称（显示在标题栏和预览）</label>
                    <input type="text" id="characterNameInput" value="角色名称">
                </div>
                <div class="config-group">
                    <label>个性签名</label>
                    <input type="text" id="characterBioInput" placeholder="例如：温柔而冷静的陪伴" value="温柔而冷静的陪伴">
                </div>
                <div class="config-group">
                    <label>姓名</label>
                    <input type="text" id="charNameInput" placeholder="例如：林清瑶">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="config-group">
                        <label>年龄</label>
                        <input type="text" id="charAgeInput" placeholder="例如：24">
                    </div>
                    <div class="config-group">
                        <label>性别</label>
                        <input type="text" id="charGenderInput" placeholder="例如：女">
                    </div>
                </div>
                <div class="config-group">
                    <label>外貌描写</label>
                    <textarea id="charAppearanceInput" rows="2" placeholder="例如：黑色长发，常穿素色长裙，眼神清冷但偶有温柔"></textarea>
                </div>
                <div class="config-group">
                    <label>人设提示词（基础角色指令）</label>
                    <textarea id="systemPromptInput" rows="3" placeholder="例如：你是一个冷静又带点青涩的助手，说话简洁但偶尔流露出温柔。">你是一个冷静又带点青涩的助手，说话简洁但偶尔流露出温柔。请务必根据当前真实时间调整对话内容。</textarea>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-smile"></i> 性格</h3>
                <div class="config-group">
                    <label>性格描述</label>
                    <textarea id="charPersonalityInput" rows="3" placeholder="例如：外表冷淡，内心善良，对认可的人会不自觉地关心，说话带点傲娇"></textarea>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-history"></i> 过往经历</h3>
                <div class="config-group">
                    <label>背景故事</label>
                    <textarea id="charBackstoryInput" rows="4" placeholder="例如：曾是帝国骑士，因不愿服从腐败命令而离开军队，流浪中习得医术……"></textarea>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-brain"></i> 核心记忆</h3>
                <div class="config-group">
                    <label>重要事件/人物关系</label>
                    <textarea id="charMemoriesInput" rows="3" placeholder="例如：- 师父在临终前将古剑托付给她\n- 曾经救过一个叫阿诺的少年\n- 对甜食没有抵抗力"></textarea>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-comment-dots"></i> 对话风格</h3>
                <div class="config-group">
                    <label>风格描述</label>
                    <textarea id="charStyleInput" rows="2" placeholder="例如：句子简短，偶尔使用「……」，生气时会说「哼」"></textarea>
                </div>
                <details style="margin-top: 12px;">
                    <summary style="cursor: pointer; color: var(--accent);">高级设置 · 对话示例</summary>
                    <div class="config-group" style="margin-top: 12px;">
                        <label>示例对话（每行一条，格式：用户说 → 角色回复）</label>
                        <textarea id="charExamplesInput" rows="4" placeholder="用户：你好呀\n角色：……你是谁？有什么事吗？\n用户：想和你聊聊\n角色：哼，我很忙的，不过既然你坚持……"></textarea>
                    </div>
                </details>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 8px; margin-bottom: 24px;">
                <button class="btn btn-primary" id="saveCharacterBtn"><i class="fas fa-save"></i> 保存人物设定</button>
                <button class="btn btn-secondary" id="resetCharacterBtn"><i class="fas fa-undo-alt"></i> 重置</button>
            </div>
        </div>

        <!-- 数据管理视图 -->
        <div class="data-manager-view" id="dataManagerView" style="flex:1; background: var(--bg-chat-main); padding: 24px 32px; overflow-y: auto; color: var(--text-primary);">
            <h2 style="margin-bottom: 20px; font-weight: 500;"><i class="fas fa-database" style="margin-right: 12px;"></i>数据管理</h2>
            <div class="settings-card">
                <h3><i class="fas fa-chart-pie"></i> 存储概览</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="background: var(--bg-header); border-radius: 12px; padding: 16px;">
                        <div style="font-size: 13px; color: var(--text-secondary);">总占用空间</div>
                        <div style="font-size: 32px; font-weight: 600; margin-top: 8px;" id="totalStorageSize">0 KB</div>
                    </div>
                    <div style="background: var(--bg-header); border-radius: 12px; padding: 16px;">
                        <div style="font-size: 13px; color: var(--text-secondary);">存储项数量</div>
                        <div style="font-size: 32px; font-weight: 600; margin-top: 8px;" id="totalStorageItems">0</div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <table style="width:100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-light);">
                                <th style="text-align: left; padding: 12px 0; color: var(--text-secondary); font-weight: 500;">存储项</th>
                                <th style="text-align: right; padding: 12px 0; color: var(--text-secondary); font-weight: 500;">大小</th>
                            </tr>
                        </thead>
                        <tbody id="storageDetailsTable"></tbody>
                    </table>
                </div>
            </div>
            <div class="settings-card">
                <h3><i class="fas fa-exchange-alt"></i> 导入 / 导出</h3>
                <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">导出全部数据为 JSON 文件，或从之前导出的文件恢复所有设置。</p>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="exportDataBtn" style="flex:1;"><i class="fas fa-download"></i> 导出全部数据</button>
                    <button class="btn btn-secondary" id="importDataBtn" style="flex:1;"><i class="fas fa-upload"></i> 导入数据文件</button>
                    <input type="file" id="importFileInput" accept=".json,application/json" style="display:none;">
                </div>
                <div style="margin-top: 16px; font-size: 13px; color: var(--text-secondary);">
                    <i class="fas fa-info-circle"></i> 导入数据将覆盖当前所有设置，建议先导出备份。
                </div>
            </div>
        </div>
    </main>

    <!-- 图片裁剪模态框 -->
    <div class="modal-overlay" id="cropModalOverlay" style="display: none;">
        <div class="modal-container">
            <div class="modal-header">
                <h3>调整图片</h3>
                <button class="modal-close" id="closeCropModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="crop-container">
                    <img id="cropImage" src="" alt="裁剪图片">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelCropBtn">取消</button>
                <button class="btn btn-primary" id="saveCropBtn">保存</button>
            </div>
        </div>
    </div>

    <!-- 编辑个人资料模态框 -->
    <div class="modal-overlay" id="editProfileModalOverlay" style="display: none;">
        <div class="modal-container" style="width: 450px;">
            <div class="modal-header">
                <h3>编辑个人资料</h3>
                <button class="modal-close" id="closeEditProfileModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="config-group">
                    <label>显示名称</label>
                    <input type="text" id="editProfileNameInput" placeholder="你的名字" value="用户">
                </div>
                <div class="config-group">
                    <label>个性签名</label>
                    <input type="text" id="editProfileBioInput" placeholder="写点什么..." value="在一隅，遇见自己。">
                </div>
                <div class="config-group">
                    <label>头像</label>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button class="btn btn-secondary" id="editUploadAvatarBtn" style="flex: 1;"><i class="fas fa-camera"></i> 上传头像</button>
                        <span style="font-size: 12px; color: var(--text-secondary);">1:1</span>
                    </div>
                </div>
                <div class="config-group">
                    <label>主页背景</label>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button class="btn btn-secondary" id="editUploadCoverBtn" style="flex: 1;"><i class="fas fa-image"></i> 上传背景图</button>
                        <span style="font-size: 12px; color: var(--text-secondary);">16:9</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelEditProfileBtn">取消</button>
                <button class="btn btn-primary" id="saveEditProfileBtn">保存</button>
            </div>
        </div>
    </div>

    <!-- 遮罩 + 抽屉 -->
    <div class="drawer-overlay" id="drawerOverlay"></div>
    <div class="config-drawer" id="configDrawer">
        <div class="drawer-header">
            <h3><i class="fas fa-sliders-h" style="margin-right: 8px;"></i> 控制中心</h3>
            <button class="close-drawer" id="closeDrawerBtn"><i class="fas fa-times"></i></button>
        </div>
        <div class="drawer-content">
            <div style="margin-top: 20px;">
                <button class="btn btn-warning" id="clearChatBtn" style="width: 100%;"><i class="fas fa-trash-alt"></i> 清空对话记录</button>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-light);">
                <i class="fas fa-info-circle"></i> 完整 API 设置请点击左侧齿轮图标。
            </div>
        </div>
    </div>

    <!-- 外部脚本 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
    <script src="js/script.js"></script>
</body>
</html>
