// ✅ SHEETS.JS - DIRECT APPS SCRIPT INTEGRATION
(function() {
  'use strict';

  // ==========================================
  // 1. KONFIGURASI URL WEB APP
  // ==========================================
  // ⚠️ PENTING: Ganti URL di bawah ini dengan URL Deployment Web App Anda
  // Contoh: https://script.google.com/macros/s/AKfycbx.../exec
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqTbqQY6C-AwxvZO7HeAXpIqeNMtA2CiO3X4z-OeRi_iFhYrW82kwQ8efmQFCVPmw22w/exec'; 

  // ==========================================
  // 2. DETECT FACTORY FROM URL PATH
  // ==========================================
  const detectFactory = function() { 
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/bogor/')) {
      return 'bogor';
    } else if (path.includes('/karawang/')) {
      return 'karawang';
    } else {
      console.warn('⚠️ Factory not detected in URL path. Defaulting to "bogor".');
      return 'bogor';
    }
  };

  const CURRENT_FACTORY = detectFactory();
  console.log(`🏭 [SYSTEM] Current Factory: ${CURRENT_FACTORY.toUpperCase()}`);

  // ==========================================
  // 3. CORE FUNCTIONS (APPS SCRIPT CONNECTOR)
  // ==========================================

  // Fetch Data from Apps Script (Replacing CSV Fetch)
  // Memanggil: SCRIPT_URL?action=getAllResponses&factory=bogor
  const fetchSheet = async function(type) {
    // type disini sebenarnya tidak terlalu dipakai karena Apps Script 
    // mengembalikan semua data berdasarkan factory, tapi kita pertahankan 
    // untuk konsistensi nama fungsi.
    
    if (SCRIPT_URL.includes('DEPLOYMENT_ID_ANDA')) {
      console.error('❌ ERROR: SCRIPT_URL belum dikonfigurasi!');
      alert('Error: URL Web App belum diatur di sheets.js');
      throw new Error('Script URL not configured');
    }

    try {
      console.log(`📡 [FETCH] Requesting data for ${CURRENT_FACTORY.toUpperCase()} from Apps Script...`);
      
      // Kita memanggil endpoint getAllResponses dengan filter factory
      const url = `${SCRIPT_URL}?action=getAllResponses&factory=${CURRENT_FACTORY}`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      
      const json = await res.json();
      
      // Apps Script mengembalikan array langsung
      if (!Array.isArray(json)) {
        console.warn('⚠️ Response is not an array, checking structure...', json);
        // Kadang jika error, apps script return object {error: ...}
        if (json.error) throw new Error(json.error);
      }

      console.log(`✅ [SUCCESS] Received ${json.length} rows from Apps Script`);
      
      // Normalisasi data agar sesuai format internal sheets.js
      // Apps Script return: {timestamp, factory, nilai, nik, nama, departemen}
      // Kita pastikan key-nya konsisten
      const data = json.map(row => ({
        timestamp: row.timestamp || '',
        factory: row.factory || CURRENT_FACTORY,
        nilai: row.nilai || 0,
        nik: row.nik || '',
        nama: row.nama || '',
        departemen: row.departemen || ''
      }));

      return data;
      
    } catch (error) {
      console.error(`❌ [ERROR] Failed to fetch from Apps Script:`, error);
      throw error;
    }
  };

  // ==========================================
  // 4. DATA PROCESSING HELPERS
  // ==========================================

  // Parse CSV (Tetap dipertahankan jika suatu saat butuh parse manual, 
  // tapi saat ini tidak dipakai karena langsung JSON dari Apps Script)
  const parseCSV = function(csvText) {
    // ... (kode parseCSV lama bisa dihapus atau dibiarkan sebagai fallback)
    return []; 
  };

  // Get Unique Names (Remove duplicates based on Name)
  const uniqueByName = function(data) {
    const seen = new Map();
    const result = [];
    for (const item of data) {
      const key = item.nama.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, true);
        result.push(item);
      }
    }
    return result;
  };

  // Group by Department
  const groupByDepartmentFiltered = function(data) {
    const uniqueData = uniqueByName(data);
    const map = {};
    for (const item of uniqueData) {
      const dept = item.departemen || 'Unknown Dept';
      if (!map[dept]) map[dept] = [];
      map[dept].push(item);
    }
    return map;
  };

  // Get Department Summary
  const getDepartmentSummary = function(data) {
    if (!data || data.length === 0) return [];
    const grouped = groupByDepartmentFiltered(data);
    return Object.entries(grouped).map(([departemen, items]) => ({
      departemen,
      jumlah: items.length
    }));
  };

  // Find Duplicate Names (Untuk Deteksi Double Input di Dashboard)
  const findDuplicateNames = function(data) {
    const count = {};
    const normalized = data.map(d => {
      const key = d.nama.trim().toLowerCase();
      count[key] = (count[key] || 0) + 1;
      return { ...d, _key: key };
    });
    return normalized.filter(d => count[d._key] > 1);
  };

  // ==========================================
  // 5. EXPORT FUNCTIONS
  // ==========================================

  // Export Data to CSV File
  const exportToCSV = function(filename, rows) {
    if (!rows || rows.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const escapedRows = rows.map(row => Object.values(row).map(val => {
      if (val == null) return '""';
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(','));
    
    const csvContent = [headers, ...escapedRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`💾 [EXPORT] Downloaded ${filename}`);
  };

  // Export Department Detail
  const exportDepartemenDetail = async function(type) {
    try {
      // type tidak terlalu berpengaruh karena fetchSheet mengambil semua data factory
      const data = await fetchSheet(type); 
      const grouped = groupByDepartmentFiltered(data);
      const rows = [];
      
      for (const [dept, items] of Object.entries(grouped)) {
        for (const item of items) {
          rows.push({ 
            factory: CURRENT_FACTORY.toUpperCase(),
            departemen: dept, 
            nama: item.nama, 
            nik: item.nik,
            nilai: item.nilai,
            timestamp: item.timestamp 
          });
        }
      }
      
      const filename = `${CURRENT_FACTORY}_detail_departemen.csv`;
      exportToCSV(filename, rows);
    } catch (e) {
      console.error("Export Detail Failed:", e);
      alert("Gagal mengambil data: " + e.message);
    }
  };

  // Export Double Input (Potential Duplicates found in Sheet)
  const exportDoubleInput = async function(type) {
    try {
      const data = await fetchSheet(type);
      const doubles = findDuplicateNames(data);
      
      // Hapus properti internal _key
      const clean = doubles.map(({ _key, ...rest }) => rest);
      
      const filename = `${CURRENT_FACTORY}_double_input_check.csv`;
      
      if (clean.length === 0) {
        alert("✅ Tidak ditemukan data double input (Nama Kembar) di sheet ini.");
        return;
      }
      
      exportToCSV(filename, clean);
    } catch (e) {
      console.error("Export Double Input Failed:", e);
      alert("Gagal memeriksa double input: " + e.message);
    }
  };

  // ==========================================
  // 6. EXPORT TO WINDOW (PUBLIC API)
  // ==========================================
  window.fetchSheet = fetchSheet;
  window.uniqueByName = uniqueByName;
  window.groupByDepartmentFiltered = groupByDepartmentFiltered;
  window.getDepartmentSummary = getDepartmentSummary;
  window.findDuplicateNames = findDuplicateNames;
  window.exportToCSV = exportToCSV;
  window.exportDepartemenDetail = exportDepartemenDetail;
  window.exportDoubleInput = exportDoubleInput;
  
  // Info Helpers
  window.getCurrentFactory = function() { return CURRENT_FACTORY; };
  window.getScriptUrl = function() { return SCRIPT_URL; };

  console.log('%c✅ sheets.js LOADED (Apps Script Mode)', 'color: green; font-weight: bold; background: #e9fbf0; padding: 5px;');
  console.log(`🏭 Active Factory: ${CURRENT_FACTORY.toUpperCase()}`);
  console.log(`🔗 Target Script: ${SCRIPT_URL}`);

})();