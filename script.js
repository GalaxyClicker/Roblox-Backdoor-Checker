/**
 * FRIEND BACKDOOR VERIFIED - ENGINE v2.0
 * Deep Scan Technology for Roblox Assets
 */

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsArea = document.getElementById('resultsArea');
const logViewer = document.getElementById('logViewer');
const circleProg = document.getElementById('circleProgress');
const percValue = document.getElementById('percValue');

let currentFile = null;

// Patrones de Auditoría Extendidos
const DB_THREADS = [
    { id: 'R1', name: "Remote Execute (loadstring)", pattern: /loadstring/gi, risk: 45 },
    { id: 'R2', name: "Environment Bypass (getfenv)", pattern: /getfenv/gi, risk: 25 },
    { id: 'R3', name: "External Require", pattern: /require\s*\((\d+)\)/gi, risk: 40 },
    { id: 'R4', name: "Web Exfiltration", pattern: /HttpService|PostAsync|GetAsync/gi, risk: 20 },
    { id: 'R5', name: "Discord Webhook", pattern: /discord\.com\/api\/webhooks/gi, risk: 60 },
    { id: 'R6', name: "Hidden String Ofuscation", pattern: /\\x[0-9A-Fa-f]{2}|\\(\d{1,3})/gi, risk: 15 },
    { id: 'R7', name: "Teleport Manipulation", pattern: /TeleportService/gi, risk: 10 },
    { id: 'R8', name: "DataStore Siphoning", pattern: /DataStoreService/gi, risk: 10 }
];

// --- EVENTOS ---
dropZone.onclick = () => fileInput.click();

dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('active'); };
dropZone.ondragleave = () => dropZone.classList.remove('active');
dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    handleFile(e.dataTransfer.files[0]);
};

fileInput.onchange = (e) => handleFile(e.target.files[0]);

function handleFile(file) {
    if (!file) return;
    currentFile = file;
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('fileName').innerText = file.name;
    document.getElementById('fileSize').innerText = (file.size / 1024).toFixed(2) + " KB";
    
    analyzeBtn.disabled = false;
    addLog(`System: File "${file.name}" loaded successfully.`, 'success');
}

// --- LÓGICA DE ESCANEO ---
analyzeBtn.onclick = async () => {
    analyzeBtn.disabled = true;
    resultsArea.classList.remove('hidden');
    logViewer.innerHTML = "";
    addLog("System: Initializing deep binary inspection...", "system");

    const text = await currentFile.text();
    let score = 0;
    let detections = 0;

    // Simular proceso de escaneo por bloques
    for (let thread of DB_THREADS) {
        await sleep(400); // Para que se vea el escaneo
        const matches = text.match(thread.pattern);
        
        if (matches) {
            detections += matches.length;
            score += thread.risk;
            addLog(`THREAT FOUND: ${thread.name} - Identified ${matches.length} times.`, 'danger');
        } else {
            addLog(`Module Check: ${thread.name} - CLEAR`, 'success');
        }
    }

    if (score > 100) score = 100;
    finalize(score, detections);
};

function finalize(score, count) {
    // Animación de círculo
    const offset = 283 - (283 * score / 100);
    circleProg.style.strokeDashoffset = offset;
    
    // Color según riesgo
    let color = "#00f2ff";
    if (score > 30) color = "#ffaa00";
    if (score > 70) color = "#ff0055";
    
    circleProg.style.stroke = color;
    percValue.style.color = color;
    percValue.innerText = score + "%";

    const label = document.getElementById('statusLabel');
    label.innerText = score > 70 ? "CRITICAL THREAT" : (score > 0 ? "WARNING" : "VERIFIED SAFE");
    label.style.background = color;
    label.style.color = "black";

    addLog(`--- SCAN COMPLETE ---`, 'system');
    addLog(`Summary: ${count} suspicious strings found. Total risk factor: ${score}%`, score > 50 ? 'danger' : 'success');
}

function addLog(msg, type) {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logViewer.appendChild(div);
    logViewer.scrollTop = logViewer.scrollHeight;
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }