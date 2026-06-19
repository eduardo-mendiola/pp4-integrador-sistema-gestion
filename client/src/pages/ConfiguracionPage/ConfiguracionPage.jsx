import React, { useState } from 'react';
import {
  FiSettings,
  FiShoppingCart,
  FiPackage,
  FiBell,
  FiShield,
  FiSave,
  FiInfo,
  FiRefreshCw,
} from 'react-icons/fi';
import './ConfiguracionPage.css';

// ── Datos iniciales de configuración (se pueden conectar a la API más adelante) ──
const defaultConfig = {
  general: {
    nombreNegocio: 'Mi Negocio',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    moneda: 'ARS',
    idioma: 'es',
    zonaHoraria: 'America/Argentina/Buenos_Aires',
  },
  pos: {
    imprimirTicketAutomatico: true,
    pedirConfirmacionVenta: false,
    permitirDescuentoManual: true,
    limiteDescuento: 20,
    metodoPagoPorDefecto: 'efectivo',
    mostrarStockEnVenta: true,
  },
  inventario: {
    alertaStockMinimo: true,
    umbralAlerta: 5,
    permitirVentaSinStock: false,
    ajusteAutomaticoStock: true,
    unidadMedidaPorDefecto: 'unidad',
  },
  notificaciones: {
    emailAlertas: true,
    emailReportes: false,
    stockBajo: true,
    nuevaVenta: false,
    nuevoPedido: true,
    emailDestinatario: '',
  },
  seguridad: {
    sesionExpira: 60,
    dobleAutenticacion: false,
    registrarActividad: true,
    bloqueoIntentos: 5,
    cambioPasswordObligatorio: false,
  },
};

const TABS = [
  { id: 'general',       label: 'General',        icon: FiSettings },
  { id: 'pos',          label: 'Punto de Venta',  icon: FiShoppingCart },
  { id: 'inventario',   label: 'Inventario',      icon: FiPackage },
  { id: 'notificaciones', label: 'Notificaciones', icon: FiBell },
  { id: 'seguridad',    label: 'Seguridad',        icon: FiShield },
];

// ── Componentes de formulario reutilizables ──

