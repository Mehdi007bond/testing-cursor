/**
 * main.ts
 * Entry point for 3D Digital Twin application
 */

import './style.css';
import { FactoryScene } from './FactoryScene';

// Global variables
let factoryScene: FactoryScene | null = null;
let vibrationHistory: number[] = [];
const MAX_VIBRATION_HISTORY = 50;

/**
 * Initialize application
 */
function init() {
    const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Create factory scene
    factoryScene = new FactoryScene(canvas);
    
    // Initialize UI
    initializeUI();
    
    // Start animation loop
    factoryScene.animate();
    
    console.log('3D Digital Twin initialized successfully!');
}

/**
 * Initialize UI controls
 */
function initializeUI() {
    // Simulation control buttons
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const autoCycleCheckbox = document.getElementById('auto-cycle') as HTMLInputElement;
    const hangarLightsCheckbox = document.getElementById('hangar-lights') as HTMLInputElement;
    const machineSelector = document.getElementById('machine-selector') as HTMLSelectElement;
    
    if (startBtn) startBtn.onclick = () => startSimulation();
    if (stopBtn) stopBtn.onclick = () => stopSimulation();
    if (resetBtn) resetBtn.onclick = () => resetSimulation();
    if (autoCycleCheckbox) autoCycleCheckbox.onchange = (e) => toggleAutoCycle((e.target as HTMLInputElement).checked);
    if (hangarLightsCheckbox) hangarLightsCheckbox.onchange = (e) => toggleHangarLights((e.target as HTMLInputElement).checked);
    if (machineSelector) machineSelector.onchange = (e) => selectMachine((e.target as HTMLSelectElement).value);
    
    // Update line status periodically
    setInterval(updateAllLineStatus, 500);
    setInterval(updateSensorDisplay, 100);
}

/**
 * Start simulation
 */
function startSimulation() {
    if (factoryScene) {
        factoryScene.startSimulation();
        console.log('Simulation started');
    }
}

/**
 * Stop simulation
 */
function stopSimulation() {
    if (factoryScene) {
        factoryScene.stopSimulation();
        console.log('Simulation stopped');
    }
}

/**
 * Reset simulation
 */
function resetSimulation() {
    if (factoryScene) {
        factoryScene.resetSimulation();
        vibrationHistory = [];
        updateAllLineStatus();
        updateSensorDisplay();
        console.log('System reset');
    }
}

/**
 * Toggle auto-cycle
 */
function toggleAutoCycle(enabled: boolean) {
    if (factoryScene) {
        factoryScene.setAutoCycle(enabled);
        console.log('Auto-cycle:', enabled ? 'enabled' : 'disabled');
    }
}

/**
 * Toggle hangar lights
 */
function toggleHangarLights(enabled: boolean) {
    if (factoryScene) {
        factoryScene.toggleHangarLights(enabled);
    }
}

/**
 * Select machine/line
 */
function selectMachine(value: string) {
    if (!factoryScene) return;
    
    if (value === 'overview') {
        factoryScene.selectLine(null);
    } else {
        const lineNum = parseInt(value.replace('line', ''));
        factoryScene.selectLine(lineNum - 1);
    }
    
    updateSensorDisplay();
}

/**
 * Update all line status displays
 */
function updateAllLineStatus() {
    if (!factoryScene) return;
    
    const container = document.getElementById('lines-status-container');
    if (!container) return;
    
    const lines = factoryScene.getProductionLines();
    const selectedLine = factoryScene.getSelectedLine();
    
    container.innerHTML = '';
    
    lines.forEach((line) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-status';
        if (selectedLine && selectedLine.lineId === line.lineId) {
            lineDiv.classList.add('selected');
        }
        
        const status = getStateStatus(line.state);
        
        lineDiv.innerHTML = `
            <div class="status-indicator status-${status}"></div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 13px;">Line ${line.lineId} - ${line.wireDiameter}mm</div>
                <div style="font-size: 11px; color: #888;">${line.state} | ${line.productionCount} bars</div>
            </div>
        `;
        
        lineDiv.onclick = () => {
            const selector = document.getElementById('machine-selector') as HTMLSelectElement;
            if (selector) {
                selector.value = `line${line.lineId}`;
                selectMachine(`line${line.lineId}`);
            }
        };
        
        container.appendChild(lineDiv);
    });
}

