import { useState } from 'react'
import { Button } from './components/ui/button'
import SideNavbar from './components/SideNavbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
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
