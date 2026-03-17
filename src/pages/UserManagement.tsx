import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Mail, Calendar, Search, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react';
import { User } from '../types';
import { API_BASE } from '../api';

export default function UserManagement({ user: currentUser }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Admin' | 'User'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin' as 'Admin' | 'User' | 'Super Admin'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users?role=${currentUser.role}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}?role=${currentUser.role}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const error = await res.json();
        alert(error.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'Admin' });
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">User Management</h2>
          <p className="text-muted">Manage all administrators and users in the system.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {(['All', 'Admin', 'User'] as const).map(tab => (
              <button
                key={tab}
                className={`btn border-0 rounded-0 px-4 py-3 fw-bold ${activeTab === tab ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                onClick={() => setActiveTab(tab)}
                style={{ borderBottom: activeTab === tab ? '3px solid var(--bs-primary) !important' : 'none' }}
              >
                {tab}s
              </button>
            ))}
          </div>
          <div className="p-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 shadow-none" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="py-3">Role</th>
                <th className="py-3">Created Date</th>
                <th className="py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="fw-bold">{user.name}</div>
                        <div className="small text-muted d-flex align-items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge d-inline-flex align-items-center gap-1 ${
                      user.role === 'Super Admin' ? 'bg-danger' : 
                      user.role === 'Admin' ? 'bg-primary' : 
                      'bg-secondary'
                    }`}>
                      {user.role === 'Super Admin' ? <ShieldAlert size={12} /> : 
                       user.role === 'Admin' ? <ShieldCheck size={12} /> : 
                       <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="text-muted small">
                    <div className="d-flex align-items-center gap-1">
                      <Calendar size={14} />
                      {new Date(user.createdDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="text-end px-4">
                    {user.id !== currentUser.id && (
                      <button 
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-5 text-muted">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="modal-title fw-bold">Add New User/Admin</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Jane Smith"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-bold">Role</label>
                    <select 
                      className="form-select" 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
