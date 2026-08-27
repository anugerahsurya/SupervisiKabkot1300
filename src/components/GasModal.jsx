import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  Loader2, 
  DownloadCloud, 
  UploadCloud, 
  Terminal,
  HelpCircle
} from 'lucide-react';
import { getGasUrl, setGasUrl, testGasConnection, fetchDatasetsFromGas, pushDatasetsToGas } from '../services/gasService';

export default function GasModal({ 
  isOpen, 
  onClose, 
  getCurrentDataPayload, 
  onDataSynced 
}) {
  const [gasUrlInput, setGasUrlInput] = useState(getGasUrl());
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'script' | 'guide'
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    setGasUrl(gasUrlInput);
    setStatusMessage({ type: 'success', text: 'URL Google Apps Script berhasil disimpan ke browser.' });
  };

  const handleTestConnection = async () => {
    if (!gasUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Harap masukkan URL Web App Google Apps Script terlebih dahulu.' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      setGasUrl(gasUrlInput);
      const res = await testGasConnection(gasUrlInput);
      setStatusMessage({ 
        type: 'success', 
        text: `Koneksi Berhasil! Respon: ${res.message || 'Koneksi ke Google Sheets Aktif'}` 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullData = async () => {
    if (!gasUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'URL Google Apps Script belum diisi.' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await fetchDatasetsFromGas(gasUrlInput);
      onDataSynced(data);
      setStatusMessage({ 
        type: 'success', 
        text: 'Berhasil menarik data terbaru dari Google Spreadsheet!' 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushData = async () => {
    if (!gasUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'URL Google Apps Script belum diisi.' });
      return;
    }
    if (!window.confirm('Simpan seluruh dataset saat ini ke Google Spreadsheet?')) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const payload = getCurrentDataPayload();
      await pushDatasetsToGas(gasUrlInput, payload);
      setStatusMessage({ 
        type: 'success', 
        text: 'Data berhasil disinkronkan dan disimpan ke Google Spreadsheet!' 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyScriptText = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon bg-primary-subtle">
              <Database size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="modal-title">Database Google Spreadsheet (Apps Script)</h3>
              <p className="modal-subtitle">Kelola sinkronisasi data cloud dengan Google Spreadsheet melalui Google Apps Script</p>
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Database size={15} />
            <span>Koneksi & Sinkronisasi</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'script' ? 'active' : ''}`}
            onClick={() => setActiveTab('script')}
          >
            <Terminal size={15} />
            <span>Kode Script (Code.gs)</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <HelpCircle size={15} />
            <span>Panduan Setup</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* TAB 1: SETTINGS & SYNC */}
          {activeTab === 'settings' && (
            <div className="gas-settings-view">
              
              <div className="form-group">
                <label className="form-label">
                  <strong>URL Web App Google Apps Script:</strong>
                </label>
                <div className="input-btn-group">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSaveUrl}
                  >
                    Simpan URL
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleTestConnection}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Uji Koneksi'}
                  </button>
                </div>
                <span className="form-hint">
                  Dapatkan URL ini setelah mempublikasikan (Deploy as Web App) script Google Apps Script di Spreadsheet Anda.
                </span>
              </div>

              {/* Status Alert */}
              {statusMessage && (
                <div className={`alert-box ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                  {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Sync Actions Grid */}
              <div className="gas-sync-actions-grid">
                
                <div className="sync-action-card">
                  <div className="sync-card-icon bg-info-subtle">
                    <DownloadCloud size={24} className="text-info" />
                  </div>
                  <div className="sync-card-body">
                    <h4 className="sync-card-title">Tarik Data dari Spreadsheet</h4>
                    <p className="sync-card-desc">
                      Mengambil data terbaru dari sheet Google Spreadsheet (Prelist 1308, 1376, dan Pengawalan) ke web app.
                    </p>
                    <button 
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handlePullData}
                      disabled={isLoading || !gasUrlInput.trim()}
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Tarik Data (Pull)'}
                    </button>
                  </div>
                </div>

                <div className="sync-action-card">
                  <div className="sync-card-icon bg-primary-subtle">
                    <UploadCloud size={24} className="text-primary" />
                  </div>
                  <div className="sync-card-body">
                    <h4 className="sync-card-title">Kirim Data ke Spreadsheet</h4>
                    <p className="sync-card-desc">
                      Menyimpan seluruh data lokal saat ini (termasuk hasil upload Excel terbaru) ke Google Spreadsheet.
                    </p>
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handlePushData}
                      disabled={isLoading || !gasUrlInput.trim()}
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Kirim Data (Push)'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CODE.GS */}
          {activeTab === 'script' && (
            <div className="gas-script-view">
              <div className="code-header-bar">
                <span className="code-filename">google-apps-script/Code.gs</span>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={copyScriptText}
                >
                  {copiedScript ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedScript ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="code-block-display">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
            </div>
          )}

          {/* TAB 3: SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="gas-guide-view">
              <ol className="setup-steps-list">
                <li>
                  <strong>1. Buat Google Spreadsheet Baru</strong>
                  <p>Buka <a href="https://sheets.new" target="_blank" rel="noreferrer">sheets.new</a> di browser dan beri nama spreadsheet, misalnya <em>"Database Supervisi SE2026 - 1308 & 1376"</em>.</p>
                </li>
                <li>
                  <strong>2. Buka Apps Script Editor</strong>
                  <p>Di menu atas Google Spreadsheet, klik <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>.</p>
                </li>
                <li>
                  <strong>3. Salin & Tempel Kode</strong>
                  <p>Buka tab <em>"Kode Script (Code.gs)"</em> di modal ini, klik <strong>Salin Kode</strong>, lalu hapus seluruh kode lama di editor Apps Script dan tempelkan kode tersebut.</p>
                </li>
                <li>
                  <strong>4. Jalankan Inisialisasi Sheet</strong>
                  <p>Pada toolbar Apps Script, pilih fungsi <code>setupSpreadsheet</code> lalu klik tombol <strong>Run (Jalankan)</strong>. Berikan izin akses jika diminta. Ini akan otomatis membuat sheet <code>Pengawalan</code>, <code>Prelist_1308</code>, <code>Prelist_1376</code>, dan <code>Uraian_Tugas</code>.</p>
                </li>
                <li>
                  <strong>5. Publikasikan sebagai Web App (Deploy)</strong>
                  <p>Klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>New Deployment (Penerapan Baru)</strong>.</p>
                  <ul className="sub-steps">
                    <li>Pilih jenis: <strong>Web app</strong></li>
                    <li>Execute as: <strong>Me (email Anda)</strong></li>
                    <li>Who has access: <strong>Anyone (Siapa saja)</strong></li>
                  </ul>
                </li>
                <li>
                  <strong>6. Masukkan Web App URL</strong>
                  <p>Salin <strong>Web App URL</strong> yang dihasilkan (berakhiran <code>/exec</code>), lalu tempelkan ke tab <em>"Koneksi & Sinkronisasi"</em> pada web app ini.</p>
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

const APPS_SCRIPT_CODE = `/**
 * Google Apps Script Backend for SE2026 Supervisi App
 * Database: Google Spreadsheet
 */

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Koneksi ke Google Spreadsheet berhasil aktif.',
      timestamp: new Date()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getAllData') {
    try {
      var data = {
        pengawalan: getPengawalanData(ss),
        uraianTugas: getUraianTugasData(ss),
        prelist1308: getSheetJsonData(ss, 'Prelist_1308'),
        prelist1376: getSheetJsonData(ss, 'Prelist_1376')
      };

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'SE2026 API Server Ready'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'saveAllData') {
      if (payload.pengawalan) savePengawalanData(ss, payload.pengawalan);
      if (payload.uraianTugas) saveUraianTugasData(ss, payload.uraianTugas);
      if (payload.prelist1308) saveSheetJsonData(ss, 'Prelist_1308', payload.prelist1308);
      if (payload.prelist1376) saveSheetJsonData(ss, 'Prelist_1376', payload.prelist1376);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data berhasil disimpan ke Google Spreadsheet.',
        timestamp: new Date()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Aksi tidak dikenali'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Setup initial Sheets automatically
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ['Pengawalan', 'Prelist_1308', 'Prelist_1376', 'Uraian_Tugas'];
  
  sheets.forEach(function(sname) {
    var s = ss.getSheetByName(sname);
    if (!s) {
      ss.insertSheet(sname);
    }
  });
  Logger.log('Setup selesai!');
}

function getSheetJsonData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  
  var headers = values[0];
  var list = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var item = {};
    for (var c = 0; c < headers.length; c++) {
      item[headers[c]] = row[c];
    }
    list.push(item);
  }
  return list;
}

function saveSheetJsonData(ss, sheetName, dataList) {
  if (!dataList || dataList.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  
  sheet.clear();
  var headers = Object.keys(dataList[0]);
  var rows = [headers];
  
  dataList.forEach(function(item) {
    var row = [];
    headers.forEach(function(h) {
      row.push(item[h] !== undefined ? item[h] : '');
    });
    rows.push(row);
  });
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}

function getPengawalanData(ss) {
  var list = getSheetJsonData(ss, 'Pengawalan');
  var map = {};
  list.forEach(function(item) {
    if (item.kodeKab) map[String(item.kodeKab)] = item;
  });
  return map;
}

function savePengawalanData(ss, pengawalanMap) {
  var list = [];
  Object.keys(pengawalanMap).forEach(function(k) {
    list.push(pengawalanMap[k]);
  });
  saveSheetJsonData(ss, 'Pengawalan', list);
}

function getUraianTugasData(ss) {
  return getSheetJsonData(ss, 'Uraian_Tugas');
}

function saveUraianTugasData(ss, tasks) {
  saveSheetJsonData(ss, 'Uraian_Tugas', tasks);
}
`;
