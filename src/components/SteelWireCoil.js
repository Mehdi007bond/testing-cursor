/**
 * SteelWireCoil.js
 * Ultra-detailed steel wire coil (bobine) with helical loops
 */

export class SteelWireCoil {
    constructor(diameter, width, wireDiameter, materialLib) {
        this.diameter = diameter; // coil diameter (1.1m - 1.4m)
        this.width = width; // coil width (0.6m)
        this.wireDiameter = wireDiameter; // wire diameter (4mm - 12mm)
        this.materialLib = materialLib;
        this.group = new THREE.Group();
        this.rotation = 0;
        this.rotationSpeed = 0;
        
        this.createCoil();
    }

    createCoil() {
        // Main coil body with helical loops
        this.createHelicalCoil();
        
        // Inner hollow center
        this.createInnerCore();
        
        // Mounting flanges
        this.createFlanges();
        
        // Diameter indicator band
        this.createIndicatorBand();
        
        // Support pallet base
        this.createPallet();
    }

    createHelicalCoil() {
        const coilRadius = this.diameter / 2;
        const numLoops = Math.floor(250 + Math.random() * 200); // 250-450 loops
        const wireRadius = this.wireDiameter / 2000; // convert mm to m
        
        // Create helical path for the wire
        const helixPoints = [];
        const turnsPerLoop = 0.8; // slightly overlapping
        
        for (let i = 0; i < numLoops; i++) {
            const angle = (i / numLoops) * Math.PI * 2 * turnsPerLoop;
            const radiusVariation = coilRadius + (Math.random() - 0.5) * 0.02; // slight imperfection
            const x = Math.cos(angle) * radiusVariation;
            const y = (i / numLoops - 0.5) * this.width;
            const z = Math.sin(angle) * radiusVariation;
            
            helixPoints.push(new THREE.Vector3(x, y, z));
        }

        // Create a smooth curve through the helix points
        const curve = new THREE.CatmullRomCurve3(helixPoints, true); // closed curve
        
        // Create tube geometry along the curve
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            numLoops * 4, // segments
            wireRadius,
            8, // radial segments
            true // closed
        );

        const coilMesh = new THREE.Mesh(tubeGeometry, this.materialLib.get('steelCoil'));
        coilMesh.rotation.z = Math.PI / 2;
        coilMesh.castShadow = true;
        coilMesh.receiveShadow = true;
        
        this.group.add(coilMesh);
        this.coilMesh = coilMesh;
    }

    createInnerCore() {
        const innerGeometry = new THREE.CylinderGeometry(0.15, 0.15, this.width + 0.1, 16);
        const innerMesh = new THREE.Mesh(innerGeometry, this.materialLib.get('innerCore'));
        innerMesh.rotation.z = Math.PI / 2;
        innerMesh.castShadow = true;
        this.group.add(innerMesh);
    }

    createFlanges() {
        const flangeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
        
        // Left flange
        const leftFlange = new THREE.Mesh(flangeGeometry, this.materialLib.get('flange'));
        leftFlange.rotation.z = Math.PI / 2;
        leftFlange.position.x = -this.width / 2 - 0.025;
        leftFlange.castShadow = true;
        this.group.add(leftFlange);

        // Right flange
        const rightFlange = new THREE.Mesh(flangeGeometry, this.materialLib.get('flange'));
        rightFlange.rotation.z = Math.PI / 2;
        rightFlange.position.x = this.width / 2 + 0.025;
        rightFlange.castShadow = true;
        this.group.add(rightFlange);
    }

    createIndicatorBand() {
        const bandGeometry = new THREE.TorusGeometry(
            this.diameter / 2 - 0.05,
            0.025,
            8,
            32
        );
        const band = new THREE.Mesh(bandGeometry, this.materialLib.get('orangeAccent'));
        band.rotation.y = Math.PI / 2;
        this.group.add(band);
    }

    createPallet() {
        const palletGeometry = new THREE.BoxGeometry(
            this.diameter * 0.8,
            0.15,
            this.diameter * 0.8
        );
        const pallet = new THREE.Mesh(palletGeometry, this.materialLib.get('wood'));
        pallet.position.y = -this.diameter / 2 - 0.075;
        pallet.castShadow = true;
        pallet.receiveShadow = true;
        this.group.add(pallet);

        // Pallet slats
        const slatGeometry = new THREE.BoxGeometry(
            this.diameter * 0.8,
            0.05,
            0.1
        );
        
        for (let i = 0; i < 5; i++) {
            const slat = new THREE.Mesh(slatGeometry, this.materialLib.get('wood'));
            slat.position.y = -this.diameter / 2 - 0.175;
            slat.position.z = (i - 2) * 0.25;
            this.group.add(slat);
        }
    }

    /**
     * Update rotation animation
     * @param {number} rpm - Motor RPM
     * @param {number} deltaTime - Time since last frame
     */
    update(rpm, deltaTime) {
        if (rpm > 0) {
            this.rotationSpeed = rpm * 0.002;
            this.rotation += this.rotationSpeed * deltaTime;
            this.group.rotation.x = this.rotation;
        }
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
