/**
 * StraighteningMachine.js
 * Detailed straightening machine with alternating rollers
 */

export class StraighteningMachine {
    constructor(materialLib) {
        this.materialLib = materialLib;
        this.group = new THREE.Group();
        this.topRollers = [];
        this.bottomRollers = [];
        this.basePosition = new THREE.Vector3();
        this.vibrationTime = 0;
        
        this.createMachine();
    }

    createMachine() {
        // Machine frame - large steel chassis
        this.createFrame();
        
        // Top row - 7 rollers
        this.createTopRollers();
        
        // Bottom row - 6 rollers (staggered)
        this.createBottomRollers();
        
        // Roller brackets
        this.createBrackets();
        
        // Side panels
        this.createSidePanels();
    }

    createFrame() {
        // Main base
        const baseGeometry = new THREE.BoxGeometry(2.5, 0.3, 1.0);
        const base = new THREE.Mesh(baseGeometry, this.materialLib.get('machineBase'));
        base.position.y = 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        this.group.add(base);
        this.baseMesh = base;
        
        // Vertical supports
        for (let i = 0; i < 4; i++) {
            const supportGeometry = new THREE.BoxGeometry(0.15, 1.5, 0.15);
            const support = new THREE.Mesh(supportGeometry, this.materialLib.get('machineBase'));
            support.position.set(
                -1.1 + i * 0.73,
                0.9,
                i % 2 === 0 ? 0.4 : -0.4
            );
            support.castShadow = true;
            this.group.add(support);
        }
        
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(2.5, 0.2, 1.0);
        const topFrame = new THREE.Mesh(topFrameGeometry, this.materialLib.get('machineBase'));
        topFrame.position.y = 1.7;
        topFrame.castShadow = true;
        this.group.add(topFrame);
    }

    createTopRollers() {
        const numRollers = 7;
        const spacing = 2.5 / (numRollers + 1);
        
        for (let i = 0; i < numRollers; i++) {
            const rollerDiameter = 0.10 + Math.random() * 0.06; // 10-16 cm
            const rollerWidth = 0.6; // 6 cm
            
            const rollerGeometry = new THREE.CylinderGeometry(
                rollerDiameter / 2,
                rollerDiameter / 2,
                rollerWidth,
                20
            );
            
            // Add beveled edges
            rollerGeometry.computeVertexNormals();
            
            const roller = new THREE.Mesh(rollerGeometry, this.materialLib.get('roller'));
            roller.position.set(
                -1.25 + (i + 1) * spacing,
                1.4,
                0
            );
            roller.rotation.z = Math.PI / 2;
            roller.castShadow = true;
            
            this.group.add(roller);
            this.topRollers.push(roller);
        }
    }

    createBottomRollers() {
        const numRollers = 6;
        const spacing = 2.5 / (numRollers + 1);
        
        for (let i = 0; i < numRollers; i++) {
            const rollerDiameter = 0.10 + Math.random() * 0.06; // 10-16 cm
            const rollerWidth = 0.6; // 6 cm
            
            const rollerGeometry = new THREE.CylinderGeometry(
                rollerDiameter / 2,
                rollerDiameter / 2,
                rollerWidth,
                20
            );
            
            const roller = new THREE.Mesh(rollerGeometry, this.materialLib.get('roller'));
            roller.position.set(
                -1.25 + (i + 1) * spacing + spacing / 2, // offset for stagger
                0.8,
                0
            );
            roller.rotation.z = Math.PI / 2;
            roller.castShadow = true;
            
            this.group.add(roller);
            this.bottomRollers.push(roller);
        }
    }

    createBrackets() {
        // Angled steel blocks for roller mounting
        const bracketGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.3);
        
        // Top roller brackets
        this.topRollers.forEach((roller) => {
            const bracket1 = new THREE.Mesh(bracketGeometry, this.materialLib.get('flange'));
            bracket1.position.set(roller.position.x, roller.position.y + 0.15, 0.35);
            bracket1.castShadow = true;
            this.group.add(bracket1);
            
            const bracket2 = new THREE.Mesh(bracketGeometry, this.materialLib.get('flange'));
            bracket2.position.set(roller.position.x, roller.position.y + 0.15, -0.35);
            bracket2.castShadow = true;
            this.group.add(bracket2);
            
            // Bolts
            this.addBolts(bracket1);
            this.addBolts(bracket2);
        });
        
        // Bottom roller brackets
        this.bottomRollers.forEach((roller) => {
            const bracket1 = new THREE.Mesh(bracketGeometry, this.materialLib.get('flange'));
            bracket1.position.set(roller.position.x, roller.position.y - 0.15, 0.35);
            bracket1.castShadow = true;
            this.group.add(bracket1);
            
            const bracket2 = new THREE.Mesh(bracketGeometry, this.materialLib.get('flange'));
            bracket2.position.set(roller.position.x, roller.position.y - 0.15, -0.35);
            bracket2.castShadow = true;
            this.group.add(bracket2);
            
            // Bolts
            this.addBolts(bracket1);
            this.addBolts(bracket2);
        });
    }

    addBolts(bracket) {
        const boltGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8);
        
        for (let i = 0; i < 2; i++) {
            const bolt = new THREE.Mesh(boltGeometry, this.materialLib.get('flange'));
            bolt.position.copy(bracket.position);
            bolt.position.y += (i === 0 ? 0.08 : -0.08);
            bolt.rotation.x = Math.PI / 2;
            this.group.add(bolt);
        }
    }

    createSidePanels() {
        const panelGeometry = new THREE.BoxGeometry(2.5, 1.2, 0.05);
        
        const leftPanel = new THREE.Mesh(panelGeometry, this.materialLib.get('machineBase'));
        leftPanel.position.set(0, 1.1, 0.525);
        leftPanel.castShadow = true;
        leftPanel.receiveShadow = true;
        this.group.add(leftPanel);
        
        const rightPanel = new THREE.Mesh(panelGeometry, this.materialLib.get('machineBase'));
        rightPanel.position.set(0, 1.1, -0.525);
        rightPanel.castShadow = true;
        rightPanel.receiveShadow = true;
        this.group.add(rightPanel);
    }

    /**
     * Update machine animation
     * @param {number} rpm - Motor RPM
     * @param {number} deltaTime - Time since last frame
     */
    update(rpm, deltaTime) {
        if (rpm > 0) {
            // Rotate top rollers
            this.topRollers.forEach((roller, i) => {
                roller.rotation.x += (rpm / 60) * deltaTime * (i % 2 === 0 ? 1 : -1) * 0.02;
            });
            
            // Rotate bottom rollers (opposite direction)
            this.bottomRollers.forEach((roller, i) => {
                roller.rotation.x -= (rpm / 60) * deltaTime * (i % 2 === 0 ? 1 : -1) * 0.02;
            });
            
            // Machine vibration
            this.vibrationTime += deltaTime * 20;
            const vibration = Math.sin(this.vibrationTime) * 0.0005;
            this.group.position.x = this.basePosition.x + vibration;
        }
    }

    /**
     * Update machine state color
     */
    updateState(state) {
        if (this.baseMesh) {
            this.baseMesh.material = this.materialLib.getMachineBaseMaterial(state);
        }
    }

    setPosition(x, y, z) {
        this.basePosition.set(x, y, z);
        this.group.position.copy(this.basePosition);
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
