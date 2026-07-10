# Miku Live Wallpaper - Animated Beach Time-Lapse

A 4K web wallpaper for Wallpaper Engine. The scene follows local system time and moves through seven connected summer-beach moments, from dawn to night.

![Wallpaper preview](preview.png)

## Features

- Seven linked `3840x2160` time-of-day scenes driven by the local clock.
- Smooth scene blending with changing sunlight, color temperature, mist, vignette, and stars.
- Gentle character motion: blink, breathing, subtle sway, hair movement, and skirt movement.
- Environmental motion: cloud veil, morning mist, tide, water shimmer, glints, and reflection ripples.
- Local-only runtime. No network requests are made by the wallpaper.

## Install In Wallpaper Engine

1. Download or clone this repository.
2. In Wallpaper Engine, create or import a local Web wallpaper project.
3. Select `index.html` as the entry file.
4. Choose the wallpaper from the Installed tab.

## Controls

Wallpaper Engine exposes these properties:

- **Time Blend Strength**: scene-transition strength.
- **Enable Ambient Motion**: toggles sky, water, mist, and tide motion.
- **Enable Character Motion**: toggles blink and subtle character motion.
- **Motion Intensity**: adjusts all motion amplitudes.
- **84 Second Day Preview**: plays a full-day test loop.

## Browser Preview

Run a local web server in this directory:

```powershell
py -m http.server 8766 --bind 127.0.0.1
```

Then open one of the following local URLs:

- `http://127.0.0.1:8766/` - real local time
- `http://127.0.0.1:8766/?demo=1` - full day in 84 seconds
- `http://127.0.0.1:8766/?showcase=1` - amplified motion showcase, full day in 36 seconds
- `http://127.0.0.1:8766/?time=05:30&debug=1` - fixed-time inspection

## Project Structure

```text
assets/       Seven 4K time-of-day source images
index.html    Wallpaper entry point
script.js     Time system and Wallpaper Engine properties
style.css     Motion layers and atmosphere effects
project.json  Wallpaper Engine project configuration
```

## License And Artwork

The repository's MIT license applies to the project code. The character and artwork may be subject to separate third-party rights; verify that you have the necessary rights before redistributing the wallpaper or publishing it to Steam Workshop.
