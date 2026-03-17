import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, FileDown, Plus, FileText, X, Download, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Claim, User, ClaimDocument } from '../types';

export default function ClaimsList({ user }: { user: User }) {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<ClaimDocument | null>(null);
  const [viewDocsClaim, setViewDocsClaim] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadClaims = () => {
      const savedClaims = localStorage.getItem('claims');
      if (savedClaims) {
        const allClaims: Claim[] = JSON.parse(savedClaims);
        // Filter by user role if needed, but usually users see their own and admins see all
        const userClaims = user.role === 'User' ? allClaims.filter(c => c.userId === user.id) : allClaims;
        setClaims(userClaims);
        setFilteredClaims(userClaims);
      }
      setLoading(false);
    };

    loadClaims();
    
    // Listen for storage changes (in case multiple tabs are open)
    window.addEventListener('storage', loadClaims);
    return () => window.removeEventListener('storage', loadClaims);
  }, [user]);

  useEffect(() => {
    const results = claims.filter(c => 
      c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClaims(results);
  }, [searchTerm, claims]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      const savedClaims = localStorage.getItem('claims');
      if (savedClaims) {
        const allClaims: Claim[] = JSON.parse(savedClaims);
        const updatedClaims = allClaims.filter(c => c.claimId !== id);
        localStorage.setItem('claims', JSON.stringify(updatedClaims));
        setClaims(user.role === 'User' ? updatedClaims.filter(c => c.userId === user.id) : updatedClaims);
      }
    }
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="pb-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Claims Management</h2>
          <p className="text-muted mb-0">View and manage all your insurance claims in one place.</p>
        </div>
        <div className="d-flex gap-2 w-100 w-md-auto">
          <div className="position-relative flex-grow-1 flex-md-grow-0">
            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
            <input 
              type="text" 
              className="form-control ps-5 rounded-pill shadow-none" 
              placeholder="Search Claim # or Policy #" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/submit" className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm">
            <Plus size={18} /> New Claim
          </Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Claim Number</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Policy Number</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Employee Name</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Hospital</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Claim Amount</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Approved</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Status</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Payment Date</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted">Documents</th>
                <th className="px-4 py-3 small fw-bold text-uppercase text-muted text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <tr key={claim.claimId} className={
                  claim.status === 'Approved' ? 'table-success' : 
                  claim.status === 'Rejected' ? 'table-danger' : 
                  claim.status === 'Pending' ? 'table-warning' : ''
                }>
                  <td className="px-4 py-3 fw-bold">{claim.claimNumber}</td>
                  <td className="px-4 py-3 text-muted">{claim.policyNumber}</td>
                  <td className="px-4 py-3">{claim.employeeName}</td>
                  <td className="px-4 py-3 small text-truncate" style={{ maxWidth: '150px' }}>{claim.hospitalName}</td>
                  <td className="px-4 py-3 fw-bold">₹{claim.claimAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-success fw-bold">₹{claim.approvedAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge rounded-pill ${
                      claim.status === 'Approved' ? 'bg-success' : 
                      claim.status === 'Rejected' ? 'bg-danger' : 
                      'bg-warning text-dark'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 small">{claim.paymentDate || '-'}</td>
                  <td className="px-4 py-3">
                    {claim.documents && claim.documents.length > 0 ? (
                      <button 
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={() => setViewDocsClaim(claim)}
                      >
                        View ({claim.documents.length})
                      </button>
                    ) : (
                      <span className="text-muted small italic">No docs</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-1">
                      <button 
                        className="btn btn-sm btn-light rounded-circle p-2"
                        onClick={() => navigate(`/submit?edit=${claim.claimId}`)}
                        title="Edit"
                      >
                        <Edit size={16} className="text-primary" />
                      </button>
                      <button 
                        className="btn btn-sm btn-light rounded-circle p-2"
                        onClick={() => handleDelete(claim.claimId)}
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    <FileText size={48} className="mb-3 opacity-25" />
                    <p className="mb-0">No claims found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Documents Modal */}
      <AnimatePresence>
        {viewDocsClaim && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="modal-dialog modal-lg modal-dialog-centered"
            >
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 p-4">
                  <h5 className="modal-title fw-bold">Documents for {viewDocsClaim.claimNumber}</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setViewDocsClaim(null)}></button>
                </div>
                <div className="modal-body p-4 pt-0">
                  <div className="row g-3">
                    {viewDocsClaim.documents?.map((doc) => (
                      <div key={doc.id} className="col-md-6">
                        <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3 overflow-hidden">
                            <div className="bg-light p-2 rounded-3 text-primary">
                              <FileText size={20} />
                            </div>
                            <div className="overflow-hidden">
                              <div className="small fw-bold text-truncate">{doc.fileName}</div>
                              <div className="text-muted" style={{ fontSize: '10px' }}>{new Date(doc.uploadedDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-light rounded-circle"
                              onClick={() => setPreviewDoc(doc)}
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            <a 
                              href={doc.filePath} 
                              download={doc.fileName}
                              className="btn btn-sm btn-light rounded-circle"
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal (Full Screen) */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed-top w-100 h-100 z-3 d-flex flex-column bg-dark bg-opacity-90 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 text-white">
              <h5 className="mb-0">{previewDoc.fileName}</h5>
              <button className="btn btn-link text-white p-0" onClick={() => setPreviewDoc(null)}>
                <X size={32} />
              </button>
            </div>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center overflow-auto">
              {isImage(previewDoc.fileName) ? (
                <img 
                  src={previewDoc.filePath} 
                  alt={previewDoc.fileName} 
                  className="img-fluid rounded shadow-lg" 
                  style={{ maxHeight: '80vh' }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <iframe 
                  src={previewDoc.filePath} 
                  className="w-100 h-100 rounded bg-white" 
                  title="Preview"
                />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
