# Every iPhone Ever Created

A visual timeline of every iPhone released from 2007 to present.

## Build

```bash
npm run build
```

This reads `data/iphones.json` and generates `index.html`.

## Project Structure

```
├── data/
│   └── iphones.json      # iPhone data (source of truth)
├── scripts/
│   └── generate-html.js  # HTML generator script
├── css/                  # Webflow stylesheets
├── images/               # Device images and icons
├── js/                   # Webflow scripts
└── index.html            # Generated output (do not edit directly)
```

## Adding/Updating iPhones

Edit `data/iphones.json`, then run `npm run build`.

### JSON Structure

```json
{
  "id": "iphone-17-pro-max",
  "model": "iPhone 17 Pro Max",
  "launchYear": 2025,
  "device": "iphone17_pro_max.jpg",
  "colors": [
    { "name": "Cosmic Orange", "hex": "#f77e2d" }
  ],
  "display": {
    "size": "6.9″",
    "type": "Super Retina XDR display",
    "features": ["ProMotion technology", "Always-On display"]
  },
  "design": ["Aluminum frame", "Action button"],
  "appleIntelligence": true,
  "chip": {
    "image": "icon_A19PRO.jpg",
    "name": "A19 Pro chip",
    "features": ["6-core CPU", "16-core Neural Engine"]
  },
  "dynamicIsland": true,
  "frontCamera": {
    "icon": "icon_camera_center_stage.jpg",
    "features": ["18MP Center Stage front camera"]
  },
  "rearCamera": {
    "icon": "icon_iphone_triple4_lens.jpg",
    "features": ["48MP Pro Fusion camera system"]
  },
  "opticalZoomIcon": "icon_optical_zoom_9.jpg",
  "ios": {
    "icon": "icon_ios.jpg",
    "supported": "iOS 26",
    "shipped": "iOS 26",
    "status": "Supported"
  },
  "emergency": {
    "sos": true,
    "features": ["Emergency SOS via satellite", "Crash Detection"]
  },
  "battery": "Up to 39 hours video playback",
  "connector": {
    "icon": "icon_usbc.png",
    "type": "USB-C",
    "speed": "Supports USB 3 for up to 20x faster transfers"
  },
  "biometrics": "Face ID",
  "cellular": {
    "icon": "icon_5g.jpg",
    "label": "Superfast 5G cellular"
  },
  "durability": {
    "show_icon": true,
    "features": ["Ceramic Shield 2 front", "Water resistant to 6 meters"]
  },
  "magsafe": {
    "compatible": true,
    "features": ["MagSafe wireless charging up to 25W"]
  },
  "capacity": ["256GB", "512GB", "1TB", "2TB"],
  "dimensions": {
    "height": { "inches": 6.43, "mm": 163.4 },
    "width": { "inches": 3.07, "mm": 78 },
    "depth": { "inches": 0.34, "mm": 8.75 },
    "weight": { "ounces": 8.22, "grams": 233 }
  }
}
```

### iOS Status Values

- `Supported` - Currently receiving updates
- `Vintage` - No longer sold, limited support
- `Obsolete` - No longer supported

### Notes

- Colors use inline styles with hex codes
- Use `\n` in JSON strings to create line breaks (converted to `<br>`)
- Use `—` (em-dash) for empty/unavailable features
- Images go in `images/` folder
- iPhones are displayed in order they appear in the JSON array (newest first)
