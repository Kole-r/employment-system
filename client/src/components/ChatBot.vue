<template>
  <div class="chatbot-container" :style="containerStyle">
    <!-- 悬浮球按钮 -->
    <div class="chatbot-trigger" @mousedown="onDragStart" @touchstart="onDragStart" @click="toggleChat" :class="{ active: isOpen }">
      <span class="trigger-icon" v-if="!isOpen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </span>
      <span class="trigger-icon" v-else>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    </div>

    <!-- 对话窗口 -->
    <transition name="chat-expand">
      <div class="chatbot-window" :class="windowPosition" v-show="isOpen">
        <!-- 头部 -->
        <div class="chat-header">
          <div class="header-left">
            <div class="ai-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="header-text">
              <span class="header-title">就小助</span>
              <span class="header-status">AI ASSISTANT</span>
            </div>
          </div>
          <button class="close-btn" @click="toggleChat">[ X ]</button>
        </div>

        <!-- 消息展示区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <!-- 欢迎消息 -->
          <div class="welcome-screen" v-if="messages.length === 0">
            <div class="welcome-hero">AI</div>
            <p class="welcome-desc">就业服务智能助手，解答求职、简历、面试问题。</p>
            <div class="quick-actions">
              <button class="quick-btn" @click="sendQuickQuestion('如何写一份好的简历？')">简历撰写</button>
              <button class="quick-btn" @click="sendQuickQuestion('面试有哪些常见问题？')">面试技巧</button>
              <button class="quick-btn" @click="sendQuickQuestion('有哪些适合应届生的岗位？')">应届岗位</button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <div class="message-meta">
              <span class="message-role">{{ msg.role === 'user' ? 'YOU' : 'AI' }}</span>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
              <div v-if="msg.sources && msg.sources.length > 0" class="message-sources">
                <div class="sources-label">REF</div>
                <div v-for="(source, sIndex) in msg.sources" :key="sIndex" class="source-item">
                  <span class="source-type">{{ getSourceTypeLabel(source.type) }}</span>
                  <span class="source-score">{{ (source.relevance * 100).toFixed(0) }}%</span>
                  <span class="source-content">{{ source.content }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载状态：没有streaming内容时显示 -->
          <div v-if="isLoading && !streaming" class="message assistant loading-message">
            <div class="message-meta">
              <span class="message-role">AI</span>
            </div>
            <div class="message-content">
              <span class="loading-text">[ THINKING... ]</span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="input-container">
            <input
              ref="inputRef"
              v-model="inputMessage"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              @keyup.enter="onEnter"
              placeholder="输入问题..."
              :disabled="isLoading"
            />
            <button class="send-btn" @click="sendMessage" :disabled="isLoading || !inputMessage.trim()">
              {{ isLoading ? '...' : 'SEND' }}
            </button>
          </div>
          <div class="input-footer">AI-POWERED · FOR REFERENCE ONLY</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const streaming = ref(false)
const messagesContainer = ref(null)
const inputRef = ref(null)
const isComposing = ref(false)

const onEnter = () => {
  if (isComposing.value) return
  sendMessage()
}

// 拖拽状态
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const hasMoved = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const containerStyle = ref({})
const windowPosition = ref('top') // 'top' = 悬浮球上方, 'bottom' = 悬浮球下方

const updateContainerStyle = () => {
  const inBottomHalf = position.value.y > window.innerHeight / 2
  windowPosition.value = inBottomHalf ? 'top' : 'bottom'
  containerStyle.value = {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    right: 'auto',
    bottom: 'auto',
    '--trigger-y': `${position.value.y}px`
  }
}

const onDragStart = (e) => {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }
  isDragging.value = true
  hasMoved.value = false
}

const onDragMove = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const newX = clientX - dragOffset.value.x
  const newY = clientY - dragOffset.value.y

  if (Math.abs(newX - position.value.x) > 3 || Math.abs(newY - position.value.y) > 3) {
    hasMoved.value = true
  }

  const maxX = window.innerWidth - 48
  const maxY = window.innerHeight - 48
  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
  updateContainerStyle()
}

const onDragEnd = () => {
  isDragging.value = false
}

const toggleChat = () => {
  if (hasMoved.value) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    setTimeout(() => inputRef.value?.focus(), 300)
  }
}

