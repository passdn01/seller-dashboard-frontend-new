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
