import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AllDrivers from './components/drivers/allDrivers/AllDrivers'
import Driver from './components/drivers/allDrivers/Driver.jsx'
import LiveDrivers from './components/drivers/allDrivers/LiveDrivers.jsx'
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/drivers/allDrivers' element={<AllDrivers />} />
          <Route path='/drivers/liveDrivers' element={<LiveDrivers />} />
          <Route path='/drivers/allDrivers/:id' element={<Driver />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
