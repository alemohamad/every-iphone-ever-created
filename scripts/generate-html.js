const fs = require('fs');
const path = require('path');

// Read the JSON data
const dataPath = path.join(__dirname, '..', 'data', 'iphones.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper function to format text with line breaks
function formatText(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

// Helper function to format dimension value
function formatDimension(value, unit, isDepth = false) {
  const inchLabel = isDepth ? 'inch' : 'inches';
  return `${value.inches} ${inchLabel} (${value.mm} ${unit})`;
}

// Generate color swatches with inline styles
function generateColors(colors) {
  if (!colors || colors.length === 0) {
    return '<div class="color"></div>';
  }
  return colors
    .map(color => `<div class="color" style="background-color: ${color.hex}"></div>`)
    .join('\n        ');
}

// Generate display section
function generateDisplay(display) {
  let html = `<div class="model-content">
        <div class="model-screen-size">${display.size}</div>
        <div class="model-screen-detail">${display.type}</div>`;

  if (display.features && display.features.length > 0) {
    display.features.forEach(feature => {
      html += `\n        <div class="model-screen-detail">${feature}</div>`;
    });
  } else {
    // Add hidden placeholders for alignment
    html += `\n        <div class="model-screen-detail hidden">-</div>`;
    html += `\n        <div class="model-screen-detail hidden">-</div>`;
  }

  html += '\n      </div>';
  return html;
}

// Generate design section
function generateDesign(design) {
  if (!design || design.length === 0) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">—</div>
      </div>`;
  }

  let html = `<div class="model-content"><img src="images/icon_design.png" loading="lazy" alt="" class="content-image">`;

  design.forEach((item, index) => {
    const needsBreak = index === 0 && design.length > 1;
    html += `\n        <div class="model-screen-detail">${formatText(item)}${needsBreak ? '<br>' : ''}</div>`;
  });

  html += '\n      </div>';
  return html;
}

// Generate Apple Intelligence section
function generateAppleIntelligence(hasAI) {
  if (hasAI) {
    return `<div class="model-content"><img src="images/apple_intelligence.png" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">Apple Intelligence</div>
      </div>`;
  }
  return `<div class="model-content">
        <div class="model-screen-detail empty">&nbsp;</div>
      </div>`;
}

// Generate chip section
function generateChip(chip) {
  if (!chip || !chip.name) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">&nbsp;</div>
      </div>`;
  }

  let html = `<div class="model-content"><img src="images/${chip.image}" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">${chip.name}</div>`;

  if (chip.features && chip.features.length > 0) {
    chip.features.forEach(feature => {
      html += `\n        <div class="model-screen-detail">${formatText(feature)}</div>`;
    });
  }

  html += '\n      </div>';
  return html;
}

// Generate Dynamic Island section
function generateDynamicIsland(hasDI) {
  if (hasDI) {
    return `<div class="model-content"><img src="images/icon_dynamic_island.jpg" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">Dynamic Island<br>A magical way to interact with iPhone</div>
      </div>`;
  }
  return `<div class="model-content">
        <div class="model-screen-detail empty">&nbsp;</div>
      </div>`;
}

// Generate front camera section
function generateFrontCamera(camera) {
  if (!camera || !camera.features || camera.features.length === 0) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">&nbsp;</div>
      </div>`;
  }

  let html = `<div class="model-content"><img src="images/${camera.icon}" loading="lazy" alt="" class="content-image">`;

  camera.features.forEach(feature => {
    html += `\n        <div class="model-screen-detail">${formatText(feature)}</div>`;
  });

  html += '\n      </div>';
  return html;
}

// Generate rear camera section
function generateRearCamera(camera) {
  if (!camera || !camera.features || camera.features.length === 0) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">—</div>
      </div>`;
  }

  // Handle the icon path - some have "images/" prefix, some don't
  const iconPath = camera.icon.startsWith('images/') ? camera.icon : `images/${camera.icon}`;

  let html = `<div class="model-content"><img src="${iconPath}" loading="lazy" alt="" class="content-image">`;

  camera.features.forEach(feature => {
    const formatted = formatText(feature);
    // Some features are just dashes for empty rows
    if (formatted === '—' || formatted === '-') {
      html += `\n        <div class="model-screen-detail">—</div>`;
    } else {
      html += `\n        <div class="model-screen-detail">${formatted}</div>`;
    }
  });

  html += '\n      </div>';
  return html;
}

