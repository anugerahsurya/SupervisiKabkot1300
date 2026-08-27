import * as XLSX from 'xlsx';

/**
 * Service to handle client-side Excel parsing and exporting
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const fileName = file.name.toLowerCase();
        const sheetNames = workbook.SheetNames;

        // 1. Check if it is SQL Lab UMKM format (sqllab_umkm_rekapitulasi_prelist_dan_assignment_baru...)
        const firstSheet = workbook.Sheets[sheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        if (rows.length > 0) {
          const headers = (rows[0] || []).map(h => String(h).toUpperCase());
          if (headers.includes('KODE_SUB_SLS') && headers.includes('JUMLAH_PRELIST')) {
            const result = parseSqlLabUmkmSheet(workbook, fileName);
            resolve({ type: 'prelist', ...result, filename: file.name });
            return;
          }
        }

        // 2. Check if it is "13 Pengawalan" file
        if (fileName.includes('pengawalan') || sheetNames.some(s => s.includes('2026') || s.toLowerCase().includes('sheet3'))) {
          const result = parsePengawalanSheet(workbook);
          resolve({ type: 'pengawalan', data: result, filename: file.name });
          return;
        }

        // 3. Check if it is Rekap Prelist file (1308 or 1376 or general)
        if (fileName.includes('prelist') || sheetNames.some(s => s.toLowerCase().includes('rekap'))) {
          const result = parsePrelistSheet(workbook, fileName);
          resolve({ type: 'prelist', ...result, filename: file.name });
          return;
        }

        // Fallback: try inspecting header contents
        if (rows.length > 0) {
          const headerStr = JSON.stringify(rows[0] || []).toLowerCase();
          if (headerStr.includes('kabupaten') && headerStr.includes('sls')) {
            if (headerStr.includes('prelist') || headerStr.includes('beban')) {
              const result = parsePrelistSheet(workbook, fileName);
              resolve({ type: 'prelist', ...result, filename: file.name });
              return;
            } else {
              const result = parsePengawalanSheet(workbook);
              resolve({ type: 'pengawalan', data: result, filename: file.name });
              return;
            }
          }
        }

        reject(new Error('Format file Excel tidak dikenali sebagai format Pengawalan atau Rekap Prelist SE2026.'));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parser for 13 Pengawalan Excel
 */
function parsePengawalanSheet(workbook) {
  const sheetName = workbook.SheetNames.find(s => s.includes('2026')) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const pengawalanResult = {};
  const uraianTugasList = [];
  let linkNote = '';

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();

    // Check if it's 1308 (Lima Puluh Kota) or 1376 (Payakumbuh)
    if (col0 === '1308' || col1.toLowerCase().includes('lima puluh kota')) {
      pengawalanResult['1308'] = mapPengawalanRow(row, '1308', 'Kabupaten Lima Puluh Kota');
    } else if (col0 === '1376' || col1.toLowerCase().includes('payakumbuh')) {
      pengawalanResult['1376'] = mapPengawalanRow(row, '1376', 'Kota Payakumbuh');
    }

    // Check Uraian Tugas section
    const num = Number(row[0]);
    if (!isNaN(num) && num >= 1 && num <= 20 && row[1] && String(row[1]).length > 10) {
      uraianTugasList.push({
        no: num,
        poin: String(row[1]).trim()
      });
    }

    // Check link note
    if (col1.toLowerCase().includes('tautan:') || col1.toLowerCase().includes('sharepoint')) {
      linkNote = col1;
    } else if (col0.toLowerCase().includes('tautan:') || col0.toLowerCase().includes('sharepoint')) {
      linkNote = col0;
    }
  }

  return {
    pengawalan: pengawalanResult,
    uraianTugas: uraianTugasList.length > 0 ? uraianTugasList : undefined,
    linkNote: linkNote || undefined
  };
}

function mapPengawalanRow(row, defaultCode, defaultName) {
  return {
    kodeKab: defaultCode,
    namaKab: defaultName,
    slsSubmit95: row[2] ?? 0,
    slsOpen100: row[3] ?? 0,
    slsDraft100: row[4] ?? 0,
    slsSubmitGt0UsahaKeluarga0: row[5] ?? 0,
    slsSubmitGt0PecahSls: row[6] ?? 0,
    ubOpenDraft: row[7] ?? 0,
    umOpenDraft: row[8] ?? 0,
    ubUnitPenunjang: row[9] ?? 0,
    ubNonRespon: row[10] ?? 0,
    ubTidakEligible: row[11] ?? 0,
    vhtlBelumSubmit: row[12] ?? 0,
    anomaliKeluarga: row[13] ?? 0,
    anomaliUsaha: row[14] ?? 0,
    missingValueUsaha: row[15] ?? 0,
    missingValueKeluarga: row[16] ?? 0,
    strategi: String(row[17] || ''),
    timPengawalan: String(row[18] || ''),
    tanggal: String(row[19] || ''),
    rab: row[20] ?? 0,
    keterangan: String(row[21] || '')
  };
}

