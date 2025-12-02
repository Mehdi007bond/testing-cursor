/**
 * WireCurve.js
 * Dynamic CatmullRomCurve3 for wire path from coil to machine
 */

export class WireCurve {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.curve = null;
        this.wireMesh = null;
        this.updateCurve();
    }

    updateCurve() {
        // Create a smooth curve from coil to machine entry
        const points = [
            this.startPoint.clone(),
            new THREE.Vector3(
                this.startPoint.x + 2,
                this.startPoint.y - 0.5,
                this.startPoint.z
            ),
            new THREE.Vector3(
                this.startPoint.x + 5,
                this.startPoint.y - 1,
                this.startPoint.z
            ),
            new THREE.Vector3(
                (this.startPoint.x + this.endPoint.x) / 2,
                this.startPoint.y - 1.2,
                this.startPoint.z
            ),
            new THREE.Vector3(
                this.endPoint.x - 3,
                this.endPoint.y,
                this.endPoint.z
            ),
            this.endPoint.clone()
        ];

        this.curve = new THREE.CatmullRomCurve3(points);
        this.curve.tension = 0.5;
    }

    createWireMesh(wireDiameter, material) {
        const tubeGeometry = new THREE.TubeGeometry(
            this.curve,
            64,  // segments
            wireDiameter / 2000,  // radius in meters
            8,   // radial segments
            false
        );

        this.wireMesh = new THREE.Mesh(tubeGeometry, material);
        this.wireMesh.castShadow = true;
        return this.wireMesh;
    }

    updateWireFlow(offset) {
        // Animate wire flow by updating curve points
        if (this.wireMesh) {
            // Could add texture offset animation here
            if (this.wireMesh.material.map) {
                this.wireMesh.material.map.offset.x += offset;
            }
        }
    }

    getCurve() {
        return this.curve;
    }

    dispose() {
        if (this.wireMesh) {
            this.wireMesh.geometry.dispose();
            if (this.wireMesh.parent) {
                this.wireMesh.parent.remove(this.wireMesh);
            }
        }
    }
}
