document.getElementById('upload').addEventListener('change', handleImage, false);
document.getElementById('download').addEventListener('click', downloadImage, false);

// Variables globales pour stocker les données de l'image originale
let canvas, ctx, img, originalImageData;
let zoomX = 0, zoomY = 0;

function handleImage(event) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        img = new Image();
        img.onload = function() {
            // Set initial canvas dimensions
            canvas.width = 800;
            canvas.height = 800;
            
            // Initialize slider values
            document.getElementById('pixelSize').value = 10;
            document.getElementById('noiseIntensity').value = 50;
            document.getElementById('blurRadius').value = 10;
            document.getElementById('zoomX').value = 0;
            document.getElementById('zoomY').value = 0;
            
            // Draw the initial zoomed image
            drawImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function drawImage() {
    if (!img) return;

    const pixelSize = parseInt(document.getElementById('pixelSize').value);
    const noiseIntensity = parseInt(document.getElementById('noiseIntensity').value);
    const blurRadius = parseInt(document.getElementById('blurRadius').value);
    zoomX = parseInt(document.getElementById('zoomX').value);
    zoomY = parseInt(document.getElementById('zoomY').value);

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw zoomed image with new zoom position
    ctx.drawImage(img, -zoomX * 6, -zoomY * 6, img.width * 6, img.height * 6);

    // Crop to 800x800
    originalImageData = ctx.getImageData(0, 0, 800, 800);
    ctx.putImageData(originalImageData, 0, 0);

    // Apply effects
    pixelate(ctx, 800, 800, pixelSize);
    applyBlur(ctx, 800, 800, blurRadius);
    addColoredNoise(ctx, 800, 800, noiseIntensity);
    applyBlur(ctx, 800, 800, blurRadius); // Apply blur to noise
}

function applyEffects() {
    drawImage(); // Redraw the image with updated effects
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'image_traitée.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function pixelate(ctx, width, height, pixelSize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const red = pixels[((width * y) + x) * 4];
            const green = pixels[((width * y) + x) * 4 + 1];
            const blue = pixels[((width * y) + x) * 4 + 2];
            
            for (let n = 0; n < pixelSize; n++) {
                for (let m = 0; m < pixelSize; m++) {
                    if (x + m < width && y + n < height) {
                        pixels[((width * (y + n)) + (x + m)) * 4] = red;
                        pixels[((width * (y + n)) + (x + m)) * 4 + 1] = green;
                        pixels[((width * (y + n)) + (x + m)) * 4 + 2] = blue;
                    }
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function addColoredNoise(ctx, width, height, intensity) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
        const noiseRed = Math.random() * intensity - (intensity / 2);
        const noiseGreen = Math.random() * intensity - (intensity / 2);
        const noiseBlue = Math.random() * intensity - (intensity / 2);

        pixels[i] = clamp(pixels[i] + noiseRed);      // Red channel
        pixels[i + 1] = clamp(pixels[i + 1] + noiseGreen); // Green channel
        pixels[i + 2] = clamp(pixels[i + 2] + noiseBlue);  // Blue channel
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function clamp(value) {
    return Math.max(0, Math.min(255, value));
}

function applyBlur(ctx, width, height, blurRadius) {
    // Create a temporary canvas to perform the blur
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.drawImage(ctx.canvas, 0, 0, width, height);

    // Apply the blur effect
    ctx.clearRect(0, 0, width, height); // Clear the canvas before applying blur
    ctx.globalAlpha = 0.5; // Adjust transparency for blur effect
    for (let y = -blurRadius; y <= blurRadius; y += 2) {
        for (let x = -blurRadius; x <= blurRadius; x += 2) {
            ctx.drawImage(tempCanvas, x, y);
            if (x >= 0 && y >= 0) {
                ctx.drawImage(tempCanvas, -(x-1), -(y-1));
            }
        }
    }
    ctx.globalAlpha = 1.0; // Reset transparency
}

// Event listeners for sliders
document.getElementById('pixelSize').addEventListener('input', function() {
    document.getElementById('pixelSizeValue').textContent = this.value;
    applyEffects();
});

document.getElementById('noiseIntensity').addEventListener('input', function() {
    document.getElementById('noiseIntensityValue').textContent = this.value;
    applyEffects();
});

document.getElementById('blurRadius').addEventListener('input', function() {
    document.getElementById('blurRadiusValue').textContent = this.value;
    applyEffects();
});

document.getElementById('zoomX').addEventListener('input', function() {
    document.getElementById('zoomXValue').textContent = this.value;
    applyEffects();
});

document.getElementById('zoomY').addEventListener('input', function() {
    document.getElementById('zoomYValue').textContent = this.value;
    applyEffects();
});
