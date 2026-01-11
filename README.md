# Basketball Pro - Game Features

## 🎮 Infinite Gameplay
The game now features **infinite gameplay** with automatic ball reset:

### Auto-Reset Triggers:
1. ✅ **Score** - Ball resets 0.8 seconds after scoring
2. ✅ **Miss (Off-Screen)** - Ball resets when it goes off any edge
3. ✅ **Timeout** - Ball auto-resets after 5 seconds if stuck

### Statistics Tracked:
- **Score** - Total successful baskets made
- **Shots** - Total number of shots taken
- **Streak** - Current consecutive baskets (resets on miss)
- **Best** - Highest score achieved in session

## 🎯 Controls
- **↑/↓** - Adjust shooting angle (smoother 0.5° increments)
- **←/→** - Adjust shooting power (0.3 increments)
- **Space** - Shoot the ball

## 🔥 Special Features
- **Fire Mode** - Activates at 3+ streak with particle effects
- **Realistic Physics** - Matter.js physics engine
- **Backboard Reflection** - Ball bounces off backboard
- **Moving Basket** - Basket moves up and down for challenge
- **Trajectory Preview** - See where your shot will go

## 🚀 How to Run

### Web Version (Recommended):
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Python Version:
```bash
python3 "ball on fire.py"
```

## 📊 Accuracy Tracking
Calculate your shooting percentage:
- **Accuracy** = (Score / Shots) × 100%

Example: 15 scores out of 20 shots = 75% accuracy!
