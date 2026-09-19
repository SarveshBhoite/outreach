'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Send,
  Globe,
  Smartphone,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Sliders,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Building2,
  MapPin,
  Star,
  Activity,
  Layers,
  KeyRound,
  FileCheck,
  Clock,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  Mail,
  Download,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  UserCheck,
  BadgeCheck,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES';
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES';
  createdAt: string;
  totalScraped: number;
  totalUpdated: number;
}

interface Lead {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  lastUpdatedById?: string;
  lastUpdatedBy?: {
    id: string;
    name: string;
    email: string;
  };
  leadStatus?: 'PENDING' | 'CONTACTED' | 'DONE' | 'CLOSED';
  remarks?: string;
  lastContactedAt?: string;
  businessName: string;
  category: string;
  city: string;
  phoneNumber: string;
  formattedPhone: string;
  websiteUrl?: string;
  email?: string;
  googleRating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
  hasWebsite: boolean;
  websiteWorking: boolean;
  isMobileFriendly: boolean;
  sslValid: boolean;
  pitchCategory: string;
  auditSummary: string;
  assignedTemplate?: string;
  templateParameters?: string;
  personalizedPitch: string;
  pitchAngle: string;
  isTemplateSent: boolean;
  status: string;
  createdAt: string;
  campaign?: {
    name: string;
    targetNiche: string;
    targetLocation: string;
  };
}

