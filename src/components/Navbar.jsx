import React from 'react';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  UploadCloud, 
  Database, 
  FileSpreadsheet,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenUpload, 
  onOpenGas, 
  onExport,
  lastUpdated 
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
                <span>Data per: {lastUpdated}</span>
              </div>
            )}
          </div>

          <div className="utility-actions">
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenUpload}
              title="Perbarui Data dengan Upload File Excel"
            >
              <UploadCloud size={14} />
              <span>Update Excel</span>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenGas}
              title="Kelola Koneksi Database Google Spreadsheet"
            >
              <Database size={14} />
              <span>Database GAS</span>
            </button>

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
