/**
 * MaterialLibrary.js
 * PBR metallic materials for industrial equipment
 */

export class MaterialLibrary {
    constructor() {
        this.materials = {};
        this.initializeMaterials();
    }

    initializeMaterials() {
        // Steel coil material - dark metallic with anisotropic highlights
        this.materials.steelCoil = new THREE.MeshStandardMaterial({
            color: 0x708090,
            metalness: 0.85,
            roughness: 0.35,
            envMapIntensity: 1.2
        });

        // Bright steel wire material
        this.materials.steelWire = new THREE.MeshStandardMaterial({
            color: 0x9a9a9a,
            metalness: 0.9,
            roughness: 0.2,
            envMapIntensity: 1.5
        });

        // Steel bar material (slightly brighter than coil)
        this.materials.steelBar = new THREE.MeshStandardMaterial({
            color: 0x8b8b8b,
            metalness: 0.8,
            roughness: 0.3
        });

        // Machine base - dark industrial gray
        this.materials.machineBase = new THREE.MeshStandardMaterial({
            color: 0x2a4d69,
            metalness: 0.6,
            roughness: 0.5
        });

        // Roller material - polished metal
        this.materials.roller = new THREE.MeshStandardMaterial({
            color: 0x505050,
            metalness: 0.95,
            roughness: 0.15,
            envMapIntensity: 1.8
        });

        // Cutting blade - very shiny
        this.materials.cuttingBlade = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.98,
            roughness: 0.05
        });

        // Orange accent (for indicators, warnings)
        this.materials.orangeAccent = new THREE.MeshStandardMaterial({
            color: 0xff8844,
            emissive: 0xff6622,
            emissiveIntensity: 0.3,
            metalness: 0.7,
            roughness: 0.3
        });

        // Red for cutting unit
        this.materials.redMachine = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xff2222,
            emissiveIntensity: 0.2
        });

        // Wooden pallet
        this.materials.wood = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.0
        });

        // Conveyor belt
        this.materials.conveyor = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.7
        });

        // Floor material
        this.materials.floor = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.85,
            metalness: 0.15
        });

        // Inner hollow center
        this.materials.innerCore = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.5,
            roughness: 0.7
        });

        // Flange material
        this.materials.flange = new THREE.MeshStandardMaterial({
            color: 0x505050,
            metalness: 0.7,
            roughness: 0.4
        });

        // Guide material
        this.materials.guide = new THREE.MeshStandardMaterial({
            color: 0xff6622,
            metalness: 0.7,
            roughness: 0.3
        });

        // Bundle strap material
        this.materials.strap = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.1
        });
    }

    get(materialName) {
        return this.materials[materialName] || this.materials.steelCoil;
    }

    /**
     * Create a dynamic material based on state
     */
    getMachineBaseMaterial(state) {
        const colors = {
            'STOCK': 0x666666,
            'LOADED': 0x4a90e2,
            'OPENED': 0x50c878,
            'THREADED': 0x00d9ff,
            'ADJUST': 0xffa726,
            'PRODUCTION': 0x00c853,
            'RUN': 0x00c853,
            'STOP': 0x666666,
            'ERROR': 0xff5252
        };

        const color = colors[state] || 0x2a4d69;

        return new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.6,
            roughness: 0.4
        });
    }

    /**
     * Dispose all materials
     */
    dispose() {
        Object.values(this.materials).forEach(material => {
            material.dispose();
        });
    }
}
