// ✅ SHEETS.JS - All functions exported to window
(function() {
  'use strict';

  // 🔍 DETECT FACTORY FROM URL PATH
  const detectFactory = function() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/bogor/')) {
      return 'bogor';
    } else if (path.includes('/karawang/')) {
      return 'karawang';
    } else {
      // Default fallback (untuk halaman root/index.html)
      console.warn('⚠️ Factory not detected from path, defaulting to "bogor"');
      return 'bogor';
    }
  };

  const CURRENT_FACTORY = detectFactory();
  console.log(`🏭 Current Factory: ${CURRENT_FACTORY.toUpperCase()}`);

  // 📊 GOOGLE SHEETS URLS - SEPARATED BY FACTORY
  const SHEETS = {
    bogor: {
      evaluasi1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZZct_V6Gx6vOn3tUmAmiM6m7m0oqRzm3UJuz14laz-BUwLQwZRm1wlwjBUilKuAtg7ApfDhCfGI-_/pub?gid=871538134&single=true&output=csv',
      evaluasi2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_cKOk-1gce3axREhzEaSMjRFnpcUbd0JVH1CnXfNgzWiA7eyQniHgHDCjcl0DUXvO7lzI1SHBIiXF/pub?gid=1385952563&single=true&output=csv'
    },
    karawang: {
      evaluasi1: '', // ⚠️ GANTI DENGAN LINK SHEET KARAWANG EVALUASI 1
      evaluasi2: '' // ⚠️ GANTI DENGAN LINK SHEET KARAWANG EVALUASI 2
    }
  };

  // ✅ VALIDATE FACTORY CONFIGURATION
  if (!SHEETS[CURRENT_FACTORY]) {
    console.error(`❌ Invalid factory detected: ${CURRENT_FACTORY}`);
    console.error('Available factories:', Object.keys(SHEETS).join(', '));
    throw new Error(`Invalid factory: ${CURRENT_FACTORY}. Available: ${Object.keys(SHEETS).join(', ')}`);
  }

  console.log(`📊 Available sheets for ${CURRENT_FACTORY}:`, Object.keys(SHEETS[CURRENT_FACTORY]).join(', '));

  // Parse CSV
  const parseCSV = function(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    return rows.map(line => {
      const fields = [];
      let inQuotes = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());
      return {
        timestamp: fields[0] || '',
        nama: fields[2] || '',
        departemen: fields[3] || ''
      };
    });
  };

  // Fetch Google Sheet - UPDATED TO USE FACTORY
  const fetchSheet = async function(type) {
    // Validate type
    if (!SHEETS[CURRENT_FACTORY][type]) {
      console.error(`❌ Unknown sheet type: ${type} for factory ${CURRENT_FACTORY}`);
      console.error('Available types:', Object.keys(SHEETS[CURRENT_FACTORY]).join(', '));
      throw new Error(`Unknown sheet type: ${type}. Available for ${CURRENT_FACTORY}: ${Object.keys(SHEETS[CURRENT_FACTORY]).join(', ')}`);
    }

    try {
      console.log(`📊 [${CURRENT_FACTORY.toUpperCase()}] Fetching sheet: ${type}...`);
      const res = await fetch(SHEETS[CURRENT_FACTORY][type], { 
        method: 'GET', 
        headers: { 'Accept': 'text/csv' } 
      });
      console.log(`📊 Response status: ${res.status}`);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const csv = await res.text();
      console.log(`📊 CSV fetched: ${csv.length} chars`);
      
      const data = parseCSV(csv);
      console.log(`📊 Parsed: ${data.length} rows`);
      
      const filtered = data.filter(d => d.nama && d.departemen);
      console.log(`📊 Filtered: ${filtered.length} complete rows`);
      
      return filtered;
    } catch (error) {
      console.error(`❌ Error in fetchSheet (${CURRENT_FACTORY}/${type}):`, error);
      throw error;
    }
  };

  // Get unique names
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

  // Group by department
  const groupByDepartmentFiltered = function(data) {
    const uniqueData = uniqueByName(data);
    const map = {};
    for (const item of uniqueData) {
      const dept = item.departemen;
      if (!map[dept]) map[dept] = [];
      map[dept].push(item);
    }
    return map;
  };

  // Get department summary
  const getDepartmentSummary = function(data) {
    console.log(`🔍 [${CURRENT_FACTORY.toUpperCase()}] getDepartmentSummary called with`, data.length, 'rows');
    if (!data || data.length === 0) return [];
    const grouped = groupByDepartmentFiltered(data);
    return Object.entries(grouped).map(([departemen, items]) => ({
      departemen,
      jumlah: items.length
    }));
  };

  // Find duplicate names
  const findDuplicateNames = function(data) {
    const count = {};
    const normalized = data.map(d => {
      const key = d.nama.trim().toLowerCase();
      count[key] = (count[key] || 0) + 1;
      return { ...d, _key: key };
    });
    return normalized.filter(d => count[d._key] > 1);
  };

  // Export to CSV
  const exportToCSV = function(filename, rows) {
    if (!rows || rows.length === 0) {
      console.warn('⚠️ No data to export');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const escapedRows = rows.map(row => Object.values(row).map(val => {
      if (val == null) return '""';
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(','));
    const csv = [headers, ...escapedRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`✅ Exported ${rows.length} rows to ${filename}`);
  };

  // Export department detail - UPDATED TO USE FACTORY
  const exportDepartemenDetail = async function(type) {
    if (!SHEETS[CURRENT_FACTORY][type]) {
      throw new Error(`Unknown sheet type: ${type} for factory ${CURRENT_FACTORY}`);
    }
    
    const data = await fetchSheet(type);
    const grouped = groupByDepartmentFiltered(data);
    const rows = [];
    for (const [dept, items] of Object.entries(grouped)) {
      for (const item of items) {
        rows.push({ 
          factory: CURRENT_FACTORY.toUpperCase(),
          departemen: dept, 
          nama: item.nama, 
          timestamp: item.timestamp 
        });
      }
    }
    const filename = `${CURRENT_FACTORY}_detail_departemen_unik_${type}.csv`;
    exportToCSV(filename, rows);
  };

  // Export double input - UPDATED TO USE FACTORY
  const exportDoubleInput = async function(type) {
    if (!SHEETS[CURRENT_FACTORY][type]) {
      throw new Error(`Unknown sheet type: ${type} for factory ${CURRENT_FACTORY}`);
    }
    
    const data = await fetchSheet(type);
    const doubles = findDuplicateNames(data);
    const clean = doubles.map(({ _key, ...rest }) => rest);
    const filename = `${CURRENT_FACTORY}_double_input_${type}.csv`;
    exportToCSV(filename, clean);
  };

  // ✅ EXPORT CURRENT FACTORY INFO
  const getCurrentFactory = function() {
    return CURRENT_FACTORY;
  };

  const getFactoryConfig = function() {
    return {
      factory: CURRENT_FACTORY,
      availableSheets: Object.keys(SHEETS[CURRENT_FACTORY])
    };
  };

  // Export to window - this is critical!
  window.parseCSV = parseCSV;
  window.fetchSheet = fetchSheet;
  window.uniqueByName = uniqueByName;
  window.groupByDepartmentFiltered = groupByDepartmentFiltered;
  window.getDepartmentSummary = getDepartmentSummary;
  window.findDuplicateNames = findDuplicateNames;
  window.exportToCSV = exportToCSV;
  window.exportDepartemenDetail = exportDepartemenDetail;
  window.exportDoubleInput = exportDoubleInput;
  window.getCurrentFactory = getCurrentFactory;
  window.getFactoryConfig = getFactoryConfig;

  console.log('%c✅ sheets.js loaded - All functions ready!', 'color: green; font-weight: bold; font-size: 13px');
  console.log(`🏭 Factory: ${CURRENT_FACTORY.toUpperCase()}`);
  console.log(`📊 Available sheets:`, Object.keys(SHEETS[CURRENT_FACTORY]).join(', '));
  console.log('  ✓ fetchSheet:', typeof window.fetchSheet);
  console.log('  ✓ uniqueByName:', typeof window.uniqueByName);
  console.log('  ✓ getDepartmentSummary:', typeof window.getDepartmentSummary);
  console.log('  ✓ getCurrentFactory:', typeof window.getCurrentFactory);
  console.log('  ✓ getFactoryConfig:', typeof window.getFactoryConfig);

})();