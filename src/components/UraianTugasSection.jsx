import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  ExternalLink, 
  ListOrdered, 
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';

export default function UraianTugasSection({ uraianTugas = [], linkNote = '' }) {
  // Store task status in localStorage: { [taskNo]: 'done' | 'in-progress' | 'todo' }
  const [taskStatus, setTaskStatus] = useState(() => {
    const saved = localStorage.getItem('se2026_uraian_tugas_status');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('se2026_uraian_tugas_status', JSON.stringify(taskStatus));
  }, [taskStatus]);

  const toggleStatus = (no) => {
    setTaskStatus(prev => {
      const current = prev[no] || 'todo';
      let next = 'in-progress';
      if (current === 'in-progress') next = 'done';
      else if (current === 'done') next = 'todo';
      return { ...prev, [no]: next };
    });
  };

  const resetAll = () => {
    if (window.confirm('Reset seluruh checklist 11 uraian tugas?')) {
      setTaskStatus({});
    }
  };

  const doneCount = Object.values(taskStatus).filter(s => s === 'done').length;
  const inProgressCount = Object.values(taskStatus).filter(s => s === 'in-progress').length;
  const totalCount = uraianTugas.length || 11;
  const pctDone = Math.round((doneCount / totalCount) * 100);

  // Extract link from linkNote if available
  const sharepointMatch = linkNote.match(/https?:\/\/[^\s]+/);
  const sharepointUrl = sharepointMatch ? sharepointMatch[0] : 'https://license365bps-my.sharepoint.com/:f:/g/personal/dewiastuti_license365bps_onmicrosoft_com/IgD3vbGWPZjoS6ctqqzCVucIAcT4KCKMUtXGOEPqp-UZ40Y?e=LarvTK';

  return (
    <section className="section-container uraian-tugas-section">
      
      {/* Header */}
      <div className="section-header-banner">
        <div className="banner-left">
          <div className="banner-badge">
            <ListOrdered size={18} />
            <span>11 Instruksi Pengawalan Kualitas</span>
          </div>
          <h2 className="banner-title">
            11 Poin Uraian Tugas Pengawalan Cakupan & Kualitas SE2026
          </h2>
          <p className="banner-subtitle">
            Panduan aksi prioritas untuk memastikan kelengkapan cakupan, eliminasi open assignment, dan percepatan penyelesaian supervisi.
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div className="task-progress-card">
          <div className="progress-header">
            <span className="progress-title">Progres Checklist</span>
            <span className="progress-pct">{pctDone}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill"
              style={{ width: `${pctDone}%` }}
            />
          </div>
          <div className="progress-sub-info">
            <span><strong>{doneCount}</strong> Selesai</span>
            <span>•</span>
            <span><strong>{inProgressCount}</strong> Proses</span>
            <span>•</span>
            <span><strong>{totalCount - doneCount - inProgressCount}</strong> Belum</span>
            
            <button 
              type="button" 
              className="btn-text-reset"
              onClick={resetAll}
              title="Reset Status Checklist"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* SharePoint Link Alert */}
      <div className="sharepoint-callout-box">
        <div className="callout-icon-col">
          <Info size={20} className="text-primary" />
        </div>
        <div className="callout-content-col">
          <h4 className="callout-head">Dokumen Pendukung Poin 1 - 3 (SLS &gt;95%, Open 100%, Draft &gt;95%)</h4>
          <p className="callout-p">
            Data detail wilayah, assignment terbuka, dan daftar SLS dapat diakses langsung pada repository SharePoint resmi BPS:
          </p>
          <a 
            href={sharepointUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="sharepoint-link-btn"
          >
            <ExternalLink size={15} />
            <span>Buka Tautan Data SharePoint Pengawalan</span>
          </a>
        </div>
      </div>

      {/* 11 Tasks Grid */}
      <div className="tasks-grid">
        {uraianTugas.map((task) => {
          const status = taskStatus[task.no] || 'todo';
          const isPoin1to3 = task.no <= 3;

          return (
            <div 
              key={task.no}
              className="task-card"
              onClick={() => toggleStatus(task.no)}
            >
              <div className="task-card-left">
                <div className="task-number-badge">
                  {task.no}
                </div>
                <div className="task-checkbox">
                  {status === 'done' && <CheckCircle2 size={20} className="check-icon-done" />}
                  {status === 'in-progress' && <Clock size={20} className="check-icon-progress" />}
                  {status === 'todo' && <Square size={20} className="check-icon-todo" />}
                </div>
              </div>

              <div className="task-card-content">
                <div className="task-header-line">
                  <span className="task-title-tag">Poin #{task.no}</span>
                  {isPoin1to3 && (
                    <span className="badge-tag-sp">Tautan SharePoint Tersedia</span>
                  )}
                  <span className={`status-pill pill-${status}`}>
                    {status === 'done' ? 'Selesai' : status === 'in-progress' ? 'Sedang Berjalan' : 'Belum'}
                  </span>
                </div>

                <p className="task-desc-text">
                  {task.poin ? task.poin.charAt(0).toUpperCase() + task.poin.slice(1) : ''}
                </p>

                <span className="task-toggle-hint">Klik kartu untuk ubah status</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
