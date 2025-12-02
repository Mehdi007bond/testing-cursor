/**
 * CuttingSystem.ts
 * Cutting system with guillotine blade or rotating disc
 */

import * as THREE from 'three';
import { MaterialLibrary } from '../core/MaterialLibrary';

export type CutterType = 'GUILLOTINE' | 'DISC';

export class CuttingSystem {
    private materialLib: MaterialLibrary;
    private cutterType: CutterType;
    private group: THREE.Group;
    private blade: THREE.Mesh | null = null;
    private disc: THREE.Mesh | null = null;
    private arm: THREE.Mesh | null = null;
    private armRotation: number = 0;
    private cutting: boolean = false;
    private cutTime: number = 0;
    
    constructor(cutterType: CutterType, materialLib: MaterialLibrary) {
        this.cutterType = cutterType;
        this.materialLib = materialLib;
        this.group = new THREE.Group();
        
        this.createCuttingUnit();
    }

    private createCuttingUnit(): void {
        // Base unit
        this.createBase();
        
        if (this.cutterType === 'GUILLOTINE') {
            this.createGuillotineCutter();
        } else {
            this.createDiscCutter();
        }
    }

    private createBase(): void {
        const baseGeometry = new THREE.BoxGeometry(1.5, 2.0, 2.0);
        const base = new THREE.Mesh(baseGeometry, this.materialLib.get('machineBase'));
        base.position.y = 1.0;
        base.castShadow = true;
        base.receiveShadow = true;
        this.group.add(base);
    }

    private createGuillotineCutter(): void {
        // Blade arm
        const armGeometry = new THREE.BoxGeometry(0.25, 1.2, 0.6);
        this.arm = new THREE.Mesh(armGeometry, this.materialLib.get('redMachine'));
        this.arm.position.set(0, 2.2, 0);
        this.arm.castShadow = true;
        this.group.add(this.arm);
        
        // Guillotine blade (trapezoid shape)
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(-0.5, 0);
        bladeShape.lineTo(0.5, 0);
        bladeShape.lineTo(0.4, -0.8);
        bladeShape.lineTo(-0.4, -0.8);
        bladeShape.closePath();
        
        const extrudeSettings = {
            depth: 0.03,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 1
        };
        
        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
        this.blade = new THREE.Mesh(bladeGeometry, this.materialLib.get('cuttingBlade'));
        this.blade.position.set(0, 1.6, 0);
        this.blade.rotation.x = Math.PI / 2;
        this.blade.castShadow = true;
        this.group.add(this.blade);
        
        // Guide rails
        this.createGuideRails();
    }

    private createDiscCutter(): void {
        // Rotating disc
        const discGeometry = new THREE.CylinderGeometry(0.125, 0.125, 0.02, 32);
        this.disc = new THREE.Mesh(discGeometry, this.materialLib.get('cuttingBlade'));
        this.disc.position.set(0, 1.5, 0);
        this.disc.rotation.z = Math.PI / 2;
        this.disc.castShadow = true;
        this.group.add(this.disc);
        
        // Motor housing
        const housingGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
        const housing = new THREE.Mesh(housingGeometry, this.materialLib.get('redMachine'));
        housing.position.set(0, 1.5, 0);
        housing.rotation.z = Math.PI / 2;
        housing.castShadow = true;
        this.group.add(housing);
        
        // Mounting arm
        const armGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.3);
        this.arm = new THREE.Mesh(armGeometry, this.materialLib.get('redMachine'));
        this.arm.position.set(0, 1.9, 0);
        this.arm.castShadow = true;
        this.group.add(this.arm);
    }

    private createGuideRails(): void {
        const railGeometry = new THREE.BoxGeometry(0.05, 2.5, 0.05);
        
        const rail1 = new THREE.Mesh(railGeometry, this.materialLib.get('flange'));
        rail1.position.set(-0.4, 1.5, 0.3);
        rail1.castShadow = true;
        this.group.add(rail1);
        
        const rail2 = new THREE.Mesh(railGeometry, this.materialLib.get('flange'));
        rail2.position.set(-0.4, 1.5, -0.3);
        rail2.castShadow = true;
        this.group.add(rail2);
    }

    /**
     * Trigger cutting action
     */
    public triggerCut(): void {
        if (!this.cutting) {
            this.cutting = true;
            this.armRotation = 0;
            this.cutTime = 0;
        }
    }

    /**
     * Check if cutting is in progress
     */
    public isCutting(): boolean {
        return this.cutting;
    }

    /**
     * Update cutting animation
     */
    public update(rpm: number, deltaTime: number): void {
        if (this.cutterType === 'GUILLOTINE' && this.cutting) {
            // Guillotine motion
            this.cutTime += deltaTime * 8;
            
            if (this.cutTime < Math.PI / 2) {
                // Down stroke
                const movement = Math.sin(this.cutTime) * 0.08;
                if (this.blade) {
                    this.blade.position.y = 1.6 - movement;
                }
                if (this.arm) {
                    this.arm.position.y = 2.2 - movement;
                }
            } else if (this.cutTime < Math.PI) {
                // Up stroke
                const movement = Math.sin(this.cutTime) * 0.08;
                if (this.blade) {
                    this.blade.position.y = 1.6 - movement;
                }
                if (this.arm) {
                    this.arm.position.y = 2.2 - movement;
                }
            } else {
                // Reset
                this.cutting = false;
                this.cutTime = 0;
                if (this.blade) {
                    this.blade.position.y = 1.6;
                }
                if (this.arm) {
                    this.arm.position.y = 2.2;
                }
            }
        } else if (this.cutterType === 'DISC' && this.disc) {
            // Disc rotation
            const rotationSpeed = rpm > 0 ? rpm * 1.5 : 0;
            this.disc.rotation.y += (rotationSpeed / 60) * deltaTime;
        }
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public dispose(): void {
        this.group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
}
