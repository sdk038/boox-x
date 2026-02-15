import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import '../pages/AIAssistant.css';


const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};


const parseMarkdown = (text) => {
  if (!text) return '';
  const codeBlocks = [];
  let processed = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    const langLabel = lang || 'code';
    codeBlocks.push(
      `<div class="code-wrapper">` +
        `<div class="code-header">` +
          `<span class="code-lang">${langLabel}</span>` +
          `<button class="copy-btn" data-code-idx="${idx}" onclick="window.__copyCode(this)">📋 Копировать</button>` +
        `</div>` +
        `<pre><code class="code-block ${lang}" data-raw-idx="${idx}">${escapeHtml(code.trim())}</code></pre>` +
      `</div>`
    );
    return `%%CODEBLOCK_${idx}%%`;
  });

  const inlineCodes = [];
  processed = processed.replace(/`([^`]+)`/g, (match, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code class="inline-code">${escapeHtml(code)}</code>`);
    return `%%INLINE_${idx}%%`;
  });

  processed = processed

    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    // Нумерованные списки
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    // Горизонтальная линия
    .replace(/^---$/gm, '<hr/>')
    // Переносы строк
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  
  // Оборачиваем последовательные <li> в <ul>
  processed = processed.replace(/(<li>.*?<\/li>)(\s*<br\/>)*(<li>)/g, '$1$3');
  processed = processed.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
  processed = processed.replace(/<\/ul>\s*<ul>/g, '');

  // Шаг 4: Возвращаем блоки кода на место
  codeBlocks.forEach((block, idx) => {
    processed = processed.replace(`%%CODEBLOCK_${idx}%%`, block);
  });
  inlineCodes.forEach((code, idx) => {
    processed = processed.replace(`%%INLINE_${idx}%%`, code);
  });
  
  return processed;
};

