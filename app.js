// ===================================
// GLOBAL VARIABLES AND INITIALIZATION
// ===================================

let scene, camera, renderer, controls;
let productionLines = [];
let selectedLineIndex = null;
let animationId = null;
let simulationRunning = false;
let autoCycleEnabled = false;
let hangarLightsEnabled = true;

// Sensor data storage
let vibrationHistory = [];
const MAX_VIBRATION_HISTORY = 50;

// Production line states
const PRODUCTION_STATES = {
    STOCK: 'STOCK',
    LOADED: 'LOADED',
    OPENED: 'OPENED',
    THREADED: 'THREADED',
    ADJUST: 'ADJUST',
    PRODUCTION: 'PRODUCTION'
};

// Wire diameters for each line (in mm)
const WIRE_DIAMETERS = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 9.0, 10.0];

// ===================================
// INITIALIZATION
// ===================================

function init() {
    // Setup Three.js scene
    const canvas = document.getElementById('three-canvas');
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    scene.fog = new THREE.Fog(0x0a0a15, 50, 200);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    setupLighting();

    // Create factory floor
    createFactoryFloor();

    // Create production lines
    createProductionLines();

    // Initialize UI
    initializeUI();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    scene.add(ambientLight);

    // Main directional light (warm, from above)
    const mainLight = new THREE.DirectionalLight(0xffd9b3, 0.8);
    mainLight.position.set(50, 80, 30);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    scene.add(mainLight);

    // Cool fill light (from side)
    const fillLight = new THREE.DirectionalLight(0x80c0ff, 0.3);
    fillLight.position.set(-50, 30, -30);
    scene.add(fillLight);

    // Accent point lights (orange/industrial)
    const accentLight1 = new THREE.PointLight(0xff8844, 0.5, 60);
    accentLight1.position.set(-40, 10, 0);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff8844, 0.5, 60);
    accentLight2.position.set(40, 10, 0);
    scene.add(accentLight2);
}

function createFactoryFloor() {
    // Main floor
    const floorGeometry = new THREE.PlaneGeometry(200, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 40, 0x00d9ff, 0x1a3050);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

// ===================================
// PRODUCTION LINE CREATION
// ===================================

function createProductionLines() {
    const lineSpacing = 10;
    const startZ = -35;

    for (let i = 0; i < 8; i++) {
        const line = {
            id: i + 1,
            diameter: WIRE_DIAMETERS[i],
            state: PRODUCTION_STATES.STOCK,
            rpm: 0,
            targetRPM: 0,
            pressure: 0,
            temperature: 20,
            vibration: 0,
            speed: 0,
            cutLength: 12.0,
            weight: Math.random() * 300 + 700, // Initial weight: 700-1000 kg
            barCount: 0,
            accumLength: 0,
            cycleTime: 0,
            alerts: [],
            group: new THREE.Group(),
            coil: null,
            straighteningMachine: null,
            cuttingUnit: null,
            outputBundle: null,
            bars: [],
            lastCutTime: 0
        };

        line.group.position.set(-60, 0, startZ + (i * lineSpacing));
        scene.add(line.group);

        // Create line components
        createInputCoil(line);
        createStraighteningMachine(line);
        createCuttingUnit(line);
        createOutputBundle(line);

        productionLines.push(line);
    }
}

function createInputCoil(line) {
    const coilGroup = new THREE.Group();
    coilGroup.position.set(0, 3, 0);

    // Main cylindrical coil body
    const coilRadius = 1.5;
    const coilHeight = 1.2;
    const coilGeometry = new THREE.CylinderGeometry(coilRadius, coilRadius, coilHeight, 32);
    const coilMaterial = new THREE.MeshStandardMaterial({
        color: 0x708090,
        metalness: 0.8,
        roughness: 0.3
    });
    const coilMesh = new THREE.Mesh(coilGeometry, coilMaterial);
    coilMesh.rotation.z = Math.PI / 2;
    coilMesh.castShadow = true;
    coilGroup.add(coilMesh);

    // Inner hollow center
    const innerGeometry = new THREE.CylinderGeometry(0.3, 0.3, coilHeight + 0.1, 16);
    const innerMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.5,
        roughness: 0.7
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    innerMesh.rotation.z = Math.PI / 2;
    coilGroup.add(innerMesh);

    // Mounting flanges
    const flangeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const flangeMaterial = new THREE.MeshStandardMaterial({
        color: 0x505050,
        metalness: 0.7,
        roughness: 0.4
    });
    
    const leftFlange = new THREE.Mesh(flangeGeometry, flangeMaterial);
    leftFlange.rotation.z = Math.PI / 2;
    leftFlange.position.x = -coilHeight / 2 - 0.05;
    coilGroup.add(leftFlange);

    const rightFlange = new THREE.Mesh(flangeGeometry, flangeMaterial);
    rightFlange.rotation.z = Math.PI / 2;
    rightFlange.position.x = coilHeight / 2 + 0.05;
    coilGroup.add(rightFlange);

    // Orange diameter indicator band
    const bandGeometry = new THREE.TorusGeometry(coilRadius - 0.1, 0.05, 8, 32);
    const bandMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8844,
        emissive: 0xff6622,
        emissiveIntensity: 0.3
    });
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.rotation.y = Math.PI / 2;
    coilGroup.add(band);

    // Support pallet base
    const palletGeometry = new THREE.BoxGeometry(2, 0.2, 2);
    const palletMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9
    });
    const pallet = new THREE.Mesh(palletGeometry, palletMaterial);
    pallet.position.y = -coilRadius - 0.1;
    pallet.castShadow = true;
    pallet.receiveShadow = true;
    coilGroup.add(pallet);

    line.group.add(coilGroup);
    line.coil = coilGroup;
}

