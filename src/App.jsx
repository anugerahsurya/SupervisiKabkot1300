import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PengawalanSection from './components/PengawalanSection';
import UraianTugasSection from './components/UraianTugasSection';
import PrelistTableSection from './components/PrelistTableSection';
import WilayahOverview from './components/WilayahOverview';
import SubSlsDetailModal from './components/SubSlsDetailModal';
import ExcelUploadModal from './components/ExcelUploadModal';
import GasModal from './components/GasModal';
import { 
  initialPengawalanData, 
  initialUraianTugas, 
  uraianTugasLink, 
  initialPrelist1308, 
  initialPrelist1376 
} from './data/initialData';
import { exportToExcel } from './services/excelService';
import './App.css';

export default function App() {
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
      try { return JSON.parse(cached); } catch (e) {}
    }
    return initialPrelist1308;
  });

  const [prelist1376, setPrelist1376] = useState(() => {
    const cached = localStorage.getItem('se2026_prelist_1376');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return initialPrelist1376;
  });

  const [lastUpdated, setLastUpdated] = useState(() => {
    return localStorage.getItem('se2026_last_updated') || '27 Agu 2026';
  });

  // Modal States
  const [selectedSubSls, setSelectedSubSls] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGasOpen, setIsGasOpen] = useState(false);

  // Update localStorage when data changes
  const saveAllToCache = (pData, uTugas, p1308, p1376, timeStr) => {
    if (pData) localStorage.setItem('se2026_pengawalan_data', JSON.stringify(pData));
    if (uTugas) localStorage.setItem('se2026_uraian_tugas', JSON.stringify(uTugas));
    if (p1308) localStorage.setItem('se2026_prelist_1308', JSON.stringify(p1308));
    if (p1376) localStorage.setItem('se2026_prelist_1376', JSON.stringify(p1376));
    if (timeStr) localStorage.setItem('se2026_last_updated', timeStr);
  };

  // Handler for Excel upload
  const handleDataUpdated = (result) => {
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    setLastUpdated(nowStr);

    if (result.type === 'pengawalan') {
      const updatedP = { ...pengawalanData, ...result.data.pengawalan };
      setPengawalanData(updatedP);
      let updatedU = uraianTugas;
      if (result.data.uraianTugas && result.data.uraianTugas.length > 0) {
        updatedU = result.data.uraianTugas;
        setUraianTugas(updatedU);
      }
      saveAllToCache(updatedP, updatedU, prelist1308, prelist1376, nowStr);
    } else if (result.type === 'prelist') {
      if (result.targetKab === '1376') {
        setPrelist1376(result.data);
        saveAllToCache(pengawalanData, uraianTugas, prelist1308, result.data, nowStr);
        setActiveTab('1376');
      } else {
        setPrelist1308(result.data);
        saveAllToCache(pengawalanData, uraianTugas, result.data, prelist1376, nowStr);
        setActiveTab('1308');
      }
    }
  };

  // Handler for Google Apps Script sync
  const handleDataSyncedFromGas = (cloudData) => {
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    setLastUpdated(nowStr);

    if (cloudData.pengawalan && Object.keys(cloudData.pengawalan).length > 0) {
      setPengawalanData(cloudData.pengawalan);
    }
    if (cloudData.uraianTugas && cloudData.uraianTugas.length > 0) {
      setUraianTugas(cloudData.uraianTugas);
    }
    if (cloudData.prelist1308 && cloudData.prelist1308.length > 0) {
      setPrelist1308(cloudData.prelist1308);
    }
    if (cloudData.prelist1376 && cloudData.prelist1376.length > 0) {
      setPrelist1376(cloudData.prelist1376);
    }
    saveAllToCache(
      cloudData.pengawalan || pengawalanData,
      cloudData.uraianTugas || uraianTugas,
      cloudData.prelist1308 || prelist1308,
      cloudData.prelist1376 || prelist1376,
      nowStr
    );
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
  };

  const currentPrelistData = activeTab === '1376' ? prelist1376 : prelist1308;
  const currentPengawalan = pengawalanData?.[activeTab];

  return (
    <div className="app-layout">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenGas={() => setIsGasOpen(true)}
        onExport={handleExport}
        lastUpdated={lastUpdated}
      />

      {/* Main Content Area */}
      <main className="main-content-container">
        
        {/* VIEW 1: OVERVIEW & COMPARISON */}
        {activeTab === 'overview' && (
          <div className="view-pane animate-fade-in">
            <WilayahOverview 
              pengawalanData={pengawalanData}
              prelist1308={prelist1308}
              prelist1376={prelist1376}
              onSelectWilayah={(code) => setActiveTab(code)}
            />

            {/* Also show the 11 Tasks in Overview */}
            <UraianTugasSection 
              uraianTugas={uraianTugas}
              linkNote={uraianTugasLink}
            />
          </div>
        )}

        {/* VIEW 2 & 3: SPECIFIC WILAYAH (1376 or 1308) */}
        {(activeTab === '1376' || activeTab === '1308') && (
          <div className="view-pane animate-fade-in">
            
            {/* Quick Section Filter Pills */}
            <div className="section-switch-nav">
              <button 
                type="button"
                className={`sec-pill ${activeSection === 'all' ? 'active' : ''}`}
                onClick={() => setActiveSection('all')}
              >
                Semua Bagian
              </button>
              <button 
                type="button"
                className={`sec-pill ${activeSection === 'pengawalan' ? 'active' : ''}`}
                onClick={() => setActiveSection('pengawalan')}
              >
                1. Pengawalan Kualitas & Supervisi
              </button>
              <button 
                type="button"
                className={`sec-pill ${activeSection === 'uraian' ? 'active' : ''}`}
                onClick={() => setActiveSection('uraian')}
              >
                2. 11 Poin Uraian Tugas
              </button>
              <button 
                type="button"
                className={`sec-pill ${activeSection === 'prelist' ? 'active' : ''}`}
                onClick={() => setActiveSection('prelist')}
              >
                3. Tabel Rekap Prelist (20/Hal)
              </button>
            </div>

            {/* Section 1: Pengawalan */}
            {(activeSection === 'all' || activeSection === 'pengawalan') && (
              <PengawalanSection 
                pengawalanData={currentPengawalan}
                kodeKab={activeTab}
              />
            )}

            {/* Section 2: 11 Poin Uraian Tugas */}
            {(activeSection === 'all' || activeSection === 'uraian') && (
              <UraianTugasSection 
                uraianTugas={uraianTugas}
                linkNote={uraianTugasLink}
              />
            )}

            {/* Section 3: Tabel Rekap Prelist */}
            {(activeSection === 'all' || activeSection === 'prelist') && (
              <PrelistTableSection 
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
            Sistem Informasi Supervisi & Pengawalan Kualitas Lapangan. Data dapat diperbarui via upload Excel atau Google Spreadsheet.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SubSlsDetailModal 
        data={selectedSubSls}
        onClose={() => setSelectedSubSls(null)}
      />

      <ExcelUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataUpdated={handleDataUpdated}
      />

      <GasModal 
        isOpen={isGasOpen}
        onClose={() => setIsGasOpen(false)}
        getCurrentDataPayload={getCurrentDataPayload}
        onDataSynced={handleDataSyncedFromGas}
      />

    </div>
  );
}
