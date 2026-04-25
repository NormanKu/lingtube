import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { AppErrorBoundary } from './components/Common/AppErrorBoundary';
import { LoadingSpinner } from './components/Common/LoadingSpinner.jsx';
import { HomePage } from './pages/HomePage';

// HomePage stays in the main bundle — it's the landing route.
// The other pages are pulled in on demand to keep first-paint small.
const VideoPage = lazy(() =>
  import('./pages/VideoPage').then((m) => ({ default: m.VideoPage }))
);
const PracticePage = lazy(() =>
  import('./pages/PracticePage').then((m) => ({ default: m.PracticePage }))
);
const ReviewPage = lazy(() =>
  import('./pages/ReviewPage').then((m) => ({ default: m.ReviewPage }))
);

export default function App() {
  return (
    <MainLayout>
      <AppErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/practice/:videoId" element={<PracticePage />} />
            <Route path="/review" element={<ReviewPage />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </MainLayout>
  );
}
