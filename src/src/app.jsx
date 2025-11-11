import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MaterialManagement from './components/MaterialManagement';
import DroneViewer from './components/DroneViewer';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} onNavigate={setCurrentView} />;
      case 'register':
        return <Register onNavigate={setCurrentView} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} onNavigate={setCurrentView} />;
      case 'materials':
        return <MaterialManagement onBack={() => setCurrentView('dashboard')} />;
      case 'drone_viewer':
        return <DroneViewer onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Login onLogin={handleLogin} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;