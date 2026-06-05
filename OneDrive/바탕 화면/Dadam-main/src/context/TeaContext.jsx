import { createContext, useContext, useReducer, useEffect } from 'react';
import teaList from '../data/teaList';

const STORAGE_KEY = 'dadam_timer_state';

const initialState = {
  selectedTeaId: teaList[0].id,
  timeLeft: teaList[0].brewTime,
  isDone: false,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    const tea = teaList.find((t) => t.id === parsed.selectedTeaId);
    if (!tea) return initialState;
    return {
      selectedTeaId: parsed.selectedTeaId,
      timeLeft: parsed.timeLeft ?? tea.brewTime,
      isDone: parsed.isDone ?? false,
    };
  } catch {
    return initialState;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_TEA': {
      const tea = teaList.find((t) => t.id === action.id);
      return { selectedTeaId: tea.id, timeLeft: tea.brewTime, isDone: false };
    }
    case 'TICK':
      if (state.timeLeft <= 1) return { ...state, timeLeft: 0, isDone: true };
      return { ...state, timeLeft: state.timeLeft - 1 };
    case 'RESET': {
      const tea = teaList.find((t) => t.id === state.selectedTeaId);
      return { ...state, timeLeft: tea.brewTime, isDone: false };
    }
    default:
      return state;
  }
}

const TeaContext = createContext(null);

export function TeaProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // localStorage에 상태 저장 (isRunning 제외 — 새로고침 시 항상 일시정지 상태로 복원)
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedTeaId: state.selectedTeaId,
        timeLeft: state.timeLeft,
        isDone: state.isDone,
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
