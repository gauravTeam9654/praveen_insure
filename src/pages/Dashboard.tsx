import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  MessageSquare, 
  Bot, 
  Search, 
  Shield, 
  ArrowRight, 
  Zap,
  Activity,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Claim, User, PolicyDocument } from '../types';

interface ChatLog {
  id: number;
  userName: string;
  query: string;
  timestamp: string;
}

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

export default function Dashboard({ user }: { user: User }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      try {
        // Fetch claims from localStorage
        const savedClaims = localStorage.getItem('claims');
        const claimsData = savedClaims ? JSON.parse(savedClaims) : [];
        
        // Filter claims based on user role
        const filteredClaims = user.role === 'Admin' || user.role === 'Super Admin'
          ? claimsData
          : claimsData.filter((c: Claim) => c.userId === user.id);
        
        setClaims(filteredClaims);

        // Fetch policies from localStorage
        const savedPolicies = localStorage.getItem('insurance_policies');
        const policiesData = savedPolicies ? JSON.parse(savedPolicies) : [];
        setPolicies(policiesData);

        if (user.role === 'Admin' || user.role === 'Super Admin') {
          // Fetch chats from localStorage (if any)
          const savedChats = localStorage.getItem('support_chats');
          const chatsData = savedChats ? JSON.parse(savedChats) : [];
          setChats(Array.isArray(chatsData) ? chatsData.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3) : []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredPolicies = policies.filter(p => 
    p.corporateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.insuranceCompanyName?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'Pending').length,
    approved: claims.filter(c => c.status === 'Approved').length,
    rejected: claims.filter(c => c.status === 'Rejected').length,
    totalAmount: claims.reduce((acc, c) => acc + c.claimAmount, 0)
  };

  const claimsByType = {
    labels: ['Medical', 'Travel', 'Vehicle', 'Life'],
    datasets: [{
      label: 'Claims by Type',
      data: [
        claims.filter(c => c.claimType === 'Medical').length,
        claims.filter(c => c.claimType === 'Travel').length,
        claims.filter(c => c.claimType === 'Vehicle').length,
        claims.filter(c => c.claimType === 'Life').length,
      ],
      backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Claims Submitted',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 8,
      tension: 0.4,
    }]
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Global Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-slate-900"
          >
            Dashboard Overview
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500"
          >
            Welcome back, <span className="text-indigo-600 font-semibold">{user.name}</span>
          </motion.p>
        </div>

        <div className="relative w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search policies, users, or details..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
            />
          </div>

          <AnimatePresence>
            {showSearchResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
              >
                <div className="p-3 border-bottom bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Policy Search Results</span>
                </div>
                <div className="max-h-80 overflow-auto">
                  {filteredPolicies.length > 0 ? (
                    filteredPolicies.map(policy => (
                      <button 
                        key={policy.id}
                        className="w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-4 border-bottom last:border-0"
                        onClick={() => {
                          window.location.href = '/policies';
                        }}
                      >
                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                          <Shield size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{policy.userName}</div>
                          <div className="text-xs text-slate-500">ID: {policy.userId} • {policy.otherDetails}</div>
                        </div>
                        <ExternalLink size={14} className="ms-auto text-slate-300" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Search size={32} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-slate-500 text-sm">No policies found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                {filteredPolicies.length > 0 && (
                  <button 
                    className="w-full p-3 text-center text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => window.location.href = '/policies'}
                  >
                    View All Policies
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {showSearchResults && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowSearchResults(false)}
            />
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-3xl overflow-hidden bg-indigo-600 h-48 flex items-center px-10"
      >
        <img 
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          alt="Banner"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-600/80 to-transparent" />
        
        <div className="relative z-10 text-white max-w-lg">
          <h3 className="text-2xl font-bold mb-2">Manage Your Claims with AI Precision</h3>
          <p className="text-indigo-100 mb-4">Our intelligent portal helps you track, manage, and resolve insurance claims faster than ever before.</p>
          <button 
            onClick={() => window.location.href = '/submit'}
            className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            Submit New Claim <Zap size={16} />
          </button>
        </div>

        <div className="absolute right-10 bottom-0 top-0 hidden lg:flex items-center">
          <img 
            src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6eGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx8G3V0n4s/giphy.gif" 
            className="h-40 w-40 object-contain mix-blend-screen opacity-60"
            alt="Animated"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Claims', value: stats.total, icon: <FileText />, color: 'blue', delay: 0.3 },
          { label: 'Pending', value: stats.pending, icon: <Clock />, color: 'amber', delay: 0.4 },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle />, color: 'emerald', delay: 0.5 },
          { label: 'Rejected', value: stats.rejected, icon: <XCircle />, color: 'rose', delay: 0.6 },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                <TrendingUp size={12} /> +12%
              </div>
            </div>
            <div className="text-slate-500 text-sm font-semibold mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h5 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Monthly Claims Trend
            </h5>
            <select className="bg-slate-50 border-0 text-sm font-bold text-slate-600 rounded-xl px-4 py-2 focus:ring-0">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <Bar 
              data={monthlyData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    cornerRadius: 12,
                    displayColors: false
                  }
                },
                scales: {
                  y: { grid: { display: false }, border: { display: false } },
                  x: { grid: { display: false }, border: { display: false } }
                }
              }} 
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h5 className="text-xl font-bold text-slate-900 mb-8">Claims by Type</h5>
          <div style={{ height: '300px' }}>
            <Pie 
              data={claimsByType} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: { size: 12, weight: 'bold' }
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-8 border-bottom flex items-center justify-between">
            <h5 className="text-xl font-bold text-slate-900">Recent Claims Activity</h5>
            <button 
              onClick={() => window.location.href = '/claims'}
              className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy #</th>
                  <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.slice(0, 5).map(claim => (
                  <tr key={claim.claimId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs text-slate-500">#{claim.claimId.toString().slice(-6)}</td>
                    <td className="py-4 font-semibold text-slate-700">{claim.policyNumber}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{claim.claimType}</span>
                    </td>
                    <td className="py-4 font-bold text-slate-900">${claim.claimAmount.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                        claim.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-400">
                      <FileText size={40} className="mx-auto mb-3 opacity-20" />
                      <p>No claims activity found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {user.role === 'Admin' || user.role === 'Super Admin' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="p-8 border-bottom flex items-center justify-between">
              <h5 className="text-xl font-bold text-slate-900">AI Support</h5>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="p-8 flex-grow space-y-6">
              {chats.length > 0 ? (
                chats.map(chat => (
                  <div key={chat.id} className="group relative p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-900 text-sm">{chat.userName}</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {chat.query}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot size={32} className="text-slate-200" />
                  </div>
                  <p className="text-slate-500 text-sm">No recent AI interactions</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50">
              <button 
                onClick={() => window.location.href = '/support-chats'}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                View Full Chat Logs <MessageSquare size={16} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white flex flex-col justify-between"
          >
            <div>
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Bot size={28} />
              </div>
              <h4 className="text-2xl font-bold mb-3">Need Help?</h4>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Our AI-powered assistant is available 24/7 to help you with your policy questions and claim status.
              </p>
            </div>
            <button 
              className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
              onClick={() => {
                // Trigger chatbot if possible or just show info
                const chatBtn = document.querySelector('.chatbot-trigger') as HTMLElement;
                if (chatBtn) chatBtn.click();
              }}
            >
              Start AI Chat
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
