import React, { useState, useRef, useEffect, useCallback } from 'react';
import { aiAPI, trackingAPI } from '../services/api';
import '../pages/Presentations.css';

const THEMES = [
  {
    id: 'modern', name: 'Современный', icon: '🎨',
    palette: ['#4066ff', '#8b5cf6', '#6366f1', '#4338ca', '#7c3aed', '#818cf8'],
  },
  {
    id: 'nature', name: 'Природа', icon: '🌿',
    palette: ['#059669', '#10b981', '#14b8a6', '#0d9488', '#047857', '#34d399'],
  },
  {
    id: 'sunset', name: 'Закат', icon: '🌅',
    palette: ['#ef4444', '#f97316', '#f59e0b', '#ec4899', '#e11d48', '#fb923c'],
  },
  {
    id: 'ocean', name: 'Океан', icon: '🌊',
    palette: ['#0ea5e9', '#06b6d4', '#3b82f6', '#2563eb', '#0891b2', '#38bdf8'],
  },
  {
    id: 'dark', name: 'Тёмная', icon: '🌙',
    palette: ['#1e293b', '#334155', '#0f172a', '#475569', '#1e293b', '#334155'],
  },
  {
    id: 'minimal', name: 'Светлая', icon: '✨',
    palette: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#f8fafc', '#e2e8f0'],
    dark: false, accent: '#4066ff',
  },
];

const getSlideStyle = (themeId, index, type) => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const isDark = theme.dark !== false;
  const i = index % theme.palette.length;
  const c1 = theme.palette[i];
  const c2 = theme.palette[(i + 1) % theme.palette.length];

  return {
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    color: isDark ? '#ffffff' : '#1e293b',
    '--accent': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
    '--accent-strong': isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    '--card-bg': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    '--card-border': isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    '--note-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
  };
};