/**
 * Update sensor display for selected line
 */
function updateSensorDisplay() {
    const container = document.getElementById('selected-line-info');
    if (!container || !factoryScene) return;
    
    const selectedLine = factoryScene.getSelectedLine();
    
    if (!selectedLine) {
        container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Select a line to view sensor data</div>';
        return;
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 15px;">
            <div style="font-size: 16px; font-weight: 600; color: #00d9ff; margin-bottom: 10px;">
                Line ${selectedLine.lineId} - ${selectedLine.wireDiameter}mm Wire
            </div>
            <div style="font-size: 12px; color: #888;">
                State: <span style="color: #00ff88;">${selectedLine.state}</span>
            </div>
        </div>
        
        <div class="sensor-data">
            <div class="sensor-item">
                <div class="sensor-label">RPM</div>
                <div class="sensor-value">${selectedLine.RPM.toFixed(0)}<span class="sensor-unit">rpm</span></div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Temperature</div>
                <div class="sensor-value">${selectedLine.temperature.toFixed(1)}<span class="sensor-unit">°C</span></div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Pressure</div>
                <div class="sensor-value">${selectedLine.rollerPressure.toFixed(1)}<span class="sensor-unit">bar</span></div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Vibration</div>
                <div class="sensor-value">${selectedLine.vibration.toFixed(2)}<span class="sensor-unit">mm/s</span></div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="metric-display">
                <span class="metric-label">Speed:</span>
                <span class="metric-value">${selectedLine.wireSpeed.toFixed(1)} m/min</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Cut Length:</span>
                <span class="metric-value">${selectedLine.cutLength.toFixed(2)} m</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Stock Weight:</span>
                <span class="metric-value">${selectedLine.weight.toFixed(0)} kg</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Bars Produced:</span>
                <span class="metric-value">${selectedLine.productionCount}</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Accum. Length:</span>
                <span class="metric-value">${selectedLine.accumLength.toFixed(3)} m</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Bundle State:</span>
                <span class="metric-value">${selectedLine.bundleState}</span>
            </div>
        </div>
    `;
    
    // Update vibration history
    if (vibrationHistory.length >= MAX_VIBRATION_HISTORY) {
        vibrationHistory.shift();
    }
    vibrationHistory.push(selectedLine.vibration);
    
    updateVibrationChart();
}

/**
 * Update vibration chart
 */
function updateVibrationChart() {
    const canvas = document.getElementById('vibration-chart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (vibrationHistory.length === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No vibration data', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = (canvas.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw vibration line
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxVibration = Math.max(...vibrationHistory, 10);
    const xStep = canvas.width / MAX_VIBRATION_HISTORY;
    
    vibrationHistory.forEach((value, index) => {
        const x = index * xStep;
        const y = canvas.height - (value / maxVibration) * canvas.height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

/**
 * Get state status class
 */
function getStateStatus(state: string): string {
    switch (state) {
        case 'STOCK':
        case 'LOADED':
        case 'STOP':
            return 'idle';
        case 'OPENED':
        case 'THREADED':
        case 'PRODUCTION':
        case 'RUN':
            return 'operational';
        case 'ADJUST':
            return 'warning';
        case 'ERROR':
            return 'error';
        default:
            return 'idle';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make functions available globally for inline event handlers
(window as any).startSimulation = startSimulation;
(window as any).stopSimulation = stopSimulation;
(window as any).resetSimulation = resetSimulation;
(window as any).toggleAutoCycle = toggleAutoCycle;
(window as any).toggleHangarLights = toggleHangarLights;
(window as any).selectMachine = selectMachine;
