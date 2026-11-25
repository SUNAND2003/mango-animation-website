import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from PIL import Image
import numpy as np

SRC_DIR = r"C:\Users\sunan\OneDrive\Desktop\sunand personal\mango picture"
PUBLIC_DIR = r"public\images\sequence"
DIST_DIR = r"dist\images\sequence"
TOTAL_FRAMES = 208

# Pre-compute static border & watermark fade mask (1280 x 720)
h, w = 720, 1280

ramp_x = np.ones(w, dtype=np.float32)
ramp_x[:50] = (1.0 - np.cos(np.linspace(0, np.pi, 50))) / 2.0
ramp_x[-50:] = (1.0 + np.cos(np.linspace(0, np.pi, 50))) / 2.0

ramp_y = np.ones(h, dtype=np.float32)
ramp_y[:50] = (1.0 - np.cos(np.linspace(0, np.pi, 50))) / 2.0
ramp_y[-40:] = (1.0 + np.cos(np.linspace(0, np.pi, 40))) / 2.0

border_mask = ramp_y[:, None] * ramp_x[None, :]

# Smoothstep fade for watermark at bottom-right corner (x > 1060, y > 520)
y_grid, x_grid = np.mgrid[0:h, 0:w]
fx = np.clip((x_grid - 1060.0) / 60.0, 0.0, 1.0)
fy = np.clip((y_grid - 520.0) / 60.0, 0.0, 1.0)
fx = fx * fx * (3.0 - 2.0 * fx)
fy = fy * fy * (3.0 - 2.0 * fy)
wm_fade = 1.0 - (fx * fy)

STATIC_MASK = border_mask * wm_fade

def process_single_frame(idx):
    in_file = os.path.join(SRC_DIR, f"ezgif-frame-{idx:03d}.jpg")
    out_public_webp = os.path.join(PUBLIC_DIR, f"frame_{idx:03d}.webp")
    out_dist_webp = os.path.join(DIST_DIR, f"frame_{idx:03d}.webp")

    if not os.path.exists(in_file):
        return idx, False, 0

    im = Image.open(in_file).convert("RGB")
    arr = np.array(im, dtype=np.float32)

    # Apply smooth perimeter and watermark fade
    arr = arr * STATIC_MASK[:, :, None]
    
    # Zero out tiny background camera sensor noise below 5
    arr[arr < 5.0] = 0.0

    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    
    # Save with high-fidelity WebP quality 96 (tack-sharp water droplets, veins, and textures)
    out.save(out_public_webp, "WEBP", quality=96, method=6)
    if os.path.exists(DIST_DIR):
        out.save(out_dist_webp, "WEBP", quality=96, method=6)

    size_kb = os.path.getsize(out_public_webp) / 1024.0
    return idx, True, size_kb

def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(DIST_DIR, exist_ok=True)

    start_time = time.time()
    workers = min(12, os.cpu_count() or 4)
    print(f"Batch converting all {TOTAL_FRAMES} pristine studio frames using {workers} workers...")

    frame_indices = list(range(1, TOTAL_FRAMES + 1))
    completed = 0
    total_kb = 0

    with ProcessPoolExecutor(max_workers=workers) as executor:
        for idx, success, size_kb in executor.map(process_single_frame, frame_indices):
            if success:
                completed += 1
                total_kb += size_kb
                if completed % 25 == 0 or completed == TOTAL_FRAMES:
                    elapsed = time.time() - start_time
                    fps = completed / elapsed
                    print(f"  Converted {completed}/{TOTAL_FRAMES} frames ({completed/TOTAL_FRAMES*100:.1f}%) - {fps:.1f} fps - Size: {total_kb/1024:.2f} MB")

    elapsed = time.time() - start_time
    print(f"Finished pristine conversion in {elapsed:.1f}s! Total size: {total_kb/1024:.2f} MB")

if __name__ == "__main__":
    main()
