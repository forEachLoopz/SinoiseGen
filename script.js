document.getElementById('upload').addEventListener('change', handleImage, false);
document.getElementById('download').addEventListener('click', downloadImage, false);

let canvas, ctx;

function handleImage(event) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Set canvas dimensions
            canvas.width = img.width * 6;  // Zoom x6
            canvas.height = img.height * 6;
            
            // Draw zoomed image
            ctx.drawImage(img, 0, 0, img.width * 6, img.height * 6);
            
            // Crop to 800x800
            const cropped = ctx.getImageData(0, 0, 800, 800);
            canvas.width = 800;
            canvas.height = 800;
            ctx.putImageData(cropped, 0, 0);

            // Apply strong blur to the cropped image
            applyBlur(ctx, 800, 800, 65);

            // Pixelate the image
            pixelate(ctx, 800, 800, 50);

            // Increase color contrast
            increaseContrast(ctx, 800, 800, 1.5);

            // Add larger colored noise
            addColoredNoise(ctx, 800, 800);

            // Apply blur to the noise
            applyBlur(ctx, 800, 800, 30); // Adjust blur radius as needed

            // Enable download button
            document.getElementById('download').disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
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

function addColoredNoise(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
        const noiseRed = Math.random() * 100 - 50; // Noise range for red: [-50, 50]
        const noiseGreen = Math.random() * 100 - 50; // Noise range for green: [-50, 50]
        const noiseBlue = Math.random() * 100 - 50; // Noise range for blue: [-50, 50]

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

function increaseContrast(ctx, width, height, factor) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const adjust = value => {
        return clamp(((value - 128) * factor) + 128);
    }

    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = adjust(pixels[i]);     // Red
        pixels[i + 1] = adjust(pixels[i + 1]); // Green
        pixels[i + 2] = adjust(pixels[i + 2]); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}
