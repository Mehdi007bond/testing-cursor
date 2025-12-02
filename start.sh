#!/bin/bash
# Quick Start Script for 3D Digital Twin

echo "=========================================="
echo "🏭 3D Digital Twin - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "The application will open automatically in your browser."
echo "If it doesn't, navigate to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""
echo "=========================================="

npm run dev
