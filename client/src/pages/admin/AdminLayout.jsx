import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHotel, faMap, faMountainSun, faWallet, faClipboardList,
  faHouse, faBars, faSignOutAlt, faShield, faChartBar, faCarSide, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: faHouse, label: 'Dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/dev/hotels', icon: faHotel, label: 'Hotels' },
      { to: '/admin/dev/destinations', icon: faMap, label: 'Destinations' },
      { to: '/admin/dev/lifestyles', icon: faMountainSun, label: 'Activities' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to: '/admin/dev/orders', icon: faClipboardList, label: 'Orders' },
      { to: '/admin/dev/budget', icon: faWallet, label: 'Budget Plans' },
    ],
  },
  {
    label: 'Transport',
    items: [
      { to: '/admin/dev/drivers', icon: faCarSide, label: 'Drivers' },
    ],
  },
  {
    label: 'Users',
    items: [
      { to: '/admin/dev/users', icon: faUsers, label: 'All Users' },
    ],
  },
];

function AdminSidebar({ collapsed, onCollapse }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <aside className={`adm-sidebar${collapsed ? ' adm-sidebar--collapsed' : ''}`}>
      <div className="adm-sidebar__top">
        <div className="adm-sidebar__brand">
          {!collapsed && (
            <div className="adm-sidebar__logo">
              <FontAwesomeIcon icon={faShield} />
              <span>Admin Panel</span>
            </div>
          )}
          <button className="adm-sidebar__toggle" onClick={onCollapse} title="Toggle sidebar">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        {!collapsed && user && (
          <div className="adm-sidebar__user">
            <div className="adm-sidebar__avatar">
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="adm-sidebar__user-name">{user.full_name || 'Admin'}</div>
              <div className="adm-sidebar__user-role">Administrator</div>
            </div>
          </div>
        )}
      </div>

      <nav className="adm-sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="adm-sidebar__section">
            {!collapsed && <span className="adm-sidebar__section-label">{section.label}</span>}
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`adm-sidebar__link${isActive(item.to) ? ' adm-sidebar__link--active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <FontAwesomeIcon icon={item.icon} className="adm-sidebar__icon" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="adm-sidebar__bottom">
        <button className="adm-sidebar__logout" onClick={handleLogout} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="adm-layout">
      <AdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} />
      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar__title">
            <FontAwesomeIcon icon={faChartBar} />
            {title && <h1>{title}</h1>}
          </div>
          <Link to="/" className="adm-topbar__site-link">View Site</Link>
        </header>
        <div className="adm-page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
