import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { AuthWrapper } from './components/auth/AuthWrapper.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthWrapper>
          <App />
        </AuthWrapper>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
