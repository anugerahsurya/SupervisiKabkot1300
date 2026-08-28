import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Building, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock,
  CircleDot,
  User,
  Download 
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';
import { masterWilayahMap, enrichPrelistWithMaster } from '../data/masterWilayahInfo';

const PAGE_SIZE = 20;

export default function PrelistTableSection({ 
  prelistData = [], 
  kodeKab = '1376', 
  onSelectDetail 
}) {
  // Always normalize prelistData to ensure Kecamatan, Desa, and SLS names are fully populated
  const normalizedData = useMemo(() => {
    return enrichPrelistWithMaster(prelistData, kodeKab);
  }, [prelistData, kodeKab]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKec, setSelectedKec] = useState('');
  const [selectedDesa, setSelectedDesa] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, 100, 90-99, 75-89, LT75
  const [sortField, setSortField] = useState('kdSubSls');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset filters when switching between regions
  useEffect(() => {
    setSearchTerm('');
    setSelectedKec('');
    setSelectedDesa('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  }, [kodeKab]);

  const wilName = kodeKab === '1376' ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota';

  // 1. Extract unique Kecamatan list
  const kecamatanList = useMemo(() => {
    const set = new Set();
    normalizedData.forEach(item => {
      if (item.nmKec) set.add(item.nmKec);
    });
    return Array.from(set).sort();
  }, [normalizedData]);

  // 2. Extract unique Desa list (dependent on selected Kecamatan)
  const desaList = useMemo(() => {
    const set = new Set();
    normalizedData.forEach(item => {
      if (!selectedKec || item.nmKec === selectedKec) {
        if (item.nmDesa) set.add(item.nmDesa);
      }
    });
    return Array.from(set).sort();
  }, [normalizedData, selectedKec]);

  // Reset Desa filter when Kecamatan changes
  const handleKecChange = (e) => {
    setSelectedKec(e.target.value);
    setSelectedDesa('');
    setCurrentPage(1);
  };

  const handleDesaChange = (e) => {
    setSelectedDesa(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Status counts for pills
  const statusCounts = useMemo(() => {
    let cAll = normalizedData.length;
    let c100 = 0;
    let cDraft = 0;
    let cOpen = 0;
    let cLt90 = 0;
    let cAB = 0;

    normalizedData.forEach(d => {
      const pct = (d.totPct !== undefined && d.totPct !== null) ? Number(d.totPct) * 100 : 0;
      const draft = Number(d.totDraft || 0);
      const open = Number(d.totOpen || 0);
      const abTot = Number(d.totAbTot || d.abTot || 0);

      if (pct >= 100) c100++;
      if (draft > 0) cDraft++;
      if (open > 0) cOpen++;
      if (pct < 90) cLt90++;
      if (abTot > 0) cAB++;
    });

    return { cAll, c100, cDraft, cOpen, cLt90, cAB };
  }, [normalizedData]);

  // 3. Filter data
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return normalizedData.filter(item => {
      // Search term filter
      if (term) {
        const matchKec = (item.nmKec || '').toLowerCase().includes(term);
        const matchDesa = (item.nmDesa || '').toLowerCase().includes(term);
        const matchSls = (item.nmSubSls || '').toLowerCase().includes(term);
        const matchKd = (item.kdSubSls || '').toLowerCase().includes(term);
        const matchUser = (item.username || '').toLowerCase().includes(term);
        if (!matchKec && !matchDesa && !matchSls && !matchKd && !matchUser) return false;
      }

      // Kecamatan filter
      if (selectedKec && item.nmKec !== selectedKec) return false;

      // Desa filter
      if (selectedDesa && item.nmDesa !== selectedDesa) return false;

      // Status Capaian filter
      const pct = (item.totPct || 0) * 100;
      const draft = Number(item.totDraft || 0);
      const open = Number(item.totOpen || 0);
      const abTot = Number(item.totAbTot || item.abTot || 0);

      if (statusFilter === '100' && pct < 100) return false;
      if (statusFilter === 'DRAFT' && draft === 0) return false;
      if (statusFilter === 'OPEN' && open === 0) return false;
      if (statusFilter === 'AB' && abTot === 0) return false;
      if (statusFilter === '90-99' && (pct < 90 || pct >= 100)) return false;
      if (statusFilter === 'LT90' && pct >= 90) return false;
      if (statusFilter === '75-89' && (pct < 75 || pct >= 90)) return false;
      if (statusFilter === 'LT75' && pct >= 75) return false;

      return true;
    });
  }, [prelistData, searchTerm, selectedKec, selectedDesa, statusFilter]);

// Helper for sorting fractional progress (e.g. 0/50 before 0/20, before 1/40, with 0/0 last)
function compareFractionDeficit(subA, totA, subB, totB) {
  const isDoneA = (totA === 0 || subA >= totA);
  const isDoneB = (totB === 0 || subB >= totB);

  // If one is completed (or 0/0) and the other is incomplete, prioritize incomplete
  if (isDoneA && !isDoneB) return 1;
  if (!isDoneA && isDoneB) return -1;
  if (isDoneA && isDoneB) {
    return totB - totA;
  }

  // Both have deficit:
  // 1. Prioritize lower completion percentage first (0% before 2.5%, etc.)
  const pctA = subA / totA;
  const pctB = subB / totB;

  if (Math.abs(pctA - pctB) > 0.0001) {
    return pctA - pctB;
  }

  // 2. If same percentage (e.g. both 0%, like 0/50 vs 0/20):
  // Prioritize larger shortage/deficit first (50 before 20)
  const shortageA = totA - subA;
  const shortageB = totB - subB;

  if (shortageA !== shortageB) {
    return shortageB - shortageA;
  }

  // 3. Fallback by total beban descending
  return totB - totA;
}

  // 4. Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      // Custom Fractional Deficit Sorting for Prelist Klg, Prelist Ush, and Assign Baru
      if (sortField === 'prelistKeluargaSub' || sortField === 'prelistKeluargaTot') {
        const subA = Number(a.prelistKeluargaSub || 0);
        const totA = Number(a.prelistKeluargaTot || 0);
        const subB = Number(b.prelistKeluargaSub || 0);
        const totB = Number(b.prelistKeluargaTot || 0);
        const res = compareFractionDeficit(subA, totA, subB, totB);
        return sortDir === 'asc' ? res : -res;
      }

      if (sortField === 'prelistUsahaSub' || sortField === 'prelistUsahaTot') {
        const subA = Number(a.prelistUsahaSub || 0);
        const totA = Number(a.prelistUsahaTot || 0);
        const subB = Number(b.prelistUsahaSub || 0);
        const totB = Number(b.prelistUsahaTot || 0);
        const res = compareFractionDeficit(subA, totA, subB, totB);
        return sortDir === 'asc' ? res : -res;
      }

      if (sortField === 'totAbTot' || sortField === 'totAbSub') {
        const subA = Number(a.totAbSub || a.abSub || 0);
        const totA = Number(a.totAbTot || a.abTot || 0);
        const subB = Number(b.totAbSub || b.abSub || 0);
        const totB = Number(b.totAbTot || b.abTot || 0);
        const res = compareFractionDeficit(subA, totA, subB, totB);
        return sortDir === 'asc' ? res : -res;
      }

      let aVal = a[sortField];
      let bVal = b[sortField];

      // Numeric comparison if either value is number or numeric field
      const isNumericField = [
        'totPrelistTot', 'totPrelistSub', 'totPrelistPct', 'prelistOpen', 'prelistDraft', 'prelistOpenDraft',
        'totAbPct', 'abOpen', 'abDraft', 'abOpenDraft',
        'totBeban', 'totSubmit', 'totDraft', 'totOpen', 'totOpenDraft', 'totPct', 'deltaJml', 'deltaPct'
      ].includes(sortField);

      if (isNumericField || typeof aVal === 'number' || typeof bVal === 'number') {
        const numA = Number(aVal) || 0;
        const numB = Number(bVal) || 0;
        return sortDir === 'asc' ? numA - numB : numB - numA;
      }

      // String comparison
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();

      return sortDir === 'asc' 
        ? aVal.localeCompare(bVal, 'id', { numeric: true }) 
        : bVal.localeCompare(aVal, 'id', { numeric: true });
    });
  }, [filteredData, sortField, sortDir]);

  // 5. Paginate per 20 rows
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField === field) {
      return sortDir === 'asc' 
        ? <ArrowUp size={13} className="sort-icon-active text-primary" /> 
        : <ArrowDown size={13} className="sort-icon-active text-primary" />;
    }
    return <ArrowUpDown size={12} className="sort-icon-muted text-light" />;
  };

  // 6. Aggregate Summary Metrics of filtered data
  const summary = useMemo(() => {
    let totBeban = 0;
    let totSubmit = 0;
    let totDraft = 0;
    let totOpen = 0;
    let totOpenDraft = 0;
    let totKlgBeban = 0;
    let totKlgSub = 0;
    let totUshBeban = 0;
    let totUshSub = 0;

    filteredData.forEach(d => {
      totBeban += Number(d.totBeban || 0);
      totSubmit += Number(d.totSubmit || 0);
      totDraft += Number(d.totDraft || 0);
      totOpen += Number(d.totOpen || 0);
      totOpenDraft += Number(d.totOpenDraft !== undefined ? d.totOpenDraft : (Number(d.totDraft || 0) + Number(d.totOpen || 0)));
      totKlgBeban += Number(d.prelistKeluargaTot || 0);
      totKlgSub += Number(d.prelistKeluargaSub || 0);
      totUshBeban += Number(d.prelistUsahaTot || 0);
      totUshSub += Number(d.prelistUsahaSub || 0);
    });

    const totPct = totBeban > 0 ? (totSubmit / totBeban) * 100 : 0;
    const klgPct = totKlgBeban > 0 ? (totKlgSub / totKlgBeban) * 100 : 0;
    const ushPct = totUshBeban > 0 ? (totUshSub / totUshBeban) * 100 : 0;

    return {
      count: filteredData.length,
      totBeban,
      totSubmit,
      totDraft,
      totOpen,
      totOpenDraft,
      totPct,
      totKlgBeban,
      totKlgSub,
      klgPct,
      totUshBeban,
      totUshSub,
      ushPct
    };
  }, [filteredData]);

  // Export current filtered table
  const handleExportFiltered = () => {
    exportToExcel(
      sortedData, 
      `Rekap_Prelist_${kodeKab}_Filtered_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Helper for status badge
  const renderCapaianBadge = (pctDecimal) => {
    const pct = Math.round((pctDecimal || 0) * 100);
    let badgeClass = 'badge-red';
    if (pct >= 100) badgeClass = 'badge-green';
    else if (pct >= 95) badgeClass = 'badge-emerald';
    else if (pct >= 80) badgeClass = 'badge-orange';

    return (
      <span className={`capaian-badge ${badgeClass}`}>
        {pct}%
      </span>
    );
  };

  return (
    <section className="section-container prelist-section">
      
      {/* Section Header */}
      <div className="section-header-banner">
        <div className="banner-left">
          <div className="banner-badge">
            <Layers size={18} />
            <span>Rekapitulasi Level Sub SLS</span>
          </div>
          <h2 className="banner-title">
            Rekap Prelist Sub SLS — {wilName} ({kodeKab})
          </h2>
          <p className="banner-subtitle">
            Tabel rincian progres beban dan submit per Sub SLS dengan paginasi <strong>20 data per halaman</strong>.
          </p>
        </div>

        <button 
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleExportFiltered}
          title="Unduh data hasil filter saat ini ke file Excel"
        >
          <Download size={15} />
          <span>Ekspor Hasil Filter ({filteredData.length})</span>
        </button>
      </div>

      {/* Summary Stat Cards (4 Cards: Total, Submit, Draft, Open) */}
      <div className="prelist-stat-row">
        
        <div className="stat-pill-card">
          <div className="stat-pill-icon bg-primary-subtle">
            <Layers size={18} className="text-primary" />
          </div>
          <div className="stat-pill-body">
            <span className="stat-pill-title">Total Sub SLS</span>
            <span className="stat-pill-num">{summary.count.toLocaleString('id-ID')}</span>
            <span className="stat-pill-sub">Terfilter dari {prelistData.length.toLocaleString('id-ID')} Sub SLS</span>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon bg-success-subtle">
            <TrendingUp size={18} className="text-success" />
          </div>
          <div className="stat-pill-body">
            <span className="stat-pill-title">Sudah Submit (Selesai)</span>
            <div className="stat-pill-num-row">
              <span className="stat-pill-num text-success">{summary.totPct.toFixed(2)}%</span>
              <span className="stat-pill-fraction">({summary.totSubmit.toLocaleString('id-ID')} / {summary.totBeban.toLocaleString('id-ID')})</span>
            </div>
            <div className="mini-progress-track">
              <div className="mini-progress-bar" style={{ width: `${Math.min(100, summary.totPct)}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon bg-warning-subtle">
            <Clock size={18} className="text-warning" />
          </div>
          <div className="stat-pill-body">
            <span className="stat-pill-title">Status Draft (Pengerjaan)</span>
            <div className="stat-pill-num-row">
              <span className={`stat-pill-num ${summary.totDraft > 0 ? 'text-warning' : 'text-muted'}`}>
                {summary.totDraft.toLocaleString('id-ID')}
              </span>
              <span className="stat-pill-fraction">Unit</span>
            </div>
            <span className="stat-pill-sub">
              {summary.totDraft > 0 ? `${summary.totDraft.toLocaleString('id-ID')} tersimpan di CAPI` : '0 Draft'}
            </span>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon bg-info-subtle">
            <CircleDot size={18} className="text-info" />
          </div>
          <div className="stat-pill-body">
            <span className="stat-pill-title">Status Open (Belum Mulai)</span>
            <div className="stat-pill-num-row">
              <span className={`stat-pill-num ${summary.totOpen > 0 ? 'text-info' : 'text-muted'}`}>
                {summary.totOpen.toLocaleString('id-ID')}
              </span>
              <span className="stat-pill-fraction">Unit</span>
            </div>
            <span className="stat-pill-sub">
              {summary.totOpen > 0 ? `${summary.totOpen.toLocaleString('id-ID')} belum dibuka enumerator` : '0 Open'}
            </span>
          </div>
        </div>

      </div>

      {/* Filter & Search Toolbar (Like BPS Zoom Reference) */}
      <div className="table-toolbar">
        
        {/* Search Box */}
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari Sub SLS, Desa, Kecamatan, atau Kode..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Pills (Like Reference Image) */}
        <div className="status-pills-bar">
          <button 
            type="button" 
            className={`status-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
          >
            Semua ({statusCounts.cAll})
          </button>
          <button 
            type="button" 
            className={`status-filter-pill ${statusFilter === '100' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('100'); setCurrentPage(1); }}
          >
            Selesai 100% ({statusCounts.c100})
          </button>
          <button 
            type="button" 
            className={`status-filter-pill ${statusFilter === 'DRAFT' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('DRAFT'); setCurrentPage(1); }}
          >
            Ada Draft ({statusCounts.cDraft})
          </button>
          <button 
            type="button" 
            className={`status-filter-pill ${statusFilter === 'OPEN' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('OPEN'); setCurrentPage(1); }}
          >
            Ada Open ({statusCounts.cOpen})
          </button>
          <button 
            type="button" 
            className={`status-filter-pill ${statusFilter === 'AB' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('AB'); setCurrentPage(1); }}
            title="Tampilkan hanya Sub SLS yang memiliki Assignment Baru (AB)"
          >
            Ada Assign Baru ({statusCounts.cAB})
          </button>
          <button 
            type="button" 
            className={`status-filter-pill ${statusFilter === 'LT90' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('LT90'); setCurrentPage(1); }}
          >
            &lt; 90% ({statusCounts.cLt90})
          </button>
        </div>

        {/* Regional Dropdowns */}
        <div className="filter-dropdowns-group">
          <div className="select-wrap">
            <select 
              className="custom-select" 
              value={selectedKec} 
              onChange={handleKecChange}
            >
              <option value="">Semua Kecamatan ({kecamatanList.length})</option>
              {kecamatanList.map(kec => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          <div className="select-wrap">
            <select 
              className="custom-select" 
              value={selectedDesa} 
              onChange={handleDesaChange}
              disabled={desaList.length === 0}
            >
              <option value="">Semua Desa/Nagari ({desaList.length})</option>
              {desaList.map(desa => (
                <option key={desa} value={desa}>{desa}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Table Container */}
      <div className="table-responsive-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('kdSubSls')} className="sortable-th" style={{ width: '50px' }} title="Urutkan berdasarkan Nomor / Urutan">
                <div className="th-content justify-center">
                  <span>No</span>
                  {renderSortIcon('kdSubSls')}
                </div>
              </th>
              <th onClick={() => handleSort('nmKec')} className="sortable-th" title="Urutkan berdasarkan Nama Kecamatan">
                <div className="th-content">
                  <span>Kecamatan</span>
                  {renderSortIcon('nmKec')}
                </div>
              </th>
              <th onClick={() => handleSort('nmDesa')} className="sortable-th" title="Urutkan berdasarkan Nama Desa / Nagari">
                <div className="th-content">
                  <span>Desa / Nagari</span>
                  {renderSortIcon('nmDesa')}
                </div>
              </th>
              <th onClick={() => handleSort('nmSubSls')} className="sortable-th" title="Urutkan berdasarkan Nama SLS / Sub SLS">
                <div className="th-content">
                  <span>Nama SLS / Sub SLS</span>
                  {renderSortIcon('nmSubSls')}
                </div>
              </th>
              <th onClick={() => handleSort('username')} className="sortable-th" title="Urutkan berdasarkan Username Petugas / PPL">
                <div className="th-content">
                  <span>Petugas</span>
                  {renderSortIcon('username')}
                </div>
              </th>
              <th onClick={() => handleSort('totBeban')} className="sortable-th text-right" title="Urutkan berdasarkan Total Beban">
                <div className="th-content justify-end">
                  <span>Beban</span>
                  {renderSortIcon('totBeban')}
                </div>
              </th>
              <th onClick={() => handleSort('totSubmit')} className="sortable-th text-right" title="Urutkan berdasarkan Sudah Submit">
                <div className="th-content justify-end">
                  <span>Submit</span>
                  {renderSortIcon('totSubmit')}
                </div>
              </th>
              <th onClick={() => handleSort('totDraft')} className="sortable-th text-center" title="Urutkan berdasarkan Status Draft">
                <div className="th-content justify-center">
                  <span>Draft</span>
                  {renderSortIcon('totDraft')}
                </div>
              </th>
              <th onClick={() => handleSort('totOpen')} className="sortable-th text-center" title="Urutkan berdasarkan Status Open">
                <div className="th-content justify-center">
                  <span>Open</span>
                  {renderSortIcon('totOpen')}
                </div>
              </th>
              <th onClick={() => handleSort('prelistKeluargaSub')} className="sortable-th text-center" title="Urutkan berdasarkan Submit Prelist Keluarga">
                <div className="th-content justify-center">
                  <span>Prelist Klg</span>
                  {renderSortIcon('prelistKeluargaSub')}
                </div>
              </th>
              <th onClick={() => handleSort('prelistUsahaSub')} className="sortable-th text-center" title="Urutkan berdasarkan Submit Prelist Usaha">
                <div className="th-content justify-center">
                  <span>Prelist Ush</span>
                  {renderSortIcon('prelistUsahaSub')}
                </div>
              </th>
              <th onClick={() => handleSort('totAbTot')} className="sortable-th text-center" title="Urutkan berdasarkan Total Assignment Baru (Beban / Submit)">
                <div className="th-content justify-center">
                  <span>Assign Baru</span>
                  {renderSortIcon('totAbTot')}
                </div>
              </th>
              <th onClick={() => handleSort('totPct')} className="sortable-th text-center" title="Urutkan berdasarkan Persentase Capaian">
                <div className="th-content justify-center">
                  <span>% Capaian</span>
                  {renderSortIcon('totPct')}
                </div>
              </th>
              <th onClick={() => handleSort('deltaJml')} className="sortable-th text-center" title="Urutkan berdasarkan Delta Harian">
                <div className="th-content justify-center">
                  <span>Delta</span>
                  {renderSortIcon('deltaJml')}
                </div>
              </th>
              <th className="text-center" style={{ width: '70px' }}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
                const draft = Number(row.totDraft || 0);
                const open = Number(row.totOpen || 0);
                const abTot = Number(row.totAbTot || row.abTot || 0);
                const abSub = Number(row.totAbSub || row.abSub || 0);

                return (
                  <tr key={row.kdSubSls || globalIdx} className="table-data-row">
                    <td className="text-center text-muted font-sm">{globalIdx}</td>
                    <td>
                      <span className="font-semibold text-main">{row.nmKec}</span>
                    </td>
                    <td>
                      <span className="text-secondary">{row.nmDesa}</span>
                    </td>
                    <td>
                      <div className="sub-sls-cell">
                        <span className="sub-sls-name">{row.nmSubSls}</span>
                        <span className="sub-sls-code">{row.kdSubSls}</span>
                      </div>
                    </td>
                    <td>
                      {row.usernames && row.usernames.length > 0 ? (
                        <div className="user-badges-container">
                          {row.usernames.map((u, i) => (
                            <div key={i} className="user-badge-pill" title={`Petugas: ${u}`}>
                              <User size={11} className="text-primary" />
                              <span className="user-name-text">{u}</span>
                            </div>
                          ))}
                        </div>
                      ) : row.username ? (
                        <div className="user-badge-pill" title={`Petugas: ${row.username}`}>
                          <User size={11} className="text-primary" />
                          <span className="user-name-text">{row.username}</span>
                        </div>
                      ) : (
                        <span className="text-muted font-sm">-</span>
                      )}
                    </td>
                    <td className="text-right font-medium">{row.totBeban}</td>
                    <td className="text-right font-bold text-success">{row.totSubmit}</td>
                    <td className="text-center">
                      <span className={`status-tag ${draft > 0 ? 'tag-warning font-bold' : 'tag-done'}`}>
                        {draft}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`status-tag ${open > 0 ? 'tag-info font-bold' : 'tag-done'}`}>
                        {open}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="fraction-cell">
                        <span className="fraction-sub">{row.prelistKeluargaSub}</span>
                        <span className="fraction-div">/</span>
                        <span className="fraction-tot">{row.prelistKeluargaTot}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="fraction-cell">
                        <span className="fraction-sub">{row.prelistUsahaSub}</span>
                        <span className="fraction-div">/</span>
                        <span className="fraction-tot">{row.prelistUsahaTot}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      {abTot > 0 ? (
                        <div className="fraction-cell ab-fraction-cell" title={`Assignment Baru: ${abSub} submit dari ${abTot} beban`}>
                          <span className="fraction-sub font-semibold" style={{ color: '#7c3aed' }}>{abSub}</span>
                          <span className="fraction-div">/</span>
                          <span className="fraction-tot font-bold">{abTot}</span>
                        </div>
                      ) : (
                        <span className="text-muted font-sm">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      {renderCapaianBadge(row.totPct)}
                    </td>
                    <td className="text-center">
                      {row.deltaJml !== 0 ? (
                        <span className={`delta-tag ${row.deltaJml > 0 ? 'delta-pos' : 'delta-neg'}`}>
                          {row.deltaJml > 0 ? `+${row.deltaJml}` : row.deltaJml}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Lihat Rincian Open, Draft & Submit Lengkap"
                        onClick={() => onSelectDetail(row)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="15" className="empty-table-cell">
                  <div className="empty-table-state">
                    <AlertCircle size={32} className="text-muted" />
                    <p className="empty-text">Tidak ada data Sub SLS yang sesuai dengan kriteria filter atau pencarian.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (20 per page) */}
      <div className="pagination-container">
        
        <div className="pagination-info">
          <span>
            Menampilkan <strong>{paginatedData.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}</strong> - <strong>{Math.min(currentPage * PAGE_SIZE, sortedData.length)}</strong> dari <strong>{sortedData.length.toLocaleString('id-ID')}</strong> Sub SLS
            {sortedData.length !== prelistData.length && ` (Difilter dari total ${prelistData.length.toLocaleString('id-ID')})`}
          </span>
          <span className="page-size-tag">Paginasi: 20 Baris/Halaman</span>
        </div>

        <div className="pagination-controls">
          
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            title="Halaman Pertama"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Numbered Page Buttons */}
          <div className="page-numbers-group">
            {generatePageNumbers(currentPage, totalPages).map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="page-ellipsis">...</span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            ))}
          </div>

          <button
            type="button"
            className="page-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            title="Halaman Berikutnya"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="page-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(totalPages)}
            title="Halaman Terakhir"
          >
            <ChevronsRight size={16} />
          </button>

        </div>

      </div>

    </section>
  );
}

// Helper to generate dynamic page buttons with ellipsis
function generatePageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
