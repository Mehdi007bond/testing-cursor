/**
 * HexagonalPacking.js
 * Mathematical utilities for hexagonal bar packing in bundles
 */

export class HexagonalPacking {
    /**
     * Calculate hexagonal packing position for a bar
     * @param {number} index - Bar index in bundle
     * @param {number} barDiameter - Diameter of individual bar in meters
     * @returns {Object} - {layer, positionInLayer, x, y, z}
     */
    static getBarPosition(index, barDiameter) {
        // Hexagonal layers: 1, 6, 12, 18, 24, 30, ...
        // Layer n has 6*n bars (except center which is 1)
        
        let layer = 0;
        let barsInPreviousLayers = 0;
        let currentLayerSize = 1;

        // Find which layer this bar belongs to
        while (barsInPreviousLayers + currentLayerSize <= index) {
            barsInPreviousLayers += currentLayerSize;
            layer++;
            currentLayerSize = layer === 0 ? 1 : 6 * layer;
        }

        const positionInLayer = index - barsInPreviousLayers;

        // Calculate position based on layer and position within layer
        let x = 0, z = 0;

        if (layer === 0) {
            // Center bar
            x = 0;
            z = 0;
        } else {
            // Hexagonal arrangement
            const angle = (positionInLayer / currentLayerSize) * Math.PI * 2;
            const radius = layer * barDiameter * 1.1; // 1.1 for spacing
            
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
        }

        return {
            layer,
            positionInLayer,
            x,
            y: 0, // Y is handled by stacking vertically
            z
        };
    }

    /**
     * Get total number of bars in n complete layers
     */
    static getBarsInLayers(numLayers) {
        if (numLayers === 0) return 0;
        if (numLayers === 1) return 1;
        
        let total = 1; // center
        for (let i = 1; i < numLayers; i++) {
            total += 6 * i;
        }
        return total;
    }

    /**
     * Calculate layer number for a given bar index
     */
    static getLayerForIndex(index) {
        let layer = 0;
        let barsInPreviousLayers = 0;
        let currentLayerSize = 1;

        while (barsInPreviousLayers + currentLayerSize <= index) {
            barsInPreviousLayers += currentLayerSize;
            layer++;
            currentLayerSize = layer === 0 ? 1 : 6 * layer;
        }

        return layer;
    }

    /**
     * Get bundle radius for given number of layers
     */
    static getBundleRadius(numLayers, barDiameter) {
        return numLayers * barDiameter * 1.1;
    }

    /**
     * Calculate optimal grid arrangement (when hexagonal is complex)
     */
    static getGridPosition(index, barDiameter, cols = 6, rows = 4) {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const spacing = barDiameter * 1.1;
        const x = (col - cols / 2 + 0.5) * spacing;
        const z = (row - rows / 2 + 0.5) * spacing;
        
        return { x, y: 0, z, row, col };
    }
}
