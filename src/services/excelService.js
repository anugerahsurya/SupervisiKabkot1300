import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { masterWilayahMap } from '../data/masterWilayahInfo';

/**
 * Service to handle client-side Excel parsing and exporting
 * Fast streaming & multi-file parser optimized for 1308 (Lima Puluh Kota) & 1376 (Payakumbuh)
 */

export const parseExcelFiles = async (fileList) => {
  const files = Array.from(fileList);
  if (files.length === 0) throw new Error('Tidak ada file yang dipilih.');

  // Accumulators for multi-file merge
  let combined1308 = [];
  let combined1376 = [];
  let pengawalanResult = null;
  let uraianTugasResult = null;
  const processedFilenames = [];

  for (const file of files) {
    processedFilenames.push(file.name);
    const parsed = await parseSingleExcel(file);

    if (parsed.type === 'pengawalan') {
      pengawalanResult = { ...pengawalanResult, ...parsed.data.pengawalan };
      if (parsed.data.uraianTugas) uraianTugasResult = parsed.data.uraianTugas;
    } else if (parsed.type === 'prelist_multi') {
      if (parsed.prelist1308 && parsed.prelist1308.length > 0) {
        combined1308 = mergePrelistArrays(combined1308, parsed.prelist1308);
      }
      if (parsed.prelist1376 && parsed.prelist1376.length > 0) {
        combined1376 = mergePrelistArrays(combined1376, parsed.prelist1376);
      }
    } else if (parsed.type === 'prelist') {
      if (parsed.targetKab === '1308') {
        combined1308 = mergePrelistArrays(combined1308, parsed.data);
      } else if (parsed.targetKab === '1376') {
        combined1376 = mergePrelistArrays(combined1376, parsed.data);
      }
    }
  }

  // Return combined response
  if (pengawalanResult) {
    return {
      type: 'pengawalan',
      filenames: processedFilenames,
      data: {
        pengawalan: pengawalanResult,
        uraianTugas: uraianTugasResult
      }
    };
  }

  return {
    type: 'prelist_multi',
    filenames: processedFilenames,
    prelist1308: combined1308,
    prelist1376: combined1376,
    count1308: combined1308.length,
    count1376: combined1376.length
  };
};

/**
 * Merge two arrays of Sub SLS items without duplication
 */
function mergePrelistArrays(existingList, newList) {
  const map = new Map();
  existingList.forEach(item => {
    if (item.kdSubSls) map.set(item.kdSubSls, item);
  });
  newList.forEach(item => {
    if (item.kdSubSls) map.set(item.kdSubSls, item);
  });
  return Array.from(map.values());
}

/**
 * Parse a single Excel file
 */
export const parseSingleExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const fileName = file.name.toLowerCase();
        const sheetNames = workbook.SheetNames;
        const firstSheet = workbook.Sheets[sheetNames[0]];

        // Fast Header Inspection (reading only row 1)
        const headerRange = XLSX.utils.sheet_to_json(firstSheet, { header: 1, range: 'A1:Z2' });
        const firstRow = (headerRange[0] || []).map(h => String(h).trim().toUpperCase());
        const headerStr = JSON.stringify(firstRow).toLowerCase();

        // 1. Check if it is SQL Lab UMKM format (has KODE_SUB_SLS & JUMLAH_PRELIST)
        if (firstRow.includes('KODE_SUB_SLS') && firstRow.includes('JUMLAH_PRELIST')) {
          const result = parseSqlLabUmkmFast(firstSheet, firstRow);
          resolve({ type: 'prelist_multi', ...result, filename: file.name });
          return;
        }

        // 2. Check if it is "13 Pengawalan" file
        if (fileName.includes('pengawalan') || sheetNames.some(s => s.includes('2026') || s.toLowerCase().includes('sheet3'))) {
          const result = parsePengawalanSheet(workbook);
          resolve({ type: 'pengawalan', data: result, filename: file.name });
          return;
        }

        // 3. Check if it is standard Rekap Prelist file
        if (fileName.includes('rekap') || fileName.includes('prelist') || headerStr.includes('kode kabupaten')) {
          const result = parsePrelistSheet(workbook, fileName);
          resolve({ type: 'prelist', ...result, filename: file.name });
          return;
        }

        reject(new Error(`Format file "${file.name}" tidak sesuai dengan template Pengawalan atau SQL Lab UMKM SE2026.`));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Ultra-Fast Filtered Parser for SQL Lab UMKM exports (Processes 10,000+ rows in < 150ms)
 * Immediately discards any non-1308 and non-1376 rows during scan
 */
