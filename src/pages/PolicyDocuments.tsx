import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Upload, 
  User as UserIcon, 
  FileText, 
  Shield, 
  Users, 
  CreditCard, 
  Activity,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, PolicyDocument, PolicyMember } from '../types';

export default function PolicyDocuments({ user }: { user: User }) {
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  
  // Form State
  const initialFormState = {
    policyNumber: '',
    policyStartDate: '',
    policyEndDate: '',
    corporateName: '',
    premiumAmount: 0,
    actualInsurerPart: '',
    advancePremium: 0,
    pendingPremium: 0,
    modeOfPremium: 'Online' as PolicyDocument['modeOfPremium'],
    premiumDate: '',
    profitAmount: '',
    profitEachMember: '',
    insuranceCompanyName: '',
    tpaName: '',
    policyType: 'GMC' as PolicyDocument['policyType'],
    address: '',
    mobileNo: '',
    emailId: '',
    brokerAgentName: '',
    sumInsured: '',
    sumInsuredUtilised: '',
    uhid: '',
    ailmentCapping: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [members, setMembers] = useState<PolicyMember[]>([]);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('insurance_policies');
    if (saved) setPolicies(JSON.parse(saved));
  }, []);

  // Auto-calculate Pending Premium
  useEffect(() => {
    const pending = (Number(formData.premiumAmount) || 0) - (Number(formData.advancePremium) || 0);
    setFormData(prev => ({ ...prev, pendingPremium: pending }));
  }, [formData.premiumAmount, formData.advancePremium]);

  const addMember = () => {
    const newMember: PolicyMember = {
      id: Date.now().toString(),
      name: '',
      age: '',
      dob: '',
      relation: 'Employee'
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateMember = (id: string, field: keyof PolicyMember, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setMembers([]);
    setPanFile(null);
    setAadhaarFile(null);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!panFile && !editingId) return alert("PAN Document is required");
    if (!aadhaarFile && !editingId) return alert("Aadhaar Document is required");
    
    // Check unique policy number
    const isDuplicate = policies.some(p => p.policyNumber === formData.policyNumber && p.id !== editingId);
    if (isDuplicate) return alert("Policy Number must be unique");

    const policyData: PolicyDocument = {
      ...formData,
      id: editingId || Date.now(),
      members,
      panFileName: panFile?.name || (editingId ? policies.find(p => p.id === editingId)?.panFileName : ''),
      aadhaarFileName: aadhaarFile?.name || (editingId ? policies.find(p => p.id === editingId)?.aadhaarFileName : ''),
      uploadedBy: user.id,
      createdDate: editingId ? (policies.find(p => p.id === editingId)?.createdDate || new Date().toISOString()) : new Date().toISOString()
    };

    let updatedPolicies;
    if (editingId) {
      updatedPolicies = policies.map(p => p.id === editingId ? policyData : p);
    } else {
      updatedPolicies = [policyData, ...policies];
    }

    setPolicies(updatedPolicies);
    localStorage.setItem('insurance_policies', JSON.stringify(updatedPolicies));
    resetForm();
    alert(editingId ? "Policy updated successfully!" : "Policy saved successfully!");
    setActiveTab('view');
  };

  const handleEdit = (policy: PolicyDocument) => {
    setFormData({
      policyNumber: policy.policyNumber,
      policyStartDate: policy.policyStartDate,
      policyEndDate: policy.policyEndDate,
      corporateName: policy.corporateName,
      premiumAmount: policy.premiumAmount,
      actualInsurerPart: policy.actualInsurerPart,
      advancePremium: policy.advancePremium,
      pendingPremium: policy.pendingPremium,
      modeOfPremium: policy.modeOfPremium,
      premiumDate: policy.premiumDate,
      profitAmount: policy.profitAmount,
      profitEachMember: policy.profitEachMember,
      insuranceCompanyName: policy.insuranceCompanyName,
      tpaName: policy.tpaName,
      policyType: policy.policyType,
      address: policy.address,
      mobileNo: policy.mobileNo,
      emailId: policy.emailId,
      brokerAgentName: policy.brokerAgentName,
      sumInsured: policy.sumInsured,
      sumInsuredUtilised: policy.sumInsuredUtilised,
      uhid: policy.uhid,
      ailmentCapping: policy.ailmentCapping,
    });
    setMembers(policy.members);
    setEditingId(policy.id);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      const updated = policies.filter(p => p.id !== id);
      setPolicies(updated);
      localStorage.setItem('insurance_policies', JSON.stringify(updated));
    }
  };

  const isExpiringThisMonth = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    return end.getMonth() === now.getMonth() && end.getFullYear() === now.getFullYear();
  };

  const filteredPolicies = policies.filter(p => 
    p.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 bg-slate-50 min-h-screen">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-slate-900 mb-1">Policy Document Management</h2>
              <p className="text-slate-500 small mb-0">Add, edit and track insurance policies with ease.</p>
            </div>
            <div className="badge bg-indigo-100 text-indigo-700 px-3 py-2 rounded-pill">
              <Shield size={16} className="me-1" /> Secure Portal
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills bg-white p-2 rounded-4 shadow-sm d-inline-flex border">
            <li className="nav-item">
              <button 
                className={`nav-link rounded-pill px-4 d-flex align-items-center gap-2 ${activeTab === 'add' ? 'active bg-primary' : 'text-slate-600'}`}
                onClick={() => setActiveTab('add')}
              >
                <Plus size={18} />
                {editingId ? 'Edit Policy' : 'Add Policy'}
              </button>
            </li>
            <li className="nav-item ms-2">
              <button 
                className={`nav-link rounded-pill px-4 d-flex align-items-center gap-2 ${activeTab === 'view' ? 'active bg-primary' : 'text-slate-600'}`}
                onClick={() => setActiveTab('view')}
              >
                <Search size={18} />
                View Policy
              </button>
            </li>
          </ul>
        </div>
      </div>

      {activeTab === 'add' ? (
        /* 1. Policy Form Section */
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Basic Details Card */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex align-items-center gap-2">
                  <div className="bg-indigo-50 p-2 rounded-3 text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <h5 className="mb-0 fw-bold">Basic Details</h5>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Policy Number *</label>
                      <input type="text" className="form-control rounded-3 shadow-none" required value={formData.policyNumber} onChange={e => setFormData({...formData, policyNumber: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Corporate Name</label>
                      <input type="text" className="form-control rounded-3 shadow-none" value={formData.corporateName} onChange={e => setFormData({...formData, corporateName: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Start Date *</label>
                      <input type="date" className="form-control rounded-3 shadow-none" required value={formData.policyStartDate} onChange={e => setFormData({...formData, policyStartDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">End Date *</label>
                      <input type="date" className="form-control rounded-3 shadow-none" required value={formData.policyEndDate} onChange={e => setFormData({...formData, policyEndDate: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-slate-600">Premium (₹) *</label>
                      <input type="number" className="form-control rounded-3 shadow-none" required value={formData.premiumAmount} onChange={e => setFormData({...formData, premiumAmount: Number(e.target.value)})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-slate-600">Advance (₹)</label>
                      <input type="number" className="form-control rounded-3 shadow-none" value={formData.advancePremium} onChange={e => setFormData({...formData, advancePremium: Number(e.target.value)})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-slate-600">Pending (₹)</label>
                      <input type="number" className="form-control rounded-3 shadow-none bg-light" readOnly value={formData.pendingPremium} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Mode of Premium</label>
                      <select className="form-select rounded-3 shadow-none" value={formData.modeOfPremium} onChange={e => setFormData({...formData, modeOfPremium: e.target.value as any})}>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Online">Online</option>
                        <option value="NEFT">NEFT</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Premium Date</label>
                      <input type="date" className="form-control rounded-3 shadow-none" value={formData.premiumDate} onChange={e => setFormData({...formData, premiumDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Profit Amount</label>
                      <input type="text" className="form-control rounded-3 shadow-none" value={formData.profitAmount} onChange={e => setFormData({...formData, profitAmount: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Profit Each Member</label>
                      <input type="text" className="form-control rounded-3 shadow-none" value={formData.profitEachMember} onChange={e => setFormData({...formData, profitEachMember: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance & Additional Details Card */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex align-items-center gap-2">
                  <div className="bg-emerald-50 p-2 rounded-3 text-emerald-600">
                    <Shield size={20} />
                  </div>
                  <h5 className="mb-0 fw-bold">Insurance & Contact</h5>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Insurance Company</label>
                      <select className="form-select rounded-3 shadow-none" value={formData.insuranceCompanyName} onChange={e => setFormData({...formData, insuranceCompanyName: e.target.value})}>
                        <option value="">Select Company</option>
                        <option value="LIC">LIC India</option>
                        <option value="HDFC">HDFC ERGO</option>
                        <option value="ICICI">ICICI Lombard</option>
                        <option value="Star">Star Health</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">TPA Name</label>
                      <input type="text" className="form-control rounded-3 shadow-none" value={formData.tpaName} onChange={e => setFormData({...formData, tpaName: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Policy Type</label>
                      <select className="form-select rounded-3 shadow-none" value={formData.policyType} onChange={e => setFormData({...formData, policyType: e.target.value as any})}>
                        <option value="GMC">GMC (Group Medical)</option>
                        <option value="Group Health">Group Health</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Broker Agent</label>
                      <select className="form-select rounded-3 shadow-none" value={formData.brokerAgentName} onChange={e => setFormData({...formData, brokerAgentName: e.target.value})}>
                        <option value="">Select Agent</option>
                        <option value="Agent A">Agent A</option>
                        <option value="Agent B">Agent B</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Mobile No (10-digit)</label>
                      <input type="text" className="form-control rounded-3 shadow-none" maxLength={10} value={formData.mobileNo} onChange={e => setFormData({...formData, mobileNo: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-600">Email ID</label>
                      <input type="email" className="form-control rounded-3 shadow-none" value={formData.emailId} onChange={e => setFormData({...formData, emailId: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-slate-600">Address</label>
                      <textarea className="form-control rounded-3 shadow-none" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Details Card */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-amber-50 p-2 rounded-3 text-amber-600">
                      <Users size={20} />
                    </div>
                    <h5 className="mb-0 fw-bold">Member Details</h5>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3" onClick={addMember}>
                    <Plus size={16} /> Add Member
                  </button>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="small fw-bold text-slate-500 py-3">Name</th>
                          <th className="small fw-bold text-slate-500 py-3">Age</th>
                          <th className="small fw-bold text-slate-500 py-3">DOB</th>
                          <th className="small fw-bold text-slate-500 py-3">Relation</th>
                          <th className="small fw-bold text-slate-500 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.id}>
                            <td><input type="text" className="form-control form-control-sm shadow-none" value={member.name} onChange={e => updateMember(member.id, 'name', e.target.value)} placeholder="Full Name" /></td>
                            <td><input type="number" className="form-control form-control-sm shadow-none" style={{ width: '80px' }} value={member.age} onChange={e => updateMember(member.id, 'age', e.target.value)} /></td>
                            <td><input type="date" className="form-control form-control-sm shadow-none" value={member.dob} onChange={e => updateMember(member.id, 'dob', e.target.value)} /></td>
                            <td>
                              <select className="form-select form-select-sm shadow-none" value={member.relation} onChange={e => updateMember(member.id, 'relation', e.target.value as any)}>
                                <option value="Employee">Employee</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                              </select>
                            </td>
                            <td className="text-center">
                              <button type="button" className="btn btn-sm btn-light text-danger p-1" onClick={() => removeMember(member.id)}>
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {members.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-slate-400 small">No members added. Click "Add Member" to start.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents & Financial Card */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex align-items-center gap-2">
                  <div className="bg-rose-50 p-2 rounded-3 text-rose-600">
                    <Activity size={20} />
                  </div>
                  <h5 className="mb-0 fw-bold">Documents & Medical Details</h5>
                </div>
                <div className="card-body px-4 pb-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small fw-bold text-slate-600">PAN Card Upload *</label>
                          <div className="input-group">
                            <input type="file" className="form-control shadow-none" accept=".pdf,.jpg,.png" onChange={e => setPanFile(e.target.files?.[0] || null)} />
                            <span className="input-group-text bg-white"><Upload size={16} /></span>
                          </div>
                          {panFile && <div className="small text-success mt-1"><CheckCircle2 size={12} className="me-1" /> {panFile.name}</div>}
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold text-slate-600">Aadhaar Card Upload *</label>
                          <div className="input-group">
                            <input type="file" className="form-control shadow-none" accept=".pdf,.jpg,.png" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} />
                            <span className="input-group-text bg-white"><Upload size={16} /></span>
                          </div>
                          {aadhaarFile && <div className="small text-success mt-1"><CheckCircle2 size={12} className="me-1" /> {aadhaarFile.name}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-slate-600">Sum Insured</label>
                          <input type="text" className="form-control rounded-3 shadow-none" value={formData.sumInsured} onChange={e => setFormData({...formData, sumInsured: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-slate-600">Sum Insured Utilised</label>
                          <input type="text" className="form-control rounded-3 shadow-none" value={formData.sumInsuredUtilised} onChange={e => setFormData({...formData, sumInsuredUtilised: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-slate-600">UHID</label>
                          <input type="text" className="form-control rounded-3 shadow-none" value={formData.uhid} onChange={e => setFormData({...formData, uhid: e.target.value})} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-slate-600">Ailment Capping</label>
                          <input type="text" className="form-control rounded-3 shadow-none" value={formData.ailmentCapping} onChange={e => setFormData({...formData, ailmentCapping: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="col-12 text-end mb-5">
              <button type="button" className="btn btn-light rounded-pill px-4 me-2" onClick={resetForm}>Reset Form</button>
              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">
                {editingId ? 'Update Policy' : 'Save Policy Document'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* 2. Policy List Table Section */
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 py-4 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <h5 className="mb-0 fw-bold">Policy Records</h5>
                  <p className="text-slate-500 small mb-0">List of all submitted insurance policies.</p>
                </div>
                <div className="position-relative" style={{ width: '300px' }}>
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="form-control rounded-pill ps-5 shadow-none" 
                    placeholder="Search Policy Number..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 small fw-bold text-slate-500">Policy #</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500">Corporate</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500">Insurer</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500">Premium</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500">Start Date</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500">End Date</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500">Pending</th>
                        <th className="px-4 py-3 small fw-bold text-slate-500 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPolicies.map((policy) => {
                        const expiring = isExpiringThisMonth(policy.policyEndDate);
                        return (
                          <tr key={policy.id} className={expiring ? 'table-danger' : ''}>
                            <td className="px-4 py-3 fw-bold">{policy.policyNumber}</td>
                            <td className="px-4 py-3">{policy.corporateName || '-'}</td>
                            <td className="px-4 py-3">
                              <span className="badge bg-light text-dark border">{policy.insuranceCompanyName || '-'}</span>
                            </td>
                            <td className="px-4 py-3 fw-bold">₹{policy.premiumAmount.toLocaleString()}</td>
                            <td className="px-4 py-3 small">{policy.policyStartDate}</td>
                            <td className="px-4 py-3 small">
                              {policy.policyEndDate}
                              {expiring && <span className="ms-2 badge bg-danger">Expiring</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`fw-bold ${policy.pendingPremium > 0 ? 'text-danger' : 'text-success'}`}>
                                ₹{policy.pendingPremium.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button className="btn btn-sm btn-light text-primary p-1" onClick={() => handleEdit(policy)}>
                                  <Edit2 size={18} />
                                </button>
                                <button className="btn btn-sm btn-light text-danger p-1" onClick={() => handleDelete(policy.id)}>
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPolicies.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-5 text-slate-400">
                            <AlertCircle size={40} className="mb-3 opacity-25" />
                            <p className="mb-0">No policy records found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