function createStraighteningMachine(line) {
    const machineGroup = new THREE.Group();
    machineGroup.position.set(20, 0, 0);

    // Machine base
    const baseGeometry = new THREE.BoxGeometry(6, 2, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a4d69,
        metalness: 0.6,
        roughness: 0.4
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1;
    base.castShadow = true;
    base.receiveShadow = true;
    machineGroup.add(base);

    // Top rollers (7 rollers)
    const topRollers = [];
    for (let i = 0; i < 7; i++) {
        const rollerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
        const rollerMaterial = new THREE.MeshStandardMaterial({
            color: 0x505050,
            metalness: 0.9,
            roughness: 0.2
        });
        const roller = new THREE.Mesh(rollerGeometry, rollerMaterial);
        roller.position.set(-2 + i * 0.7, 2.5, 0);
        roller.rotation.x = Math.PI / 2;
        roller.castShadow = true;
        machineGroup.add(roller);
        topRollers.push(roller);
    }

    // Bottom rollers (6 rollers, staggered)
    const bottomRollers = [];
    for (let i = 0; i < 6; i++) {
        const rollerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
        const rollerMaterial = new THREE.MeshStandardMaterial({
            color: 0x606060,
            metalness: 0.9,
            roughness: 0.2
        });
        const roller = new THREE.Mesh(rollerGeometry, rollerMaterial);
        roller.position.set(-1.65 + i * 0.7, 1.5, 0);
        roller.rotation.x = Math.PI / 2;
        roller.castShadow = true;
        machineGroup.add(roller);
        bottomRollers.push(roller);
    }

    // Center guide rollers
    const guideRollers = [];
    for (let i = 0; i < 5; i++) {
        const guideGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 12);
        const guideMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6622,
            metalness: 0.7,
            roughness: 0.3
        });
        const guide = new THREE.Mesh(guideGeometry, guideMaterial);
        guide.position.set(-2 + i * 1, 2, 1);
        guide.rotation.x = Math.PI / 2;
        machineGroup.add(guide);
        guideRollers.push(guide);
    }

    machineGroup.userData = { topRollers, bottomRollers, guideRollers };
    line.group.add(machineGroup);
    line.straighteningMachine = machineGroup;
}

