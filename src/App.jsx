import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ViewerPage from './pages/ViewerPage';
import ProjectsPage from './pages/ProjectsPage';

const PAGES = {
  LANDING: 'landing',
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  VIEWER: 'viewer',
  PROJECTS: 'projects',
};

export default function App() {
  const [page, setPage] = useState(PAGES.LANDING);
  const [projectData, setProjectData] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const navigate = (pageName, data) => {
    if (data) {
      if (data.photos) setUploadedPhotos(data.photos);
      if (data.project) setProjectData(data.project);
    }
    setPage(pageName);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case PAGES.UPLOAD:
        return <UploadPage navigate={navigate} setPhotos={setUploadedPhotos} />;
      case PAGES.PROCESSING:
        return <ProcessingPage navigate={navigate} photos={uploadedPhotos} />;
      case PAGES.VIEWER:
        return <ViewerPage navigate={navigate} project={projectData} />;
      case PAGES.PROJECTS:
        return <ProjectsPage navigate={navigate} />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  const showHeader = page !== PAGES.VIEWER;

  return (
    <div className="app">
      {showHeader && <Header navigate={navigate} currentPage={page} />}
      {renderPage()}
    </div>
  );
}
