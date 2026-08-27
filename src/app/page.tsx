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
} from 'lucide-react';

interface Lead {
  id: string;
  businessName: string;
  category: string;
  city: string;
  phoneNumber: string;
  formattedPhone: string;
  websiteUrl?: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'sandbox' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [runningAutopilot, setRunningAutopilot] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalAudited: 0,
    totalSent: 0,
    totalPending: 0,
  });

  // Global Controls State
  const [settings, setSettings] = useState({
    globalAutoDispatch: false,
    globalScrapeLimit: 20,
    crmApiUrl: 'https://crmapi.jisnudigital.com/api/v1/whatsapp/send-template',
    crmApiKey: 'ak_live_bb3a202dc4c32629a10ebb3a2c3f86a4',
  });
  const [savingSettings, setSavingSettings] = useState(false);

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

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
        setStats(data.data.stats || { totalLeads: 0, totalAudited: 0, totalSent: 0, totalPending: 0 });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setCustomScrapeLimit(data.data.globalScrapeLimit || 20);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSettings();
  }, []);

  // Quick Toggle Global Auto-Dispatch Directly from Header
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

  // Trigger Pipeline
  const handleTriggerAutopilot = async (isManual: boolean = false) => {
    try {
      setRunningAutopilot(true);
      setPipelineLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 Initiating ${isManual ? 'Custom Targeted' : 'Autonomous AI'} Discovery...`,
        `[${new Date().toLocaleTimeString()}] ⚙️ Global Auto-Dispatch is ${settings.globalAutoDispatch ? '🟢 ON (Will send templates automatically)' : '⚪ OFF (Gather data only)'}`,
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
        await fetchDashboardData();
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

  // Send Template to Individual Lead (Lead CRM Table Modal)
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
        await fetchDashboardData();
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

  // Quick Sandbox Test
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

  // Save Settings
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
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/70 backdrop-blur-md flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                OutreachAI <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">CRM</span>
              </h1>
              <p className="text-xs text-slate-400">JISNU Outreach Engine</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="h-4 w-4" />
              Command Center
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Lead CRM & Audits
              {leads.length > 0 && (
                <span className="ml-auto text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {leads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sandbox')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp Sandbox
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="h-4 w-4" />
              Settings & CRM Gateway
            </button>
          </nav>
        </div>

        {/* Global Dispatch Status Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Auto-Dispatch</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${settings.globalAutoDispatch ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {settings.globalAutoDispatch ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>CRM Sync</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live API
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Scrape Batch</span>
            <span className="text-slate-300 font-mono font-medium">{settings.globalScrapeLimit} Leads</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Top App Header with Global Auto-Dispatch Switch */}
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-white capitalize">
              {activeTab === 'overview' && 'Autonomous Command Center'}
              {activeTab === 'leads' && 'Qualified Business Leads & Digital Audits'}
              {activeTab === 'sandbox' && 'WhatsApp Dispatch Sandbox'}
              {activeTab === 'settings' && 'System Configuration & CRM API Gateway'}
            </h2>
            <p className="text-xs text-slate-400">
              AI Market Selection • Google Places Scraper • Digital Audit • Meta CRM Dispatch
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Auto Dispatch Switch */}
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
                Global Auto-Dispatch
              </label>
            </div>

            <button
              onClick={fetchDashboardData}
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
                  Running Pipeline...
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Total Leads Discovered</span>
                  <Search className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalLeads}</div>
                <div className="text-[11px] text-slate-500 mt-1">Sourced via Google Places</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Digital Audits Completed</span>
                  <Globe className="h-4 w-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalAudited}</div>
                <div className="text-[11px] text-slate-500 mt-1">Web & CRM footprint analyzed</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Templates Dispatched</span>
                  <Send className="h-4 w-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalSent}</div>
                <div className="text-[11px] text-slate-500 mt-1">Logged in CRM Chat History</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Pending Send (In CRM)</span>
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalPending}</div>
                <div className="text-[11px] text-slate-500 mt-1">Audited & Ready for 1-Click Send</div>
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
                    Target a specific business niche & micro-locality (or click <strong>Launch Daily Autopilot</strong> to let AI discover a new Pan-India market).
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Target Niche / Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Modular Kitchen Showrooms, Cosmetic Clinics"
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Target Micro-Locality / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Lokhandwala Andheri West, Kalyani Nagar Pune"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Max Leads to Scrape (Lead Count Limit)</label>
                      <input
                        type="number"
                        value={customScrapeLimit}
                        onChange={(e) => setCustomScrapeLimit(parseInt(e.target.value, 10) || 20)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold block">Auto-Dispatch Templates:</span>
                        <span className="text-[11px] text-slate-500">
                          {settings.globalAutoDispatch ? '🟢 Templates will be sent via CRM immediately' : '⚪ Leads will only be saved in table (zero sends)'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${settings.globalAutoDispatch ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {settings.globalAutoDispatch ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTriggerAutopilot(true)}
                      disabled={runningAutopilot}
                      className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2"
                    >
                      {runningAutopilot ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Execute Target Discovery
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Realtime Activity Logs */}
              <div className="lg:col-span-7">
                <div className="h-full min-h-[380px] p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
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

        {/* Tab 2: Lead CRM Table & Audit Inspector */}
        {activeTab === 'leads' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Qualified Business Leads</h3>
                <p className="text-xs text-slate-400">
                  Inspect digital audit diagnosis, view the assigned Meta template, and dispatch 1-click pitches.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Showing {leads.length} records</span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Business Name</th>
                      <th className="px-4 py-3">Niche</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Phone (WhatsApp)</th>
                      <th className="px-4 py-3">Website</th>
                      <th className="px-4 py-3">Assigned Meta Template</th>
                      <th className="px-4 py-3">Template Sent?</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-500">
                          No leads discovered yet. Run the Autopilot engine to populate leads!
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-slate-800/40 cursor-pointer transition"
                        >
                          <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                            {lead.businessName}
                            {lead.googleRating && (
                              <span className="flex items-center text-[10px] text-amber-400 font-normal">
                                <Star className="h-3 w-3 fill-amber-400 inline mr-0.5" />
                                {lead.googleRating}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 truncate max-w-[130px]">{lead.category}</td>
                          <td className="px-4 py-3 text-slate-400 truncate max-w-[120px]">{lead.city || 'India'}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{lead.formattedPhone || lead.phoneNumber || 'N/A'}</td>
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
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {lead.assignedTemplate || 'universal_b2b_web_v2'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {lead.isTemplateSent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" /> SENT (IN CRM)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                <Clock className="h-3 w-3" /> PENDING
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                              }}
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
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
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
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {testSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Dispatch Test WhatsApp Template via CRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
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
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2"
                  >
                    {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Detail & Pitch Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedLead.businessName}
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedLead.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {selectedLead.city || 'India'} • Phone: {selectedLead.formattedPhone || selectedLead.phoneNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold px-2"
                >
                  ✕
                </button>
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
                <div className="text-slate-400 text-[10px]">
                  <strong>Status:</strong> {selectedLead.isTemplateSent ? '✅ Template already sent to lead' : '⏳ Pending send (1-click send available below)'}
                </div>
              </div>

              {/* Digital Audit Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-teal-400" /> Digital Footprint Audit:
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{selectedLead.auditSummary}</p>
              </div>

              {/* Generated Custom Pitch Script (For Sales Reps) */}
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
                  disabled={sendingSingleLead || selectedLead.isTemplateSent}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    selectedLead.isTemplateSent
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {sendingSingleLead ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Dispatching...
                    </>
                  ) : selectedLead.isTemplateSent ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Template Sent
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
      </main>
    </div>
  );
}
