import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from collections import deque
from PIL import Image, ImageFilter
import numpy as np

SRC_DIR = r"C:\Users\sunan\OneDrive\Desktop\sunand personal\mango picture"
PUBLIC_DIR = r"public\images\sequence"
DIST_DIR = r"dist\images\sequence"
TOTAL_FRAMES = 208

def process_single_frame(idx):
    in_file = os.path.join(SRC_DIR, f"ezgif-frame-{idx:03d}.jpg")
    out_public_webp = os.path.join(PUBLIC_DIR, f"frame_{idx:03d}.webp")
    out_dist_webp = os.path.join(DIST_DIR, f"frame_{idx:03d}.webp")
    
    if not os.path.exists(in_file):
        return idx, False, 0
        
    im = Image.open(in_file).convert("RGB")
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    
    # 1. Zero out bottom-right watermark
    arr[540:, 1100:, :] = 0
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    y_coords = np.arange(h)[:, None]
    
    # 2. Fruit & leaf barrier
    is_warm = (r > 34) & (r > b + 10)
    is_leaf = (g > 30) & (g > b * 1.15)
    is_stem = (r > 26) & (r > b + 5) & (y_coords < 240)
    is_droplet = (r > 55) & (g > 45)
    barrier = (is_warm | is_leaf | is_stem | is_droplet)
    
    # Exclude dark table surface shadow at bottom
    barrier = barrier & ~( (r < 85) & (g < 65) & (b < 50) & (y_coords > 540) )
    
    # 3. BFS flood-fill background from image borders
    bg = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if not barrier[0, x]: bg[0, x] = True; q.append((0, x))
        if not barrier[h-1, x]: bg[h-1, x] = True; q.append((h-1, x))
    for y in range(h):
        if not barrier[y, 0] and not bg[y, 0]: bg[y, 0] = True; q.append((y, 0))
        if not barrier[y, w-1] and not bg[y, w-1]: bg[y, w-1] = True; q.append((y, w-1))
        
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1,0), (1,0), (0,-1), (0,1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not bg[ny, nx] and not barrier[ny, nx]:
                    bg[ny, nx] = True
                    q.append((ny, nx))
                    
    fg = ~bg
    fg = fg & ~( (r < 85) & (g < 65) & (b < 50) & (y_coords > 540) )
    
    # 4. Connected component from center of fruit to remove any disconnected speckles
    visited_fg = np.zeros((h, w), dtype=bool)
    seed_y, seed_x = 350, 640
    if not fg[seed_y, seed_x]:
        for dy in range(-50, 60, 10):
            for dx in range(-50, 60, 10):
                if fg[seed_y + dy, seed_x + dx]:
                    seed_y, seed_x = seed_y + dy, seed_x + dx
                    break
            if fg[seed_y, seed_x]:
                break
                
    q_fg = deque([(seed_y, seed_x)])
    visited_fg[seed_y, seed_x] = True
    while q_fg:
        cy, cx = q_fg.popleft()
        for dy, dx in ((-1,0), (1,0), (0,-1), (0,1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if fg[ny, nx] and not visited_fg[ny, nx]:
                    visited_fg[ny, nx] = True
                    q_fg.append((ny, nx))
                    
    # 5. Inward erosion (MinFilter) to remove dark matte edge fringe from black background
    fg_img = Image.fromarray((visited_fg * 255).astype(np.uint8), mode='L')
    fg_eroded = fg_img.filter(ImageFilter.MinFilter(size=3))
    alpha_smooth = fg_eroded.filter(ImageFilter.GaussianBlur(radius=0.9))
    
    out = Image.fromarray(arr.astype(np.uint8))
    out.putalpha(alpha_smooth)
    
    # 6. Save WebP
    out.save(out_public_webp, "WEBP", quality=90, method=4)
    if os.path.exists(DIST_DIR):
        out.save(out_dist_webp, "WEBP", quality=90, method=4)
        
    size_kb = os.path.getsize(out_public_webp) / 1024
    return idx, True, size_kb

def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(DIST_DIR, exist_ok=True)
    
    start_time = time.time()
    workers = min(12, os.cpu_count() or 4)
    print(f"Re-converting all {TOTAL_FRAMES} frames for light green background using {workers} parallel workers...")
    
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
                    print(f"  Processed {completed}/{TOTAL_FRAMES} frames ({completed/TOTAL_FRAMES*100:.1f}%) - {fps:.1f} fps - Total size: {total_kb/1024:.2f} MB")
                    
    elapsed = time.time() - start_time
    print(f"Re-conversion completed in {elapsed:.1f}s! Total sequence size: {total_kb/1024:.2f} MB")

if __name__ == "__main__":
    main()
