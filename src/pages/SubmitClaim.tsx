import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileText, Landmark, Hospital, AlertCircle, CheckCircle2, X, Plus, Trash2, Clock } from 'lucide-react';
import { User, Claim, ClaimDocument, PolicyDocument } from '../types';

export default function SubmitClaim({ user }: { user: User }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  
  const [formData, setFormData] = useState({
    claimNumber: '',
    policyNumber: '',
    employeeName: '',
    hospitalName: '',
    hospitalAddress: '',
    dateOfAdmission: '',
    dateOfDischarge: '',
    diagnosis: '',
    treatmentType: 'Medical' as 'Medical' | 'Surgical',
    claimAmount: '',
    mouDiscount: '',
    approvedAmount: '',
    disallowedAmount: '',
    disallowedReason: '',
    claimType: 'Reimbursement' as 'Cashless' | 'Reimbursement',
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
    inwardDate: '',
    alSanctionDate: '',
    alSanctionAmount: '',
    alNetSanctionAmount: '',
    pendingStatus: {
      hospital: false,
      insurer: false,
      documents: false,
      investigation: false,
      payment: false,
    },
    averageClaimSize: '',
    paymentDate: '',
    queryReminderDate: '',
    utrDetails: '',
    bankDetails: {
      accountNo: '',
      ifsc: '',
      name: '',
    },
    focNonFoc: 'Non-FOC' as 'FOC' | 'Non-FOC',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; file: File; name: string }[]>([]);

  useEffect(() => {
    // Load policies for the dropdown
    const savedPolicies = localStorage.getItem('policies');
    if (savedPolicies) {
      setPolicies(JSON.parse(savedPolicies));
    }

    // Check if editing
    const queryParams = new URLSearchParams(location.search);
    const editId = queryParams.get('edit');
    if (editId) {
      const savedClaims = localStorage.getItem('claims');
      if (savedClaims) {
        const claims: Claim[] = JSON.parse(savedClaims);
        const claimToEdit = claims.find(c => c.claimId === Number(editId));
        if (claimToEdit) {
          setFormData({
            claimNumber: claimToEdit.claimNumber,
            policyNumber: claimToEdit.policyNumber,
            employeeName: claimToEdit.employeeName,
            hospitalName: claimToEdit.hospitalName,
            hospitalAddress: claimToEdit.hospitalAddress,
            dateOfAdmission: claimToEdit.dateOfAdmission,
            dateOfDischarge: claimToEdit.dateOfDischarge,
            diagnosis: claimToEdit.diagnosis,
            treatmentType: claimToEdit.treatmentType,
            claimAmount: claimToEdit.claimAmount.toString(),
            mouDiscount: claimToEdit.mouDiscount.toString(),
            approvedAmount: claimToEdit.approvedAmount.toString(),
            disallowedAmount: claimToEdit.disallowedAmount.toString(),
            disallowedReason: claimToEdit.disallowedReason,
            claimType: claimToEdit.claimType,
            status: claimToEdit.status,
            inwardDate: claimToEdit.inwardDate,
            alSanctionDate: claimToEdit.alSanctionDate,
            alSanctionAmount: claimToEdit.alSanctionAmount.toString(),
            alNetSanctionAmount: claimToEdit.alNetSanctionAmount.toString(),
            pendingStatus: claimToEdit.pendingStatus,
            averageClaimSize: claimToEdit.averageClaimSize.toString(),
            paymentDate: claimToEdit.paymentDate,
            queryReminderDate: claimToEdit.queryReminderDate,
            utrDetails: claimToEdit.utrDetails,
            bankDetails: claimToEdit.bankDetails,
            focNonFoc: claimToEdit.focNonFoc,
          });
        }
      }
    }
  }, [location.search]);

  // Auto-calculate Average Claim Size
  useEffect(() => {
    const amount = parseFloat(formData.claimAmount) || 0;
    const approved = parseFloat(formData.approvedAmount) || 0;
    if (amount > 0) {
      const avg = (amount + approved) / (approved > 0 ? 2 : 1);
      setFormData(prev => ({ ...prev, averageClaimSize: avg.toFixed(2) }));
    }
  }, [formData.claimAmount, formData.approvedAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [bankField]: value }
      }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const pendingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pendingStatus: { ...prev.pendingStatus, [pendingField]: checkbox.checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.claimNumber || !formData.policyNumber) {
      setError('Claim Number and Policy Number are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const savedClaims = localStorage.getItem('claims');
      let claims: Claim[] = savedClaims ? JSON.parse(savedClaims) : [];

      // Check for duplicate Claim Number (if not editing)
      const queryParams = new URLSearchParams(location.search);
      const editId = queryParams.get('edit');
      
      if (!editId && claims.some(c => c.claimNumber === formData.claimNumber)) {
        setError('Claim Number already exists. Please use a unique number.');
        setLoading(false);
        return;
      }

      const newClaim: Claim = {
        claimId: editId ? Number(editId) : Date.now(),
        userId: user.id,
        claimNumber: formData.claimNumber,
        policyNumber: formData.policyNumber,
        employeeName: formData.employeeName,
        hospitalName: formData.hospitalName,
        hospitalAddress: formData.hospitalAddress,
        dateOfAdmission: formData.dateOfAdmission,
        dateOfDischarge: formData.dateOfDischarge,
        diagnosis: formData.diagnosis,
        treatmentType: formData.treatmentType,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        mouDiscount: parseFloat(formData.mouDiscount) || 0,
        approvedAmount: parseFloat(formData.approvedAmount) || 0,
        disallowedAmount: parseFloat(formData.disallowedAmount) || 0,
        disallowedReason: formData.disallowedReason,
        claimType: formData.claimType,
        status: formData.status,
        inwardDate: formData.inwardDate,
        alSanctionDate: formData.alSanctionDate,
        alSanctionAmount: parseFloat(formData.alSanctionAmount) || 0,
        alNetSanctionAmount: parseFloat(formData.alNetSanctionAmount) || 0,
        pendingStatus: formData.pendingStatus,
        averageClaimSize: parseFloat(formData.averageClaimSize) || 0,
        paymentDate: formData.paymentDate,
        queryReminderDate: formData.queryReminderDate,
        utrDetails: formData.utrDetails,
        bankDetails: formData.bankDetails,
        focNonFoc: formData.focNonFoc,
        createdDate: editId ? (claims.find(c => c.claimId === Number(editId))?.createdDate || new Date().toISOString()) : new Date().toISOString(),
        documents: uploadedFiles.map(f => ({
          id: Math.floor(Math.random() * 1000000),
          claimId: editId ? Number(editId) : 0,
          fileName: f.name,
          filePath: URL.createObjectURL(f.file), // Mock path
          uploadedDate: new Date().toISOString()
        }))
      };

      if (editId) {
        claims = claims.map(c => c.claimId === Number(editId) ? newClaim : c);
      } else {
        claims.push(newClaim);
      }

      localStorage.setItem('claims', JSON.stringify(claims));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      navigate('/claims');
    } catch (err) {
      setError('Failed to save claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }} className="mx-auto pb-5">
      <div className="mb-4">
        <h2 className="fw-bold">Submit New Claim</h2>
        <p className="text-muted">Fill in the details below to initiate your insurance claim process.</p>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3">
        <AlertCircle size={20} />
        {error}
      </div>}

      <form onSubmit={handleSubmit} className="row g-4">
        {/* Basic Details */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FileText className="text-primary" size={20} />
              Basic Details
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Claim Number <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="claimNumber" 
                  className="form-control rounded-3" 
                  placeholder="e.g. CLM-123456" 
                  required 
                  value={formData.claimNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Policy Number <span className="text-danger">*</span></label>
                <select 
                  name="policyNumber" 
                  className="form-select rounded-3" 
                  required
                  value={formData.policyNumber}
                  onChange={handleChange}
                >
                  <option value="">Select Policy</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.policyNumber}>{p.policyNumber} - {p.corporateName}</option>
                  ))}
                  <option value="NEW">Other / Manual Entry</option>
                </select>
                {formData.policyNumber === 'NEW' && (
                  <input 
                    type="text" 
                    name="policyNumberManual" 
                    className="form-control mt-2 rounded-3" 
                    placeholder="Enter Policy Number"
                    onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patient & Hospital Details */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Hospital className="text-primary" size={20} />
              Patient & Hospital Details
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Employee / Member Name</label>
                <input 
                  type="text" 
                  name="employeeName" 
                  className="form-control rounded-3" 
                  placeholder="Enter name" 
                  value={formData.employeeName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Hospital Name</label>
                <input 
                  type="text" 
                  name="hospitalName" 
                  className="form-control rounded-3" 
                  placeholder="Enter hospital name" 
                  value={formData.hospitalName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Hospital Address</label>
                <textarea 
                  name="hospitalAddress" 
                  className="form-control rounded-3" 
                  rows={2} 
                  placeholder="Full address of the hospital"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Date of Admission</label>
                <input 
                  type="date" 
                  name="dateOfAdmission" 
                  className="form-control rounded-3" 
                  value={formData.dateOfAdmission}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Date of Discharge</label>
                <input 
                  type="date" 
                  name="dateOfDischarge" 
                  className="form-control rounded-3" 
                  value={formData.dateOfDischarge}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Details */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <AlertCircle className="text-primary" size={20} />
              Medical Details
            </h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Diagnosis</label>
                <textarea 
                  name="diagnosis" 
                  className="form-control rounded-3" 
                  rows={2} 
                  placeholder="Enter diagnosis details"
                  value={formData.diagnosis}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Treatment Type</label>
                <select 
                  name="treatmentType" 
                  className="form-select rounded-3" 
                  value={formData.treatmentType}
                  onChange={handleChange}
                >
                  <option value="Medical">Medical</option>
                  <option value="Surgical">Surgical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <span className="text-primary fw-bold">₹</span>
              Financial Details
            </h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Claim Amount (₹)</label>
                <input 
                  type="number" 
                  name="claimAmount" 
                  className="form-control rounded-3" 
                  placeholder="0.00" 
                  value={formData.claimAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">MOU Discount (₹)</label>
                <input 
                  type="number" 
                  name="mouDiscount" 
                  className="form-control rounded-3" 
                  placeholder="0.00" 
                  value={formData.mouDiscount}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Approved Amount (₹)</label>
                <input 
                  type="number" 
                  name="approvedAmount" 
                  className="form-control rounded-3" 
                  placeholder="0.00" 
                  value={formData.approvedAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Disallowed Amount (₹)</label>
                <input 
                  type="number" 
                  name="disallowedAmount" 
                  className="form-control rounded-3" 
                  placeholder="0.00" 
                  value={formData.disallowedAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Disallowed Reason</label>
                <textarea 
                  name="disallowedReason" 
                  className="form-control rounded-3" 
                  rows={2} 
                  placeholder="Reason for disallowed amount"
                  value={formData.disallowedReason}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Processing */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <CheckCircle2 className="text-primary" size={20} />
              Claim Processing
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Claim Type</label>
                <select 
                  name="claimType" 
                  className="form-select rounded-3" 
                  value={formData.claimType}
                  onChange={handleChange}
                >
                  <option value="Cashless">Cashless</option>
                  <option value="Reimbursement">Reimbursement</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Claim Status</label>
                <select 
                  name="status" 
                  className="form-select rounded-3" 
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Fields */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Clock className="text-primary" size={20} />
              Tracking Fields
            </h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Inward Date</label>
                <input type="date" name="inwardDate" className="form-control rounded-3" value={formData.inwardDate} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">AL Sanction Date</label>
                <input type="date" name="alSanctionDate" className="form-control rounded-3" value={formData.alSanctionDate} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">AL Sanction Amount (₹)</label>
                <input type="number" name="alSanctionAmount" className="form-control rounded-3" value={formData.alSanctionAmount} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">AL Net Sanction Amount (₹)</label>
                <input type="number" name="alNetSanctionAmount" className="form-control rounded-3" value={formData.alNetSanctionAmount} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Status */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <AlertCircle className="text-warning" size={20} />
              Pending Status
            </h5>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="pendingStatus.hospital" checked={formData.pendingStatus.hospital} onChange={handleChange} id="pendingHospital" />
                  <label className="form-check-label" htmlFor="pendingHospital">Pending with Hospital</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="pendingStatus.insurer" checked={formData.pendingStatus.insurer} onChange={handleChange} id="pendingInsurer" />
                  <label className="form-check-label" htmlFor="pendingInsurer">Pending with Insurer</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="pendingStatus.documents" checked={formData.pendingStatus.documents} onChange={handleChange} id="pendingDocs" />
                  <label className="form-check-label" htmlFor="pendingDocs">Pending for Documents with Employee</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="pendingStatus.investigation" checked={formData.pendingStatus.investigation} onChange={handleChange} id="pendingInv" />
                  <label className="form-check-label" htmlFor="pendingInv">Pending Investigation</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="pendingStatus.payment" checked={formData.pendingStatus.payment} onChange={handleChange} id="pendingPayment" />
                  <label className="form-check-label" htmlFor="pendingPayment">Pending Payment</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Plus className="text-primary" size={20} />
              Additional Details
            </h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Average Claim Size (₹)</label>
                <input type="text" name="averageClaimSize" className="form-control rounded-3 bg-light" value={formData.averageClaimSize} readOnly />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Payment Date</label>
                <input type="date" name="paymentDate" className="form-control rounded-3" value={formData.paymentDate} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Query Reminder Date</label>
                <input type="date" name="queryReminderDate" className="form-control rounded-3" value={formData.queryReminderDate} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">UTR Details</label>
                <input type="text" name="utrDetails" className="form-control rounded-3" placeholder="Enter UTR details" value={formData.utrDetails} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">FOC / Non-FOC</label>
                <select name="focNonFoc" className="form-select rounded-3" value={formData.focNonFoc} onChange={handleChange}>
                  <option value="FOC">FOC</option>
                  <option value="Non-FOC">Non-FOC</option>
                </select>
              </div>
              <div className="col-12 mt-4">
                <h6 className="fw-bold mb-3">Bank Details</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small">Account Number</label>
                    <input type="text" name="bankDetails.accountNo" className="form-control rounded-3" value={formData.bankDetails.accountNo} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">IFSC Code</label>
                    <input type="text" name="bankDetails.ifsc" className="form-control rounded-3" value={formData.bankDetails.ifsc} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Bank Name</label>
                    <input type="text" name="bankDetails.name" className="form-control rounded-3" value={formData.bankDetails.name} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Upload className="text-primary" size={20} />
              Document Uploads
            </h5>
            <div className="mb-3">
              <input 
                type="file" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="form-control rounded-3" 
                onChange={handleFileChange}
              />
              <p className="text-muted small mt-2 mb-0">Allowed formats: PDF, JPG, PNG. You can select multiple files.</p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <div className="d-flex align-items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span className="small text-truncate" style={{ maxWidth: '200px' }}>{file.name}</span>
                    </div>
                    <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeFile(file.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 text-end mb-5">
          <button 
            type="button" 
            className="btn btn-light px-4 me-2 rounded-3" 
            onClick={() => navigate('/claims')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary px-5 py-2 fw-bold rounded-3 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : 'Save Claim'}
          </button>
        </div>
      </form>
    </div>
  );
}