export default function OutreachDashboard() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'sandbox' | 'settings' | 'team'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [runningAutopilot, setRunningAutopilot] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalAudited: 0,
    totalSent: 0,
    totalPending: 0,
    totalContacted: 0,
    totalDone: 0,
    totalClosed: 0,
  });

  // Lead Filters (Status & Sales Rep Filter for Admin)
  const [leadStatusFilter, setLeadStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'DONE' | 'CLOSED'>('ALL');
  const [adminUserFilter, setAdminUserFilter] = useState<string>('ALL');

  // Inline Editing Lead Remarks
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState<string>('');
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);

  // Global Controls State
  const [settings, setSettings] = useState({
    globalAutoDispatch: false,
    globalScrapeLimit: 20,
    crmApiUrl: 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
    crmApiKey: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'SALES' | 'ADMIN'>('SALES');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userActionError, setUserActionError] = useState('');

  // Manual/Custom Trigger Inputs
  const [customNiche, setCustomNiche] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customScrapeLimit, setCustomScrapeLimit] = useState<number>(20);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sendingSingleLead, setSendingSingleLead] = useState(false);

  // Sandbox Test
  const [testPhone, setTestPhone] = useState('9136870930');
  const [testTemplate, setTestTemplate] = useState('universal_b2b_web_v2');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Export Modal & Filter State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportDateRange, setExportDateRange] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportTemplateFilter, setExportTemplateFilter] = useState<'all' | 'sent' | 'pending'>('all');

  // Selectable Export Fields
  const availableExportFields = [
    { key: 'businessName', label: 'Business Name', defaultChecked: true },
    { key: 'leadStatus', label: 'Sales Status', defaultChecked: true },
    { key: 'remarks', label: 'Remarks / Notes', defaultChecked: true },
    { key: 'category', label: 'Niche / Category', defaultChecked: true },
    { key: 'city', label: 'City / Location', defaultChecked: true },
    { key: 'formattedPhone', label: 'Phone (WhatsApp)', defaultChecked: true },
    { key: 'email', label: 'Email Address', defaultChecked: true },
    { key: 'websiteUrl', label: 'Website URL', defaultChecked: true },
    { key: 'googleRating', label: 'Google Rating', defaultChecked: true },
    { key: 'reviewCount', label: 'Review Count', defaultChecked: false },
    { key: 'pitchAngle', label: 'Pitch Angle', defaultChecked: true },
    { key: 'assignedTemplate', label: 'Assigned Meta Template', defaultChecked: true },
    { key: 'isTemplateSent', label: 'Template Sent Status', defaultChecked: true },
    { key: 'scrapedBy', label: 'Scraped By (Rep)', defaultChecked: true },
    { key: 'auditSummary', label: 'Digital Footprint Audit', defaultChecked: false },
    { key: 'personalizedPitch', label: 'Tailored Pitch Copy', defaultChecked: false },
    { key: 'address', label: 'Full Address', defaultChecked: false },
    { key: 'createdAt', label: 'Scraped Date & Time', defaultChecked: true },
  ];

  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableExportFields.filter((f) => f.defaultChecked).map((f) => f.key)
  );

  const toggleExportField = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((k) => k !== fieldKey) : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(availableExportFields.map((f) => f.key));
  };

  const deselectAllFields = () => {
    setSelectedFields(['businessName', 'leadStatus', 'remarks', 'formattedPhone', 'email']);
  };

  // Fetch Current Logged-in User
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
    }
  };

  // Fetch all leads when opening export modal
  const [allExportLeads, setAllExportLeads] = useState<Lead[]>([]);
  const [loadingExportLeads, setLoadingExportLeads] = useState(false);

  useEffect(() => {
    if (isExportModalOpen) {
      const fetchAllForExport = async () => {
        try {
          setLoadingExportLeads(true);
          const userQuery = currentUser?.role === 'ADMIN' && adminUserFilter !== 'ALL' ? `&userId=${adminUserFilter}` : '';
          const statusQuery = leadStatusFilter !== 'ALL' ? `&leadStatus=${leadStatusFilter}` : '';
          const res = await fetch(`/api/leads?all=true${userQuery}${statusQuery}`);
          const data = await res.json();
          if (data.success) {
            setAllExportLeads(data.data.leads || []);
          }
        } catch (err) {
          console.error('Failed to load all leads for export:', err);
          setAllExportLeads(leads);
        } finally {
          setLoadingExportLeads(false);
        }
      };
      fetchAllForExport();
    }
  }, [isExportModalOpen]);

  // Helper to compute currently filtered leads for export
  const getMatchingLeads = () => {
    const now = new Date();
    const sourceLeads = allExportLeads.length > 0 ? allExportLeads : leads;
    return sourceLeads.filter((lead) => {
      if (exportDateRange !== 'all') {
        const leadDate = new Date(lead.createdAt);
        if (isNaN(leadDate.getTime())) return true;

        if (exportDateRange === 'today') {
          const isSameDay =
            leadDate.getFullYear() === now.getFullYear() &&
            leadDate.getMonth() === now.getMonth() &&
            leadDate.getDate() === now.getDate();
          const isWithin24h = now.getTime() - leadDate.getTime() <= 24 * 60 * 60 * 1000;
          if (!isSameDay && !isWithin24h) return false;
        } else if (exportDateRange === '7days') {
          const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (leadDate < past7) return false;
        } else if (exportDateRange === '30days') {
          const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (leadDate < past30) return false;
        } else if (exportDateRange === 'custom') {
          if (exportStartDate) {
            const start = new Date(exportStartDate);
            start.setHours(0, 0, 0, 0);
            if (leadDate < start) return false;
          }
          if (exportEndDate) {
            const end = new Date(exportEndDate);
            end.setHours(23, 59, 59, 999);
            if (leadDate > end) return false;
          }
        }
      }

      if (exportTemplateFilter === 'sent' && !lead.isTemplateSent) return false;
      if (exportTemplateFilter === 'pending' && lead.isTemplateSent) return false;

      return true;
    });
  };

  const matchingLeadsCount = getMatchingLeads().length;

  // Run Export
  const handleExecuteExport = () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field/column to export.');
      return;
    }

    const filteredLeads = getMatchingLeads();

    if (filteredLeads.length === 0) {
      alert('No leads match the selected date range and filter criteria.');
      return;
    }

    const exportData = filteredLeads.map((lead) => {
      const row: Record<string, any> = {};
      selectedFields.forEach((fieldKey) => {
        const fieldMeta = availableExportFields.find((f) => f.key === fieldKey);
        const colLabel = fieldMeta?.label || fieldKey;

        if (fieldKey === 'isTemplateSent') {
          row[colLabel] = lead.isTemplateSent ? 'SENT' : 'PENDING';
        } else if (fieldKey === 'scrapedBy') {
          row[colLabel] = lead.user?.name || lead.user?.email || 'Unassigned';
        } else if (fieldKey === 'leadStatus') {
          row[colLabel] = lead.leadStatus || 'PENDING';
        } else if (fieldKey === 'remarks') {
          row[colLabel] = lead.remarks || '';
        } else if (fieldKey === 'createdAt') {
          row[colLabel] = new Date(lead.createdAt).toLocaleString();
        } else {
          row[colLabel] = (lead as any)[fieldKey] ?? '';
        }
      });
      return row;
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `outreach_leads_export_${exportDateRange}_${timestamp}.${exportFormat}`;

    if (exportFormat === 'json') {
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = selectedFields.map((k) => {
        const meta = availableExportFields.find((f) => f.key === k);
        return `"${(meta?.label || k).replace(/"/g, '""')}"`;
      });

      const csvRows = exportData.map((row) => {
        return selectedFields
          .map((k) => {
            const meta = availableExportFields.find((f) => f.key === k);
            const val = String(row[meta?.label || k] ?? '');
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      const csvContent = [headers.join(','), ...csvRows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setIsExportModalOpen(false);
  };

  // Fetch Dashboard Data with Pagination & Filters
  const fetchDashboardData = async (targetPage: number = 1, currentStatus = leadStatusFilter, currentUserFilter = adminUserFilter) => {
    try {
      setLoading(true);
      let queryUrl = `/api/leads?page=${targetPage}&limit=20`;
      if (currentStatus && currentStatus !== 'ALL') {
        queryUrl += `&leadStatus=${currentStatus}`;
      }
      if (currentUser?.role === 'ADMIN' && currentUserFilter && currentUserFilter !== 'ALL') {
        queryUrl += `&userId=${currentUserFilter}`;
      }

      const res = await fetch(queryUrl);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
        setStats(data.data.stats || {
          totalLeads: 0,
          totalAudited: 0,
          totalSent: 0,
          totalPending: 0,
          totalContacted: 0,
          totalDone: 0,
          totalClosed: 0,
        });
        if (data.data.pagination) {
          setCurrentPage(data.data.pagination.page);
          setTotalPages(data.data.pagination.totalPages);
          setTotalLeadsCount(data.data.pagination.totalCount);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Team Members (Admin Only)
  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoadingTeam(false);
    }
  };

  // Create New User (Admin Only)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError('');
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setUserActionError('Please fill out all fields.');
      return;
    }

    try {
      setCreatingUser(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('SALES');
        await fetchTeamMembers();
      } else {
        setUserActionError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setUserActionError(err.message || 'Network error');
    } finally {
      setCreatingUser(false);
    }
  };

  // Delete User (Admin Only)
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchTeamMembers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    }
  };

  // Update Lead Status (PENDING, CONTACTED, DONE, CLOSED)
  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      setSavingLeadId(leadId);
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, leadStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, leadStatus: newStatus as any, lastUpdatedBy: currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : undefined } : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev) => prev ? { ...prev, leadStatus: newStatus as any } : null);
        }
      } else {
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingLeadId(null);
    }
  };

  // Update Lead Remarks
  const handleSaveLeadRemark = async (leadId: string) => {
    try {
      setSavingLeadId(leadId);
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, remarks: remarkInput }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, remarks: remarkInput, lastUpdatedBy: currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : undefined } : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev) => prev ? { ...prev, remarks: remarkInput } : null);
        }
        setEditingRemarkId(null);
      } else {
        alert(`Failed to save note: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingLeadId(null);
    }
  };

  // Handle User Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    }
  };

  // Fetch Settings (Admin Only)
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setCustomScrapeLimit(data.data.globalScrapeLimit || 20);
      }
    } catch (err) {
      // Ignored for non-admin
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchSettings();
      fetchTeamMembers();
    }
  }, [currentUser]);

  // Quick Toggle Global Auto-Dispatch Directly from Header (Admin Only)
  const handleToggleGlobalAutoDispatch = async (enabled: boolean) => {
    const updated = { ...settings, globalAutoDispatch: enabled };
    setSettings(updated);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update toggle:', err);
    }
  };

  // Trigger Pipeline (Attributed to Current User)
  const handleTriggerAutopilot = async (isManual: boolean = false) => {
    try {
      setRunningAutopilot(true);
      setPipelineLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 Initiating ${isManual ? 'Custom Targeted' : 'Autonomous AI'} Discovery...`,
        `[${new Date().toLocaleTimeString()}] 👤 Scraped by: ${currentUser?.name || currentUser?.email || 'Active User'}`,
        `[${new Date().toLocaleTimeString()}] ⚙️ Auto-Dispatch is ${settings.globalAutoDispatch ? '🟢 ON' : '⚪ OFF'}`,
      ]);

      const res = await fetch('/api/autopilot/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customNiche: isManual ? customNiche.trim() || undefined : undefined,
          customLocation: isManual ? customLocation.trim() || undefined : undefined,
          overrideScrapeLimit: customScrapeLimit,
          overrideAutoDispatch: settings.globalAutoDispatch,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPipelineLogs(data.data.logs || ['Pipeline run completed successfully.']);
        await fetchDashboardData(1);
      } else {
        setPipelineLogs((prev) => [...prev, `❌ Error: ${data.error}`]);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setPipelineLogs((prev) => [...prev, `❌ Network error: ${e.message}`]);
    } finally {
      setRunningAutopilot(false);
    }
  };

  // Send Template to Individual Lead
  const handleSendSingleTemplate = async (lead: Lead) => {
    try {
      setSendingSingleLead(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Template successfully sent to ${lead.businessName}!`);
        setSelectedLead(null);
        await fetchDashboardData(currentPage);
      } else {
        alert(`Failed to send: ${data.error}`);
      }
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Send Error: ${e.message}`);
    } finally {
      setSendingSingleLead(false);
    }
  };

  // Quick Sandbox Test (Admin Only)
  const handleSendTestMessage = async () => {
    if (!testPhone) return;
    try {
      setTestSending(true);
      setTestResult(null);
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testPhone,
          templateName: testTemplate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Template "${testTemplate}" dispatched & logged in CRM!` });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to dispatch test message.' });
      }
    } catch (err: unknown) {
      const e = err as Error;
      setTestResult({ success: false, message: e.message });
    } finally {
      setTestSending(false);
    }
  };

  // Save Settings (Admin Only)
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        alert('Configuration saved successfully!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 sm:hidden transition-opacity"
          aria-label="Close Mobile Drawer"
        />
      )}

      {/* Sidebar: Responsive Drawer on Mobile, Collapsible on Desktop (#BAE6FD Brand Theme) */}
      <aside
        className={`
          fixed sm:static inset-y-0 left-0 z-50
          ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          ${isSidebarOpen ? 'sm:w-64 w-72' : 'sm:w-16 w-72'}
          transition-all duration-300 ease-in-out border-r border-sky-300 bg-[#BAE6FD] flex flex-col justify-between p-3 shrink-0 shadow-lg sm:shadow-xs
        `}
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="flex items-center justify-between px-1 py-2 mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 rounded-2xl bg-white border border-sky-300 overflow-hidden flex items-center justify-center shadow-xs shrink-0 p-0.5">
                <img src="/icon.jpeg" alt="Logo" className="h-full w-full object-cover rounded-xl" />
              </div>
              <div className={`${isSidebarOpen ? 'block' : 'hidden sm:hidden block'} truncate`}>
                <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
                  OutreachAI <span className="text-[10px] bg-sky-600 text-white font-bold px-1.5 py-0.5 rounded">CRM</span>
                </h1>
                <p className="text-[11px] text-slate-600 font-semibold truncate">Jisnu Outreach Hub</p>
              </div>
            </div>

            {/* Mobile Close (X) button */}
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="sm:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
              title="Close Drawer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden sm:flex p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition shrink-0"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {/* 1. Command Center */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileDrawerOpen(false);
              }}
              title={!isSidebarOpen ? 'Command Center' : undefined}
              className={`w-full flex items-center ${
                isSidebarOpen ? 'gap-3 px-3' : 'sm:justify-center sm:px-0 gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/25 scale-[1.02]'
                  : 'text-slate-700 hover:text-sky-900 hover:bg-white/80'
              }`}
            >
              <Activity className="h-4 w-4 shrink-0" />
              <span className={`${isSidebarOpen ? 'inline' : 'sm:hidden inline'} truncate`}>Command Center</span>
            </button>

            {/* 2. Leads CRM */}
            <button
              onClick={() => {
                setActiveTab('leads');
                setIsMobileDrawerOpen(false);
              }}
              title={!isSidebarOpen ? 'Lead CRM & Audits' : undefined}
              className={`w-full flex items-center ${
                isSidebarOpen ? 'gap-3 px-3' : 'sm:justify-center sm:px-0 gap-3 px-3'
              } py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leads'
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/25 scale-[1.02]'
                  : 'text-slate-700 hover:text-sky-900 hover:bg-white/80'
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <div className={`${isSidebarOpen ? 'flex' : 'sm:hidden flex'} items-center justify-between flex-1 truncate`}>
                <span className="truncate">Lead CRM & Audits</span>
                {leads.length > 0 && (
                  <span className="ml-auto text-[10px] bg-white text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                    {leads.length}
                  </span>
                )}
              </div>
            </button>

            {/* ADMIN ONLY TABS */}
            {currentUser?.role === 'ADMIN' && (
              <>
                <div className="pt-2 pb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 ${isSidebarOpen ? 'block' : 'sm:hidden block'}`}>
                    Admin Portal
                  </span>
                </div>

                {/* 3. Team Management */}
                <button
                  onClick={() => {
                    setActiveTab('team');
                    setIsMobileDrawerOpen(false);
                  }}
                  title={!isSidebarOpen ? 'Team & Users' : undefined}
                  className={`w-full flex items-center ${
                    isSidebarOpen ? 'gap-3 px-3' : 'sm:justify-center sm:px-0 gap-3 px-3'
                  } py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'team'
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/25 scale-[1.02]'
                      : 'text-slate-700 hover:text-sky-900 hover:bg-white/80'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarOpen ? 'inline' : 'sm:hidden inline'} truncate`}>Team & Users</span>
                </button>

                {/* 4. WhatsApp Sandbox */}
                <button
                  onClick={() => {
                    setActiveTab('sandbox');
                    setIsMobileDrawerOpen(false);
                  }}
                  title={!isSidebarOpen ? 'WhatsApp Sandbox' : undefined}
                  className={`w-full flex items-center ${
                    isSidebarOpen ? 'gap-3 px-3' : 'sm:justify-center sm:px-0 gap-3 px-3'
                  } py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'sandbox'
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/25 scale-[1.02]'
                      : 'text-slate-700 hover:text-sky-900 hover:bg-white/80'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarOpen ? 'inline' : 'sm:hidden inline'} truncate`}>WhatsApp Sandbox</span>
                </button>

                {/* 5. Settings */}
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMobileDrawerOpen(false);
                  }}
                  title={!isSidebarOpen ? 'Settings & CRM Gateway' : undefined}
                  className={`w-full flex items-center ${
                    isSidebarOpen ? 'gap-3 px-3' : 'sm:justify-center sm:px-0 gap-3 px-3'
                  } py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-600/25 scale-[1.02]'
                      : 'text-slate-700 hover:text-sky-900 hover:bg-white/80'
                  }`}
                >
                  <Sliders className="h-4 w-4 shrink-0" />
                  <span className={`${isSidebarOpen ? 'inline' : 'sm:hidden inline'} truncate`}>Settings & Gateway</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="pt-3 border-t border-sky-300">
          <div className={`${isSidebarOpen ? 'block' : 'sm:hidden block'}`}>
            <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200/80 text-xs flex items-center justify-between shadow-2xs">
              <div className="truncate pr-2">
                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{currentUser?.name || 'Sales Rep'}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                    currentUser?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {currentUser?.role || 'SALES'}
                  </span>
                  <span className="truncate">{currentUser?.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          {!isSidebarOpen && (
            <div className="hidden sm:flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-white/80 transition"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area: Clean slate-50 background matching automationcrm */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 min-w-0">
        {/* Top App Header */}
        <header className="min-h-16 py-2 sm:py-0 border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-2xs gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="sm:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition shrink-0 shadow-2xs"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Open Sidebar Button when collapsed */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden sm:flex p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shrink-0"
                title="Open Sidebar"
              >
                <PanelLeft className="h-4 w-4 text-sky-600" />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 capitalize truncate">
                  {activeTab === 'overview' && 'Command Center'}
                  {activeTab === 'leads' && (currentUser?.role === 'ADMIN' ? 'Team Leads & Audits' : 'My Leads & Pipeline')}
                  {activeTab === 'team' && 'Team & Users'}
                  {activeTab === 'sandbox' && 'WhatsApp Sandbox'}
                  {activeTab === 'settings' && 'CRM Configuration'}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden xs:inline">Live Sync</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {currentUser?.role === 'ADMIN' ? '👑 Admin: Full Team Oversight' : `Sales: ${currentUser?.name || currentUser?.email}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            {/* Auto Dispatch Switch (Admin Only) */}
            {currentUser?.role === 'ADMIN' && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 px-2 sm:px-3 py-1.5 rounded-xl shadow-2xs">
                <input
                  type="checkbox"
                  id="globalAutoDispatchHeader"
                  checked={settings.globalAutoDispatch}
                  onChange={(e) => handleToggleGlobalAutoDispatch(e.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="globalAutoDispatchHeader" className="text-[11px] sm:text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                  <Send className="h-3 w-3 text-sky-600" />
                  <span className="hidden md:inline">Auto-Dispatch</span>
                </label>
              </div>
            )}

            <button
              onClick={() => fetchDashboardData(currentPage)}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => handleTriggerAutopilot(false)}
              disabled={runningAutopilot}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                runningAutopilot
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-sky-500/20'
              }`}
            >
              {runningAutopilot ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden xs:inline">Scraping Leads...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span className="hidden xs:inline">Daily Autopilot</span>
                  <span className="xs:hidden">Autopilot</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Tab 1: Overview / Command Center */}
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
            {/* Stat Cards matching automationcrm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Leads */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-sky-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{currentUser?.role === 'ADMIN' ? 'Total Leads in System' : 'My Scraped Leads'}</span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.totalLeads}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Sourced via Google Places</div>
                </div>
              </div>

              {/* Card 2: Pending Contact */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-amber-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Outreach</span>
                  <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.totalPending}</div>
                  <div className="text-[11px] text-amber-700 font-semibold mt-1">Waiting for initial pitch</div>
                </div>
              </div>

              {/* Card 3: Contacted / In Progress */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-emerald-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contacted / Dispatched</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.totalContacted}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">Logged in WhatsApp CRM</div>
                </div>
              </div>

              {/* Card 4: Deals Closed */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm hover:border-purple-300 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deals Closed</span>
                  <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.totalClosed}</div>
                  <div className="text-[11px] text-purple-700 font-semibold mt-1">Successfully converted</div>
                </div>
              </div>
            </div>

            {/* Run Controller & Realtime Activity Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Targeted Run Controller */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Custom Campaign Scraper</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Target a specific business niche & locality. Scraped leads will automatically be tagged as owned by <strong>{currentUser?.name || currentUser?.email}</strong>.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Target Niche / Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Interior Designers, Cafes, Dental Clinics"
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Target City / Locality</label>
                      <input
                        type="text"
                        placeholder="e.g. Indiranagar Bangalore, Andheri West Mumbai"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Scrape Volume Limit</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={customScrapeLimit}
                        onChange={(e) => setCustomScrapeLimit(parseInt(e.target.value, 10) || 20)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <button
                      onClick={() => handleTriggerAutopilot(true)}
                      disabled={runningAutopilot || !customNiche.trim() || !customLocation.trim()}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {runningAutopilot ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Start Custom Scraping Run
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Terminal */}
              <div className="lg:col-span-7">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 h-[400px] flex flex-col shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
                      <h3 className="text-sm font-bold text-slate-900">Live Pipeline Execution Logs</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Realtime updates</span>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 font-mono text-xs text-slate-700">
                    {pipelineLogs.length === 0 ? (
                      <div className="text-slate-400 text-center py-20 font-sans text-xs">
                        No active run in progress. Click &quot;Launch Daily Autopilot&quot; to begin.
                      </div>
                    ) : (
                      pipelineLogs.map((log, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-800">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Lead CRM Table, Status & Remarks */}
        {activeTab === 'leads' && (
          <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentUser?.role === 'ADMIN' ? 'All Team Scraped Leads' : 'My Scraped Leads & Notes'}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage lead status, track follow-up remarks, and inspect digital audits.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {/* Admin Sales Rep Selector */}
                {currentUser?.role === 'ADMIN' && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                    <span className="text-slate-500 font-semibold">Rep:</span>
                    <select
                      value={adminUserFilter}
                      onChange={(e) => {
                        setAdminUserFilter(e.target.value);
                        fetchDashboardData(1, leadStatusFilter, e.target.value);
                      }}
                      className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Team Members</option>
                      {teamMembers.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} ({tm.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setLeadStatusFilter(newStatus);
                      fetchDashboardData(1, newStatus, adminUserFilter);
                    }}
                    className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">🟡 Pending</option>
                    <option value="CONTACTED">🔵 Contacted</option>
                    <option value="DONE">🟢 Done</option>
                    <option value="CLOSED">🟣 Closed</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={leads.length === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-sky-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Export Leads
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3.5">Business Name</th>
                      <th className="px-4 py-3.5">Sales Status</th>
                      <th className="px-4 py-3.5 min-w-[200px]">Remarks / Notes</th>
                      {currentUser?.role === 'ADMIN' && <th className="px-4 py-3.5">Scraped By</th>}
                      <th className="px-4 py-3.5">Niche & Locality</th>
                      <th className="px-4 py-3.5">Phone (WhatsApp)</th>
                      <th className="px-4 py-3.5">Website Audit</th>
                      <th className="px-4 py-3.5">Pitch Angle</th>
                      <th className="px-4 py-3.5">Template Sent?</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={currentUser?.role === 'ADMIN' ? 10 : 9} className="text-center py-14 text-slate-400">
                          No leads found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          {/* Business Name */}
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{lead.businessName}</span>
                              {lead.googleRating && (
                                <span className="flex items-center text-[10px] text-amber-500 font-bold">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-500 inline mr-0.5" />
                                  {lead.googleRating}
                                </span>
                              )}
                            </div>
                            {lead.email && (
                              <div className="text-[10px] text-sky-700 font-mono truncate max-w-[160px]" title={lead.email}>
                                {lead.email}
                              </div>
                            )}
                          </td>

                          {/* Status Selector */}
                          <td className="px-4 py-3">
                            <select
                              value={lead.leadStatus || 'PENDING'}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              disabled={savingLeadId === lead.id}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition ${
                                (lead.leadStatus || 'PENDING') === 'PENDING'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : (lead.leadStatus || 'PENDING') === 'CONTACTED'
                                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                                  : (lead.leadStatus || 'PENDING') === 'DONE'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-purple-50 border-purple-200 text-purple-700'
                              }`}
                            >
                              <option value="PENDING">🟡 Pending</option>
                              <option value="CONTACTED">🔵 Contacted</option>
                              <option value="DONE">🟢 Done</option>
                              <option value="CLOSED">🟣 Closed</option>
                            </select>
                          </td>

                          {/* Remarks / Notes */}
                          <td className="px-4 py-3">
                            {editingRemarkId === lead.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={remarkInput}
                                  onChange={(e) => setRemarkInput(e.target.value)}
                                  placeholder="Add notes..."
                                  className="w-full bg-slate-50 border border-sky-400 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:bg-white"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveLeadRemark(lead.id);
                                    if (e.key === 'Escape') setEditingRemarkId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveLeadRemark(lead.id)}
                                  className="p-1 rounded-lg bg-sky-600 text-white hover:bg-sky-500"
                                  title="Save note"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingRemarkId(lead.id);
                                  setRemarkInput(lead.remarks || '');
                                }}
                                className="group flex items-center justify-between gap-1 p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-xs"
                                title="Click to edit remark"
                              >
                                <span className={lead.remarks ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}>
                                  {lead.remarks || '+ Add notes...'}
                                </span>
                                <Edit3 className="h-3 w-3 text-slate-400 group-hover:text-slate-600 opacity-0 group-hover:opacity-100 shrink-0" />
                              </div>
                            )}
                            {lead.lastUpdatedBy && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Updated by: <span className="text-slate-600 font-medium">{lead.lastUpdatedBy.name}</span>
                              </div>
                            )}
                          </td>

                          {/* Admin Only: Scraped By */}
                          {currentUser?.role === 'ADMIN' && (
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 truncate max-w-[140px]" title={lead.user?.email || 'Unassigned'}>
                                <UserCheck className="h-3 w-3 text-sky-600" />
                                {lead.user?.name || lead.user?.email || 'Unassigned'}
                              </span>
                            </td>
                          )}

                          {/* Niche & Location */}
                          <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">
                            <div className="truncate text-slate-800 font-medium">{lead.category}</div>
                            <div className="text-[10px] text-slate-500 truncate">{lead.city || 'India'}</div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 font-mono font-semibold text-sky-700">
                            {lead.formattedPhone || lead.phoneNumber || 'N/A'}
                          </td>

                          {/* Website Audit */}
                          <td className="px-4 py-3">
                            {lead.hasWebsite ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Globe className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <AlertTriangle className="h-3 w-3" /> None
                              </span>
                            )}
                          </td>

                          {/* Pitch Angle */}
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 truncate max-w-[160px] block">
                              {lead.pitchAngle || 'Web & Digital Presence'}
                            </span>
                          </td>

                          {/* Template Sent */}
                          <td className="px-4 py-3">
                            {lead.isTemplateSent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> SENT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                                <Clock className="h-3 w-3" /> PENDING
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="text-xs text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                            >
                              Inspect Pitch
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <span className="text-slate-900 font-bold">{leads.length > 0 ? (currentPage - 1) * 20 + 1 : 0}</span> to{' '}
                    <span className="text-slate-900 font-bold">
                      {Math.min(currentPage * 20, totalLeadsCount || leads.length)}
                    </span>{' '}
                    of <span className="text-slate-900 font-bold">{totalLeadsCount || leads.length}</span> leads
                  </span>
                  {loading && (
                    <span className="flex items-center gap-1 text-sky-600 text-[11px] font-medium">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Loading...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage > 1) fetchDashboardData(currentPage - 1);
                    }}
                    disabled={currentPage <= 1 || loading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline pr-1">Prev</span>
                  </button>

                  <div className="flex items-center gap-1 px-1 font-mono text-xs font-bold text-slate-800">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage < totalPages) fetchDashboardData(currentPage + 1);
                    }}
                    disabled={currentPage >= totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
                  >
                    <span className="hidden sm:inline pl-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Team & User Management (Admin Only) */}
        {activeTab === 'team' && currentUser?.role === 'ADMIN' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-600" /> Sales Team & User Management
                </h3>
                <p className="text-xs text-slate-500">
                  Create new sales reps or admin users, view lead counts per member, and control team access.
                </p>
              </div>
              <button
                onClick={() => {
                  setUserActionError('');
                  setIsNewUserModalOpen(true);
                }}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-sky-500/20 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" /> Add New User
              </button>
            </div>

            <div className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email Address</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Leads Scraped</th>
                      <th className="px-5 py-3.5">Member Since</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-xs font-black text-sky-700">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          {member.name}
                          {member.id === currentUser?.id && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-bold">You</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">{member.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            member.role === 'ADMIN'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {member.totalScraped} leads
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {member.id !== currentUser?.id ? (
                            <button
                              onClick={() => handleDeleteUser(member.id, member.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Current user</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Sandbox (Admin Only) */}
        {activeTab === 'sandbox' && currentUser?.role === 'ADMIN' && (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-6">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live WhatsApp Message Tester</h3>
                  <p className="text-xs text-slate-500">
                    Send a test template directly to your own verified WhatsApp phone number via CRM API Gateway.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Recipient Phone Number (with country code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9136870930 or 919136870930"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Template to Send</label>
                  <select
                    value={testTemplate}
                    onChange={(e) => setTestTemplate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 font-mono font-medium"
                  >
                    <option value="universal_b2b_web_v2">universal_b2b_web_v2 (Web & App Development)</option>
                    <option value="universal_b2b_crm_intro">universal_b2b_crm_intro (WhatsApp CRM & ERP)</option>
                    <option value="universal_b2b_seo_intro">universal_b2b_seo_intro (Google 3-Pack & SEO)</option>
                  </select>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      testResult.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <button
                  onClick={handleSendTestMessage}
                  disabled={testSending || !testPhone}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm shadow-sky-500/20"
                >
                  {testSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Dispatch Test WhatsApp Template via CRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings (Admin Only) */}
        {activeTab === 'settings' && currentUser?.role === 'ADMIN' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">JISNU CRM Gateway & Automation Configuration</h3>
                  <p className="text-xs text-slate-500">Outreach templates will be synced and logged into your CRM chat history.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    JISNU CRM API Gateway URL
                  </label>
                  <input
                    type="text"
                    value={settings.crmApiUrl}
                    onChange={(e) => setSettings({ ...settings, crmApiUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    JISNU CRM API Secret Key
                  </label>
                  <input
                    type="password"
                    value={settings.crmApiKey}
                    onChange={(e) => setSettings({ ...settings, crmApiKey: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Default Scrape Lead Limit</label>
                    <input
                      type="number"
                      value={settings.globalScrapeLimit}
                      onChange={(e) => setSettings({ ...settings, globalScrapeLimit: parseInt(e.target.value, 10) || 20 })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[10px] text-slate-500">Number of businesses Google Places scrapes per run.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Global Auto-Dispatch Switch</label>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="globalAutoDispatchSettings"
                        checked={settings.globalAutoDispatch}
                        onChange={(e) => setSettings({ ...settings, globalAutoDispatch: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor="globalAutoDispatchSettings" className="text-xs text-slate-700 font-medium cursor-pointer">
                        {settings.globalAutoDispatch ? '🟢 Automatically send templates' : '⚪ Gather data only'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-sky-500/20"
                  >
                    {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New User (Admin Only) */}
        {isNewUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New User</h3>
                    <p className="text-xs text-slate-500">Create a sales rep or administrative account</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {userActionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {userActionError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sales.rep@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 font-medium"
                  >
                    <option value="SALES">SALES REP (Isolated leads view)</option>
                    <option value="ADMIN">ADMIN (Full access to all leads & settings)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewUserModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-sky-500/20"
                  >
                    {creatingUser ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lead Detail & Pitch Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedLead.businessName}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                      {selectedLead.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedLead.city || 'India'}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-sky-700">Phone: {selectedLead.formattedPhone || selectedLead.phoneNumber}</span>
                    {selectedLead.email && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-700 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {selectedLead.email}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {/* Status & Remarks Section inside Modal */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Sales Workflow Status</span>
                  <select
                    value={selectedLead.leadStatus || 'PENDING'}
                    onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                    className="bg-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800 shadow-2xs"
                  >
                    <option value="PENDING">🟡 PENDING</option>
                    <option value="CONTACTED">🔵 CONTACTED</option>
                    <option value="DONE">🟢 DONE</option>
                    <option value="CLOSED">🟣 CLOSED</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">Follow-up Notes / Remarks</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={selectedLead.remarks || ''}
                      placeholder="Add follow-up notes..."
                      id="modalRemarkInput"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      onClick={() => {
                        const inputEl = document.getElementById('modalRemarkInput') as HTMLInputElement;
                        if (inputEl) {
                          setRemarkInput(inputEl.value);
                          handleSaveLeadRemark(selectedLead.id);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Assigned Meta Template Card */}
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2 text-xs">
                <div className="font-bold text-sky-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5" /> Assigned Meta Template To Send:
                  </span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded-full text-[11px] text-sky-800 border border-sky-200 font-bold">
                    {selectedLead.assignedTemplate || 'universal_b2b_web_v2'}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  <strong>Pitch Strategy:</strong> {selectedLead.pitchAngle || selectedLead.pitchCategory}
                </div>
              </div>

              {/* Digital Audit Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-sky-600" /> Digital Footprint Audit:
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{selectedLead.auditSummary}</p>
              </div>

              {/* Generated Custom Pitch Script */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-bold text-sky-700 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Tailored Pitch Script (For Sales Follow-up):
                </div>
                <div className="text-slate-700 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200 font-sans text-xs leading-relaxed max-h-36 overflow-y-auto">
                  {selectedLead.personalizedPitch || 'No pitch copy generated.'}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSendSingleTemplate(selectedLead)}
                  disabled={sendingSingleLead}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white transition cursor-pointer shadow-sm shadow-sky-500/20"
                >
                  {sendingSingleLead ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Dispatching...
                    </>
                  ) : selectedLead.isTemplateSent ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" /> Resend Template via CRM
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Send Template via CRM
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Export Leads */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Export Qualified Leads</h3>
                    <p className="text-xs text-slate-500">
                      Select custom fields, configure time ranges, and download your export file.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Time Range Selector */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-sky-600" />
                    Time Range Filter
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: 'today', label: 'Today Only' },
                      { id: '7days', label: 'Past 7 Days' },
                      { id: '30days', label: 'Past 30 Days' },
                      { id: 'custom', label: 'Custom Range' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setExportDateRange(t.id as any)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                          exportDateRange === t.id
                            ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {exportDateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-600 font-bold block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 font-bold block mb-1">End Date</label>
                        <input
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dispatch Status Filter & Export Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-sky-600" />
                      Status Filter
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 'all', label: 'All Leads' },
                        { id: 'sent', label: 'Sent Only' },
                        { id: 'pending', label: 'Pending' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setExportTemplateFilter(s.id as any)}
                          className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold border transition ${
                            exportTemplateFilter === s.id
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5 text-sky-600" />
                      File Format
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 'csv', label: 'CSV (Excel / Sheets)' },
                        { id: 'json', label: 'JSON (Raw Data)' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setExportFormat(fmt.id as any)}
                          className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold border transition ${
                            exportFormat === fmt.id
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column Selection */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
                      Select Columns ({selectedFields.length}/{availableExportFields.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllFields}
                        className="text-[11px] text-sky-600 hover:text-sky-800 font-bold underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={deselectAllFields}
                        className="text-[11px] text-slate-500 hover:text-slate-700 font-bold underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {availableExportFields.map((field) => {
                      const isChecked = selectedFields.includes(field.key);
                      return (
                        <div
                          key={field.key}
                          onClick={() => toggleExportField(field.key)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 select-none transition ${
                            isChecked
                              ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-sky-600 shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{field.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    matchingLeadsCount > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {matchingLeadsCount} matching lead{matchingLeadsCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteExport}
                    disabled={matchingLeadsCount === 0}
                    className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm shadow-sky-500/20 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Download {exportFormat.toUpperCase()} ({matchingLeadsCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
