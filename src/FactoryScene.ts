/**
 * FactoryScene.ts
 * Global factory scene setup with 8 production lines
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MaterialLibrary } from './core/MaterialLibrary';
import { ProductionLine, ProductionLineConfig } from './core/ProductionLine';
import { AnimationController } from './core/AnimationController';
import { Lighting } from './effects/Lighting';

export class FactoryScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private materialLib: MaterialLibrary;
    private animationController: AnimationController;
    private lighting: Lighting;
    private productionLines: ProductionLine[] = [];
    private selectedLineIndex: number | null = null;
    private clock: THREE.Clock;
    
    constructor(canvas: HTMLCanvasElement) {
        this.clock = new THREE.Clock();
        
        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a15);
        this.scene.fog = new THREE.Fog(0x0a0a15, 50, 200);
        
        // Initialize camera
        const container = canvas.parentElement!;
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 50, 80);
        this.camera.lookAt(0, 0, 0);
        
        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Initialize controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 150;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Initialize systems
        this.materialLib = new MaterialLibrary();
        this.animationController = new AnimationController();
        this.lighting = new Lighting(this.scene);
        
        // Create factory environment
        this.createFactoryFloor();
        this.createProductionLines();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private createFactoryFloor(): void {
        // Main floor (100m x 60m)
        const floorGeometry = new THREE.PlaneGeometry(100, 60);
        const floor = new THREE.Mesh(floorGeometry, this.materialLib.get('floor'));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Reflective metallic grid
        const gridHelper = new THREE.GridHelper(100, 50, 0x00d9ff, 0x1a3050);
        gridHelper.material.opacity = 0.25;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }

    private createProductionLines(): void {
        const lineSpacing = 10; // meters between lines
        const startZ = -35;
        const wireDiameters = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 9.0, 10.0];
        const cutterTypes: ('GUILLOTINE' | 'DISC')[] = ['GUILLOTINE', 'DISC', 'GUILLOTINE', 'DISC', 'GUILLOTINE', 'DISC', 'GUILLOTINE', 'DISC'];
        
        for (let i = 0; i < 8; i++) {
            const config: ProductionLineConfig = {
                lineId: i + 1,
                wireDiameter: wireDiameters[i],
                cutLength: 10 + Math.random() * 2, // 10-12m
                coilDiameter: 1.1 + i * 0.04, // 1.1-1.4m
                cutterType: cutterTypes[i]
            };
            
            const line = new ProductionLine(config, this.materialLib);
            line.group.position.set(-60, 0, startZ + (i * lineSpacing));
            
            this.scene.add(line.group);
            this.productionLines.push(line);
            this.animationController.addLine(line);
        }
    }

    /**
     * Start simulation
     */
    public startSimulation(): void {
        this.animationController.start();
    }

    /**
     * Stop simulation
     */
    public stopSimulation(): void {
        this.animationController.stop();
    }

    /**
     * Reset simulation
     */
    public resetSimulation(): void {
        this.animationController.reset();
    }

    /**
     * Toggle auto-cycle
     */
    public setAutoCycle(enabled: boolean): void {
        this.animationController.setAutoCycle(enabled);
    }

    /**
     * Select a specific line
     */
    public selectLine(lineIndex: number | null): void {
        this.selectedLineIndex = lineIndex;
        
        if (lineIndex === null) {
            // Return to overview
            this.camera.position.set(0, 50, 80);
            this.controls.target.set(0, 0, 0);
        } else if (lineIndex >= 0 && lineIndex < this.productionLines.length) {
            // Zoom to selected line
            const line = this.productionLines[lineIndex];
            const targetPos = line.getPosition();
            this.camera.position.set(targetPos.x + 20, 25, targetPos.z + 15);
            this.controls.target.set(targetPos.x + 20, 0, targetPos.z);
        }
    }

    /**
     * Get production lines
     */
    public getProductionLines(): ProductionLine[] {
        return this.productionLines;
    }

    /**
     * Get selected line
     */
    public getSelectedLine(): ProductionLine | null {
        if (this.selectedLineIndex === null) return null;
        return this.productionLines[this.selectedLineIndex] || null;
    }

    /**
     * Animation loop
     */
    public animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        
        const deltaTime = this.clock.getDelta();
        const currentTime = this.clock.getElapsedTime();
        
        // Update animation controller
        this.animationController.update(deltaTime, currentTime);
        
        // Update lighting
        this.lighting.update(deltaTime);
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    private onWindowResize(): void {
        const container = this.renderer.domElement.parentElement!;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    /**
     * Toggle hangar lights
     */
    public toggleHangarLights(enabled: boolean): void {
        this.lighting.toggleHangarLights(enabled);
    }

    /**
     * Dispose all resources
     */
    public dispose(): void {
        this.animationController.dispose();
        this.lighting.dispose();
        this.materialLib.dispose();
        this.renderer.dispose();
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
}