// Generate optical zoom section
function generateOpticalZoom(icon) {
  if (!icon) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">—</div>
      </div>`;
  }
  return `<div class="model-content"><img src="images/${icon}" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">Optical zoom options</div>
      </div>`;
}

// Generate iOS section
function generateiOS(ios) {
  if (!ios) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">—</div>
      </div>`;
  }

  const statusClass = ios.status === 'Supported' ? 'device-support-status' :
                      ios.status === 'Vintage' ? 'device-support-status vintage' :
                      'device-support-status obsolete';

  return `<div class="model-content"><img src="images/${ios.icon}" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail"><strong>Supported up to<br></strong>${ios.supported}</div>
        <div class="model-screen-detail"><strong>Shipped with<br></strong>${ios.shipped}</div>
        <div class="model-screen-detail"><span class="${statusClass}">${ios.status}</span></div>
      </div>`;
}

// Generate emergency section
function generateEmergency(emergency) {
  if (!emergency || !emergency.sos) {
    return '<div class="model-content"></div>';
  }

  let html = `<div class="model-content"><img src="images/icon_sos.jpg" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">Emergency SOS</div>`;

  if (emergency.features && emergency.features.length > 0) {
    emergency.features.forEach(feature => {
      if (feature && feature !== '—' && feature !== '-') {
        html += `\n        <div class="model-screen-detail">${feature}</div>`;
      }
    });
  }

  html += '\n      </div>';
  return html;
}

// Generate battery section
function generateBattery(battery) {
  return `<div class="model-content"><img src="images/icon_battery.jpg" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">${battery}</div>
      </div>`;
}

// Generate connector section
function generateConnector(connector) {
  let speedText = connector.speed ? `<br>${formatText(connector.speed)}` : '';
  return `<div class="model-content"><img src="images/${connector.icon}" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">${connector.type}${speedText}</div>
      </div>`;
}

// Generate biometrics section
function generateBiometrics(biometrics) {
  let icon;
  if (biometrics === 'Face ID') {
    icon = 'icon_face_id.jpg';
  } else if (biometrics === 'Slide to unlock') {
    icon = 'icon_no_biometrics.jpg';
  } else {
    icon = 'icon_touch_id.jpg';
  }

  return `<div class="model-content"><img src="images/${icon}" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">${biometrics}</div>
      </div>`;
}

// Generate cellular section
function generateCellular(cellular) {
  return `<div class="model-content"><img src="images/${cellular.icon}" loading="lazy" alt="" class="content-image">
        <div class="model-screen-detail">${cellular.label}</div>
      </div>`;
}

// Generate durability section
function generateDurability(durability) {
  if (!durability || !durability.features || durability.features.length === 0) {
    return `<div class="model-content"><img loading="lazy" src="images/icon_no_ceramic_shield.jpg" alt="" class="content-image"></div>`;
  }

  const iconSrc = durability.show_icon ? 'icon_ceramic_shield.jpg' : 'icon_no_ceramic_shield.jpg';

  let html = `<div class="model-content"><img src="images/${iconSrc}" loading="lazy" alt="" class="content-image">`;

  durability.features.forEach(feature => {
    html += `\n        <div class="model-screen-detail">${formatText(feature)}</div>`;
  });

  html += '\n      </div>';
  return html;
}

// Generate MagSafe section
function generateMagSafe(magsafe) {
  if (!magsafe || !magsafe.compatible) {
    return `<div class="model-content">
        <div class="model-screen-detail empty">&nbsp;</div>
      </div>`;
  }

  let html = `<div class="model-content"><img src="images/icon_magsafe.jpg" loading="lazy" alt="" class="content-image">`;

  if (magsafe.features && magsafe.features.length > 0) {
    magsafe.features.forEach(feature => {
      if (feature && feature !== '—' && feature !== '-') {
        html += `\n        <div class="model-screen-detail">${formatText(feature)}</div>`;
      }
    });
  }

  html += '\n      </div>';
  return html;
}

// Generate capacity section
function generateCapacity(capacity) {
  if (!capacity || capacity.length === 0) {
    return `<div class="model-content">
        <div class="model-screen-detail-title">Capacity</div>
        <div class="model-screen-detail">—</div>
      </div>`;
  }

  let html = `<div class="model-content">
        <div class="model-screen-detail-title">Capacity</div>`;

  capacity.forEach(cap => {
    html += `\n        <div class="model-screen-detail">${cap}</div>`;
  });

  html += '\n      </div>';
  return html;
}

// Generate dimensions section
function generateDimensions(dimensions) {
  return `<div class="model-content">
        <div class="model-screen-detail-title">Size and Weight</div>
        <div class="model-screen-detail"><strong>Height<br></strong>${formatDimension(dimensions.height, 'mm')}</div>
        <div class="model-screen-detail"><strong>Width<br></strong>${formatDimension(dimensions.width, 'mm')}</div>
        <div class="model-screen-detail"><strong>Depth<br></strong>${formatDimension(dimensions.depth, 'mm', true)}</div>
        <div class="model-screen-detail"><strong>Weight<br></strong>${dimensions.weight.ounces} ounces (${dimensions.weight.grams} grams)</div>
      </div>`;
}

