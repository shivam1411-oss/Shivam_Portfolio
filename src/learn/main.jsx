import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../theme/ThemeProvider';
import LearnApp from './LearnApp';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LearnApp />
    </ThemeProvider>
  </StrictMode>
);
