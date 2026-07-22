import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import brandService from '../services/brandService';
import campaignService from '../services/campaignService';
import designService from '../services/designService';
import {
  Sparkles, LogOut, LayoutGrid, Clock, CheckCircle2,
  AlertCircle, Archive, Search, ChevronRight, ChevronDown,
  Filter, Calendar, ArrowUpDown, ChevronLeft
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
export default function ReviewerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sidebar navigation & submenu toggles
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | queue | approved | rejected | changes | archive
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewerFilter, setReviewerFilter] = useState('all'); // all | me | unassigned
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | reviewed | alpha
  const [dateRange, setDateRange] = useState('all'); // all | today | week | month

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const designsData = await designService.getDesigns();
      const safeDesigns = Array.isArray(designsData) ? designsData : [];
      setDesigns(safeDesigns);

      // Extract populated brand and campaign objects directly from assigned designs
      const bMap = new Map();
      const cMap = new Map();
      safeDesigns.forEach(d => {
        if (d.brandId && typeof d.brandId === 'object' && (d.brandId._id || d.brandId.id)) {
          const id = d.brandId._id || d.brandId.id;
          bMap.set(id, d.brandId);
        }
        if (d.campaignId && typeof d.campaignId === 'object' && (d.campaignId._id || d.campaignId.id)) {
          const id = d.campaignId._id || d.campaignId.id;
          cMap.set(id, d.campaignId);
        }
      });
      setBrands(Array.from(bMap.values()));
      setCampaigns(Array.from(cMap.values()));
    } catch (err) {
      console.error('loadData error:', err);
      setError('Failed to fetch review data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to resolve pending review status
  const isPending = (status) => {
    if (!status) return false;
    const s = status.trim().toLowerCase();
    return ['pending', 'pending review', 'submitted for review', 'submitted', 'in review'].includes(s);
  };

  // Derived counts for summary cards
  const pendingCount = designs.filter(d => isPending(d.status)).length;
  const approvedCount = designs.filter(d => (d.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = designs.filter(d => (d.status || '').toLowerCase() === 'rejected').length;
  const changesCount = designs.filter(d => (d.status || '').toLowerCase() === 'changes requested').length;

  // Filter & Sort designs
  const getFilteredDesigns = () => {
    let list = [...designs];

    // Sidebar Tab filter
    if (activeTab === 'queue') {
      list = list.filter(d => isPending(d.status));
    } else if (activeTab === 'approved') {
      list = list.filter(d => (d.status || '').toLowerCase() === 'approved');
    } else if (activeTab === 'rejected') {
      list = list.filter(d => (d.status || '').toLowerCase() === 'rejected');
    } else if (activeTab === 'changes') {
      list = list.filter(d => (d.status || '').toLowerCase() === 'changes requested');
    } else if (activeTab === 'archive') {
      // Completed history
      list = list.filter(d => ['approved', 'rejected', 'changes requested', 'archived'].includes((d.status || '').toLowerCase()));
    }

    // Top Brand Filter
    if (brandFilter !== 'all') {
      list = list.filter(d => {
        const bId = d.brandId?._id || d.brandId;
        return bId === brandFilter || bId?.toString() === brandFilter;
      });
    }

    // Campaign Filter
    if (campaignFilter !== 'all') {
      list = list.filter(d => {
        const cId = d.campaignId?._id || d.campaignId;
        return cId === campaignFilter || cId?.toString() === campaignFilter;
      });
    }

    // Platform Filter
    if (platformFilter !== 'all') {
      list = list.filter(d => (d.platform || '').toLowerCase() === platformFilter.toLowerCase());
    }

    // Status Filter (Only on Dashboard/Archive tabs)
    if (statusFilter !== 'all') {
      if (statusFilter === 'Pending') {
        list = list.filter(d => isPending(d.status));
      } else {
        list = list.filter(d => (d.status || '').toLowerCase() === statusFilter.toLowerCase());
      }
    }

    // Reviewer Filter
    if (reviewerFilter !== 'all') {
      if (reviewerFilter === 'me') {
        list = list.filter(d => {
          const revId = d.reviewer?._id || d.reviewer;
          const uId = user?._id || user?.id;
          return revId && uId && revId.toString() === uId.toString();
        });
      } else if (reviewerFilter === 'unassigned') {
        list = list.filter(d => !d.reviewer);
      }
    }

    // Date Range Filter
    if (dateRange !== 'all') {
      const now = new Date();
      list = list.filter(d => {
        const created = new Date(d.createdAt);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateRange === 'today') return diffDays <= 1;
        if (dateRange === 'week') return diffDays <= 7;
        if (dateRange === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Search Query (Design Name, Brand Name, Campaign Name, Submitted By)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => {
        const name = (d.name || d.title || '').toLowerCase();
        const dBrandId = d.brandId?._id || d.brandId;
        const dCampaignId = d.campaignId?._id || d.campaignId;
        const brandName = (brands.find(b => (b._id === dBrandId || b.id === dBrandId || b._id?.toString() === dBrandId?.toString()))?.name || d.brandId?.name || d.brandName || '').toLowerCase();
        const campaignName = (campaigns.find(c => (c._id === dCampaignId || c.id === dCampaignId || c._id?.toString() === dCampaignId?.toString()))?.name || d.campaignId?.name || d.campaignName || '').toLowerCase();
        const brief = (d.designBrief || d.prompt || '').toLowerCase();
        const creatorName = (d.createdBy?.name || '').toLowerCase();
        return name.includes(q) || brandName.includes(q) || campaignName.includes(q) || brief.includes(q) || creatorName.includes(q);
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'reviewed') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortBy === 'alpha') {
        return (a.name || 'Untitled').localeCompare(b.name || 'Untitled');
      }
      return 0;
    });

    return list;
  };

  const filteredDesigns = getFilteredDesigns();

  // Pagination calculations
  const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDesigns = filteredDesigns.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset pagination on filter/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, brandFilter, campaignFilter, platformFilter, statusFilter, reviewerFilter, sortBy, dateRange]);

  // Status badge components
  const renderStatusBadge = (status) => {
    let bg = 'rgba(108, 76, 241, 0.08)';
    let color = '#6C4CF1';
    let text = status;

    if (isPending(status)) {
      bg = 'rgba(245, 158, 11, 0.08)';
      color = '#F59E0B';
      text = 'Pending Review';
    } else if (status === 'Approved') {
      bg = 'rgba(16, 185, 129, 0.08)';
      color = '#10B981';
      text = 'Approved';
    } else if (status === 'Rejected') {
      bg = 'rgba(239, 68, 68, 0.08)';
      color = '#EF4444';
      text = 'Rejected';
    } else if (status === 'Changes Requested') {
      bg = 'rgba(139, 92, 246, 0.08)';
      color = '#8B5CF6';
      text = 'Changes Req.';
    }

    return (
      <span style={{
        background: bg,
        color: color,
        padding: '4px 10px',
        borderRadius: '30px',
        fontSize: '11.5px',
        fontWeight: 600,
        display: 'inline-block'
      }}>
        {text}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: '260px',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6C4CF1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B', lineHeight: 1.2 }}>AI Brand</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Review Panel</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
              color: activeTab === 'dashboard' ? '#6C4CF1' : '#64748B',
              fontWeight: activeTab === 'dashboard' ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <LayoutGrid size={16} /> Dashboard
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'queue' ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
              color: activeTab === 'queue' ? '#6C4CF1' : '#64748B',
              fontWeight: activeTab === 'queue' ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} /> Review Queue
            </span>
            {pendingCount > 0 && (
              <span style={{
                background: '#F59E0B',
                color: '#FFFFFF',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px'
              }}>{pendingCount}</span>
            )}
          </button>

          {/* History Collapsible Group */}
          <div>
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: '#64748B',
                fontWeight: 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                width: '100%',
                marginTop: '8px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} /> History
              </span>
              {historyExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {historyExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '24px', marginTop: '4px' }}>
                <button
                  onClick={() => setActiveTab('approved')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'approved' ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
                    color: activeTab === 'approved' ? '#6C4CF1' : '#64748B',
                    fontWeight: activeTab === 'approved' ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Approved
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'rejected' ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
                    color: activeTab === 'rejected' ? '#6C4CF1' : '#64748B',
                    fontWeight: activeTab === 'rejected' ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setActiveTab('changes')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'changes' ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
                    color: activeTab === 'changes' ? '#6C4CF1' : '#64748B',
                    fontWeight: activeTab === 'changes' ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Changes Requested
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('archive')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'archive' ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
              color: activeTab === 'archive' ? '#6C4CF1' : '#64748B',
              fontWeight: activeTab === 'archive' ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              marginTop: '8px'
            }}
          >
            <Archive size={16} /> Archive
          </button>
        </div>

        {/* User logout section */}
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '16px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(108, 76, 241, 0.1)',
              color: '#6C4CF1',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'R'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: 'transparent',
              color: '#EF4444',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Sticky Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '20px',
          position: 'sticky',
          top: 0,
          background: '#F8FAFC',
          zIndex: 100
        }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', margin: 0, textTransform: 'capitalize' }}>
              {activeTab === 'dashboard' ? 'Reviewer Overview' : activeTab === 'queue' ? 'Review Queue' : activeTab === 'changes' ? 'Changes Requested' : activeTab}
            </h1>
            <p style={{ fontSize: '14.5px', color: '#64748B', margin: '4px 0 0 0' }}>
              {activeTab === 'dashboard' && 'Review activity summary and queued creative assets.'}
              {activeTab === 'queue' && 'Design creative submissions awaiting reviewer feedback and approvals.'}
              {activeTab === 'approved' && 'Successfully approved designs, final assets ready for campaign export.'}
              {activeTab === 'rejected' && 'Rejected designs. Action remarks and comments are preserved below.'}
              {activeTab === 'changes' && 'Submissions sent back to editors with improvement specifications.'}
              {activeTab === 'archive' && 'Archived review sessions history logs.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationBell role="reviewer" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFFFF', padding: '6px 14px', borderRadius: '30px', border: '1px solid #E2E8F0' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(108, 76, 241, 0.1)',
                color: '#6C4CF1',
                fontWeight: 700,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user?.name ? user.name[0].toUpperCase() : 'R'}
              </div>
              <span style={{ fontSize: '13.0px', fontWeight: 600, color: '#1E293B' }}>{user?.name || 'Reviewer'}</span>
            </div>
          </div>
        </div>

        {/* TOP STATUS CARDS (Only on Dashboard Tab) */}
        {activeTab === 'dashboard' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
              {/* Card 1 */}
              <div onClick={() => setActiveTab('queue')} className="card" style={{ padding: '24px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>{pendingCount}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Pending Review</div>
                </div>
              </div>

              {/* Card 2 */}
              <div onClick={() => setActiveTab('approved')} className="card" style={{ padding: '24px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>{approvedCount}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Approved</div>
                </div>
              </div>

              {/* Card 3 */}
              <div onClick={() => setActiveTab('rejected')} className="card" style={{ padding: '24px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>{rejectedCount}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Rejected</div>
                </div>
              </div>

              {/* Card 4 */}
              <div onClick={() => setActiveTab('changes')} className="card" style={{ padding: '24px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B' }}>{changesCount}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Changes Requested</div>
                </div>
              </div>
            </div>
          )}

        {/* Tab content starts directly with filters and grid */}

        {/* CONTROL FILTER BAR */}
        <div className="card" style={{ padding: '20px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            
            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 16px',
              flex: 1,
              minWidth: '240px'
            }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                placeholder="Search by design name, brand, campaign..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13.5px', width: '100%', color: '#1E293B' }}
              />
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={14} color="#64748B" />
              <select
                className="select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ fontSize: '13px', padding: '10px 16px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', minWidth: '150px' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="reviewed">Recently Reviewed</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>

          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            
            {/* Brand Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Brand</span>
              <select
                className="select"
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                style={{ fontSize: '13px', width: '100%', padding: '8px 12px', borderRadius: '10px' }}
              >
                <option value="all">All Brands</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            {/* Campaign Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Campaign</span>
              <select
                className="select"
                value={campaignFilter}
                onChange={e => setCampaignFilter(e.target.value)}
                style={{ fontSize: '13px', width: '100%', padding: '8px 12px', borderRadius: '10px' }}
              >
                <option value="all">All Campaigns</option>
                {campaigns.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Platform Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Platform</span>
              <select
                className="select"
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                style={{ fontSize: '13px', width: '100%', padding: '8px 12px', borderRadius: '10px' }}
              >
                <option value="all">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Timeframe</span>
              <select
                className="select"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                style={{ fontSize: '13px', width: '100%', padding: '8px 12px', borderRadius: '10px' }}
              >
                <option value="all">All Time</option>
                <option value="today">Past 24 Hours</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Status</span>
              <select
                className="select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ fontSize: '13px', width: '100%', padding: '8px 12px', borderRadius: '10px' }}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Changes Requested">Changes Requested</option>
              </select>
            </div>

            {/* Reviewer Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Assignee</span>
              <select
                className="select"
                value={reviewerFilter}
                onChange={e => setReviewerFilter(e.target.value)}
                style={{ fontSize: '13px', width: '100%', padding: '8px 12px', borderRadius: '10px' }}
              >
                <option value="all">All Submissions</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

          </div>

        </div>

        {/* LOADING / ERROR / EMPTY STATES */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card" style={{ padding: '0px', overflow: 'hidden', height: '360px', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ height: '180px', background: '#F1F5F9' }} />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '16px', background: '#F1F5F9', borderRadius: '4px', width: '60%' }} />
                  <div style={{ height: '24px', background: '#F1F5F9', borderRadius: '4px', width: '80%' }} />
                  <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '4px', width: '40%', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '20px' }}>
            <div style={{ color: '#EF4444', fontSize: '14.5px', fontWeight: 600 }}>{error}</div>
            <button className="btn btn-secondary mt-12" onClick={loadData}>Retry Connection</button>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 24px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}>
              <Archive size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                {designs.length === 0 ? 'No designs assigned to you.' :
                 activeTab === 'queue' ? 'No designs waiting for review.' :
                 activeTab === 'approved' ? 'No approved designs.' :
                 activeTab === 'rejected' ? 'No rejected designs.' :
                 activeTab === 'changes' ? 'No designs requesting changes.' :
                 'No review history matches found.'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px' }}>
                {designs.length === 0 ? 'When an editor submits a design to your reviewer account, it will appear here.' : 'Verify your filters or check other workflow categories.'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* RESPONSIVE DESIGN GALLERY */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {paginatedDesigns.map(d => {
                const brandIdStr = d.brandId?._id || d.brandId;
                const campaignIdStr = d.campaignId?._id || d.campaignId;
                const brandObj = brands.find(b => (b._id === brandIdStr || b.id === brandIdStr));
                const campaignObj = campaigns.find(c => (c._id === campaignIdStr || c.id === campaignIdStr));
                
                const finalBrandName = brandObj?.name || d.brandId?.name || d.brandName || 'Unknown Brand';
                const finalCampaignName = campaignObj?.name || d.campaignId?.name || d.campaignName || 'Unknown Campaign';
                
                return (
                  <div
                    key={d._id}
                    className="card card-hover anim-scale-in"
                    onClick={() => navigate(`/reviewer/design/${d._id}`)}
                    style={{
                      padding: '0px',
                      overflow: 'hidden',
                      borderRadius: '24px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    {/* Image Thumbnail (16:9 ratio) */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: '#F1F5F9',
                      borderBottom: '1px solid #E2E8F0',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '32px' }}>🎨</span>
                      )}
                      
                      {/* Floating status tag */}
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                        {renderStatusBadge(d.status)}
                        <span style={{
                          background: d.submissionType === 'Uploaded Design' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(108, 76, 241, 0.12)',
                          color: d.submissionType === 'Uploaded Design' ? '#2563EB' : '#6C4CF1',
                          padding: '4px 10px',
                          borderRadius: '30px',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}>
                          {d.submissionType === 'Uploaded Design' ? 'Uploaded' : 'AI Generated'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

                      {/* Design name */}
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.name || 'Untitled Design'}
                      </h4>

                      {/* Brand row: logo + name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {(() => {
                          const bObj = brands.find(b => b._id === (d.brandId?._id || d.brandId) || b.id === (d.brandId?._id || d.brandId));
                          const logo = bObj?.logoUrl || d.brandId?.logoUrl;
                          const name = bObj?.name || d.brandId?.name || d.brandName || 'Unknown Brand';
                          return (
                            <>
                              {logo ? (
                                <img src={logo} alt={name} style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain', border: '1px solid #E8EDF2', background: '#F8FAFC' }} />
                              ) : (
                                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                                  {name[0]?.toUpperCase()}
                                </div>
                              )}
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                            </>
                          );
                        })()}
                      </div>

                      {/* Campaign */}
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        <span style={{ color: '#94A3B8', marginRight: 4 }}>Campaign</span>
                        <strong style={{ color: '#475569' }}>{finalCampaignName}</strong>
                      </div>

                      {/* Submitted by */}
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        <span style={{ color: '#94A3B8', marginRight: 4 }}>Submitted by</span>
                        <strong style={{ color: '#475569' }}>
                          {d.createdBy?.name || 'Editor'}
                        </strong>
                      </div>

                    </div>


                  </div>
                );
              })}
            </div>

            {/* PAGINATION CONTROL BAR */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '20px',
                marginTop: '30px'
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
