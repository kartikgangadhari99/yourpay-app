import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Layout.css';

const navItems = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/send', icon: '↑', label: 'Send' },
  { path: '/receive', icon: '↓', label: 'Receive' },
  { path: '/history', icon: '≡', label: 'History' },
  { path: '/wallet', icon: '◎', label: 'Wallet' },
  { path: '/profile', icon: '○', label: 'Profile' },
];

export default function Layout({ children }) {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">₹</span>
            <span className="logo-text">YourPay</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="user-card">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-upi">{user?.upiId}</div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">⚙</span>
              <span className="nav-label">Admin</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            <span>{darkMode ? '☀' : '☾'}</span>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span>⏻</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-title">YourPay</div>
          <div className="topbar-actions">
            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀' : '☾'}</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {navItems.slice(0, 5).map(item => (
          <Link key={item.path} to={item.path} className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
