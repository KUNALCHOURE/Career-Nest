import './App.css'
import Landing from './components/Landing'
import Login from './pages/Login'
import { Route,Routes, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Navbar from './components/navbar';
import Resumeanalyzer from './pages/resumeanalyzer.jsx'
import { AuthProvider, useAuth } from './context/authcontext.jsx'
import Jobpage from './pages/Jobpage.jsx'
import Profile from './pages/profile.jsx'

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
    <AuthProvider>
       <Navbar/>
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/Register' element={<Register/>}></Route>

        {/* Protected routes - accessible only after login */}
        <Route path='/' element={<PrivateRoute><Jobpage /></PrivateRoute>} />
        <Route path='/jobs' element={<PrivateRoute><Jobpage/></PrivateRoute>}></Route>
        <Route path='/Resume-analyzer'element={<PrivateRoute><Resumeanalyzer/></PrivateRoute>}></Route>
        <Route path='/Profile' element={<PrivateRoute><Profile/></PrivateRoute>}/>
      </Routes>
      </AuthProvider>
    </>
  )
}

export default App
