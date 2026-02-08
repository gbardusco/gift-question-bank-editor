import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("ERRO CRÍTICO: Não foi possível encontrar o elemento #root para montar a aplicação.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("ERRO DE RENDERIZAÇÃO: Falha ao inicializar o React.", error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; text-align: center;">
        <h1 style="color: #ef4444;">Erro ao Carregar Aplicação</h1>
        <p>Houve um problema técnico ao iniciar o sistema. Verifique o console para mais detalhes.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; cursor: pointer;">Recarregar Página</button>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}