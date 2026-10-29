"""Generates the two pixel-art pieces used in the visual proposal.

Everything is drawn on a low-resolution logical grid and then scaled with
nearest-neighbour so the pixels stay crisp. The output is intentionally
static: the interaction proposal describes which layers would move.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
OUT.mkdir(exist_ok=True)

BAYER_4 = (
    (0, 8, 2, 10),
    (12, 4, 14, 6),
    (3, 11, 1, 9),
    (15, 7, 13, 5),
)


def bayer(x: int, y: int) -> int:
    return BAYER_4[y % 4][x % 4]


def rect(d: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, colour):
    """Inclusive rectangle, kept tiny so the drawing code reads like pixel art."""
    if x1 < x0 or y1 < y0:
        return
    d.rectangle((x0, y0, x1, y1), fill=colour)


def px(d: ImageDraw.ImageDraw, x: int, y: int, colour):
    d.point((x, y), fill=colour)


def dither_rect(im: Image.Image, x0: int, y0: int, x1: int, y1: int, colour, threshold: int):
    """Ordered-dither a solid tint over an area. threshold: 0..16."""
    pixels = im.load()
    colour = ImageColor.getrgb(colour) if isinstance(colour, str) else colour
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if bayer(x, y) < threshold:
                pixels[x, y] = colour


def blend(a, b, t: float):
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))


def scale(img: Image.Image, factor: int = 2) -> Image.Image:
    return img.resize((img.width * factor, img.height * factor), Image.Resampling.NEAREST)


# ---------------------------------------------------------------------------
# Background: a quiet pixel-art Recife at dusk.
# ---------------------------------------------------------------------------


def make_city() -> Image.Image:
    W, H = 960, 420
    im = Image.new("RGB", (W, H), "#0b1018")
    d = ImageDraw.Draw(im)

    sky = [
        (0, 72, "#090e16"),
        (72, 138, "#0d141f"),
        (138, 202, "#111a27"),
        (202, 262, "#182231"),
        (262, 306, "#232b3a"),
        (306, 336, "#353345"),
        (336, 360, "#4a3d4d"),
    ]
    for index, (y0, y1, colour) in enumerate(sky):
        rect(d, 0, y0, W - 1, y1 - 1, colour)
        if y1 < H:
            next_colour = sky[min(len(sky) - 1, index + 1)][2]
            dither_rect(im, 0, max(0, y1 - 7), W - 1, y1 + 4, next_colour, 5)

    # Stars, kept away from the reading lane in the middle.
    rng = random.Random(23)
    for _ in range(56):
        x = rng.choice([rng.randrange(0, 310), rng.randrange(680, W)])
        y = rng.randrange(6, 210)
        c = rng.choice(["#858ca0", "#c7cad2", "#565f76"])
        px(d, x, y, c)
        if rng.random() > 0.72:
            px(d, x - 1, y, "#3d4557")
            px(d, x + 1, y, "#3d4557")

    # Moon with a soft circular halo. The halo is dithered over the existing
    # sky inside a circle, so it never produces a square patch.
    mx, my, mr = 142, 106, 23
    pixels = im.load()
    halo_rgb = ImageColor.getrgb("#c7b9b9")
    for y in range(my - 62, my + 63):
        for x in range(mx - 62, mx + 63):
            if not (0 <= x < W and 0 <= y < H):
                continue
            distance = math.hypot(x - mx, y - my)
            if distance <= mr + 2:
                continue
            falloff = max(0.0, 1.0 - (distance - mr) / 40)
            threshold = round(falloff * 8)
            if bayer(x, y) < threshold:
                strength = 0.07 + falloff * 0.15
                pixels[x, y] = blend(pixels[x, y], halo_rgb, strength)
    d.ellipse((mx - mr, my - mr, mx + mr, my + mr), fill="#d7d4d2")
    d.ellipse((mx - mr + 4, my - mr + 3, mx + mr - 4, my + mr - 4), fill="#e3e0dc")
    # Moon craters and a soft cloud crossing its lower edge.
    for cx, cy, cr in ((134, 98, 5), (151, 111, 3), (147, 92, 2)):
        d.ellipse((cx - cr, cy - cr, cx + cr, cy + cr), fill="#c9c5c4")
    for y in range(118, 133):
        width = int((y - 114) * 3.8)
        rect(d, mx - width, y, mx + 46, y, "#292d3d")
    dither_rect(im, mx - 52, 116, mx + 70, 132, "#37384a", 2)

    # Long low cloud shelves; they frame the city instead of competing with it.
    def cloud(x0, y0, x1, thickness, dark, light):
        for i in range(thickness):
            rect(d, x0 + int(i * 0.8), y0 + i, x1 - int(i * 0.6), y0 + i, dark)
        dither_rect(im, x0, y0, x1, y0 + thickness, light, 3)
        dither_rect(im, x0, y0 + thickness, x1, y0 + thickness + 4, dark, 4)

    cloud(32, 180, 292, 7, "#202638", "#32364a")
    cloud(672, 156, 938, 8, "#1a2131", "#2d3043")
    cloud(560, 228, 910, 5, "#263043", "#34384d")
    cloud(4, 246, 196, 5, "#292d40", "#37394b")

    # Birds.
    for bx, by, direction in ((282, 146, 1), (294, 139, 1), (712, 126, -1), (747, 165, -1)):
        rect(d, bx - 2, by, bx, by + 1, "#0b0f16")
        rect(d, bx + 1, by, bx + 3, by + 1, "#0b0f16")
        px(d, bx + direction, by - 1, "#0b0f16")

    # Distant skyline: intentionally calm where the profile will sit.
    for x in range(260, 725, 26):
        h = rng.randrange(28, 74)
        top = 300 - h
        shade = rng.choice(["#121924", "#151d29", "#18212e"])
        rect(d, x, top, x + 22, 350, shade)
        for wy in range(top + 8, 340, 12):
            for wx in range(x + 4, x + 20, 8):
                if rng.random() < 0.25:
                    px(d, wx, wy, "#5c7780")
        if rng.random() < 0.2:
            rect(d, x + 8, top - 10, x + 9, top - 1, "#1c2634")
            px(d, x + 9, top - 11, "#a97958")

    # Fog above the river.
    for y in range(334, 382):
        alpha = max(0, 8 - abs(y - 354) // 4)
        dither_rect(im, 0, y, W - 1, y, "#72647a", alpha)

    # Water.
    rect(d, 0, 354, W - 1, H - 1, "#111621")
    for y in range(356, H, 3):
        colour = "#1a2130" if y % 6 else "#202737"
        for x in range(0, W, 7):
            if rng.random() < 0.46:
                length = rng.choice([2, 3, 5, 7])
                rect(d, x, y, x + length, y, colour)
    dither_rect(im, 0, 354, W - 1, 386, "#4d4258", 2)

    # ---- Left bank buildings -------------------------------------------------
    # The outermost towers get the most window detail because they remain visible.
    rect(d, -10, 124, 112, 384, "#111722")
    rect(d, 101, 138, 112, 384, "#0c111a")
    rect(d, -10, 124, 98, 131, "#232a36")
    for wy in range(138, 372, 13):
        for wx in range(2, 94, 12):
            lit = rng.random()
            if lit < 0.24:
                rect(d, wx, wy, wx + 4, wy + 5, rng.choice(["#d7b273", "#e8c886", "#a5c9c5"]))
                if rng.random() < 0.35:
                    px(d, wx + 1, wy + 1, "#f6e3b3")
            elif lit < 0.5:
                rect(d, wx, wy, wx + 4, wy + 5, "#29333f")
            else:
                rect(d, wx, wy, wx + 4, wy + 5, "#0d131c")
            px(d, wx + 5, wy - 2, "#1e2935")
    # Vertical server-light band and roof equipment.
    for y in range(159, 360, 17):
        rect(d, 88, y, 91, y + 6, "#59b9b4")
    rect(d, 13, 115, 76, 123, "#1b222e")
    for x in range(20, 72, 17):
        rect(d, x, 109, x + 9, 114, "#232c39")
        rect(d, x + 2, 110, x + 6, 112, "#4e5968")
    rect(d, 34, 74, 36, 115, "#1b2430")
    rect(d, 31, 76, 38, 78, "#37424f")
    for y in range(82, 102, 7):
        px(d, 35, y, "#dd7a62")
    # Antenna and dish silhouettes.
    rect(d, 76, 82, 78, 124, "#111923")
    rect(d, 70, 92, 83, 94, "#17202a")
    d.arc((82, 84, 104, 105), 195, 345, fill="#394351", width=1)

    # Mid-left stepped building.
    rect(d, 113, 202, 196, 376, "#151d29")
    rect(d, 120, 189, 183, 202, "#1e2734")
    rect(d, 199, 178, 242, 376, "#101722")
    rect(d, 198, 188, 204, 376, "#1c2634")
    for wy in range(198, 366, 12):
        for wx in range(120, 188, 10):
            tone = rng.choices(["#1d2632", "#d2ad72", "#678b8a", "#202b37"], [0.56, 0.16, 0.08, 0.2])[0]
            rect(d, wx, wy, wx + 3, wy + 5, tone)
    for wy in range(194, 366, 14):
        for wx in range(208, 236, 9):
            tone = rng.choices(["#1a222d", "#28333f", "#b68e61"], [0.6, 0.28, 0.12])[0]
            rect(d, wx, wy, wx + 2, wy + 4, tone)
    rect(d, 158, 138, 160, 189, "#202937")
    rect(d, 154, 156, 166, 159, "#2e3947")
    # Water tank on the roof.
    rect(d, 221, 154, 238, 177, "#1d2734")
    rect(d, 219, 151, 240, 156, "#283342")
    rect(d, 225, 177, 226, 188, "#151e28")
    rect(d, 234, 177, 235, 188, "#151e28")
    # Rooftop plants.
    for x in range(130, 178, 6):
        rect(d, x, 198 - rng.randrange(2, 7), x + 4, 201, "#20312e")
        px(d, x + 2, 193 - rng.randrange(0, 4), "#47634f")

    # Far-left brick warehouse with a lit edge.
    rect(d, 0, 292, 78, 364, "#171c24")
    rect(d, 0, 288, 80, 294, "#242c36")
    for y in range(300, 356, 8):
        for x in range(4, 74, 10):
            rect(d, x, y, x + 5, y + 3, "#222a32" if rng.random() < 0.72 else "#c49a5e")
    rect(d, 61, 310, 79, 359, "#0f151e")

    # Bridge arch and railing on the left bank.
    rect(d, 0, 344, 273, 351, "#1e2631")
    for x in range(14, 260, 58):
        d.arc((x, 334, x + 48, 374), 180, 360, fill="#28303b", width=2)
        rect(d, x - 2, 344, x + 3, 352, "#29323d")
    for x in range(6, 272, 8):
        rect(d, x, 339, x + 1, 348, "#202933")
    dither_rect(im, 0, 350, 284, 370, "#313145", 2)

    # ---- Right bank buildings -------------------------------------------------
    rect(d, 836, 78, 967, 366, "#101721")
    rect(d, 843, 68, 959, 84, "#1d2632")
    rect(d, 823, 168, 851, 366, "#0c121b")
    rect(d, 859, 88, 861, 68, "#242e3a")
    rect(d, 852, 104, 948, 106, "#1e2733")
    for wy in range(100, 358, 12):
        for wx in range(850, 954, 11):
            tone = rng.choices(["#0d141e", "#202a37", "#436667", "#c09c66"], [0.44, 0.36, 0.1, 0.1])[0]
            rect(d, wx, wy, wx + 4, wy + 5, tone)
            if rng.random() < 0.28:
                px(d, wx + 1, wy + 1, "#90b8ae")
    # Cool-lit stair core.
    for y in range(130, 340, 10):
        rect(d, 921, y, 935, y + 5, "#263b43")
        rect(d, 923, y + 1, 933, y + 2, "#7bb5ae")
    rect(d, 832, 204, 835, 350, "#5c9f9a")
    # Rooftop antenna cluster.
    rect(d, 879, 37, 881, 68, "#1a2430")
    rect(d, 867, 43, 893, 45, "#242f3c")
    rect(d, 890, 47, 891, 68, "#161f2a")
    px(d, 880, 36, "#d99071")
    for x in (900, 918):
        rect(d, x, 52, x + 2, 68, "#1d2834")
    d.ellipse((906, 54, 932, 76), outline="#2b3742", width=2)
    rect(d, 915, 70, 923, 72, "#202b37")

    # Mid-right block, lower and warmer.
    rect(d, 746, 214, 836, 370, "#141c27")
    rect(d, 754, 202, 826, 214, "#232c39")
    rect(d, 738, 176, 754, 370, "#0f1620")
    for wy in range(220, 360, 12):
        for wx in range(756, 830, 10):
            tone = rng.choices(["#1c2632", "#273540", "#c9a16c", "#648b87"], [0.5, 0.3, 0.12, 0.08])[0]
            rect(d, wx, wy, wx + 4, wy + 4, tone)
    rect(d, 778, 158, 780, 202, "#26323f")
    rect(d, 772, 168, 790, 170, "#2e3a48")
    px(d, 779, 156, "#d57364")
    # Communication dish.
    d.arc((744, 186, 770, 210), 120, 320, fill="#39434f", width=2)
    rect(d, 755, 203, 756, 213, "#26303b")

    # A cluster of small rooftops at the right edge.
    rect(d, 797, 314, 858, 365, "#161f29")
    rect(d, 804, 306, 850, 314, "#26303b")
    for x in range(804, 850, 9):
        rect(d, x, 296, x + 4, 306, "#1b2530")
        px(d, x + 2, 294, "#42635a")

    # A low-contrast bridge across the middle of the river. The centre of the
    # image is meant to stay quiet under the profile column, but the extra
    # silhouette keeps the artwork from feeling like an empty backdrop.
    bridge_y = 344
    rect(d, 270, bridge_y, 716, bridge_y + 4, "#18212c")
    rect(d, 270, bridge_y + 5, 716, bridge_y + 6, "#111821")
    for tx in (394, 578):
        rect(d, tx, 272, tx + 3, bridge_y, "#1b2632")
        rect(d, tx - 4, 284, tx + 7, 286, "#24303c")
        px(d, tx + 1, 270, "#c5a16c")
    # Cables, drawn with a subtle stepped line.
    for start, end, side in ((394, 286, -1), (394, 500, 1), (578, 462, -1), (578, 690, 1)):
        steps = abs(end - start) // 3
        for step in range(steps):
            x = start + step * 3 * side
            y = 286 + round((bridge_y - 286) * (step / max(1, steps - 1)) ** 1.55)
            if 0 <= x < W:
                px(d, x, y, "#27333f")
    for x in range(290, 710, 26):
        rect(d, x, bridge_y - 2, x + 1, bridge_y - 1, "#343d4b")
    for x in range(294, 710, 52):
        px(d, x, bridge_y - 3, "#d1ad74")
    dither_rect(im, 280, 351, 707, 367, "#333146", 2)
    for x in range(286, 710, 37):
        rect(d, x, 358, x + rng.choice([2, 4, 7]), 358, "#6b5b67")
    rect(d, 270, bridge_y + 6, 716, bridge_y + 8, "#0d131b")

    # ---- Trees / foreground vegetation --------------------------------------
    # Left canopy, drawn in clusters so the silhouette reads as foliage at 2x.
    for _ in range(210):
        x = rng.randrange(-20, 210)
        y = rng.randrange(-8, 104)
        edge = min(1.0, max(0.0, (104 - y) / 104 + (x / 210) * 0.3))
        if rng.random() > edge * 0.86:
            continue
        r = rng.choice([3, 4, 5, 6, 7, 8])
        tone = rng.choices(["#070c11", "#0c1418", "#101b1d", "#172724"], [0.27, 0.38, 0.24, 0.11])[0]
        d.ellipse((x - r, y - r // 2, x + r, y + r // 2), fill=tone)
        if rng.random() < 0.18:
            px(d, x + rng.randrange(-2, 3), y + rng.randrange(-2, 3), "#31453a")
    # Main branch.
    d.line((10, 40, 60, 55, 109, 53, 144, 70, 178, 64), fill="#111917", width=5)
    d.line((100, 54, 127, 31), fill="#111917", width=3)
    d.line((66, 58, 79, 92), fill="#111917", width=3)
    for x, y in ((144, 70), (126, 31), (177, 64)):
        d.ellipse((x - 8, y - 4, x + 8, y + 4), fill="#0c1411")

    # Right-side tree, airy and detailed rather than a solid blob.
    for _ in range(195):
        x = rng.randrange(706, 980)
        y = rng.randrange(175, 334)
        edge = max(0.0, min(1.0, (x - 706) / 170))
        if rng.random() > 0.2 + edge * 0.75:
            continue
        r = rng.choice([2, 3, 4, 5, 6, 7])
        tone = rng.choices(["#090f12", "#0e1719", "#12201f", "#1a2b26"], [0.25, 0.36, 0.27, 0.12])[0]
        d.ellipse((x - r, y - r // 2, x + r, y + r // 2), fill=tone)
        if rng.random() < 0.2:
            px(d, x + 1, y - 1, "#3a5142")
    d.line((902, 420, 902, 312, 874, 276, 848, 255), fill="#101816", width=8)
    d.line((902, 332, 938, 306), fill="#101816", width=4)
    d.line((902, 360, 862, 336), fill="#101816", width=4)
    for x, y in ((874, 276), (848, 255), (938, 306)):
        d.ellipse((x - 18, y - 8, x + 18, y + 8), fill="#0a1110")

    # Foreground leaves at the bottom left.
    for _ in range(84):
        x = rng.randrange(-15, 124)
        y = rng.randrange(350, 430)
        tone = rng.choice(["#08100f", "#0d1815", "#13221d"])
        d.ellipse((x, y, x + rng.randrange(4, 17), y + rng.randrange(2, 8)), fill=tone)
    for x in range(-8, 80, 9):
        d.line((x, 420, x + 10, 365), fill="#0b1411", width=2)

    # Subtle foreground vignette.
    for y in range(390, H):
        dither_rect(im, 0, y, W - 1, y, "#070b10", min(8, (y - 386) // 4))
    for x in range(0, 40):
        dither_rect(im, x, 0, x, H - 1, "#070b10", max(0, (38 - x) // 6))

    return scale(im, 2)


# ---------------------------------------------------------------------------
# Central art: the development station at night.
# ---------------------------------------------------------------------------


def draw_react_atom(d: ImageDraw.ImageDraw, cx: int, cy: int, rx: int, ry: int, colour: str):
    """Thin ellipses on the logical grid, rotated to form the React atom."""
    for angle in (-0.55, 0.55, math.pi / 2):
        for r in (rx, rx - 1):
            n = 72
            for i in range(n):
                t = 2 * math.pi * i / n
                x = r * math.cos(t)
                y = r * 0.42 * math.sin(t)
                xr = x * math.cos(angle) - y * math.sin(angle)
                yr = x * math.sin(angle) + y * math.cos(angle)
                px(d, round(cx + xr), round(cy + yr), colour)
    d.ellipse((cx - 1, cy - 1, cx + 1, cy + 1), fill="#d8fffb")


def make_room() -> Image.Image:
    W, H = 380, 150
    rng = random.Random(91)
    im = Image.new("RGB", (W, H), "#101822")
    d = ImageDraw.Draw(im)

    # Wall, ceiling and floor bands.
    rect(d, 0, 0, W - 1, 4, "#070b11")
    rect(d, 0, 5, W - 1, 130, "#141f2a")
    rect(d, 0, 5, W - 1, 8, "#0d141d")
    # Very restrained plaster texture and wall panel seams.
    for _ in range(190):
        x, y = rng.randrange(0, W), rng.randrange(8, 128)
        px(d, x, y, rng.choice(["#131d27", "#16222d", "#111a24"]))
    for x in (122, 272):
        rect(d, x, 8, x, 127, "#101922")
        rect(d, x + 1, 8, x + 1, 127, "#18232e")
    # Warm gallery light above the shelf: a small, deliberate source.
    dither_rect(im, 278, 8, 377, 58, "#5e493c", 2)
    # Wall/floor transition.
    rect(d, 0, 128, W - 1, 131, "#080d13")
    rect(d, 0, 132, W - 1, H - 1, "#0c121a")
    for _ in range(130):
        x, y = rng.randrange(0, W), rng.randrange(132, H)
        px(d, x, y, rng.choice(["#0e151e", "#090d13", "#111821"]))
    # Floor board seams.
    for x in range(-30, W, 47):
        for y in range(133, H):
            if bayer(x + y, y) < 6:
                px(d, x + (y - 132) // 3, y, "#111923")

    # ---- Window -------------------------------------------------------------
    wx0, wy0, wx1, wy1 = 15, 12, 106, 92
    rect(d, wx0 - 4, wy0 - 4, wx1 + 4, wy1 + 4, "#060a0f")
    rect(d, wx0, wy0, wx1, wy1, "#1a2b38")
    # Night sky and a pocket city outside.
    for y in range(wy0, wy1 + 1):
        t = (y - wy0) / (wy1 - wy0)
        band = "#172633" if t < 0.35 else "#1b2a37" if t < 0.7 else "#26323c"
        if y in (wy0 + 2, wy0 + 3) or bayer(0, y) < 2:
            band = "#203240"
        rect(d, wx0 + 1, y, wx1 - 1, y, band)
    # Distant buildings outside. A couple of cooler towers give the window depth.
    for x in range(wx0 + 2, wx1 - 1, 7):
        bh = rng.randrange(12, 34)
        top = wy1 - 8 - bh
        rect(d, x, top, min(x + 5, wx1 - 1), wy1 - 8, "#101b25")
        rect(d, x, top, min(x + 1, wx1 - 1), wy1 - 8, "#1a2833")
        for wy in range(top + 4, wy1 - 10, 6):
            if rng.random() < 0.55:
                px(d, x + rng.randrange(0, 4), wy, rng.choice(["#7b9a9a", "#d2a96d", "#334958", "#83aaa8"]))
    # A shop light and a vertical sign outside, seen through the rain.
    rect(d, wx0 + 7, wy1 - 19, wx0 + 18, wy1 - 9, "#25343d")
    rect(d, wx0 + 9, wy1 - 18, wx0 + 16, wy1 - 17, "#d8ad70")
    rect(d, wx0 + 9, wy1 - 14, wx0 + 13, wy1 - 13, "#7da4a0")
    rect(d, wx1 - 15, wy0 + 24, wx1 - 10, wy1 - 12, "#342d3d")
    for sy in range(wy0 + 27, wy1 - 15, 7):
        rect(d, wx1 - 13, sy, wx1 - 12, sy + 2, "#c0898a")
    # Street haze and a couple of rooftop lights.
    rect(d, wx0 + 1, wy1 - 11, wx1 - 1, wy1 - 8, "#1d2c35")
    for x in range(wx0 + 8, wx1 - 4, 17):
        px(d, x, wy1 - 13, "#d7b278")
    # Rain, only a few streaks so it does not become visual noise.
    for _ in range(34):
        rx, ry = rng.randrange(wx0 + 2, wx1 - 1), rng.randrange(wy0 + 4, wy1 - 10)
        length = rng.choice([2, 3, 4])
        for step in range(length):
            if rng.random() < 0.82:
                px(d, rx, ry + step, "#678593" if rng.random() < 0.65 else "#8daab0")
    # Droplets on the glass.
    for dx, dy in ((29, 30), (59, 53), (82, 26), (37, 69), (94, 66), (49, 44)):
        px(d, dx, dy, "#a4c5c7")
        px(d, dx + 1, dy + 1, "#283f49")
    # Window frame and mullions.
    rect(d, wx0, wy0, wx1, wy0 + 1, "#0a1016")
    rect(d, wx0, wy1 - 1, wx1, wy1, "#0a1016")
    rect(d, wx0, wy0, wx0 + 1, wy1, "#0a1016")
    rect(d, wx1 - 1, wy0, wx1, wy1, "#0a1016")
    rect(d, 58, wy0, 60, wy1, "#0b1118")
    rect(d, wx0, 48, wx1, 50, "#0b1118")
    # Curtains, with a violet note instead of more blue.
    rect(d, 3, 7, 14, 107, "#231f31")
    rect(d, 3, 7, 5, 107, "#161422")
    for x in (7, 10, 13):
        rect(d, x, 10, x, 104, "#2c263c")
    rect(d, 107, 7, 120, 105, "#1b1a29")
    rect(d, 116, 7, 120, 105, "#10121c")
    for x in (109, 112, 115):
        rect(d, x, 9, x, 102, "#292539")
    # Window sill and a small plant.
    rect(d, 6, 94, 116, 99, "#2c2524")
    rect(d, 6, 94, 116, 95, "#40332d")
    rect(d, 7, 99, 115, 102, "#1a1620")
    rect(d, 17, 84, 24, 94, "#28262b")
    rect(d, 19, 81, 22, 85, "#2f4c44")
    px(d, 18, 80, "#4e7562")
    px(d, 23, 80, "#3a5c4f")

    # ---- Wall details -------------------------------------------------------
    # Abstract framed print, a small shelf of books and three sticky notes.
    rect(d, 283, 16, 331, 50, "#0a0f15")
    rect(d, 285, 18, 329, 48, "#1a2730")
    rect(d, 285, 34, 329, 48, "#22313a")
    rect(d, 285, 18, 329, 31, "#17212b")
    for x in range(287, 328, 4):
        rect(d, x, 34 - rng.randrange(0, 9), x + 2, 35, "#314b4d")
    rect(d, 291, 22, 297, 24, "#d7c9a3")
    rect(d, 293, 19, 296, 23, "#d7c9a3")
    for x in range(285, 329, 6):
        px(d, x, 30, "#445257")
    rect(d, 281, 51, 333, 53, "#3b2a27")
    rect(d, 283, 53, 331, 55, "#1a1417")

    rect(d, 340, 18, 376, 51, "#0e151d")
    # books and tiny objects on a second shelf
    rect(d, 341, 44, 375, 46, "#3a2b28")
    for i, (bx, bw, colour) in enumerate(((343, 4, "#6d5450"), (348, 3, "#806750"), (352, 5, "#4c5d5b"), (359, 4, "#5c4c62"), (365, 3, "#6b5b4b"))):
        rect(d, bx, 32, bx + bw - 1, 43, colour)
    rect(d, 369, 35, 372, 43, "#3a4f4d")
    px(d, 370, 33, "#547266")
    rect(d, 344, 28, 348, 31, "#242833")
    rect(d, 346, 26, 348, 28, "#49545e")
    # sticky notes with a suggestion of a checklist, not readable copy
    for i, colour in enumerate(("#d9b96e", "#6c9d9e", "#9d789b")):
        x = 274 + i * 13
        rect(d, x, 36 + (i % 2), x + 9, 47 + (i % 2), colour)
        for yy in range(40 + (i % 2), 44 + (i % 2), 2):
            rect(d, x + 2, yy, x + 6, yy, "#24303a")
    # Hanging plant on the right.
    rect(d, 353, 56, 355, 66, "#2b2421")
    d.arc((350, 46, 362, 61), 0, 360, fill="#34443d", width=1)
    for x, y, l in ((352, 60, 4), (357, 58, 6), (360, 64, 3)):
        rect(d, x, y, x, y + l, "#3c5b4a")
        px(d, x + 1, y + l, "#50705a")

    # Ambient light spill from the monitors, ordered dithering.
    dither_rect(im, 116, 22, 292, 108, "#1d313b", 2)
    dither_rect(im, 150, 30, 286, 104, "#1d4450", 2)
    dither_rect(im, 160, 40, 278, 100, "#285560", 1)
    dither_rect(im, 116, 43, 172, 106, "#302b4a", 2)
    dither_rect(im, 276, 24, 376, 66, "#44382e", 2)

    # ---- Desk ---------------------------------------------------------------
    rect(d, 111, 104, 371, 109, "#332925")
    rect(d, 111, 104, 371, 105, "#6b4f3d")
    rect(d, 113, 106, 369, 107, "#4b3730")
    rect(d, 111, 110, 371, 118, "#18131a")
    rect(d, 111, 118, 371, 120, "#0f0b10")
    # Desk legs and back shadow.
    rect(d, 122, 120, 127, 133, "#151019")
    rect(d, 356, 120, 361, 133, "#151019")
    dither_rect(im, 111, 118, 371, 132, "#070b10", 5)
    # LED strips: a soft violet line at the back, cyan underneath.
    rect(d, 131, 103, 354, 103, "#513e6d")
    for x in range(137, 350, 5):
        if rng.random() < 0.58:
            px(d, x, 102, "#7b639a")
    dither_rect(im, 126, 101, 360, 106, "#4b3b6b", 2)
    rect(d, 139, 116, 347, 116, "#3cb7b1")
    rect(d, 164, 117, 315, 117, "#27777a")
    dither_rect(im, 116, 112, 368, 126, "#315e68", 2)

    # ---- Monitors -----------------------------------------------------------
    # Central code monitor.
    mx0, my0, mx1, my1 = 174, 34, 278, 95
    rect(d, mx0 - 2, my0 - 2, mx1 + 2, my1 + 2, "#05080d")
    rect(d, mx0 - 1, my0 - 1, mx1 + 1, my1 + 1, "#17212a")
    rect(d, mx0, my0, mx1, my1, "#07111a")
    # UI chrome: tabs, sidebar, status bar.
    rect(d, mx0, my0, mx1, my0 + 4, "#0d1720")
    for x, c in ((177, "#5e7d7b"), (186, "#735f7e"), (195, "#b88e61")):
        rect(d, x, my0 + 1, x + 4, my0 + 2, c)
    rect(d, mx0, my0 + 5, mx0 + 14, my1 - 1, "#0a131d")
    for i, c in enumerate(("#76c7c1", "#9380ae", "#cdb078", "#506b74")):
        rect(d, mx0 + 3, my0 + 10 + i * 8, mx0 + 5, my0 + 12 + i * 8, c)
    for y in range(my0 + 8, my1 - 4, 3):
        rect(d, mx0 + 17, y, mx0 + 24, y, "#14212a")
    # Code lines: deliberate abstract syntax colour, no readable content.
    palette = ["#6dd4ce", "#a986bc", "#d2b271", "#77a698", "#53637b", "#8ba3b5"]
    for line in range(13):
        y = my0 + 9 + line * 4
        indent = rng.choice([0, 0, 3, 3, 6, 9])
        x = mx0 + 29 + indent
        if line in (4, 9):
            x += 5
        while x < mx1 - 23:
            length = rng.choice([2, 4, 6, 9, 12])
            if rng.random() < 0.16:
                x += rng.randrange(3, 7)
                continue
            rect(d, x, y, min(x + length, mx1 - 24), y, rng.choice(palette))
            if rng.random() < 0.25:
                rect(d, x + 1, y + 1, min(x + length + 2, mx1 - 24), y + 1, "#16242d")
            x += length + rng.randrange(2, 6)
    # Cursor.
    rect(d, mx0 + 41, my0 + 63, mx0 + 41, my0 + 65, "#d9fff9")
    # Mini preview pane.
    rect(d, mx1 - 21, my0 + 8, mx1 - 3, my1 - 5, "#0b1720")
    rect(d, mx1 - 20, my0 + 9, mx1 - 4, my0 + 12, "#1e3039")
    rect(d, mx1 - 17, my0 + 17, mx1 - 7, my0 + 25, "#172831")
    rect(d, mx1 - 17, my0 + 27, mx1 - 11, my0 + 30, "#5fada8")
    rect(d, mx1 - 17, my0 + 33, mx1 - 8, my0 + 34, "#47636e")
    rect(d, mx1 - 17, my0 + 37, mx1 - 10, my0 + 38, "#6c5f83")
    rect(d, mx1 - 17, my0 + 42, mx1 - 15, my0 + 44, "#d7efde")
    dither_rect(im, mx0, my0, mx1, my1, "#2b5d67", 1)
    # Monitor stand.
    rect(d, 222, 97, 238, 101, "#171f27")
    rect(d, 219, 101, 241, 104, "#0b1118")
    # Monitor glow reflection on the desk.
    dither_rect(im, 181, 105, 270, 109, "#4d9092", 5)
    dither_rect(im, 198, 106, 250, 108, "#8bc9bd", 3)
    # A faint bloom on the wall above and below the screen.
    dither_rect(im, 170, 24, 284, 34, "#3d6a74", 2)
    dither_rect(im, 152, 94, 296, 103, "#2d5966", 2)

    # Portrait monitor showing the React mark.
    sx0, sy0, sx1, sy1 = 128, 49, 165, 95
    rect(d, sx0 - 1, sy0 - 1, sx1 + 1, sy1 + 1, "#05080c")
    rect(d, sx0, sy0, sx1, sy1, "#07131a")
    rect(d, sx0, sy0, sx1, sy0 + 2, "#0e1b23")
    dither_rect(im, sx0 + 1, sy0 + 3, sx1 - 1, sy1 - 1, "#173a42", 2)
    draw_react_atom(d, 146, 72, 14, 14, "#6ee8df")
    # Small code glyphs around the mark.
    for y in range(81, 91, 3):
        rect(d, 132, y, 136 + rng.randrange(0, 6), y, "#2b535c")
    rect(d, 133, 55, 139, 55, "#836e9f")
    rect(d, 157, 55, 161, 55, "#4f6d77")
    rect(d, 156, 87, 161, 87, "#6b6050")
    # Stand.
    rect(d, 143, 97, 151, 100, "#161e25")
    rect(d, 137, 100, 157, 104, "#0a1017")
    dither_rect(im, 129, 105, 164, 107, "#3b4a6b", 3)

    # Tiny speaker / interface accent on the desk left of the code monitor.
    rect(d, 166, 92, 170, 103, "#111820")
    rect(d, 167, 94, 169, 96, "#344d52")
    rect(d, 167, 99, 169, 99, "#8d7463")

    # A small warm task lamp at the left end of the desk. It gives the scene
    # one deliberate warm source, balancing the blue screens.
    rect(d, 114, 101, 124, 104, "#151014")
    rect(d, 118, 90, 119, 102, "#3b302c")
    d.line((119, 91, 112, 87, 109, 91), fill="#514238", width=1)
    d.polygon(((106, 89), (114, 86), (118, 91), (108, 94)), fill="#4e4036")
    rect(d, 108, 92, 116, 93, "#ddba7e")
    px(d, 111, 95, "#f1d597")
    dither_rect(im, 101, 91, 129, 107, "#5c4839", 2)
    dither_rect(im, 109, 96, 124, 103, "#8d6d4e", 1)

    # ---- Keyboard, mouse and desk objects ----------------------------------
    # Mouse mat.
    rect(d, 181, 99, 281, 104, "#11151d")
    rect(d, 182, 99, 280, 99, "#1d2530")
    # Keyboard body and key grid.
    rect(d, 189, 97, 255, 103, "#0b0e14")
    rect(d, 190, 97, 254, 98, "#26303a")
    for row in range(2):
        for x in range(192 + row, 254 - row, 4):
            px(d, x, 99 + row * 2, "#7a8c91" if rng.random() < 0.5 else "#232c37")
            if rng.random() < 0.2:
                px(d, x, 100 + row * 2, "#44b8b1")
    rect(d, 205, 102, 241, 102, "#1a222d")
    # Mouse with a timid cyan line.
    d.ellipse((261, 98, 270, 104), fill="#141b23", outline="#303d47")
    rect(d, 265, 99, 265, 100, "#6bbeb8")
    # Coffee mug and steam.
    rect(d, 306, 94, 315, 103, "#242a30")
    rect(d, 307, 94, 313, 94, "#6b5e53")
    d.arc((313, 96, 320, 102), 270, 90, fill="#3c4248", width=1)
    px(d, 311, 91, "#757d84")
    px(d, 314, 89, "#555e68")
    # Headphones stand right of the monitor.
    rect(d, 283, 79, 284, 103, "#202933")
    rect(d, 278, 78, 289, 80, "#151d25")
    d.arc((279, 76, 292, 89), 180, 360, fill="#28333d", width=2)
    rect(d, 280, 85, 283, 92, "#0d1319")
    rect(d, 288, 85, 291, 92, "#0d1319")
    px(d, 281, 87, "#53796f")
    px(d, 289, 87, "#53796f")
    # Small note block and pen near the keyboard.
    rect(d, 169, 98, 177, 103, "#25313b")
    rect(d, 170, 99, 173, 100, "#b29a70")
    rect(d, 171, 102, 176, 102, "#41545a")
    # A controller resting at the edge of the mouse mat.
    rect(d, 289, 99, 300, 103, "#1d1a24")
    rect(d, 291, 97, 298, 99, "#20202b")
    px(d, 292, 98, "#8e75ad")
    px(d, 296, 98, "#6bc1b8")
    rect(d, 299, 100, 300, 101, "#332d3e")
    # Tiny plant with a pale rim, to break up the dark right corner.
    rect(d, 350, 90, 359, 103, "#1a1a1e")
    rect(d, 352, 87, 358, 90, "#25352f")
    for lx, ly, ll in ((351, 80, 7), (355, 78, 9), (359, 84, 5)):
        for step in range(ll):
            px(d, lx + (step // 4), ly + step, "#3d5e4c")
    px(d, 353, 77, "#6b8c6e")
    px(d, 359, 82, "#52735e")

    # ---- PC tower under the desk -------------------------------------------
    rect(d, 312, 112, 363, 142, "#0a0e15")
    rect(d, 313, 113, 361, 140, "#111821")
    rect(d, 316, 116, 338, 137, "#0c1118")
    # tempered-glass side with a violet fan glow
    d.ellipse((321, 120, 335, 134), fill="#1a1528", outline="#3c315d")
    d.ellipse((325, 123, 331, 129), fill="#5f4c8f")
    d.ellipse((327, 125, 329, 127), fill="#9880cf")
    dither_rect(im, 317, 116, 339, 138, "#4b3f70", 2)
    for y in (118, 122, 126, 130, 134):
        rect(d, 340, y, 358, y + 1, "#202a36")
    rect(d, 341, 118, 357, 119, "#303e4c")
    # JS sticker, small and physical.
    rect(d, 343, 124, 351, 132, "#e9c84b")
    rect(d, 343, 124, 351, 124, "#f3dd79")
    # 3x5 pixel letters J and S.
    for x, y in ((344, 126), (345, 125), (345, 129)):
        px(d, x, y, "#252116")
    rect(d, 344, 125, 345, 125, "#252116")
    px(d, 345, 128, "#252116")
    px(d, 346, 129, "#252116")
    for x, y in ((348, 125), (349, 125), (350, 126), (349, 127), (348, 128), (349, 129), (350, 129)):
        px(d, x, y, "#252116")
    # Tower feet and cool underglow.
    rect(d, 315, 141, 320, 143, "#05080d")
    rect(d, 355, 141, 360, 143, "#05080d")
    rect(d, 317, 143, 357, 143, "#3c6270")

    # ---- Gaming chair in the foreground ------------------------------------
    # Seen from behind, cropped by the viewport. The silhouette frames the desk
    # without hiding the keyboard or the screens.
    d.ellipse((24, 112, 166, 159), fill="#080a11")
    dither_rect(im, 31, 139, 160, 149, "#151122", 2)
    # Armrests behind the backrest.
    rect(d, 29, 126, 57, 139, "#0a0d13")
    rect(d, 33, 126, 54, 129, "#272331")
    rect(d, 139, 126, 168, 139, "#0a0d13")
    rect(d, 143, 126, 164, 129, "#272331")
    # Outer backrest: broad shoulders, a cut-out headrest and a tapered waist.
    d.polygon(
        ((63, 106), (83, 100), (119, 100), (142, 106), (151, 132), (153, 150),
         (46, 150), (54, 130)),
        fill="#1b1725",
    )
    rect(d, 61, 120, 143, 149, "#191521")
    rect(d, 76, 101, 126, 117, "#1f1b2b")
    rect(d, 72, 114, 132, 149, "#211c2d")
    # Shoulder bolsters and headrest cushion.
    d.ellipse((55, 104, 84, 124), fill="#241d31")
    d.ellipse((120, 104, 149, 124), fill="#201a2b")
    rect(d, 81, 103, 122, 117, "#272132")
    rect(d, 86, 106, 118, 114, "#1a1722")
    # Violet piping picks up the ambient LED.
    for x0, y0, x1, y1 in ((62, 108, 58, 146), (141, 108, 148, 146), (85, 118, 85, 145), (119, 118, 119, 145)):
        d.line((x0, y0, x1, y1), fill="#564171", width=1)
    rect(d, 76, 126, 128, 128, "#2b223c")
    rect(d, 80, 135, 124, 136, "#29203a")
    # Thin cyan catch-light from the screens on the top edges.
    for x in range(84, 122, 3):
        if rng.random() < 0.56:
            px(d, x, 104, "#31535f")
    for x in range(61, 142, 5):
        if rng.random() < 0.32:
            px(d, x, 108, "#3b344a")
    # Seat edge and a sliver of the base.
    d.ellipse((48, 141, 154, 155), fill="#12101a")
    rect(d, 75, 151, 128, 152, "#0a0b11")
    for x in (58, 145):
        rect(d, x, 149, x + 1, 156, "#090b11")
    # Soft reflection on the backrest, never a hard highlight.
    dither_rect(im, 68, 110, 136, 144, "#2e3448", 1)

    # ---- Final atmosphere ---------------------------------------------------
    # Blue pools on the floor and wall, plus the warm shelf pool at right.
    dither_rect(im, 0, 120, W - 1, 149, "#121a28", 2)
    dither_rect(im, 172, 104, 290, 133, "#245260", 2)
    dither_rect(im, 308, 128, 372, 148, "#4b355c", 2)
    dither_rect(im, 282, 42, 374, 56, "#6d543c", 1)
    # A restrained cool rim along the window and the desk.
    for x in range(120, 372, 6):
        if rng.random() < 0.35:
            px(d, x, 121, "#2b4f59")
    # Mild noise and vignette.
    for _ in range(110):
        x, y = rng.randrange(0, W), rng.randrange(0, H)
        px(d, x, y, rng.choice(["#0b1017", "#0d141c", "#171f29"]))
    for y in range(138, H):
        dither_rect(im, 0, y, W - 1, y, "#070a10", (y - 137) // 3)
    for x in range(0, 12):
        dither_rect(im, x, 0, x, H - 1, "#070a10", (11 - x) // 2)

    return scale(im, 2)


if __name__ == "__main__":
    city = make_city()
    city.save(OUT / "city-dusk.png", optimize=True)
    room = make_room()
    room.save(OUT / "room-night.png", optimize=True)
    print("city", city.size, "room", room.size)
