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

  // Render Status Badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'CONTACTED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">CONTACTED</span>;
      case 'DONE':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">DONE</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">CLOSED</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">PENDING</span>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Sidebar Drawer */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between p-3 shrink-0 z-20`}
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="flex items-center justify-between px-1 py-3 mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Zap className="h-6 w-6 text-slate-950 font-bold" />
              </div>
              {isSidebarOpen && (
                <div className="truncate">
                  <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                    OutreachAI <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">CRM</span>
                  </h1>
                  <p className="text-[11px] text-slate-400 truncate">Pan-India Sales Engine</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {/* 1. Command Center (Visible to ALL) */}
            <button
              onClick={() => setActiveTab('overview')}
              title={!isSidebarOpen ? 'Command Center' : undefined}
              className={`w-full flex items-center ${
                isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
              } py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="h-4 w-4 shrink-0" />
              {isSidebarOpen && <span className="truncate">Command Center</span>}
            </button>

            {/* 2. Leads CRM (Visible to ALL) */}
            <button
              onClick={() => setActiveTab('leads')}
              title={!isSidebarOpen ? 'Lead CRM & Audits' : undefined}
              className={`w-full flex items-center ${
                isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
              } py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="truncate">Lead CRM & Audits</span>
                  {leads.length > 0 && (
                    <span className="ml-auto text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                      {leads.length}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* ADMIN ONLY TABS */}
            {currentUser?.role === 'ADMIN' && (
              <>
                <div className="pt-2 pb-1">
                  {isSidebarOpen && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                      Admin Portal
                    </span>
                  )}
                </div>

                {/* 3. Team Management */}
                <button
                  onClick={() => setActiveTab('team')}
                  title={!isSidebarOpen ? 'Team & Users' : undefined}
                  className={`w-full flex items-center ${
                    isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
                  } py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'team'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">Team & Users</span>}
                </button>

                {/* 4. WhatsApp Sandbox */}
                <button
                  onClick={() => setActiveTab('sandbox')}
                  title={!isSidebarOpen ? 'WhatsApp Sandbox' : undefined}
                  className={`w-full flex items-center ${
                    isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
                  } py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'sandbox'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">WhatsApp Sandbox</span>}
                </button>

                {/* 5. Settings */}
                <button
                  onClick={() => setActiveTab('settings')}
                  title={!isSidebarOpen ? 'Settings & CRM Gateway' : undefined}
                  className={`w-full flex items-center ${
                    isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
                  } py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'settings'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Sliders className="h-4 w-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">Settings & Gateway</span>}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="pt-3 border-t border-slate-800/80">
          {isSidebarOpen ? (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="font-semibold text-white truncate flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentUser?.name || 'Sales Rep'}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                    currentUser?.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {currentUser?.role || 'SALES'}
                  </span>
                  <span className="truncate">{currentUser?.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-w-0">
        {/* Top App Header */}
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Open Sidebar"
              >
                <PanelLeft className="h-4 w-4 text-emerald-400" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-white capitalize">
                {activeTab === 'overview' && 'Autonomous Command Center'}
                {activeTab === 'leads' && (currentUser?.role === 'ADMIN' ? 'All Team Leads & Digital Audits' : 'My Scraped Leads & Outreach Pipeline')}
                {activeTab === 'team' && 'Team & User Management (Admin)'}
                {activeTab === 'sandbox' && 'WhatsApp Dispatch Sandbox'}
                {activeTab === 'settings' && 'System Configuration & CRM API Gateway'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser?.role === 'ADMIN' ? '👑 Admin Mode: Full Team Oversight & Control' : `Sales Rep: ${currentUser?.name || currentUser?.email}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto Dispatch Switch (Admin Only) */}
            {currentUser?.role === 'ADMIN' && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                <input
                  type="checkbox"
                  id="globalAutoDispatchHeader"
                  checked={settings.globalAutoDispatch}
                  onChange={(e) => handleToggleGlobalAutoDispatch(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                />
                <label htmlFor="globalAutoDispatchHeader" className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5">
                  <Send className="h-3 w-3 text-emerald-400" />
                  Auto-Dispatch
                </label>
              </div>
            )}

            <button
              onClick={() => fetchDashboardData(currentPage)}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => handleTriggerAutopilot(false)}
              disabled={runningAutopilot}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg ${
                runningAutopilot
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {runningAutopilot ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scraping Leads...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Launch Daily Autopilot
                </>
              )}
            </button>
          </div>
        </header>

        {/* Tab 1: Overview / Command Center */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{currentUser?.role === 'ADMIN' ? 'Total Leads in System' : 'My Scraped Leads'}</span>
                  <Search className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalLeads}</div>
                <div className="text-[11px] text-slate-500 mt-1">Sourced via Google Places</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Leads Pending Contact</span>
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalPending}</div>
                <div className="text-[11px] text-slate-500 mt-1">Waiting for initial outreach</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Contacted / In Progress</span>
                  <Send className="h-4 w-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalContacted}</div>
                <div className="text-[11px] text-slate-500 mt-1">Outreach message sent</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Deals Closed</span>
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalClosed}</div>
                <div className="text-[11px] text-slate-500 mt-1">Successfully converted leads</div>
              </div>
            </div>

            {/* Run Controller & Realtime Activity Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Targeted Run Controller */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Manual / Custom Campaign Trigger</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Target a specific business niche & locality. Scraped leads will automatically be tagged as owned by <strong>{currentUser?.name || currentUser?.email}</strong>.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Target Niche / Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Interior Designers, Cafes, Dental Clinics"
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Target City / Locality</label>
                      <input
                        type="text"
                        placeholder="e.g. Indiranagar Bangalore, Andheri West Mumbai"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Scrape Volume Limit</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={customScrapeLimit}
                        onChange={(e) => setCustomScrapeLimit(parseInt(e.target.value, 10) || 20)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <button
                      onClick={() => handleTriggerAutopilot(true)}
                      disabled={runningAutopilot || !customNiche.trim() || !customLocation.trim()}
                      className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {runningAutopilot ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Start Custom Scraping Run
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Terminal */}
              <div className="lg:col-span-7">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 h-[380px] flex flex-col shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h3 className="text-sm font-semibold text-white">Live Pipeline Execution Logs</h3>
                    </div>
                    <span className="text-[11px] text-slate-500">Auto-updating</span>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 font-mono text-xs text-slate-300">
                    {pipelineLogs.length === 0 ? (
                      <div className="text-slate-600 text-center py-16">
                        No active run in progress. Click &quot;Launch Daily Autopilot&quot; to begin.
                      </div>
                    ) : (
                      pipelineLogs.map((log, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
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
          <div className="p-6 space-y-4">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {currentUser?.role === 'ADMIN' ? 'All Team Scraped Leads' : 'My Scraped Leads & Notes'}
                </h3>
                <p className="text-xs text-slate-400">
                  Manage lead status, track follow-up remarks, and inspect digital audits.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Admin Sales Rep Selector */}
                {currentUser?.role === 'ADMIN' && (
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-slate-400 font-medium">Rep:</span>
                    <select
                      value={adminUserFilter}
                      onChange={(e) => {
                        setAdminUserFilter(e.target.value);
                        fetchDashboardData(1, leadStatusFilter, e.target.value);
                      }}
                      className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-slate-900">All Team Members</option>
                      {teamMembers.map((tm) => (
                        <option key={tm.id} value={tm.id} className="bg-slate-900">
                          {tm.name} ({tm.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setLeadStatusFilter(newStatus);
                      fetchDashboardData(1, newStatus, adminUserFilter);
                    }}
                    className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900">All Statuses</option>
                    <option value="PENDING" className="bg-slate-900">🟡 Pending</option>
                    <option value="CONTACTED" className="bg-slate-900">🔵 Contacted</option>
                    <option value="DONE" className="bg-slate-900">🟢 Done</option>
                    <option value="CLOSED" className="bg-slate-900">🟣 Closed</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={leads.length === 0}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Export Leads
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Business Name</th>
                      <th className="px-4 py-3">Sales Status</th>
                      <th className="px-4 py-3 min-w-[200px]">Remarks / Notes</th>
                      {currentUser?.role === 'ADMIN' && <th className="px-4 py-3">Scraped By</th>}
                      <th className="px-4 py-3">Niche & Locality</th>
                      <th className="px-4 py-3">Phone (WhatsApp)</th>
                      <th className="px-4 py-3">Website Audit</th>
                      <th className="px-4 py-3">Pitch Angle</th>
                      <th className="px-4 py-3">Template Sent?</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={currentUser?.role === 'ADMIN' ? 10 : 9} className="text-center py-12 text-slate-500">
                          No leads found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-800/40 transition"
                        >
                          {/* Business Name */}
                          <td className="px-4 py-3 font-medium text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{lead.businessName}</span>
                              {lead.googleRating && (
                                <span className="flex items-center text-[10px] text-amber-400 font-normal">
                                  <Star className="h-3 w-3 fill-amber-400 inline mr-0.5" />
                                  {lead.googleRating}
                                </span>
                              )}
                            </div>
                            {lead.email && (
                              <div className="text-[10px] text-sky-400 font-mono truncate max-w-[160px]" title={lead.email}>
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
                              className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition ${
                                (lead.leadStatus || 'PENDING') === 'PENDING'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  : (lead.leadStatus || 'PENDING') === 'CONTACTED'
                                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                                  : (lead.leadStatus || 'PENDING') === 'DONE'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                              }`}
                            >
                              <option value="PENDING" className="bg-slate-900 text-amber-300">🟡 Pending</option>
                              <option value="CONTACTED" className="bg-slate-900 text-sky-300">🔵 Contacted</option>
                              <option value="DONE" className="bg-slate-900 text-emerald-300">🟢 Done</option>
                              <option value="CLOSED" className="bg-slate-900 text-purple-300">🟣 Closed</option>
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
                                  className="w-full bg-slate-950 border border-emerald-500/50 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveLeadRemark(lead.id);
                                    if (e.key === 'Escape') setEditingRemarkId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveLeadRemark(lead.id)}
                                  className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
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
                                className="group flex items-center justify-between gap-1 p-1 rounded hover:bg-slate-800/80 cursor-pointer text-xs"
                                title="Click to edit remark"
                              >
                                <span className={lead.remarks ? 'text-slate-200' : 'text-slate-500 italic'}>
                                  {lead.remarks || '+ Add notes...'}
                                </span>
                                <Edit3 className="h-3 w-3 text-slate-600 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
                              </div>
                            )}
                            {lead.lastUpdatedBy && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Updated by: <span className="text-slate-400">{lead.lastUpdatedBy.name}</span>
                              </div>
                            )}
                          </td>

                          {/* Admin Only: Scraped By */}
                          {currentUser?.role === 'ADMIN' && (
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate max-w-[140px]" title={lead.user?.email || 'Unassigned'}>
                                <UserCheck className="h-3 w-3 text-emerald-400" />
                                {lead.user?.name || lead.user?.email || 'Unassigned'}
                              </span>
                            </td>
                          )}

                          {/* Niche & Location */}
                          <td className="px-4 py-3 text-slate-400 truncate max-w-[150px]">
                            <div className="truncate text-slate-300">{lead.category}</div>
                            <div className="text-[10px] text-slate-500 truncate">{lead.city || 'India'}</div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 font-mono text-emerald-400">
                            {lead.formattedPhone || lead.phoneNumber || 'N/A'}
                          </td>

                          {/* Website Audit */}
                          <td className="px-4 py-3">
                            {lead.hasWebsite ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <Globe className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                <AlertTriangle className="h-3 w-3" /> None
                              </span>
                            )}
                          </td>

                          {/* Pitch Angle */}
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[160px] block">
                              {lead.pitchAngle || 'Web & Digital Presence'}
                            </span>
                          </td>

                          {/* Template Sent */}
                          <td className="px-4 py-3">
                            {lead.isTemplateSent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" /> SENT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                <Clock className="h-3 w-3" /> PENDING
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
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
              <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <span className="text-white font-semibold">{leads.length > 0 ? (currentPage - 1) * 20 + 1 : 0}</span> to{' '}
                    <span className="text-white font-semibold">
                      {Math.min(currentPage * 20, totalLeadsCount || leads.length)}
                    </span>{' '}
                    of <span className="text-white font-semibold">{totalLeadsCount || leads.length}</span> leads
                  </span>
                  {loading && (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
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
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline pr-1">Prev</span>
                  </button>

                  <div className="flex items-center gap-1 px-1 font-mono text-xs">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage < totalPages) fetchDashboardData(currentPage + 1);
                    }}
                    disabled={currentPage >= totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
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
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" /> Sales Team & User Management
                </h3>
                <p className="text-xs text-slate-400">
                  Create new sales reps or admin users, view lead counts per member, and control team access.
                </p>
              </div>
              <button
                onClick={() => {
                  setUserActionError('');
                  setIsNewUserModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" /> Add New User
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email Address</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Leads Scraped</th>
                    <th className="px-5 py-3.5">Member Since</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">You</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-300">{member.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          member.role === 'ADMIN'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-white">
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {member.totalScraped} leads
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {member.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDeleteUser(member.id, member.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs italic">Current user</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Sandbox (Admin Only) */}
        {activeTab === 'sandbox' && currentUser?.role === 'ADMIN' && (
          <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Live WhatsApp Message Tester</h3>
                  <p className="text-xs text-slate-400">
                    Send a test template directly to your own verified WhatsApp phone number via CRM API Gateway.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Recipient Phone Number (with country code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9136870930 or 919136870930"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Template to Send</label>
                  <select
                    value={testTemplate}
                    onChange={(e) => setTestTemplate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="universal_b2b_web_v2">universal_b2b_web_v2 (Web & App Development)</option>
                    <option value="universal_b2b_crm_intro">universal_b2b_crm_intro (WhatsApp CRM & ERP)</option>
                    <option value="universal_b2b_seo_intro">universal_b2b_seo_intro (Google 3-Pack & SEO)</option>
                  </select>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      testResult.success
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <button
                  onClick={handleSendTestMessage}
                  disabled={testSending || !testPhone}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <KeyRound className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">JISNU CRM Gateway & Global Automation Settings</h3>
                  <p className="text-xs text-slate-400">All outbound outreach templates are routed and logged into your CRM chat history.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    JISNU CRM API Gateway URL
                  </label>
                  <input
                    type="text"
                    value={settings.crmApiUrl}
                    onChange={(e) => setSettings({ ...settings, crmApiUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    JISNU CRM API Secret Key
                  </label>
                  <input
                    type="password"
                    value={settings.crmApiKey}
                    onChange={(e) => setSettings({ ...settings, crmApiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200 block">Default Scrape Lead Limit</label>
                    <input
                      type="number"
                      value={settings.globalScrapeLimit}
                      onChange={(e) => setSettings({ ...settings, globalScrapeLimit: parseInt(e.target.value, 10) || 20 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                    <p className="text-[10px] text-slate-500">Number of businesses Google Places scrapes per run.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200 block">Global Auto-Dispatch Switch</label>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="globalAutoDispatchSettings"
                        checked={settings.globalAutoDispatch}
                        onChange={(e) => setSettings({ ...settings, globalAutoDispatch: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                      />
                      <label htmlFor="globalAutoDispatchSettings" className="text-xs text-slate-300 cursor-pointer">
                        {settings.globalAutoDispatch ? '🟢 Automatically send templates' : '⚪ Gather data only'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Add New User</h3>
                    <p className="text-xs text-slate-400">Create a sales rep or administrative account</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {userActionError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {userActionError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sales.rep@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SALES">SALES REP (Isolated leads view)</option>
                    <option value="ADMIN">ADMIN (Full access to all leads & settings)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewUserModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedLead.businessName}
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedLead.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedLead.city || 'India'}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">Phone: {selectedLead.formattedPhone || selectedLead.phoneNumber}</span>
                    {selectedLead.email && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-sky-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {selectedLead.email}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {/* Status & Remarks Section inside Modal */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Sales Workflow Status</span>
                  <select
                    value={selectedLead.leadStatus || 'PENDING'}
                    onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                    className="bg-slate-900 text-xs font-semibold px-2.5 py-1 rounded border border-slate-700 text-slate-200"
                  >
                    <option value="PENDING">🟡 PENDING</option>
                    <option value="CONTACTED">🔵 CONTACTED</option>
                    <option value="DONE">🟢 DONE</option>
                    <option value="CLOSED">🟣 CLOSED</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Follow-up Notes / Remarks</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={selectedLead.remarks || ''}
                      placeholder="Add follow-up notes..."
                      id="modalRemarkInput"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        const inputEl = document.getElementById('modalRemarkInput') as HTMLInputElement;
                        if (inputEl) {
                          setRemarkInput(inputEl.value);
                          handleSaveLeadRemark(selectedLead.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded hover:bg-emerald-400"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Assigned Meta Template Card */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 text-xs">
                <div className="font-semibold text-indigo-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5" /> Assigned Meta Template To Send:
                  </span>
                  <span className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded text-[11px] text-indigo-200">
                    {selectedLead.assignedTemplate || 'universal_b2b_web_v2'}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  <strong>Pitch Strategy:</strong> {selectedLead.pitchAngle || selectedLead.pitchCategory}
                </div>
              </div>

              {/* Digital Audit Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-teal-400" /> Digital Footprint Audit:
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{selectedLead.auditSummary}</p>
              </div>

              {/* Generated Custom Pitch Script */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Tailored Pitch Script (For Sales Follow-up):
                </div>
                <div className="text-slate-300 whitespace-pre-line bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-sans text-xs leading-relaxed max-h-36 overflow-y-auto">
                  {selectedLead.personalizedPitch || 'No pitch copy generated.'}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSendSingleTemplate(selectedLead)}
                  disabled={sendingSingleLead}
                  className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Export Qualified Leads</h3>
                    <p className="text-xs text-slate-400">
                      Select custom fields, configure time ranges, and download your export file.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Time Range Selector */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
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
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                          exportDateRange === t.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {exportDateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
                        <input
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dispatch Status Filter & Export Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-emerald-400" />
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
                          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition ${
                            exportTemplateFilter === s.id
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5 text-sky-400" />
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
                          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium border transition ${
                            exportFormat === fmt.id
                              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column Selection */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
                      Select Columns ({selectedFields.length}/{availableExportFields.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllFields}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={deselectAllFields}
                        className="text-[11px] text-slate-400 hover:text-slate-300 underline"
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
                          className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-2.5 select-none transition ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{field.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                    matchingLeadsCount > 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {matchingLeadsCount} matching lead{matchingLeadsCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteExport}
                    disabled={matchingLeadsCount === 0}
                    className="px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 shadow-md shadow-emerald-500/20 transition cursor-pointer"
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
