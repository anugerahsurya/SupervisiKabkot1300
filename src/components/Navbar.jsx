import React from 'react';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  UploadCloud, 
  Database, 
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw
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
    <header className="navbar-container">
      <div className="navbar-content">
        
        {/* Brand & Title */}
        <div className="navbar-brand">
          <div className="brand-logo-badge">
            <span className="logo-text">SE2026</span>
          </div>
          <div className="brand-info">
            <h1 className="brand-title">Dashboard Pengawalan & Supervisi SE2026</h1>
            <p className="brand-subtitle">
              Wilayah Khusus: <strong>Kabupaten Lima Puluh Kota (1308)</strong> & <strong>Kota Payakumbuh (1376)</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenUpload}
            title="Perbarui Data dengan Upload File Excel"
          >
            <UploadCloud size={16} />
            <span>Update Excel</span>
          </button>

          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenGas}
            title="Kelola Koneksi Database Google Spreadsheet"
          >
            <Database size={16} />
            <span>Database GAS</span>
          </button>

          <button 
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onExport}
            title="Unduh Data Rekap ke File Excel"
          >
            <FileSpreadsheet size={16} />
            <span>Ekspor Excel</span>
          </button>
        </div>

      </div>

      {/* Wilayah & Overview Switcher Tabs */}
      <div className="navbar-tabs-bar">
        <div className="tabs-pill-group">
          
          <button
            type="button"
            className={`tab-pill-btn ${activeTab === '1376' ? 'active' : ''}`}
            onClick={() => setActiveTab('1376')}
          >
            <Building2 size={17} />
            <span>Kota Payakumbuh</span>
            <span className="tab-badge">1376</span>
          </button>

          <button
            type="button"
            className={`tab-pill-btn ${activeTab === '1308' ? 'active' : ''}`}
            onClick={() => setActiveTab('1308')}
          >
            <MapPin size={17} />
            <span>Kabupaten Lima Puluh Kota</span>
            <span className="tab-badge">1308</span>
          </button>

          <button
            type="button"
            className={`tab-pill-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={17} />
            <span>Ringkasan & Perbandingan</span>
          </button>

        </div>

        {lastUpdated && (
          <div className="last-sync-tag">
            <CheckCircle2 size={13} className="sync-icon-ok" />
            <span>Update: {lastUpdated}</span>
          </div>
        )}
      </div>
    </header>
  );
}