const SlideContent = ({ slide, index, total }) => {
  switch (slide.type) {
    case 'title':
      return (
        <div className="ps-inner ps-title">
          <div className="ps-deco-circle ps-deco-tl" />
          <div className="ps-deco-circle ps-deco-br" />
          <div className="ps-emoji-lg">{slide.emoji}</div>
          <h1>{slide.title}</h1>
          <p className="ps-subtitle">{slide.subtitle}</p>
        </div>
      );
    case 'content':
      return (
        <div className="ps-inner ps-content">
          <div className="ps-deco-circle ps-deco-tr" />
          <h2><span className="ps-emoji-sm">{slide.emoji}</span> {slide.title}</h2>
          <ul className="ps-bullets">
            {slide.bullets?.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          {slide.note && <div className="ps-note">💡 {slide.note}</div>}
        </div>
      );
    case 'two-columns':
      return (
        <div className="ps-inner ps-twocol">
          <div className="ps-deco-circle ps-deco-tr" />
          <h2><span className="ps-emoji-sm">{slide.emoji}</span> {slide.title}</h2>
          <div className="ps-col-grid">
            <div className="ps-col-card">
              <h3>{slide.left?.heading}</h3>
              <ul>{slide.left?.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="ps-col-card">
              <h3>{slide.right?.heading}</h3>
              <ul>{slide.right?.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      );
    case 'quote':
      return (
        <div className="ps-inner ps-quote">
          <div className="ps-deco-circle ps-deco-tl" />
          <div className="ps-deco-circle ps-deco-br" />
          <div className="ps-quote-mark">&ldquo;</div>
          <blockquote>{slide.quote}</blockquote>
          <p className="ps-quote-author">— {slide.author}</p>
        </div>
      );
    case 'stats':
      return (
        <div className="ps-inner ps-stats">
          <div className="ps-deco-circle ps-deco-tr" />
          <h2><span className="ps-emoji-sm">{slide.emoji}</span> {slide.title}</h2>
          <div className="ps-stats-grid">
            {slide.stats?.map((s, i) => (
              <div key={i} className="ps-stat-card">
                <div className="ps-stat-value">{s.value}</div>
                <div className="ps-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'end':
      return (
        <div className="ps-inner ps-end">
          <div className="ps-deco-circle ps-deco-tl" />
          <div className="ps-deco-circle ps-deco-br" />
          <div className="ps-emoji-lg">{slide.emoji}</div>
          <h1>{slide.title}</h1>
          <p className="ps-subtitle">{slide.subtitle}</p>
        </div>
      );
    default:
      return (
        <div className="ps-inner ps-content">
          <h2>{slide.title}</h2>
        </div>
      );
  }
};

const PresentationEditor = ({ presentation, theme, onClose, onThemeChange }) => {
  const [current, setCurrent] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const ref = useRef(null);
  const touchX = useRef(0);
  const slides = presentation.slides || [];

  const goNext = useCallback(() => setCurrent(p => Math.min(p + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent(p => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape') { isFs ? toggleFs() : onClose(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });

  const toggleFs = () => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen?.();
      setIsFs(true);
    } else {
      document.exitFullscreen?.();
      setIsFs(false);
    }
  };

  useEffect(() => {
    const fn = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  const handleTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  };

  const exportHTML = () => {
    const t = THEMES.find(x => x.id === theme) || THEMES[0];
    const isDark = t.dark !== false;
    const slidesHTML = slides.map((slide, idx) => {
      const c1 = t.palette[idx % t.palette.length];
      const c2 = t.palette[(idx + 1) % t.palette.length];
      const bg = `linear-gradient(135deg, ${c1}, ${c2})`;
      const color = isDark ? '#fff' : '#1e293b';
      let inner = '';
      switch (slide.type) {
        case 'title':
        case 'end':
          inner = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center">
            <div style="font-size:80px;margin-bottom:24px">${slide.emoji || ''}</div>
            <h1 style="font-size:52px;font-weight:800;margin:0 0 16px;line-height:1.2">${slide.title}</h1>
            <p style="font-size:24px;opacity:0.8">${slide.subtitle || ''}</p></div>`;
          break;
        case 'content':
          inner = `<h2 style="font-size:36px;margin-bottom:32px">${slide.emoji || ''} ${slide.title}</h2>
            <ul style="font-size:20px;line-height:2;list-style:none;padding:0">${(slide.bullets || []).map(b =>
              `<li style="padding:10px 0;border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}">▸ ${b}</li>`).join('')}</ul>
            ${slide.note ? `<div style="margin-top:24px;padding:16px;background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};border-radius:12px;font-size:16px">💡 ${slide.note}</div>` : ''}`;
          break;
        case 'two-columns':
          const cardBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
          inner = `<h2 style="font-size:36px;margin-bottom:32px">${slide.emoji || ''} ${slide.title}</h2>
            <div style="display:flex;gap:24px">
              <div style="flex:1;background:${cardBg};padding:28px;border-radius:16px">
                <h3 style="margin:0 0 16px;font-size:22px">${slide.left?.heading || ''}</h3>
                <ul style="padding-left:20px;line-height:1.8;font-size:18px">${(slide.left?.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
              </div>
              <div style="flex:1;background:${cardBg};padding:28px;border-radius:16px">
                <h3 style="margin:0 0 16px;font-size:22px">${slide.right?.heading || ''}</h3>
                <ul style="padding-left:20px;line-height:1.8;font-size:18px">${(slide.right?.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
              </div>
            </div>`;
          break;
        case 'quote':
          inner = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center">
            <div style="font-size:120px;line-height:1;opacity:0.3;font-family:Georgia,serif">&ldquo;</div>
            <blockquote style="font-size:28px;font-style:italic;max-width:700px;line-height:1.6;margin:-20px 0 24px">${slide.quote}</blockquote>
            <p style="font-size:18px;opacity:0.7">— ${slide.author || ''}</p></div>`;
          break;
        case 'stats':
          const statCardBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
          inner = `<h2 style="font-size:36px;margin-bottom:40px;text-align:center">${slide.emoji || ''} ${slide.title}</h2>
            <div style="display:grid;grid-template-columns:repeat(${Math.min((slide.stats || []).length, 4)},1fr);gap:20px">
              ${(slide.stats || []).map(s => `<div style="background:${statCardBg};padding:32px 20px;border-radius:16px;text-align:center">
                <div style="font-size:40px;font-weight:800;margin-bottom:8px">${s.value}</div>
                <div style="font-size:15px;opacity:0.8">${s.label}</div></div>`).join('')}
            </div>`;
          break;
        default:
          inner = `<h2>${slide.title || ''}</h2>`;
      }
      return `<div style="background:${bg};min-height:100vh;padding:60px 80px;color:${color};display:flex;flex-direction:column;justify-content:center;font-family:'Segoe UI','Inter',system-ui,sans-serif;page-break-after:always;position:relative;overflow:hidden">
        <div style="position:absolute;top:-80px;right:-80px;width:300px;height:300px;border-radius:50%;background:${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}"></div>
        <div style="position:absolute;bottom:-60px;left:-60px;width:200px;height:200px;border-radius:50%;background:${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}"></div>
        ${inner}
        <div style="position:absolute;bottom:20px;right:32px;opacity:0.4;font-size:14px">${idx + 1} / ${slides.length}</div>
      </div>`;
    }).join('\n');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${presentation.title}</title><style>*{margin:0;padding:0;box-sizing:border-box}@media print{div{page-break-after:always}}</style></head><body>${slidesHTML}</body></html>`;
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
    <div className={`ps-editor ${isFs ? 'fullscreen' : ''}`} ref={ref}>
      <div className="ps-toolbar">
        <button className="ps-toolbar-btn" onClick={onClose}>← Назад</button>
        <h3 className="ps-toolbar-title">{presentation.title}</h3>
        <div className="ps-toolbar-right">
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="ps-toolbar-select"
          >
            {THEMES.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
            ))}
          </select>
          <button className="ps-toolbar-btn" onClick={exportHTML}>📥 Экспорт</button>
          <button className="ps-toolbar-btn" onClick={toggleFs}>
            {isFs ? '⬜ Свернуть' : '⬛ Весь экран'}
          </button>
        </div>
      </div>

      <div className="ps-body">
        <div className="ps-sidebar">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`ps-thumb ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            >
              <span className="ps-thumb-num">{i + 1}</span>
              <div className="ps-thumb-preview" style={getSlideStyle(theme, i, slide.type)}>
                <span className="ps-thumb-emoji">{slide.emoji || '📄'}</span>
                <span className="ps-thumb-label">{slide.title?.substring(0, 24)}</span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="ps-main"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button className="ps-arrow ps-arrow-left" onClick={goPrev} disabled={current === 0}>‹</button>
          <div className="ps-frame" key={current} style={getSlideStyle(theme, current, slides[current]?.type)}>
            <SlideContent slide={slides[current]} index={current} total={slides.length} />
            <div className="ps-slide-num">{current + 1} / {slides.length}</div>
          </div>
          <button className="ps-arrow ps-arrow-right" onClick={goNext} disabled={current === slides.length - 1}>›</button>
        </div>
      </div>
    </div>
  );
};

const EXAMPLE_TOPICS = [
  '🤖 Искусственный интеллект',
  '🌍 Экология и климат',
  '🚀 Космические технологии',
  '💰 Криптовалюты и блокчейн',
  '🧬 Генная инженерия',
  '📱 Мобильная разработка',
  '🏥 Медицина будущего',
  '🎮 Игровая индустрия',
];

const Presentations = () => {
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [theme, setTheme] = useState('modern');

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Укажите тему презентации'); return; }
    try {
      setLoading(true);
      setError('');
      trackingAPI.track('ai_generate_presentation', `Презентация: ${topic}`, 'presentations');
      const response = await aiAPI.generatePresentation(topic, slideCount, theme);
      if (response.data.success) {
        setPresentation(response.data.presentation);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка генерации презентации');
    } finally {
      setLoading(false);
    }
  };

  if (presentation) {
    return (
      <PresentationEditor
        presentation={presentation}
        theme={theme}
        onClose={() => setPresentation(null)}
        onThemeChange={setTheme}
      />
    );
  }

  return (
    <div className="ps-page">
      <div className="ps-hero">
        <div className="ps-hero-icon">📊</div>
        <h1>Создать презентацию</h1>
        <p>AI сгенерирует профессиональную презентацию за секунды</p>
      </div>

      {error && (
        <div className="ps-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="ps-form">
        <div className="ps-field">
          <label>Тема презентации</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Например: Искусственный интеллект в медицине"
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="ps-input"
          />
        </div>

        <div className="ps-field">
          <label>Тема оформления</label>
          <div className="ps-themes">
            {THEMES.map(t => (
              <div
                key={t.id}
                className={`ps-theme-card ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <div
                  className="ps-theme-preview"
                  style={{ background: `linear-gradient(135deg, ${t.palette[0]}, ${t.palette[1]})` }}
                >
                  <span>{t.icon}</span>
                </div>
                <span className="ps-theme-label">{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ps-field">
          <label>Количество слайдов</label>
          <div className="ps-counts">
            {[5, 8, 10, 15, 20].map(n => (
              <button
                key={n}
                className={`ps-count-btn ${slideCount === n ? 'active' : ''}`}
                onClick={() => setSlideCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          className="ps-generate"
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
        >
          {loading ? (
            <><span className="ps-spinner" /> Генерация...</>
          ) : (
            '✨ Создать презентацию'
          )}
        </button>
      </div>

      <div className="ps-examples">
        <h3>Попробуйте:</h3>
        <div className="ps-chips">
          {EXAMPLE_TOPICS.map((t, i) => (
            <button
              key={i}
              className="ps-chip"
              onClick={() => setTopic(t.slice(t.indexOf(' ') + 1))}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Presentations;
