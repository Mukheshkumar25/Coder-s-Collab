import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { GroupProvider } from './context/GroupContext.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GroupProvider>
        <Router>
          <App />
        </Router>
      </GroupProvider>
    </AuthProvider>
  </StrictMode>
);