function FieldText({ label, name, value, onChange, placeholder = '', type = 'text', hint }) {
  return (
    <div className="cfg-field">
      <label htmlFor={name}>{label}</label>
      {hint && <p className="cfg-hint">{hint}</p>}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldSelect({ label, name, value, onChange, options, hint }) {
  return (
    <div className="cfg-field">
      <label htmlFor={name}>{label}</label>
      {hint && <p className="cfg-hint">{hint}</p>}
      <select id={name} name={name} value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function FieldToggle({ label, name, checked, onChange, hint }) {
  return (
    <div className="cfg-toggle-row">
      <div className="cfg-toggle-info">
        <span className="cfg-toggle-label">{label}</span>
        {hint && <span className="cfg-hint">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`cfg-toggle ${checked ? 'cfg-toggle-on' : ''}`}
        onClick={() => onChange({ target: { name, value: !checked, type: 'checkbox', checked: !checked } })}
        id={name}
      >
        <span className="cfg-toggle-thumb" />
      </button>
    </div>
  );
}

function FieldNumber({ label, name, value, onChange, min, max, hint }) {
  return (
    <div className="cfg-field">
      <label htmlFor={name}>{label}</label>
      {hint && <p className="cfg-hint">{hint}</p>}
      <input
        id={name}
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
      />
    </div>
  );
}

// ── Secciones de cada pestaña ──

function TabGeneral({ data, onChange }) {
  return (
    <>
      <div className="cfg-section-title">Datos del Negocio</div>
      <div className="cfg-grid">
        <FieldText label="Nombre del negocio" name="nombreNegocio" value={data.nombreNegocio} onChange={onChange} placeholder="Ej: Distribuidora San Martín" />
        <FieldText label="RUC / CUIT" name="ruc" value={data.ruc} onChange={onChange} placeholder="20-12345678-9" />
        <FieldText label="Dirección" name="direccion" value={data.direccion} onChange={onChange} placeholder="Calle Falsa 123" />
        <FieldText label="Teléfono" name="telefono" value={data.telefono} onChange={onChange} type="tel" placeholder="+54 9 11 1234 5678" />
        <FieldText label="Email de contacto" name="email" value={data.email} onChange={onChange} type="email" placeholder="contacto@negocio.com" />
      </div>

      <div className="cfg-section-title" style={{ marginTop: '1.75rem' }}>Regionalización</div>
      <div className="cfg-grid">
        <FieldSelect
          label="Moneda"
          name="moneda"
          value={data.moneda}
          onChange={onChange}
          options={[
            { value: 'ARS', label: 'Peso Argentino (ARS)' },
            { value: 'USD', label: 'Dólar (USD)' },
            { value: 'BRL', label: 'Real Brasileño (BRL)' },
            { value: 'CLP', label: 'Peso Chileno (CLP)' },
          ]}
        />
        <FieldSelect
          label="Idioma"
          name="idioma"
          value={data.idioma}
          onChange={onChange}
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
            { value: 'pt', label: 'Português' },
          ]}
        />
        <FieldSelect
          label="Zona horaria"
          name="zonaHoraria"
          value={data.zonaHoraria}
          onChange={onChange}
          options={[
            { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC−3)' },
            { value: 'America/Santiago', label: 'Santiago (UTC−3/−4)' },
            { value: 'America/Bogota', label: 'Bogotá (UTC−5)' },
            { value: 'America/Mexico_City', label: 'Ciudad de México (UTC−6)' },
          ]}
        />
      </div>
    </>
  );
}

function TabPOS({ data, onChange }) {
  return (
    <>
      <div className="cfg-section-title">Comportamiento del Punto de Venta</div>
      <div className="cfg-toggles-list">
        <FieldToggle label="Imprimir ticket automáticamente al cerrar venta" name="imprimirTicketAutomatico" checked={data.imprimirTicketAutomatico} onChange={onChange} />
        <FieldToggle label="Pedir confirmación antes de cerrar venta" name="pedirConfirmacionVenta" checked={data.pedirConfirmacionVenta} onChange={onChange} />
        <FieldToggle label="Mostrar stock disponible en pantalla de venta" name="mostrarStockEnVenta" checked={data.mostrarStockEnVenta} onChange={onChange} />
        <FieldToggle label="Permitir descuentos manuales en venta" name="permitirDescuentoManual" checked={data.permitirDescuentoManual} onChange={onChange} />
      </div>

      <div className="cfg-section-title" style={{ marginTop: '1.75rem' }}>Límites y Métodos</div>
      <div className="cfg-grid">
        <FieldNumber
          label="Límite máximo de descuento manual (%)"
          name="limiteDescuento"
          value={data.limiteDescuento}
          onChange={onChange}
          min={0}
          max={100}
          hint="Solo aplica si los descuentos manuales están habilitados."
        />
        <FieldSelect
          label="Método de pago por defecto"
          name="metodoPagoPorDefecto"
          value={data.metodoPagoPorDefecto}
          onChange={onChange}
          options={[
            { value: 'efectivo', label: 'Efectivo' },
            { value: 'tarjeta', label: 'Tarjeta de débito/crédito' },
            { value: 'transferencia', label: 'Transferencia bancaria' },
            { value: 'qr', label: 'QR / Billetera digital' },
          ]}
        />
      </div>
    </>
  );
}

function TabInventario({ data, onChange }) {
  return (
    <>
      <div className="cfg-section-title">Control de Stock</div>
      <div className="cfg-toggles-list">
        <FieldToggle
          label="Activar alertas de stock mínimo"
          name="alertaStockMinimo"
          checked={data.alertaStockMinimo}
          onChange={onChange}
          hint="Recibirás notificaciones cuando un producto baje del umbral."
        />
        <FieldToggle
          label="Permitir venta de productos sin stock"
          name="permitirVentaSinStock"
          checked={data.permitirVentaSinStock}
          onChange={onChange}
          hint="Si se habilita, el stock puede quedar en negativo."
        />
        <FieldToggle
          label="Ajuste automático de stock al confirmar venta"
          name="ajusteAutomaticoStock"
          checked={data.ajusteAutomaticoStock}
          onChange={onChange}
        />
      </div>

      <div className="cfg-section-title" style={{ marginTop: '1.75rem' }}>Parámetros</div>
      <div className="cfg-grid">
        <FieldNumber
          label="Umbral de alerta de stock mínimo (unidades)"
          name="umbralAlerta"
          value={data.umbralAlerta}
          onChange={onChange}
          min={1}
          hint="Se usa como valor por defecto para productos sin umbral propio."
        />
        <FieldSelect
          label="Unidad de medida por defecto"
          name="unidadMedidaPorDefecto"
          value={data.unidadMedidaPorDefecto}
          onChange={onChange}
          options={[
            { value: 'unidad', label: 'Unidad' },
            { value: 'kg', label: 'Kilogramo (kg)' },
            { value: 'g', label: 'Gramo (g)' },
            { value: 'lt', label: 'Litro (lt)' },
            { value: 'ml', label: 'Mililitro (ml)' },
            { value: 'm', label: 'Metro (m)' },
          ]}
        />
      </div>
    </>
  );
}

function TabNotificaciones({ data, onChange }) {
  return (
    <>
      <div className="cfg-section-title">Notificaciones por Email</div>

      <div className="cfg-grid" style={{ marginBottom: '1.25rem' }}>
        <FieldText
          label="Email destinatario de alertas"
          name="emailDestinatario"
          value={data.emailDestinatario}
          onChange={onChange}
          type="email"
          placeholder="admin@negocio.com"
          hint="Se enviará una copia de todas las alertas a esta dirección."
        />
      </div>

      <div className="cfg-toggles-list">
        <FieldToggle label="Enviar alertas críticas por email" name="emailAlertas" checked={data.emailAlertas} onChange={onChange} />
        <FieldToggle label="Enviar reportes diarios por email" name="emailReportes" checked={data.emailReportes} onChange={onChange} hint="Resumen de ventas del día al cierre." />
        <FieldToggle label="Notificar cuando un producto tiene stock bajo" name="stockBajo" checked={data.stockBajo} onChange={onChange} />
        <FieldToggle label="Notificar al registrar una nueva venta" name="nuevaVenta" checked={data.nuevaVenta} onChange={onChange} />
        <FieldToggle label="Notificar al recibir un nuevo pedido de proveedor" name="nuevoPedido" checked={data.nuevoPedido} onChange={onChange} />
      </div>
    </>
  );
}

function TabSeguridad({ data, onChange }) {
  return (
    <>
      <div className="cfg-section-title">Sesión y Acceso</div>
      <div className="cfg-grid">
        <FieldNumber
          label="Tiempo de expiración de sesión (minutos)"
          name="sesionExpira"
          value={data.sesionExpira}
          onChange={onChange}
          min={5}
          max={480}
          hint="La sesión se cerrará automáticamente por inactividad."
        />
        <FieldNumber
          label="Intentos máximos antes de bloquear cuenta"
          name="bloqueoIntentos"
          value={data.bloqueoIntentos}
          onChange={onChange}
          min={1}
          max={20}
        />
      </div>

      <div className="cfg-section-title" style={{ marginTop: '1.75rem' }}>Opciones Avanzadas</div>
      <div className="cfg-toggles-list">
        <FieldToggle
          label="Habilitar doble factor de autenticación (2FA)"
          name="dobleAutenticacion"
          checked={data.dobleAutenticacion}
          onChange={onChange}
          hint="Requiere configuración adicional por usuario."
        />
        <FieldToggle
          label="Registrar log de actividad de usuarios"
          name="registrarActividad"
          checked={data.registrarActividad}
          onChange={onChange}
          hint="Guarda un historial de acciones relevantes en el sistema."
        />
        <FieldToggle
          label="Forzar cambio de contraseña periódico"
          name="cambioPasswordObligatorio"
          checked={data.cambioPasswordObligatorio}
          onChange={onChange}
          hint="Los usuarios deberán actualizar su contraseña cada 90 días."
        />
      </div>
    </>
  );
}

// ── Página principal ──

const LS_KEY = 'app_configuracion';

/** Carga la config desde localStorage y la fusiona con los defaults */
function loadConfig() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return defaultConfig;
    const parsed = JSON.parse(saved);
    // Fusión profunda: preserva nuevos campos de defaultConfig si se agregan en el futuro
    return {
      general:        { ...defaultConfig.general,        ...parsed.general },
      pos:            { ...defaultConfig.pos,            ...parsed.pos },
      inventario:     { ...defaultConfig.inventario,     ...parsed.inventario },
      notificaciones: { ...defaultConfig.notificaciones, ...parsed.notificaciones },
      seguridad:      { ...defaultConfig.seguridad,      ...parsed.seguridad },
    };
  } catch {
    return defaultConfig;
  }
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('general');
  // Inicialización lazy: solo lee localStorage una vez al montar
  const [config, setConfig] = useState(() => loadConfig());
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleChange = (section) => (e) => {
    const { name, type, checked, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(config));
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    localStorage.removeItem(LS_KEY);
    setConfig(defaultConfig);
    setDirty(false);
    setSaved(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'general':       return <TabGeneral data={config.general} onChange={handleChange('general')} />;
      case 'pos':           return <TabPOS data={config.pos} onChange={handleChange('pos')} />;
      case 'inventario':    return <TabInventario data={config.inventario} onChange={handleChange('inventario')} />;
      case 'notificaciones':return <TabNotificaciones data={config.notificaciones} onChange={handleChange('notificaciones')} />;
      case 'seguridad':     return <TabSeguridad data={config.seguridad} onChange={handleChange('seguridad')} />;
      default:              return null;
    }
  };

  return (
    <div className="page-container cfg-page">
      {/* Encabezado */}
      <div className="cfg-header">
        <div>
          <h1 className="cfg-title">Configuración</h1>
          <p className="cfg-subtitle">Administrá los parámetros generales del sistema.</p>
        </div>
        <div className="cfg-header-actions">
          {dirty && (
            <button
              type="button"
              className="secondary-button btn-with-icon"
              onClick={handleReset}
              title="Descartar cambios"
            >
              <FiRefreshCw size={15} />
              Descartar
            </button>
          )}
          <button
            type="button"
            className={`btn-with-icon cfg-save-btn ${saved ? 'cfg-save-btn--saved' : ''}`}
            onClick={handleSave}
            disabled={!dirty}
          >
            <FiSave size={15} />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Aviso cambios pendientes */}
      {dirty && (
        <div className="cfg-unsaved-banner">
          <FiInfo size={15} />
          Tenés cambios sin guardar.
        </div>
      )}

      <div className="cfg-body">
        {/* Tabs laterales */}
        <nav className="cfg-tabs" aria-label="Secciones de configuración">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`cfg-tab-btn ${activeTab === id ? 'cfg-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(id)}
              id={`cfg-tab-${id}`}
              aria-selected={activeTab === id}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {/* Contenido */}
        <section className="cfg-content panel">
          {renderTab()}
        </section>
      </div>
    </div>
  );
}
