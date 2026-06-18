import React from 'react';
import { FiTool } from 'react-icons/fi';
import './UnderConstructionPage.css';

export default function UnderConstructionPage() {
  return (
    <div className="under-construction">
      <div className="construction-content">
        <FiTool className="construction-icon" />
        <h1>En construcción</h1>
        <p>Esta sección está siendo desarrollada.</p>
        <p className="construction-subtitle">Próximamente disponible</p>
      </div>
    </div>
  );
}