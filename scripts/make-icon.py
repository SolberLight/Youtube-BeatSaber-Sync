#!/usr/bin/env python3
"""
Generate the YTBSSync app icon.

Original artwork: a tilted rhythm block carrying a music note, in the app's
own ember palette - the idea being "a song becomes something you can play".
Everything is drawn here rather than sourced, so the icon is ours.

Rendered at 4x and downsampled for clean edges, then emitted as every size
macOS wants in an .iconset.
"""

import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFilter

# --- palette (matches the Midnight Ember theme) ---------------------------
BG_TOP = (26, 22, 20)
BG_BOTTOM = (10, 10, 10)
EMBER_GLOW = (230, 81, 0)
BLOCK_LIGHT = (255, 167, 38)
BLOCK_DARK = (216, 67, 0)
NOTE = (255, 243, 224)

SIZE = 1024
SS = 4  # supersampling factor
C = SIZE * SS

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "repo_assets")


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def vertical_gradient(size, top, bottom):
    """A top-to-bottom linear gradient."""
    w, h = size
    img = Image.new("RGB", (1, h))
    px = img.load()
    for y in range(h):
        px[0, y] = lerp(top, bottom, y / max(1, h - 1))
    return img.resize((w, h), Image.BILINEAR)


def diagonal_gradient(size, start, end):
    """A 45-degree gradient, built small and scaled up."""
    w, h = size
    small = 64
    img = Image.new("RGB", (small, small))
    px = img.load()
    for y in range(small):
        for x in range(small):
            t = (x + y) / (2 * (small - 1))
            px[x, y] = lerp(start, end, t)
    return img.resize((w, h), Image.BICUBIC)


def radial_glow(size, color, center, radius, strength):
    """Soft radial light, returned as an L-mode mask plus its colour."""
    w, h = size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    cx, cy = center
    steps = 48
    for i in range(steps, 0, -1):
        t = i / steps
        r = radius * t
        alpha = int(strength * (1 - t) ** 2)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(radius * 0.12))
    layer = Image.new("RGB", (w, h), color)
    return layer, mask


def rounded_mask(size, box, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=radius, fill=255)
    return mask


