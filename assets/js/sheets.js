// ✅ SHEETS.JS - ZINUS GLOBAL (FULL COMPATIBLE + STRICT FACTORY FILTER)
(function() {
  'use strict';

  // ==========================================
  // 1. KONFIGURASI & DETEKSI FACTORY
  // ==========================================
  
  // ⚠️ PENTING: Ganti URL ini dengan URL Web App Anda
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqTbqQY6C-AwxvZO7HeAXpIqeNMtA2CiO3X4z-OeRi_iFhYrW82kwQ8efmQFCVPmw22w/exec'; 

  // Fungsi Deteksi Factory berdasarkan URL Browser
  const detectFactory = function() { 
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/karawang/')) {
      return 'karawang';
    } else if (path.includes('/bogor/')) {
      return 'bogor';
    } else {
      // Fallback default jika URL tidak jelas
      console.warn('⚠️ Factory not detected in URL path. Defaulting to "bogor".');
      return 'bogor';
    }
  };

  const CURRENT_FACTORY = detectFactory();
  console.log(`🏭 [SYSTEM] Current Factory: ${CURRENT_FACTORY.toUpperCase()}`);

  // ==========================================
  // 2. CORE FUNCTIONS (FETCH DATA)
  // ==========================================

  // Fetch All Employees (Master List)
  const fetchAllEmployees = async function() {
    try {
      console.log(`📊 [${CURRENT_FACTORY}] Fetching employees for ${CURRENT_FACTORY}...`);
      // Mengirim parameter factory ke backend
      const url = `${SCRIPT_URL}?action=getAllEmployees&factory=${CURRENT_FACTORY}`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      // Validasi: Pastikan data array
      if (!Array.isArray(data)) {
        console.warn('⚠️ Response is not an array, checking structure...', data);
        if (data.error) throw new Error(data.error);
        return [];
      }
      
      console.log(`📊 [${CURRENT_FACTORY}] Employees fetched: ${data.length} rows`);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in fetchAllEmployees:`, error);
      throw error;
    }
  };

  // Fetch All Responses (Data yang sudah diisi)
  const fetchAllResponses = async function() {
    try {
      console.log(`📊 [${CURRENT_FACTORY}] Fetching responses for ${CURRENT_FACTORY}...`);
      // Mengirim parameter factory ke backend
      const url = `${SCRIPT_URL}?action=getAllResponses&factory=${CURRENT_FACTORY}`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ Response is not an array, checking structure...', data);
        if (data.error) throw new Error(data.error);
        return [];
      }
      
      console.log(`📊 [${CURRENT_FACTORY}] Responses fetched: ${data.length} rows`);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in fetchAllResponses:`, error);
      throw error;
    }
  };

  // Get Form Status
  const getFormStatus = async function() {
    try {
      const url = `${SCRIPT_URL}?action=getFormStatus`;
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error(`❌ Error in getFormStatus:`, error);
      throw error;
    }
  };

  // Get Employee by NIK
  const getEmployeeByNik = async function(nik) {
    try {
      const url = `${SCRIPT_URL}?action=getEmployee&nik=${encodeURIComponent(nik)}`;
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error(`❌ Error in getEmployeeByNik:`, error);
      throw error;
    }
  };

  // Get Questions
  const getQuestions = async function() {
    try {
      const url = `${SCRIPT_URL}?action=getQuestions`;
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error(`❌ Error in getQuestions:`, error);
      throw error;
    }
  };

  // Submit Evaluation
  const submitEvaluation = async function(formData) {
    try {
      console.log(`📤 [${CURRENT_FACTORY}] Submitting evaluation...`);
      const res = await fetch(SCRIPT_URL, { 
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error(`❌ Error in submitEvaluation:`, error);
      throw error;
    }
  };

  // ==========================================
  // 3. DATA PROCESSING (STRICT FACTORY LOGIC)
  // ==========================================

  // Get All Unique Departments (Hanya untuk factory ini)
  const getAllDepartments = async function() {
    const employees = await fetchAllEmployees();
    const deptSet = new Set();
    
    employees.forEach(emp => {
      // Pastikan factory cocok (defensive)
      if (emp.factory && emp.factory.toLowerCase() !== CURRENT_FACTORY) return;
      
      if (emp.departemen) {
        deptSet.add(emp.departemen);
      }
    });
    
    return Array.from(deptSet).sort();
  };

  // Get Department Summary (Total vs Done vs Pending)
  // LOGIKA: Filter Master List & Response berdasarkan Factory saat ini
  const getDepartmentSummary = async function() {
    const allEmployees = await fetchAllEmployees();
    const allResponses = await fetchAllResponses();
    
    // 1. FILTER EMPLOYEES: Hanya ambil karyawan factory ini
    const factoryEmployees = allEmployees.filter(emp => {
      // Cek kolom factory jika ada, atau asumsikan data sudah difilter server
      // Jika data dari server sudah bersih, filter ini hanya safety belt
      if (emp.factory) {
        return emp.factory.toLowerCase() === CURRENT_FACTORY;
      }
      return true; 
    });

    // 2. MAP RESPONSES: Buat lookup cepat berdasarkan NIK
    const responseMap = {};
    allResponses.forEach(r => {
      responseMap[r.nik] = r;
    });
    
    // 3. GROUP BY DEPARTMENT
    const deptMap = {};
    
    factoryEmployees.forEach(emp => {
      const dept = emp.departemen || 'Unknown Dept';
      
      if (!deptMap[dept]) {
        deptMap[dept] = {
          departemen: dept,
          total: 0,
          done: 0,
          pending: 0
        };
      }
      
      deptMap[dept].total++;
      
      // Cek apakah NIK ini sudah ada di responseMap
      if (responseMap[emp.nik]) {
        deptMap[dept].done++;
      } else {
        deptMap[dept].pending++;
      }
    });
    
    return Object.values(deptMap).sort((a, b) => a.departemen.localeCompare(b.departemen));
  };

  // Get Completion Status Detail (List Nama per Dept)
  const getDepartmentDetail = async function(deptFilter) {
    const allEmployees = await fetchAllEmployees();
    const allResponses = await fetchAllResponses();
    
    // 1. FILTER EMPLOYEES: Hanya factory ini
    let filteredEmployees = allEmployees.filter(emp => {
      if (emp.factory) {
        return emp.factory.toLowerCase() === CURRENT_FACTORY;
      }
      return true;
    });

    // 2. FILTER BY DEPARTMENT (Jika ada pilihan dept)
    if (deptFilter) {
      filteredEmployees = filteredEmployees.filter(emp => emp.departemen === deptFilter);
    }
    
    // 3. MAP RESPONSES
    const responseMap = {};
    allResponses.forEach(r => {
      responseMap[r.nik] = r;
    });
    
    // 4. MERGE DATA
    const status = filteredEmployees.map(emp => {
      const response = responseMap[emp.nik];
      return {
        nik: emp.nik,
        nama: emp.nama,
        departemen: emp.departemen,
        factory: emp.factory || CURRENT_FACTORY,
        status: response ? 'done' : 'pending',
        nilai: response ? response.nilai : '-',
        waktu: response ? (response.waktu || response.timestamp) : '-',
        timestamp: response ? (response.timestamp || response.waktu) : '-'
      };
    });
    
    return status;
  };

  // Get Completion Status (All Employees in this Factory)
  const getCompletionStatus = async function() {
    return await getDepartmentDetail(null);
  };

  // Get Summary Stats Helper
  const getSummaryStats = function(statusData) {
    const total = statusData.length;
    const done = statusData.filter(d => d.status === 'done').length;
    const pending = total - done;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    
    return { total, done, pending, percent };
  };

  // Find Duplicate Names
  const findDuplicateNames = function(data) {
    const count = {};
    const normalized = data.map(d => {
      const key = d.nama.trim().toLowerCase();
      count[key] = (count[key] || 0) + 1;
      return { ...d, _key: key };
    });
    return normalized.filter(d => count[d._key] > 1);
  };

  // Find Duplicate NIK
  const findDuplicateNik = function(data) {
    const count = {};
    const normalized = data.map(d => {
      const key = d.nik.trim().toLowerCase();
      count[key] = (count[key] || 0) + 1;
      return { ...d, _key: key };
    });
    return normalized.filter(d => count[d._key] > 1);
  };

  // ==========================================
  // 4. EXPORT FUNCTIONS
  // ==========================================

  const exportToCSV = function(filename, rows) {
    if (!rows || rows.length === 0) {
      console.warn('⚠️ No data to export');
      alert('Tidak ada data untuk diekspor.');
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
    console.log(`💾 [EXPORT] Downloaded ${filename}`);
  };

  // Export Department Detail
  const exportDepartemenDetail = async function(dept) {
    try {
      const status = await getDepartmentDetail(dept);
      const dateStr = new Date().toISOString().split('T')[0];
      const factoryPrefix = CURRENT_FACTORY.toUpperCase();
      const deptSafe = dept ? dept.replace(/\s+/g, '_') : 'SEMUA_DEPT';
      
      const filename = `${factoryPrefix}_detail_evaluasi_${deptSafe}_${dateStr}.csv`;
      exportToCSV(filename, status);
    } catch (e) {
      console.error("Export Detail Failed:", e);
      alert("Gagal mengambil data detail: " + e.message);
    }
  };

  // Export Pending List
  const exportPendingList = async function(dept) {
    try {
      const status = await getDepartmentDetail(dept);
      const pending = status.filter(s => s.status === 'pending');
      
      const dateStr = new Date().toISOString().split('T')[0];
      const factoryPrefix = CURRENT_FACTORY.toUpperCase();
      const deptSafe = dept ? dept.replace(/\s+/g, '_') : 'SEMUA_DEPT';

      const filename = `${factoryPrefix}_belum_mengisi_${deptSafe}_${dateStr}.csv`;
      
      if (pending.length === 0) {
        alert("✅ Tidak ada data pending (Semua sudah mengisi).");
        return;
      }

      exportToCSV(filename, pending);
    } catch (e) {
      console.error("Export Pending Failed:", e);
      alert("Gagal mengambil data pending: " + e.message);
    }
  };

  // Export Done List
  const exportDoneList = async function(dept) {
    try {
      const status = await getDepartmentDetail(dept);
      const done = status.filter(s => s.status === 'done');
      
      const dateStr = new Date().toISOString().split('T')[0];
      const factoryPrefix = CURRENT_FACTORY.toUpperCase();
      const deptSafe = dept ? dept.replace(/\s+/g, '_') : 'SEMUA_DEPT';

      const filename = `${factoryPrefix}_sudah_mengisi_${deptSafe}_${dateStr}.csv`;
      
      if (done.length === 0) {
        alert("ℹ️ Tidak ada data yang sudah mengisi.");
        return;
      }

      exportToCSV(filename, done);
    } catch (e) {
      console.error("Export Done Failed:", e);
      alert("Gagal mengambil data: " + e.message);
    }
  };

  // Export Double Input
  const exportDoubleInput = async function() {
    try {
      // Ambil semua response (sudah difilter factory oleh fetchAllResponses)
      const data = await fetchAllResponses();
      const doubles = findDuplicateNik(data);
      
      const clean = doubles.map(({ _key, ...rest }) => rest);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const factoryPrefix = CURRENT_FACTORY.toUpperCase();
      const filename = `${factoryPrefix}_double_input_check_${dateStr}.csv`;
      
      if (clean.length === 0) {
        alert("✅ Tidak ditemukan data double input (NIK Kembar) di sheet ini.");
        return;
      }
      
      exportToCSV(filename, clean);
    } catch (e) {
      console.error("Export Double Input Failed:", e);
      alert("Gagal memeriksa double input: " + e.message);
    }
  };

  // Export All Responses
  const exportAllResponses = async function() {
    try {
      const data = await fetchAllResponses();
      
      const dateStr = new Date().toISOString().split('T')[0];
      const factoryPrefix = CURRENT_FACTORY.toUpperCase();
      const filename = `${factoryPrefix}_all_responses_${dateStr}.csv`;
      
      if (data.length === 0) {
        alert("ℹ️ Tidak ada data response untuk diekspor.");
        return;
      }

      exportToCSV(filename, data);
    } catch (e) {
      console.error("Export All Responses Failed:", e);
      alert("Gagal mengambil data: " + e.message);
    }
  };

  // ==========================================
  // 5. EXPORT TO WINDOW (PUBLIC API)
  // ==========================================
  
  window.fetchAllEmployees = fetchAllEmployees;
  window.fetchAllResponses = fetchAllResponses;
  window.getFormStatus = getFormStatus;
  window.getEmployeeByNik = getEmployeeByNik;
  window.getQuestions = getQuestions;
  window.submitEvaluation = submitEvaluation;
  
  window.getAllDepartments = getAllDepartments;
  window.getDepartmentSummary = getDepartmentSummary;
  window.getDepartmentDetail = getDepartmentDetail;
  window.getCompletionStatus = getCompletionStatus;
  window.getSummaryStats = getSummaryStats;
  window.findDuplicateNames = findDuplicateNames;
  window.findDuplicateNik = findDuplicateNik;
  
  window.exportToCSV = exportToCSV;
  window.exportDepartemenDetail = exportDepartemenDetail;
  window.exportPendingList = exportPendingList;
  window.exportDoneList = exportDoneList;
  window.exportDoubleInput = exportDoubleInput;
  window.exportAllResponses = exportAllResponses;
  
  window.getCurrentFactory = function() { return CURRENT_FACTORY; };
  window.getScriptUrl = function() { return SCRIPT_URL; };

  // ==========================================
  // 6. INITIALIZATION LOG
  // ==========================================
  console.log('%c✅ sheets.js LOADED (Zinus Global - Strict Factory Filter)', 'color: green; font-weight: bold; background: #e9fbf0; padding: 5px;');
  console.log(`🏭 Active Factory: ${CURRENT_FACTORY.toUpperCase()}`);
  console.log(`🔗 Target Script: ${SCRIPT_URL}`);

})();