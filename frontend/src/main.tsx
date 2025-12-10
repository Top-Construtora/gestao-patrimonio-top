import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { UserProvider, User } from './contexts/UserContext.tsx';
import './index.css';

// Usuário pode ser passado pelo sistema pai via window ou props
// Exemplo: window.__PATRIMONIO_USER__ = { id: '1', name: 'João', email: 'joao@empresa.com' }
declare global {
  interface Window {
    __PATRIMONIO_USER__?: User;
  }
}

const externalUser = window.__PATRIMONIO_USER__;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <UserProvider initialUser={externalUser}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </UserProvider>
    </ErrorBoundary>
  </StrictMode>
);
