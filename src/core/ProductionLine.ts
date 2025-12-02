/**
 * ProductionLine.ts
 * Complete production line combining all components
 */

import * as THREE from 'three';
import { MaterialLibrary } from './MaterialLibrary';
import { SteelWireCoil } from '../components/SteelWireCoil';
import { WireFeedGuides } from '../components/WireFeedGuides';
import { StraighteningMachine } from '../components/StraighteningMachine';
import { CuttingSystem, CutterType } from '../components/CuttingSystem';
import { BarHandler } from '../components/BarHandler';
import { BundleStacker } from '../components/BundleStacker';
import { WireCurve } from '../utils/WireCurve';
import { SparkParticles } from '../effects/SparkParticles';

export type ProductionState = 'STOCK' | 'LOADED' | 'OPENED' | 'THREADED' | 'ADJUST' | 'PRODUCTION' | 'RUN' | 'STOP' | 'ERROR';

export interface ProductionLineConfig {
    lineId: number;
    wireDiameter: number;  // 4mm - 12mm
    cutLength: number;     // 6m - 12m
    coilDiameter: number;  // 1.1m - 1.4m
    cutterType: CutterType;
}

export class ProductionLine {
    public lineId: number;
    public group: THREE.Group;
    public state: ProductionState = 'STOCK';
    
    // Parameters
    public RPM: number = 0;
    public targetRPM: number = 0;
    public rollerPressure: number = 0;
    public cutLength: number;
    public wireDiameter: number;
    public wireSpeed: number = 0;
    public temperature: number = 20;
    public vibration: number = 0;
    public productionCount: number = 0;
    public bundleState: string = 'EMPTY';
    public accumLength: number = 0;
    public weight: number;
    public cycleTime: number = 0;  // For auto-cycle tracking
    
    // Components
    private materialLib: MaterialLibrary;
    private coil: SteelWireCoil | null = null;
    private feedGuides: WireFeedGuides | null = null;
    private straighteningMachine: StraighteningMachine | null = null;
    private cuttingSystem: CuttingSystem | null = null;
    private barHandler: BarHandler | null = null;
    private bundleStacker: BundleStacker | null = null;
    private wireCurve: WireCurve | null = null;
    private sparkParticles: SparkParticles | null = null;
    
    constructor(config: ProductionLineConfig, materialLib: MaterialLibrary) {
        this.lineId = config.lineId;
        this.wireDiameter = config.wireDiameter;
        this.cutLength = config.cutLength;
        this.materialLib = materialLib;
        this.weight = 700 + Math.random() * 300; // 700-1000 kg
        
        this.group = new THREE.Group();
        this.group.name = `ProductionLine_${this.lineId}`;
        
        this.createComponents(config);
    }

    private createComponents(config: ProductionLineConfig): void {
        // 1. Steel wire coil at position (0, 0, 0)
        this.coil = new SteelWireCoil(
            config.coilDiameter,
            0.6, // width
            this.wireDiameter,
            this.materialLib
        );
        this.coil.getGroup().position.set(0, 3, 0);
        this.group.add(this.coil.getGroup());
        
        // 2. Wire feed guides
        this.feedGuides = new WireFeedGuides(4, this.materialLib);
        this.feedGuides.getGroup().position.set(5, 0, 0);
        this.group.add(this.feedGuides.getGroup());
        
        // 3. Create wire curve from coil to machine
        const startPoint = new THREE.Vector3(2, 3, 0);
        const endPoint = new THREE.Vector3(18, 1.1, 0);
        this.wireCurve = new WireCurve(startPoint, endPoint);
        const wireMesh = this.wireCurve.createWireMesh(
            this.wireDiameter,
            this.materialLib.get('steelWire')
        );
        if (wireMesh) {
            this.group.add(wireMesh);
        }
        
        // 4. Straightening machine
        this.straighteningMachine = new StraighteningMachine(this.materialLib);
        this.straighteningMachine.setPosition(20, 0, 0);
        this.group.add(this.straighteningMachine.getGroup());
        
        // 5. Cutting system
        this.cuttingSystem = new CuttingSystem(config.cutterType, this.materialLib);
        this.cuttingSystem.getGroup().position.set(28, 0, 0);
        this.group.add(this.cuttingSystem.getGroup());
        
        // 6. Spark particles (for cutting effect)
        this.sparkParticles = new SparkParticles();
        this.sparkParticles.getGroup().position.set(28, 1.5, 0);
        this.group.add(this.sparkParticles.getGroup());
        
        // 7. Bar handler (conveyor)
        this.barHandler = new BarHandler(this.materialLib);
        this.barHandler.getGroup().position.set(32, 0, 0);
        this.group.add(this.barHandler.getGroup());
        
        // 8. Bundle stacker
        this.bundleStacker = new BundleStacker(
            this.wireDiameter,
            this.cutLength,
            this.materialLib
        );
        this.bundleStacker.getGroup().position.set(50, 0, 0);
        this.group.add(this.bundleStacker.getGroup());
    }

