import React, { useEffect, useState } from 'react';
import { apiRequest, unwrapList } from '../services/api.js';

const dashboardCards = [
  { key: 'products', title: 'Productos', endpoint: '/api/products' },
  { key: 'categories', title: 'Categorías', endpoint: '/api/categories' },
  { key: 'clients', title: 'Clientes', endpoint: '/api/clients' },
  { key: 'sales', title: 'Ventas', endpoint: '/api/sales' },
  { key: 'users', title: 'Usuarios', endpoint: '/api/users' },
  { key: 'roles', title: 'Roles', endpoint: '/api/roles' }
];

export default function DashboardPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCounts = async () => {
      setLoading(true);
      const nextCounts = {};

      for (const card of dashboardCards) {
        try {
          const payload = await apiRequest(card.endpoint);
          nextCounts[card.key] = unwrapList(payload).length;
        } catch (error) {
          nextCounts[card.key] = 'Sin acceso';
        }
      }

      if (active) {
        setCounts(nextCounts);
        setLoading(false);
      }
    };

    loadCounts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="module-grid">
      <header className="section-header">
        <div>
          <p className="eyebrow">Resumen</p>
          <h2>Dashboard básico</h2>
          <p className="section-description">Vista inicial del sistema con acceso a los módulos principales.</p>
        </div>
      </header>

      <div className="stats-grid">
        {dashboardCards.map((card) => (
          <article className="stat-card" key={card.key}>
            <span>{card.title}</span>
            <strong>{loading ? '...' : counts[card.key] ?? 0}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}