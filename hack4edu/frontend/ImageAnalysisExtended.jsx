import React, { useState, useRef } from 'react';
import { BsUpload, BsImage, BsArrowLeftCircle, BsFileText, BsGear, BsBook, BsClipboardCheck } from 'react-icons/bs';
import './ImageAnalysisExtended.css';
// Asegurar estilos también cuando se importe desde src/src/
// (CRA no permite importar CSS fuera de src, por eso duplicamos vía @import proxy)
import '../../src/hack4edu/ImageAnalysisExtended.css';

const ImageAnalysisExtended = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('raw');
  const [challengeAnswers, setChallengeAnswers] = useState({
    triage: '',
    investigation: '',
    solution: '',
    notes: ''
  });
  const canvasRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:5001/analyze_extended', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        // Dibujar detecciones en el canvas
        setTimeout(() => {
          if (data.image_size && data.detections) {
            drawDetections(preview, data.detections, data.image_size);
          }
        }, 100);
      } else {
        setError(data.error || 'Error analyzing image');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const drawDetections = (imageSrc, detections, imageSize) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSize) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 300;
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const scaleX = width / imageSize[0];
      const scaleY = height / imageSize[1];
      
      detections.forEach((detection, index) => {
        const [x1, y1, x2, y2] = detection.bbox;
        const scaledX1 = x1 * scaleX;
        const scaledY1 = y1 * scaleY;
        const scaledX2 = x2 * scaleX;
        const scaledY2 = y2 * scaleY;
        
        const colors = {
          "Person": "#4CAF50",
          "Crack": "#f44336",
          "Humidity": "#2196F3"
        };
        const color = colors[detection.label] || "#FFD700";
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX1, scaledY1, scaledX2 - scaledX1, scaledY2 - scaledY1);
        
        const label = `${detection.label}: ${(detection.confidence * 100).toFixed(1)}%`;
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = color;
        ctx.fillRect(scaledX1, scaledY1 - 20, textWidth + 10, 20);
        
        ctx.fillStyle = 'white';
        ctx.fillText(label, scaledX1 + 5, scaledY1 - 5);
      });
    };
    
    img.src = imageSrc;
  };

  const handleChallengeChange = (step, value) => {
    setChallengeAnswers(prev => ({
      ...prev,
      [step]: value
    }));
  };

  const generateReport = () => {
    // Implementar generación de PDF
    console.log('Generando reporte PDF...', challengeAnswers);
    alert('Función de generación de PDF en desarrollo');
  };

  const tabs = [
    { id: 'raw', label: 'Datos Crudos', icon: BsGear },
    { id: 'classification', label: 'Clasificación', icon: BsFileText },
    { id: 'knowledge', label: 'Base de Conocimiento', icon: BsBook },
    { id: 'action', label: 'Plan de Acción', icon: BsClipboardCheck }
  ];

  return (
    <div className="image-analysis-extended-container">
      <div className="analysis-header">
        <button className="back-button" onClick={onBack}>
          <BsArrowLeftCircle className="icon" /> Back
        </button>
        <h2><BsImage className="icon" /> Tutor Virtual de Patologías Estructurales</h2>
      </div>

      <div className="analysis-content">
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-label">
                <BsUpload className="upload-icon" />
                <span>Select Image</span>
              </label>
            </div>

            {preview && (
              <div className="image-preview">
                <div className="image-container">
                  <img src={preview} alt="Preview" />
                  <canvas 
                    ref={canvasRef}
                    className="detection-canvas"
                  />
                </div>
                <div className="image-info">
                  <p><strong>File:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="action-buttons">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="analyze-button"
              >
                {loading ? 'Analyzing...' : 'Analyze with Double AI'}
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="results-section">
            <div className="results-card">
              <div className="tabs-container">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="tab-icon" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === 'raw' && (
                  <div className="raw-data-tab">
                    <h3>Datos Crudos (IA N°1)</h3>
                    <div className="detections-list">
                      {results.detections.map((detection, index) => (
                        <div key={index} className="detection-item">
                          <div className="detection-header">
                            <span className="detection-label">{detection.label}</span>
                            <span className="detection-confidence">
                              {(detection.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="detection-details">
                            <p><strong>Position:</strong> ({detection.bbox[0]}, {detection.bbox[1]}) - ({detection.bbox[2]}, {detection.bbox[3]})</p>
                            <p><strong>Class ID:</strong> {detection.class_id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'classification' && (
                  <div className="classification-tab">
                    <h3>Clasificación (IA N°2)</h3>
                    <div className="classifications-list">
                      {results.classifications.map((classification, index) => (
                        <div key={index} className="classification-item">
                          <h4>Detección {index + 1}</h4>
                          <div className="classification-details">
                            <p><strong>Tipo:</strong> {classification.classification.type}</p>
                            <p><strong>Severidad:</strong> {classification.classification.severity}</p>
                            <p><strong>Confianza:</strong> {(classification.classification.confidence * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'knowledge' && (
                  <div className="knowledge-tab">
                    <h3>Base de Conocimiento</h3>
                    <div className="knowledge-content">
                      <p>Contenido educativo basado en las clasificaciones detectadas...</p>
                      {/* Aquí se cargaría el contenido dinámico */}
                    </div>
                  </div>
                )}

                {activeTab === 'action' && (
                  <div className="action-tab">
                    <h3>Plan de Acción - El Reto</h3>
                    <div className="challenge-steps">
                      <div className="challenge-step">
                        <h4>Paso 1: Triaje (Prioridad)</h4>
                        <div className="radio-group">
                          {['Alto', 'Medio', 'Bajo'].map(option => (
                            <label key={option} className="radio-option">
                              <input
                                type="radio"
                                name="triage"
                                value={option}
                                checked={challengeAnswers.triage === option}
                                onChange={(e) => handleChallengeChange('triage', e.target.value)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="challenge-step">
                        <h4>Paso 2: Plan de Investigación</h4>
                        <div className="radio-group">
                          {['Revisar planos', 'Reparar ya', 'Consultar especialista'].map(option => (
                            <label key={option} className="radio-option">
                              <input
                                type="radio"
                                name="investigation"
                                value={option}
                                checked={challengeAnswers.investigation === option}
                                onChange={(e) => handleChallengeChange('investigation', e.target.value)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="challenge-step">
                        <h4>Paso 3: Concepto de Solución</h4>
                        <div className="radio-group">
                          {['Estructural', 'Cosmética', 'Preventiva'].map(option => (
                            <label key={option} className="radio-option">
                              <input
                                type="radio"
                                name="solution"
                                value={option}
                                checked={challengeAnswers.solution === option}
                                onChange={(e) => handleChallengeChange('solution', e.target.value)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="challenge-step">
                        <h4>Notas Adicionales</h4>
                        <textarea
                          className="notes-textarea"
                          placeholder="Escribe tus observaciones técnicas aquí..."
                          value={challengeAnswers.notes}
                          onChange={(e) => handleChallengeChange('notes', e.target.value)}
                        />
                      </div>

                      <button 
                        className="generate-report-button"
                        onClick={generateReport}
                        disabled={!challengeAnswers.triage || !challengeAnswers.investigation || !challengeAnswers.solution}
                      >
                        Generar Reporte de Campo (PDF)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysisExtended;
