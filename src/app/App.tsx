import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { IframeDetector } from './components/IframeDetector';

export default function App() {
  return (
    <IframeDetector>
      <RouterProvider router={router} />
      <Toaster />
    </IframeDetector>
  );
}