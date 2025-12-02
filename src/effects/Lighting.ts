/**
 * Lighting.ts
 * Industrial lighting setup
 */

import * as THREE from 'three';

export class Lighting {
    private lights: THREE.Light[] = [];
    private scene: THREE.Scene;
    
    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.setupLighting();
    }

    private setupLighting(): void {
        // Ambient light - subtle base illumination
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Main directional light - warm orange (industrial ambiance)
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
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);
        this.lights.push(mainLight);

        // Cool fill light - blue contrast
        const fillLight = new THREE.DirectionalLight(0x80c0ff, 0.3);
        fillLight.position.set(-50, 30, -30);
        this.scene.add(fillLight);
        this.lights.push(fillLight);

        // Accent point lights - orange industrial glow
        const accentLight1 = new THREE.PointLight(0xff8844, 0.5, 60);
        accentLight1.position.set(-40, 10, 0);
        this.scene.add(accentLight1);
        this.lights.push(accentLight1);

        const accentLight2 = new THREE.PointLight(0xff8844, 0.5, 60);
        accentLight2.position.set(40, 10, 0);
        this.scene.add(accentLight2);
        this.lights.push(accentLight2);

        // Overhead industrial lights along the production lines
        for (let i = 0; i < 8; i++) {
            const overheadLight = new THREE.SpotLight(0xffffff, 0.4, 30, Math.PI / 6, 0.5);
            overheadLight.position.set(-30, 15, -35 + i * 10);
            overheadLight.target.position.set(-30, 0, -35 + i * 10);
            overheadLight.castShadow = true;
            overheadLight.shadow.mapSize.width = 1024;
            overheadLight.shadow.mapSize.height = 1024;
            this.scene.add(overheadLight);
            this.scene.add(overheadLight.target);
            this.lights.push(overheadLight);
        }
    }

    /**
     * Toggle hangar lights
     */
    public toggleHangarLights(enabled: boolean): void {
        this.lights.forEach(light => {
            if (light instanceof THREE.AmbientLight) {
                light.intensity = enabled ? 0.3 : 0.1;
            }
        });
    }

    /**
     * Update lighting (for dynamic effects)
     */
    public update(_deltaTime: number): void {
        // Could add flickering or dynamic lighting effects here
    }

    public dispose(): void {
        this.lights.forEach(light => {
            this.scene.remove(light);
            if (light instanceof THREE.SpotLight && light.target) {
                this.scene.remove(light.target);
            }
        });
        this.lights = [];
    }
}