function createCuttingUnit(line) {
    const cuttingGroup = new THREE.Group();
    cuttingGroup.position.set(35, 0, 0);

    // Cutting unit base
    const baseGeometry = new THREE.BoxGeometry(3, 2.5, 2.5);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a5c,
        metalness: 0.6,
        roughness: 0.4
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1.25;
    base.castShadow = true;
    cuttingGroup.add(base);

    // Cutting blade arm
    const armGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.8);
    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xff2222,
        emissiveIntensity: 0.2
    });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(0, 2.5, 0);
    arm.castShadow = true;
    cuttingGroup.add(arm);

    // Cutting blade
    const bladeGeometry = new THREE.BoxGeometry(0.05, 0.8, 1);
    const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.95,
        roughness: 0.05
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0.15, 2, 0);
    blade.castShadow = true;
    cuttingGroup.add(blade);

    cuttingGroup.userData = { arm, blade, armRotation: 0, cutting: false };
    line.group.add(cuttingGroup);
    line.cuttingUnit = cuttingGroup;
}

function createOutputBundle(line) {
    const bundleGroup = new THREE.Group();
    bundleGroup.position.set(55, 0, 0);

    // Conveyor base
    const conveyorGeometry = new THREE.BoxGeometry(8, 0.3, 3);
    const conveyorMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.7
    });
    const conveyor = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
    conveyor.position.y = 0.15;
    conveyor.receiveShadow = true;
    bundleGroup.add(conveyor);

    // Wooden pallet
    const palletGeometry = new THREE.BoxGeometry(3, 0.2, 2.5);
    const palletMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9
    });
    const pallet = new THREE.Mesh(palletGeometry, palletMaterial);
    pallet.position.set(2, 0.4, 0);
    pallet.castShadow = true;
    pallet.receiveShadow = true;
    bundleGroup.add(pallet);

    // Pallet support blocks
    for (let i = 0; i < 3; i++) {
        const blockGeometry = new THREE.BoxGeometry(0.3, 0.15, 2.3);
        const block = new THREE.Mesh(blockGeometry, palletMaterial);
        block.position.set(2 + (i - 1) * 1.2, 0.325, 0);
        bundleGroup.add(block);
    }

    bundleGroup.userData = { bars: [], pallet };
    line.group.add(bundleGroup);
    line.outputBundle = bundleGroup;
}

// ===================================
// SIMULATION CONTROL FUNCTIONS
// ===================================

function startSimulation() {
    simulationRunning = true;
    console.log('Simulation started');
    
    productionLines.forEach(line => {
        if (line.state === PRODUCTION_STATES.STOCK) {
            line.state = PRODUCTION_STATES.LOADED;
        }
    });
    
    updateAllLineStatus();
}

function stopSimulation() {
    simulationRunning = false;
    console.log('Simulation stopped');
    
    productionLines.forEach(line => {
        line.targetRPM = 0;
    });
}

function resetSimulation() {
    simulationRunning = false;
    autoCycleEnabled = false;
    document.getElementById('auto-cycle').checked = false;
    
    console.log('System reset');
    
    productionLines.forEach(line => {
        line.state = PRODUCTION_STATES.STOCK;
        line.rpm = 0;
        line.targetRPM = 0;
        line.pressure = 0;
        line.temperature = 20;
        line.vibration = 0;
        line.speed = 0;
        line.weight = Math.random() * 300 + 700;
        line.barCount = 0;
        line.accumLength = 0;
        line.cycleTime = 0;
        line.alerts = [];
        
        // Clear bars
        if (line.outputBundle && line.outputBundle.userData.bars) {
            line.outputBundle.userData.bars.forEach(bar => {
                line.outputBundle.remove(bar);
            });
            line.outputBundle.userData.bars = [];
        }
    });
    
    vibrationHistory = [];
    updateAllLineStatus();
    updateSensorDisplay();
    updateAlertsDisplay();
}

