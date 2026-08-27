/**
 * Service to interact with Google Apps Script Web App (Spreadsheet Database)
 */

const STORAGE_KEY_GAS_URL = 'se2026_gas_webapp_url';
export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwMTz_29r3TDgPfMhLaSFBWMQc8kYeSDr7h5skedfzobyioSS4AjOfaiUgyb35lbxOx/exec';

export const getGasUrl = () => {
  return localStorage.getItem(STORAGE_KEY_GAS_URL) || DEFAULT_GAS_URL;
};

export const setGasUrl = (url) => {
  localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
};

/**
 * Test connectivity with Google Apps Script Web App
 */
export const testGasConnection = async (url) => {
  const targetUrl = (url || getGasUrl()).trim();
  if (!targetUrl) throw new Error('URL Google Apps Script belum diisi.');

  try {
    const res = await fetch(`${targetUrl}?action=ping`, {
      method: 'GET',
      mode: 'cors'
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(`Gagal terhubung ke Google Apps Script: ${err.message}`);
  }
};

/**
 * Fetch all datasets from Google Spreadsheet
 */
export const fetchDatasetsFromGas = async (url) => {
  const targetUrl = (url || getGasUrl()).trim();
  if (!targetUrl) throw new Error('URL Google Apps Script belum diatur.');

  try {
    const res = await fetch(`${targetUrl}?action=getAllData`, {
      method: 'GET',
      mode: 'cors'
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const result = await res.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal mengambil data dari Google Spreadsheet');
    }
    return result.data;
  } catch (err) {
    throw new Error(`Gagal membaca database Google Sheets: ${err.message}`);
  }
};

/**
 * Sync / Push datasets to Google Spreadsheet
 */
export const pushDatasetsToGas = async (url, payload) => {
  const targetUrl = (url || getGasUrl()).trim();
  if (!targetUrl) throw new Error('URL Google Apps Script belum diatur.');

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'saveAllData',
        payload: payload,
        timestamp: new Date().toISOString()
      })
    });

    const result = await res.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Gagal menyimpan ke Google Spreadsheet');
    }
    return result;
  } catch (err) {
    throw new Error(`Gagal sinkronisasi ke Google Sheets: ${err.message}`);
  }
};
