import React, { useState } from 'react';
import { permissionCategories, permissionLabels } from './permissionsConfig';
import './PermissionsSelector.css';

export default function PermissionsSelector({ selectedPermissions = [], onChange }) {
  const [activeTab, setActiveTab] = useState(permissionCategories[0]?.id);

  const handlePermissionToggle = (permission) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission];
    onChange(newPermissions);
  };

  const handleSelectAllInCategory = (category) => {
    const allSelected = category.permissions.every(p => selectedPermissions.includes(p));
    
    if (allSelected) {
      // Deseleccionar todos los de esta categoría
      const newPermissions = selectedPermissions.filter(p => !category.permissions.includes(p));
      onChange(newPermissions);
    } else {
      // Seleccionar todos los de esta categoría
      const newPermissions = [...new Set([...selectedPermissions, ...category.permissions])];
      onChange(newPermissions);
    }
  };

  const handleSelectAll = () => {
    const allPermissions = permissionCategories.flatMap(c => c.permissions);
    const allSelected = allPermissions.every(p => selectedPermissions.includes(p));
    
    if (allSelected) {
      onChange([]);
    } else {
      onChange(allPermissions);
    }
  };

  const getCategorySelectedCount = (category) => {
    return category.permissions.filter(p => selectedPermissions.includes(p)).length;
  };

  const getTotalSelected = () => selectedPermissions.length;
  const getTotalPermissions = () => permissionCategories.reduce((sum, c) => sum + c.permissions.length, 0);

  const activeCategory = permissionCategories.find(c => c.id === activeTab);
  const allPermissionsSelected = getTotalSelected() === getTotalPermissions();

  return (
    <div className="permissions-selector">
      {/* Header con contador total */}
      <div className="permissions-selector-header">
        <div className="permissions-selector-info">
          <span className="permissions-selector-count">
            {getTotalSelected()} de {getTotalPermissions()} permisos seleccionados
          </span>
          <button
            type="button"
            className={`permissions-selector-select-all-btn ${allPermissionsSelected ? 'active' : ''}`}
            onClick={handleSelectAll}
          >
            {allPermissionsSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="permissions-tabs">
        {permissionCategories.map(category => {
          const count = getCategorySelectedCount(category);
          const isActive = activeTab === category.id;
          const allSelected = count === category.permissions.length;
          
          return (
            <button
              key={category.id}
              type="button"
              className={`permission-tab ${isActive ? 'active' : ''} ${allSelected ? 'all-selected' : ''}`}
              onClick={() => setActiveTab(category.id)}
            >
              <span className="permission-tab-label">{category.label}</span>
              {count > 0 && (
                <span className="permission-tab-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="permissions-content">
        {activeCategory && (
          <div className="permissions-category">
            <div className="permissions-category-header">
              <h4 className="permissions-category-title">
                {activeCategory.label}
              </h4>
              <button
                type="button"
                className="permissions-category-select-all"
                onClick={() => handleSelectAllInCategory(activeCategory)}
              >
                {getCategorySelectedCount(activeCategory) === activeCategory.permissions.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </button>
            </div>
            <div className="permissions-list">
              {activeCategory.permissions.map(permission => (
                <label key={permission} className="permission-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                  />
                  <span className="permission-checkbox-label">
                    {permissionLabels[permission] || permission}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}