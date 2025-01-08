import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

const Home=()=><h2>Home</h2>
const About=()=><h2>About</h2>
const Contact=()=><h2>Contact</h2>

function App() {
 
     return (
      <>
      <Router>
        <NavBar/>
       <Routes>
        <Route path='/home' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        {/* <Route path='/signin' element={<SignIn/>}/>
        <Route path='/signup' element={<SignUp/>}/> */}
       </Routes>
      </Router>
      </>
     )
}

export default App