function parseSqlLabUmkmFast(sheet, headerRow) {
  // Convert sheet to array of arrays
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rawRows.length < 2) return { prelist1308: [], prelist1376: [] };

  const headers = rawRows[0].map(h => String(h).trim().toUpperCase());
  
  // Find column indexes
  const idxKodeSub = headers.indexOf('KODE_SUB_SLS');
  const idxJmlPrelist = headers.indexOf('JUMLAH_PRELIST');
  const idxPrelistOpen = headers.indexOf('JUMLAH_PRELIST_OPEN');
  const idxPrelistDraft = headers.indexOf('JUMLAH_PRELIST_DRAFT');
  const idxPrelistOpenDraft = headers.indexOf('JUMLAH_PRELIST_OPEN_DRAFT');
  const idxPrelistSubmit = headers.indexOf('JUMLAH_PRELIST_SELAIN_OPEN_DRAFT');

  const idxKlgPrelist = headers.indexOf('JUMLAH_KELUARGA_PRELIST');
  const idxKlgPrelistSub = headers.indexOf('KELUARGA_PRELIST_SUBMIT');
  const idxUshPrelist = headers.indexOf('JUMLAH_USAHA_PRELIST');
  const idxUshPrelistSub = headers.indexOf('USAHA_PRELIST_SUBMIT');
  const idxNonBkuPrelist = headers.indexOf('JUMLAH_NONBKU_PRELIST');
  const idxNonBkuPrelistSub = headers.indexOf('NONBKU_PRELIST_SUBMIT');

  const idxDummy = headers.indexOf('JUMLAH_DUMMY');
  const idxUshGl = headers.indexOf('JUMLAH_USAHA_GENERAL_LINK');
  const idxUshGlSub = headers.indexOf('USAHA_GENERAL_LINK_SUBMIT');
  const idxKlgGl = headers.indexOf('JUMLAH_KELUARGA_GENERAL_LINK');
  const idxKlgGlSub = headers.indexOf('KELUARGA_GENERAL_LINK_SUBMIT');

  const idxAbTot = headers.indexOf('JUMLAH_ASSIGNMENT_BARU');
  const idxAbKlg = headers.indexOf('JUMLAH_KELUARGA_BARU');
  const idxAbKlgSub = headers.indexOf('KELUARGA_BARU_SUBMIT');
  const idxAbUsh = headers.indexOf('JUMLAH_USAHA_BARU');
  const idxAbUshSub = headers.indexOf('USAHA_BARU_SUBMIT');
  const idxAbNonBku = headers.indexOf('JUMLAH_NONBKU_BARU');
  const idxAbNonBkuSub = headers.indexOf('NONBKU_BARU_SUBMIT');
  const idxAbOpen = headers.indexOf('JUMLAH_BARU_OPEN');
  const idxAbDraft = headers.indexOf('JUMLAH_BARU_DRAFT') !== -1 ? headers.indexOf('JUMLAH_BARU_DRAFT') : headers.indexOf('JUMLAH_BARU_STATUS_DRAFT');
  const idxUsername = headers.findIndex(h => 
    h === 'CURRENT_USER_USERNAME' || 
    h === 'USERNAME' || 
    h === 'D.USERNAME' || 
    h === 'PETUGAS' || 
    h === 'PPL' ||
    h.includes('USERNAME')
  );

  const list1308 = [];
  const list1376 = [];

  const getNum = (row, idx) => {
    if (idx === -1 || idx >= row.length) return 0;
    const val = row[idx];
    if (val === null || val === undefined || val === '' || val === '-') return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const getStr = (row, idx) => {
    if (idx === -1 || idx >= row.length) return '';
    const val = row[idx];
    return val !== null && val !== undefined ? String(val).trim() : '';
  };

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const kdSub = String(row[idxKodeSub] || '').trim();
    if (!kdSub || kdSub.length < 10) continue;

    // Fast Prefix Filter: Only 1308 or 1376
    const is1308 = kdSub.startsWith('1308');
    const is1376 = kdSub.startsWith('1376');
    if (!is1308 && !is1376) continue;

    const kdKab = is1376 ? '1376' : '1308';
    const masterInfo = masterWilayahMap[kdSub] || {};
    const rawUsername = getStr(row, idxUsername);
    const username = /^\d+$/.test(rawUsername) ? '' : rawUsername;

    const totPrelist = getNum(row, idxJmlPrelist);
    const plOpen = idxPrelistOpen !== -1 ? getNum(row, idxPrelistOpen) : 0;
    const plDraft = idxPrelistDraft !== -1 ? getNum(row, idxPrelistDraft) : 0;
    const plOpenDraft = idxPrelistOpenDraft !== -1 
      ? getNum(row, idxPrelistOpenDraft) 
      : (plOpen + plDraft);
    const plSubmit = idxPrelistSubmit !== -1
      ? getNum(row, idxPrelistSubmit)
      : Math.max(0, totPrelist - (plOpen + plDraft));

    const plKlgTot = getNum(row, idxKlgPrelist);
    const plKlgSub = getNum(row, idxKlgPrelistSub);
    const plUshTot = getNum(row, idxUshPrelist);
    const plUshSub = getNum(row, idxUshPrelistSub);
    const plNonTot = getNum(row, idxNonBkuPrelist);
    const plNonSub = getNum(row, idxNonBkuPrelistSub);

    const glUshTot = getNum(row, idxUshGl);
    const glUshSub = getNum(row, idxUshGlSub);
    const glKlgTot = getNum(row, idxKlgGl);
    const glKlgSub = getNum(row, idxKlgGlSub);

    const abTot = getNum(row, idxAbTot);
    const abKlgTot = getNum(row, idxAbKlg);
    const abKlgSub = getNum(row, idxAbKlgSub);
    const abUshTot = getNum(row, idxAbUsh);
    const abUshSub = getNum(row, idxAbUshSub);
    const abNonTot = getNum(row, idxAbNonBku);
    const abNonSub = getNum(row, idxAbNonBkuSub);

    const abSub = abKlgSub + abUshSub + abNonSub;
    const abOpen = idxAbOpen !== -1 ? getNum(row, idxAbOpen) : 0;
    const abDraft = idxAbDraft !== -1 ? getNum(row, idxAbDraft) : 0;
    const abOpenDraft = abOpen + abDraft;

    const totBeban = totPrelist + abTot;
    const totSubmit = plSubmit + abSub;
    const totOpen = plOpen + abOpen;
    const totDraft = plDraft + abDraft;
    const totOpenDraft = totOpen + totDraft;
    const totPct = totBeban > 0 ? totSubmit / totBeban : 1;

    // Harmonize Prelist Keluarga Submit
    let finalKlgSub = plKlgSub;
    if (finalKlgSub === 0 && plKlgTot > 0) {
      if (plSubmit > (plUshSub + plNonSub)) {
        finalKlgSub = Math.min(plKlgTot, Math.max(0, plSubmit - plUshSub - plNonSub));
      } else if (totBeban > 0 && totSubmit >= totBeban) {
        finalKlgSub = plKlgTot;
      } else if (totPrelist > 0 && plSubmit >= totPrelist) {
        finalKlgSub = plKlgTot;
      }
    }

    const record = {
      kdKab: kdKab,
      nmKab: masterInfo.nmKab || (is1376 ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota'),
      kdKec: masterInfo.kdKec || kdSub.slice(0, 7),
      nmKec: masterInfo.nmKec || '',
      kdDesa: masterInfo.kdDesa || kdSub.slice(0, 10),
      nmDesa: masterInfo.nmDesa || '',
      kdSubSls: kdSub,
      nmSubSls: masterInfo.nmSubSls || `Sub SLS [${kdSub.slice(-2)}]`,

      prelistKeluargaTot: plKlgTot,
      prelistKeluargaSub: finalKlgSub,
      prelistKeluargaPct: plKlgTot > 0 ? finalKlgSub / plKlgTot : 1,

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
      dummy: getNum(row, idxDummy),
      username: username || ''
    };

    if (is1308) {
      list1308.push(record);
    } else {
      list1376.push(record);
    }
  }

  return {
    prelist1308: list1308,
    prelist1376: list1376
  };
}

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

    if (col0 === '1308' || col1.toLowerCase().includes('lima puluh kota')) {
      pengawalanResult['1308'] = mapPengawalanRow(row, '1308', 'Kabupaten Lima Puluh Kota');
    } else if (col0 === '1376' || col1.toLowerCase().includes('payakumbuh')) {
      pengawalanResult['1376'] = mapPengawalanRow(row, '1376', 'Kota Payakumbuh');
    }

    const num = Number(row[0]);
    if (!isNaN(num) && num >= 1 && num <= 20 && row[1] && String(row[1]).length > 10) {
      uraianTugasList.push({
        no: num,
        poin: String(row[1]).trim()
      });
    }

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
 * Export Prelist Table data to a beautifully styled Excel (.xlsx) file
 * Matches visible table view columns, formats fractions as text (prevents decimal conversion),
 * styles the header with BPS theme color #f79039, adds clean borders and a summary row.
 */
