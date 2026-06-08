import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar.jsx';
import Header from './Header/Header.jsx';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <Sidebar />

      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}