function toggleAutoCycle(enabled) {
    autoCycleEnabled = enabled;
    console.log('Auto-cycle:', enabled ? 'enabled' : 'disabled');
}

function toggleHangarLights(enabled) {
    hangarLightsEnabled = enabled;
    // Adjust ambient light intensity
    scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight) {
            child.intensity = enabled ? 0.3 : 0.1;
        }
    });
}

function selectMachine(value) {
    if (value === 'overview') {
        selectedLineIndex = null;
        camera.position.set(0, 50, 80);
        controls.target.set(0, 0, 0);
    } else {
        const lineNum = parseInt(value.replace('line', ''));
        selectedLineIndex = lineNum - 1;
        const line = productionLines[selectedLineIndex];
        
        // Zoom to selected line
        const targetPos = line.group.position;
        camera.position.set(targetPos.x + 20, 25, targetPos.z + 15);
        controls.target.set(targetPos.x + 20, 0, targetPos.z);
    }
    
    controls.update();
    updateSensorDisplay();
}

// ===================================
// ANIMATION AND UPDATE FUNCTIONS
// ===================================

function animate() {
    animationId = requestAnimationFrame(animate);
    
    const deltaTime = 0.016; // ~60fps
    
    if (simulationRunning) {
        updateSimulation(deltaTime);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function updateSimulation(deltaTime) {
    const currentTime = Date.now() / 1000;
    
    productionLines.forEach((line, index) => {
        updateLineState(line, deltaTime, currentTime);
        updateLinePhysics(line, deltaTime);
        updateLineVisuals(line, deltaTime);
        checkLineAlerts(line);
    });
    
    // Auto-cycle states if enabled
    if (autoCycleEnabled) {
        productionLines.forEach(line => {
            line.cycleTime += deltaTime;
            
            const cycleInterval = 5 + Math.random() * 10; // 5-15 seconds
            
            if (line.cycleTime > cycleInterval) {
                line.cycleTime = 0;
                advanceLineState(line);
            }
        });
    }
    
    updateSensorDisplay();
    updateVibrationChart();
    updateAlertsDisplay();
}

function updateLineState(line, deltaTime, currentTime) {
    switch (line.state) {
        case PRODUCTION_STATES.STOCK:
            line.targetRPM = 0;
            break;
        case PRODUCTION_STATES.LOADED:
            line.targetRPM = 0;
            break;
        case PRODUCTION_STATES.OPENED:
            line.targetRPM = 300 + Math.random() * 100;
            break;
        case PRODUCTION_STATES.THREADED:
            line.targetRPM = 800 + Math.random() * 200;
            break;
        case PRODUCTION_STATES.ADJUST:
            line.targetRPM = 1200 + Math.random() * 300;
            break;
        case PRODUCTION_STATES.PRODUCTION:
            line.targetRPM = 1500 + Math.random() * 400;
            
            // Accumulate length based on RPM and diameter
            const speedMetersPerSec = (line.rpm / 60) * (Math.PI * line.diameter / 1000);
            line.accumLength += speedMetersPerSec * deltaTime;
            
            // Trigger cutting when accumulated length reaches target
            if (line.accumLength >= line.cutLength) {
                triggerCut(line);
                line.accumLength = 0;
                line.lastCutTime = currentTime;
            }
            break;
    }
}

function updateLinePhysics(line, deltaTime) {
    // Smooth RPM transition
    const rpmDiff = line.targetRPM - line.rpm;
    line.rpm += rpmDiff * deltaTime * 2;
    
    // Update other sensors based on RPM
    line.speed = line.rpm * 0.05;
    line.temperature = 20 + (line.rpm / 2000) * 60 + Math.random() * 5;
    line.pressure = (line.rpm / 2000) * 150 + Math.random() * 10;
    line.vibration = (line.rpm / 2000) * 5 + Math.random() * 2;
    
    // Simulate weight decrease as material is used
    if (line.state === PRODUCTION_STATES.PRODUCTION && line.rpm > 0) {
        line.weight -= deltaTime * 0.5;
        if (line.weight < 0) line.weight = 0;
    }
}

function updateLineVisuals(line, deltaTime) {
    // Rotate input coil
    if (line.coil && line.rpm > 0) {
        line.coil.rotation.x += (line.rpm / 60) * deltaTime * 0.5;
    }
    
    // Rotate straightening machine rollers
    if (line.straighteningMachine && line.rpm > 0) {
        const userData = line.straighteningMachine.userData;
        
        // Top rollers rotate in one direction
        userData.topRollers.forEach((roller, i) => {
            roller.rotation.z += (line.rpm / 60) * deltaTime * (i % 2 === 0 ? 1 : -1);
        });
        
        // Bottom rollers rotate in opposite direction
        userData.bottomRollers.forEach((roller, i) => {
            roller.rotation.z -= (line.rpm / 60) * deltaTime * (i % 2 === 0 ? 1 : -1);
        });
        
        // Guide rollers
        userData.guideRollers.forEach(roller => {
            roller.rotation.z += (line.rpm / 60) * deltaTime * 0.5;
        });
    }
    
    // Update machine base color based on state
    if (line.straighteningMachine) {
        const base = line.straighteningMachine.children[0];
        if (base && base.material) {
            base.material.color.setHex(getStateColor(line.state));
        }
    }
    
    // Animate cutting unit
    if (line.cuttingUnit) {
        const userData = line.cuttingUnit.userData;
        
        if (userData.cutting) {
            userData.armRotation += deltaTime * 8;
            
            if (userData.armRotation >= Math.PI / 4) {
                userData.cutting = false;
                userData.armRotation = 0;
                createOutputBar(line);
            }
        }
        
        userData.arm.rotation.z = -userData.armRotation;
        userData.blade.rotation.z = -userData.armRotation;
    }
}

function triggerCut(line) {
    if (line.cuttingUnit && !line.cuttingUnit.userData.cutting) {
        line.cuttingUnit.userData.cutting = true;
        line.cuttingUnit.userData.armRotation = 0;
    }
}

function createOutputBar(line) {
    if (!line.outputBundle) return;
    
    line.barCount++;
    
    const barGeometry = new THREE.CylinderGeometry(
        line.diameter / 1000,
        line.diameter / 1000,
        line.cutLength,
        16
    );
    
    // Create corrugated/ribbed texture for rebar
    const barMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        metalness: 0.7,
        roughness: 0.4
    });
    
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.rotation.z = Math.PI / 2;
    bar.castShadow = true;
    
    // Stack bars in hexagonal pattern
    const barsPerRow = 6;
    const barsPerCol = 4;
    const totalPositions = barsPerRow * barsPerCol;
    const currentIndex = (line.barCount - 1) % totalPositions;
    
    const row = Math.floor(currentIndex / barsPerRow);
    const col = currentIndex % barsPerRow;
    
    const spacing = line.diameter / 1000 * 2.2;
    const xOffset = 2 - (line.cutLength / 2);
    const yOffset = 0.6 + row * spacing;
    const zOffset = (col - barsPerRow / 2 + 0.5) * spacing;
    
    bar.position.set(xOffset, yOffset, zOffset);
    
    line.outputBundle.add(bar);
    line.outputBundle.userData.bars.push(bar);
    
    // Create bundle ties every 24 bars
    if (line.barCount % 24 === 0) {
        createBundleTies(line);
    }
}

function createBundleTies(line) {
    if (!line.outputBundle) return;
    
    const tiePositions = [-4, -1, 2, 5];
    
    tiePositions.forEach(xPos => {
        const tieGeometry = new THREE.TorusGeometry(0.4, 0.02, 8, 16);
        const tieMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.1
        });
        const tie = new THREE.Mesh(tieGeometry, tieMaterial);
        tie.position.set(xPos, 1, 0);
        tie.rotation.y = Math.PI / 2;
        line.outputBundle.add(tie);
        line.outputBundle.userData.bars.push(tie);
    });
}

function advanceLineState(line) {
    const states = Object.values(PRODUCTION_STATES);
    const currentIndex = states.indexOf(line.state);
    const nextIndex = (currentIndex + 1) % states.length;
    line.state = states[nextIndex];
    
    console.log(`Line ${line.id} -> ${line.state}`);
    updateAllLineStatus();
}

function checkLineAlerts(line) {
    line.alerts = [];
    
    // Check for high RPM
    if (line.rpm > 1800) {
        line.alerts.push({
            type: 'warning',
            message: `High RPM detected: ${line.rpm.toFixed(0)} RPM`,
            time: new Date().toLocaleTimeString()
        });
    }
    
    // Check for low stock
    if (line.weight < 500) {
        line.alerts.push({
            type: 'warning',
            message: `Low stock: ${line.weight.toFixed(0)} kg`,
            time: new Date().toLocaleTimeString()
        });
    }
    
    // Check for length deviation
    const lengthDeviation = Math.abs(line.accumLength - line.cutLength);
    if (lengthDeviation > 0.05 && line.state === PRODUCTION_STATES.PRODUCTION) {
        line.alerts.push({
            type: 'error',
            message: `Length deviation: ${lengthDeviation.toFixed(3)} m`,
            time: new Date().toLocaleTimeString()
        });
    }
    
    // Check for pressure issues
    if (line.pressure > 140) {
        line.alerts.push({
            type: 'warning',
            message: `High pressure: ${line.pressure.toFixed(1)} bar`,
            time: new Date().toLocaleTimeString()
        });
    }
}

function getStateColor(state) {
    switch (state) {
        case PRODUCTION_STATES.STOCK: return 0x666666;
        case PRODUCTION_STATES.LOADED: return 0x4a90e2;
        case PRODUCTION_STATES.OPENED: return 0x50c878;
        case PRODUCTION_STATES.THREADED: return 0x00d9ff;
        case PRODUCTION_STATES.ADJUST: return 0xffa726;
        case PRODUCTION_STATES.PRODUCTION: return 0x00c853;
        default: return 0x2a4d69;
    }
}

function getStateStatus(state) {
    switch (state) {
        case PRODUCTION_STATES.STOCK: return 'idle';
        case PRODUCTION_STATES.LOADED: return 'idle';
        case PRODUCTION_STATES.OPENED: return 'operational';
        case PRODUCTION_STATES.THREADED: return 'operational';
        case PRODUCTION_STATES.ADJUST: return 'warning';
        case PRODUCTION_STATES.PRODUCTION: return 'operational';
        default: return 'idle';
    }
}

// ===================================
// UI UPDATE FUNCTIONS
// ===================================

function initializeUI() {
    // Initialize line status display
    updateAllLineStatus();
    
    // Initialize sensor display
    updateSensorDisplay();
    
    // Initialize vibration chart
    setupVibrationChart();
    
    // Initialize alerts
    updateAlertsDisplay();
}

function updateAllLineStatus() {
    const container = document.getElementById('lines-status-container');
    container.innerHTML = '';
    
    productionLines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-status';
        if (selectedLineIndex === index) {
            lineDiv.classList.add('selected');
        }
        
        const status = getStateStatus(line.state);
        
        lineDiv.innerHTML = `
            <div class="status-indicator status-${status}"></div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 13px;">Line ${line.id} - ${line.diameter}mm</div>
                <div style="font-size: 11px; color: #888;">${line.state} | ${line.barCount} bars</div>
            </div>
        `;
        
        lineDiv.onclick = () => {
            selectedLineIndex = index;
            document.getElementById('machine-selector').value = `line${line.id}`;
            selectMachine(`line${line.id}`);
            updateAllLineStatus();
        };
        
        container.appendChild(lineDiv);
    });
}

