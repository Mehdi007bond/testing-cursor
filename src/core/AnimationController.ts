/**
 * AnimationController.ts
 * Synchronized animation controller for all production lines
 */

import { ProductionLine, ProductionState } from './ProductionLine';

export class AnimationController {
    private productionLines: ProductionLine[] = [];
    private autoCycleEnabled: boolean = false;
    private cycleInterval: number = 8; // seconds between state changes
    private running: boolean = false;
    
    constructor() {}

    /**
     * Register a production line for animation control
     */
    public addLine(line: ProductionLine): void {
        this.productionLines.push(line);
    }

    /**
     * Remove a production line
     */
    public removeLine(line: ProductionLine): void {
        const index = this.productionLines.indexOf(line);
        if (index > -1) {
            this.productionLines.splice(index, 1);
        }
    }

    /**
     * Start all animations
     */
    public start(): void {
        this.running = true;
        this.productionLines.forEach(line => {
            if (line.state === 'STOCK') {
                line.setState('LOADED');
            }
        });
    }

    /**
     * Stop all animations
     */
    public stop(): void {
        this.running = false;
        this.productionLines.forEach(line => {
            line.setState('STOP');
        });
    }

    /**
     * Reset all lines
     */
    public reset(): void {
        this.running = false;
        this.autoCycleEnabled = false;
        this.productionLines.forEach(line => {
            line.reset();
        });
    }

    /**
     * Enable/disable auto-cycle
     */
    public setAutoCycle(enabled: boolean): void {
        this.autoCycleEnabled = enabled;
    }

    /**
     * Update all production lines
     */
    public update(deltaTime: number, currentTime: number): void {
        if (!this.running) return;

        this.productionLines.forEach((line) => {
            // Update line
            line.update(deltaTime, currentTime);
            
            // Auto-cycle states if enabled
            if (this.autoCycleEnabled) {
                this.updateAutoCycle(line, deltaTime);
            }
        });
    }

    private updateAutoCycle(line: ProductionLine, deltaTime: number): void {
        // Increment cycle time
        if (!line.cycleTime) {
            line.cycleTime = 0;
        }
        line.cycleTime += deltaTime;
        
        // Advance state based on interval
        if (line.cycleTime > this.cycleInterval) {
            line.cycleTime = 0;
            this.advanceLineState(line);
        }
    }

    private advanceLineState(line: ProductionLine): void {
        const states: ProductionState[] = ['STOCK', 'LOADED', 'OPENED', 'THREADED', 'ADJUST', 'PRODUCTION'];
        const currentIndex = states.indexOf(line.state);
        const nextIndex = (currentIndex + 1) % states.length;
        line.setState(states[nextIndex]);
    }

    /**
     * Set specific line state
     */
    public setLineState(lineId: number, state: ProductionState): void {
        const line = this.productionLines.find(l => l.lineId === lineId);
        if (line) {
            line.setState(state);
        }
    }

    /**
     * Get all production lines
     */
    public getLines(): ProductionLine[] {
        return this.productionLines;
    }

    /**
     * Get line by ID
     */
    public getLine(lineId: number): ProductionLine | undefined {
        return this.productionLines.find(l => l.lineId === lineId);
    }

    /**
     * Get running state
     */
    public isRunning(): boolean {
        return this.running;
    }

    /**
     * Dispose all lines
     */
    public dispose(): void {
        this.productionLines.forEach(line => line.dispose());
        this.productionLines = [];
    }
}
