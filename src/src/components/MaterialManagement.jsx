import React, { useState, useEffect } from 'react';
import { BsPlus, BsPencil, BsTrash, BsX, BsCheck, BsGrid, BsList, BsFilter, BsBox, BsTag, BsStar, BsStarFill, BsImage } from 'react-icons/bs';
import './MaterialManagement.css';
import { useTranslation } from '../hack4edu/hooks_useTranslation';

const MaterialManagement = ({ onBack }) => {
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
  const { t } = useTranslation();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/materials');
      const data = await response.json();
      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (_) {
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
    try {
      const url = editingMaterial ? `/materials/${editingMaterial.id}` : '/materials';
      const method = editingMaterial ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchMaterials();
        setShowModal(false);
        setEditingMaterial(null);
        setFormData({ name: '', supplier: '', price: '', unit: '', category: 'General', pathology_related: '', image_url: '' });
        alert(t('success', 'Success'));
      } else {
        alert(t('common.error', 'Error') + ': ' + (data.error || ''));
      }
    } catch (error) {
      alert(t('common.error', 'Error') + ': ' + error.message);
    }
  };

  const handleEdit = (material) => {
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
    if (window.confirm(t('materials.modal.confirm_delete', 'Are you sure you want to delete this material?'))) {
      try {
        const response = await fetch(`/materials/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          fetchMaterials();
        }
      } catch (_) {}
    }
  };

  const openModal = () => {
    setEditingMaterial(null);
    setFormData({ name: '', supplier: '', price: '', unit: '', category: 'General', pathology_related: '', image_url: '' });
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
    : materials.filter(m => m.category === filterCategory);

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
                {material.image_url && (
                  <div className="card-image">
                    <img src={material.image_url} alt={material.name} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <div className="card-body">
                  <h3 className="card-title">{material.name}</h3>
                  <p className="card-supplier">{material.supplier}</p>
                  <div className="card-price">
                    <span className="price-amount">${parseFloat(material.price).toFixed(2)}</span>
                    <span className="price-unit">/{material.unit}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="edit-button" onClick={() => handleEdit(material)}>
                    <BsPencil /> {t('materials.actions.edit', 'Edit')}
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(material.id)}>
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
                        <button className="edit-button" onClick={() => handleEdit(material)}>
                          <BsPencil className="action-icon" />
                          {t('materials.actions.edit', 'Edit')}
                        </button>
                        <button className="delete-button" onClick={() => handleDelete(material.id)}>
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