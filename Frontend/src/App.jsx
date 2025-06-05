import './App.css'
import Landing from './components/Landing'
import Login from './pages/Login'
import { Route,Routes } from 'react-router-dom'
import Register from './pages/Register'
import Navbar from './components/navbar'
function App() {
  return (
    <>
       <Navbar/>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/Register' element={<Register/>}></Route>
      </Routes>
    </>
  )
}

export default App
