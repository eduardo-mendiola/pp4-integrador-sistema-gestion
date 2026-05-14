import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDeniedPage() {
  return (
    <div className="state-box">
      <h2>Acceso denegado</h2>
      <p>No tenés permisos para ver esta sección.</p>
      <Link to="/dashboard">Volver al dashboard</Link>
    </div>
  );
}