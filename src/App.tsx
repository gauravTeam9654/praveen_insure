import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, List, Settings, LogOut, User as UserIcon, Menu, X, ShieldCheck, Clock, CheckCircle, XCircle, MessageSquare, Users } from 'lucide-react';
import { User } from './types';

// Pages (to be created)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitClaim from './pages/SubmitClaim';
import ClaimsList from './pages/ClaimsList';
import ClaimDetail from './pages/ClaimDetail';
import SupportChats from './pages/SupportChats';
import PolicyDocuments from './pages/PolicyDocuments';
import UserManagement from './pages/UserManagement';
import ChatBot from './components/ChatBot';

const Layout = ({ children, user, onLogout }: { children: React.ReactNode, user: User, onLogout: () => void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Submit Claim', path: '/submit', icon: <FileText size={20} />, roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Claims List', path: '/claims', icon: <List size={20} /> },
    { name: 'Policy Documents', path: '/policies', icon: <ShieldCheck size={20} /> },
    { name: 'User Management', path: '/users', icon: <Users size={20} />, roles: ['Super Admin'] },
    { name: 'Support Chats', path: '/support-chats', icon: <MessageSquare size={20} />, roles: ['Admin', 'Super Admin'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <div 
        className={`bg-dark text-white transition-all ${isSidebarOpen ? 'w-250' : 'w-0 overflow-hidden'}`}
        style={{ width: isSidebarOpen ? '250px' : '0', transition: 'width 0.3s' }}
      >
        <div className="p-4 border-bottom border-secondary">
          <h4 className="mb-0 text-primary fw-bold">InsureClaim</h4>
        </div>
        <div className="p-3">
          <ul className="nav nav-pills flex-column mb-auto">
            {filteredMenu.map((item) => (
              <li key={item.path} className="nav-item mb-2">
                <Link 
                  to={item.path} 
                  className={`nav-link text-white d-flex align-items-center gap-3 ${location.pathname === item.path ? 'active bg-primary' : 'hover-bg-secondary'}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4">
          <button className="btn btn-link p-0 me-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="ms-auto d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold">{user.name}</div>
              <div className="small text-muted">{user.role}</div>
            </div>
            <div className="dropdown">
              <button className="btn btn-light rounded-circle p-2" data-bs-toggle="dropdown">
                <UserIcon size={20} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={onLogout}>Logout</button></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-4 flex-grow-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/submit" element={<SubmitClaim user={user} />} />
          <Route path="/claims" element={<ClaimsList user={user} />} />
          <Route path="/claims/:id" element={<ClaimDetail user={user} />} />
          <Route path="/policies" element={<PolicyDocuments user={user} />} />
          <Route path="/users" element={<UserManagement user={user} />} />
          <Route path="/support-chats" element={<SupportChats user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot user={user} />
      </Layout>
    </Router>
  );
}
