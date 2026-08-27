/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT BACKEND - SE2026 SUPERVISI & PENGAWALAN KUALITAS
 * Wilayah: Kabupaten Lima Puluh Kota (1308) & Kota Payakumbuh (1376)
 * ==============================================================================
 * 
 * CARA SETUP:
 * 1. Buka Google Spreadsheet baru (atau yang sudah ada).
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus kode bawaan, lalu paste seluruh isi file ini.
 * 4. Simpan, lalu klik 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment).
 *    - Jenis: Aplikasi Web (Web app)
 *    - Jalankan sebagai: Saya (Me)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone)
 * 5. Salin URL Web App dan tempelkan ke menu "Database GAS" di aplikasi web.
 * ==============================================================================
 */

/**
 * Menu Kustom di Google Spreadsheet saat dibuka
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 SE2026 Supervisi')
    .addItem('⚡ 1. Inisialisasi Sheet Struktur Tabel', 'setupSpreadsheet')
    .addItem('🚀 2. Filter & Proses Otomatis 1308 & 1376 dari Sheet RAW_DATA', 'filterRawDataToKabkot')
    .addSeparator()
    .addItem('ℹ️ 3. Petunjuk & Status API', 'showApiInstructions')
    .addToUi();
}

/**
 * Endpoint GET: Digunakan oleh Web App untuk mengambil data atau trigger sync
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'ping') {
    return createJsonResponse({
      status: 'success',
      message: 'Koneksi ke Google Spreadsheet berhasil aktif.',
      timestamp: new Date()
    });
  }

  if (action === 'getAllData') {
    try {
      var data = {
        pengawalan: getPengawalanData(ss),
        uraianTugas: getUraianTugasData(ss),
        prelist1308: getSheetJsonData(ss, 'Prelist_1308'),
        prelist1376: getSheetJsonData(ss, 'Prelist_1376')
      };

      return createJsonResponse({
        status: 'success',
        data: data,
        counts: {
          prelist1308: data.prelist1308.length,
          prelist1376: data.prelist1376.length
        },
        timestamp: new Date()
      });
    } catch (err) {
      return createJsonResponse({
        status: 'error',
        message: err.toString()
      });
    }
  }

  if (action === 'filterNow') {
    try {
      var result = filterRawDataToKabkot();
      return createJsonResponse({
        status: 'success',
        message: 'Filter data 1308 & 1376 berhasil dijalankan.',
        result: result,
        timestamp: new Date()
      });
    } catch (err) {
      return createJsonResponse({
        status: 'error',
        message: err.toString()
      });
    }
  }

  return createJsonResponse({
    status: 'success',
    message: 'SE2026 Supervisi Apps Script Backend Ready'
  });
}

/**
 * Endpoint POST: Digunakan oleh Web App untuk push / simpan data ke Google Spreadsheet
 */
function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'saveAllData') {
      if (payload.pengawalan) savePengawalanData(ss, payload.pengawalan);
      if (payload.uraianTugas) saveUraianTugasData(ss, payload.uraianTugas);
      if (payload.prelist1308) saveSheetJsonData(ss, 'Prelist_1308', payload.prelist1308);
      if (payload.prelist1376) saveSheetJsonData(ss, 'Prelist_1376', payload.prelist1376);

      return createJsonResponse({
        status: 'success',
        message: 'Data berhasil disinkronkan ke Google Spreadsheet.',
        timestamp: new Date()
      });
    }

    if (action === 'savePrelist') {
      if (payload.targetKab === '1308' || payload.prelist1308) {
        saveSheetJsonData(ss, 'Prelist_1308', payload.prelist1308 || payload.data);
      }
      if (payload.targetKab === '1376' || payload.prelist1376) {
        saveSheetJsonData(ss, 'Prelist_1376', payload.prelist1376 || payload.data);
      }

      return createJsonResponse({
        status: 'success',
        message: 'Data Prelist berhasil diperbarui di Google Spreadsheet.',
        timestamp: new Date()
      });
    }

    return createJsonResponse({
      status: 'error',
      message: 'Aksi POST tidak dikenali.'
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * Inisialisasi struktur sheet otomatis
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ['Pengawalan', 'Prelist_1308', 'Prelist_1376', 'Uraian_Tugas', 'RAW_DATA'];
  
  sheets.forEach(function(sname) {
    var s = ss.getSheetByName(sname);
    if (!s) {
      ss.insertSheet(sname);
    }
  });

  var ui = SpreadsheetApp.getUi();
  if (ui) {
    ui.alert('Inisialisasi Berhasil', 'Struktur sheet (Pengawalan, Prelist_1308, Prelist_1376, Uraian_Tugas, RAW_DATA) telah siap digunakan!', ui.ButtonSet.OK);
  }
}

/**
 * Filter otomatis dari sheet RAW_DATA (SQL Lab UMKM se-Sumbar) ke Prelist_1308 dan Prelist_1376
 */
function filterRawDataToKabkot() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawSheet = ss.getSheetByName('RAW_DATA');
  
  if (!rawSheet) {
    throw new Error('Sheet "RAW_DATA" belum ada. Buat sheet RAW_DATA dan paste data SQL Lab UMKM di sana.');
  }

  var rawValues = rawSheet.getDataRange().getValues();
  if (rawValues.length < 2) {
    throw new Error('Sheet RAW_DATA masih kosong atau belum ada data.');
  }

  var headers = rawValues[0].map(function(h) { return String(h).trim().toUpperCase(); });
  var idxKodeSub = headers.indexOf('KODE_SUB_SLS');
  
  if (idxKodeSub === -1) {
    throw new Error('Kolom KODE_SUB_SLS tidak ditemukan di sheet RAW_DATA.');
  }

  var list1308 = [];
  var list1376 = [];

  for (var r = 1; r < rawValues.length; r++) {
    var row = rawValues[r];
    var kdSub = String(row[idxKodeSub] || '').trim();
    if (!kdSub) continue;

    if (kdSub.indexOf('1308') === 0) {
      list1308.push(mapRowToObject(headers, row, kdSub, '1308'));
    } else if (kdSub.indexOf('1376') === 0) {
      list1376.push(mapRowToObject(headers, row, kdSub, '1376'));
    }
  }

  // Simpan ke masing-masing sheet
  if (list1308.length > 0) saveSheetJsonData(ss, 'Prelist_1308', list1308);
  if (list1376.length > 0) saveSheetJsonData(ss, 'Prelist_1376', list1376);

  var msg = 'Filter Selesai: ' + list1308.length + ' baris Kab. Lima Puluh Kota & ' + list1376.length + ' baris Kota Payakumbuh berhasil diproses!';
  Logger.log(msg);

  try {
    var ui = SpreadsheetApp.getUi();
    if (ui) ui.alert('Proses Sukses', msg, ui.ButtonSet.OK);
  } catch (e) {}

  return {
    count1308: list1308.length,
    count1376: list1376.length
  };
}

