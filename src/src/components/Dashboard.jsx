import React, { useState } from 'react';
import { BsCameraVideo, BsBox, BsImage, BsGear, BsArrowRightCircle, BsBook, BsShieldCheck, BsGraphUp, BsBuilding, BsClipboardCheck } from 'react-icons/bs';
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
  const [detectedPathologies, setDetectedPathologies] = useState(null);
  const [analyzedImage, setAnalyzedImage] = useState(null);
  const { t } = useTranslation();
  
  // Nota: los componentes extendidos residen dentro de src/src/hack4edu/
  React.useEffect(() => {
    const handler = () => setCurrentView('image-analysis-extended');
    window.addEventListener('openTutorFromAnalysis', handler);
    return () => window.removeEventListener('openTutorFromAnalysis', handler);
  }, []);
  
  const openTutor = () => setCurrentView('tutor-empty');

  const handleNavigateToMaterials = (pathologies, image) => {
    setDetectedPathologies(pathologies);
    setAnalyzedImage(image);
    setCurrentView('materials');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'drone-viewer':
        return <DroneViewer onBack={() => setCurrentView('dashboard')} />;
      case 'materials':
        return (
          <MaterialManagement 
            onBack={() => {
              setCurrentView('dashboard');
              setDetectedPathologies(null);
              setAnalyzedImage(null);
            }}
            detectedPathologies={detectedPathologies}
            analyzedImage={analyzedImage}
          />
        );
      case 'image-analysis':
        return (
          <ImageAnalysis 
            onBack={() => setCurrentView('dashboard')}
            onNavigateToMaterials={handleNavigateToMaterials}
          />
        );
      case 'tutor-empty':
        return <Tutor onBack={() => setCurrentView('dashboard')} />;
      case 'image-analysis-extended':
        return <ImageAnalysisExtended onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="dashboard-content">
            {/* Header profesional con branding */}
            <div className="dashboard-header">
              <div className="header-content">
                <div className="logo-section">
                  <div className="logo-icon">
                    <BsBuilding />
                  </div>
                  <div className="logo-text">
                    <h1 className="dashboard-title">DIPIA</h1>
                    <p className="company-tagline">{t('home.tagline', 'Diagnóstico Inteligente de Patologías en Infraestructura')}</p>
                  </div>
                </div>
                <div className="header-actions">
                  <LanguageSelector />
                </div>
              </div>
              <div className="header-stats">
                <div className="stat-item">
                  <BsShieldCheck className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">AI</span>
                    <span className="stat-label">{t('home.stats.ai', 'Powered')}</span>
                  </div>
                </div>
                <div className="stat-item">
                  <BsGraphUp className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">99%</span>
                    <span className="stat-label">{t('home.stats.accuracy', 'Precisión')}</span>
                  </div>
                </div>
                <div className="stat-item">
                  <BsClipboardCheck className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">{t('home.stats.support', 'Soporte')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de servicios principales */}
            <div className="services-section">
              <h2 className="section-title">{t('home.services.title', 'Nuestros Servicios')}</h2>
              <p className="section-description">{t('home.services.description', 'Herramientas profesionales para el diagnóstico y gestión de patologías estructurales')}</p>
            </div>
            
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => setCurrentView('drone-viewer')}>
                <div className="card-icon">
                  <BsCameraVideo />
                </div>
                <div className="card-content">
                  <h3>{t('home.drone.title', 'Drone Viewer')}</h3>
                  <p>{t('home.drone.subtitle', 'Monitoreo en tiempo real con IA')}</p>
                  <div className="card-badge">{t('home.badge.realtime', 'Tiempo Real')}</div>
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
                  <h3>{t('home.materials.title', 'Gestión de Materiales')}</h3>
                  <p>{t('home.materials.subtitle', 'Administra tu inventario y presupuestos')}</p>
                  <div className="card-badge">{t('home.badge.inventory', 'Inventario')}</div>
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
                  <h3>{t('home.analysis.title', 'Análisis de Imágenes')}</h3>
                  <p>{t('home.analysis.subtitle', 'Detección de patologías con IA')}</p>
                  <div className="card-badge">{t('home.badge.ai', 'Inteligencia Artificial')}</div>
                </div>
                <div className="card-arrow">
                  <BsArrowRightCircle />
                </div>
              </div>
            </div>

            {/* Sección de información adicional */}
            <div className="info-section">
              <div className="info-card">
                <BsShieldCheck className="info-icon" />
                <h4>{t('home.info.quality.title', 'Calidad Certificada')}</h4>
                <p>{t('home.info.quality.text', 'Nuestro sistema utiliza tecnología de vanguardia para garantizar diagnósticos precisos y confiables.')}</p>
              </div>
              <div className="info-card">
                <BsGraphUp className="info-icon" />
                <h4>{t('home.info.innovation.title', 'Innovación Continua')}</h4>
                <p>{t('home.info.innovation.text', 'Actualizamos constantemente nuestros algoritmos de IA para mejorar la detección de patologías.')}</p>
              </div>
              <div className="info-card">
                <BsBuilding className="info-icon" />
                <h4>{t('home.info.expertise.title', 'Experiencia Comprobada')}</h4>
                <p>{t('home.info.expertise.text', 'Años de experiencia en diagnóstico de patologías estructurales y gestión de infraestructura.')}</p>
              </div>
            </div>
            
            <div className="dashboard-footer" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={openTutor}
                className="tutor-button"
              >
                <BsBook /> {t('home.buttons.tutor', 'Tutor')}
              </button>
              <button className="logout-button" onClick={onLogout}>
                {t('home.buttons.logout', 'Cerrar Sesión')}
              </button>
            </div>

            {/* Footer de la empresa */}
            <div className="company-footer">
              <p className="footer-text">
                <strong>DIPIA</strong> - {t('home.footer.text', 'Diagnóstico Inteligente de Patologías en Infraestructura')}
              </p>
              <p className="footer-copyright">
                © {new Date().getFullYear()} DIPIA. {t('home.footer.rights', 'Todos los derechos reservados')}
              </p>
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