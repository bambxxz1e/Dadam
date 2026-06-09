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
  "냉장 보관": "❄️",
  "밀폐 용기": "🔒",
  "건조한 환경": "🏜️",
};

function AvoidTag({ label }) {
  const icon = AVOID_ICONS[label] || "⚠️";
  return (
    <span className="avoid-tag">
      {icon} {label}
    </span>
  );
}

export default function TeaStorage() {
  const [selectedId, setSelectedId] = useState(teaList[0].id);
  const selected = teaList.find((t) => t.id === selectedId);

  return (
    <div className="tea-storage">
      <h2 className="storage-title">찻잎 보관 방법</h2>
      <p className="storage-subtitle">올바른 보관으로 차의 향과 맛을 오래 유지하세요</p>

      {/* 차 선택 탭 */}
      <div className="tea-tabs">
        {teaList.map((tea) => (
          <button
            key={tea.id}
            className={`tea-tab ${selected.id === tea.id ? 'active' : ''}`}
            style={{ '--tea-color': tea.color }}
            onClick={() => setSelectedId(tea.id)}
          >
            {tea.name}
          </button>
        ))}
      </div>

      {/* 보관 정보 카드 */}
      <div className="storage-card" style={{ '--tea-color': selected.color }}>

        <div className="storage-card-header">
          <div className="tea-color-dot" style={{ background: selected.color }} />
          <div>
            <h3 className="storage-tea-name">{selected.name}</h3>
            <span className="storage-tea-name-en">{selected.nameEn}</span>
          </div>
          <div className="storage-period">
            <span className="period-label">보관 기간</span>
            <span className="period-value">{selected.storage.period}</span>
          </div>
        </div>

        <div className="storage-summary">
          <span className="summary-icon">📦</span>
          <p>{selected.storage.summary}</p>
        </div>

        {/* 보관 팁 */}
        <div className="storage-section">
          <h4 className="section-title">✅ 보관 팁</h4>
          <ul className="tips-list">
            {selected.storage.tips.map((tip, i) => (
              <li key={i} className="tip-item">
                <span className="tip-bullet" style={{ background: selected.color }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* 피해야 할 것 */}
        <div className="storage-section">
          <h4 className="section-title">❌ 피해야 할 것</h4>
          <div className="avoid-list">
            {selected.storage.avoid.map((item, i) => (
              <AvoidTag key={i} label={item} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