// Глобальная функция копирования кода
if (typeof window !== 'undefined') {
  window.__copyCode = (btn) => {
    const wrapper = btn.closest('.code-wrapper');
    const codeEl = wrapper?.querySelector('code');
    if (codeEl) {
      const text = codeEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅ Скопировано!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 Копировать';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.textContent = '✅ Скопировано!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 Копировать';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
  };
}

const MessageContent = ({ content }) => {
  return (
    <div 
      className="message-text"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

const AIAssistant = () => {
  const [activeMode, setActiveMode] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Генерация проекта
  const [projectDescription, setProjectDescription] = useState('');
  const [projectPreferences, setProjectPreferences] = useState('');
  
  // Чат
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  const handleGenerateProject = async () => {
    if (!projectDescription.trim()) {
      setError('Пожалуйста, опишите проект');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await aiAPI.generateProject(projectDescription, projectPreferences);
      
      if (response.data.success) {
        setResult(response.data.project);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка генерации проекта');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!result) return;

    try {
      setLoading(true);
      const response = await aiAPI.createProjectFromAI(result);
      
      if (response.data.success) {
        alert('✅ Проект создан успешно!');
        setResult(null);
        setProjectDescription('');
        setProjectPreferences('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания проекта');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');

    try {
      setLoading(true);
      setError('');
      
      // Собираем контекст из последних сообщений
      const recentMessages = chatMessages.slice(-6).map(m => 
        `${m.role === 'user' ? 'Пользователь' : 'AI'}: ${m.content}`
      ).join('\n');
      
      const response = await aiAPI.chat(currentInput, recentMessages || null);
      
      if (response.data.success) {
        const aiMessage = { 
          role: 'assistant', 
          content: response.data.reply,
          source: response.data.source 
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      const errorMsg = { 
        role: 'assistant', 
        content: '⚠️ Произошла ошибка. Попробуйте ещё раз.' 
      };
      setChatMessages(prev => [...prev, errorMsg]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setError('');
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h1>🤖 AI Ассистент</h1>
        <p>Powered by Daler AI — задавайте любые вопросы</p>
      </div>

      <div className="ai-modes">
        <button 
          className={activeMode === 'chat' ? 'active' : ''}
          onClick={() => setActiveMode('chat')}
        >
          💬 Чат с AI
        </button>
        <button 
          className={activeMode === 'generate' ? 'active' : ''}
          onClick={() => setActiveMode('generate')}
        >
          ✨ Генерация проекта
        </button>
      </div>

      {error && (
        <div className="ai-error">
          {error}
          <button onClick={() => setError('')} className="error-close">✕</button>
        </div>
      )}

      {activeMode === 'generate' && (
        <div className="ai-generate-mode">
          <div className="ai-input-section">
            <h3>Опишите ваш проект</h3>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Например: Создать мобильное приложение для доставки еды с функциями заказа, отслеживания курьера и оплаты"
              rows="4"
              disabled={loading}
            />

            <h3>Дополнительные предпочтения (опционально)</h3>
            <textarea
              value={projectPreferences}
              onChange={(e) => setProjectPreferences(e.target.value)}
              placeholder="Например: Срок - 3 месяца, команда из 5 человек, бюджет ограничен"
              rows="2"
              disabled={loading}
            />

            <button 
              className="ai-button primary"
              onClick={handleGenerateProject}
              disabled={loading || !projectDescription.trim()}
            >
              {loading ? '⏳ Генерация...' : '✨ Сгенерировать проект'}
            </button>
          </div>

          {result && (
            <div className="ai-result">
              <h2>🎯 {result.projectName}</h2>
              <p className="project-description">{result.description}</p>

              <div className="tasks-preview">
                <h3>📋 Задачи ({result.tasks?.length || 0})</h3>
                {result.tasks?.map((task, index) => (
                  <div key={index} className="task-item">
                    <div className="task-header">
                      <span className="task-title">{task.title}</span>
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                        {task.priority}
                      </span>
                    </div>
                    <p className="task-desc">{task.description}</p>
                    {task.estimatedDays && (
                      <span className="task-estimate">⏱️ {task.estimatedDays} дней</span>
                    )}
                  </div>
                ))}
              </div>

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="recommendations">
                  <h3>💡 Рекомендации</h3>
                  <ul>
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ai-actions">
                <button 
                  className="ai-button success"
                  onClick={handleCreateProject}
                  disabled={loading}
                >
                  ✅ Создать этот проект
                </button>
                <button 
                  className="ai-button secondary"
                  onClick={handleGenerateProject}
                  disabled={loading}
                >
                  🔄 Сгенерировать заново
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMode === 'chat' && (
        <div className="ai-chat-mode">
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-icon">🤖</div>
                <h2>Привет! Я ваш AI-ассистент</h2>
                <p>Я могу помочь с чем угодно:</p>
                <div className="welcome-cards">
                  <div className="welcome-card" onClick={() => { setChatInput('Напиши мне навбар на React'); }}>
                    <span className="card-icon">💻</span>
                    <span>Написать код</span>
                  </div>
                  <div className="welcome-card" onClick={() => { setChatInput('Создай план проекта интернет-магазина'); }}>
                    <span className="card-icon">📋</span>
                    <span>План проекта</span>
                  </div>
                  <div className="welcome-card" onClick={() => { setChatInput('Как оптимизировать React приложение?'); }}>
                    <span className="card-icon">⚡</span>
                    <span>Советы</span>
                  </div>
                  <div className="welcome-card" onClick={() => { setChatInput('Объясни как работает async/await'); }}>
                    <span className="card-icon">📚</span>
                    <span>Обучение</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-msg ${msg.role}`}>
                    {msg.role === 'user' ? (
                      <div className="user-bubble">
                        <span>{msg.content}</span>
                      </div>
                    ) : (
                      <div className="ai-response-block">
                        <div className="ai-response-header">
                          <span className="ai-badge">🤖 AI</span>
                          {msg.source && (
                            <span className="ai-source-badge">
                              {msg.source === 'gemini' ? '✨ Daler' : '📝 Demo'}
                            </span>
                          )}
                        </div>
                        <div className="ai-response-body">
                          <MessageContent content={msg.content} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            {loading && (
              <div className="chat-msg assistant">
                <div className="ai-response-block">
                  <div className="ai-response-header">
                    <span className="ai-badge">🤖 AI</span>
                  </div>
                  <div className="ai-response-body">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            {chatMessages.length > 0 && (
              <button onClick={clearChat} className="clear-chat-btn" title="Очистить чат">
                🗑️
              </button>
            )}
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите что-нибудь... (Enter для отправки)"
              disabled={loading}
            />
            <button 
              onClick={handleChat}
              disabled={loading || !chatInput.trim()}
              className="send-button"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
