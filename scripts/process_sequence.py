import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from collections import deque
from PIL import Image, ImageFilter
import numpy as np

def process_frame(idx):
    in_path = f'public/images/sequence/frame_{idx:03d}.jpg'
    out_path = f'public/images/sequence/frame_{idx:03d}.webp'
    
    if not os.path.exists(in_path):
        return idx, False, 0
        
    im = Image.open(in_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    r_safe = np.maximum(r, 1.0)
    
    br = b / r_safe
    gr = g / r_safe
    rb = r - b
    
    # 1. Guaranteed Foreground Seeds / Barrier
    # A. Mango skin & pulp: low blue relative to red, high warm chroma
    is_mango = (br < 0.49) & (rb > 80) & (r > 90)
    # B. Leaf: green dominates or high green-to-red ratio
    is_leaf = (gr > 0.94) & (g > 40) & (g > b * 1.1) & (r < 210)
    # C. Stem & dark crevices:
    is_stem = (r < 130) & (g < 95) & (b < 55) & (r > b) & (b < 50)
    
    barrier = is_mango | is_leaf | is_stem
    
    # Close microscopic 1-2px pinholes with morphological dilation
    barrier_img = Image.fromarray((barrier * 255).astype(np.uint8), mode='L')
    barrier_closed = np.array(barrier_img.filter(ImageFilter.MaxFilter(size=3))) > 128
    
    # BFS flood-fill background starting from all 4 image borders
    bg_visited = np.zeros((h, w), dtype=bool)
    q = deque()
    
    # Add top and bottom rows
    for x in range(w):
        bg_visited[0, x] = True
        q.append((0, x))
        bg_visited[h - 1, x] = True
        q.append((h - 1, x))
        
    # Add left and right columns
    for y in range(h):
        if not bg_visited[y, 0]:
            bg_visited[y, 0] = True
            q.append((y, 0))
        if not bg_visited[y, w - 1]:
            bg_visited[y, w - 1] = True
            q.append((y, w - 1))
            
    # Breadth-First Search
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not bg_visited[ny, nx] and not barrier_closed[ny, nx]:
                    bg_visited[ny, nx] = True
                    q.append((ny, nx))
                    
    # Foreground is the exact complement of background flood:
    fg = ~bg_visited
    
    # Alpha mask with smooth 0.9px Gaussian blur for subpixel anti-aliasing
    alpha_img = Image.fromarray((fg * 255).astype(np.uint8), mode='L')
    alpha_smooth = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.9))
    
    out = im.copy()
    out.putalpha(alpha_smooth)
    out.save(out_path, 'WEBP', quality=88, method=4)
    size_kb = os.path.getsize(out_path) / 1024
    return idx, True, size_kb

def main():
    start_time = time.time()
    total_frames = 238
    frame_indices = list(range(1, total_frames + 1))
    
    workers = min(10, os.cpu_count() or 4)
    print(f'Starting batch conversion of {total_frames} frames using {workers} parallel processes...')
    
    completed = 0
    total_size = 0
    with ProcessPoolExecutor(max_workers=workers) as executor:
        for idx, success, size_kb in executor.map(process_frame, frame_indices):
            if success:
                completed += 1
                total_size += size_kb
                if completed % 25 == 0 or completed == total_frames:
                    elapsed = time.time() - start_time
                    fps = completed / elapsed
                    print(f'  [{completed:3d}/{total_frames}] {completed/total_frames*100:5.1f}% | Total: {total_size/1024:.2f} MB | Speed: {fps:.1f} fps')
                    
    print(f'Done! Successfully converted {completed}/{total_frames} frames to transparent WebP in {time.time() - start_time:.2f}s.')
    print(f'Total sequence size: {total_size/1024:.2f} MB (~{total_size/completed:.1f} KB/frame).')

if __name__ == '__main__':
    main()
