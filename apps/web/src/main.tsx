import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';
import { ErrorBoundary } from './components/error-boundary';
import './i18n';
import './index.css';

// 移除初始 loading
const removeLoading = () => {
  const loading = document.getElementById('app-loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 300);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>,
);

// 应用渲染完成后移除 loading
removeLoading();
