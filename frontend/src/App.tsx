import { useContext } from 'react';
import './App.css';
import { MainDashboard, Navbar, DeploymentsPage, DeploymentPage, NewDeployment, WebsitesPage, WebsitePage } from './components/index.js';
import { BrowserRouter, Routes, Route } from 'react-router';
import { GlobalStatesContext } from './contexts/GlobalStatesContext.js';
import { Toaster } from 'sonner';
import { PopUpsProvider } from './contexts/PopUpsProvider.js';

function App() {
  const { darkMode } = useContext(GlobalStatesContext);

  return <BrowserRouter>
    <PopUpsProvider>
      <Toaster position="top-center" richColors />
      <div id='AppWrapper' className={`${darkMode ? 'bg-black scrollbar-thumb-neutral-700 scrollbar-track-black'
        : 'bg-white scrollbar-thumb-blue-400'} font-mozilla`}>
          <Navbar />
        <div className='relative min-h-[calc(100vh-5rem)]'>
          <Routes>
            <Route path='/' element={<MainDashboard />} />
            <Route path='/deployments' element={<DeploymentsPage />} />
            <Route path='/deployments/:id' element={<DeploymentPage />} />
            <Route path='/newDeployment' element={<NewDeployment />} />
            <Route path='/websites' element={<WebsitesPage />} />
            <Route path='/websites/:id' element={<WebsitePage />} />
          </Routes>
        </div>
      </div>
    </PopUpsProvider>
  </BrowserRouter>
}

export default App
