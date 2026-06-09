import { useState } from 'react';
import teaList from '../data/teaList';
import './TeaStorage.css';

const AVOID_ICONS = {
  "직사광선": "☀️",
  "습기": "💧",
  "강한 냄새 근처": "👃",
  "강한 냄새": "👃",
  "냄새가 강한 물질 근처": "👃",
  "온도 변화가 큰 곳": "🌡️",
  "높은 온도": "🌡️",
  "고온": "🌡️",
  "냉장 보관": "❄️",
  "냉장·냉동": "❄️",
  "밀폐 용기": "🔒",
  "과도한 건조": "🏜️",
  "결로": "💦",
};

export default function TeaStorage() {
  const [selectedId, setSelectedId] = useState(teaList[0].id);
  const [openSection, setOpenSection] = useState('steps');
  const tea = teaList.find((t) => t.id === selectedId);
  const s = tea.storage;

  function toggleSection(name) {
    setOpenSection((prev) => (prev === name ? null : name));
  }

  return (
    <div className="tea-storage">
      <h2 className="storage-title">찻잎 보관 방법</h2>
      <p className="storage-subtitle">올바른 보관으로 차의 향과 맛을 오래 유지하세요</p>

      {/* 차 선택 탭 */}
      <div className="tea-tabs">
        {teaList.map((t) => (
          <button
            key={t.id}
            className={`tea-tab ${tea.id === t.id ? 'active' : ''}`}
            style={{ '--tea-color': t.color }}
            onClick={() => { setSelectedId(t.id); setOpenSection('steps'); }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* 헤더 카드 */}
      <div className="storage-header-card" style={{ '--tea-color': tea.color }}>
        <div className="tea-dot" style={{ background: tea.color }} />
        <div className="header-info">
          <h3 className="tea-name">{tea.name}</h3>
          <span className="tea-name-en">{tea.nameEn}</span>
          <p className="storage-summary-text">{s.summary}</p>
        </div>
        <div className="container-badge">
          <span className="container-icon">{s.container.icon}</span>
          <span className="container-name">{s.container.name}</span>
        </div>
      </div>

      {/* 환경 정보 */}
      <div className="env-row">
        <div className="env-item">
          <span className="env-icon">🌡️</span>
          <span className="env-label">보관 온도</span>
          <span className="env-value">{s.temperature}</span>
        </div>
        <div className="env-divider" />
        <div className="env-item">
          <span className="env-icon">💧</span>
          <span className="env-label">권장 습도</span>
          <span className="env-value">{s.humidity}</span>
        </div>
        <div className="env-divider" />
        <div className="env-item">
          <span className="env-icon">📅</span>
          <span className="env-label">개봉 후</span>
          <span className="env-value">{s.period.after}</span>
        </div>
      </div>

      {/* 개봉 전/후 */}
      <div className="open-compare">
        <div className="open-box">
          <span className="open-label">🔒 개봉 전</span>
          <p>{s.beforeOpen}</p>
        </div>
        <div className="open-arrow">→</div>
        <div className="open-box open-box--after" style={{ '--tea-color': tea.color }}>
          <span className="open-label">📭 개봉 후</span>
          <p>{s.afterOpen}</p>
        </div>
      </div>

      {/* 아코디언 섹션 */}
      <div className="accordion">

        {/* 단계별 보관 방법 */}
        <div className="accordion-item">
          <button
            className={`accordion-header ${openSection === 'steps' ? 'open' : ''}`}
            onClick={() => toggleSection('steps')}
            style={{ '--tea-color': tea.color }}
          >
            <span>📋 단계별 보관 방법</span>
            <span className="accordion-arrow">{openSection === 'steps' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'steps' && (
            <div className="accordion-body">
              <ol className="steps-list">
                {s.steps.map((step, i) => (
                  <li key={i} className="step-item">
                    <span className="step-num" style={{ background: tea.color }}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* 보관 팁 */}
        <div className="accordion-item">
          <button
            className={`accordion-header ${openSection === 'tips' ? 'open' : ''}`}
            onClick={() => toggleSection('tips')}
            style={{ '--tea-color': tea.color }}
          >
            <span>💡 알아두면 좋은 팁</span>
            <span className="accordion-arrow">{openSection === 'tips' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'tips' && (
            <div className="accordion-body">
              <ul className="tips-list">
                {s.tips.map((tip, i) => (
                  <li key={i} className="tip-item">
                    <span className="tip-dot" style={{ background: tea.color }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 피해야 할 것 */}
        <div className="accordion-item">
          <button
            className={`accordion-header ${openSection === 'avoid' ? 'open' : ''}`}
            onClick={() => toggleSection('avoid')}
            style={{ '--tea-color': tea.color }}
          >
            <span>❌ 피해야 할 것</span>
            <span className="accordion-arrow">{openSection === 'avoid' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'avoid' && (
            <div className="accordion-body">
              <div className="avoid-grid">
                {s.avoid.map((item, i) => (
                  <div key={i} className="avoid-card">
                    <span className="avoid-icon">{AVOID_ICONS[item] ?? '⚠️'}</span>
                    <span className="avoid-label">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 보관 기간 배너 */}
      <div className="period-banner" style={{ '--tea-color': tea.color }}>
        <span>🗓️</span>
        <div>
          <p className="period-before">개봉 전 · {s.period.before}</p>
          <p className="period-after">개봉 후 · {s.period.after}</p>
        </div>
      </div>

    </div>
  );
}
