import { TeaProvider } from './context/TeaContext'
import BrewingTimer from './components/BrewingTimer'
import './App.css'

function App() {
  return (
    <TeaProvider>
      <main>
        <BrewingTimer />
      </main>
    </TeaProvider>
  )
}

export default App