    /**
     * Update production line state and animations
     */
    public update(deltaTime: number, currentTime: number): void {
        // Update state machine
        this.updateStateLogic(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Update components
        if (this.coil) {
            this.coil.update(this.RPM, deltaTime);
        }
        
        if (this.feedGuides) {
            this.feedGuides.update(this.wireSpeed, deltaTime);
        }
        
        if (this.straighteningMachine) {
            this.straighteningMachine.update(this.RPM, deltaTime);
            this.straighteningMachine.updateState(this.state);
        }
        
        if (this.cuttingSystem) {
            this.cuttingSystem.update(this.RPM, deltaTime);
        }
        
        if (this.wireCurve) {
            this.wireCurve.updateWireFlow(this.wireSpeed * deltaTime * 0.01);
        }
        
        if (this.barHandler) {
            this.barHandler.update(deltaTime);
        }
        
        if (this.sparkParticles) {
            this.sparkParticles.update(deltaTime);
        }
        
        // Check for cutting
        if (this.state === 'PRODUCTION' && this.accumLength >= this.cutLength) {
            this.triggerCut(currentTime);
        }
    }

    private updateStateLogic(deltaTime: number): void {
        // Set target RPM based on state
        switch (this.state) {
            case 'STOCK':
            case 'LOADED':
                this.targetRPM = 0;
                break;
            case 'OPENED':
                this.targetRPM = 300 + Math.random() * 100;
                break;
            case 'THREADED':
                this.targetRPM = 800 + Math.random() * 200;
                break;
            case 'ADJUST':
                this.targetRPM = 1200 + Math.random() * 300;
                break;
            case 'PRODUCTION':
            case 'RUN':
                this.targetRPM = 1500 + Math.random() * 400;
                
                // Accumulate wire length
                const speedMetersPerSec = (this.RPM / 60) * (Math.PI * this.wireDiameter / 1000);
                this.accumLength += speedMetersPerSec * deltaTime;
                break;
            case 'STOP':
                this.targetRPM = 0;
                break;
            case 'ERROR':
                this.targetRPM = 0;
                break;
        }
    }

    private updatePhysics(deltaTime: number): void {
        // Smooth RPM transition
        const rpmDiff = this.targetRPM - this.RPM;
        this.RPM += rpmDiff * deltaTime * 2;
        
        // Update derived values
        this.wireSpeed = this.RPM * 0.003;
        this.temperature = 20 + (this.RPM / 2000) * 60 + Math.random() * 5;
        this.rollerPressure = (this.RPM / 2000) * 150 + Math.random() * 10;
        this.vibration = (this.RPM / 2000) * 5 + Math.random() * 2;
        
        // Simulate weight decrease
        if (this.state === 'PRODUCTION' && this.RPM > 0) {
            this.weight -= deltaTime * 0.5;
            if (this.weight < 0) this.weight = 0;
        }
    }

    private triggerCut(_currentTime: number): void {
        if (!this.cuttingSystem || this.cuttingSystem.isCutting()) {
            return;
        }
        
        // Trigger cutting animation
        this.cuttingSystem.triggerCut();
        
        // Trigger spark effect
        if (this.sparkParticles) {
            this.sparkParticles.trigger(new THREE.Vector3(28, 1.5, 0));
        }
        
        // Create new bar
        if (this.barHandler) {
            this.barHandler.addBar(this.cutLength, this.wireDiameter);
        }
        
        // Add bar to bundle after conveyor delay (simulated instantly for now)
        setTimeout(() => {
            if (this.bundleStacker) {
                this.bundleStacker.addBar();
                this.productionCount = this.bundleStacker.getBarCount();
                this.updateBundleState();
            }
        }, 2000); // 2 second delay
        
        // Reset accumulator
        this.accumLength = 0;
    }

    private updateBundleState(): void {
        if (this.productionCount === 0) {
            this.bundleState = 'EMPTY';
        } else if (this.productionCount < 24) {
            this.bundleState = 'FILLING';
        } else if (this.productionCount < 48) {
            this.bundleState = 'HALF';
        } else {
            this.bundleState = 'FULL';
        }
    }

    /**
     * Change production state
     */
    public setState(newState: ProductionState): void {
        this.state = newState;
        console.log(`Line ${this.lineId} -> ${newState}`);
    }

    /**
     * Get line position
     */
    public getPosition(): THREE.Vector3 {
        return this.group.position;
    }

    /**
     * Reset production line
     */
    public reset(): void {
        this.state = 'STOCK';
        this.RPM = 0;
        this.targetRPM = 0;
        this.rollerPressure = 0;
        this.temperature = 20;
        this.vibration = 0;
        this.wireSpeed = 0;
        this.accumLength = 0;
        this.productionCount = 0;
        this.weight = 700 + Math.random() * 300;
        this.bundleState = 'EMPTY';
        
        if (this.bundleStacker) {
            this.bundleStacker.reset();
        }
    }

    /**
     * Dispose all resources
     */
    public dispose(): void {
        if (this.coil) this.coil.dispose();
        if (this.feedGuides) this.feedGuides.dispose();
        if (this.straighteningMachine) this.straighteningMachine.dispose();
        if (this.cuttingSystem) this.cuttingSystem.dispose();
        if (this.barHandler) this.barHandler.dispose();
        if (this.bundleStacker) this.bundleStacker.dispose();
        if (this.wireCurve) this.wireCurve.dispose();
        if (this.sparkParticles) this.sparkParticles.dispose();
    }
}
