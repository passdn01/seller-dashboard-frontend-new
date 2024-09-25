import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AllDrivers from './components/drivers/allDrivers/AllDrivers'
import Driver from './components/drivers/allDrivers/Driver.jsx'
import LiveDrivers from './components/drivers/allDrivers/LiveDrivers.jsx'
import Login from './components/Login.jsx'
import { Navigate } from 'react-router-dom';
function App() {
  const ProtectedRoute = ({ element }) => {
    const token = document.cookie.includes('token');
    console.log(token)
    return token ? element : <Navigate to="/" />;
  };
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
          <Route path='/' element={<Login />}></Route>
          <Route path='/drivers/allDrivers' element={<ProtectedRoute element={<AllDrivers />} />} />
          <Route path='/drivers/liveDrivers' element={<ProtectedRoute element={<LiveDrivers />} />} />
          <Route path='/drivers/allDrivers/:id' element={<ProtectedRoute element={<Driver />} />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
