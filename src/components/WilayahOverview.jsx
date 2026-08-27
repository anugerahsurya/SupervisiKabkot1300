import React from 'react';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  Users, 
  Briefcase, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function WilayahOverview({ 
  pengawalanData, 
  prelist1308 = [], 
  prelist1376 = [], 
  onSelectWilayah 
}) {
  const p1308 = pengawalanData?.['1308'] || {};
  const p1376 = pengawalanData?.['1376'] || {};

  // Aggregate 1308 metrics
  const stats1308 = React.useMemo(() => {
    let beban = 0, submit = 0, klgBeban = 0, klgSub = 0, ushBeban = 0, ushSub = 0;
    prelist1308.forEach(d => {
      beban += Number(d.totBeban || 0);
      submit += Number(d.totSubmit || 0);
      klgBeban += Number(d.prelistKeluargaTot || 0);
      klgSub += Number(d.prelistKeluargaSub || 0);
      ushBeban += Number(d.prelistUsahaTot || 0);
      ushSub += Number(d.prelistUsahaSub || 0);
    });
    return {
      subSlsCount: prelist1308.length,
      beban,
      submit,
      pct: beban > 0 ? (submit / beban) * 100 : 0,
      klgBeban,
      klgSub,
      klgPct: klgBeban > 0 ? (klgSub / klgBeban) * 100 : 0,
      ushBeban,
      ushSub,
      ushPct: ushBeban > 0 ? (ushSub / ushBeban) * 100 : 0
    };
  }, [prelist1308]);

  // Aggregate 1376 metrics
  const stats1376 = React.useMemo(() => {
    let beban = 0, submit = 0, klgBeban = 0, klgSub = 0, ushBeban = 0, ushSub = 0;
    prelist1376.forEach(d => {
      beban += Number(d.totBeban || 0);
      submit += Number(d.totSubmit || 0);
      klgBeban += Number(d.prelistKeluargaTot || 0);
      klgSub += Number(d.prelistKeluargaSub || 0);
      ushBeban += Number(d.prelistUsahaTot || 0);
      ushSub += Number(d.prelistUsahaSub || 0);
    });
    return {
      subSlsCount: prelist1376.length,
      beban,
      submit,
      pct: beban > 0 ? (submit / beban) * 100 : 0,
      klgBeban,
      klgSub,
      klgPct: klgBeban > 0 ? (klgSub / klgBeban) * 100 : 0,
      ushBeban,
      ushSub,
      ushPct: ushBeban > 0 ? (ushSub / ushBeban) * 100 : 0
    };
  }, [prelist1376]);

  const totalBebanGabungan = stats1308.beban + stats1376.beban;
  const totalSubmitGabungan = stats1308.submit + stats1376.submit;
  const totalPctGabungan = totalBebanGabungan > 0 ? (totalSubmitGabungan / totalBebanGabungan) * 100 : 0;

  return (
    <section className="section-container overview-section">
      
      {/* Overview Banner */}
      <div className="section-header-banner">
        <div className="banner-left">
          <div className="banner-badge">
            <TrendingUp size={18} />
            <span>Eksekutif Summary SE2026</span>
          </div>
          <h2 className="banner-title">
            Perbandingan Capaian: Lima Puluh Kota & Payakumbuh
          </h2>
          <p className="banner-subtitle">
            Ringkasan komparatif progres lapangan, beban prelist, anomali data, dan status pengawalan supervisi.
          </p>
        </div>

        <div className="combined-stat-badge">
          <span className="comb-label">Total Capaian Gabungan:</span>
          <span className="comb-value">{totalPctGabungan.toFixed(2)}%</span>
          <span className="comb-sub">({totalSubmitGabungan.toLocaleString('id-ID')} / {totalBebanGabungan.toLocaleString('id-ID')} beban)</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="comparison-cards-grid">
        
        {/* Card 1: Kota Payakumbuh (1376) */}
        <div className="comparison-card">
          <div className="comp-card-header">
            <div className="comp-header-title-wrap">
              <div className="comp-icon-box bg-primary-subtle">
                <Building2 size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="comp-wilayah-name">Kota Payakumbuh</h3>
                <span className="comp-wilayah-code">Kode Wilayah: 1376</span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => onSelectWilayah('1376')}
            >
              <span>Buka Detail</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="comp-card-body">
            
            {/* Main Progress Bar */}
            <div className="comp-progress-box">
              <div className="comp-progress-header">
                <span className="comp-prog-label">Capaian Total Submit</span>
                <span className="comp-prog-pct font-bold text-primary">{stats1376.pct.toFixed(2)}%</span>
              </div>
              <div className="comp-progress-track">
                <div className="comp-progress-bar" style={{ width: `${Math.min(100, stats1376.pct)}%` }} />
              </div>
              <div className="comp-prog-detail">
                <span>{stats1376.submit.toLocaleString('id-ID')} tersubmit dari {stats1376.beban.toLocaleString('id-ID')} beban</span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="comp-metrics-list">
              <div className="comp-metric-item">
                <span className="comp-m-label">Jumlah Sub SLS:</span>
                <span className="comp-m-val font-semibold">{stats1376.subSlsCount.toLocaleString('id-ID')} Sub SLS</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Prelist Keluarga:</span>
                <span className="comp-m-val">{stats1376.klgPct.toFixed(2)}% ({stats1376.klgSub.toLocaleString('id-ID')}/{stats1376.klgBeban.toLocaleString('id-ID')})</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Prelist Usaha:</span>
                <span className="comp-m-val">{stats1376.ushPct.toFixed(2)}% ({stats1376.ushSub.toLocaleString('id-ID')}/{stats1376.ushBeban.toLocaleString('id-ID')})</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">SLS Submit &gt;95%:</span>
                <span className="comp-m-val text-success font-semibold">{p1376.slsSubmit95 ?? '-'} SLS</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">SLS Open 100%:</span>
                <span className="comp-m-val font-semibold">{p1376.slsOpen100 ?? '0'} SLS</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Anomali Belum Tindaklanjut:</span>
                <span className="comp-m-val text-danger font-semibold">{Number(p1376.anomaliKeluarga || 0) + Number(p1376.anomaliUsaha || 0)} kasus</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">UB / UM Open/Draft:</span>
                <span className="comp-m-val">{p1376.ubOpenDraft ?? 0} UB / {p1376.umOpenDraft ?? 0} UM</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Tim Supervisi:</span>
                <span className="comp-m-val text-muted text-sm">{p1376.timPengawalan || '-'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Kabupaten Lima Puluh Kota (1308) */}
        <div className="comparison-card">
          <div className="comp-card-header">
            <div className="comp-header-title-wrap">
              <div className="comp-icon-box bg-primary-subtle">
                <MapPin size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="comp-wilayah-name">Kabupaten Lima Puluh Kota</h3>
                <span className="comp-wilayah-code">Kode Wilayah: 1308</span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => onSelectWilayah('1308')}
            >
              <span>Buka Detail</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="comp-card-body">
            
            {/* Main Progress Bar */}
            <div className="comp-progress-box">
              <div className="comp-progress-header">
                <span className="comp-prog-label">Capaian Total Submit</span>
                <span className="comp-prog-pct font-bold text-primary">{stats1308.pct.toFixed(2)}%</span>
              </div>
              <div className="comp-progress-track">
                <div className="comp-progress-bar" style={{ width: `${Math.min(100, stats1308.pct)}%` }} />
              </div>
              <div className="comp-prog-detail">
                <span>{stats1308.submit.toLocaleString('id-ID')} tersubmit dari {stats1308.beban.toLocaleString('id-ID')} beban</span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="comp-metrics-list">
              <div className="comp-metric-item">
                <span className="comp-m-label">Jumlah Sub SLS:</span>
                <span className="comp-m-val font-semibold">{stats1308.subSlsCount.toLocaleString('id-ID')} Sub SLS</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Prelist Keluarga:</span>
                <span className="comp-m-val">{stats1308.klgPct.toFixed(2)}% ({stats1308.klgSub.toLocaleString('id-ID')}/{stats1308.klgBeban.toLocaleString('id-ID')})</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Prelist Usaha:</span>
                <span className="comp-m-val">{stats1308.ushPct.toFixed(2)}% ({stats1308.ushSub.toLocaleString('id-ID')}/{stats1308.ushBeban.toLocaleString('id-ID')})</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">SLS Submit &gt;95%:</span>
                <span className="comp-m-val text-success font-semibold">{p1308.slsSubmit95 ?? '-'} SLS</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">SLS Open 100%:</span>
                <span className="comp-m-val font-semibold">{p1308.slsOpen100 ?? '0'} SLS</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Anomali Belum Tindaklanjut:</span>
                <span className="comp-m-val text-danger font-semibold">{Number(p1308.anomaliKeluarga || 0) + Number(p1308.anomaliUsaha || 0)} kasus</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">UB / UM Open/Draft:</span>
                <span className="comp-m-val">{p1308.ubOpenDraft ?? 0} UB / {p1308.umOpenDraft ?? 0} UM</span>
              </div>

              <div className="comp-metric-item">
                <span className="comp-m-label">Tim Supervisi:</span>
                <span className="comp-m-val text-muted text-sm">{p1308.timPengawalan || '-'}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
