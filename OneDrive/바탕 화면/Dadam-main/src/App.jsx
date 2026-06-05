import { TeaProvider } from './context/TeaContext'
import TimerPage from './pages/TimerPage'
import './App.css'

function App() {
  return (
    <TeaProvider>
      <main>
        <TimerPage />
      </main>
    </TeaProvider>
  )
}

export default App
