import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { Toaster } from './components/ui/toaster';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  );
}
