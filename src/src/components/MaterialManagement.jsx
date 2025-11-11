import React, { useState, useEffect } from 'react';
import { BsPlus, BsPencil, BsTrash, BsX, BsCheck } from 'react-icons/bs';
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
    unit: ''
  });
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
        setFormData({ name: '', supplier: '', price: '', unit: '' });
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
      unit: material.unit
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
    setFormData({ name: '', supplier: '', price: '', unit: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({ name: '', supplier: '', price: '', unit: '' });
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
        <button className="add-material-button" onClick={openModal}>
          <BsPlus className="button-icon" />
          {t('materials.add', 'Add Material')}
        </button>
      </div>

      <div className="materials-table-container">
        {materials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">{t('materials.empty_title', 'No materials')}</h3>
            <p className="empty-state-description">
              {t('materials.empty_desc', 'Add your first material to start managing your inventory.')}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="materials-table">
              <thead>
                <tr>
                  <th>{t('materials.table.material', 'Material')}</th>
                  <th>{t('materials.table.supplier', 'Supplier')}</th>
                  <th>{t('materials.table.price', 'Price')}</th>
                  <th>{t('materials.table.unit', 'Unit')}</th>
                  <th>{t('materials.table.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.name}</td>
                    <td>{material.supplier}</td>
                    <td>${material.price}</td>
                    <td>{material.unit}</td>
                    <td>
                      <div className="action-buttons">
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