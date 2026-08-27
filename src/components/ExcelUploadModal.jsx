import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Loader2,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { parseExcelFiles } from '../services/excelService';

export default function ExcelUploadModal({ isOpen, onClose, onDataUpdated, onOpenGasModal }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    
    // Filter Excel files
    const validFiles = Array.from(fileList).filter(f => 
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );

    if (validFiles.length === 0) {
      setErrorMsg('Harap pilih file Excel dengan format .xlsx atau .xls');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setUploadResult(null);

    try {
      // Parse files with ultra-fast row streaming and auto-filtering for 1308 & 1376
      const result = await parseExcelFiles(validFiles);
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
              <h3 className="modal-title">Perbarui Data Excel (Auto-Filter 1308 & 1376)</h3>
              <p className="modal-subtitle">Unggah 1 atau 2 file SQL Lab UMKM / 13 Pengawalan sekaligus</p>
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
              <span className="font-semibold text-main">Otomatisasi Penyaringan Wilayah:</span>
            </div>
            <ul className="inst-list">
              <li>
                <strong>Mendukung Multi-File:</strong> Anda dapat memilih atau drag & drop <strong>kedua file SQL Lab</strong> (Part 1 & Part 2) secara bersamaan.
              </li>
              <li>
                <strong>Filter Otomatis Cepat:</strong> Web secara instan hanya mengekstrak <strong>Kab. Lima Puluh Kota (1308)</strong> dan <strong>Kota Payakumbuh (1376)</strong> tanpa beban memori, dan mengabaikan baris kab/kota lain.
              </li>
              <li>
                <strong>Kolom Lengkap:</strong> Status <em>Submit</em>, <em>Draft</em>, dan <em>Open</em> akan terbarui secara otomatis dan tersimpan di memori lokal peramban.
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
                <p className="loading-text">Sedang memproses dan menyaring data 1308 & 1376 secara instan...</p>
              </div>
            ) : (
              <div className="dropzone-idle">
                <div className="dropzone-icon-wrap">
                  <FileSpreadsheet size={40} className="text-primary" />
                </div>
                <h4 className="dropzone-title">Tarik & Letakkan File Excel di Sini</h4>
                <p className="dropzone-sub">Pilih satu atau kedua file SQL Lab UMKM / Rekap Prelist (.xlsx)</p>

                <label className="btn btn-primary btn-sm dropzone-btn">
                  <span>Pilih File Excel (Bisa Multi-File)</span>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    multiple
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Spreadsheet Option Banner */}
          <div className="info-callout flex-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="callout-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={15} className="text-primary" />
                Opsi Sinkronisasi Google Spreadsheet
              </span>
              <span className="callout-text font-sm">
                Kelola data lewat Google Sheets dan update data web dengan 1-klik.
              </span>
            </div>
            {onOpenGasModal && (
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  onClose();
                  onOpenGasModal();
                }}
              >
                <span>Buka Google Sheets</span>
                <ArrowRight size={14} />
              </button>
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
                <strong>Pembaruan Data Berhasil!</strong>
                <p className="success-detail-p">
                  {uploadResult.type === 'pengawalan' && 'Data 13 Pengawalan & Uraian Tugas berhasil diperbarui.'}
                  {uploadResult.type === 'prelist_multi' && (
                    <>
                      File <strong>{uploadResult.filenames.join(', ')}</strong> berhasil diproses.
                      <br />
                      • <strong>{uploadResult.count1308.toLocaleString('id-ID')} Sub SLS</strong> Kab. Lima Puluh Kota (1308)
                      <br />
                      • <strong>{uploadResult.count1376.toLocaleString('id-ID')} Sub SLS</strong> Kota Payakumbuh (1376)
                    </>
                  )}
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
