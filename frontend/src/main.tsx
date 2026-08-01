import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/chartSetup.ts';
import App from './App.tsx'
import { GlobalStatesProvider } from './contexts/GlobalStatesProvider.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <GlobalStatesProvider>
        <App />
      </GlobalStatesProvider>
    </StrictMode>
  </QueryClientProvider>
)
