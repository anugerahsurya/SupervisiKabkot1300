import React from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  Briefcase, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function SubSlsDetailModal({ data, onClose }) {
  if (!data) return null;

  const pct = Math.round((data.totPct || 0) * 100);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon bg-primary-subtle">
              <Layers size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="modal-title">Rincian Lengkap Sub SLS</h3>
              <p className="modal-subtitle">{data.nmSubSls} — {data.kdSubSls}</p>
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
          
          {/* Identitas Wilayah */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              <MapPin size={15} className="text-primary" />
              <span>Identitas Wilayah Administrasi</span>
            </h4>

            <div className="detail-grid-4">
              <div className="detail-box">
                <span className="detail-box-label">Kabupaten / Kota</span>
                <span className="detail-box-value">{data.nmKab} ({data.kdKab})</span>
              </div>

              <div className="detail-box">
                <span className="detail-box-label">Kecamatan</span>
                <span className="detail-box-value">{data.nmKec} ({data.kdKec})</span>
              </div>

              <div className="detail-box">
                <span className="detail-box-label">Desa / Nagari / Kelurahan</span>
                <span className="detail-box-value">{data.nmDesa} ({data.kdDesa})</span>
              </div>

              <div className="detail-box">
                <span className="detail-box-label">Kode & Nama SLS / Sub SLS</span>
                <span className="detail-box-value">{data.nmSubSls}</span>
                <span className="detail-box-code">{data.kdSubSls}</span>
              </div>
            </div>
          </div>

          {/* Grand Total Progres */}
          <div className="detail-highlight-card">
            <div className="detail-highlight-left">
              <span className="dh-label">Total Keseluruhan Beban vs Submit</span>
              <div className="dh-values">
                <span className="dh-submit font-bold text-primary">{data.totSubmit}</span>
                <span className="dh-slash">/</span>
                <span className="dh-total font-medium">{data.totBeban}</span>
                <span className="dh-unit">Unit</span>
              </div>
            </div>

            <div className="detail-highlight-right">
              <div className="dh-pct-circle">
                <span className="dh-pct-num">{pct}%</span>
                <span className="dh-pct-text">Capaian</span>
              </div>
            </div>
          </div>

          {/* Kategori 1: Prelist Awal */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              <FileSpreadsheet size={15} className="text-primary" />
              <span>1. Kategori Prelist Awal</span>
            </h4>

            <div className="detail-table-wrap">
              <table className="mini-data-table">
                <thead>
                  <tr>
                    <th>Rincian Kategori</th>
                    <th className="text-center">Total Beban</th>
                    <th className="text-center">Submit</th>
                    <th className="text-center">% Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prelist Keluarga</td>
                    <td className="text-center font-medium">{data.prelistKeluargaTot}</td>
                    <td className="text-center text-primary font-semibold">{data.prelistKeluargaSub}</td>
                    <td className="text-center">{Math.round((data.prelistKeluargaPct || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td>Prelist Usaha</td>
                    <td className="text-center font-medium">{data.prelistUsahaTot}</td>
                    <td className="text-center text-primary font-semibold">{data.prelistUsahaSub}</td>
                    <td className="text-center">{Math.round((data.prelistUsahaPct || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td>Prelist Non BKU</td>
                    <td className="text-center font-medium">{data.prelistNonBkuTot}</td>
                    <td className="text-center text-primary font-semibold">{data.prelistNonBkuSub}</td>
                    <td className="text-center">{Math.round((data.prelistNonBkuPct || 0) * 100)}%</td>
                  </tr>
                  <tr className="subtotal-row">
                    <td><strong>Total Prelist Awal</strong></td>
                    <td className="text-center font-bold">{data.totPrelistTot}</td>
                    <td className="text-center font-bold text-primary">{data.totPrelistSub}</td>
                    <td className="text-center font-bold">{Math.round((data.totPrelistPct || 0) * 100)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Kategori 2 & 3: Ground Check (GL) & Assignment Baru */}
          <div className="detail-two-cols">
            
            {/* GL */}
            <div className="detail-section">
              <h4 className="detail-section-title">
                <Users size={15} className="text-info" />
                <span>2. Ground Check (GL)</span>
              </h4>

              <div className="detail-table-wrap">
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th className="text-center">Beban</th>
                      <th className="text-center">Submit</th>
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GL Keluarga</td>
                      <td className="text-center">{data.glKeluargaTot}</td>
                      <td className="text-center font-semibold text-primary">{data.glKeluargaSub}</td>
                      <td className="text-center">{Math.round((data.glKeluargaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>GL Usaha</td>
                      <td className="text-center">{data.glUsahaTot}</td>
                      <td className="text-center font-semibold text-primary">{data.glUsahaSub}</td>
                      <td className="text-center">{Math.round((data.glUsahaPct || 0) * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignment Baru */}
            <div className="detail-section">
              <h4 className="detail-section-title">
                <Briefcase size={15} className="text-warning" />
                <span>3. Assignment Baru</span>
              </h4>

              <div className="detail-table-wrap">
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th className="text-center">Beban</th>
                      <th className="text-center">Submit</th>
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AB Keluarga</td>
                      <td className="text-center">{data.abKeluargaTot}</td>
                      <td className="text-center font-semibold text-primary">{data.abKeluargaSub}</td>
                      <td className="text-center">{Math.round((data.abKeluargaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>AB Usaha</td>
                      <td className="text-center">{data.abUsahaTot}</td>
                      <td className="text-center font-semibold text-primary">{data.abUsahaSub}</td>
                      <td className="text-center">{Math.round((data.abUsahaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>AB Non BKU</td>
                      <td className="text-center">{data.abNonBkuTot}</td>
                      <td className="text-center font-semibold text-primary">{data.abNonBkuSub}</td>
                      <td className="text-center">{Math.round((data.abNonBkuPct || 0) * 100)}%</td>
                    </tr>
                    <tr className="subtotal-row">
                      <td><strong>Total AB</strong></td>
                      <td className="text-center font-bold">{data.totAbTot}</td>
                      <td className="text-center font-bold text-primary">{data.totAbSub}</td>
                      <td className="text-center font-bold">{Math.round((data.totAbPct || 0) * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Delta Harian */}
          <div className="detail-delta-box">
            <span className="delta-title">Delta Harian Total Keseluruhan:</span>
            <span className={`delta-val ${data.deltaJml > 0 ? 'text-success font-bold' : ''}`}>
              {data.deltaJml > 0 ? `+${data.deltaJml}` : data.deltaJml} ({Math.round((data.deltaPct || 0) * 100)}%)
            </span>
          </div>

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
