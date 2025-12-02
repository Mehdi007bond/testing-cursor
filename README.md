# 🏭 3D Digital Twin - Steel Wire Manufacturing System

Ultra-detailed 3D Digital Twin of an 8-line steel wire straightening & cutting system built with **Three.js** and **TypeScript**.

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160-orange)
![Vite](https://img.shields.io/badge/Vite-5.0-yellow)

---

## 🚀 Quick Start (Super Easy!)

```bash
# Install dependencies
npm install

# Start development server
npm start
```

**That's it!** The app opens automatically at `http://localhost:3000`

---

## ✨ Features

### 8 Independent Production Lines
- Each line simulates complete steel wire manufacturing
- Wire diameters: **5.5mm to 10.0mm**
- Cut lengths: **10m to 12m**
- States: STOCK, LOADED, OPENED, THREADED, ADJUST, PRODUCTION

### Ultra-Detailed Components

#### ⭐ Steel Wire Coil (Bobine)
- **250-450 helical loops** (not a simple torus!)
- Realistic steel texture with anisotropic highlights
- Dynamic unwinding animation
- Coil diameter: 1.1m - 1.4m

#### 🎢 Wire Feed Guides
- 3-5 cylindrical rollers per line
- Smooth rotation based on wire speed
- Metallic arms with bearing simulation

#### 🔧 Straightening Machine (Redresseuse)
- **TOP row**: 7 rollers
- **BOTTOM row**: 6 staggered rollers
- Roller diameter: 10-16 cm
- Machine vibration during operation
- Color changes based on production state

#### ✂️ Cutting System
- **Guillotine blade** (sliding, 8cm stroke)
- **Rotating disc** (Ø20-25cm)
- **Spark particle effects** on cutting
- Automatic triggering at configured length

#### 📦 Bar Handling & Stacking
- Conveyor with 10-15° incline
- **Hexagonal packing** arrangement
- Metal straps every 24 bars
- Dynamic bundle growth

### Visual Quality
- **PBR (Physically Based Rendering)** materials
- Metallic surfaces with proper roughness
- 4K shadow maps
- Industrial lighting (orange + blue contrast)
- **60 FPS** smooth performance

---

## 🎮 Controls

### UI Controls
- **Start/Stop/Reset**: Control simulation
- **Auto-Cycle**: Automatic state progression
- **Machine Selector**: Focus on specific lines
- **Hangar Lights**: Toggle ambient lighting

### 3D Camera
- **Rotate**: Left-click + drag
- **Pan**: Right-click + drag
- **Zoom**: Mouse wheel
- **Auto-focus**: Click on any line

---

## 📊 Live Monitoring

Each line provides real-time data:
- **RPM**: 0-2000 rpm
- **Temperature**: 20-80°C
- **Pressure**: 0-160 bar
- **Vibration**: 0-10 mm/s
- **Production Count**: Bars produced
- **Bundle State**: EMPTY/FILLING/HALF/FULL

---

## 🛠️ Technology Stack

- **Three.js** (0.160): 3D graphics engine
- **TypeScript** (5.3): Type-safe development
- **Vite** (5.0): Lightning-fast build tool
- **PBR Materials**: Physically Based Rendering

---

## 📁 Project Structure

```
/src
  /components        # 3D Components
    - SteelWireCoil.js
    - WireFeedGuides.js
    - StraighteningMachine.js
    - CuttingSystem.ts
    - BarHandler.ts
    - BundleStacker.ts
  /core             # Core Systems
    - MaterialLibrary.js
    - ProductionLine.ts
    - AnimationController.ts
  /effects          # Visual Effects
    - SparkParticles.ts
    - Lighting.ts
  /utils            # Utilities
    - WireCurve.js
    - HexagonalPacking.js
  - FactoryScene.ts
  - main.ts
  - style.css
```

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type check TypeScript
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📖 Documentation

- **[DEV_README.md](DEV_README.md)**: Detailed development guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**: Complete implementation details

---

## 🎯 Key Features

✅ Modular TypeScript architecture  
✅ 250-450 helical wire loops per coil  
✅ Dynamic wire unwinding with CatmullRomCurve3  
✅ Alternating roller system (7 top + 6 bottom)  
✅ Spark particle effects  
✅ Hexagonal bundle packing  
✅ InstancedMesh optimization  
✅ 60 FPS performance  
✅ PBR metallic materials  
✅ Industrial lighting setup  

---

## 📸 Screenshots

*Screenshots will be added after first run*

---

## 🐛 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires WebGL 2.0

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🎉 Ready to Use!

Start developing immediately:

```bash
npm install && npm start
```

The application will open automatically in your browser!

---

**Built with ❤️ using Three.js, TypeScript, and Vite**

### Contributing

Feel free to contribute improvements or report issues!

### Credits

Developed as an advanced Industrial IoT Digital Twin demonstration showcasing modern web-based 3D visualization capabilities.