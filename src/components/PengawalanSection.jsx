import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Wallet, 
  FileText,
  AlertCircle,
  Building,
  Store,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function PengawalanSection({ pengawalanData, kodeKab }) {
  if (!pengawalanData) {
    return (
      <div className="empty-card">
        <p>Data pengawalan kualitas belum tersedia untuk wilayah ini.</p>
      </div>
    );
  }

  const p = pengawalanData;
  const isPayakumbuh = kodeKab === '1376';
  const wilName = isPayakumbuh ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota';

  // Format strategies into bullet points
  const strategiItems = (p.strategi || '')
    .split(/\n(?=\d+\.)|\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return (
    <section className="section-container pengawalan-section">
      
      {/* Section Header */}
      <div className="section-header-banner">
        <div className="banner-left">
          <div className="banner-badge">
            <ShieldAlert size={18} />
            <span>Monitoring & Evaluasi Kualitas</span>
          </div>
          <h2 className="banner-title">
            Pengawalan Cakupan & Kualitas SE2026 — {wilName} ({kodeKab})
          </h2>
          <p className="banner-subtitle">
            Ringkasan evaluasi anomali, status assignment fasih, kepatuhan submit, dan tindak lanjut lapangan.
          </p>
        </div>

        {p.tanggal && (
          <div className="supervision-info-badge">
            <Calendar size={15} />
            <span>Jadwal: <strong>{p.tanggal}</strong></span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        
        {/* Card 1: SLS Submit > 95% */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <CheckCircle size={22} className="kpi-icon text-success" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">SLS dg % Submit &gt;95%</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.slsSubmit95 ?? '-'}</span>
              <span className="kpi-unit">SLS</span>
            </div>
            <span className="kpi-hint">Target wilayah hampir tuntas</span>
          </div>
        </div>

        {/* Card 2: SLS Open 100% */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <AlertTriangle size={22} className={`kpi-icon ${p.slsOpen100 > 0 ? 'text-danger' : 'text-muted'}`} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">SLS Status Open 100%</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.slsOpen100 !== null && p.slsOpen100 !== '-' ? p.slsOpen100 : '0'}</span>
              <span className="kpi-unit">SLS</span>
            </div>
            <span className="kpi-hint">Perlu pendampingan PPL/PML</span>
          </div>
        </div>

        {/* Card 3: SLS Draft 100% */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <Clock size={22} className="kpi-icon text-warning" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">SLS Status Draft 100%</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.slsDraft100 !== null && p.slsDraft100 !== '-' ? p.slsDraft100 : '0'}</span>
              <span className="kpi-unit">SLS</span>
            </div>
            <span className="kpi-hint">Segera dorong final submit</span>
          </div>
        </div>

        {/* Card 4: SLS Submit >0 tapi Usaha/Keluarga = 0 */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <HelpCircle size={22} className="kpi-icon text-info" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Submit &gt;0, Usaha/Klg = 0</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.slsSubmitGt0UsahaKeluarga0 ?? '0'}</span>
              <span className="kpi-unit">SLS</span>
            </div>
            <span className="kpi-subtext">Pecah SLS: <strong>{p.slsSubmitGt0PecahSls ?? 0}</strong> SLS</span>
          </div>
        </div>

        {/* Card 5: UB Open/Draft */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <Building size={22} className="kpi-icon text-primary" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">UB Open / Draft</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.ubOpenDraft !== null && p.ubOpenDraft !== '-' ? p.ubOpenDraft : '0'}</span>
              <span className="kpi-unit">Usaha</span>
            </div>
            <span className="kpi-subtext">Unit Penunjang: <strong>{p.ubUnitPenunjang ?? 0}</strong> | Non-Respon: <strong>{p.ubNonRespon ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 6: UM Open/Draft */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <Store size={22} className="kpi-icon text-primary" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">UM Open / Draft</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.umOpenDraft !== null && p.umOpenDraft !== '-' ? p.umOpenDraft : '0'}</span>
              <span className="kpi-unit">Usaha</span>
            </div>
            <span className="kpi-hint">Prioritas pendataan UM</span>
          </div>
        </div>

        {/* Card 7: VHTL Belum Submit */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <AlertCircle size={22} className="kpi-icon text-warning" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">VHTL Belum Submit</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{p.vhtlBelumSubmit !== null && p.vhtlBelumSubmit !== '-' ? p.vhtlBelumSubmit : '0'}</span>
              <span className="kpi-unit">Resp</span>
            </div>
            <span className="kpi-hint">Target perhotelan/akomodasi</span>
          </div>
        </div>

        {/* Card 8: Anomali Usaha & Keluarga */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <AlertTriangle size={22} className="kpi-icon text-danger" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Anomali Belum Tindaklanjut</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{Number(p.anomaliKeluarga || 0) + Number(p.anomaliUsaha || 0)}</span>
              <span className="kpi-unit">Kasus</span>
            </div>
            <span className="kpi-subtext">Usaha: <strong>{p.anomaliUsaha ?? 0}</strong> | Keluarga: <strong>{p.anomaliKeluarga ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 9: Missing Values */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <FileText size={22} className="kpi-icon text-muted" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Kasus Missing Value</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{Number(p.missingValueKeluarga || 0) + Number(p.missingValueUsaha || 0)}</span>
              <span className="kpi-unit">Kasus</span>
            </div>
            <span className="kpi-subtext">Keluarga: <strong>{p.missingValueKeluarga ?? 0}</strong> | Usaha: <strong>{p.missingValueUsaha ?? 0}</strong></span>
          </div>
        </div>

      </div>

      {/* Detail Grid: Tim Supervisi & Strategi Koordinasi */}
      <div className="supervision-detail-grid">
        
        {/* Tim & Informasi Supervisi */}
        <div className="content-card team-card">
          <div className="card-header">
            <div className="card-header-icon">
              <Users size={18} />
            </div>
            <h3 className="card-title">Tim Pengawalan & Anggaran</h3>
          </div>

          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Tim Supervisi Langsung:</span>
              <span className="info-value highlight-badge">{p.timPengawalan || 'Belum Ditentukan'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Jadwal Pelaksanaan:</span>
              <span className="info-value font-medium">{p.tanggal || '-'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Alokasi Anggaran (RAB):</span>
              <span className="info-value text-primary font-bold">
                {typeof p.rab === 'number' 
                  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.rab)
                  : (p.rab || '-')}
              </span>
            </div>

            {p.keterangan && (
              <div className="info-callout">
                <span className="callout-title">Catatan Sinergi:</span>
                <p className="callout-text">{p.keterangan}</p>
              </div>
            )}

            <div className="ub-stats-box">
              <div className="ub-stat-item">
                <span className="ub-stat-num">{p.ubTidakEligible ?? 0}</span>
                <span className="ub-stat-title">UB Tidak Eligible</span>
                <span className="ub-stat-desc">(Tutup, pindah, duplikat)</span>
              </div>
              <div className="ub-stat-item">
                <span className="ub-stat-num">{p.ubUnitPenunjang ?? 0}</span>
                <span className="ub-stat-title">UB Unit Penunjang</span>
                <span className="ub-stat-desc">(Konfirmasi status cabang)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategi Lapangan */}
        <div className="content-card strategy-card">
          <div className="card-header">
            <div className="card-header-icon">
              <TrendingUp size={18} />
            </div>
            <h3 className="card-title">Strategi Penyelesaian Hasil Koordinasi</h3>
          </div>

          <div className="card-body">
            {strategiItems.length > 0 ? (
              <ul className="strategy-list">
                {strategiItems.map((item, idx) => (
                  <li key={idx} className="strategy-item">
                    <div className="strategy-bullet">{idx + 1}</div>
                    <p className="strategy-text">{item.replace(/^\d+\.\s*/, '')}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Belum ada catatan strategi yang dicatat.</p>
            )}
          </div>
        </div>

      </div>

    </section>
  );
}
