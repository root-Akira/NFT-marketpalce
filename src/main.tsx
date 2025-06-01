import { Buffer } from 'buffer';

// Polyfill Buffer and process
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
  (window as any).process = { env: {} };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Web3Provider } from './context/Web3Context';
import { NFTProvider } from './context/NFTContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <NFTProvider>
          <App />
          <Toaster position="bottom-right" />
        </NFTProvider>
      </Web3Provider>
    </BrowserRouter>
  </StrictMode>
);