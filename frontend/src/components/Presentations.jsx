import React, { useState, useRef, useEffect, useCallback } from 'react';
import { aiAPI, trackingAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import '../pages/Presentations.css';

const THEMES = [
  {
    id: 'noir', name: 'Нуар', icon: '🎬',
    dark: true,
    palette: ['#0c0c0c', '#171717', '#1f1f1f', '#262626', '#1a1510', '#0f0f0f'],
  },
  {
    id: 'papirus', name: 'Папирус', icon: '📜',
    dark: false,
    palette: ['#faf6ef', '#f2ebe0', '#ebe4d8', '#e5dccf', '#f7f2ea', '#efe8de'],
  },
  {
    id: 'neon', name: 'Неон', icon: '⚡',
    dark: true,
    palette: ['#120428', '#1a0a32', '#0d0630', '#1e0b40', '#16082a', '#251045'],
  },
  {
    id: 'boreal', name: 'Тайга', icon: '🌲',
    dark: true,
    palette: ['#052e22', '#064e3b', '#065f46', '#047857', '#0f3d2e', '#134e4a'],
  },
  {
    id: 'terracotta', name: 'Терракота', icon: '🏺',
    dark: true,
    palette: ['#431407', '#7c2d12', '#9a3412', '#b45309', '#92400e', '#78350f'],
  },
  {
    id: 'mist', name: 'Туман', icon: '🌫️',
    dark: false,
    palette: ['#f8fafc', '#eef2f7', '#e2e8f0', '#f1f5f9', '#e8edf5', '#f8fafc'],
  },
];

const getSlideStyle = (themeId, index) => {
  const theme = THEMES.find((th) => th.id === themeId) || THEMES[0];
  const isDark = theme.dark !== false;
  const i = index % theme.palette.length;
  const c1 = theme.palette[i];
  const c2 = theme.palette[(i + 1) % theme.palette.length];
  const c3 = theme.palette[(i + 2) % theme.palette.length];

  return {
    background: `linear-gradient(152deg, ${c1} 0%, ${c2} 48%, ${c3} 100%)`,
    color: isDark ? '#f8fafc' : '#1c1917',
    '--accent': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
    '--accent-strong': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
    '--card-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
    '--card-border': isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
    '--note-bg': isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
  };
};

function normalizePresentation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const slides = (raw.slides || []).map((s) => {
    if (!s || typeof s !== 'object') {
      return { type: 'content', title: 'Слайд', bullets: [''], emoji: '📄' };
    }
    let type = s.type;
    if (!type) {
      if (Array.isArray(s.stats)) type = 'stats';
      else if (s.quote) type = 'quote';
      else if (s.left && s.right) type = 'two-columns';
      else type = 'content';
    }
    return { ...s, type };
  });
  return { ...raw, slides };
}

