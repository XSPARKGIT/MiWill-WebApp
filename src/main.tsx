import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {initializeFirebaseAnalytics} from './firebase/client.ts';
import {AppRouter} from './router/AppRouter.tsx';
import './index.css';

void initializeFirebaseAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
