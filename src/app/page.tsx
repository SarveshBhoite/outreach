'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
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
  ExternalLink,
  Building2,
  MapPin,
  Star,
  Activity,
  Layers,
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
  personalizedPitch: string;
  pitchAngle: string;
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
    totalDelivered: 0,
    totalReplied: 0,
  });

  // Autopilot Runner Inputs
  const [customNiche, setCustomNiche] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Quick Sandbox Test
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test verified outreach message from OutreachAI.');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Settings
  const [settings, setSettings] = useState({
    autopilotEnabled: false,
    dailyLeadLimit: 25,
    sendDelaySecondsMin: 30,
    sendDelaySecondsMax: 90,
    activeWhatsAppProvider: 'META_CLOUD_API',
    customCrmUrl: '',
    customCrmKey: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch Leads & Stats
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
        setStats(data.data.stats || { totalLeads: 0, totalAudited: 0, totalSent: 0, totalDelivered: 0, totalReplied: 0 });
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
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSettings();
  }, []);

  // Trigger Autopilot
  const handleTriggerAutopilot = async () => {
    try {
      setRunningAutopilot(true);
      setPipelineLogs([`[${new Date().toLocaleTimeString()}] 🚀 Triggering autonomous pipeline...`]);

      const res = await fetch('/api/autopilot/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customNiche: customNiche.trim() || undefined,
          customLocation: customLocation.trim() || undefined,
          autoDispatch: autoDispatch,
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

  // Quick Test Dispatch
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
          message: testMessage,
          provider: settings.activeWhatsAppProvider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Message dispatched successfully! (ID: ${data.data?.messageId || 'OK'})` });
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
        alert('Settings updated successfully!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                OutreachAI <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">PRO</span>
              </h1>
              <p className="text-xs text-slate-400">B2B Autopilot Engine</p>
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
              Settings & Provider
            </button>
          </nav>
        </div>

        {/* Status Widget */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>WhatsApp Engine</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Meta Active
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Database</span>
            <span className="text-slate-300 font-medium">Neon Postgres</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Places API</span>
            <span className="text-slate-300 font-medium">Verified</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Top App Header */}
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-base font-semibold text-white capitalize">
              {activeTab === 'overview' && 'Autonomous Command Center'}
              {activeTab === 'leads' && 'Qualified Business Leads & Digital Audits'}
              {activeTab === 'sandbox' && 'WhatsApp Dispatch Sandbox'}
              {activeTab === 'settings' && 'System Configuration & Provider Keys'}
            </h2>
            <p className="text-xs text-slate-400">
              AI Market Selection • Google Places Scraping • Digital Footprint Audit • Meta WhatsApp
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleTriggerAutopilot}
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
            {/* Metric Cards */}
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
                <div className="text-[11px] text-slate-500 mt-1">Web, SSL, & SEO analyzed</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">WhatsApp Pitches Sent</span>
                  <Send className="h-4 w-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalSent}</div>
                <div className="text-[11px] text-slate-500 mt-1">Dispatched via Meta Cloud API</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Active Responses</span>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{stats.totalReplied}</div>
                <div className="text-[11px] text-slate-500 mt-1">Interested business owners</div>
              </div>
            </div>

            {/* Two Column Layout: Run Controller & Live Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Targeted Run Controller */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Manual / Custom Campaign Trigger</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Leave blank to let the <strong>AI Strategy Engine</strong> autonomously choose today&apos;s most lucrative niche & location, or specify your own target below:
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Target Niche / Category (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Dental Clinics, Luxury Interior Designers"
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Target City / Area (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Bandra Mumbai, Indiranagar Bangalore"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="autoDispatch"
                        checked={autoDispatch}
                        onChange={(e) => setAutoDispatch(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400"
                      />
                      <label htmlFor="autoDispatch" className="text-xs text-slate-300 cursor-pointer">
                        Auto-dispatch WhatsApp pitches immediately upon audit
                      </label>
                    </div>

                    <button
                      onClick={handleTriggerAutopilot}
                      disabled={runningAutopilot}
                      className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2"
                    >
                      {runningAutopilot ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Execute Target Discovery
                    </button>
                  </div>
                </div>

                {/* Workflow Architecture Snapshot */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    How The Pipeline Works
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-slate-800 text-emerald-400 rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span><strong>AI Strategy</strong> picks high-ticket niches & affluent geographic areas.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-slate-800 text-emerald-400 rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span><strong>Google Places API</strong> extracts verified phone numbers, websites, & reviews.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-slate-800 text-emerald-400 rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span><strong>Footprint Auditor</strong> checks SSL, speed, and whether to pitch Web/App vs SEO/CRM.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-slate-800 text-emerald-400 rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">4</span>
                    <span><strong>Gemini AI</strong> generates bespoke pitch copy and sends via <strong>Meta WhatsApp Cloud API</strong>.</span>
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
                <h3 className="text-sm font-semibold text-white">Discovered Business Leads</h3>
                <p className="text-xs text-slate-400">Click on any business to inspect their digital footprint audit and generated pitch.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Showing {leads.length} records</span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Business Name</th>
                      <th className="px-4 py-3">Niche / Category</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">WhatsApp / Phone</th>
                      <th className="px-4 py-3">Website Status</th>
                      <th className="px-4 py-3">Pitch Angle</th>
                      <th className="px-4 py-3">Outreach Status</th>
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
                          <td className="px-4 py-3 text-slate-400 truncate max-w-[140px]">{lead.category}</td>
                          <td className="px-4 py-3 text-slate-400">{lead.city || 'India'}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{lead.formattedPhone || lead.phoneNumber || 'N/A'}</td>
                          <td className="px-4 py-3">
                            {lead.hasWebsite ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <Globe className="h-3 w-3" /> Active Site
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                <AlertTriangle className="h-3 w-3" /> No Website
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {lead.pitchAngle || lead.pitchCategory}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                lead.status === 'SENT'
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                  : lead.status === 'REPLIED'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {lead.status}
                            </span>
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

        {/* Tab 3: WhatsApp Sandbox Test */}
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
                    Send a test template or message directly to your own verified WhatsApp phone number.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Recipient Phone Number (with or without +91)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210 or +919876543210"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
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
                  Dispatch Test WhatsApp Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings & Provider Configuration */}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <Sliders className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">System Settings & Provider Switching</h3>
                  <p className="text-xs text-slate-400">Configure your daily limits, delays, and custom CRM integration.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Active WhatsApp Dispatch Provider
                  </label>
                  <select
                    value={settings.activeWhatsAppProvider}
                    onChange={(e) => setSettings({ ...settings, activeWhatsAppProvider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="META_CLOUD_API">Official Meta WhatsApp Cloud API (Connected & Verified)</option>
                    <option value="CUSTOM_CRM">Custom External CRM API / Webhook</option>
                  </select>
                </div>

                {settings.activeWhatsAppProvider === 'CUSTOM_CRM' && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-indigo-400">Custom CRM API Credentials</h4>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CRM WhatsApp Endpoint URL</label>
                      <input
                        type="text"
                        placeholder="https://your-crm.com/api/v1/whatsapp/send"
                        value={settings.customCrmUrl || ''}
                        onChange={(e) => setSettings({ ...settings, customCrmUrl: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CRM API Key</label>
                      <input
                        type="password"
                        placeholder="crm_secret_key_..."
                        value={settings.customCrmKey || ''}
                        onChange={(e) => setSettings({ ...settings, customCrmKey: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Daily Max Leads Limit</label>
                    <input
                      type="number"
                      value={settings.dailyLeadLimit}
                      onChange={(e) => setSettings({ ...settings, dailyLeadLimit: parseInt(e.target.value) || 25 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Delay Between Messages (Seconds)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min (30)"
                        value={settings.sendDelaySecondsMin}
                        onChange={(e) => setSettings({ ...settings, sendDelaySecondsMin: parseInt(e.target.value) || 30 })}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      />
                      <span className="text-xs text-slate-500">to</span>
                      <input
                        type="number"
                        placeholder="Max (90)"
                        value={settings.sendDelaySecondsMax}
                        onChange={(e) => setSettings({ ...settings, sendDelaySecondsMax: parseInt(e.target.value) || 90 })}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      />
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

              {/* Digital Audit Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-teal-400" /> Digital Footprint Audit:
                </div>
                <p className="text-slate-400 leading-relaxed">{selectedLead.auditSummary}</p>
                <div className="flex gap-2 pt-1">
                  <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                    Website: {selectedLead.hasWebsite ? 'Yes' : 'None'}
                  </span>
                  <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                    Pitch Bucket: {selectedLead.pitchAngle || selectedLead.pitchCategory}
                  </span>
                </div>
              </div>

              {/* AI Pitch Message Preview */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Generated WhatsApp Pitch Copy:
                </div>
                <div className="text-slate-200 whitespace-pre-line bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-sans text-xs leading-relaxed">
                  {selectedLead.personalizedPitch || 'No pitch copy generated yet.'}
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
                  onClick={async () => {
                    if (selectedLead.formattedPhone) {
                      await fetch('/api/whatsapp/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          phoneNumber: selectedLead.formattedPhone,
                          message: selectedLead.personalizedPitch,
                          provider: settings.activeWhatsAppProvider,
                        }),
                      });
                      alert(`Message dispatched to ${selectedLead.businessName}!`);
                      setSelectedLead(null);
                      fetchDashboardData();
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Send Pitch Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
