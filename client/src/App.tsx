import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { AppErrorBoundary } from './components/Common/AppErrorBoundary';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';
import { PracticePage } from './pages/PracticePage';
import { ReviewPage } from './pages/ReviewPage';

export default function App() {
  return (
    <MainLayout>
      <AppErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video/:videoId" element={<VideoPage />} />
          <Route path="/practice/:videoId" element={<PracticePage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </AppErrorBoundary>
    </MainLayout>
  );
}
