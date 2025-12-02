/**
 * BundleStacker.ts
 * Hexagonal packing system for bar bundles
 */

import * as THREE from 'three';
import { MaterialLibrary } from '../core/MaterialLibrary';
import { HexagonalPacking } from '../utils/HexagonalPacking';

export class BundleStacker {
    private materialLib: MaterialLibrary;
    private group: THREE.Group;
    private bars: THREE.Mesh[] = [];
    private barDiameter: number;
    private barLength: number;
    private useInstancedMesh: boolean = true;
    private instancedMesh: THREE.InstancedMesh | null = null;
    private barCount: number = 0;
    
    constructor(barDiameter: number, barLength: number, materialLib: MaterialLibrary) {
        this.barDiameter = barDiameter;
        this.barLength = barLength;
        this.materialLib = materialLib;
        this.group = new THREE.Group();
        
        this.createPallet();
        this.initInstancedMesh();
    }

    private createPallet(): void {
        // Wooden pallet base
        const palletGeometry = new THREE.BoxGeometry(3, 0.15, 2.5);
        const pallet = new THREE.Mesh(palletGeometry, this.materialLib.get('wood'));
        pallet.position.set(0, 0.075, 0);
        pallet.castShadow = true;
        pallet.receiveShadow = true;
        this.group.add(pallet);
        
        // Pallet support blocks
        const blockGeometry = new THREE.BoxGeometry(0.2, 0.12, 2.3);
        for (let i = 0; i < 3; i++) {
            const block = new THREE.Mesh(blockGeometry, this.materialLib.get('wood'));
            block.position.set((i - 1) * 1.2, 0.06, 0);
            block.castShadow = true;
            this.group.add(block);
        }
    }

    private initInstancedMesh(): void {
        if (!this.useInstancedMesh) return;
        
        const barGeometry = new THREE.CylinderGeometry(
            this.barDiameter / 2000,
            this.barDiameter / 2000,
            this.barLength,
            16
        );
        
        // Create instanced mesh for up to 100 bars
        const maxBars = 100;
        this.instancedMesh = new THREE.InstancedMesh(
            barGeometry,
            this.materialLib.get('steelBar'),
            maxBars
        );
        this.instancedMesh.castShadow = true;
        this.instancedMesh.receiveShadow = true;
        this.instancedMesh.count = 0;
        
        this.group.add(this.instancedMesh);
    }

    /**
     * Add a bar to the bundle
     */
    public addBar(): void {
        if (this.useInstancedMesh && this.instancedMesh) {
            this.addBarInstanced();
        } else {
            this.addBarIndividual();
        }
        
        // Add bundle straps every 24 bars
        if (this.barCount > 0 && this.barCount % 24 === 0) {
            this.createBundleStraps();
        }
    }

    private addBarInstanced(): void {
        if (!this.instancedMesh || this.barCount >= this.instancedMesh.instanceMatrix.count) {
            return;
        }
        
        const position = HexagonalPacking.getGridPosition(
            this.barCount,
            this.barDiameter / 1000,
            6,
            4
        );
        
        const matrix = new THREE.Matrix4();
        matrix.makeRotationZ(Math.PI / 2);
        matrix.setPosition(
            -this.barLength / 2,
            0.2 + position.row * (this.barDiameter / 1000) * 1.1,
            position.z
        );
        
        this.instancedMesh.setMatrixAt(this.barCount, matrix);
        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.instancedMesh.count = this.barCount + 1;
        
        this.barCount++;
    }

    private addBarIndividual(): void {
        const barGeometry = new THREE.CylinderGeometry(
            this.barDiameter / 2000,
            this.barDiameter / 2000,
            this.barLength,
            16
        );
        
        const bar = new THREE.Mesh(barGeometry, this.materialLib.get('steelBar'));
        bar.rotation.z = Math.PI / 2;
        bar.castShadow = true;
        
        const position = HexagonalPacking.getGridPosition(
            this.barCount,
            this.barDiameter / 1000,
            6,
            4
        );
        
        bar.position.set(
            -this.barLength / 2,
            0.2 + position.row * (this.barDiameter / 1000) * 1.1,
            position.z
        );
        
        this.group.add(bar);
        this.bars.push(bar);
        this.barCount++;
    }

    private createBundleStraps(): void {
        const numStraps = 3;
        const strapPositions = [-this.barLength * 0.3, 0, this.barLength * 0.3];
        
        strapPositions.forEach(xPos => {
            const strapGeometry = new THREE.TorusGeometry(0.35, 0.015, 8, 16);
            const strap = new THREE.Mesh(strapGeometry, this.materialLib.get('strap'));
            strap.position.set(xPos, 0.5, 0);
            strap.rotation.y = Math.PI / 2;
            this.group.add(strap);
        });
    }

    /**
     * Get current bar count
     */
    public getBarCount(): number {
        return this.barCount;
    }

    /**
     * Reset bundle
     */
    public reset(): void {
        // Remove individual bars
        this.bars.forEach(bar => {
            this.group.remove(bar);
            bar.geometry.dispose();
            if (Array.isArray(bar.material)) {
                bar.material.forEach(m => m.dispose());
            } else {
                bar.material.dispose();
            }
        });
        this.bars = [];
        
        // Reset instanced mesh
        if (this.instancedMesh) {
            this.instancedMesh.count = 0;
            this.instancedMesh.instanceMatrix.needsUpdate = true;
        }
        
        this.barCount = 0;
        
        // Remove straps
        const strapsToRemove: THREE.Object3D[] = [];
        this.group.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
                strapsToRemove.push(child);
            }
        });
        strapsToRemove.forEach(strap => this.group.remove(strap));
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public dispose(): void {
        this.reset();
        
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
