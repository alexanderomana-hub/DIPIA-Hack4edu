import React, { useState } from 'react';
import { BsCameraVideo, BsBox, BsImage, BsGear, BsArrowRightCircle, BsBook } from 'react-icons/bs';
import ImageAnalysisExtended from '../hack4edu/ImageAnalysisExtended.jsx';
import LanguageSelector from '../hack4edu/LanguageSelector.jsx';
import DroneViewer from './DroneViewer';
import MaterialManagement from './MaterialManagement';
import ImageAnalysis from './ImageAnalysis';
import Tutor from './Tutor';
import './Dashboard.css';
import { useTranslation } from '../hack4edu/hooks_useTranslation';

const Dashboard = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { t } = useTranslation();
  
  // Nota: los componentes extendidos residen dentro de src/src/hack4edu/
  React.useEffect(() => {
    const handler = () => setCurrentView('image-analysis-extended');
    window.addEventListener('openTutorFromAnalysis', handler);
    return () => window.removeEventListener('openTutorFromAnalysis', handler);
  }, []);
  
  const openTutor = () => setCurrentView('tutor-empty');

  const renderContent = () => {
    switch (currentView) {
      case 'drone-viewer':
        return <DroneViewer onBack={() => setCurrentView('dashboard')} />;
      case 'materials':
        return <MaterialManagement onBack={() => setCurrentView('dashboard')} />;
      case 'image-analysis':
        return <ImageAnalysis onBack={() => setCurrentView('dashboard')} />;
      case 'tutor-empty':
        return <Tutor onBack={() => setCurrentView('dashboard')} />;
      case 'image-analysis-extended':
        return <ImageAnalysisExtended onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="dashboard-content">
            <div className="dashboard-header">
              <h1 className="dashboard-title"> DIPIA</h1>
              <p className="dashboard-subtitle">{t('home.subtitle', 'Welcome to the pathology diagnosis system')}</p>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <LanguageSelector />
              </div>
            </div>
            
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => setCurrentView('drone-viewer')}>
                <div className="card-icon">
                  <BsCameraVideo />
                </div>
                <div className="card-content">
                  <h3>{t('home.drone.title', 'Drone Viewer')}</h3>
                  <p>{t('home.drone.subtitle', 'Real-time monitoring with AI')}</p>
                </div>
                <div className="card-arrow">
                  <BsArrowRightCircle />
                </div>
              </div>
              
              <div className="dashboard-card" onClick={() => setCurrentView('materials')}>
                <div className="card-icon">
                  <BsBox />
                </div>
                <div className="card-content">
                  <h3>{t('home.materials.title', 'Material Management')}</h3>
                  <p>{t('home.materials.subtitle', 'Manage your inventory')}</p>
                </div>
                <div className="card-arrow">
                  <BsArrowRightCircle />
                </div>
              </div>
              
              <div className="dashboard-card" onClick={() => setCurrentView('image-analysis')}>
                <div className="card-icon">
                  <BsImage />
                </div>
                <div className="card-content">
                  <h3>{t('home.analysis.title', 'Image Analysis')}</h3>
                  <p>{t('home.analysis.subtitle', 'Detect pathologies with AI')}</p>
                </div>
                <div className="card-arrow">
                  <BsArrowRightCircle />
                </div>
              </div>

            </div>
            
            <div className="dashboard-footer" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={openTutor}
                style={{
                  background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
                  color: '#fff',
                  border: 'none',
                  padding: '16px 26px',
                  borderRadius: 30,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '1.15rem',
                  boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)'
                }}
              >
                <BsBook style={{ fontSize: 22 }} /> {t('home.buttons.tutor', 'Tutor')}
              </button>
              <button className="logout-button" onClick={onLogout}>
                {t('home.buttons.logout', 'Logout')}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {renderContent()}
    </div>
  );
};

export default Dashboard;