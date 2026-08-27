import React from 'react';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  Database, 
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Palette
} from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'orange', name: 'Orange', color: '#ea580c' },
  { id: 'navy', name: 'Navy', color: '#1d4ed8' },
  { id: 'jade', name: 'Jade', color: '#059669' }
];

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenGas, 
  onExport,
  onQuickSyncGas,
  isSyncingGas,
  lastUpdated,
  currentTheme,
  onThemeChange
}) {
  return (
    <header className="navbar-wrapper">
      
      {/* Top Utility Bar */}
      <div className="top-utility-bar">
        <div className="utility-content">
          <div className="utility-left">
            <div className="brand-pill-badge">
              <span className="brand-dot"></span>
              <span className="brand-text">SE2026 • BPS SUMBAR</span>
            </div>

            {lastUpdated && (
              <div className="last-sync-pill">
                <CheckCircle2 size={12} className="sync-icon-ok" />
                <span>Per: {lastUpdated}</span>
              </div>
            )}
          </div>

          <div className="utility-actions">
            
            {/* Theme Preset Switcher */}
            <div className="theme-switcher-pill-group" title="Ubah Preset Warna Tampilan">
              <Palette size={13} className="text-muted" />
              {THEME_OPTIONS.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  className={`theme-swatch-btn ${currentTheme === th.id ? 'active' : ''}`}
                  onClick={() => onThemeChange(th.id)}
                  title={`Tema ${th.name}`}
                >
                  <span className="swatch-circle" style={{ backgroundColor: th.color }}></span>
                  <span className="swatch-label">{th.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Sync Button */}
            <button 
              type="button"
              className="btn btn-secondary btn-sm quick-sync-btn"
              onClick={onQuickSyncGas}
              disabled={isSyncingGas}
              title="Tarik data terbaru langsung dari Google Spreadsheet"
            >
              {isSyncingGas ? (
                <Loader2 size={13} className="animate-spin text-primary" />
              ) : (
                <RefreshCw size={13} className="text-primary" />
              )}
              <span>{isSyncingGas ? 'Sinkronisasi...' : 'Sinkron GAS'}</span>
            </button>

            {/* GAS Settings */}
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenGas}
              title="Kelola Koneksi & Pengaturan Database Google Spreadsheet"
            >
              <Database size={14} />
              <span>Pengaturan GAS</span>
            </button>

            {/* Export Excel */}
            <button 
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onExport}
              title="Unduh Data Rekap ke File Excel"
            >
              <FileSpreadsheet size={14} />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Area (Spacious & Centered, like BPS Zoom app) */}
      <div className="hero-header-section">
        <div className="hero-category-tag">
          SUPERVISI & PENGAWALAN KUALITAS
        </div>
        <h1 className="hero-main-title">
          Dashboard Pengawalan SE2026
        </h1>
        <p className="hero-subtitle">
          Pantau kelengkapan cakupan, eliminasi anomali lapangan, dan rekapitulasi prelist Sub SLS wilayah Kabupaten Lima Puluh Kota & Kota Payakumbuh secara terstruktur.
        </p>

        {/* Main Wilayah Navigation Tabs */}
        <div className="hero-tabs-container">
          <div className="hero-tabs-pill-group">
            
            <button
              type="button"
              className={`hero-tab-pill ${activeTab === '1376' ? 'active' : ''}`}
              onClick={() => setActiveTab('1376')}
            >
              <Building2 size={16} />
              <span>Kota Payakumbuh</span>
              <span className="hero-tab-badge">1376</span>
            </button>

            <button
              type="button"
              className={`hero-tab-pill ${activeTab === '1308' ? 'active' : ''}`}
              onClick={() => setActiveTab('1308')}
            >
              <MapPin size={16} />
              <span>Kabupaten Lima Puluh Kota</span>
              <span className="hero-tab-badge">1308</span>
            </button>

            <button
              type="button"
              className={`hero-tab-pill ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={16} />
              <span>Ringkasan & Perbandingan</span>
            </button>

          </div>
        </div>
      </div>

    </header>
  );
}
