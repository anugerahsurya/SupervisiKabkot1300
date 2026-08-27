import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  Briefcase, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  ListFilter
} from 'lucide-react';

export default function SubSlsDetailModal({ data, onClose }) {
  if (!data) return null;

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open-draft' | 'submit'

  const totBeban = Number(data.totBeban || 0);
  const totSubmit = Number(data.totSubmit || 0);
  const totOpenDraft = Math.max(0, totBeban - totSubmit);
  const pct = totBeban > 0 ? ((totSubmit / totBeban) * 100).toFixed(1) : '100.0';

  // Calculations for Prelist Awal
  const plKlgTot = Number(data.prelistKeluargaTot || 0);
  const plKlgSub = Number(data.prelistKeluargaSub || 0);
  const plKlgOpenDraft = Math.max(0, plKlgTot - plKlgSub);

  const plUshTot = Number(data.prelistUsahaTot || 0);
  const plUshSub = Number(data.prelistUsahaSub || 0);
  const plUshOpenDraft = Math.max(0, plUshTot - plUshSub);

  const plNonBkuTot = Number(data.prelistNonBkuTot || 0);
  const plNonBkuSub = Number(data.prelistNonBkuSub || 0);
  const plNonBkuOpenDraft = Math.max(0, plNonBkuTot - plNonBkuSub);

  const plTotTot = Number(data.totPrelistTot || 0);
  const plTotSub = Number(data.totPrelistSub || 0);
  const plTotOpenDraft = Math.max(0, plTotTot - plTotSub);

  // Calculations for GL (Ground Check)
  const glKlgTot = Number(data.glKeluargaTot || 0);
  const glKlgSub = Number(data.glKeluargaSub || 0);
  const glKlgOpenDraft = Math.max(0, glKlgTot - glKlgSub);

  const glUshTot = Number(data.glUsahaTot || 0);
  const glUshSub = Number(data.glUsahaSub || 0);
  const glUshOpenDraft = Math.max(0, glUshTot - glUshSub);

  // Calculations for AB (Assignment Baru)
  const abKlgTot = Number(data.abKeluargaTot || 0);
  const abKlgSub = Number(data.abKeluargaSub || 0);
  const abKlgOpenDraft = Math.max(0, abKlgTot - abKlgSub);

  const abUshTot = Number(data.abUsahaTot || 0);
  const abUshSub = Number(data.abUsahaSub || 0);
  const abUshOpenDraft = Math.max(0, abUshTot - abUshSub);

  const abNonBkuTot = Number(data.abNonBkuTot || 0);
  const abNonBkuSub = Number(data.abNonBkuSub || 0);
  const abNonBkuOpenDraft = Math.max(0, abNonBkuTot - abNonBkuSub);

  const abTotTot = Number(data.totAbTot || 0);
  const abTotSub = Number(data.totAbSub || 0);
  const abTotOpenDraft = Math.max(0, abTotTot - abTotSub);

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
            title="Tutup Modal"
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

          {/* Pemisahan Utama: SUBMIT vs OPEN / DRAFT Cards */}
          <div className="status-comparison-grid">
            
            {/* Card 1: SUDAH SUBMIT */}
            <div className="status-metric-card border-success">
              <div className="smc-header">
                <div className="smc-icon-wrap bg-success-subtle">
                  <CheckCircle size={18} className="text-success" />
                </div>
                <span className="smc-title">Sudah Submit (Selesai)</span>
              </div>
              <div className="smc-body">
                <div className="smc-val-row">
                  <span className="smc-num text-success font-bold">{totSubmit}</span>
                  <span className="smc-unit">Unit</span>
                </div>
                <span className="smc-desc">{pct}% dari total beban</span>
              </div>
            </div>

            {/* Card 2: OPEN / DRAFT (BELUM SELESAI) */}
            <div className={`status-metric-card ${totOpenDraft > 0 ? 'border-warning' : 'border-neutral'}`}>
              <div className="smc-header">
                <div className="smc-icon-wrap bg-warning-subtle">
                  <Clock size={18} className="text-warning" />
                </div>
                <span className="smc-title">Open / Draft (Belum Submit)</span>
              </div>
              <div className="smc-body">
                <div className="smc-val-row">
                  <span className={`smc-num font-bold ${totOpenDraft > 0 ? 'text-warning' : 'text-muted'}`}>
                    {totOpenDraft}
                  </span>
                  <span className="smc-unit">Unit</span>
                </div>
                <span className="smc-desc">
                  {totOpenDraft > 0 ? 'Perlu tindak lanjut PPL' : 'Tuntas (0 Open/Draft)'}
                </span>
              </div>
            </div>

            {/* Card 3: TOTAL BEBAN */}
            <div className="status-metric-card">
              <div className="smc-header">
                <div className="smc-icon-wrap bg-primary-subtle">
                  <Briefcase size={18} className="text-primary" />
                </div>
                <span className="smc-title">Total Beban Tugas</span>
              </div>
              <div className="smc-body">
                <div className="smc-val-row">
                  <span className="smc-num font-bold text-main">{totBeban}</span>
                  <span className="smc-unit">Unit</span>
                </div>
                <span className="smc-desc">Prelist + GL + AB</span>
              </div>
            </div>

          </div>

          {/* Kategori 1: Prelist Awal (Pemilahan Submit vs Open/Draft) */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              <FileSpreadsheet size={15} className="text-primary" />
              <span>1. Rincian Prelist Awal (Submit vs Open/Draft)</span>
            </h4>

            <div className="detail-table-wrap">
              <table className="mini-data-table">
                <thead>
                  <tr>
                    <th>Rincian Kategori</th>
                    <th className="text-center">Total Beban</th>
                    <th className="text-center text-success">Sudah Submit</th>
                    <th className="text-center text-warning">Open / Draft (Sisa)</th>
                    <th className="text-center">% Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prelist Keluarga</td>
                    <td className="text-center font-medium">{plKlgTot}</td>
                    <td className="text-center text-success font-semibold">{plKlgSub}</td>
                    <td className="text-center">
                      <span className={`status-tag ${plKlgOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                        {plKlgOpenDraft}
                      </span>
                    </td>
                    <td className="text-center">{Math.round((data.prelistKeluargaPct || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td>Prelist Usaha</td>
                    <td className="text-center font-medium">{plUshTot}</td>
                    <td className="text-center text-success font-semibold">{plUshSub}</td>
                    <td className="text-center">
                      <span className={`status-tag ${plUshOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                        {plUshOpenDraft}
                      </span>
                    </td>
                    <td className="text-center">{Math.round((data.prelistUsahaPct || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td>Prelist Non BKU</td>
                    <td className="text-center font-medium">{plNonBkuTot}</td>
                    <td className="text-center text-success font-semibold">{plNonBkuSub}</td>
                    <td className="text-center">
                      <span className={`status-tag ${plNonBkuOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                        {plNonBkuOpenDraft}
                      </span>
                    </td>
                    <td className="text-center">{Math.round((data.prelistNonBkuPct || 0) * 100)}%</td>
                  </tr>
                  <tr className="subtotal-row">
                    <td><strong>Total Prelist Awal</strong></td>
                    <td className="text-center font-bold">{plTotTot}</td>
                    <td className="text-center font-bold text-success">{plTotSub}</td>
                    <td className="text-center font-bold">
                      <span className={`status-tag ${plTotOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                        {plTotOpenDraft}
                      </span>
                    </td>
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
                      <th className="text-center text-success">Submit</th>
                      <th className="text-center text-warning">Open/Draft</th>
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GL Keluarga</td>
                      <td className="text-center">{glKlgTot}</td>
                      <td className="text-center text-success font-semibold">{glKlgSub}</td>
                      <td className="text-center">
                        <span className={`status-tag ${glKlgOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                          {glKlgOpenDraft}
                        </span>
                      </td>
                      <td className="text-center">{Math.round((data.glKeluargaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>GL Usaha</td>
                      <td className="text-center">{glUshTot}</td>
                      <td className="text-center text-success font-semibold">{glUshSub}</td>
                      <td className="text-center">
                        <span className={`status-tag ${glUshOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                          {glUshOpenDraft}
                        </span>
                      </td>
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
                <span>3. Assignment Baru (AB)</span>
              </h4>

              <div className="detail-table-wrap">
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th className="text-center">Beban</th>
                      <th className="text-center text-success">Submit</th>
                      <th className="text-center text-warning">Open/Draft</th>
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AB Keluarga</td>
                      <td className="text-center">{abKlgTot}</td>
                      <td className="text-center text-success font-semibold">{abKlgSub}</td>
                      <td className="text-center">
                        <span className={`status-tag ${abKlgOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                          {abKlgOpenDraft}
                        </span>
                      </td>
                      <td className="text-center">{Math.round((data.abKeluargaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>AB Usaha</td>
                      <td className="text-center">{abUshTot}</td>
                      <td className="text-center text-success font-semibold">{abUshSub}</td>
                      <td className="text-center">
                        <span className={`status-tag ${abUshOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                          {abUshOpenDraft}
                        </span>
                      </td>
                      <td className="text-center">{Math.round((data.abUsahaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>AB Non BKU</td>
                      <td className="text-center">{abNonBkuTot}</td>
                      <td className="text-center text-success font-semibold">{abNonBkuSub}</td>
                      <td className="text-center">
                        <span className={`status-tag ${abNonBkuOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                          {abNonBkuOpenDraft}
                        </span>
                      </td>
                      <td className="text-center">{Math.round((data.abNonBkuPct || 0) * 100)}%</td>
                    </tr>
                    <tr className="subtotal-row">
                      <td><strong>Total AB</strong></td>
                      <td className="text-center font-bold">{abTotTot}</td>
                      <td className="text-center font-bold text-success">{abTotSub}</td>
                      <td className="text-center font-bold">
                        <span className={`status-tag ${abTotOpenDraft > 0 ? 'tag-warning' : 'tag-done'}`}>
                          {abTotOpenDraft}
                        </span>
                      </td>
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