// Generate a single iPhone entry
function generateiPhone(iphone) {
  return `      <div class="model-header">
        <div class="launch-date">${iphone.launchYear}</div>
        <div class="model">${iphone.model}</div>
      </div>
      <div class="model-device"><img src="images/${iphone.device}" loading="lazy" alt="${iphone.model}" class="model-device-pic"></div>
      <div class="model-colors">
        ${generateColors(iphone.colors)}
      </div>
      ${generateDisplay(iphone.display)}
      ${generateDesign(iphone.design)}
      ${generateAppleIntelligence(iphone.appleIntelligence)}
      ${generateChip(iphone.chip)}
      ${generateDynamicIsland(iphone.dynamicIsland)}
      ${generateFrontCamera(iphone.frontCamera)}
      ${generateRearCamera(iphone.rearCamera)}
      ${generateOpticalZoom(iphone.opticalZoomIcon)}
      ${generateiOS(iphone.ios)}
      ${generateEmergency(iphone.emergency)}
      ${generateBattery(iphone.battery)}
      ${generateConnector(iphone.connector)}
      ${generateBiometrics(iphone.biometrics)}
      ${generateCellular(iphone.cellular)}
      ${generateDurability(iphone.durability)}
      ${generateMagSafe(iphone.magsafe)}
      ${generateCapacity(iphone.capacity)}
      ${generateDimensions(iphone.dimensions)}`;
}

// Generate the complete HTML
function generateHTML() {
  const iphoneEntries = data.iphones.map(generateiPhone).join('\n');

  return `<!DOCTYPE html>
<html data-wf-page="690262df38f8fd331f50721c" data-wf-site="690262dc38f8fd331f507117">
<head>
  <meta charset="utf-8">
  <title>Every iPhone ever released</title>
  <meta content="Apple’s iPhone has developed MASSIVELY over the past decade, adding in faster processors and bigger screens. But it’s not until you look at ALL the iPhone models that have been released, do you see just how far we’ve come since 2007." name="description">
  <meta content="Every iPhone ever released" property="og:title">
  <meta content="Apple’s iPhone has developed MASSIVELY over the past decade, adding in faster processors and bigger screens. But it’s not until you look at ALL the iPhone models that have been released, do you see just how far we’ve come since 2007." property="og:description">
  <meta content="https://everyiphone.info/docs/images/every-iphone-ever-released.jpg" property="og:image">
  <meta content="Every iPhone ever released" property="twitter:title">
  <meta content="Apple’s iPhone has developed MASSIVELY over the past decade, adding in faster processors and bigger screens. But it’s not until you look at ALL the iPhone models that have been released, do you see just how far we’ve come since 2007." property="twitter:description">
  <meta property="og:type" content="website">
  <meta content="summary_large_image" name="twitter:card">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta content="Webflow" name="generator">
  <link href="css/normalize.css" rel="stylesheet" type="text/css">
  <link href="css/webflow.css" rel="stylesheet" type="text/css">
  <link href="css/every-iphone-ever-released.webflow.css" rel="stylesheet" type="text/css">
  <script type="text/javascript">!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);</script>
  <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon">
  <link href="images/webclip.png" rel="apple-touch-icon">
</head>
<body>
  <section class="header">
    <h1>Every iPhone ever released</h1>
    <div class="description">Apple’s iPhone has developed massively over more than a decade, adding in faster processors and bigger screens. But it’s not until you look at all the iPhone models that have been released, do you see just how far we’ve come since 2007.</div>
  </section>
  <section class="devices">
    <div class="w-layout-grid devices-grid">
${iphoneEntries}
    </div>
  </section>
  <section class="footer">
    <div>iPhone is a trademark of Apple Inc., registered in the U.S. and other countries.</div>
    <a href="https://alemohamad.com/" target="_blank">Curated by <strong class="bold-text">Ale Mohamad</strong></a>
  </section>
  <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=690262dc38f8fd331f507117" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  <script src="js/webflow.js" type="text/javascript"></script>
</body>
</html>`;
}

// Write the output
const outputPath = path.join(__dirname, '..', './docs/index.html');
const html = generateHTML();
fs.writeFileSync(outputPath, html, 'utf8');

console.log(`Generated index.html with ${data.iphones.length} iPhones`);
console.log(`Output: ${outputPath}`);