const SlideContent = ({ slide }) => {
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

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const PresentationEditor = ({ presentation, theme, onClose, onThemeChange, source }) => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const ref = useRef(null);
  const touchX = useRef(0);
  const slides = presentation.slides || [];

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen?.();
      setIsFs(true);
    } else {
      document.exitFullscreen?.();
      setIsFs(false);
    }
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
      if (e.key === 'Escape') {
        if (document.fullscreenElement) toggleFs();
        else onClose();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [goNext, goPrev, onClose, toggleFs]);

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
    const th = THEMES.find((x) => x.id === theme) || THEMES[0];
    const isDark = th.dark !== false;
    const slidesHTML = slides.map((slide, idx) => {
      const c1 = th.palette[idx % th.palette.length];
      const c2 = th.palette[(idx + 1) % th.palette.length];
      const c3 = th.palette[(idx + 2) % th.palette.length];
      const bg = `linear-gradient(152deg, ${c1} 0%, ${c2} 48%, ${c3} 100%)`;
      const color = isDark ? '#f8fafc' : '#1c1917';
      let inner = '';
      switch (slide.type) {
        case 'title':
        case 'end':
          inner = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center">
            <div style="font-size:80px;margin-bottom:24px">${escapeHtml(slide.emoji) || ''}</div>
            <h1 style="font-size:52px;font-weight:800;margin:0 0 16px;line-height:1.2">${escapeHtml(slide.title)}</h1>
            <p style="font-size:24px;opacity:0.8">${escapeHtml(slide.subtitle)}</p></div>`;
          break;
        case 'content':
          inner = `<h2 style="font-size:36px;margin-bottom:32px">${escapeHtml(slide.emoji) || ''} ${escapeHtml(slide.title)}</h2>
            <ul style="font-size:20px;line-height:2;list-style:none;padding:0">${(slide.bullets || []).map((b) =>
              `<li style="padding:10px 0;border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}">▸ ${escapeHtml(b)}</li>`).join('')}</ul>
            ${slide.note ? `<div style="margin-top:24px;padding:16px;background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};border-radius:12px;font-size:16px">💡 ${escapeHtml(slide.note)}</div>` : ''}`;
          break;
        case 'two-columns': {
          const cardBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
          inner = `<h2 style="font-size:36px;margin-bottom:32px">${escapeHtml(slide.emoji) || ''} ${escapeHtml(slide.title)}</h2>
            <div style="display:flex;gap:24px">
              <div style="flex:1;background:${cardBg};padding:28px;border-radius:16px">
                <h3 style="margin:0 0 16px;font-size:22px">${escapeHtml(slide.left?.heading)}</h3>
                <ul style="padding-left:20px;line-height:1.8;font-size:18px">${(slide.left?.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
              </div>
              <div style="flex:1;background:${cardBg};padding:28px;border-radius:16px">
                <h3 style="margin:0 0 16px;font-size:22px">${escapeHtml(slide.right?.heading)}</h3>
                <ul style="padding-left:20px;line-height:1.8;font-size:18px">${(slide.right?.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
              </div>
            </div>`;
          break;
        }
        case 'quote':
          inner = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center">
            <div style="font-size:120px;line-height:1;opacity:0.3;font-family:Georgia,serif">&ldquo;</div>
            <blockquote style="font-size:28px;font-style:italic;max-width:700px;line-height:1.6;margin:-20px 0 24px">${escapeHtml(slide.quote)}</blockquote>
            <p style="font-size:18px;opacity:0.7">— ${escapeHtml(slide.author)}</p></div>`;
          break;
        case 'stats': {
          const statCardBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
          inner = `<h2 style="font-size:36px;margin-bottom:40px;text-align:center">${escapeHtml(slide.emoji) || ''} ${escapeHtml(slide.title)}</h2>
            <div style="display:grid;grid-template-columns:repeat(${Math.min((slide.stats || []).length, 4)},1fr);gap:20px">
              ${(slide.stats || []).map((s) => `<div style="background:${statCardBg};padding:32px 20px;border-radius:16px;text-align:center">
                <div style="font-size:40px;font-weight:800;margin-bottom:8px">${escapeHtml(s.value)}</div>
                <div style="font-size:15px;opacity:0.8">${escapeHtml(s.label)}</div></div>`).join('')}
            </div>`;
          break;
        }
        default:
          inner = `<h2>${escapeHtml(slide.title)}</h2>`;
      }
      return `<div style="background:${bg};min-height:100vh;padding:60px 80px;color:${color};display:flex;flex-direction:column;justify-content:center;font-family:'DM Sans','Segoe UI',system-ui,sans-serif;page-break-after:always;position:relative;overflow:hidden">
        <div style="position:absolute;top:-80px;right:-80px;width:300px;height:300px;border-radius:50%;background:${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}"></div>
        <div style="position:absolute;bottom:-60px;left:-60px;width:200px;height:200px;border-radius:50%;background:${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}"></div>
        ${inner}
        <div style="position:absolute;bottom:20px;right:32px;opacity:0.4;font-size:14px">${idx + 1} / ${slides.length}</div>
      </div>`;
    }).join('\n');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(presentation.title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}@media print{div{page-break-after:always}}</style></head><body>${slidesHTML}</body></html>`;
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
        <button className="ps-toolbar-btn" onClick={onClose}>← {t('presentations.back')}</button>
        <h3 className="ps-toolbar-title">{presentation.title}</h3>
        {source === 'demo' && (
          <span className="ps-source-badge ps-source-demo" title="AI недоступен, показаны шаблонные данные">DEMO</span>
        )}
        {source && source !== 'demo' && (
          <span className="ps-source-badge ps-source-ai" title="Сгенерировано AI с реальными данными">AI ✓</span>
        )}
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
          <button className="ps-toolbar-btn" onClick={exportHTML}>📥 {t('presentations.export')}</button>
          <button className="ps-toolbar-btn" onClick={toggleFs}>
            {isFs ? `⬜ ${t('presentations.collapse')}` : `⬛ ${t('presentations.fullscreen')}`}
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
              <div className={`ps-thumb-preview ps-variant-${theme}`} style={getSlideStyle(theme, i)}>
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
          <div className={`ps-frame ps-variant-${theme}`} key={current} style={getSlideStyle(theme, current)}>
            <SlideContent slide={slides[current]} />
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
  const { t } = useLanguage();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [theme, setTheme] = useState('noir');
  const [source, setSource] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) { setError(t('presentations.setTopicError')); return; }
    try {
      setLoading(true);
      setError('');
      setSource('');
      trackingAPI.track('ai_generate_presentation', `Презентация: ${topic}`, 'presentations');
      const response = await aiAPI.generatePresentation(topic, slideCount, theme);
      if (response.data.success) {
        setPresentation(normalizePresentation(response.data.presentation) || response.data.presentation);
        setSource(response.data.source || '');
        if (response.data.source === 'demo') {
          console.warn('Презентация сгенерирована в DEMO режиме (AI недоступен)');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('presentations.generateError'));
    } finally {
      setLoading(false);
    }
  };

  if (presentation) {
    return (
      <PresentationEditor
        presentation={presentation}
        theme={theme}
        onClose={() => { setPresentation(null); setSource(''); }}
        onThemeChange={setTheme}
        source={source}
      />
    );
  }

  return (
    <div className="ps-page">
      <div className="ps-hero">
        <div className="ps-hero-icon">📊</div>
        <h1>{t('presentations.title')}</h1>
        <p>{t('presentations.subtitle')}</p>
      </div>

      {error && (
        <div className="ps-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="ps-form">
        <div className="ps-field">
          <label>{t('presentations.topic')}</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('presentations.topicPlaceholder')}
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="ps-input"
          />
        </div>

        <div className="ps-field">
          <label>{t('presentations.theme')}</label>
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
          <label>{t('presentations.slidesCount')}</label>
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
            <><span className="ps-spinner" /> {t('presentations.generating')}</>
          ) : (
            `✨ ${t('presentations.generate')}`
          )}
        </button>
      </div>

      <div className="ps-examples">
        <h3>{t('presentations.try')}</h3>
        <div className="ps-chips">
          {EXAMPLE_TOPICS.map((example, i) => (
            <button
              key={i}
              className="ps-chip"
              onClick={() => setTopic(example.slice(example.indexOf(' ') + 1))}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Presentations;
