import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AllDrivers from './components/drivers/allDrivers/AllDrivers'
import Driver from './components/drivers/allDrivers/Driver.jsx'
import LiveDrivers from './components/drivers/allDrivers/LiveDrivers.jsx'
import Login from './components/Login.jsx'
import { Navigate } from 'react-router-dom';
import AllRides from './components/rides/AllRides.jsx'
import Ride from './components/rides/Ride.jsx'
import AllAgents from './components/agents/AllAgents.jsx'
import Agent from './components/agents/Agent.jsx'
import Issues from './components/issues/Issues.jsx'
import AllBlogs from './components/blogs/AllBlogs.jsx'
import AllVerified from './components/drivers/allDrivers/AllVerified'
import HomeMetricPage from './components/homeMetricsPage/HomeMetricPage.jsx'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import roleRoutes from './roles.jsx'
import { getCookie } from './lib/utils.js'

function App() {

  const [userRole, setUserRole] = useState("guest");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = getCookie("role")
      setUserRole(user)
    }
    fetchUserInfo()
  }, [])

  const ProtectedRoute = ({ element }) => {
    const token = document.cookie.includes('token');
    console.log(token)

    const { pathname: path } = useLocation();

    if (!userRole) return <div>Loading</div>
    console.log(token && roleRoutes[userRole]?.some((allowedPath) => path.startsWith(allowedPath)))
    return token && roleRoutes[userRole]?.some((allowedPath) => path.startsWith(allowedPath)) ? element : !token ? <Navigate to="/" /> : <Navigate to="/home/dashboard" />;
  };
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/home/mapData" element={<ProtectedRoute element={<Home />} />} />
          <Route path="/home/dashboard" element={<ProtectedRoute element={<HomeMetricPage />} />} />
          <Route path='/' element={<Login />}></Route>
          <Route path='/drivers/allDrivers' element={<ProtectedRoute element={<AllDrivers />} />} />
          <Route path='/drivers/liveDrivers' element={<ProtectedRoute element={<LiveDrivers />} />} />
          <Route path='/drivers/allDrivers/:id' element={<ProtectedRoute element={<Driver />} />} />
          <Route path='/drivers/allVerified/:id' element={<ProtectedRoute element={<Driver />} />} />

          <Route path='/rides/allRides' element={<ProtectedRoute element={<AllRides />} />} />
          <Route path='/rides/allRides/:id' element={<ProtectedRoute element={<Ride />} />} />

          <Route path='/agents/allAgents' element={<ProtectedRoute element={<AllAgents />} />} />
          <Route path='/agents/allAgents/:id' element={<ProtectedRoute element={<Agent />} />} />

          <Route path='/issues' element={<ProtectedRoute element={<Issues />} />} />
          <Route path='/blogs' element={<ProtectedRoute element={<AllBlogs />} />} />


        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
