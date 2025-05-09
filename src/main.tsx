import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// MSW (Mock Service Worker) setup
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  // `worker.start()` returns a Promise that resolves
  // SWR React Query 등 일부 데이터 가져오기 라이브러리들은 MSW가 준비되기 전에 요청을 보낼 수 있습니다.
  // MSW가 요청을 가로챌 준비가 될 때까지 애플리케이션 렌더링을 연기합니다.
  // (https://mswjs.io/docs/integrations/browser#deferred-rendering)
  return worker.start({
    onUnhandledRequest: 'bypass', // Log unhandled requests instead of erroring
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
});