onMounted(() => {
  // 初始化位置：右下角
  position.value = {
    x: window.innerWidth - 48 - 24,
    y: window.innerHeight - 48 - 24
  }
  updateContainerStyle()
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchmove', onDragMove, { passive: false })
  window.addEventListener('touchend', onDragEnd)
  scrollToBottom()
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchmove', onDragMove)
  window.removeEventListener('touchend', onDragEnd)
})

const getSourceTypeLabel = (type) => {
  const labels = {
    'job': '岗位',
    'news': '资讯',
    'knowledge': '知识'
  }
  return labels[type] || '其他'
}

const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const sendQuickQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

const sendMessage = async () => {
  const question = inputMessage.value.trim()
  if (!question || isLoading.value) return

  messages.value.push({ role: 'user', content: question })
  inputMessage.value = ''
  isLoading.value = true
  streaming.value = false

  let assistantIndex = -1

  try {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let sources = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留不完整的行

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = JSON.parse(line.slice(6))

        if (data.type === 'sources') {
          sources = data.sources
        } else if (data.type === 'token') {
          if (assistantIndex === -1) {
            // 第一个token到来：创建assistant消息，隐藏thinking
            messages.value.push({ role: 'assistant', content: data.token, sources: sources })
            assistantIndex = messages.value.length - 1
            streaming.value = true
          } else {
            messages.value[assistantIndex].content += data.token
          }
          scrollToBottom()
        } else if (data.type === 'done') {
          // 生成完成
        }
      }
    }

    // 如果最终没收到内容，显示兜底提示
    if (assistantIndex === -1 || !messages.value[assistantIndex].content) {
      if (assistantIndex === -1) {
        messages.value.push({ role: 'assistant', content: '抱歉，暂时无法回答您的问题，请稍后再试。' })
      } else {
        messages.value[assistantIndex].content = '抱歉，暂时无法回答您的问题，请稍后再试。'
      }
    }

  } catch (error) {
    console.error('发送消息失败:', error)
    const msg = '抱歉，网络异常，请稍后再试。'
    if (assistantIndex === -1) {
      messages.value.push({ role: 'assistant', content: msg })
    } else {
      messages.value[assistantIndex].content = msg
    }
  } finally {
    isLoading.value = false
    streaming.value = false
    scrollToBottom()
  }
}

</script>

<style scoped>
/* ========== Nothing Tokens ========== */
.chatbot-container {
  --nd-black: #F7F8FA;
  --nd-surface: #FFFFFF;
  --nd-surface-raised: #F2F4F7;
  --nd-border: #E4E7EB;
  --nd-border-visible: #D0D5DD;
  --nd-text-disabled: #98A2B3;
  --nd-text-secondary: #667085;
  --nd-text-primary: #344054;
  --nd-text-display: #101828;
  --nd-accent: #2563EB;
  --nd-accent-subtle: rgba(37,99,235,0.08);
  --nd-success: #16A34A;
  --nd-interactive: #2563EB;

  --font-body: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif;
  --font-mono: 'Space Mono', 'JetBrains Mono', monospace;
  --font-display: 'Doto', 'Space Mono', monospace;

  position: fixed;
  z-index: 9999;
  font-family: var(--font-body);
}

/* ========== Trigger Button ========== */
.chatbot-trigger {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--nd-surface);
  border: 1px solid var(--nd-border-visible);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease-out;
}

.chatbot-trigger:hover {
  border-color: var(--nd-text-secondary);
}

.chatbot-trigger.active {
  background: var(--nd-surface-raised);
  border-color: var(--nd-text-primary);
}

