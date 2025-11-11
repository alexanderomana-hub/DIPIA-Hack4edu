import React, { useState, useEffect } from 'react';
import { BsCameraVideo, BsArrowLeftCircle, BsPlay, BsStop } from 'react-icons/bs';
import './DroneViewer.css';

const DroneViewer = ({ onBack }) => {
  const [detections, setDetections] = useState([]);
  const [isReceiving, setIsReceiving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(0); // NUEVO ESTADO
  const cameraOptions = [0, 1, 2, 3]; // Puedes modificar/nombre por tu conveniencia

  useEffect(() => {
    let interval;
    
    if (isReceiving) {
      // Get detections every second
      interval = setInterval(async () => {
        try {
          const response = await fetch('/get_latest_detections');
          const data = await response.json();
          
          if (data.detections && data.detections.length > 0) {
            setDetections(data.detections);
            setLastUpdate(new Date(data.timestamp * 1000));
          }
        } catch (error) {
          console.error('Error getting detections:', error);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReceiving]);

  const startReceiving = async () => {
    // Enviar la cámara seleccionada al backend antes de activar la recepción
    try {
      await fetch('/start_camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_id: selectedCamera })
      });
    } catch (err) {
      console.error('Error setting camera:', err);
    }
    setIsReceiving(true);
  };

  const stopReceiving = () => {
    setIsReceiving(false);
    setDetections([]);
    setLastUpdate(null);
  };

  return (
    <div className="drone-viewer-container">
      <div className="drone-viewer-header">
        <button className="back-button" onClick={onBack}>
          <BsArrowLeftCircle className="icon" /> Back
        </button>
        <h2><BsCameraVideo className="icon" /> Drone Viewer (Real-time with AI)</h2>
      </div>

      <div className="camera-controls">
        {/* Nuevo: Selección de Cámara */}
        <label style={{ marginRight: 8 }}>Camera: 
          <select value={selectedCamera} onChange={e => setSelectedCamera(Number(e.target.value))} style={{ marginLeft: 4 }}>
            {cameraOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <p className="info-text">
          📱 <strong>Instructions:</strong><br/>
          1. Run <code>python camera_app.py</code> in a terminal<br/>
          2. Click "Start" in the desktop application<br/>
          3. Click "Start Reception" here
        </p>
        
        <button 
          onClick={startReceiving} 
          disabled={isReceiving} 
          className="start-button"
        >
          <BsPlay className="icon" /> Start Reception
        </button>
        <button 
          onClick={stopReceiving} 
          disabled={!isReceiving} 
          className="stop-button"
        >
          <BsStop className="icon" /> Stop Reception
        </button>
      </div>

      <div className="detection-status">
        {isReceiving ? (
          <div className="status-active">
            <span className="status-indicator">🟢</span>
            Receiving camera data...
            {lastUpdate && (
              <span className="last-update">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        ) : (
          <div className="status-inactive">
            <span className="status-indicator">🔴</span>
            Not receiving data
          </div>
        )}
      </div>

      <div className="detections-container">
        <h3>Real-time Detections</h3>
        {detections.length > 0 ? (
          <div className="detections-list">
            {detections.map((detection, index) => (
              <div key={index} className={`detection-item detection-${detection.label.toLowerCase()}`}>
                <div className="detection-header">
                  <span className="detection-label">{detection.label}</span>
                  <span className="detection-confidence">
                    {(detection.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="detection-details">
                  Position: ({detection.bbox[0]}, {detection.bbox[1]}) - 
                  ({detection.bbox[2]}, {detection.bbox[3]})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-detections">
            {isReceiving ? "Waiting for detections..." : "Start reception to see detections"}
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneViewer;