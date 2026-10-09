"""Remove a baked-in checkerboard background, guided by a Vision cut-out.

usage: refine.py <original.jpg> <vision.png> <out.png>
1. Fit the checker grid (square size, phase, the two tones) from the image border.
2. A pixel is background when it matches the tone the grid predicts at that spot.
3. Background = matching pixels 4-connected to the image border, so white walls
   that only touch white squares at corners survive.
4. Detail Vision dropped (trees) comes back; soft grey shadows Vision dropped stay out.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

orig_p, vis_p, out_p = sys.argv[1:4]
rgb = np.asarray(Image.open(orig_p).convert("RGB")).astype(np.float32)
vis = np.asarray(Image.open(vis_p).convert("RGBA"))
valpha = vis[..., 3].astype(np.float32)
H, W = valpha.shape
val = rgb.mean(-1)
chroma = rgb.max(-1) - rgb.min(-1)


def transitions(line):
    lo, hi = np.percentile(line, 10), np.percentile(line, 90)
    mid = (lo + hi) / 2
    above = line > mid
    idx = np.where(above[1:] != above[:-1])[0] + 0.5
    return idx, lo, hi


def fit(edges):
    # edges are consecutive square boundaries: e_k = o + k*s
    d = np.diff(edges)
    s0 = np.median(d)
    ks = np.concatenate([[0], np.cumsum(np.round(d / s0))])
    s, o = np.polyfit(ks, edges, 1)
    return s, o


tx, lo, hi = transitions(val[2, : W // 3])
ty, _, _ = transitions(val[: H // 3, 2])
sx, ox = fit(tx)
sy, oy = fit(ty)
s = (sx + sy) / 2
gray_t, white_t = lo, hi
xs = np.arange(W)
ys = np.arange(H)
cx = np.floor((xs - ox) / s).astype(int)
cy = np.floor((ys - oy) / s).astype(int)
parity = (cx[None, :] + cy[:, None]) % 2
# which parity is white? check the corner pixel
corner_is_white = val[2, 2] > (lo + hi) / 2
white_parity = parity[2, 2] if corner_is_white else 1 - parity[2, 2]
expected = np.where(parity == white_parity, white_t, gray_t)
# distance to the nearest grid line, to tolerate JPEG blur on square seams
fx = np.abs(((xs - ox) / s) - np.round((xs - ox) / s)) * s
fy = np.abs(((ys - oy) / s) - np.round((ys - oy) / s)) * s
seam = (fx[None, :] < 1.6) | (fy[:, None] < 1.6)

neutral = chroma <= 7
match = neutral & (np.abs(val - expected) <= 9)
match |= neutral & seam & (val >= gray_t - 9)

lab, _ = ndi.label(match)  # 4-connectivity
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
border = border[border > 0]
bg = np.isin(lab, border)

strong = (chroma > 14) | (val < gray_t - 30)
fg = ~bg & ((valpha > 127) | strong)
# drop small islands and keep only subject-sized regions
lab2, n2 = ndi.label(fg)
if n2:
    sizes = ndi.sum(np.ones_like(lab2), lab2, index=np.arange(1, n2 + 1))
    fg = np.isin(lab2, np.where(sizes > 800)[0] + 1)
fg = ndi.binary_fill_holes(fg) & ~bg | fg
fg = ndi.binary_opening(fg, iterations=1)

alpha = fg.astype(np.float32) * 255
alpha = ndi.gaussian_filter(alpha, 0.7)
alpha = np.where(bg & (alpha < 200), alpha * 0.4, alpha)
alpha = np.clip(alpha, 0, 255).astype(np.uint8)

out = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), "RGBA")
out = out.crop(out.getbbox())
out.save(out_p, optimize=True)
print(f"{out_p}  square={s:.2f}  tones={gray_t:.0f}/{white_t:.0f}  size={out.size}")