.trigger-icon {
  color: var(--nd-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== Chat Window ========== */
.chatbot-window {
  position: absolute;
  right: 0;
  width: 420px;
  max-height: min(600px, calc(100vh - 120px));
  background: var(--nd-black);
  border-radius: 16px;
  border: 1px solid var(--nd-border-visible);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-window.top {
  bottom: 64px;
  max-height: min(600px, calc(var(--trigger-y, 50vh) - 80px));
}

.chatbot-window.bottom {
  top: 64px;
  max-height: min(600px, calc(100vh - var(--trigger-y, 50vh) - 80px));
}

/* ========== Transitions ========== */
.chat-expand-enter-active {
  transition: opacity 0.3s ease-out;
}

.chat-expand-leave-active {
  transition: opacity 0.2s ease-out;
}

.chat-expand-enter-from,
.chat-expand-leave-to {
  opacity: 0;
}

/* ========== Header ========== */
.chat-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--nd-surface);
  border-bottom: 1px solid var(--nd-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--nd-surface-raised);
  border: 1px solid var(--nd-border-visible);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--nd-accent);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--nd-text-display);
  letter-spacing: -0.01em;
}

.header-status {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nd-text-disabled);
  letter-spacing: 0.06em;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--nd-text-disabled);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 8px;
  transition: color 0.2s ease-out;
}

.close-btn:hover {
  color: var(--nd-text-display);
}

/* ========== Messages ========== */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: var(--nd-black);
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-behavior: smooth;
}

/* ========== Welcome ========== */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 48px 0;
}

.welcome-hero {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 400;
  color: var(--nd-text-display);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 16px;
}

.welcome-desc {
  font-size: 14px;
  color: var(--nd-text-secondary);
  line-height: 1.5;
  margin: 0 0 32px;
  max-width: 280px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.quick-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid var(--nd-border-visible);
  border-radius: 8px;
  color: var(--nd-text-secondary);
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color 0.2s ease-out, color 0.2s ease-out;
}

.quick-btn:hover {
  border-color: var(--nd-text-primary);
  color: var(--nd-text-display);
}

/* ========== Messages ========== */
.message {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.message-meta {
  padding: 0 4px;
}

.message-role {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nd-text-disabled);
  letter-spacing: 0.08em;
}

.message.user .message-role {
  color: var(--nd-text-secondary);
}

.message-content {
  max-width: 85%;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
}

.message.assistant .message-content {
  background: var(--nd-surface);
  border: 1px solid var(--nd-border);
  border-radius: 4px 12px 12px 12px;
  color: var(--nd-text-primary);
}

.message.user .message-content {
  background: var(--nd-surface-raised);
  border: 1px solid var(--nd-border-visible);
  border-radius: 12px 12px 4px 12px;
  color: var(--nd-text-display);
}

.message-text :deep(p) {
  margin: 0 0 6px;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

/* ========== Sources ========== */
.message-sources {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--nd-border);
}

.sources-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nd-text-disabled);
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.source-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--nd-border);
}

.source-item:last-child {
  border-bottom: none;
}

.source-type {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--nd-text-secondary);
}

.source-score {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nd-text-disabled);
}

.source-content {
  flex-basis: 100%;
  color: var(--nd-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ========== Loading ========== */
.loading-message {
  animation: none;
}

.loading-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--nd-text-disabled);
  letter-spacing: 0.06em;
  animation: load-blink 1.5s step-end infinite;
}

@keyframes load-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ========== Input Area ========== */
.chat-input-area {
  padding: 16px 20px;
  background: var(--nd-surface);
  border-top: 1px solid var(--nd-border);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-input-area input {
  flex: 1;
  height: 44px;
  border: none;
  border-bottom: 1px solid var(--nd-border-visible);
  background: transparent;
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  color: var(--nd-text-primary);
  padding: 0 4px;
  transition: border-color 0.2s ease-out;
}

.chat-input-area input:focus {
  border-bottom-color: var(--nd-text-primary);
}

.chat-input-area input::placeholder {
  color: var(--nd-text-disabled);
}

.chat-input-area input:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.send-btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--nd-border-visible);
  color: var(--nd-text-disabled);
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s ease-out, color 0.2s ease-out;
}

.send-btn:hover:not(:disabled) {
  border-color: var(--nd-text-primary);
  color: var(--nd-text-primary);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-footer {
  margin-top: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--nd-text-disabled);
  letter-spacing: 0.06em;
}

/* ========== Scrollbar ========== */
.chat-messages::-webkit-scrollbar {
  width: 2px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--nd-border-visible);
}

/* ========== Responsive ========== */
@media (max-width: 480px) {
  .chatbot-window {
    width: calc(100vw - 32px);
    right: -8px;
    border-radius: 12px;
  }
}
</style>
