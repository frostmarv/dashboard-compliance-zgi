// ✅ SHEETS.JS - ZINUS GLOBAL (FULL COMPATIBLE WITH CODE.GS)
(function() {
  'use strict';

  // ==========================================
  // 1. KONFIGURASI & DETEKSI FACTORY
  // ==========================================
  
  // ⚠️ PENTING: Ganti URL ini dengan URL Web App Anda
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqTbqQY6C-AwxvZO7HeAXpIqeNMtA2CiO3X4z-OeRi_iFhYrW82kwQ8efmQFCVPmw22w/exec'; 

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
  // 2. CORE FUNCTIONS (MATCH CODE.GS ACTIONS)
  // ==========================================

  // Fetch All Employees from Database (Master List)
  // Code.gs: action=getAllEmployees&factory=bogor
  const fetchAllEmployees = async function() {
    try {
      console.log(`📊 [${CURRENT_FACTORY}] Fetching all employees...`);
      const url = `${SCRIPT_URL}?action=getAllEmployees&factory=${CURRENT_FACTORY}`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ Response is not an array, checking structure...', data);
        if (data.error) throw new Error(data.error);
      }
      
      console.log(`📊 [${CURRENT_FACTORY}] Employees fetched: ${data.length} rows`);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in fetchAllEmployees:`, error);
      throw error;
    }
  };

  // Fetch All Responses from Responses Sheet
  // Code.gs: action=getAllResponses&factory=bogor
  const fetchAllResponses = async function() {
    try {
      console.log(`📊 [${CURRENT_FACTORY}] Fetching all responses...`);
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
      }
      
      console.log(`📊 [${CURRENT_FACTORY}] Responses fetched: ${data.length} rows`);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in fetchAllResponses:`, error);
      throw error;
    }
  };

  // Get Form Status (Lock/Unlock)
  // Code.gs: action=getFormStatus
  const getFormStatus = async function() {
    try {
      console.log(`🔒 [${CURRENT_FACTORY}] Checking form status...`);
      const url = `${SCRIPT_URL}?action=getFormStatus`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      console.log(`🔒 Form Status:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in getFormStatus:`, error);
      throw error;
    }
  };

  // Get Employee by NIK (For Login/Validation)
  // Code.gs: action=getEmployee&nik=12345
  const getEmployeeByNik = async function(nik) {
    try {
      console.log(`🔍 [${CURRENT_FACTORY}] Looking up employee: ${nik}...`);
      const url = `${SCRIPT_URL}?action=getEmployee&nik=${encodeURIComponent(nik)}`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      console.log(`🔍 Employee lookup result:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in getEmployeeByNik:`, error);
      throw error;
    }
  };

  // Get Questions
  // Code.gs: action=getQuestions
  const getQuestions = async function() {
    try {
      console.log(`📝 [${CURRENT_FACTORY}] Fetching questions...`);
      const url = `${SCRIPT_URL}?action=getQuestions`;
      
      const res = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      console.log(`📝 Questions fetched: ${data.length} items`);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in getQuestions:`, error);
      throw error;
    }
  };

  // Submit Evaluation
  // Code.gs: doPost with action implied by endpoint
  const submitEvaluation = async function(formData) {
    try {
      console.log(`📤 [${CURRENT_FACTORY}] Submitting evaluation...`);
      
      const res = await fetch(SCRIPT_URL, { 
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      console.log(`📤 Submit result:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [${CURRENT_FACTORY}] Error in submitEvaluation:`, error);
      throw error;
    }
  };

  // ==========================================
  // 3. DATA PROCESSING HELPERS (DREAM LOGIC)
  // ==========================================

  // Get All Unique Departments from Database
  const getAllDepartments = async function() {
    const employees = await fetchAllEmployees();
    const deptSet = new Set();
    
    employees.forEach(emp => {
      if (emp.departemen) {
        deptSet.add(emp.departemen);
      }
    });
    
    return Array.from(deptSet).sort();
  };

  // Get Department Summary (Total Employees per Department from Database)
  // LOGIKA DREAM: Membandingkan Master List vs Responses
  const getDepartmentSummary = async function() {
    const employees = await fetchAllEmployees();
    const responses = await fetchAllResponses();
    
    // Map responses by NIK untuk lookup cepat
    const responseMap = {};
    responses.forEach(r => {
      responseMap[r.nik] = r;
    });
    
    // Group by department
    const deptMap = {};
    
    employees.forEach(emp => {
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
      
      // Cek apakah NIK ini ada di responseMap
      if (responseMap[emp.nik]) {
        deptMap[dept].done++;
      } else {
        deptMap[dept].pending++;
      }
    });
    
    return Object.values(deptMap).sort((a, b) => a.departemen.localeCompare(b.departemen));
  };

  // Get Completion Status for Specific Department
  const getDepartmentDetail = async function(deptFilter) {
    const employees = await fetchAllEmployees();
    const responses = await fetchAllResponses();
    
    // Map responses by NIK
    const responseMap = {};
    responses.forEach(r => {
      responseMap[r.nik] = r;
    });
    
    // Filter by department if specified
    let filteredEmployees = employees;
    if (deptFilter) {
      filteredEmployees = employees.filter(emp => emp.departemen === deptFilter);
    }
    
    // Merge data with status
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

  // Get Completion Status (All Employees)
  const getCompletionStatus = async function() {
    return await getDepartmentDetail(null);
  };

  // Get Summary Stats
  const getSummaryStats = function(statusData) {
    const total = statusData.length;
    const done = statusData.filter(d => d.status === 'done').length;
    const pending = total - done;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    
    return { total, done, pending, percent };
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

  // Find Duplicate NIK (Lebih Akurat untuk Deteksi Double Input)
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
  // 4. EXPORT FUNCTIONS (DREAM STYLE)
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

  // Export Department Detail (Semua Karyawan di Dept tsb)
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

  // Export Pending List (Hanya yang belum isi)
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

  // Export Done List (Yang sudah isi)
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

  // Export Double Input (Potential Duplicates found in Sheet)
  const exportDoubleInput = async function() {
    try {
      const data = await fetchAllResponses();
      const doubles = findDuplicateNik(data);
      
      // Hapus properti internal _key
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

  // Export All Responses (Raw Data)
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
  
  // Core Fetch Functions
  window.fetchAllEmployees = fetchAllEmployees;
  window.fetchAllResponses = fetchAllResponses;
  window.getFormStatus = getFormStatus;
  window.getEmployeeByNik = getEmployeeByNik;
  window.getQuestions = getQuestions;
  window.submitEvaluation = submitEvaluation;
  
  // Data Processing Functions
  window.getAllDepartments = getAllDepartments;
  window.getDepartmentSummary = getDepartmentSummary;
  window.getDepartmentDetail = getDepartmentDetail;
  window.getCompletionStatus = getCompletionStatus;
  window.getSummaryStats = getSummaryStats;
  window.findDuplicateNames = findDuplicateNames;
  window.findDuplicateNik = findDuplicateNik;
  
  // Export Functions
  window.exportToCSV = exportToCSV;
  window.exportDepartemenDetail = exportDepartemenDetail;
  window.exportPendingList = exportPendingList;
  window.exportDoneList = exportDoneList;
  window.exportDoubleInput = exportDoubleInput;
  window.exportAllResponses = exportAllResponses;
  
  // Info Helpers
  window.getCurrentFactory = function() { return CURRENT_FACTORY; };
  window.getScriptUrl = function() { return SCRIPT_URL; };

  // ==========================================
  // 6. INITIALIZATION LOG
  // ==========================================
  console.log('%c✅ sheets.js LOADED (Zinus Global - Full Version)', 'color: green; font-weight: bold; background: #e9fbf0; padding: 5px;');
  console.log(`🏭 Active Factory: ${CURRENT_FACTORY.toUpperCase()}`);
  console.log(`🔗 Target Script: ${SCRIPT_URL}`);
  console.log(`📦 Available Functions:`, Object.keys(window).filter(k => 
    k.startsWith('fetch') || k.startsWith('get') || k.startsWith('export')
  ).join(', '));

})();