def music_note(layer_size, cx, cy, scale):
    """
    An eighth note drawn from primitives: tilted head, stem, flag.
    Returned as a mask so it can be tinted and rotated with the block.
    """
    mask = Image.new("L", layer_size, 0)
    d = ImageDraw.Draw(mask)

    head_w = int(300 * scale)
    head_h = int(228 * scale)
    stem_w = int(50 * scale)
    stem_h = int(600 * scale)

    head_cx = cx - int(40 * scale)
    head_cy = cy + int(210 * scale)

    # Note head, drawn tilted by rendering upright then rotating in place.
    head = Image.new("L", layer_size, 0)
    ImageDraw.Draw(head).ellipse(
        [head_cx - head_w // 2, head_cy - head_h // 2,
         head_cx + head_w // 2, head_cy + head_h // 2],
        fill=255,
    )
    head = head.rotate(-22, resample=Image.BICUBIC, center=(head_cx, head_cy))
    mask.paste(head, (0, 0), head)

    # Stem, rising from the right edge of the head.
    stem_x = head_cx + head_w // 2 - int(22 * scale)
    d.rounded_rectangle(
        [stem_x, head_cy - stem_h, stem_x + stem_w, head_cy + int(10 * scale)],
        radius=stem_w // 2,
        fill=255,
    )

    # Flag: a tapered sweep off the top of the stem.
    flag_top = head_cy - stem_h
    flag = [
        (stem_x + stem_w - int(6 * scale), flag_top),
        (stem_x + stem_w + int(190 * scale), flag_top + int(150 * scale)),
        (stem_x + stem_w + int(150 * scale), flag_top + int(330 * scale)),
        (stem_x + stem_w + int(120 * scale), flag_top + int(250 * scale)),
        (stem_x + stem_w + int(128 * scale), flag_top + int(150 * scale)),
        (stem_x + stem_w - int(6 * scale), flag_top + int(96 * scale)),
    ]
    d.polygon(flag, fill=255)

    return mask


def render():
    canvas = Image.new("RGBA", (C, C), (0, 0, 0, 0))

    # --- rounded-square plate, inset like a macOS app icon ---------------
    inset = int(C * 0.098)
    plate_box = [inset, inset, C - inset, C - inset]
    plate_radius = int((C - 2 * inset) * 0.225)
    plate_mask = rounded_mask((C, C), plate_box, plate_radius)

    plate = vertical_gradient((C, C), BG_TOP, BG_BOTTOM).convert("RGBA")

    # Ember light welling up from the bottom.
    glow_rgb, glow_mask = radial_glow(
        (C, C), EMBER_GLOW, (C // 2, int(C * 0.86)), int(C * 0.52), 118
    )
    plate.paste(glow_rgb, (0, 0), glow_mask)

    canvas.paste(plate, (0, 0), plate_mask)

    # --- the block -------------------------------------------------------
    block_layer = Image.new("RGBA", (C, C), (0, 0, 0, 0))
    bw = int(C * 0.46)
    bx0 = (C - bw) // 2
    by0 = (C - bw) // 2
    block_box = [bx0, by0, bx0 + bw, by0 + bw]
    block_radius = int(bw * 0.235)

    block_mask = rounded_mask((C, C), block_box, block_radius)
    block_fill = diagonal_gradient((C, C), BLOCK_LIGHT, BLOCK_DARK).convert("RGBA")
    block_layer.paste(block_fill, (0, 0), block_mask)

    # Bevel: a bright inner edge along the top-left.
    edge = Image.new("RGBA", (C, C), (0, 0, 0, 0))
    ImageDraw.Draw(edge).rounded_rectangle(
        block_box, radius=block_radius, outline=(255, 205, 130, 210),
        width=max(2, int(C * 0.006)),
    )
    shade = Image.new("L", (C, C), 0)
    ImageDraw.Draw(shade).polygon(
        [(0, 0), (C, 0), (0, C)], fill=255
    )  # keep the highlight on the upper-left only
    block_layer.paste(edge, (0, 0), Image.composite(edge.split()[3], shade, shade))

    # The note sits on the block and tilts with it. Sized so the flag and the
    # foot of the head stay inside the block's rounded edge.
    note_mask = music_note((C, C), C // 2, C // 2 + int(C * 0.012), C / 1024 * 0.42)
    note_layer = Image.new("RGBA", (C, C), NOTE + (255,))
    block_layer.paste(note_layer, (0, 0), note_mask)

    # Tilt the whole block for a bit of motion.
    block_layer = block_layer.rotate(
        -17, resample=Image.BICUBIC, center=(C // 2, C // 2)
    )

    # Drop shadow beneath the block.
    shadow = Image.new("L", (C, C), 0)
    shadow.paste(block_layer.split()[3], (0, int(C * 0.018)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(C * 0.02)))
    shadow = shadow.point(lambda v: int(v * 0.5))
    shadow_rgb = Image.new("RGB", (C, C), (0, 0, 0))
    plate_shadowed = Image.new("RGBA", (C, C), (0, 0, 0, 0))
    plate_shadowed.paste(shadow_rgb, (0, 0), shadow)
    canvas = Image.alpha_composite(canvas, Image.composite(
        plate_shadowed, Image.new("RGBA", (C, C), (0, 0, 0, 0)), plate_mask
    ))

    canvas = Image.alpha_composite(canvas, block_layer)

    # Clip anything that strayed past the plate.
    clipped = Image.new("RGBA", (C, C), (0, 0, 0, 0))
    clipped.paste(canvas, (0, 0), plate_mask)

    return clipped.resize((SIZE, SIZE), Image.LANCZOS)


def main():
    out_dir = os.path.abspath(OUT_DIR)
    os.makedirs(out_dir, exist_ok=True)

    icon = render()
    master = os.path.join(out_dir, "icon.png")
    icon.save(master)
    print(f"wrote {master}")

    # --- .iconset -> .icns ----------------------------------------------
    iconset = os.path.join(out_dir, "icon.iconset")
    os.makedirs(iconset, exist_ok=True)

    for base in (16, 32, 128, 256, 512):
        for scale in (1, 2):
            px = base * scale
            name = f"icon_{base}x{base}{'@2x' if scale == 2 else ''}.png"
            icon.resize((px, px), Image.LANCZOS).save(os.path.join(iconset, name))

    icns = os.path.join(out_dir, "icon.icns")
    subprocess.run(["iconutil", "-c", "icns", iconset, "-o", icns], check=True)
    print(f"wrote {icns}")

    # Windows builds want a multi-resolution .ico.
    ico = os.path.join(out_dir, "icon.ico")
    icon.save(ico, sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
    print(f"wrote {ico}")


if __name__ == "__main__":
    sys.exit(main())