/**
 * Parser for SQL Lab UMKM files (sqllab_umkm_rekapitulasi_prelist_dan_assignment_baru...)
 */
function parseSqlLabUmkmSheet(workbook, fileName) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const prelistRows = [];
  let detectedKab = fileName.includes('1376') ? '1376' : '1308';

  rows.forEach((r) => {
    const kdSub = String(r['KODE_SUB_SLS'] || '').trim();
    if (!kdSub || kdSub.length < 10) return;

    const kdKab = kdSub.slice(0, 4);
    if (kdKab === '1376' || kdKab === '1308') {
      detectedKab = kdKab;
    }

    const totPrelist = Number(r['JUMLAH_PRELIST']) || 0;
    const plOpen = Number(r['JUMLAH_PRELIST_OPEN'] ?? 0);
    const plDraft = Number(r['JUMLAH_PRELIST_DRAFT'] ?? 0);
    const plOpenDraft = (r['JUMLAH_PRELIST_OPEN_DRAFT'] !== undefined) 
      ? Number(r['JUMLAH_PRELIST_OPEN_DRAFT']) 
      : (plOpen + plDraft);
    const plSubmit = (r['JUMLAH_PRELIST_SELAIN_OPEN_DRAFT'] !== undefined)
      ? Number(r['JUMLAH_PRELIST_SELAIN_OPEN_DRAFT'])
      : Math.max(0, totPrelist - (plOpen + plDraft));

    const plKlgTot = Number(r['JUMLAH_KELUARGA_PRELIST']) || 0;
    const plKlgSub = Number(r['KELUARGA_PRELIST_SUBMIT']) || 0;
    const plUshTot = Number(r['JUMLAH_USAHA_PRELIST']) || 0;
    const plUshSub = Number(r['USAHA_PRELIST_SUBMIT']) || 0;
    const plNonTot = Number(r['JUMLAH_NONBKU_PRELIST']) || 0;
    const plNonSub = Number(r['NONBKU_PRELIST_SUBMIT']) || 0;

    const glUshTot = Number(r['JUMLAH_USAHA_GENERAL_LINK']) || 0;
    const glUshSub = Number(r['USAHA_GENERAL_LINK_SUBMIT']) || 0;
    const glKlgTot = Number(r['JUMLAH_KELUARGA_GENERAL_LINK']) || 0;
    const glKlgSub = Number(r['KELUARGA_GENERAL_LINK_SUBMIT']) || 0;

    const abTot = Number(r['JUMLAH_ASSIGNMENT_BARU']) || 0;
    const abKlgTot = Number(r['JUMLAH_KELUARGA_BARU']) || 0;
    const abKlgSub = Number(r['KELUARGA_BARU_SUBMIT']) || 0;
    const abUshTot = Number(r['JUMLAH_USAHA_BARU']) || 0;
    const abUshSub = Number(r['USAHA_BARU_SUBMIT']) || 0;
    const abNonTot = Number(r['JUMLAH_NONBKU_BARU']) || 0;
    const abNonSub = Number(r['NONBKU_BARU_SUBMIT']) || 0;

    const abSub = abKlgSub + abUshSub + abNonSub;
    const abOpen = Number(r['JUMLAH_BARU_OPEN'] ?? 0);
    const abDraft = Number(r['JUMLAH_BARU_DRAFT'] ?? (r['JUMLAH_BARU_STATUS_DRAFT'] ?? 0));
    const abOpenDraft = abOpen + abDraft;

    const totBeban = totPrelist + abTot;
    const totSubmit = plSubmit + abSub;
    const totOpen = plOpen + abOpen;
    const totDraft = plDraft + abDraft;
    const totOpenDraft = totOpen + totDraft;
    const totPct = totBeban > 0 ? totSubmit / totBeban : 1;

    prelistRows.push({
      kdKab: kdKab,
      nmKab: kdKab === '1376' ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota',
      kdKec: kdSub.slice(0, 7),
      nmKec: '',
      kdDesa: kdSub.slice(0, 10),
      nmDesa: '',
      kdSubSls: kdSub,
      nmSubSls: `Sub SLS [${kdSub.slice(-2)}]`,

      prelistKeluargaTot: plKlgTot,
      prelistKeluargaSub: plKlgSub,
      prelistKeluargaPct: plKlgTot > 0 ? plKlgSub / plKlgTot : 1,

      prelistUsahaTot: plUshTot,
      prelistUsahaSub: plUshSub,
      prelistUsahaPct: plUshTot > 0 ? plUshSub / plUshTot : 1,

      prelistNonBkuTot: plNonTot,
      prelistNonBkuSub: plNonSub,
      prelistNonBkuPct: plNonTot > 0 ? plNonSub / plNonTot : 1,

      totPrelistTot: totPrelist,
      totPrelistSub: plSubmit,
      totPrelistPct: totPrelist > 0 ? plSubmit / totPrelist : 1,
      prelistOpen: plOpen,
      prelistDraft: plDraft,
      prelistOpenDraft: plOpenDraft,

      glKeluargaTot: glKlgTot,
      glKeluargaSub: glKlgSub,
      glKeluargaPct: glKlgTot > 0 ? glKlgSub / glKlgTot : 1,

      glUsahaTot: glUshTot,
      glUsahaSub: glUshSub,
      glUsahaPct: glUshTot > 0 ? glUshSub / glUshTot : 1,

      abKeluargaTot: abKlgTot,
      abKeluargaSub: abKlgSub,
      abKeluargaPct: abKlgTot > 0 ? abKlgSub / abKlgTot : 1,

      abUsahaTot: abUshTot,
      abUsahaSub: abUshSub,
      abUsahaPct: abUshTot > 0 ? abUshSub / abUshTot : 1,

      abNonBkuTot: abNonTot,
      abNonBkuSub: abNonSub,
      abNonBkuPct: abNonTot > 0 ? abNonSub / abNonTot : 1,

      totAbTot: abTot,
      totAbSub: abSub,
      totAbPct: abTot > 0 ? abSub / abTot : 1,
      abOpen: abOpen,
      abDraft: abDraft,
      abOpenDraft: abOpenDraft,

      totBeban: totBeban,
      totSubmit: totSubmit,
      totOpen: totOpen,
      totDraft: totDraft,
      totOpenDraft: totOpenDraft,
      totPct: totPct,
      deltaJml: 0,
      deltaPct: 0,
      dummy: Number(r['JUMLAH_DUMMY']) || 0
    });
  });

  return {
    targetKab: detectedKab,
    data: prelistRows
  };
}

