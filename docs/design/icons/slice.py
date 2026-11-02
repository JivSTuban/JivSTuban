"""Cut an icon sheet into per-icon PNGs and recolour them for light and dark pages.

The sheet is ink + one accent on white (see prompt.md). A PNG with a fixed ink colour would vanish on a dark
page, so each icon becomes a transparent PNG per theme: alpha comes from how dark the pixel is, colour is the
theme's ink; orange-red pixels keep the accent. Paper fill is dropped (it is near white, so alpha is ~0).

Run in a throwaway venv, never a project dependency:
    python3 -m venv /tmp/imgvenv && /tmp/imgvenv/bin/pip install pillow numpy
    /tmp/imgvenv/bin/python slice.py sheet.png ../../../assets/icons --grid 4x3 --names a,b,c,...
"""
import argparse
import os

import numpy as np
from PIL import Image

THEMES = {
    "light": {"ink": (0x1D, 0x1C, 0x1A), "accent": (0xC2, 0x41, 0x0C)},
    "dark": {"ink": (0xEC, 0xE8, 0xDD), "accent": (0xF0, 0x66, 0x2A)},
}


def recolour(rgb: np.ndarray, theme: dict) -> Image.Image:
    f = rgb.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    sat = f.max(axis=-1) - f.min(axis=-1)
    is_accent = (r > 120) & (r - b > 50) & (r - g > 30)
    ink_alpha = np.clip((235 - lum) / (235 - 60), 0, 1)
    accent_alpha = np.clip((sat - 10) / 110, 0, 1)
    alpha = np.where(is_accent, np.maximum(accent_alpha, ink_alpha * 0.0), ink_alpha)
    out = np.zeros(rgb.shape[:2] + (4,), dtype=np.uint8)
    out[..., :3] = np.where(is_accent[..., None], np.array(theme["accent"]), np.array(theme["ink"]))
    out[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def cell_icon(sheet: Image.Image, col: int, row: int, cols: int, rows: int, size: int, margin: float) -> Image.Image:
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    cell = sheet.crop((int(col * cw), int(row * ch), int((col + 1) * cw), int((row + 1) * ch))).convert("RGB")
    a = np.asarray(cell).astype(np.int16)
    # content = anything not near-white
    mask = (a.min(axis=-1) < 225)
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    cell = cell.crop((x0, y0, x1, y1))
    side = int(max(cell.size) * (1 + 2 * margin))
    square = Image.new("RGB", (side, side), (255, 255, 255))
    square.paste(cell, ((side - cell.width) // 2, (side - cell.height) // 2))
    return square.resize((size, size), Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("sheet")
    ap.add_argument("out")
    ap.add_argument("--grid", default="4x3")
    ap.add_argument("--names", required=True)
    ap.add_argument("--size", type=int, default=256)
    ap.add_argument("--margin", type=float, default=0.08)
    args = ap.parse_args()
    cols, rows = map(int, args.grid.split("x"))
    names = args.names.split(",")
    assert len(names) == cols * rows, f"{len(names)} names for {cols * rows} cells"
    sheet = Image.open(args.sheet)
    os.makedirs(args.out, exist_ok=True)
    for i, name in enumerate(names):
        icon = cell_icon(sheet, i % cols, i // cols, cols, rows, args.size, args.margin)
        rgb = np.asarray(icon)
        for theme, colours in THEMES.items():
            recolour(rgb, colours).save(os.path.join(args.out, f"{name}-{theme}.png"), optimize=True)
    print(f"wrote {len(names) * 2} files to {args.out}")


if __name__ == "__main__":
    main()
