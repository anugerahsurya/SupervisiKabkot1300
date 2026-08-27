import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import PengawalanSection from './components/PengawalanSection';
import UraianTugasSection from './components/UraianTugasSection';
import PrelistTableSection from './components/PrelistTableSection';
import WilayahOverview from './components/WilayahOverview';
import ToastNotification from './components/ToastNotification';
import { 
  initialPengawalanData, 
  initialUraianTugas, 
  uraianTugasLink, 
  initialPrelist1308, 
  initialPrelist1376 
} from './data/initialData';
import { exportToExcel } from './services/excelService';
import { getGasUrl, fetchDatasetsFromGas } from './services/gasService';
import './App.css';

// Lazy load modals for optimal bundle splitting
const SubSlsDetailModal = lazy(() => import('./components/SubSlsDetailModal'));
const GasModal = lazy(() => import('./components/GasModal'));

const getFormattedTimestamp = () => {
  const now = new Date();
  const datePart = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  return `${datePart}, ${timePart} WIB`;
};

export default function App() {
  // Theme Preset: 'orange' | 'navy' | 'jade'
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('se2026_theme_preset') || 'orange';
  });

  // Apply theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('se2026_theme_preset', currentTheme);
  }, [currentTheme]);

  // Wilayah tab: '1376' (Payakumbuh) | '1308' (Lima Puluh Kota) | 'overview'
  const [activeTab, setActiveTab] = useState('1376');

  // Sub-section tab inside Wilayah: 'all' | 'pengawalan' | 'uraian' | 'prelist'
  const [activeSection, setActiveSection] = useState('all');

  // Datasets with localStorage caching
  const [pengawalanData, setPengawalanData] = useState(() => {
    const cached = localStorage.getItem('se2026_pengawalan_data');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return initialPengawalanData;
  });

  const [uraianTugas, setUraianTugas] = useState(() => {
    const cached = localStorage.getItem('se2026_uraian_tugas');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return initialUraianTugas;
  });

  const [prelist1308, setPrelist1308] = useState(() => {
    const cached = localStorage.getItem('se2026_prelist_1308');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialPrelist1308;
  });

  const [prelist1376, setPrelist1376] = useState(() => {
    const cached = localStorage.getItem('se2026_prelist_1376');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialPrelist1376;
  });

  const [lastUpdated, setLastUpdated] = useState(() => {
    return localStorage.getItem('se2026_last_updated') || '27 Agu 2026, 17:35 WIB';
  });

  // Modal & Async Action States
  const [selectedSubSls, setSelectedSubSls] = useState(null);
  const [isGasOpen, setIsGasOpen] = useState(false);
  const [isSyncingGas, setIsSyncingGas] = useState(false);
  const [toast, setToast] = useState(null); // { type, title, message }

  // Update localStorage when data changes
  const saveAllToCache = (pData, uTugas, p1308, p1376, timeStr) => {
    if (pData) localStorage.setItem('se2026_pengawalan_data', JSON.stringify(pData));
    if (uTugas) localStorage.setItem('se2026_uraian_tugas', JSON.stringify(uTugas));
    if (p1308) localStorage.setItem('se2026_prelist_1308', JSON.stringify(p1308));
    if (p1376) localStorage.setItem('se2026_prelist_1376', JSON.stringify(p1376));
    if (timeStr) localStorage.setItem('se2026_last_updated', timeStr);
  };

  // Handler for Google Apps Script sync
  const handleDataSyncedFromGas = (cloudData) => {
    const nowStr = getFormattedTimestamp();
    setLastUpdated(nowStr);

    let updatedP = pengawalanData;
    let updatedU = uraianTugas;
    let updated1308 = prelist1308;
    let updated1376 = prelist1376;

    if (cloudData.pengawalan && Object.keys(cloudData.pengawalan).length > 0) {
      updatedP = cloudData.pengawalan;
      setPengawalanData(updatedP);
    }
    if (cloudData.uraianTugas && cloudData.uraianTugas.length > 0) {
      updatedU = cloudData.uraianTugas;
      setUraianTugas(updatedU);
    }
    if (cloudData.prelist1308 && cloudData.prelist1308.length > 0) {
      updated1308 = cloudData.prelist1308;
      setPrelist1308(updated1308);
    }
    if (cloudData.prelist1376 && cloudData.prelist1376.length > 0) {
      updated1376 = cloudData.prelist1376;
      setPrelist1376(updated1376);
    }

    saveAllToCache(updatedP, updatedU, updated1308, updated1376, nowStr);
    setToast({
      type: 'success',
      title: 'Sinkronisasi Sukses',
      message: `Seluruh data berhasil ditarik dari Google Spreadsheet (${nowStr}).`
    });
  };

  // 1-Click Quick Sync from Navbar
  const handleQuickSyncGas = async () => {
    const url = getGasUrl();
    if (!url) {
      setIsGasOpen(true);
      return;
    }

    setIsSyncingGas(true);
    try {
      const data = await fetchDatasetsFromGas(url);
      handleDataSyncedFromGas(data);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Gagal Sinkronisasi GAS',
        message: err.message || 'Periksa koneksi Google Apps Script atau klik Pengaturan GAS.'
      });
    } finally {
      setIsSyncingGas(false);
    }
  };

  // Payload generator for GAS push
  const getCurrentDataPayload = () => {
    return {
      pengawalan: pengawalanData,
      uraianTugas: uraianTugas,
      prelist1308: prelist1308,
      prelist1376: prelist1376
    };
  };

  // Global Export
  const handleExport = () => {
    if (activeTab === '1376') {
      exportToExcel(prelist1376, `Rekap_Prelist_Kota_Payakumbuh_1376_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeTab === '1308') {
      exportToExcel(prelist1308, `Rekap_Prelist_Kab_Lima_Puluh_Kota_1308_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const combined = [...prelist1376, ...prelist1308];
      exportToExcel(combined, `Rekap_Prelist_Gabungan_1376_1308_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
    setToast({
      type: 'info',
      title: 'Ekspor Dimulai',
      message: 'File Excel sedang diunduh ke komputer Anda.'
    });
  };

  // Reset to Baseline Data
  const handleResetData = () => {
    if (!window.confirm('Reset seluruh data ke kondisi awal bawaan aplikasi?')) return;
    localStorage.removeItem('se2026_pengawalan_data');
    localStorage.removeItem('se2026_uraian_tugas');
    localStorage.removeItem('se2026_prelist_1308');
    localStorage.removeItem('se2026_prelist_1376');
    localStorage.removeItem('se2026_last_updated');
    
    setPengawalanData(initialPengawalanData);
    setUraianTugas(initialUraianTugas);
    setPrelist1308(initialPrelist1308);
    setPrelist1376(initialPrelist1376);
    const defTime = '27 Agu 2026, 17:35 WIB';
    setLastUpdated(defTime);
    setToast({
      type: 'info',
      title: 'Data Direset',
      message: 'Dataset telah dikembalikan ke data awal bawaan aplikasi.'
    });
  };

  // Active Wilayah Datasets
  const currentPengawalan = pengawalanData[activeTab] || null;
  const currentPrelistData = activeTab === '1376' ? prelist1376 : prelist1308;

  return (
    <div className="app-layout">
      
      {/* Toast Notification Container */}
      <ToastNotification 
        toast={toast} 
        onClose={() => setToast(null)} 
      />

      {/* Header & Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGas={() => setIsGasOpen(true)}
        onExport={handleExport}
        onQuickSyncGas={handleQuickSyncGas}
        isSyncingGas={isSyncingGas}
        lastUpdated={lastUpdated}
        currentTheme={currentTheme}
        onThemeChange={(themeId) => setCurrentTheme(themeId)}
      />

      {/* Main Content Area */}
      <main className="main-content-container">
        
        {activeTab === 'overview' ? (
          /* Tab: Ringkasan & Perbandingan Wilayah */
          <WilayahOverview 
            pengawalanData={pengawalanData}
            prelist1308={prelist1308}
            prelist1376={prelist1376}
            onSelectWilayah={(kode) => {
              setActiveTab(kode);
              setActiveSection('all');
            }}
          />
        ) : (
          /* Tab: Detail Wilayah (1376 Payakumbuh atau 1308 Lima Puluh Kota) */
          <div className="wilayah-view-wrapper">
            
            {/* Section 1: KPI & Pengawalan Kualitas Lapangan */}
            {(activeSection === 'all' || activeSection === 'pengawalan') && (
              <PengawalanSection 
                pengawalan={currentPengawalan}
                kodeKab={activeTab}
              />
            )}

            {/* Section 2: 11 Uraian Tugas Tim Pengawalan */}
            {(activeSection === 'all' || activeSection === 'uraian') && (
              <UraianTugasSection 
                uraianTugas={uraianTugas}
                uraianTugasLink={uraianTugasLink}
              />
            )}

            {/* Section 3: Tabel Rekap Prelist */}
            {(activeSection === 'all' || activeSection === 'prelist') && (
              <PrelistTableSection 
                key={`prelist-${activeTab}`}
                prelistData={currentPrelistData}
                kodeKab={activeTab}
                onSelectDetail={(row) => setSelectedSubSls(row)}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="font-bold text-primary">Sensus Ekonomi 2026 (SE2026)</span>
            <span className="footer-separator">•</span>
            <span>BPS Kabupaten Lima Puluh Kota & Kota Payakumbuh</span>
          </div>
          <p className="footer-copy">
            Sistem Informasi Supervisi & Pengawalan Kualitas Lapangan. Terhubung langsung ke Google Spreadsheet via Google Apps Script.
          </p>
          <div className="footer-actions">
            <button 
              type="button" 
              className="footer-link-btn" 
              onClick={handleResetData}
            >
              Reset ke Data Default
            </button>
            <span className="footer-separator">•</span>
            <button 
              type="button" 
              className="footer-link-btn" 
              onClick={() => setIsGasOpen(true)}
            >
              Konfigurasi Database GAS
            </button>
          </div>
        </div>
      </footer>

      {/* Lazy Loaded Modals with Suspense */}
      <Suspense fallback={null}>
        {selectedSubSls && (
          <SubSlsDetailModal 
            data={selectedSubSls}
            onClose={() => setSelectedSubSls(null)}
          />
        )}

        {isGasOpen && (
          <GasModal 
            isOpen={isGasOpen}
            onClose={() => setIsGasOpen(false)}
            getCurrentDataPayload={getCurrentDataPayload}
            onDataSynced={handleDataSyncedFromGas}
          />
        )}
      </Suspense>

    </div>
  );
}
