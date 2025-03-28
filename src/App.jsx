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
// import Issues from './components/issues/Issues.jsx'
import AllBlogs from './components/blogs/AllBlogs.jsx'
import AllVerified from './components/drivers/allDrivers/AllVerified'
import HomeMetricPage from './components/homeMetricsPage/HomeMetricPage.jsx'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import roleRoutes from './roles.jsx'
import { getCookie } from './lib/utils.js'
import AllUserPage from './components/users/AllUserPage.jsx'
import UserInfoPage from './components/users/UserInfoPage.jsx'
import IssueAssignerIndex from './components/issues/issueAssigner/issueAssignerIndex.jsx'
import IssueDetailIndex from './components/issues/issueDetailIndex.jsx/issueDetailIndex.jsx'
import IssueSolverIndex from './components/issues/issueSolver/issueSolverIndex.jsx'
import RideInfo from './components/rides/RideInfo.jsx'
import IAMUserPage from './components/admin/IAMUserPage.jsx'
import ImageComponent from './components/Img.jsx'
import RideJourneyIndex from './components/rideJourney/RideJourneyIndex.jsx'
import PriceSetterPage from './components/pricing/PriceSetterPage.jsx'
import DriverJourneyIndex from './components/DriverJourney/DriverJourneyIndex.jsx'
import LogsIndex from './components/AllDriverRideLogs/LogsIndex.jsx'
import OfferIndex from './components/offers/OfferIndex.jsx'
import BlogEditor from './components/blogs/Blog.jsx'
import BlogView from './components/blogs/BlogView.jsx'
import CityIndex from './components/city/CityIndex.jsx'
import TSPMessagesTable from './components/tsp/TSPMessagesTable.jsx'
import UserOfferIndex from './components/userOffers/UserOfferIndex.jsx'
import NotificationIndex from './components/notification/NotificationIndex.jsx'
import AllContests from './components/contests/AllContests.jsx'
import ContestView from './components/contests/ContestView.jsx'
import ContestForm from './components/contests/ContestForm.jsx'
import CategoryIndex from './components/category/CategoryIndex.jsx'
import DriverPointHistory from './components/contests/DriverPointHistory.jsx'
function App() {

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = getCookie("role")
      setUserRole(user)
    }
    fetchUserInfo()
  }, [])

  const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    const userRole = localStorage.getItem("role"); // Get user role from localStorage
    const userId = localStorage.getItem("userId"); // Get user ID from localStorage
    const { pathname: path } = useLocation();

    if (!userRole) return <div>Loading...</div>;

    const hasAccess = token && roleRoutes[userRole]?.some((allowedPath) => path.startsWith(allowedPath));

    console.log("Token exists:", !!token);
    console.log("User Role:", userRole);
    console.log("Access granted:", hasAccess);
    console.log("User ID:", userId);

    return hasAccess ? element : <Navigate to={token ? "/home/dashboard" : "/"} />;
  };
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/home/mapData" element={<ProtectedRoute element={<Home />} />} />
          <Route path="/home/rideJourney" element={<ProtectedRoute element={<RideJourneyIndex />} />} />
          <Route path="/home/driverJourney" element={<ProtectedRoute element={<DriverJourneyIndex />} />} />
          <Route path="/home/driverLogs" element={<ProtectedRoute element={<LogsIndex />} />} />
          <Route path="/home/dashboard" element={<ProtectedRoute element={<HomeMetricPage />} />} />


          <Route path='/' element={<Login />}></Route>
          <Route path='/drivers/allDrivers' element={<ProtectedRoute element={<AllDrivers />} />} />
          <Route path='/drivers/allOffers' element={<ProtectedRoute element={<OfferIndex />} />} />
          <Route path='/drivers/liveDrivers' element={<ProtectedRoute element={<LiveDrivers />} />} />
          <Route path='/drivers/allDrivers/:id' element={<ProtectedRoute element={<Driver />} />} />
          <Route path='/drivers/allVerified/:id' element={<ProtectedRoute element={<Driver />} />} />

          <Route path='/rides/allRides' element={<ProtectedRoute element={<AllRides />} />} />
          <Route path='/rides/allRides/:transaction_id' element={<ProtectedRoute element={<RideInfo />} />} />

          <Route path='/agents/allAgents' element={<ProtectedRoute element={<AllAgents />} />} />
          <Route path='/agents/allAgents/:id' element={<ProtectedRoute element={<Agent />} />} />

          {/* <Route path='/issues' element={<ProtectedRoute element={<Issues />} />} /> */}
          <Route path='/issueAssigner' element={<ProtectedRoute element={<IssueAssignerIndex />} />} />
          <Route path='/issueSolver' element={<ProtectedRoute element={<IssueSolverIndex />} />} />
          <Route path='/issueDetail/:id' element={<ProtectedRoute element={<IssueDetailIndex />} />} />
          <Route path='/blogs' element={<ProtectedRoute element={<AllBlogs />} />} />
          <Route path="/blogs/new" element={<ProtectedRoute element={<BlogEditor />} />} />
          <Route path="/blogs/:id" element={<ProtectedRoute element={<BlogView />} />} />
          <Route path="/blogs/:id/edit" element={<ProtectedRoute element={<BlogEditor />} />} />

          <Route path='/users' element={<ProtectedRoute element={< AllUserPage />} />} />
          <Route path='/allUsersOffers' element={<ProtectedRoute element={< UserOfferIndex />} />} />
          <Route path='/users/:id' element={<ProtectedRoute element={< UserInfoPage />} />} />
          <Route path='/admin' element={<ProtectedRoute element={< IAMUserPage />} />} />

          <Route path='/city' element={<ProtectedRoute element={<CityIndex />} />} />
          <Route path='/category' element={<ProtectedRoute element={<CategoryIndex />} />} />
          <Route path='/notification' element={<ProtectedRoute element={<NotificationIndex />} />} />


          <Route path='/home/dashboard/img' element={<ProtectedRoute element={< ImageComponent />} />} />
          <Route path='/pricing' element={<ProtectedRoute element={< PriceSetterPage />} />} />
          <Route path='/tspMessages' element={<ProtectedRoute element={< TSPMessagesTable />} />} />
          <Route path='/contests' element={<ProtectedRoute element={< AllContests />} />} />
          <Route path='/contests' element={<ProtectedRoute element={< TSPMessagesTable />} />} />
          <Route path='/contests/view/:id' element={<ProtectedRoute element={< ContestView />} />} />
          <Route path='/contests/new/' element={<ProtectedRoute element={< ContestForm />} />} />
          <Route path='/contests/edit/:id' element={<ProtectedRoute element={< ContestForm />} />} />
          <Route path='/contests/view/:contestId/:driverId' element={<ProtectedRoute element={< DriverPointHistory />} />} />





        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
