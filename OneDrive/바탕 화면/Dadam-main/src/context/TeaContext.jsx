import { createContext, useContext, useReducer, useEffect } from 'react';
import teaList from '../data/teaList';

const STORAGE_KEY = 'dadam_timer_state';

const initialState = {
  selectedTeaId: teaList[0].id,
  timeLeft: teaList[0].brewTime,
  isRunning: false,
  isDone: false,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    const tea = teaList.find((t) => t.id === parsed.selectedTeaId);
    if (!tea) return initialState;

    let timeLeft = parsed.timeLeft ?? tea.brewTime;

    // 실행 중이었다면 새로고침 동안 경과한 실제 시간을 빼서 보정
    if (parsed.isRunning && parsed.savedAt) {
      const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000);
      timeLeft = Math.max(0, timeLeft - elapsed);
    }

    const isDone = parsed.isDone || timeLeft === 0;

    return {
      selectedTeaId: parsed.selectedTeaId,
      timeLeft,
      isRunning: isDone ? false : (parsed.isRunning ?? false),
      isDone,
    };
  } catch {
    return initialState;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_TEA': {
      const tea = teaList.find((t) => t.id === action.id);
      return { selectedTeaId: tea.id, timeLeft: tea.brewTime, isRunning: false, isDone: false };
    }
    case 'TICK': {
      if (state.timeLeft <= 1) return { ...state, timeLeft: 0, isRunning: false, isDone: true };
      return { ...state, timeLeft: state.timeLeft - 1 };
    }
    case 'SET_RUNNING':
      return { ...state, isRunning: action.value };
    case 'RESET': {
      const tea = teaList.find((t) => t.id === state.selectedTeaId);
      return { ...state, timeLeft: tea.brewTime, isRunning: false, isDone: false };
    }
    default:
      return state;
  }
}

const TeaContext = createContext(null);

export function TeaProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // isRunning, savedAt 포함해서 저장 — 새로고침 시 경과 시간 보정에 사용
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedTeaId: state.selectedTeaId,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        isDone: state.isDone,
        savedAt: Date.now(),
      })
    );
  }, [state]);

  const selectedTea = teaList.find((t) => t.id === state.selectedTeaId);

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
