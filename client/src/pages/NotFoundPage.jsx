import React from 'react';
import { Link } from 'react-router-dom';

// Página de error 404 para rutas no encontradas
export default function NotFoundPage() {
  return (
    <div className="state-box">
      <h2>Página no encontrada</h2>
      <p>La ruta solicitada no existe.</p>
      <Link to="/dashboard">Ir al dashboard</Link>
    </div>
  );
}