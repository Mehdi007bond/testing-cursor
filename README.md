# Industrial IoT Digital Twin Dashboard

A comprehensive 3D simulation dashboard for steel wire manufacturing with predictive maintenance monitoring.

## Features

### 3D Factory Simulation
- **8 Production Lines**: Each line simulates a complete steel wire manufacturing process
- **Realistic 3D Models**: Input coils, straightening machines, cutting units, and output bundles
- **Interactive Camera**: Zoom, rotate, and pan around the factory floor
- **Auto-zoom to Lines**: Select any line to automatically zoom the camera to that production line

### Steel Wire Manufacturing Process
Each production line follows a 6-step workflow:
1. **STOCK**: Raw material storage
2. **LOADED**: Coil loaded onto machine
3. **OPENED**: Coil opening and wire feeding
4. **THREADED**: Wire threaded through straightening machine
5. **ADJUST**: Machine adjustment and calibration
6. **PRODUCTION**: Active production with automatic cutting

### Live Sensor Monitoring
- **RPM**: Real-time rotation speed monitoring (0-2000 RPM)
- **Temperature**: Machine temperature tracking (20-80°C)
- **Pressure**: Hydraulic pressure monitoring (0-160 bar)
- **Vibration**: Vibration analysis (0-10 mm/s)
- **Speed**: Wire feed speed (m/min)
- **Weight**: Stock material weight tracking

### Predictive Maintenance Alerts
- **High RPM Warning**: Alerts when RPM exceeds 1800
- **Low Stock Alert**: Warning when material weight drops below 500kg
- **Length Deviation**: Alerts for cut length deviations > 0.05m
- **Pressure Issues**: High pressure warnings > 140 bar

### Visual Features
- **Color-coded Status**: Machines change color based on production state
- **Animated Components**: 
  - Rotating input coils
  - Spinning straightening rollers (7 top + 6 bottom)
  - Animated cutting blade
  - Growing output bundles with hexagonal packing
- **Industrial UI**: Dark theme with cyan/teal accents
- **Real-time Charts**: Vibration analysis with trend visualization

## How to Run

### Option 1: Open Directly in Browser
1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
3. The application will load automatically

### Option 2: Using a Local Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## How to Use

### Simulation Controls
- **Start Simulation**: Begins the production simulation for all lines
- **Stop Simulation**: Pauses all production activities
- **Reset System**: Clears all data and returns to initial state
- **Auto-Cycle Lines**: Automatically advances lines through production states every 5-15 seconds
- **Hangar Lights**: Toggle factory lighting

### Machine Selection
- Use the dropdown menu to select individual production lines
- Camera will automatically zoom to the selected line
- Sensor data updates to show selected line information

### Viewing Data
- **Left Panel**: Simulation controls, machine selector, and factory status overview
- **Center**: 3D factory floor visualization
- **Right Panel**: Live sensor feed, vibration analysis, and active alerts

### 3D Interaction
- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or Shift + left-click)
- **Zoom**: Mouse wheel or pinch gesture

## Technical Details

### Wire Diameters
Each of the 8 production lines produces different wire diameters:
- Line 1: 5.5mm
- Line 2: 6.0mm
- Line 3: 6.5mm
- Line 4: 7.0mm
- Line 5: 7.5mm
- Line 6: 8.0mm
- Line 7: 9.0mm
- Line 8: 10.0mm

### 3D Components

#### Input Coil (Bobine)
- Large cylindrical steel roll representation
- Mounting flanges and hollow center
- Wooden pallet base
- Orange diameter indicator band
- Rotates based on production RPM

#### Straightening Machine
- Industrial base unit
- 7 top rollers (vertical alignment)
- 6 bottom rollers (staggered, horizontal alignment)
- 5 center guide rollers
- Opposite rotation directions for top/bottom rollers
- Color changes based on production state

#### Cutting Unit
- Hydraulic cutting base
- Animated blade arm with pivot motion
- Automatic cutting triggered by accumulated length
- Cuts triggered every 12 meters of wire production

#### Output Bundle
- Conveyor belt base
- Wooden pallet with support blocks
- Hexagonal packing algorithm for rebar stacking (6×4 grid)
- Metal binding straps every 24 bars
- Realistic corrugated rebar appearance

### Technology Stack
- **Three.js** (r128): 3D graphics and rendering
- **OrbitControls**: Camera interaction
- **Vanilla JavaScript**: Application logic
- **HTML5 Canvas**: 2D vibration chart rendering
- **CSS3**: Modern UI styling with gradients and animations

## Production Simulation Details

### Automatic Cutting System
- Wire length accumulates based on RPM and diameter
- Cutting triggered when accumulated length reaches 12 meters
- Blade animation with pivot motion
- New rebar bar created and added to bundle

### Hexagonal Packing
- Bars stacked in 6×4 grid pattern (24 bars per bundle)
- Realistic spacing based on wire diameter
- Metal ties added every 24 bars
- Efficient space utilization

### State Machine
Each line progresses through states with different RPM targets:
- **STOCK/LOADED**: 0 RPM (idle)
- **OPENED**: 300-400 RPM (slow start)
- **THREADED**: 800-1000 RPM (medium speed)
- **ADJUST**: 1200-1500 RPM (high speed)
- **PRODUCTION**: 1500-1900 RPM (full production)

## Performance Notes

- Optimized shadow mapping (4K resolution)
- Efficient instanced geometry for multiple bars
- Smooth 60 FPS animation
- Responsive design for various screen sizes
- Hardware-accelerated 3D rendering

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires WebGL support and modern JavaScript (ES6+).

## Future Enhancements

Potential features for future development:
- Cost analysis module for maintenance estimation
- Virtual assistant for machine status queries
- Historical data logging and analytics
- Export production reports
- Multi-user collaboration
- IoT sensor integration for real hardware
- Machine learning for predictive failure analysis
- Mobile app companion

## License

This project is provided as-is for educational and demonstration purposes.

## Credits

Developed as an Industrial IoT Digital Twin Dashboard demonstrating modern web-based 3D visualization and real-time monitoring capabilities for smart manufacturing.