function mapRowToObject(headers, row, kdSub, kdKab) {
  var d = {};
  for (var c = 0; c < headers.length; c++) {
    d[headers[c]] = row[c];
  }

  var getNum = function(key) {
    var val = d[key];
    if (val === undefined || val === null || val === '' || val === '-') return 0;
    var n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  var totPrelist = getNum('JUMLAH_PRELIST');
  var plOpen = getNum('JUMLAH_PRELIST_OPEN');
  var plDraft = getNum('JUMLAH_PRELIST_DRAFT');
  var plOpenDraft = (d['JUMLAH_PRELIST_OPEN_DRAFT'] !== undefined) ? getNum('JUMLAH_PRELIST_OPEN_DRAFT') : (plOpen + plDraft);
  var plSubmit = (d['JUMLAH_PRELIST_SELAIN_OPEN_DRAFT'] !== undefined) ? getNum('JUMLAH_PRELIST_SELAIN_OPEN_DRAFT') : Math.max(0, totPrelist - (plOpen + plDraft));

  var plKlgTot = getNum('JUMLAH_KELUARGA_PRELIST');
  var plKlgSub = getNum('KELUARGA_PRELIST_SUBMIT');
  var plUshTot = getNum('JUMLAH_USAHA_PRELIST');
  var plUshSub = getNum('USAHA_PRELIST_SUBMIT');
  var plNonTot = getNum('JUMLAH_NONBKU_PRELIST');
  var plNonSub = getNum('NONBKU_PRELIST_SUBMIT');

  var glUshTot = getNum('JUMLAH_USAHA_GENERAL_LINK');
  var glUshSub = getNum('USAHA_GENERAL_LINK_SUBMIT');
  var glKlgTot = getNum('JUMLAH_KELUARGA_GENERAL_LINK');
  var glKlgSub = getNum('KELUARGA_GENERAL_LINK_SUBMIT');

  var abTot = getNum('JUMLAH_ASSIGNMENT_BARU');
  var abKlgTot = getNum('JUMLAH_KELUARGA_BARU');
  var abKlgSub = getNum('KELUARGA_BARU_SUBMIT');
  var abUshTot = getNum('JUMLAH_USAHA_BARU');
  var abUshSub = getNum('USAHA_BARU_SUBMIT');
  var abNonTot = getNum('JUMLAH_NONBKU_BARU');
  var abNonSub = getNum('NONBKU_BARU_SUBMIT');

  var abSub = abKlgSub + abUshSub + abNonSub;
  var abOpen = getNum('JUMLAH_BARU_OPEN');
  var abDraft = getNum('JUMLAH_BARU_DRAFT') || getNum('JUMLAH_BARU_STATUS_DRAFT');
  var abOpenDraft = abOpen + abDraft;

  var totBeban = totPrelist + abTot;
  var totSubmit = plSubmit + abSub;
  var totOpen = plOpen + abOpen;
  var totDraft = plDraft + abDraft;
  var totOpenDraft = totOpen + totDraft;
  var totPct = totBeban > 0 ? (totSubmit / totBeban) : 1;

  return {
    kdKab: kdKab,
    nmKab: kdKab === '1376' ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota',
    kdKec: kdSub.slice(0, 7),
    nmKec: '',
    kdDesa: kdSub.slice(0, 10),
    nmDesa: '',
    kdSubSls: kdSub,
    nmSubSls: 'Sub SLS [' + kdSub.slice(-2) + ']',

    prelistKeluargaTot: plKlgTot,
    prelistKeluargaSub: plKlgSub,
    prelistKeluargaPct: plKlgTot > 0 ? (plKlgSub / plKlgTot) : 1,

    prelistUsahaTot: plUshTot,
    prelistUsahaSub: plUshSub,
    prelistUsahaPct: plUshTot > 0 ? (plUshSub / plUshTot) : 1,

    prelistNonBkuTot: plNonTot,
    prelistNonBkuSub: plNonSub,
    prelistNonBkuPct: plNonTot > 0 ? (plNonSub / plNonTot) : 1,

    totPrelistTot: totPrelist,
    totPrelistSub: plSubmit,
    totPrelistPct: totPrelist > 0 ? (plSubmit / totPrelist) : 1,
    prelistOpen: plOpen,
    prelistDraft: plDraft,
    prelistOpenDraft: plOpenDraft,

    glKeluargaTot: glKlgTot,
    glKeluargaSub: glKlgSub,
    glKeluargaPct: glKlgTot > 0 ? (glKlgSub / glKlgTot) : 1,

    glUsahaTot: glUshTot,
    glUsahaSub: glUshSub,
    glUsahaPct: glUshTot > 0 ? (glUshSub / glUshTot) : 1,

    abKeluargaTot: abKlgTot,
    abKeluargaSub: abKlgSub,
    abKeluargaPct: abKlgTot > 0 ? (abKlgSub / abKlgTot) : 1,

    abUsahaTot: abUshTot,
    abUsahaSub: abUshSub,
    abUsahaPct: abUshTot > 0 ? (abUshSub / abUshTot) : 1,

    abNonBkuTot: abNonTot,
    abNonBkuSub: abNonSub,
    abNonBkuPct: abNonTot > 0 ? (abNonSub / abNonTot) : 1,

    totAbTot: abTot,
    totAbSub: abSub,
    totAbPct: abTot > 0 ? (abSub / abTot) : 1,
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
    dummy: getNum('JUMLAH_DUMMY'),
    username: String(d['CURRENT_USER_USERNAME'] || d['USERNAME'] || d['D.USERNAME'] || d['PETUGAS'] || d['PPL'] || '').trim()
  };
}

/**
 * Helpers Database Sheets
 */
function getSheetJsonData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  
  var headers = values[0];
  var list = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var item = {};
    for (var c = 0; c < headers.length; c++) {
      item[headers[c]] = row[c];
    }
    list.push(item);
  }
  return list;
}

