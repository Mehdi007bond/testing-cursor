# 3D Digital Twin - Steel Wire Manufacturing System 🏭

Ultra-detailed 3D Digital Twin of an 8-line steel wire straightening & cutting system built with Three.js and TypeScript.

## 🚀 Quick Start (Super Easy!)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server (auto-opens browser)
npm run dev

# Or simply
npm start
```

That's it! The app will automatically open at `http://localhost:3000`

## 📁 Project Structure

```
/src
  /components          # 3D Components
    - SteelWireCoil.js      # Bobine with 250-450 helical loops
    - WireFeedGuides.js     # 3-5 roller guides
    - StraighteningMachine.js # Redresseuse with 7+6 rollers
    - CuttingSystem.ts      # Guillotine/disc cutter
    - BarHandler.ts         # Conveyor system
    - BundleStacker.ts      # Hexagonal packing
  /core                # Core Systems
    - ProductionLine.js     # Complete line as Three.Group
    - MaterialLibrary.js    # PBR metallic materials
    - AnimationController.js # Synchronized animations
  /effects             # Visual Effects
    - SparkParticles.ts     # Cutting spark effects
    - Lighting.ts           # Industrial lighting
  /utils               # Utilities
    - WireCurve.js          # Dynamic CatmullRomCurve3
    - HexagonalPacking.js   # Bundle arrangement math
  - main.js                 # Entry point
  - FactoryScene.js         # Global scene setup
/index.html                 # Main HTML file
```

## 🛠️ Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Type check TypeScript
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✨ Features

### 8 Production Lines
- Each line is independent with own state machine
- States: RUN, STOP, ERROR, AUTO-CYCLE
- Wire diameters: 4mm - 12mm
- Cut lengths: 6m - 12m

### Ultra-Detailed Components

#### Steel Wire Coil (Bobine) ⭐ Most Important
- Helical geometry: 250-450 loops
- Realistic steel texture with anisotropic highlights
- Dynamic unwinding animation
- Rotation speed: RPM × 0.002

#### Wire Feed Guides
- 3-5 cylindrical rollers per line
- Smooth rotation based on wire speed
- Metallic arms with bearing simulation

#### Straightening Machine (Redresseuse)
- **TOP row**: 7 rollers
- **BOTTOM row**: 6 rollers (alternating)
- Roller dimensions: Ø10-16cm × 6cm
- Machine vibration during operation
- Color changes based on state

#### Cutting System
- **Type A**: Guillotine blade (sliding, 8cm stroke)
- **Type B**: Rotating disc (Ø20-25cm)
- Spark particle effects on cut
- Triggers at configured cut length

#### Bar Handling & Stacking
- Bars exit at constant velocity
- 10-15° incline conveyor
- Hexagonal packing arrangement
- Dynamic bundle growth
- Metal straps every 24 bars

### Visual Quality
- PBR (Physically Based Rendering) materials
- Metallic surfaces with proper roughness
- Real-time shadows (4K shadow maps)
- Industrial lighting setup
- Smooth 60 FPS performance

### Camera Controls
- **Rotate**: Left-click + drag
- **Pan**: Right-click + drag
- **Zoom**: Mouse wheel
- **Auto-focus**: Click on any line
- Smooth damping for professional feel

### Per-Line Parameters
Each line exposes:
- RPM (motor speed)
- Roller pressure
- Cut length (6-12m)
- Wire diameter (4-12mm)
- Production count
- Bundle state
- Wire speed
- Status (RUN/STOP/ERROR)

## 🎮 Controls

### UI Controls
- **Start Simulation**: Begin production
- **Stop Simulation**: Pause all lines
- **Reset System**: Clear all data
- **Auto-Cycle**: Automatic state progression
- **Hangar Lights**: Toggle ambient lighting
- **Machine Selector**: Focus on specific lines

### 3D Viewport
- Orbit camera around factory
- Click lines to zoom in
- Hover for object highlighting

## 📊 Performance

- **Target**: 60 FPS
- **Optimization**: InstancedMesh for bar bundles
- **LOD**: Level of detail for distant objects
- **Shadows**: Optimized shadow mapping
- **GPU**: Hardware-accelerated rendering

## 🔧 Technology Stack

- **Three.js**: 3D graphics engine
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool & dev server
- **ES Modules**: Modern JavaScript modules

## 📝 Configuration

Edit parameters in `src/core/ProductionLine.js`:

```javascript
{
  RPM: 1500,              // Motor speed
  cutLength: 12.0,        // Bar length in meters
  wireDiameter: 8.0,      // Wire diameter in mm
  rollerPressure: 120,    // Roller pressure in bar
  // ... more parameters
}
```

## 🎨 Material Customization

Materials are defined in `src/core/MaterialLibrary.js`:
- Steel coil (metalness: 0.85, roughness: 0.35)
- Steel wire (metalness: 0.9, roughness: 0.2)
- Machine base (metalness: 0.6, roughness: 0.5)
- Cutting blade (metalness: 0.98, roughness: 0.05)

## 🐛 Troubleshooting

### Port already in use?
```bash
# Change port in vite.config.js
server: { port: 3001 }
```

### TypeScript errors?
```bash
npm run type-check
```

### Build issues?
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- Three.js: https://threejs.org/docs/
- TypeScript: https://www.typescriptlang.org/docs/
- Vite: https://vitejs.dev/guide/

## 🎯 Roadmap

- [ ] Complete all component implementations
- [ ] Add sound effects (cutting, machine hum)
- [ ] Implement collision detection
- [ ] Add VR support
- [ ] Real-time analytics dashboard
- [ ] Export production reports
- [ ] Mobile responsive controls

## 📄 License

This project is for educational and demonstration purposes.

---

**Built with ❤️ using Three.js and TypeScript**
