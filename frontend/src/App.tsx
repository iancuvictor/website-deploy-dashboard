import { useContext } from 'react';
import './App.css';
import { MainDashboard, Navbar, WebsitesPage} from './components/index.js';
import { BrowserRouter, Routes, Route } from 'react-router';
import { GlobalStatesContext } from './contexts/GlobalStatesContext.js';
import { Toaster } from 'sonner';

function App() {
  const { darkMode } = useContext(GlobalStatesContext);
  
  return <BrowserRouter>
  <Toaster position="top-center" richColors/>
      <div id='AppWrapper' className={`${darkMode ? 'bg-black' : 'bg-white'} font-mozilla`}>
        <Navbar/>
        <div className='relative min-h-[calc(100vh-5rem)]'>
        <Routes>
          <Route path='/' element={<MainDashboard />} />
          <Route path='/websites' element={<WebsitesPage />} />
        </Routes>
        </div>
      </div>
  </BrowserRouter>
}

export default App
