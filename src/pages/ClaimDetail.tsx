import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  User as UserIcon, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Download,
  MessageSquare,
  Hospital,
  Landmark,
  Eye,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Claim, User, ClaimDocument } from '../types';

export default function ClaimDetail({ user }: { user: User }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ClaimDocument | null>(null);

  useEffect(() => {
    const savedClaims = localStorage.getItem('claims');
    if (savedClaims) {
      const claims: Claim[] = JSON.parse(savedClaims);
      const foundClaim = claims.find(c => c.claimId.toString() === id);
      if (foundClaim) {
        setClaim(foundClaim);
        setRemarks(foundClaim.disallowedReason || '');
      }
    }
    setLoading(false);
  }, [id]);

  const handleAction = async (action: 'Approved' | 'Rejected') => {
    setProcessing(true);
    try {
      const savedClaims = localStorage.getItem('claims');
      if (savedClaims) {
        const claims: Claim[] = JSON.parse(savedClaims);
        const updatedClaims = claims.map(c => 
          c.claimId.toString() === id ? { ...c, status: action, disallowedReason: remarks } : c
        );
        localStorage.setItem('claims', JSON.stringify(updatedClaims));
        setClaim(prev => prev ? { ...prev, status: action, disallowedReason: remarks } : null);
        alert(`Claim ${action} successfully!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!claim) return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-3xl shadow-sm border border-slate-100 text-center">
      <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-900 mb-2">Claim Not Found</h3>
      <p className="text-slate-500 mb-6">The claim you are looking for does not exist or has been removed.</p>
      <button onClick={() => navigate('/claims')} className="btn btn-primary w-full">Back to Claims</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Claims
      </motion.button>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <h2 className="text-3xl font-bold text-slate-900">Claim #{claim.claimNumber}</h2>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
              claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
              claim.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 
              'bg-amber-100 text-amber-600'
            }`}>
              {claim.status}
            </span>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500"
          >
            Submitted on <span className="font-semibold">{new Date(claim.createdDate).toLocaleDateString()}</span>
          </motion.p>
        </div>
        
        {(user.role === 'Admin' || user.role === 'Super Admin') && claim.status === 'Pending' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 w-full lg:w-auto"
          >
            <button 
              className="flex-1 lg:flex-none px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              onClick={() => handleAction('Rejected')}
              disabled={processing}
            >
              <XCircle size={18} /> Reject
            </button>
            <button 
              className="flex-1 lg:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              onClick={() => handleAction('Approved')}
              disabled={processing}
            >
              <CheckCircle size={18} /> Approve
            </button>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" />
              Claim Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Policy Number</div>
                <div className="text-lg font-bold text-slate-900">{claim.policyNumber}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Employee Name</div>
                <div className="text-lg font-bold text-slate-900">{claim.employeeName}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Claim Amount</div>
                <div className="text-2xl font-bold text-indigo-600">₹{claim.claimAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Approved Amount</div>
                <div className="text-2xl font-bold text-emerald-600">₹{claim.approvedAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Claim Type</div>
                <div className="text-lg font-bold text-slate-900">{claim.claimType}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Treatment Type</div>
                <div className="text-lg font-bold text-slate-900">{claim.treatmentType}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Diagnosis</div>
                <p className="text-slate-600 leading-relaxed">{claim.diagnosis || 'No diagnosis provided.'}</p>
              </div>
            </div>
          </motion.div>

          {/* Hospital & Medical Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Hospital size={20} className="text-indigo-600" />
              Hospital & Medical Details
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Hospital Name</div>
                <div className="text-lg font-bold text-slate-900">{claim.hospitalName}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Address</div>
                <div className="text-sm text-slate-600">{claim.hospitalAddress}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Admission Date</div>
                <div className="text-lg font-bold text-slate-900">{claim.dateOfAdmission}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Discharge Date</div>
                <div className="text-lg font-bold text-slate-900">{claim.dateOfDischarge}</div>
              </div>
            </div>
          </motion.div>

          {/* Financial & Tracking */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <DollarSign size={20} className="text-indigo-600" />
              Financial & Tracking
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">MOU Discount</div>
                <div className="text-lg font-bold text-slate-900">₹{claim.mouDiscount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Disallowed Amount</div>
                <div className="text-lg font-bold text-rose-600">₹{claim.disallowedAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Claim Size</div>
                <div className="text-lg font-bold text-slate-900">₹{claim.averageClaimSize.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Inward Date</div>
                <div className="text-lg font-bold text-slate-900">{claim.inwardDate || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">AL Sanction Date</div>
                <div className="text-lg font-bold text-slate-900">{claim.alSanctionDate || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">AL Sanction Amt</div>
                <div className="text-lg font-bold text-slate-900">₹{claim.alSanctionAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Payment Date</div>
                <div className="text-lg font-bold text-slate-900">{claim.paymentDate || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">UTR Details</div>
                <div className="text-lg font-bold text-slate-900">{claim.utrDetails || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">FOC/Non-FOC</div>
                <div className="text-lg font-bold text-slate-900">{claim.focNonFoc}</div>
              </div>
            </div>
          </motion.div>

          {/* Bank Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Landmark size={20} className="text-indigo-600" />
              Bank Details
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Account Name</div>
                <div className="text-lg font-bold text-slate-900">{claim.bankDetails.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Account Number</div>
                <div className="text-lg font-bold text-slate-900">{claim.bankDetails.accountNo || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">IFSC Code</div>
                <div className="text-lg font-bold text-slate-900">{claim.bankDetails.ifsc || 'N/A'}</div>
              </div>
            </div>
          </motion.div>

          {/* Admin Remarks / Disallowed Reason */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" />
              Remarks / Disallowed Reason
            </h5>
            {(user.role === 'Admin' || user.role === 'Super Admin') && claim.status === 'Pending' ? (
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                rows={4} 
                placeholder="Add internal remarks or reason for approval/rejection..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-slate-600 italic border border-slate-100">
                {claim.disallowedReason || 'No remarks added.'}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Pending Status Checkboxes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-6">Pending Status</h5>
            <div className="space-y-4">
              {[
                { label: 'Pending at Hospital', value: claim.pendingStatus.hospital },
                { label: 'Pending at Insurer', value: claim.pendingStatus.insurer },
                { label: 'Pending Documents', value: claim.pendingStatus.documents },
                { label: 'Pending Investigation', value: claim.pendingStatus.investigation },
                { label: 'Pending Payment', value: claim.pendingStatus.payment },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  {item.value ? (
                    <Clock size={18} className="text-amber-500" />
                  ) : (
                    <CheckCircle size={18} className="text-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" />
              Documents
            </h5>
            <div className="space-y-3">
              {claim.documents && claim.documents.length > 0 ? (
                claim.documents.map(doc => (
                  <div 
                    key={doc.id} 
                    className="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-grow min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate" title={doc.fileName}>{doc.fileName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(doc.uploadedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <a 
                          href={doc.filePath} 
                          download
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                          title="Download"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-grow bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-full" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">100%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No documents uploaded</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h5 className="text-xl font-bold text-slate-900 mb-8">Status Timeline</h5>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-6 h-6 bg-emerald-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Claim Submitted</div>
                <div className="text-xs text-slate-400">{new Date(claim.createdDate).toLocaleString()}</div>
              </div>
              <div className="relative pl-10">
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                  claim.status === 'Pending' ? 'bg-amber-100' : 'bg-indigo-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    claim.status === 'Pending' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`} />
                </div>
                <div className="font-bold text-slate-900 text-sm">Current Status: {claim.status}</div>
                <div className="text-xs text-slate-400">Last updated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
              onClick={() => setPreviewDoc(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-bottom flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{previewDoc.fileName}</h4>
                    <p className="text-xs text-slate-500">Uploaded on {new Date(previewDoc.uploadedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={previewDoc.filePath} 
                    download
                    className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    <Download size={20} />
                  </a>
                  <button 
                    onClick={() => setPreviewDoc(null)}
                    className="p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-grow bg-slate-100 overflow-auto flex items-center justify-center p-4 md:p-8">
                {isImage(previewDoc.fileName) ? (
                  <img 
                    src={previewDoc.filePath} 
                    alt={previewDoc.fileName} 
                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <iframe 
                    src={previewDoc.filePath} 
                    className="w-full h-full rounded-lg shadow-lg bg-white"
                    title="Document Preview"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
