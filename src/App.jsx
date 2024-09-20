import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AllDrivers from './components/drivers/allDrivers/AllDrivers'
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/dashboard/home' element={<Home />}></Route>
          <Route path='/dashboard/drivers/allDrivers' element={<AllDrivers />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
