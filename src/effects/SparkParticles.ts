/**
 * SparkParticles.ts
 * Spark particle effects for cutting operations
 */

import * as THREE from 'three';

export class SparkParticles {
    private group: THREE.Group;
    private particles!: THREE.Points;  // Use definite assignment assertion
    private particleSystem: {
        position: THREE.Vector3;
        velocity: THREE.Vector3;
        life: number;
    }[] = [];
    private maxParticles: number = 50;
    private isActive: boolean = false;
    private activeTime: number = 0;
    
    constructor() {
        this.group = new THREE.Group();
        this.createParticleSystem();
    }

    private createParticleSystem(): void {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxParticles * 3);
        const colors = new Float32Array(this.maxParticles * 3);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.group.add(this.particles);
    }

    /**
     * Trigger spark effect at position
     */
    public trigger(position: THREE.Vector3): void {
        this.isActive = true;
        this.activeTime = 0;
        
        // Create new particles
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            const upwardBias = 0.3 + Math.random() * 0.7;
            
            this.particleSystem.push({
                position: position.clone(),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    upwardBias * speed,
                    Math.sin(angle) * speed
                ),
                life: 1.0
            });
        }
    }

    /**
     * Update particle system
     */
    public update(deltaTime: number): void {
        if (!this.isActive) return;
        
        this.activeTime += deltaTime;
        
        const positions = this.particles.geometry.attributes.position.array as Float32Array;
        const colors = this.particles.geometry.attributes.color.array as Float32Array;
        
        let activeParticles = 0;
        
        for (let i = 0; i < this.particleSystem.length; i++) {
            const particle = this.particleSystem[i];
            
            // Update particle
            particle.velocity.y -= deltaTime * 2; // gravity
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.life -= deltaTime * 2;
            
            if (particle.life > 0) {
                // Update position
                positions[activeParticles * 3] = particle.position.x;
                positions[activeParticles * 3 + 1] = particle.position.y;
                positions[activeParticles * 3 + 2] = particle.position.z;
                
                // Update color (orange to red fade)
                const life = particle.life;
                colors[activeParticles * 3] = 1.0;
                colors[activeParticles * 3 + 1] = 0.5 * life;
                colors[activeParticles * 3 + 2] = 0.0;
                
                activeParticles++;
            }
        }
        
        // Remove dead particles
        this.particleSystem = this.particleSystem.filter(p => p.life > 0);
        
        // Update geometry
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
        this.particles.geometry.setDrawRange(0, activeParticles);
        
        // Deactivate if no particles left
        if (this.particleSystem.length === 0 && this.activeTime > 0.5) {
            this.isActive = false;
        }
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public dispose(): void {
        this.particles.geometry.dispose();
        if (this.particles.material instanceof THREE.Material) {
            this.particles.material.dispose();
        }
    }
}