function saveSheetJsonData(ss, sheetName, dataList) {
  if (!dataList || dataList.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  
  sheet.clear();
  var headers = Object.keys(dataList[0]);
  var rows = [headers];
  
  dataList.forEach(function(item) {
    var row = [];
    headers.forEach(function(h) {
      row.push(item[h] !== undefined ? item[h] : '');
    });
    rows.push(row);
  });
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}

function getPengawalanData(ss) {
  var list = getSheetJsonData(ss, 'Pengawalan');
  var map = {};
  list.forEach(function(item) {
    if (item.kodeKab) map[String(item.kodeKab)] = item;
  });
  return map;
}

function savePengawalanData(ss, pengawalanMap) {
  var list = [];
  Object.keys(pengawalanMap).forEach(function(k) {
    list.push(pengawalanMap[k]);
  });
  saveSheetJsonData(ss, 'Pengawalan', list);
}

function getUraianTugasData(ss) {
  return getSheetJsonData(ss, 'Uraian_Tugas');
}

function saveUraianTugasData(ss, tasks) {
  saveSheetJsonData(ss, 'Uraian_Tugas', tasks);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function showApiInstructions() {
  var ui = SpreadsheetApp.getUi();
  var html = '<h3>Petunjuk Penggunaan:</h3>' +
    '<p>1. Copy & Paste data mentah SQL Lab UMKM ke sheet <strong>RAW_DATA</strong>.</p>' +
    '<p>2. Jalankan menu <strong>"2. Filter & Proses Otomatis 1308 & 1376"</strong>.</p>' +
    '<p>3. Di aplikasi web, tekan tombol <strong>"Sinkronkan dari Google Spreadsheet"</strong>.</p>';
  ui.alert('Petunjuk Integrasi Web SE2026', '1. Tempel data di sheet RAW_DATA.\n2. Klik menu 2. Filter & Proses Otomatis.\n3. Buka web dan klik Sinkronkan.', ui.ButtonSet.OK);
}
