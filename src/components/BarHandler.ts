/**
 * BarHandler.ts
 * Conveyor and bar motion system
 */

import * as THREE from 'three';
import { MaterialLibrary } from '../core/MaterialLibrary';

export class BarHandler {
    private materialLib: MaterialLibrary;
    private group: THREE.Group;
    private conveyor: THREE.Mesh | null = null;
    private bars: THREE.Mesh[] = [];
    
    constructor(materialLib: MaterialLibrary) {
        this.materialLib = materialLib;
        this.group = new THREE.Group();
        
        this.createConveyor();
    }

    private createConveyor(): void {
        // Conveyor base with incline
        const conveyorGeometry = new THREE.BoxGeometry(8, 0.15, 1.5);
        this.conveyor = new THREE.Mesh(conveyorGeometry, this.materialLib.get('conveyor'));
        this.conveyor.position.set(4, 0.075, 0);
        this.conveyor.rotation.z = -0.15; // 10-15 degree incline
        this.conveyor.castShadow = true;
        this.conveyor.receiveShadow = true;
        this.group.add(this.conveyor);
        
        // Conveyor rollers
        this.createConveyorRollers();
        
        // Side rails
        this.createSideRails();
    }

    private createConveyorRollers(): void {
        const rollerGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12);
        
        for (let i = 0; i < 10; i++) {
            const roller = new THREE.Mesh(rollerGeometry, this.materialLib.get('roller'));
            roller.position.set(i * 0.8, 0.075, 0);
            roller.rotation.z = Math.PI / 2 - 0.15;
            roller.castShadow = true;
            this.group.add(roller);
        }
    }

    private createSideRails(): void {
        const railGeometry = new THREE.BoxGeometry(8, 0.1, 0.05);
        
        const rail1 = new THREE.Mesh(railGeometry, this.materialLib.get('machineBase'));
        rail1.position.set(4, 0.2, 0.8);
        rail1.rotation.z = -0.15;
        rail1.castShadow = true;
        this.group.add(rail1);
        
        const rail2 = new THREE.Mesh(railGeometry, this.materialLib.get('machineBase'));
        rail2.position.set(4, 0.2, -0.8);
        rail2.rotation.z = -0.15;
        rail2.castShadow = true;
        this.group.add(rail2);
    }

    /**
     * Add a new bar to the conveyor
     */
    public addBar(barLength: number, barDiameter: number): THREE.Mesh {
        const barGeometry = new THREE.CylinderGeometry(
            barDiameter / 2000,
            barDiameter / 2000,
            barLength,
            16
        );
        
        const bar = new THREE.Mesh(barGeometry, this.materialLib.get('steelBar'));
        bar.rotation.z = Math.PI / 2 - 0.15;
        bar.position.set(0, 1.5, 0);
        bar.castShadow = true;
        
        this.group.add(bar);
        this.bars.push(bar);
        
        return bar;
    }

    /**
     * Update bar positions
     */
    public update(deltaTime: number): void {
        // Move bars along conveyor
        this.bars = this.bars.filter(bar => {
            bar.position.x += deltaTime * 0.5; // slide speed
            bar.position.y -= deltaTime * 0.1; // gravity effect
            
            // Remove bar if it's moved too far
            if (bar.position.x > 10) {
                this.group.remove(bar);
                bar.geometry.dispose();
                if (Array.isArray(bar.material)) {
                    bar.material.forEach(m => m.dispose());
                } else {
                    bar.material.dispose();
                }
                return false;
            }
            
            return true;
        });
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public dispose(): void {
        this.bars.forEach(bar => {
            this.group.remove(bar);
            bar.geometry.dispose();
            if (Array.isArray(bar.material)) {
                bar.material.forEach(m => m.dispose());
            } else {
                bar.material.dispose();
            }
        });
        
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
