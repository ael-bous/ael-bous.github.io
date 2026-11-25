"""Render img/ayoub-portrait.jpg as monospace glyphs for the hero's source layer.
Run: python src/ascii-portrait.py  -> writes src/portrait.txt"""
import os
from PIL import Image, ImageOps
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im = Image.open(os.path.join(root, 'img', 'ayoub-portrait.jpg')).convert('L')
im = ImageOps.autocontrast(im, cutoff=1)
cols = 96
rows = round(im.height / im.width * cols * 0.5)
im = im.resize((cols, rows), Image.LANCZOS)
ramp = " .·:-=+*%#@"
lines = []
for y in range(rows):
    row = ''
    for x in range(cols):
        v = im.getpixel((x, y)) / 255
        v = v ** 1.15
        row += ramp[min(len(ramp) - 1, int(v * len(ramp)))]
    lines.append(row.rstrip())
open(os.path.join(root, 'src', 'portrait.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(cols, rows)
