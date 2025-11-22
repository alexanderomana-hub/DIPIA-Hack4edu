import React, { useState, useRef, useEffect } from 'react';
import { BsUpload, BsImage, BsArrowLeftCircle, BsEye, BsDownload, BsBox, BsTag, BsCart, BsStarFill } from 'react-icons/bs';
import './ImageAnalysis.css';
import { useTranslation } from '../hack4edu/hooks_useTranslation';

const ImageAnalysis = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [extraInfoIndex, setExtraInfoIndex] = useState(null);
  const [recommendedMaterials, setRecommendedMaterials] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { t } = useTranslation();

  const getExtraInfo = (label) => {
    const info = {
      'Crack': 'Grieta en el material. Causas comunes: asentamientos diferenciales, sobrecarga, contracción por secado. Recomendación: evaluar longitud, apertura y patrón; monitorear y consultar especialista si es estructural.',
      'Humedad': 'Presencia de humedad. Causas: filtraciones, capilaridad, condensación. Recomendación: identificar fuente (pluvial, sanitaria, capilaridad), mejorar ventilación, sellar e impermeabilizar.',
      'Persona': 'Detección de persona en la imagen (no es patología). Útil para contexto y seguridad.',
    };
    return info[label] || 'Información general no disponible para esta clase.';
  };
  const canvasRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setResults(null);
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawDetections = (imageSrc, detections, imageSize) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSize) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Ajustar tamaño del canvas
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
      
      // Dibujar imagen
      ctx.drawImage(img, 0, 0, width, height);
      
      // Dibujar detecciones
      const scaleX = width / imageSize[0];
      const scaleY = height / imageSize[1];
      
      detections.forEach((detection, index) => {
        const [x1, y1, x2, y2] = detection.bbox;
        const scaledX1 = x1 * scaleX;
        const scaledY1 = y1 * scaleY;
        const scaledX2 = x2 * scaleX;
        const scaledY2 = y2 * scaleY;
        
        // Color según la clase
        const colors = {
          "Persona": "#4CAF50",
          "Crack": "#f44336",
          "Humedad": "#2196F3"
        };
        const color = colors[detection.label] || "#FFD700";
        
        // Dibujar rectángulo
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX1, scaledY1, scaledX2 - scaledX1, scaledY2 - scaledY1);
        
        // Dibujar etiqueta con fondo
        const label = `${detection.label}: ${(detection.confidence * 100).toFixed(1)}%`;
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(label).width;
        
        // Fondo de la etiqueta
        ctx.fillStyle = color;
        ctx.fillRect(scaledX1, scaledY1 - 20, textWidth + 10, 20);
        
        // Texto de la etiqueta
        ctx.fillStyle = 'white';
        ctx.fillText(label, scaledX1 + 5, scaledY1 - 5);
      });
    };
    
    img.src = imageSrc;
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(t('common.select_image', 'Please select an image'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/analyze_image', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setResults(data);
        // Dibujar detecciones en el canvas
        setTimeout(() => {
          if (data.image_size && data.detections) {
            drawDetections(preview, data.detections, data.image_size);
          }
        }, 100);
        
        // Obtener recomendaciones de materiales basadas en las patologías detectadas
        if (data.detections && data.detections.length > 0) {
          fetchRecommendations(data.detections);
        }
      } else {
        setError(data.error || t('common.error', 'Error analyzing image'));
      }
    } catch (err) {
      setError(t('common.error', 'Connection error: ') + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (detections) => {
    // Filtrar solo patologías (no personas)
    const pathologies = detections
      .filter(d => d.label !== 'Persona' && d.label !== 'Person')
      .map(d => d.label);
    
    if (pathologies.length === 0) {
      setRecommendedMaterials([]);
      return;
    }
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/materials/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathologies })
      });
      const data = await response.json();
      if (data.success) {
        setRecommendedMaterials(data.materials || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleMaterialUse = async (materialId) => {
    try {
      const response = await fetch(`/materials/${materialId}/use`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        // Actualizar el contador en el estado local
        setRecommendedMaterials(prev => 
          prev.map(m => m.id === materialId ? { ...m, usage_count: data.usage_count } : m)
        );
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResults(null);
    setError('');
    setRecommendedMaterials([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const getDetectionColor = (label) => {
    const colors = {
      "Persona": "#4CAF50",
      "Crack": "#f44336",
      "Humedad": "#2196F3"
    };
    return colors[label] || "#FFD700";
  };

  return (
    <div className="image-analysis-container">
      <div className="analysis-header">
        <button className="back-button" onClick={onBack}>
          <BsArrowLeftCircle className="icon" /> {t('image.back', 'Back')}
        </button>
        <h2><BsImage className="icon" /> {t('image.title', 'AI Image Analysis')}</h2>
      </div>

      <div className="analysis-content">
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-area">
              <input type="file" id="image-upload" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              <label htmlFor="image-upload" className="upload-label">
                <BsUpload className="upload-icon" />
                <span>{t('common.select_image', 'Select Image')}</span>
              </label>
            </div>

            {preview && (
              <div className="image-preview">
                <div className="image-container">
                  <img src={preview} alt="Preview" />
                  <canvas ref={canvasRef} className="detection-canvas" />
                </div>
                <div className="image-info">
                  <p><strong>{t('image.file', 'File:')}</strong> {selectedFile.name}</p>
                  <p><strong>{t('image.size', 'Size:')}</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="action-buttons">
              <button onClick={handleAnalyze} disabled={!selectedFile || loading} className="analyze-button">
                {loading ? t('image.analyzing', 'Analyzing...') : t('image.analyze', 'Analyze with AI')}
              </button>
              <button onClick={handleReset} disabled={loading} className="reset-button">
                {t('image.clear', 'Clear')}
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="results-section">
            <div className="results-card">
              <h3>{t('image.results', 'Analysis Results')}</h3>
              
              <div className="results-summary">
                <div className="summary-item">
                  <span className="summary-label">{t('image.summary.total', 'Total detections:')}</span>
                  <span className="summary-value">{results.total_detections || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('image.summary.size', 'Image size:')}</span>
                  <span className="summary-value">
                    {results.image_size ? `${results.image_size[0]}x${results.image_size[1]}px` : 'N/A'}
                  </span>
                </div>
              </div>

              {results.detections && results.detections.length > 0 ? (
                <div className="detections-list">
                  <h4>{t('image.detected', 'Detected Objects:')}</h4>
                  {results.detections.map((detection, index) => (
                    <div key={index} className="detection-item" style={{ borderLeftColor: getDetectionColor(detection.label) }}>
                      <div className="detection-header">
                        <span className="detection-label">{detection.label}</span>
                        <span className="detection-confidence">{(detection.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="detection-details">
                        <p><strong>{t('raw_data.position', 'Position')}:</strong> ({detection.bbox[0]}, {detection.bbox[1]}) - ({detection.bbox[2]}, {detection.bbox[3]})</p>
                        <p><strong>{t('raw_data.class_id', 'Class ID')}:</strong> {detection.class_id}</p>
                        <button className="info-button" onClick={() => setExtraInfoIndex(extraInfoIndex === index ? null : index)}>
                          Información extra
                        </button>
                        {extraInfoIndex === index && (
                          <div className="extra-info">
                            {getExtraInfo(detection.label)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-detections">
                  <p>{t('image.no_detections', 'No objects detected in the image')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {recommendedMaterials.length > 0 && (
          <div className="recommendations-section">
            <div className="recommendations-card">
              <h3 className="recommendations-title">
                <BsBox className="icon" /> {t('image.recommendations.title', 'Recommended Materials')}
              </h3>
              <p className="recommendations-subtitle">
                {t('image.recommendations.subtitle', 'Based on detected pathologies, here are materials available in your inventory:')}
              </p>
              <div className="recommendations-grid">
                {recommendedMaterials.map((material) => (
                  <div 
                    key={material.id} 
                    className="recommendation-item"
                    onClick={() => handleMaterialUse(material.id)}
                    style={{ cursor: 'pointer' }}
                    title={t('image.recommendations.click_to_use', 'Click to mark as used')}
                  >
                    {material.image_url && (
                      <div className="recommendation-image">
                        <img src={material.image_url} alt={material.name} onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <div className="recommendation-header">
                      <h4 className="recommendation-name">{material.name}</h4>
                      {material.category && (
                        <span className="recommendation-category" style={{ 
                          backgroundColor: material.category === 'Reparación' ? '#f44336' : 
                                          material.category === 'Impermeabilización' ? '#2196F3' : 
                                          material.category === 'Sellado' ? '#FF9800' : 
                                          material.category === 'Refuerzo' ? '#4CAF50' : '#666'
                        }}>
                          {material.category}
                        </span>
                      )}
                    </div>
                    <p className="recommendation-supplier">{material.supplier}</p>
                    <div className="recommendation-price">
                      <span className="price">${parseFloat(material.price).toFixed(2)}</span>
                      <span className="unit">/{material.unit}</span>
                    </div>
                    {material.match_reason && (
                      <div className="recommendation-match">
                        <BsTag /> {t('image.recommendations.match', 'Recommended for')}: {material.match_reason}
                      </div>
                    )}
                    <div className="recommendation-footer">
                      {material.is_favorite && (
                        <div className="recommendation-badge">
                          <BsStarFill /> {t('materials.favorite', 'Favorite')}
                        </div>
                      )}
                      {material.usage_count > 0 && (
                        <div className="recommendation-usage">
                          {t('materials.used', 'Used')} {material.usage_count}x
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loadingRecommendations && (
          <div className="loading-recommendations">
            {t('image.recommendations.loading', 'Loading recommendations...')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysis;