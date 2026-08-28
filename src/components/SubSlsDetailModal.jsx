import React from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  Briefcase, 
  Layers, 
  CheckCircle,
  Clock,
  CircleDot,
  User,
  FileSpreadsheet
} from 'lucide-react';
import { masterWilayahMap } from '../data/masterWilayahInfo';

export default function SubSlsDetailModal({ data, onClose }) {
  if (!data) return null;

  const kdSubSls = String(data.kdSubSls || '').trim();
  const master = masterWilayahMap[kdSubSls] || {};
  const is1376 = kdSubSls.startsWith('1376');
  const kdKab = data.kdKab || master.kdKab || (is1376 ? '1376' : '1308');
  const nmKab = (data.nmKab && data.nmKab.trim() !== '') ? data.nmKab : (master.nmKab || (kdKab === '1376' ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota'));
  const kdKec = data.kdKec || master.kdKec || kdSubSls.slice(0, 7);
  const nmKec = (data.nmKec && data.nmKec.trim() !== '') ? data.nmKec : (master.nmKec || `Kecamatan [${kdSubSls.slice(4, 7)}]`);
  const kdDesa = data.kdDesa || master.kdDesa || kdSubSls.slice(0, 10);
  const nmDesa = (data.nmDesa && data.nmDesa.trim() !== '') ? data.nmDesa : (master.nmDesa || `Desa [${kdSubSls.slice(7, 10)}]`);
  const nmSubSls = (data.nmSubSls && data.nmSubSls.trim() !== '' && !data.nmSubSls.startsWith('Sub SLS [')) 
    ? data.nmSubSls 
    : (master.nmSubSls || data.nmSubSls || `Sub SLS [${kdSubSls.slice(-2)}]`);

  const totBeban = Number(data.totBeban || 0);
  const totSubmit = Number(data.totSubmit || 0);
  const totDraft = Number(data.totDraft || 0);
  const totOpen = Number(data.totOpen || 0);
  const pct = totBeban > 0 ? ((totSubmit / totBeban) * 100).toFixed(1) : '100.0';

  // Prelist Awal
  const plTotTot = Number(data.totPrelistTot || 0);
  const plTotSub = Number(data.totPrelistSub || 0);
  const plDraft = Number(data.prelistDraft || 0);
  const plOpen = Number(data.prelistOpen || 0);

  const plKlgTot = Number(data.prelistKeluargaTot || 0);
  const plKlgSub = Number(data.prelistKeluargaSub || 0);

  const plUshTot = Number(data.prelistUsahaTot || 0);
  const plUshSub = Number(data.prelistUsahaSub || 0);

  const plNonBkuTot = Number(data.prelistNonBkuTot || 0);
  const plNonBkuSub = Number(data.prelistNonBkuSub || 0);

  // Ground Check (GL)
  const glKlgTot = Number(data.glKeluargaTot || 0);
  const glKlgSub = Number(data.glKeluargaSub || 0);
  const glUshTot = Number(data.glUsahaTot || 0);
  const glUshSub = Number(data.glUsahaSub || 0);

  // Assignment Baru (AB)
  const abTotTot = Number(data.totAbTot || 0);
  const abTotSub = Number(data.totAbSub || 0);
  const abDraft = Number(data.abDraft || 0);
  const abOpen = Number(data.abOpen || 0);

  const abKlgTot = Number(data.abKeluargaTot || 0);
  const abKlgSub = Number(data.abKeluargaSub || 0);

  const abUshTot = Number(data.abUsahaTot || 0);
  const abUshSub = Number(data.abUsahaSub || 0);

  const abNonBkuTot = Number(data.abNonBkuTot || 0);
  const abNonBkuSub = Number(data.abNonBkuSub || 0);

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
              <h3 className="modal-title">Rincian Lengkap Status Sub SLS</h3>
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
          
          {/* Identitas Wilayah Administrasi */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              <MapPin size={15} className="text-primary" />
              <span>Identitas Wilayah Administrasi & Petugas</span>
            </h4>

            <div className="wilayah-meta-grid">
              {/* Row 1: Kabupaten, Kecamatan, Desa */}
              <div className="meta-card">
                <span className="meta-card-label">Kabupaten / Kota</span>
                <div className="meta-card-content">
                  <span className="meta-card-main">{nmKab}</span>
                  <span className="meta-card-sub">Kode: {kdKab}</span>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-card-label">Kecamatan</span>
                <div className="meta-card-content">
                  <span className="meta-card-main">{nmKec}</span>
                  <span className="meta-card-sub">Kode: {kdKec}</span>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-card-label">Desa / Nagari / Kelurahan</span>
                <div className="meta-card-content">
                  <span className="meta-card-main">{nmDesa}</span>
                  <span className="meta-card-sub">Kode: {kdDesa}</span>
                </div>
              </div>

              {/* Row 2: Sub SLS & Petugas Lapangan */}
              <div className="meta-card meta-card-sls">
                <span className="meta-card-label">Kode & Nama SLS / Sub SLS</span>
                <div className="meta-card-content">
                  <span className="meta-card-main text-primary">{nmSubSls}</span>
                  <span className="meta-card-code">{kdSubSls || data.kdSubSls}</span>
                </div>
              </div>

              <div className="meta-card meta-card-user">
                <span className="meta-card-label">Petugas / PPL Penanggung Jawab</span>
                <div className="meta-card-content">
                  {data.usernames && data.usernames.length > 0 ? (
                    <div className="meta-users-list">
                      {data.usernames.map((u, i) => (
                        <div key={i} className="meta-user-tag">
                          <User size={13} className="text-primary" />
                          <span className="meta-user-email">{u}</span>
                        </div>
                      ))}
                    </div>
                  ) : data.username ? (
                    <div className="meta-user-tag">
                      <User size={13} className="text-primary" />
                      <span className="meta-user-email">{data.username}</span>
                    </div>
                  ) : (
                    <span className="text-muted font-sm italic">Belum ada penugasan petugas</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pemisahan 4 Status: SUBMIT vs DRAFT vs OPEN vs TOTAL BEBAN */}
          <div className="status-comparison-grid-4">
            
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

            {/* Card 2: DRAFT */}
            <div className={`status-metric-card ${totDraft > 0 ? 'border-warning' : 'border-neutral'}`}>
              <div className="smc-header">
                <div className="smc-icon-wrap bg-warning-subtle">
                  <Clock size={18} className="text-warning" />
                </div>
                <span className="smc-title">Draft (Sedang Dikerjakan)</span>
              </div>
              <div className="smc-body">
                <div className="smc-val-row">
                  <span className={`smc-num font-bold ${totDraft > 0 ? 'text-warning' : 'text-muted'}`}>
                    {totDraft}
                  </span>
                  <span className="smc-unit">Unit</span>
                </div>
                <span className="smc-desc">
                  {totDraft > 0 ? 'Tersimpan lokal di CAPI' : '0 Draft'}
                </span>
              </div>
            </div>

            {/* Card 3: OPEN */}
            <div className={`status-metric-card ${totOpen > 0 ? 'border-info' : 'border-neutral'}`}>
              <div className="smc-header">
                <div className="smc-icon-wrap bg-info-subtle">
                  <CircleDot size={18} className="text-info" />
                </div>
                <span className="smc-title">Open (Belum Dimulai)</span>
              </div>
              <div className="smc-body">
                <div className="smc-val-row">
                  <span className={`smc-num font-bold ${totOpen > 0 ? 'text-info' : 'text-muted'}`}>
                    {totOpen}
                  </span>
                  <span className="smc-unit">Unit</span>
                </div>
                <span className="smc-desc">
                  {totOpen > 0 ? 'Belum dibuka enumerator' : '0 Open'}
                </span>
              </div>
            </div>

            {/* Card 4: TOTAL BEBAN */}
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
                <span className="smc-desc">Prelist ({plTotTot}) + AB ({abTotTot})</span>
              </div>
            </div>

          </div>

          {/* Kategori 1: Prelist Awal (Submit vs Draft vs Open) */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              <FileSpreadsheet size={15} className="text-primary" />
              <span>1. Rincian Prelist Awal (Beban, Submit & Sisa Belum Selesai)</span>
            </h4>

            <div className="detail-table-wrap">
              <table className="mini-data-table">
                <thead>
                  <tr>
                    <th>Rincian Kategori</th>
                    <th className="text-center">Total Beban</th>
                    <th className="text-center text-success">Sudah Submit</th>
                    <th className="text-center text-warning">Sisa Belum Submit</th>
                    <th className="text-center">% Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prelist Keluarga</td>
                    <td className="text-center font-medium">{plKlgTot}</td>
                    <td className="text-center text-success font-semibold">{plKlgSub}</td>
                    <td className="text-center font-medium">
                      {plKlgTot - plKlgSub > 0 ? (
                        <span className="text-warning font-semibold">{plKlgTot - plKlgSub}</span>
                      ) : (
                        <span className="text-muted font-sm">0</span>
                      )}
                    </td>
                    <td className="text-center font-semibold">{Math.round((data.prelistKeluargaPct || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td>Prelist Usaha</td>
                    <td className="text-center font-medium">{plUshTot}</td>
                    <td className="text-center text-success font-semibold">{plUshSub}</td>
                    <td className="text-center font-medium">
                      {plUshTot - plUshSub > 0 ? (
                        <span className="text-warning font-semibold">{plUshTot - plUshSub}</span>
                      ) : (
                        <span className="text-muted font-sm">0</span>
                      )}
                    </td>
                    <td className="text-center font-semibold">{Math.round((data.prelistUsahaPct || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td>Prelist Non BKU</td>
                    <td className="text-center font-medium">{plNonBkuTot}</td>
                    <td className="text-center text-success font-semibold">{plNonBkuSub}</td>
                    <td className="text-center font-medium">
                      {plNonBkuTot - plNonBkuSub > 0 ? (
                        <span className="text-warning font-semibold">{plNonBkuTot - plNonBkuSub}</span>
                      ) : (
                        <span className="text-muted font-sm">0</span>
                      )}
                    </td>
                    <td className="text-center font-semibold">{Math.round((data.prelistNonBkuPct || 0) * 100)}%</td>
                  </tr>
                  <tr className="subtotal-row">
                    <td><strong>Total Prelist Awal</strong></td>
                    <td className="text-center font-bold">{plTotTot}</td>
                    <td className="text-center font-bold text-success">{plTotSub}</td>
                    <td className="text-center font-bold text-warning">{plDraft + plOpen}</td>
                    <td className="text-center font-bold">{Math.round((data.totPrelistPct || 0) * 100)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status Breakdown Bar: Draft vs Open */}
            {(plDraft > 0 || plOpen > 0) && (
              <div className="prelist-status-banner">
                <span className="text-muted font-sm">Rincian status sisa prelist ({plDraft + plOpen} unit):</span>
                {plDraft > 0 && (
                  <span className="status-tag tag-warning">
                    <strong>{plDraft}</strong> Draft (Sedang Dikerjakan)
                  </span>
                )}
                {plOpen > 0 && (
                  <span className="status-tag tag-info">
                    <strong>{plOpen}</strong> Open (Belum Dimulai)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Kategori 2 & 3: Ground Check (GL) & Assignment Baru */}
          <div className="detail-two-cols">
            
            {/* Ground Check (GL) */}
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
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GL Keluarga</td>
                      <td className="text-center">{glKlgTot}</td>
                      <td className="text-center text-success font-semibold">{glKlgSub}</td>
                      <td className="text-center">{Math.round((data.glKeluargaPct || 0) * 100)}%</td>
                    </tr>
                    <tr>
                      <td>GL Usaha</td>
                      <td className="text-center">{glUshTot}</td>
                      <td className="text-center text-success font-semibold">{glUshSub}</td>
                      <td className="text-center">{Math.round((data.glUsahaPct || 0) * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignment Baru (AB) */}
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
                      <th className="text-center text-warning">Sisa</th>
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AB Keluarga</td>
                      <td className="text-center font-medium">{abKlgSub > 0 ? abKlgSub : abKlgTot}</td>
                      <td className="text-center text-success font-semibold">{abKlgSub}</td>
                      <td className="text-center font-medium">0</td>
                      <td className="text-center font-semibold">{abKlgTot > 0 ? Math.round((abKlgSub / abKlgTot) * 100) : 100}%</td>
                    </tr>
                    <tr>
                      <td>AB Usaha</td>
                      <td className="text-center font-medium">{abUshSub > 0 ? abUshSub : abUshTot}</td>
                      <td className="text-center text-success font-semibold">{abUshSub}</td>
                      <td className="text-center font-medium">0</td>
                      <td className="text-center font-semibold">{abUshTot > 0 ? Math.round((abUshSub / abUshTot) * 100) : 100}%</td>
                    </tr>
                    <tr>
                      <td>AB Non BKU</td>
                      <td className="text-center font-medium">{abNonBkuSub > 0 ? abNonBkuSub : abNonBkuTot}</td>
                      <td className="text-center text-success font-semibold">{abNonBkuSub}</td>
                      <td className="text-center font-medium">0</td>
                      <td className="text-center font-semibold">{abNonBkuTot > 0 ? Math.round((abNonBkuSub / abNonBkuTot) * 100) : 100}%</td>
                    </tr>

                    {/* Baris AB yang Belum Selesai (Draft / Open) */}
                    {(abDraft > 0 || abOpen > 0) && (
                      <tr style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)' }}>
                        <td className="text-warning font-medium">AB Belum Selesai</td>
                        <td className="text-center font-bold text-warning">{abDraft + abOpen}</td>
                        <td className="text-center text-muted font-sm">0</td>
                        <td className="text-center font-bold text-warning">{abDraft + abOpen}</td>
                        <td className="text-center font-bold text-warning">0%</td>
                      </tr>
                    )}

                    <tr className="subtotal-row">
                      <td><strong>Total AB</strong></td>
                      <td className="text-center font-bold">{abTotTot}</td>
                      <td className="text-center font-bold text-success">{abTotSub}</td>
                      <td className="text-center font-bold text-warning">{abDraft + abOpen}</td>
                      <td className="text-center font-bold">{abTotTot > 0 ? Math.round((abTotSub / abTotTot) * 100) : 100}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status Breakdown Bar for AB */}
              {(abDraft > 0 || abOpen > 0) && (
                <div className="prelist-status-banner">
                  <span className="text-muted font-sm">Rincian status sisa AB ({abDraft + abOpen} unit):</span>
                  {abDraft > 0 && (
                    <span className="status-tag tag-warning">
                      <strong>{abDraft}</strong> Draft
                    </span>
                  )}
                  {abOpen > 0 && (
                    <span className="status-tag tag-info">
                      <strong>{abOpen}</strong> Open
                    </span>
                  )}
                </div>
              )}
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
