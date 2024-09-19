import { useState } from 'react'
import { Button } from './components/ui/button'
import SideNavbar from './components/SideNavbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/dashboard/home' element={<Home />}></Route>


        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
