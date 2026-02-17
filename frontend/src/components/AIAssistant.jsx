import React, { useState, useRef, useEffect } from 'react';
import { aiAPI, trackingAPI } from '../services/api';
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

// ============== Компонент слайда ==============
const SlideRenderer = ({ slide, index, total }) => {
  switch (slide.type) {
    case 'title':
      return (
        <div className="slide slide-title">
          <div className="slide-emoji-big">{slide.emoji}</div>
          <h1>{slide.title}</h1>
          <p className="slide-subtitle">{slide.subtitle}</p>
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
    case 'content':
      return (
        <div className="slide slide-content">
          <h2>{slide.emoji} {slide.title}</h2>
          <ul className="slide-bullets">
            {slide.bullets?.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          {slide.note && <p className="slide-note">💡 {slide.note}</p>}
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
    case 'two-columns':
      return (
        <div className="slide slide-two-cols">
          <h2>{slide.emoji} {slide.title}</h2>
          <div className="slide-columns">
            <div className="slide-col">
              <h3>{slide.left?.heading}</h3>
              <ul>{slide.left?.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="slide-col">
              <h3>{slide.right?.heading}</h3>
              <ul>{slide.right?.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
    case 'quote':
      return (
        <div className="slide slide-quote">
          <div className="slide-emoji-big">{slide.emoji}</div>
          <blockquote>"{slide.quote}"</blockquote>
          <p className="slide-quote-author">— {slide.author}</p>
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
    case 'stats':
      return (
        <div className="slide slide-stats">
          <h2>{slide.emoji} {slide.title}</h2>
          <div className="slide-stats-grid">
            {slide.stats?.map((s, i) => (
              <div key={i} className="slide-stat-item">
                <div className="slide-stat-value">{s.value}</div>
                <div className="slide-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
    case 'end':
      return (
        <div className="slide slide-end">
          <div className="slide-emoji-big">{slide.emoji}</div>
          <h1>{slide.title}</h1>
          <p className="slide-subtitle">{slide.subtitle}</p>
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
    default:
      return (
        <div className="slide slide-content">
          <h2>{slide.title}</h2>
          <p>{JSON.stringify(slide)}</p>
          <div className="slide-number">{index + 1} / {total}</div>
        </div>
      );
  }
};

// ============== Просмотрщик презентации ==============
const PresentationViewer = ({ presentation, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slides = presentation.slides || [];

  const goNext = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const goPrev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipe = 50;
    if (Math.abs(diff) > minSwipe) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape') { 
        if (isFullscreen) toggleFullscreen();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const exportHTML = () => {
    const colors = ['#4066ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
    const slidesHTML = slides.map((slide, i) => {
      const bg = colors[i % colors.length];
      let content = '';
      switch (slide.type) {
        case 'title':
          content = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center"><div style="font-size:80px;margin-bottom:30px">${slide.emoji||''}</div><h1 style="font-size:52px;margin:0 0 16px;font-weight:800">${slide.title}</h1><p style="font-size:24px;opacity:0.85">${slide.subtitle||''}</p></div>`;
          break;
        case 'content':
          content = `<h2 style="font-size:38px;margin-bottom:32px">${slide.emoji||''} ${slide.title}</h2><ul style="font-size:22px;line-height:2;list-style:none;padding:0">${(slide.bullets||[]).map(b => `<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.15)">▸ ${b}</li>`).join('')}</ul>`;
          break;
        case 'two-columns':
          content = `<h2 style="font-size:38px;margin-bottom:32px">${slide.emoji||''} ${slide.title}</h2><div style="display:flex;gap:40px"><div style="flex:1;background:rgba(255,255,255,0.1);padding:24px;border-radius:16px"><h3 style="margin:0 0 16px">${slide.left?.heading||''}</h3><ul style="padding-left:20px;line-height:1.8">${(slide.left?.items||[]).map(i => `<li>${i}</li>`).join('')}</ul></div><div style="flex:1;background:rgba(255,255,255,0.1);padding:24px;border-radius:16px"><h3 style="margin:0 0 16px">${slide.right?.heading||''}</h3><ul style="padding-left:20px;line-height:1.8">${(slide.right?.items||[]).map(i => `<li>${i}</li>`).join('')}</ul></div></div>`;
          break;
        case 'quote':
          content = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center"><div style="font-size:60px;margin-bottom:20px">${slide.emoji||''}</div><blockquote style="font-size:30px;font-style:italic;max-width:700px;line-height:1.6">"${slide.quote}"</blockquote><p style="font-size:20px;opacity:0.8;margin-top:24px">— ${slide.author||''}</p></div>`;
          break;
        case 'stats':
          content = `<h2 style="font-size:38px;margin-bottom:40px;text-align:center">${slide.emoji||''} ${slide.title}</h2><div style="display:grid;grid-template-columns:repeat(${Math.min((slide.stats||[]).length,4)},1fr);gap:24px">${(slide.stats||[]).map(s => `<div style="background:rgba(255,255,255,0.15);padding:32px;border-radius:16px;text-align:center"><div style="font-size:42px;font-weight:800;margin-bottom:8px">${s.value}</div><div style="font-size:16px;opacity:0.85">${s.label}</div></div>`).join('')}</div>`;
          break;
        case 'end':
          content = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center"><div style="font-size:80px;margin-bottom:30px">${slide.emoji||''}</div><h1 style="font-size:52px;margin:0 0 16px;font-weight:800">${slide.title}</h1><p style="font-size:24px;opacity:0.85">${slide.subtitle||''}</p></div>`;
          break;
        default:
          content = `<h2>${slide.title||''}</h2>`;
      }
      return `<div class="slide" style="background:${bg};min-height:100vh;padding:60px 80px;color:white;display:flex;flex-direction:column;justify-content:center;font-family:'Segoe UI',sans-serif;page-break-after:always">${content}<div style="position:absolute;bottom:24px;right:40px;opacity:0.5;font-size:14px">${i+1} / ${slides.length}</div></div>`;
    }).join('\n');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${presentation.title}</title><style>*{margin:0;padding:0;box-sizing:border-box}.slide{position:relative}@media print{.slide{page-break-after:always}}</style></head><body>${slidesHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title || 'presentation'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!slides.length) return null;

  return (
    <div className={`pres-viewer ${isFullscreen ? 'fullscreen' : ''}`} ref={viewerRef}>
      <div className="pres-toolbar">
        <button className="pres-tool-btn" onClick={onClose}>✕ Закрыть</button>
        <span className="pres-slide-counter">{currentSlide + 1} / {slides.length}</span>
        <div className="pres-tool-right">
          <button className="pres-tool-btn" onClick={exportHTML}>📥 Скачать HTML</button>
          <button className="pres-tool-btn" onClick={toggleFullscreen}>
            {isFullscreen ? '🔲 Свернуть' : '🔳 На весь экран'}
          </button>
        </div>
      </div>

      <div 
        className="pres-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className="pres-nav-btn prev" onClick={goPrev} disabled={currentSlide === 0}>‹</button>
        <div className="pres-slide-frame">
          <SlideRenderer slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
        </div>
        <button className="pres-nav-btn next" onClick={goNext} disabled={currentSlide === slides.length - 1}>›</button>
      </div>

      <div className="pres-thumbnails">
        {slides.map((slide, i) => (
          <button
            key={i}
            className={`pres-thumb ${i === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(i)}
          >
            <span className="pres-thumb-emoji">{slide.emoji || '📄'}</span>
            <span className="pres-thumb-num">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const [activeMode, setActiveMode] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Генерация проекта
  const [projectDescription, setProjectDescription] = useState('');
  const [projectPreferences, setProjectPreferences] = useState('');
  
  // Чат
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  // Презентация
  const [presTopic, setPresTopic] = useState('');
  const [presSlides, setPresSlides] = useState(8);
  const [presStyle, setPresStyle] = useState('modern');
  const [presentation, setPresentation] = useState(null);

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
      
      trackingAPI.track('ai_generate_project', `Генерация проекта: ${projectDescription.substring(0, 80)}`, 'ai');
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

  const typeText = (fullText, source) => {
    const msgId = Date.now();
    const aiMessage = { 
      role: 'assistant', 
      content: '', 
      source,
      typing: true,
      id: msgId
    };
    setChatMessages(prev => [...prev, aiMessage]);

    let i = 0;
    const chunkSize = 3;
    const speed = 15;
    
    const typeInterval = setInterval(() => {
      i += chunkSize;
      if (i >= fullText.length) {
        setChatMessages(prev => prev.map(m => 
          m.id === msgId ? { ...m, content: fullText, typing: false } : m
        ));
        clearInterval(typeInterval);
        setLoading(false);
      } else {
        setChatMessages(prev => prev.map(m => 
          m.id === msgId ? { ...m, content: fullText.slice(0, i) } : m
        ));
      }
    }, speed);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');

    try {
      setLoading(true);
      setIsWaiting(true);
      setError('');
      
      const recentMessages = chatMessages.slice(-6).map(m => 
        `${m.role === 'user' ? 'Пользователь' : 'AI'}: ${m.content}`
      ).join('\n');
      
      const response = await aiAPI.chat(currentInput, recentMessages || null);
      setIsWaiting(false);
      
      if (response.data.success) {
        typeText(response.data.reply, response.data.source);
      }
    } catch (err) {
      setIsWaiting(false);
      const serverMessage = err.response?.data?.message;
      const errorMsg = { 
        role: 'assistant', 
        content: serverMessage || '⚠️ Произошла ошибка. Попробуйте ещё раз.' 
      };
      setChatMessages(prev => [...prev, errorMsg]);
      setLoading(false);
      setError('');
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

  // Генерация презентации
  const handleGeneratePresentation = async () => {
    if (!presTopic.trim()) {
      setError('Укажите тему презентации');
      return;
    }
    try {
      setLoading(true);
      setError('');
      trackingAPI.track('ai_generate_presentation', `Презентация: ${presTopic}`, 'ai');
      const response = await aiAPI.generatePresentation(presTopic, presSlides, presStyle);
      if (response.data.success) {
        setPresentation(response.data.presentation);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка генерации презентации');
    } finally {
      setLoading(false);
    }
  };

  // Если открыт просмотрщик — показываем только его
  if (presentation) {
    return (
      <PresentationViewer
        presentation={presentation}
        onClose={() => setPresentation(null)}
      />
    );
  }

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
        <button 
          className={activeMode === 'presentation' ? 'active' : ''}
          onClick={() => setActiveMode('presentation')}
        >
          📊 Презентации
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

      {activeMode === 'presentation' && (
        <div className="ai-presentation-mode">
          <div className="ai-input-section">
            <h3>📊 Тема презентации</h3>
            <input
              type="text"
              value={presTopic}
              onChange={(e) => setPresTopic(e.target.value)}
              placeholder="Например: Искусственный интеллект в медицине"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleGeneratePresentation()}
            />

            <div className="pres-options">
              <div className="pres-option">
                <label>Количество слайдов</label>
                <select value={presSlides} onChange={(e) => setPresSlides(Number(e.target.value))} disabled={loading}>
                  <option value={5}>5 слайдов</option>
                  <option value={8}>8 слайдов</option>
                  <option value={10}>10 слайдов</option>
                  <option value={15}>15 слайдов</option>
                  <option value={20}>20 слайдов</option>
                </select>
              </div>
              <div className="pres-option">
                <label>Стиль</label>
                <select value={presStyle} onChange={(e) => setPresStyle(e.target.value)} disabled={loading}>
                  <option value="modern">🎨 Современный</option>
                  <option value="business">💼 Деловой</option>
                  <option value="creative">🌈 Креативный</option>
                  <option value="minimal">✨ Минималистичный</option>
                  <option value="academic">📚 Академический</option>
                </select>
              </div>
            </div>

            <button 
              className="ai-button primary"
              onClick={handleGeneratePresentation}
              disabled={loading || !presTopic.trim()}
            >
              {loading ? '⏳ Генерация...' : '🎯 Создать презентацию'}
            </button>
          </div>

          <div className="pres-examples">
            <h4>Примеры тем:</h4>
            <div className="pres-example-chips">
              {[
                '🤖 Искусственный интеллект',
                '🌍 Экология и климат',
                '🚀 Космические технологии',
                '💰 Криптовалюты и блокчейн',
                '🧬 Генная инженерия',
                '📱 Мобильная разработка'
              ].map((topic, i) => (
                <button key={i} className="pres-chip" onClick={() => setPresTopic(topic.replace(/^.{2}\s/, ''))}>
                  {topic}
                </button>
              ))}
            </div>
          </div>
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
                      <div className={`ai-response-block ${msg.typing ? 'typing' : ''}`}>
                        <div className="ai-response-header">
                          <span className="ai-badge">🤖 AI</span>
                          {msg.source && !msg.typing && (
                            <span className="ai-source-badge">
                              {msg.source === 'gemini' ? '✨ Daler' : '📝 Demo'}
                            </span>
                          )}
                          {msg.typing && (
                            <span className="ai-source-badge">⌨️ печатает...</span>
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
            {isWaiting && (
              <div className="chat-msg assistant">
                <div className="ai-response-block">
                  <div className="ai-response-header">
                    <span className="ai-badge">🤖 AI</span>
                    <span className="ai-source-badge">🤔 думает...</span>
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
