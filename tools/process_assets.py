"""Cut every building image in assets/ out of its background.

Writes transparent PNGs to public/assets/buildings/. Uses macOS Vision subject
lifting (tools/lift-subject.swift); images with a baked-in checkerboard are then
cleaned against the fitted checker grid (tools/refine-checker.py).

Names come from tools/asset-names.json; unknown files get a slug of their name.
Reference screenshots listed under "skip" are left alone.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
OUT = ROOT / "public" / "assets" / "buildings"
TOOLS = ROOT / "tools"
BIN = TOOLS / ".bin" / "lift-subject"
TMP = TOOLS / ".bin" / "tmp"
EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", Path(name).stem.lower()).strip("-")
    return s[:48] or "image"


def has_checker(path: Path) -> bool:
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)[2, :200]
    neutral = (a.max(1) - a.min(1)) <= 7
    v = a.mean(1)
    lo, hi = np.percentile(v, 10), np.percentile(v, 90)
    flips = np.count_nonzero(np.diff(v > (lo + hi) / 2))
    return bool(neutral.all() and hi - lo > 12 and flips >= 3)


def main() -> None:
    names = json.loads((TOOLS / "asset-names.json").read_text())
    BIN.parent.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    if not BIN.exists():
        subprocess.run(["swiftc", "-O", str(TOOLS / "lift-subject.swift"), "-o", str(BIN)], check=True)

    for src in sorted(SRC.iterdir()):
        if src.suffix.lower() not in EXTS or src.name in names["skip"]:
            continue
        out_name = names["map"].get(src.name, slug(src.name))
        out = OUT / f"{out_name}.png"
        lifted = TMP / f"{out_name}.png"
        r = subprocess.run([str(BIN), str(src), str(lifted)], capture_output=True, text=True)
        if r.returncode != 0:
            print(f"skip  {src.name}: {r.stdout.strip() or r.stderr.strip()}")
            continue
        if has_checker(src):
            subprocess.run([sys.executable, str(TOOLS / "refine-checker.py"), str(src), str(lifted), str(out)], check=True)
        else:
            im = Image.open(lifted).convert("RGBA")
            im.crop(im.getbbox()).save(out, optimize=True)
        Image.open(out).save(out.with_suffix(".webp"), quality=88, method=6)
        print(f"ok    {src.name} -> {out.relative_to(ROOT)} (+ .webp)")
        if out_name in names.get("upscale2x", []):
            upscale2x(out)


def upscale2x(path: Path) -> None:
    """Hero images render wider than their source; a Lanczos 2x on premultiplied
    alpha plus a light unsharp mask keeps edges cleaner than browser upscaling."""
    from PIL import ImageFilter

    im = Image.open(path).convert("RGBA").convert("RGBa")
    big = im.resize((im.width * 2, im.height * 2), Image.LANCZOS).convert("RGBA")
    rgb = big.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
    rgb.putalpha(big.getchannel("A"))
    out = path.with_name(f"{path.stem}@2x.webp")
    rgb.save(out, quality=86, method=6)
    print(f"      2x -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