function updateSensorDisplay() {
    const container = document.getElementById('selected-line-info');
    
    if (selectedLineIndex === null) {
        container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Select a line to view sensor data</div>';
        return;
    }
    
    const line = productionLines[selectedLineIndex];
    
    container.innerHTML = `
        <div style="margin-bottom: 15px;">
            <div style="font-size: 16px; font-weight: 600; color: #00d9ff; margin-bottom: 10px;">
                Line ${line.id} - ${line.diameter}mm Wire
            </div>
            <div style="font-size: 12px; color: #888;">
                State: <span style="color: #00ff88;">${line.state}</span>
            </div>
        </div>
        
        <div class="sensor-data">
            <div class="sensor-item">
                <div class="sensor-label">RPM</div>
                <div class="sensor-value">${line.rpm.toFixed(0)}<span class="sensor-unit">rpm</span></div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Temperature</div>
                <div class="sensor-value">${line.temperature.toFixed(1)}<span class="sensor-unit">°C</span></div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Pressure</div>
                <div class="sensor-value">${line.pressure.toFixed(1)}<span class="sensor-unit">bar</span></div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Vibration</div>
                <div class="sensor-value">${line.vibration.toFixed(2)}<span class="sensor-unit">mm/s</span></div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="metric-display">
                <span class="metric-label">Speed:</span>
                <span class="metric-value">${line.speed.toFixed(1)} m/min</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Cut Length:</span>
                <span class="metric-value">${line.cutLength.toFixed(2)} m</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Stock Weight:</span>
                <span class="metric-value">${line.weight.toFixed(0)} kg</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Bars Produced:</span>
                <span class="metric-value">${line.barCount}</span>
            </div>
            <div class="metric-display">
                <span class="metric-label">Accum. Length:</span>
                <span class="metric-value">${line.accumLength.toFixed(3)} m</span>
            </div>
        </div>
    `;
    
    // Update vibration history for selected line
    if (vibrationHistory.length >= MAX_VIBRATION_HISTORY) {
        vibrationHistory.shift();
    }
    vibrationHistory.push(line.vibration);
}

function setupVibrationChart() {
    const canvas = document.getElementById('vibration-chart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function updateVibrationChart() {
    const canvas = document.getElementById('vibration-chart');
    const ctx = canvas.getContext('2d');
    
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
    
    // Draw threshold line
    ctx.strokeStyle = 'rgba(255, 167, 38, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    const thresholdY = canvas.height - (5 / maxVibration) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(canvas.width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw labels
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(maxVibration.toFixed(1), canvas.width - 5, 12);
    ctx.fillText('0', canvas.width - 5, canvas.height - 5);
}

function updateAlertsDisplay() {
    const container = document.getElementById('alerts-container');
    
    // Collect all alerts from all lines
    const allAlerts = [];
    productionLines.forEach(line => {
        line.alerts.forEach(alert => {
            allAlerts.push({
                ...alert,
                lineId: line.id,
                diameter: line.diameter
            });
        });
    });
    
    if (allAlerts.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #888; padding: 10px; font-size: 12px;">No active alerts</div>';
        return;
    }
    
    container.innerHTML = allAlerts.map(alert => `
        <div class="alert-item">
            <div style="font-weight: 600; margin-bottom: 3px;">Line ${alert.lineId} (${alert.diameter}mm)</div>
            <div>${alert.message}</div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `).join('');
}

// ===================================
// WINDOW RESIZE HANDLER
// ===================================

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Resize vibration chart
    const canvas = document.getElementById('vibration-chart');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// ===================================
// START APPLICATION
// ===================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
