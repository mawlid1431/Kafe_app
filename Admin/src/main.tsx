import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppConvexProvider } from './providers/ConvexProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppConvexProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppConvexProvider>
  </StrictMode>,
);
