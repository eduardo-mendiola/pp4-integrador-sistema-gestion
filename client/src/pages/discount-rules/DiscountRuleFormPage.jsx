import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api.js';
import ComboBox from '../../components/ComboBox/ComboBox.jsx';
import SelectedProductsTable from '../../components/DiscountRules/SelectedProductsTable.jsx';
import './DiscountRuleFormPage.css';

const AGE_RANGE_OPTIONS = [
  { key: '0-2', label: '0 a 2 años' },
  { key: '3-5', label: '3 a 5 años' },
  { key: '6-8', label: '6 a 8 años' },
  { key: '9-12', label: '9 a 12 años' },
  { key: '13+', label: '13+ años' }
];

const initialFormData = {
  name: '',
  percentage: 0,
  active: true,
  conditions: {
    productIds: [],
    brands: [],
    supplierIds: [],
    ageRanges: [],
    minMonthsWithoutSale: null,
    maxMonthsWithoutSale: null,
    minStockQuantity: null,
    maxStockQuantity: null,
    minMonthsInStock: null,
    maxMonthsInStock: null
  }
};

export default function DiscountRuleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Búsqueda de productos (separada de los seleccionados)
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    loadInitialData();
    if (isEditing) loadRule();
  }, [id]);

  const loadInitialData = async () => {
    // Productos
    try {
      const productsRes = await apiRequest('/api/products?limit=1000');
      const productsData = productsRes.data || productsRes || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Fallback de marcas desde productos
      const brandsFromProducts = [...new Set(
        productsData.map(p => p.brand).filter(b => b && String(b).trim() !== '')
      )];

      try {
        const brandsRes = await apiRequest('/api/products/brands');
        const brandsData = brandsRes.data || brandsRes || [];
        const endpointBrands = Array.isArray(brandsData) ? brandsData : [];
        setAvailableBrands([...new Set([...endpointBrands, ...brandsFromProducts])]);
      } catch {
        setAvailableBrands(brandsFromProducts);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
      setProducts([]);
    }

    // Proveedores
    try {
      const suppliersRes = await apiRequest('/api/suppliers');
      const suppliersData = suppliersRes.data || suppliersRes || [];
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setSuppliers([]);
    }
  };

  const loadRule = async () => {
    try {
      const response = await apiRequest(`/api/discount-rules/${id}`);
      const rule = response.data || response;
      setFormData({
        name: rule.name || '',
        percentage: rule.percentage || 0,
        active: rule.active !== undefined ? rule.active : true,
        conditions: {
          productIds: (rule.conditions?.productIds || []).map(p => p._id || p),
          brands: rule.conditions?.brands || [],
          supplierIds: (rule.conditions?.supplierIds || []).map(s => s._id || s),
          ageRanges: rule.conditions?.ageRanges || [],
          minMonthsWithoutSale: rule.conditions?.minMonthsWithoutSale ?? null,
          maxMonthsWithoutSale: rule.conditions?.maxMonthsWithoutSale ?? null,
          minStockQuantity: rule.conditions?.minStockQuantity ?? null,
          maxStockQuantity: rule.conditions?.maxStockQuantity ?? null,
          minMonthsInStock: rule.conditions?.minMonthsInStock ?? 
                           (rule.conditions?.minDaysInStock ? Math.floor(rule.conditions.minDaysInStock / 30) : null),
          maxMonthsInStock: rule.conditions?.maxMonthsInStock ?? 
                           (rule.conditions?.maxDaysInStock ? Math.floor(rule.conditions.maxDaysInStock / 30) : null)
        }
      });
    } catch (err) {
      console.error('Error cargando regla:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambios en campos simples (nombre, porcentaje, activo)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleConditionChange = (conditionName, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [conditionName]: value === '' ? null : Number(value)
      }
    }));
  };

  const toggleArrayCondition = (conditionName, value) => {
    setFormData(prev => {
      const current = prev.conditions[conditionName] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          [conditionName]: exists ? current.filter(v => v !== value) : [...current, value]
        }
      };
    });
  };

  // Productos: agregar/quitar/toggle de la lista de seleccionados
  const addProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        productIds: [...prev.conditions.productIds, productId]
      }
    }));
    setProductSearch('');
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        productIds: prev.conditions.productIds.filter(id => id !== productId)
      }
    }));
  };

  // Marcas: agregar/quitar
  const addBrand = (brand) => {
    setFormData(prev => {
      if (prev.conditions.brands.map(b => b.toLowerCase()).includes(brand.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          brands: [...prev.conditions.brands, brand]
        }
      };
    });
  };

  const removeBrand = (brand) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        brands: prev.conditions.brands.filter(b => b !== brand)
      }
    }));
  };

  // Proveedores: agregar/quitar
  const addSupplier = (supplierId) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        supplierIds: [...prev.conditions.supplierIds, supplierId]
      }
    }));
  };

  const removeSupplier = (supplierId) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        supplierIds: prev.conditions.supplierIds.filter(id => id !== supplierId)
      }
    }));
  };

  // Productos filtrados para búsqueda (solo al escribir)
  const searchResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    const search = productSearch.toLowerCase();
    return products.filter(p =>
      p.name?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search)
    ).slice(0, 15);
  }, [productSearch, products]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'El porcentaje debe estar entre 0 y 100';
    }

    const c = formData.conditions;
    const hasIdentityFilter = 
      c.productIds.length > 0 ||
      c.brands.length > 0 ||
      c.supplierIds.length > 0 ||
      c.ageRanges.length > 0;
    
    const hasStateFilter = 
      c.minMonthsWithoutSale != null ||
      c.maxMonthsWithoutSale != null ||
      c.minStockQuantity != null ||
      c.maxStockQuantity != null ||
      c.minMonthsInStock != null ||
      c.maxMonthsInStock != null;

    if (!hasIdentityFilter && !hasStateFilter) {
      newErrors.conditions = 'Debes definir al menos una condición (producto, marca, proveedor, rango etario o condición de estado)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const cleanConditions = {};
      Object.entries(formData.conditions).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) cleanConditions[key] = value;
        } else if (value != null) {
          cleanConditions[key] = value;
        }
      });

      const payload = {
        name: formData.name.trim(),
        percentage: Number(formData.percentage),
        active: formData.active,
        conditions: cleanConditions
      };

      if (isEditing) {
        await apiRequest(`/api/discount-rules/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/api/discount-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      navigate('/promociones/descuentos');
    } catch (err) {
      setErrors({ submit: err.message || 'Error al guardar la regla' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/promociones/descuentos');
  };

  if (loading) {
    return (
      <div className="rule-form-page">
        <div className="rule-form-loading">Cargando regla...</div>
      </div>
    );
  }

  // Productos ya seleccionados (para mostrar en la tabla)
  const selectedProducts = products.filter(p => formData.conditions.productIds.includes(p._id));

  return (
    <div className="rule-form-page">
      <div className="rule-form-header">
        <div>
          <h1>{isEditing ? 'Editar Regla de Descuento' : 'Nueva Regla de Descuento'}</h1>
          {isEditing && <span className="rule-form-id">ID: {id.slice(-8).toUpperCase()}</span>}
        </div>
        <button className="rule-form-back-btn" onClick={handleCancel}>
          ← Volver al listado
        </button>
      </div>

      {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

      <form onSubmit={handleSubmit} className="rule-form-container">
        <div className="rule-form-main">
          {/* SECCIÓN 1: Información General */}
          <div className="rule-form-section">
            <h2 className="rule-form-section-title">Información General</h2>
            
            <div className="rule-form-group">
              <label htmlFor="name">Nombre de la Regla *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Liquidación stock viejo"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="rule-form-error">{errors.name}</span>}
            </div>

            <div className="rule-form-row">
              <div className="rule-form-group">
                <label htmlFor="percentage">Porcentaje de Descuento *</label>
                <div className="rule-input-with-suffix">
                  <input
                    type="number"
                    id="percentage"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={errors.percentage ? 'error' : ''}
                  />
                  <span className="rule-input-suffix">%</span>
                </div>
                {errors.percentage && <span className="rule-form-error">{errors.percentage}</span>}
              </div>

              <div className="rule-form-group">
                <label className="rule-checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span>Regla Activa</span>
                </label>
                <small className="rule-form-hint">
                  Las reglas inactivas no se aplicarán automáticamente
                </small>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Filtros de Identidad */}
          <div className="rule-form-section">
            <h2 className="rule-form-section-title">Filtros de Identidad</h2>
            <small className="rule-form-hint section-hint">
              Define a qué productos se aplica esta regla. Si dejas todo vacío, se evaluará sobre todos los productos. 
              Si defines múltiples filtros, el producto debe coincidir con TODOS ellos.
            </small>

            {/* Productos: búsqueda + TABLA */}
            <div className="rule-form-group">
              <label>Productos específicos ({formData.conditions.productIds.length} seleccionados)</label>
              <div className="product-search-box">
                <input
                  type="text"
                  placeholder="🔍 Buscar producto por nombre o SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="rule-search-input"
                />
                {productSearch.trim() && searchResults.length > 0 && (
                  <div className="product-search-results">
                    {searchResults.map(p => {
                      const alreadySelected = formData.conditions.productIds.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          className={`product-search-result ${alreadySelected ? 'selected' : ''}`}
                          onClick={() => !alreadySelected && addProduct(p._id)}
                        >
                          <div className="product-result-info">
                            <span className="product-result-name">{p.name}</span>
                            <span className="product-result-sku">{p.sku || 'Sin SKU'}</span>
                          </div>
                          {alreadySelected ? (
                            <span className="product-result-badge">✓ Agregado</span>
                          ) : (
                            <button type="button" className="product-result-add">+ Agregar</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {productSearch.trim() && searchResults.length === 0 && (
                  <div className="product-search-empty">
                    No se encontraron productos con "{productSearch}"
                  </div>
                )}
              </div>

              {/* ✅ TABLA DE PRODUCTOS SELECCIONADOS (reemplaza la lista vieja) */}
              <SelectedProductsTable
                products={selectedProducts}
                onRemove={removeProduct}
              />
            </div>

            {/* Marcas: ComboBox */}
            <div className="rule-form-group">
              <label>Marcas ({formData.conditions.brands.length} seleccionadas)</label>
              <ComboBox
                options={availableBrands.map(b => ({ value: b, label: b }))}
                selectedValues={formData.conditions.brands}
                onAdd={addBrand}
                onRemove={removeBrand}
                placeholder="Buscar marca o escribir nueva..."
                getOptionValue={(opt) => opt.value}
                getOptionLabel={(opt) => opt.label}
                allowCustomValues={true}
                emptyMessage="No hay marcas registradas"
              />
              <small className="rule-form-hint">
                Puedes seleccionar de las existentes o escribir una nueva y presionar Enter
              </small>
            </div>

            {/* Proveedores: ComboBox */}
            <div className="rule-form-group">
              <label>Proveedores ({formData.conditions.supplierIds.length} seleccionados)</label>
              <ComboBox
                options={suppliers}
                selectedValues={formData.conditions.supplierIds}
                onAdd={addSupplier}
                onRemove={removeSupplier}
                placeholder="Buscar proveedor..."
                getOptionValue={(opt) => opt._id}
                getOptionLabel={(opt) => opt.business_name || opt.name}
                allowCustomValues={false}
                emptyMessage="No hay proveedores cargados"
              />
            </div>

            {/* Rangos etarios */}
            <div className="rule-form-group">
              <label>Rango Etario ({formData.conditions.ageRanges.length} seleccionados)</label>
              <div className="rule-age-ranges">
                {AGE_RANGE_OPTIONS.map(opt => (
                  <label key={opt.key} className={`rule-age-chip ${formData.conditions.ageRanges.includes(opt.key) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.conditions.ageRanges.includes(opt.key)}
                      onChange={() => toggleArrayCondition('ageRanges', opt.key)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Condiciones de Estado */}
          <div className="rule-form-section">
            <h2 className="rule-form-section-title">Condiciones de Estado</h2>
            <small className="rule-form-hint section-hint">
              Define rangos de valores que el producto debe cumplir. Los campos vacíos significan "sin límite". 
              Si defines múltiples condiciones, TODAS deben cumplirse simultáneamente.
            </small>

            <div className="rule-ranges-container">
              {/* Tiempo sin vender */}
              <div className="rule-range-group">
                <h3 className="rule-range-title">Tiempo sin vender</h3>
                <div className="rule-range-inputs">
                  <div className="rule-range-field">
                    <label>Desde</label>
                    <div className="rule-input-with-suffix">
                      <input
                        type="number"
                        value={formData.conditions.minMonthsWithoutSale ?? ''}
                        onChange={(e) => handleConditionChange('minMonthsWithoutSale', e.target.value)}
                        min="0"
                        placeholder="0"
                      />
                      <span className="rule-input-suffix">meses</span>
                    </div>
                  </div>
                  <span className="rule-range-separator">a</span>
                  <div className="rule-range-field">
                    <label>Hasta</label>
                    <div className="rule-input-with-suffix">
                      <input
                        type="number"
                        value={formData.conditions.maxMonthsWithoutSale ?? ''}
                        onChange={(e) => handleConditionChange('maxMonthsWithoutSale', e.target.value)}
                        min="0"
                        placeholder="∞"
                      />
                      <span className="rule-input-suffix">meses</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cantidad en stock */}
              <div className="rule-range-group">
                <h3 className="rule-range-title">Cantidad en stock</h3>
                <div className="rule-range-inputs">
                  <div className="rule-range-field">
                    <label>Desde</label>
                    <div className="rule-input-with-suffix">
                      <input
                        type="number"
                        value={formData.conditions.minStockQuantity ?? ''}
                        onChange={(e) => handleConditionChange('minStockQuantity', e.target.value)}
                        min="0"
                        placeholder="0"
                      />
                      <span className="rule-input-suffix">uds</span>
                    </div>
                  </div>
                  <span className="rule-range-separator">a</span>
                  <div className="rule-range-field">
                    <label>Hasta</label>
                    <div className="rule-input-with-suffix">
                      <input
                        type="number"
                        value={formData.conditions.maxStockQuantity ?? ''}
                        onChange={(e) => handleConditionChange('maxStockQuantity', e.target.value)}
                        min="0"
                        placeholder="∞"
                      />
                      <span className="rule-input-suffix">uds</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiempo en stock - AHORA EN MESES */}
              <div className="rule-range-group">
                <h3 className="rule-range-title">Tiempo en stock</h3>
                <div className="rule-range-inputs">
                  <div className="rule-range-field">
                    <label>Desde</label>
                    <div className="rule-input-with-suffix">
                      <input
                        type="number"
                        value={formData.conditions.minMonthsInStock ?? ''}
                        onChange={(e) => handleConditionChange('minMonthsInStock', e.target.value)}
                        min="0"
                        placeholder="0"
                      />
                      <span className="rule-input-suffix">meses</span>
                    </div>
                  </div>
                  <span className="rule-range-separator">a</span>
                  <div className="rule-range-field">
                    <label>Hasta</label>
                    <div className="rule-input-with-suffix">
                      <input
                        type="number"
                        value={formData.conditions.maxMonthsInStock ?? ''}
                        onChange={(e) => handleConditionChange('maxMonthsInStock', e.target.value)}
                        min="0"
                        placeholder="∞"
                      />
                      <span className="rule-input-suffix">meses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errors.conditions && <span className="rule-form-error">{errors.conditions}</span>}
          </div>
        </div>

        <div className="rule-form-footer">
          <button type="button" className="rule-form-btn secondary" onClick={handleCancel} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="rule-form-btn primary" disabled={saving}>
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Regla' : 'Crear Regla')}
          </button>
        </div>
      </form>
    </div>
  );
}