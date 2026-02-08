import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SnappyModalProvider } from 'react-snappy-modal';

import App from './App.tsx';

import { TRPCProvider } from '@/shared';

import './index.css';
import 'ckeditor5/ckeditor5.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TRPCProvider>
      <SnappyModalProvider>
        <App />
      </SnappyModalProvider>
    </TRPCProvider>
  </StrictMode>,
);
