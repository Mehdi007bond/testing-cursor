/**
 * WireFeedGuides.js
 * Roller guides for wire feeding
 */

export class WireFeedGuides {
    constructor(numGuides, materialLib) {
        this.numGuides = numGuides; // 3-5 guides
        this.materialLib = materialLib;
        this.group = new THREE.Group();
        this.rollers = [];
        
        this.createGuides();
    }

    createGuides() {
        const spacing = 2.5; // spacing between guides
        
        for (let i = 0; i < this.numGuides; i++) {
            const guideGroup = new THREE.Group();
            
            // Cylindrical roller
            const rollerRadius = 0.04 + Math.random() * 0.02; // 4-6 cm
            const rollerGeometry = new THREE.CylinderGeometry(
                rollerRadius,
                rollerRadius,
                0.8, // width
                16
            );
            const roller = new THREE.Mesh(rollerGeometry, this.materialLib.get('roller'));
            roller.rotation.z = Math.PI / 2;
            roller.castShadow = true;
            guideGroup.add(roller);
            
            // Metallic arm
            const armGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.05);
            const arm1 = new THREE.Mesh(armGeometry, this.materialLib.get('machineBase'));
            arm1.position.set(0.3, -0.25, 0);
            arm1.castShadow = true;
            guideGroup.add(arm1);
            
            const arm2 = new THREE.Mesh(armGeometry, this.materialLib.get('machineBase'));
            arm2.position.set(-0.3, -0.25, 0);
            arm2.castShadow = true;
            guideGroup.add(arm2);
            
            // Base support
            const baseGeometry = new THREE.BoxGeometry(0.7, 0.15, 0.3);
            const base = new THREE.Mesh(baseGeometry, this.materialLib.get('machineBase'));
            base.position.y = -0.575;
            base.castShadow = true;
            base.receiveShadow = true;
            guideGroup.add(base);
            
            // Bearing simulation - small cylinders at ends
            const bearingGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 12);
            const bearing1 = new THREE.Mesh(bearingGeometry, this.materialLib.get('flange'));
            bearing1.rotation.z = Math.PI / 2;
            bearing1.position.x = 0.425;
            guideGroup.add(bearing1);
            
            const bearing2 = new THREE.Mesh(bearingGeometry, this.materialLib.get('flange'));
            bearing2.rotation.z = Math.PI / 2;
            bearing2.position.x = -0.425;
            guideGroup.add(bearing2);
            
            // Position guide in sequence
            guideGroup.position.x = i * spacing;
            guideGroup.position.y = 1.5 - i * 0.1; // slight descent
            
            this.group.add(guideGroup);
            this.rollers.push(roller);
        }
    }

    /**
     * Update roller rotation based on wire speed
     * @param {number} wireSpeed - Wire speed
     * @param {number} deltaTime - Time since last frame
     */
    update(wireSpeed, deltaTime) {
        this.rollers.forEach((roller) => {
            roller.rotation.x += wireSpeed * 0.01 * deltaTime;
        });
    }

    getGroup() {
        return this.group;
    }

    dispose() {
        this.group.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
