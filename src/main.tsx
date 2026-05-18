import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AssessmentProvider } from './context/AssessmentContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AssessmentProvider>
      <App />
    </AssessmentProvider>
  </StrictMode>,
);
