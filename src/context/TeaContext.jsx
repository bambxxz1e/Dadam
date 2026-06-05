import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import teaList from '../data/teaList';

const STORAGE_KEY = 'dadam_timer_state';

// Fix #1: undefined 방어 — id 없으면 항상 첫 번째 차로 fallback
function findTea(id) {
  return teaList.find((t) => t.id === id) ?? teaList[0];
}

// Fix #4: timeLeft·savedAt 매초 저장 대신 startedAt+timeAtStart 방식으로 변경
// → TICK 때는 저장 안 함, isRunning 변경·초기화 시에만 저장
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    const tea = findTea(p.selectedTeaId);

    let timeLeft;
    let isRunning = false;

    if (p.startedAt != null && p.timeAtStart != null) {
      const elapsed = Math.floor((Date.now() - p.startedAt) / 1000);
      timeLeft = Math.max(0, p.timeAtStart - elapsed);
      isRunning = timeLeft > 0;
    } else {
      timeLeft = p.pausedTimeLeft ?? tea.brewTime;
    }

    return { selectedTeaId: tea.id, timeLeft, isRunning };
  } catch {
    return null;
  }
}

const defaultState = {
  selectedTeaId: teaList[0].id,
  timeLeft: teaList[0].brewTime,
  isRunning: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_TEA': {
      const tea = findTea(action.id);
      return { selectedTeaId: tea.id, timeLeft: tea.brewTime, isRunning: false };
    }
    case 'TICK': {
      const next = state.timeLeft - 1;
      if (next <= 0) return { ...state, timeLeft: 0, isRunning: false };
      return { ...state, timeLeft: next };
    }
    case 'SET_RUNNING':
      return { ...state, isRunning: action.value };
    case 'RESET': {
      const tea = findTea(state.selectedTeaId);
      return { ...state, timeLeft: tea.brewTime, isRunning: false };
    }
    // Fix #3: 백그라운드 탭 복귀 시 실제 경과 시간으로 보정
    case 'SYNC_TIME': {
      const timeLeft = Math.max(0, action.timeLeft);
      return { ...state, timeLeft, isRunning: timeLeft > 0 };
    }
    default:
      return state;
  }
}

const TeaContext = createContext(null);

export function TeaProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState() ?? defaultState);

  // Fix #3, #4: 타이머 시작 시각 ref — 백그라운드 보정 및 저장에 사용
  const startedAtRef = useRef(null);
  const timeAtStartRef = useRef(null);

  // 복원된 상태가 isRunning=true이면 refs 초기화
  useEffect(() => {
    if (state.isRunning) {
      startedAtRef.current = Date.now();
      timeAtStartRef.current = state.timeLeft;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevIsRunningRef = useRef(state.isRunning);

  // Fix #4: TICK 때는 저장 건너뜀 — isRunning 변경·정지 상태 변화 시에만 저장
  useEffect(() => {
    const isRunningChanged = state.isRunning !== prevIsRunningRef.current;

    if (isRunningChanged && state.isRunning) {
      startedAtRef.current = Date.now();
      timeAtStartRef.current = state.timeLeft;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedTeaId: state.selectedTeaId,
        startedAt: startedAtRef.current,
        timeAtStart: timeAtStartRef.current,
        pausedTimeLeft: null,
      }));
    } else if (!state.isRunning) {
      // 일시정지, 초기화, 차 변경, 완료 — 모두 저장
      startedAtRef.current = null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedTeaId: state.selectedTeaId,
        startedAt: null,
        timeAtStart: null,
        pausedTimeLeft: state.timeLeft,
      }));
    }
    // isRunning=true이고 변경 없으면 TICK → 저장 안 함

    prevIsRunningRef.current = state.isRunning;
  }, [state]);

  // Fix #3: 백그라운드 탭에서 돌아올 때 실제 경과 시간으로 timeLeft 보정
  useEffect(() => {
    function onVisibilityChange() {
      if (!document.hidden && state.isRunning && startedAtRef.current != null) {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        const corrected = Math.max(0, timeAtStartRef.current - elapsed);
        // 다음 visibilitychange를 위해 기준점 갱신
        startedAtRef.current = Date.now();
        timeAtStartRef.current = corrected;
        dispatch({ type: 'SYNC_TIME', timeLeft: corrected });
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [state.isRunning]);

  // Fix #1: findTea가 항상 유효한 tea를 반환하므로 undefined 없음
  const selectedTea = findTea(state.selectedTeaId);

  return (
    <TeaContext.Provider value={{ state, dispatch, selectedTea, teaList }}>
      {children}
    </TeaContext.Provider>
  );
}

export function useTea() {
  const ctx = useContext(TeaContext);
  if (!ctx) throw new Error('useTea must be used inside TeaProvider');
  return ctx;
}
