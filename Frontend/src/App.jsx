import './App.css'
import Landing from './components/Landing'
import Login from './pages/Login'
import { Route,Routes } from 'react-router-dom'
import Register from './pages/Register'
import Navbar from './components/navbar';
import Home from './pages/Home.jsx';
import { AuthProvider } from './context/authcontext.jsx'
import Jobpage from './pages/Jobpage.jsx'
function App() {
  return (
    <>
    <AuthProvider>
       <Navbar/>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/Register' element={<Register/>}></Route>
        <Route path='/home' element={<Home/>}></Route>
        <Route path='/jobs' element={<Jobpage/>}></Route>
      </Routes>
      </AuthProvider>
    </>
  )
}

export default App
