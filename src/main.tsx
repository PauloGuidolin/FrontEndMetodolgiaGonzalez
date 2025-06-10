import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { enableMapSet } from 'immer'; // <-- Importa esto

enableMapSet();
createRoot(document.getElementById('root')!).render(
  <>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </>
);