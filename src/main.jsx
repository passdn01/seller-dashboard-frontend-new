import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'sonner'
import './index.css'
import { CitiesProvider } from './components/drivers/allDrivers/Header.jsx'
createRoot(document.getElementById('root')).render(
  <>
    <CitiesProvider>
      <App />
    </CitiesProvider>
    <Toaster />
  </>

)
