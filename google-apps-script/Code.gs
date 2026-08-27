/**
 * Google Apps Script Backend for SE2026 Supervisi & Pengawalan App
 * Wilayah: Kabupaten Lima Puluh Kota (1308) & Kota Payakumbuh (1376)
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Koneksi ke Google Spreadsheet berhasil aktif.',
      timestamp: new Date()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getAllData') {
    try {
      var data = {
        pengawalan: getPengawalanData(ss),
        uraianTugas: getUraianTugasData(ss),
        prelist1308: getSheetJsonData(ss, 'Prelist_1308'),
        prelist1376: getSheetJsonData(ss, 'Prelist_1376')
      };

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'SE2026 Supervisi API Ready'
  })).setMimeType(ContentService.MimeType.JSON);
}

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

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data berhasil disinkronkan ke Google Spreadsheet.',
        timestamp: new Date()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Aksi POST tidak valid'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Inisialisasi struktur sheet otomatis
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ['Pengawalan', 'Prelist_1308', 'Prelist_1376', 'Uraian_Tugas'];
  
  sheets.forEach(function(sname) {
    var s = ss.getSheetByName(sname);
    if (!s) {
      ss.insertSheet(sname);
    }
  });
  Logger.log('Inisialisasi Sheet selesai!');
}

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
