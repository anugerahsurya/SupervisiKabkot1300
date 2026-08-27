import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { parseExcelFile } from '../services/excelService';

export default function ExcelUploadModal({ isOpen, onClose, onDataUpdated }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    // Check extension
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('Harap pilih file Excel dengan format .xlsx atau .xls');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setUploadResult(null);

    try {
      const result = await parseExcelFile(file);
      setUploadResult(result);
      onDataUpdated(result);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal memproses file Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-md" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon bg-primary-subtle">
              <UploadCloud size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="modal-title">Perbarui Data via File Excel</h3>
              <p className="modal-subtitle">Unggah file Excel hasil supervisi atau rekap fasih terbaru</p>
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

        {/* Body */}
        <div className="modal-body">
          
          {/* Instructions Box */}
          <div className="upload-instructions-box">
            <div className="inst-title-row">
              <Info size={16} className="text-primary" />
              <span className="font-semibold text-main">Tipe File yang Didukung:</span>
            </div>
            <ul className="inst-list">
              <li>
                <strong>13 Pengawalan Cakupan & Kualitas SE2026.xlsx</strong> — Memperbarui metrik KPI, anomali, tim, strategi, & uraian tugas 1308 dan 1376.
              </li>
              <li>
                <strong>Rekap_Prelist_SubSLS_Kab1308_*.xlsx</strong> — Memperbarui data tabel Sub SLS Kabupaten Lima Puluh Kota (1308).
              </li>
              <li>
                <strong>Rekap_Prelist_SubSLS_Kab1376_*.xlsx</strong> — Memperbarui data tabel Sub SLS Kota Payakumbuh (1376).
              </li>
            </ul>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`dropzone-box ${isDragging ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isLoading ? (
              <div className="dropzone-loading">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="loading-text">Sedang memproses dan membaca lembar kerja Excel...</p>
              </div>
            ) : (
              <div className="dropzone-idle">
                <div className="dropzone-icon-wrap">
                  <FileSpreadsheet size={40} className="text-primary" />
                </div>
                <h4 className="dropzone-title">Tarik & Letakkan File Excel di Sini</h4>
                <p className="dropzone-sub">atau klik tombol di bawah untuk memilih file dari komputer</p>

                <label className="btn btn-primary btn-sm dropzone-btn">
                  <span>Pilih File Excel</span>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="alert-box alert-danger">
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {uploadResult && (
            <div className="alert-box alert-success">
              <CheckCircle2 size={18} />
              <div>
                <strong>Pembaruan Berhasil!</strong>
                <p className="success-detail-p">
                  File <strong>{uploadResult.filename}</strong> berhasil diproses. 
                  {uploadResult.type === 'pengawalan' && ' Data Pengawalan 1308 & 1376 serta uraian tugas telah diperbarui.'}
                  {uploadResult.type === 'prelist' && ` Sebanyak ${uploadResult.data.length.toLocaleString('id-ID')} baris Sub SLS wilayah ${uploadResult.targetKab === '1376' ? 'Kota Payakumbuh' : 'Kab. Lima Puluh Kota'} telah diperbarui.`}
                </p>
              </div>
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
            Selesai / Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