/**
 * Parser for Rekap Prelist Excel
 */
function parsePrelistSheet(workbook, fileName) {
  const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('rekap')) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const prelistRows = [];
  let detectedKab = fileName.includes('1376') ? '1376' : '1308';

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 8) continue;

    const kdKec = String(row[2] || '');
    if (kdKec.includes('000') || !row[6]) continue;

    const kdKab = String(row[0] || detectedKab);
    if (kdKab === '1376' || kdKab === '1308') {
      detectedKab = kdKab;
    }

    const totBeban = Number(row[38]) || 0;
    const totSubmit = Number(row[39]) || 0;
    const totOpenDraft = Math.max(0, totBeban - totSubmit);

    prelistRows.push({
      kdKab: kdKab,
      nmKab: String(row[1] || (detectedKab === '1376' ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota')),
      kdKec: String(row[2] || ''),
      nmKec: String(row[3] || ''),
      kdDesa: String(row[4] || ''),
      nmDesa: String(row[5] || ''),
      kdSubSls: String(row[6] || ''),
      nmSubSls: String(row[7] || ''),
      prelistKeluargaTot: Number(row[8]) || 0,
      prelistKeluargaSub: Number(row[9]) || 0,
      prelistKeluargaPct: Number(row[10]) || 0,
      prelistUsahaTot: Number(row[11]) || 0,
      prelistUsahaSub: Number(row[12]) || 0,
      prelistUsahaPct: Number(row[13]) || 0,
      prelistNonBkuTot: Number(row[14]) || 0,
      prelistNonBkuSub: Number(row[15]) || 0,
      prelistNonBkuPct: Number(row[16]) || 0,
      totPrelistTot: Number(row[17]) || 0,
      totPrelistSub: Number(row[18]) || 0,
      totPrelistPct: Number(row[19]) || 0,
      prelistOpenDraft: Math.max(0, (Number(row[17]) || 0) - (Number(row[18]) || 0)),
      glKeluargaTot: Number(row[20]) || 0,
      glKeluargaSub: Number(row[21]) || 0,
      glKeluargaPct: Number(row[22]) || 0,
      glUsahaTot: Number(row[23]) || 0,
      glUsahaSub: Number(row[24]) || 0,
      glUsahaPct: Number(row[25]) || 0,
      abKeluargaTot: Number(row[26]) || 0,
      abKeluargaSub: Number(row[27]) || 0,
      abKeluargaPct: Number(row[28]) || 0,
      abUsahaTot: Number(row[29]) || 0,
      abUsahaSub: Number(row[30]) || 0,
      abUsahaPct: Number(row[31]) || 0,
      abNonBkuTot: Number(row[32]) || 0,
      abNonBkuSub: Number(row[33]) || 0,
      abNonBkuPct: Number(row[34]) || 0,
      totAbTot: Number(row[35]) || 0,
      totAbSub: Number(row[36]) || 0,
      totAbPct: Number(row[37]) || 0,
      abOpenDraft: Math.max(0, (Number(row[35]) || 0) - (Number(row[36]) || 0)),
      totBeban: totBeban,
      totSubmit: totSubmit,
      totOpenDraft: totOpenDraft,
      totPct: Number(row[40]) || 0,
      deltaJml: Number(row[41]) || 0,
      deltaPct: Number(row[42]) || 0,
    });
  }

  return {
    targetKab: detectedKab,
    data: prelistRows
  };
}

/**
 * Export table data to Excel
 */
export const exportToExcel = (data, filename = 'Data_SE2026.xlsx') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
};