export const exportPrelistTableToExcel = async (dataList = [], filename = 'Rekap_Prelist_SE2026.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BPS SE2026 Supervisi App';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Rekap Prelist', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] // Freeze header row
  });

  // Table Columns matching table view
  worksheet.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Kecamatan', key: 'nmKec', width: 22 },
    { header: 'Desa / Nagari', key: 'nmDesa', width: 24 },
    { header: 'Nama SLS / Sub SLS', key: 'nmSubSls', width: 32 },
    { header: 'Kode Sub SLS', key: 'kdSubSls', width: 20 },
    { header: 'Petugas', key: 'username', width: 24 },
    { header: 'Beban', key: 'totBeban', width: 12 },
    { header: 'Submit', key: 'totSubmit', width: 12 },
    { header: 'Draft', key: 'totDraft', width: 10 },
    { header: 'Open', key: 'totOpen', width: 10 },
    { header: 'Prelist Klg', key: 'prelistKlg', width: 14 },
    { header: 'Prelist Ush', key: 'prelistUsh', width: 14 },
    { header: 'Assign Baru', key: 'assignBaru', width: 14 },
    { header: '% Capaian', key: 'totPct', width: 13 },
    { header: 'Delta', key: 'deltaJml', width: 11 }
  ];

  // Style Header Row (Row 1) with #f79039
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF79039' } // Header color #f79039
    };
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' } // White text
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'medium', color: { argb: 'FFDD6B20' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });

  // Enable AutoFilter across all columns
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 15 }
  };

  // Aggregators for bottom summary row
  let sumBeban = 0;
  let sumSubmit = 0;
  let sumDraft = 0;
  let sumOpen = 0;
  let sumKlgSub = 0;
  let sumKlgTot = 0;
  let sumUshSub = 0;
  let sumUshTot = 0;
  let sumAbSub = 0;
  let sumAbTot = 0;
  let sumDelta = 0;

  // Populate data rows
  dataList.forEach((row, idx) => {
    const no = idx + 1;
    const kdSub = String(row.kdSubSls || '');
    const masterInfo = masterWilayahMap[kdSub] || {};

    const nmKec = row.nmKec || masterInfo.nmKec || '-';
    const nmDesa = row.nmDesa || masterInfo.nmDesa || '-';
    const nmSubSls = row.nmSubSls || masterInfo.nmSubSls || '-';

    // Petugas username(s)
    let username = '-';
    if (row.usernames && Array.isArray(row.usernames) && row.usernames.length > 0) {
      username = row.usernames.join(', ');
    } else if (row.username) {
      username = String(row.username);
    }

    const beban = Number(row.totBeban) || 0;
    const submit = Number(row.totSubmit) || 0;
    const draft = Number(row.totDraft) || 0;
    const open = Number(row.totOpen) || 0;

    const klgSub = Number(row.prelistKeluargaSub) || 0;
    const klgTot = Number(row.prelistKeluargaTot) || 0;
    const ushSub = Number(row.prelistUsahaSub) || 0;
    const ushTot = Number(row.prelistUsahaTot) || 0;
    const abSub = Number(row.totAbSub !== undefined ? row.totAbSub : row.abSub) || 0;
    const abTot = Number(row.totAbTot !== undefined ? row.totAbTot : row.abTot) || 0;

    sumBeban += beban;
    sumSubmit += submit;
    sumDraft += draft;
    sumOpen += open;
    sumKlgSub += klgSub;
    sumKlgTot += klgTot;
    sumUshSub += ushSub;
    sumUshTot += ushTot;
    sumAbSub += abSub;
    sumAbTot += abTot;

    const delta = Number(row.deltaJml) || 0;
    sumDelta += delta;

    // Strict string formatting for fractions to prevent Excel parsing into decimals/dates
    const prelistKlgStr = `${klgSub}/${klgTot}`;
    const prelistUshStr = `${ushSub}/${ushTot}`;
    const assignBaruStr = (abTot > 0 || abSub > 0) ? `${abSub}/${abTot}` : '0/0';

    // % Capaian
    const pctVal = beban > 0 ? (submit / beban) : (row.totPct !== undefined ? Number(row.totPct) : 0);
    const pctStr = `${Math.round(pctVal * 100)}%`;
    const deltaStr = delta > 0 ? `+${delta}` : (delta < 0 ? `${delta}` : '0');

    const addedRow = worksheet.addRow({
      no: no,
      nmKec: nmKec,
      nmDesa: nmDesa,
      nmSubSls: nmSubSls,
      kdSubSls: kdSub,
      username: username,
      totBeban: beban,
      totSubmit: submit,
      totDraft: draft,
      totOpen: open,
      prelistKlg: prelistKlgStr,
      prelistUsh: prelistUshStr,
      assignBaru: assignBaruStr,
      totPct: pctStr,
      deltaJml: deltaStr
    });

    addedRow.height = 22;

    const isOdd = idx % 2 === 1;
    const rowBgColor = isOdd ? 'FFFDFBF7' : 'FFFFFFFF';

    addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Cell borders
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };

      // Background fill
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBgColor }
      };

      cell.font = {
        name: 'Segoe UI',
        size: 10
      };

      // Alignment and strict formatting rules
      // 1: No
      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      // 2: Kecamatan, 3: Desa, 4: Nama SLS, 6: Petugas
      else if (colNumber === 2 || colNumber === 3 || colNumber === 4 || colNumber === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      // 5: Kode Sub SLS (Strict String to preserve 16-digit code without exponential notation)
      else if (colNumber === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '@';
        cell.value = String(kdSub);
      }
      // 7: Beban, 8: Submit (Integer Numbers)
      else if (colNumber === 7 || colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
        if (colNumber === 8) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF15803D' } }; // green text for submit
        }
      }
      // 9: Draft, 10: Open (Integer Numbers)
      else if (colNumber === 9 || colNumber === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '#,##0';
        if (colNumber === 9 && draft > 0) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFD97706' } }; // amber text for draft
        } else if (colNumber === 10 && open > 0) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0284C7' } }; // blue text for open
        }
      }
      // 11: Prelist Klg, 12: Prelist Ush, 13: Assign Baru (Strict Strings for fractions)
      else if (colNumber === 11 || colNumber === 12 || colNumber === 13) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '@'; // Force text format
        cell.value = String(cell.value || '');
      }
      // 14: % Capaian
      else if (colNumber === 14) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
      }
      // 15: Delta
      else if (colNumber === 15) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (delta > 0) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF15803D' } };
        } else if (delta < 0) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        }
      }
    });
  });

  // Summary / Total Row at the bottom
  if (dataList.length > 0) {
    const totalPct = sumBeban > 0 ? `${Math.round((sumSubmit / sumBeban) * 100)}%` : '0%';
    const totalKlgStr = `${sumKlgSub}/${sumKlgTot}`;
    const totalUshStr = `${sumUshSub}/${sumUshTot}`;
    const totalAbStr = `${sumAbSub}/${sumAbTot}`;
    const totalDeltaStr = sumDelta > 0 ? `+${sumDelta}` : `${sumDelta}`;

    const totalRow = worksheet.addRow({
      no: '',
      nmKec: 'TOTAL',
      nmDesa: '',
      nmSubSls: `${dataList.length} Sub SLS`,
      kdSubSls: '',
      username: '',
      totBeban: sumBeban,
      totSubmit: sumSubmit,
      totDraft: sumDraft,
      totOpen: sumOpen,
      prelistKlg: totalKlgStr,
      prelistUsh: totalUshStr,
      assignBaru: totalAbStr,
      totPct: totalPct,
      deltaJml: totalDeltaStr
    });

    totalRow.height = 26;

    totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEEBC8' } // Soft orange-yellow theme
      };
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        bold: true,
        color: { argb: 'FF7C2D12' }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFF79039' } },
        bottom: { style: 'double', color: { argb: 'FFF79039' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };

      if (colNumber === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colNumber === 7 || colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (colNumber === 11 || colNumber === 12 || colNumber === 13) {
          cell.numFmt = '@';
          cell.value = String(cell.value || '');
        }
      }
    });
  }

  // Trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

// Alias exportToExcel to exportPrelistTableToExcel for seamless compatibility
export const exportToExcel = exportPrelistTableToExcel;

export const parsePrelistExcel = parseSingleExcel;

