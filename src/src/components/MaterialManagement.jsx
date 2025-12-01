import React, { useState, useEffect } from 'react';
import { BsPlus, BsPencil, BsTrash, BsX, BsCheck, BsGrid, BsList, BsFilter, BsBox, BsTag, BsStar, BsStarFill, BsImage, BsInfoCircle } from 'react-icons/bs';
import './MaterialManagement.css';
import { useTranslation } from '../hack4edu/hooks_useTranslation';

const MaterialManagement = ({ onBack, detectedPathologies, analyzedImage }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    supplier: '',
    price: '',
    unit: '',
    category: 'General',
    pathology_related: '',
    image_url: ''
  });
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showPathologyInfo, setShowPathologyInfo] = useState(() => {
    // Cargar estado guardado del localStorage
    const saved = localStorage.getItem('pathologyInfoOpen');
    return saved === 'true';
  });
  const { t } = useTranslation();

  // Función para obtener imagen por defecto basada en el nombre del material
  // Nota: Estas son imágenes genéricas. Se recomienda agregar URLs específicas en el campo "URL de Imagen"
  const getDefaultImage = (materialName, category) => {
    const name = materialName.toLowerCase().trim();
    const cat = category ? category.toLowerCase() : '';
    
    // Mapeo de materiales comunes a imágenes
    // Usando Unsplash Source API para obtener imágenes más relevantes
    const materialImages = {
      // Materiales de construcción básicos
      'ladrillo': `https://source.unsplash.com/400x300/?brick,construction`,
      'bloque': `https://source.unsplash.com/400x300/?brick,block,construction`,
      'tabique': `https://source.unsplash.com/400x300/?brick,wall,construction`,
      'cemento': `https://source.unsplash.com/400x300/?cement,concrete,construction`,
      'hormigón': `https://source.unsplash.com/400x300/?concrete,construction`,
      'concreto': `https://source.unsplash.com/400x300/?concrete,construction`,
      'arena': `https://source.unsplash.com/400x300/?sand,construction`,
      'grava': `https://source.unsplash.com/400x300/?gravel,stones,construction`,
      'piedra': `https://source.unsplash.com/400x300/?stone,rock,construction`,
      'cal': `https://source.unsplash.com/400x300/?lime,construction,material`,
      'yeso': `https://source.unsplash.com/400x300/?plaster,construction,material`,
      'mortero': `https://source.unsplash.com/400x300/?mortar,construction,material`,
      
      // Materiales de impermeabilización
      'impermeabilizante': `https://source.unsplash.com/400x300/?waterproof,sealant,construction`,
      'membrana': `https://source.unsplash.com/400x300/?membrane,waterproof,construction`,
      'sellador': `https://source.unsplash.com/400x300/?sealant,construction,material`,
      'silicona': `https://source.unsplash.com/400x300/?silicone,sealant,material`,
      'poliuretano': `https://source.unsplash.com/400x300/?polyurethane,construction,material`,
      'asfalto': `https://source.unsplash.com/400x300/?asphalt,road,construction`,
      
      // Materiales de reparación
      'resina': `https://source.unsplash.com/400x300/?resin,epoxy,construction`,
      'epoxi': `https://source.unsplash.com/400x300/?epoxy,resin,construction`,
      'masilla': `https://source.unsplash.com/400x300/?putty,construction,material`,
      'endurecedor': `https://source.unsplash.com/400x300/?hardener,construction,material`,
      'mortero': `https://source.unsplash.com/400x300/?mortar,construction,material`,
      
      // Pinturas y acabados
      'pintura': `https://source.unsplash.com/400x300/?paint,can,construction`,
      'esmalte': `https://source.unsplash.com/400x300/?enamel,paint,construction`,
      'barniz': `https://source.unsplash.com/400x300/?varnish,wood,finish`,
      'laca': `https://source.unsplash.com/400x300/?lacquer,finish,construction`,
      'acrílico': `https://source.unsplash.com/400x300/?acrylic,paint,construction`,
      
      // Aislamiento
      'aislante': `https://source.unsplash.com/400x300/?insulation,construction,material`,
      'poliestireno': `https://source.unsplash.com/400x300/?polystyrene,insulation,construction`,
      'lana': `https://source.unsplash.com/400x300/?wool,insulation,construction`,
      'espuma': `https://source.unsplash.com/400x300/?foam,insulation,construction`,
      
      // Adhesivos
      'pegamento': `https://source.unsplash.com/400x300/?glue,adhesive,material`,
      'adhesivo': `https://source.unsplash.com/400x300/?adhesive,glue,construction`,
      'cola': `https://source.unsplash.com/400x300/?glue,adhesive,material`,
    };
    
    // Buscar coincidencia exacta primero
    if (materialImages[name]) {
      return materialImages[name];
    }
    
    // Buscar por nombre parcial
    for (const [key, imageUrl] of Object.entries(materialImages)) {
      if (name.includes(key) || key.includes(name)) {
        return imageUrl;
      }
    }
    
    // Si no se encuentra por nombre, buscar por categoría
    const categoryImages = {
      'reparación': `https://source.unsplash.com/400x300/?repair,construction,material`,
      'impermeabilización': `https://source.unsplash.com/400x300/?waterproof,sealant,construction`,
      'sellado': `https://source.unsplash.com/400x300/?sealant,construction,material`,
      'refuerzo': `https://source.unsplash.com/400x300/?reinforcement,construction,material`,
      'acabado': `https://source.unsplash.com/400x300/?finish,paint,construction`,
      'aislamiento': `https://source.unsplash.com/400x300/?insulation,construction,material`,
      'pintura': `https://source.unsplash.com/400x300/?paint,construction,material`,
      'adhesivos': `https://source.unsplash.com/400x300/?adhesive,glue,construction`,
    };
    
    for (const [key, imageUrl] of Object.entries(categoryImages)) {
      if (cat.includes(key)) {
        return imageUrl;
      }
    }
    
    // Imagen por defecto genérica de construcción
    return `https://source.unsplash.com/400x300/?construction,material,building`;
  };

  // Función para calcular el presupuesto total
  const calculateBudget = () => {
    return filteredMaterials.reduce((total, material) => {
      return total + (parseFloat(material.price) || 0);
    }, 0);
  };

  // Función para sugerir categoría basada en patologías
  const suggestCategoryFromPathology = (pathologyLabel) => {
    const categoryMap = {
      'Crack': 'Reparación',
      'Humedad': 'Impermeabilización',
      'Ambos': 'Reparación'
    };
    return categoryMap[pathologyLabel] || 'General';
  };

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('pathologyInfoOpen', showPathologyInfo.toString());
  }, [showPathologyInfo]);

  // Función para toggle de la pestaña de patologías
  const togglePathologyInfo = () => {
    setShowPathologyInfo(!showPathologyInfo);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/materials');
      const data = await response.json();
      if (data.success) {
        // Asegurar que image_url esté presente en todos los materiales
        const materialsWithImages = data.materials.map(material => ({
          ...material,
          image_url: material.image_url || '',
          category: material.category || 'General'
        }));
        console.log('Materiales cargados:', materialsWithImages);
        console.log('Materiales de Impermeabilización:', materialsWithImages.filter(m => m.category === 'Impermeabilización'));
        setMaterials(materialsWithImages);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.name || !formData.supplier || !formData.price || !formData.unit) {
      alert(t('materials.modal.validation_error', 'Por favor completa todos los campos requeridos'));
      return;
    }

    try {
      const url = editingMaterial ? `/materials/${editingMaterial.id}` : '/materials';
      const method = editingMaterial ? 'PUT' : 'POST';
      
      // Preparar datos para enviar
      const materialData = {
        name: formData.name.trim(),
        supplier: formData.supplier.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit.trim(),
        category: formData.category || 'General',
        pathology_related: formData.pathology_related || '',
        image_url: formData.image_url || ''
      };

      console.log('Enviando material:', materialData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (data.success) {
        fetchMaterials();
        setShowModal(false);
        setEditingMaterial(null);
        setFormData({ name: '', supplier: '', price: '', unit: '', category: 'General', pathology_related: '', image_url: '' });
        alert(t('materials.modal.success', 'Material guardado exitosamente'));
      } else {
        console.error('Error del servidor:', data.error);
        alert(t('common.error', 'Error') + ': ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al guardar material:', error);
      alert(t('common.error', 'Error') + ': ' + (error.message || 'Error de conexión'));
    }
  };

  const handleEdit = (material) => {
    console.log('Edit button clicked for material:', material);
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      supplier: material.supplier,
      price: material.price.toString(),
      unit: material.unit,
      category: material.category || 'General',
      pathology_related: material.pathology_related || '',
      image_url: material.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    console.log('Delete button clicked for material ID:', id);
    if (window.confirm(t('materials.modal.confirm_delete', 'Are you sure you want to delete this material?'))) {
      try {
        const response = await fetch(`/materials/${id}`, { method: 'DELETE' });
        const data = await response.json();
        console.log('Delete response:', data);
        if (data.success) {
          fetchMaterials();
          alert(t('materials.delete_success', 'Material eliminado exitosamente'));
        } else {
          alert(t('common.error', 'Error') + ': ' + (data.error || 'Error al eliminar'));
        }
      } catch (error) {
        console.error('Error deleting material:', error);
        alert(t('common.error', 'Error') + ': ' + error.message);
      }
    }
  };

  const openModal = () => {
    setEditingMaterial(null);
    // Si hay patologías detectadas, pre-rellenar con sugerencias
    if (detectedPathologies && detectedPathologies.length > 0) {
      const mainPathology = detectedPathologies.reduce((prev, current) => 
        (current.confidence > prev.confidence) ? current : prev
      );
      let pathologyRelated = mainPathology.label;
      if (detectedPathologies.length > 1) {
        const hasCrack = detectedPathologies.some(p => p.label === 'Crack');
        const hasHumedad = detectedPathologies.some(p => p.label === 'Humedad');
        if (hasCrack && hasHumedad) {
          pathologyRelated = 'Ambos';
        }
      }
      const suggestedCategory = suggestCategoryFromPathology(pathologyRelated);
      setFormData({ name: '', supplier: '', price: '', unit: '', category: suggestedCategory, pathology_related: pathologyRelated, image_url: '' });
    } else {
      setFormData({ name: '', supplier: '', price: '', unit: '', category: 'General', pathology_related: '', image_url: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({ name: '', supplier: '', price: '', unit: '', category: 'General', pathology_related: '', image_url: '' });
  };

  const handleToggleFavorite = async (materialId, currentFavorite) => {
    try {
      const response = await fetch(`/materials/${materialId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentFavorite })
      });
      const data = await response.json();
      if (data.success) {
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const categories = [
    'General', 
    'Reparación', 
    'Impermeabilización', 
    'Sellado', 
    'Refuerzo', 
    'Acabado',
    'Aislamiento',
    'Pintura',
    'Adhesivos',
    'Herramientas',
    'Equipos de Seguridad'
  ];
  const pathologyOptions = ['Crack', 'Humedad', 'Ambos'];

  const filteredMaterials = filterCategory === 'all' 
    ? materials 
    : materials.filter(m => {
        const categoryMatch = (m.category || 'General') === filterCategory;
        if (categoryMatch) {
          console.log('Material filtrado:', {
            name: m.name,
            category: m.category,
            filterCategory: filterCategory,
            image_url: m.image_url,
            match: categoryMatch
          });
        }
        return categoryMatch;
      });
  
  console.log('Filtro activo:', filterCategory);
  console.log('Materiales filtrados:', filteredMaterials.length);

  const getCategoryColor = (category) => {
    const colors = {
      'General': '#666',
      'Reparación': '#f44336',
      'Impermeabilización': '#2196F3',
      'Sellado': '#FF9800',
      'Refuerzo': '#4CAF50',
      'Acabado': '#9C27B0',
      'Aislamiento': '#00BCD4',
      'Pintura': '#E91E63',
      'Adhesivos': '#795548',
      'Herramientas': '#607D8B',
      'Equipos de Seguridad': '#FF5722'
    };
    return colors[category] || '#666';
  };

  if (loading) {
    return (
      <div className="material-management-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="material-management-container">
      {/* Botón pequeño para mostrar/ocultar pestaña de patologías */}
      {detectedPathologies && detectedPathologies.length > 0 && !showPathologyInfo && (
        <button 
          className="pathology-toggle-button"
          onClick={togglePathologyInfo}
          title={t('materials.pathology.show', 'Mostrar patologías')}
        >
          <BsTag />
        </button>
      )}

      {/* Modal pequeño de información de patologías detectadas */}
      {showPathologyInfo && detectedPathologies && detectedPathologies.length > 0 && (
        <div className="pathology-info-modal">
          <div className="pathology-info-content">
            <div className="pathology-info-header">
              <h4>
                <BsTag /> {t('materials.detected_pathologies', 'Patologías Detectadas')}
              </h4>
              <button 
                className="pathology-info-close"
                onClick={togglePathologyInfo}
                title={t('materials.pathology.hide', 'Ocultar')}
              >
                ×
              </button>
            </div>
            {analyzedImage && (
              <div className="pathology-info-image">
                <img src={analyzedImage} alt="Imagen analizada" />
              </div>
            )}
            <div className="pathology-info-body">
              {detectedPathologies.map((pathology, index) => (
                <div key={index} className="pathology-info-item">
                  <span className="pathology-label">{pathology.label}</span>
                  <span className="pathology-confidence">
                    {(pathology.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              <div className="pathology-info-suggestion">
                <strong>{t('materials.suggested_category', 'Categoría sugerida')}:</strong>{' '}
                {suggestCategoryFromPathology(
                  detectedPathologies.reduce((prev, current) => 
                    (current.confidence > prev.confidence) ? current : prev
                  ).label
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="material-header">
        <h1 className="material-title">{t('materials.title', 'Material Management')}</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-button ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards View"
            >
              <BsGrid />
            </button>
            <button 
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <BsList />
            </button>
          </div>
          <button className="add-material-button" onClick={openModal}>
            <BsPlus className="button-icon" />
            {t('materials.add', 'Add Material')}
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <BsFilter className="filter-icon" />
          <label>{t('materials.filter.category', 'Filter by Category:')}</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('materials.filter.all', 'All Categories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="materials-count">
          {filteredMaterials.length} {t('materials.count', 'materials')}
        </div>
      </div>

      <div className="materials-container">
        {filteredMaterials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">{t('materials.empty_title', 'No materials')}</h3>
            <p className="empty-state-description">
              {t('materials.empty_desc', 'Add your first material to start managing your inventory.')}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="materials-cards-grid">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="material-card">
                <div className="card-header" style={{ borderLeftColor: getCategoryColor(material.category || 'General') }}>
                  <div className="card-header-top">
                    <div className="card-category">
                      <BsTag style={{ color: getCategoryColor(material.category || 'General') }} />
                      {material.category || 'General'}
                    </div>
                    <button 
                      className={`favorite-button ${material.is_favorite ? 'active' : ''}`}
                      onClick={() => handleToggleFavorite(material.id, material.is_favorite)}
                      title={material.is_favorite ? t('materials.remove_favorite', 'Remove from favorites') : t('materials.add_favorite', 'Add to favorites')}
                    >
                      {material.is_favorite ? <BsStarFill /> : <BsStar />}
                    </button>
                  </div>
                  {material.pathology_related && (
                    <div className="card-pathology">
                      <BsBox /> {material.pathology_related}
                    </div>
                  )}
                  {material.usage_count > 0 && (
                    <div className="card-usage">
                      {t('materials.used', 'Used')}: {material.usage_count}x
                    </div>
                  )}
                </div>
                <div className="card-image">
                  <img 
                    src={material.image_url || getDefaultImage(material.name, material.category)} 
                    alt={material.name} 
                    onError={(e) => { 
                      // Si falla la imagen, intentar con la imagen por defecto
                      const defaultImg = getDefaultImage(material.name, material.category);
                      if (e.target.src !== defaultImg) {
                        e.target.src = defaultImg;
                      } else {
                        // Si también falla la imagen por defecto, mostrar placeholder
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.card-image-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }
                    }} 
                  />
                  <div className="card-image-placeholder" style={{ display: 'none' }}>
                    <BsImage style={{ fontSize: '3rem', color: '#666', opacity: 0.3 }} />
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{material.name}</h3>
                  <p className="card-supplier">{material.supplier}</p>
                  <div className="card-price">
                    <span className="price-amount">${parseFloat(material.price).toFixed(2)}</span>
                    <span className="price-unit">/{material.unit}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    type="button"
                    className="edit-button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(material);
                    }}
                  >
                    <BsPencil /> {t('materials.actions.edit', 'Edit')}
                  </button>
                  <button 
                    type="button"
                    className="delete-button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(material.id);
                    }}
                  >
                    <BsTrash /> {t('materials.actions.delete', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="materials-table">
              <thead>
                <tr>
                  <th>{t('materials.table.material', 'Material')}</th>
                  <th>{t('materials.table.supplier', 'Supplier')}</th>
                  <th>{t('materials.table.category', 'Category')}</th>
                  <th>{t('materials.table.pathology', 'Pathology')}</th>
                  <th>{t('materials.table.price', 'Price')}</th>
                  <th>{t('materials.table.unit', 'Unit')}</th>
                  <th>{t('materials.table.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td>
                      <div className="table-material-name">
                        {material.image_url && (
                          <img src={material.image_url} alt={material.name} className="table-material-image" onError={(e) => { e.target.style.display = 'none'; }} />
                        )}
                        <span>{material.name}</span>
                        {material.is_favorite && <BsStarFill className="favorite-icon-table" title={t('materials.favorite', 'Favorite')} />}
                      </div>
                    </td>
                    <td>{material.supplier}</td>
                    <td>
                      <span className="category-badge" style={{ backgroundColor: getCategoryColor(material.category || 'General') }}>
                        {material.category || 'General'}
                      </span>
                    </td>
                    <td>{material.pathology_related || '-'}</td>
                    <td>${parseFloat(material.price).toFixed(2)}</td>
                    <td>{material.unit}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className={`favorite-button-table ${material.is_favorite ? 'active' : ''}`}
                          onClick={() => handleToggleFavorite(material.id, material.is_favorite)}
                          title={material.is_favorite ? t('materials.remove_favorite', 'Remove from favorites') : t('materials.add_favorite', 'Add to favorites')}
                        >
                          {material.is_favorite ? <BsStarFill /> : <BsStar />}
                        </button>
                        <button 
                          type="button"
                          className="edit-button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(material);
                          }}
                        >
                          <BsPencil className="action-icon" />
                          {t('materials.actions.edit', 'Edit')}
                        </button>
                        <button 
                          type="button"
                          className="delete-button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(material.id);
                          }}
                        >
                          <BsTrash className="action-icon" />
                          {t('materials.actions.delete', 'Delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="budget-container">
        <div className="budget-section">
          <div className="budget-header">
            <h3 className="budget-title">{t('materials.budget.total', 'Presupuesto Total')}</h3>
          </div>
          <div className="budget-amount">${calculateBudget().toFixed(2)}</div>
          <div className="budget-details">
            {filteredMaterials.length} {t('materials.count', 'materiales')} {t('materials.budget.included', 'incluidos')}
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <button className="back-button" onClick={onBack}>
          {t('materials.actions.back', 'Back to Dashboard')}
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingMaterial ? t('materials.modal.edit_title', 'Edit Material') : t('materials.modal.add_title', 'Add Material')}
              </h2>
              <button className="close-button" onClick={closeModal}>
                <BsX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('materials.modal.labels.material', 'Material')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={t('materials.modal.placeholders.material', 'Material name')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('materials.modal.labels.supplier', 'Supplier')}</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={t('materials.modal.placeholders.supplier', 'Supplier name')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('materials.modal.labels.price', 'Price')}</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={t('materials.modal.placeholders.price', '0.00')}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('materials.modal.labels.unit', 'Unit')}</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={t('materials.modal.placeholders.unit', 'kg, m, pc, etc.')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('materials.modal.labels.category', 'Category')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('materials.modal.labels.pathology', 'Related Pathology')}</label>
                <select
                  name="pathology_related"
                  value={formData.pathology_related}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">{t('materials.modal.placeholders.none', 'None')}</option>
                  {pathologyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <small className="form-hint">
                  {t('materials.modal.hints.pathology', 'Select the pathology this material is used for')}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <BsImage style={{ marginRight: 8 }} />
                  {t('materials.modal.labels.image_url', 'Image URL')}
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={t('materials.modal.placeholders.image_url', 'https://example.com/image.jpg')}
                />
                <small className="form-hint">
                  {t('materials.modal.hints.image_url', 'Optional: URL of the material image')}
                </small>
                {formData.image_url && (
                  <div className="image-preview-form">
                    <img src={formData.image_url} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  {t('materials.modal.buttons.cancel', 'Cancel')}
                </button>
                <button type="submit" className="save-button">
                  <BsCheck className="button-icon" />
                  {editingMaterial ? t('materials.modal.buttons.update', 'Update') : t('materials.modal.buttons.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManagement;