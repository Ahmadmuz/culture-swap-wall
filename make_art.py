"""Generate abstract, geometric SVG artwork for the demonstration tiles.

No cultural symbols are reproduced: each image is an abstract composition that
stands in for an author-supplied photograph in the prototype.
"""
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")
os.makedirs(OUT, exist_ok=True)

INK = "#2E2420"
TERRA = "#B85C3B"
CLAY = "#D08A5F"
GOLD = "#DDA33C"
TEAL = "#2F6E68"
SAGE = "#7E9A78"
CREAM = "#FBF4E8"

PALETTES = [
    ("#F3E4CF", TERRA),
    ("#DCEAE6", TEAL),
    ("#F6E7D2", CLAY),
    ("#E6EDDF", SAGE),
    ("#F1DDC4", GOLD),
    ("#E8C9BC", TERRA),
    ("#EFE3D2", TEAL),
    ("#F3E4CF", SAGE),
]


def wrap(body, bg):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img">
<rect width="800" height="600" fill="{bg}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">{body}</g>
</svg>'''


MOTIFS = {}

MOTIFS["tea"] = f'''
<circle cx="400" cy="300" r="190" fill="{CREAM}" opacity="0.55"/>
<path d="M300 300h190v80a70 70 0 0 1-70 70h-50a70 70 0 0 1-70-70z" stroke="{TERRA}" stroke-width="9"/>
<path d="M490 320h28a46 46 0 0 1 0 92h-30" stroke="{TERRA}" stroke-width="9"/>
<path d="M280 470h240" stroke="{INK}" stroke-width="6" opacity="0.35"/>
<path d="M345 255c-18-26 18-38 0-64" stroke="{TEAL}" stroke-width="7"/>
<path d="M400 255c-18-26 18-38 0-64" stroke="{TEAL}" stroke-width="7"/>
<path d="M455 255c-18-26 18-38 0-64" stroke="{TEAL}" stroke-width="7"/>
<circle cx="640" cy="140" r="34" fill="{GOLD}" stroke="none" opacity="0.8"/>
'''

MOTIFS["drum"] = f'''
<circle cx="400" cy="310" r="170" fill="{CREAM}" opacity="0.5"/>
<circle cx="400" cy="310" r="160" stroke="{TEAL}" stroke-width="10"/>
<circle cx="400" cy="310" r="110" stroke="{TEAL}" stroke-width="4" opacity="0.55"/>
<circle cx="400" cy="310" r="58" stroke="{TERRA}" stroke-width="7"/>
<path d="M250 470l70-90M550 470l-70-90" stroke="{TERRA}" stroke-width="9"/>
<path d="M180 200c60 26 60 74 0 100M620 200c-60 26-60 74 0 100" stroke="{GOLD}" stroke-width="7"/>
<circle cx="400" cy="310" r="10" fill="{TERRA}" stroke="none"/>
'''

MOTIFS["greeting"] = f'''
<path d="M210 430c60-10 96-52 128-116 18-36 48-56 74-40 26 16 20 54 2 88" stroke="{TERRA}" stroke-width="10"/>
<path d="M590 430c-60-10-96-52-128-116-18-36-48-56-74-40-26 16-20 54-2 88" stroke="{TEAL}" stroke-width="10"/>
<circle cx="400" cy="190" r="46" fill="{GOLD}" stroke="none" opacity="0.9"/>
<path d="M330 470h140" stroke="{INK}" stroke-width="6" opacity="0.3"/>
<path d="M300 240c30-40 70-60 100-60s70 20 100 60" stroke="{TERRA}" stroke-width="4" opacity="0.45"/>
'''

MOTIFS["indigo"] = f'''
<g stroke="{TEAL}" stroke-width="4" opacity="0.85">
  <path d="M400 120l120 120-120 120-120-120z"/>
  <path d="M400 180l60 60-60 60-60-60z"/>
  <path d="M160 300l70 70-70 70-70-70z"/>
  <path d="M640 300l70 70-70 70-70-70z"/>
</g>
<g fill="{TERRA}" stroke="none">
  <circle cx="400" cy="240" r="12"/><circle cx="230" cy="370" r="9"/><circle cx="570" cy="370" r="9"/>
</g>
<path d="M120 500h560" stroke="{GOLD}" stroke-width="5" opacity="0.5"/>
<path d="M120 110h180M500 110h180" stroke="{GOLD}" stroke-width="5" opacity="0.5"/>
'''

MOTIFS["dumplings"] = f'''
<g stroke="{TERRA}" stroke-width="8">
  <path d="M230 380c0-60 60-110 120-110s120 50 120 110z" fill="{CREAM}" opacity="0.8"/>
  <path d="M330 380c0-52 48-94 100-94s100 42 100 94z" fill="{CREAM}" opacity="0.8"/>
  <path d="M260 330c22 12 40 12 62 0M300 305c20 10 38 10 58 0" stroke-width="5"/>
</g>
<path d="M180 420h440" stroke="{TEAL}" stroke-width="6" opacity="0.5"/>
<circle cx="620" cy="180" r="40" fill="{GOLD}" stroke="none" opacity="0.8"/>
<path d="M180 480h140M480 480h140" stroke="{SAGE}" stroke-width="5" opacity="0.6"/>
'''

MOTIFS["garden"] = f'''
<path d="M400 500V210" stroke="{SAGE}" stroke-width="8"/>
<path d="M400 380c-80 0-130-40-140-110 80 0 130 40 140 110z" fill="{SAGE}" opacity="0.65" stroke="{SAGE}" stroke-width="6"/>
<path d="M400 300c80 0 130-40 140-110-80 0-130 40-140 110z" fill="{TEAL}" opacity="0.55" stroke="{TEAL}" stroke-width="6"/>
<path d="M250 500h300" stroke="{TERRA}" stroke-width="8"/>
<circle cx="610" cy="170" r="44" fill="{GOLD}" stroke="none" opacity="0.85"/>
'''

MOTIFS["harvest"] = f'''
<circle cx="400" cy="220" r="95" fill="{GOLD}" stroke="none" opacity="0.9"/>
<g stroke="{TERRA}" stroke-width="6" opacity="0.85">
  <path d="M150 360h500M150 410h500M150 460h500"/>
</g>
<g stroke="{TEAL}" stroke-width="7">
  <path d="M250 470c0-70 20-130 60-180"/>
  <path d="M550 470c0-70-20-130-60-180"/>
</g>
<path d="M310 290c-26 12-44 34-52 62M490 290c26 12 44 34 52 62" stroke="{TEAL}" stroke-width="6"/>
'''

MOTIFS["chair"] = f'''
<path d="M300 470V280a100 100 0 0 1 200 0v190" stroke="{TERRA}" stroke-width="10"/>
<path d="M300 380h200M340 470v-60M460 470v-60" stroke="{TERRA}" stroke-width="9"/>
<path d="M250 470h300" stroke="{INK}" stroke-width="6" opacity="0.3"/>
<circle cx="590" cy="180" r="42" fill="{GOLD}" stroke="none" opacity="0.85"/>
<path d="M180 200c40 20 40 60 0 80" stroke="{TEAL}" stroke-width="6" opacity="0.7"/>
'''

FILES = ["tea", "drum", "greeting", "indigo", "dumplings", "garden", "harvest", "chair"]

for i, name in enumerate(FILES):
    bg, fg = PALETTES[i]
    body = MOTIFS[name].replace(TERRA, fg) if fg != TERRA else MOTIFS[name]
    svg = wrap(body, bg)
    with open(os.path.join(OUT, f"tile-{name}.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("wrote", name)


# Generic category covers, used for community submissions that have no image.
# They are deliberately abstract: a page of text, a circle and one accent shape.
CATEGORY_TILES = [
    ("food", "#F3E4CF", "#B85C3B"),
    ("music", "#DCEAE6", "#2F6E68"),
    ("greeting", "#E8C9BC", "#B85C3B"),
    ("art", "#E6EDDF", "#7E9A78"),
    ("celebration", "#F1DDC4", "#DDA33C"),
    ("everyday", "#EFE3D2", "#2F6E68"),
]

for name, bg, accent in CATEGORY_TILES:
    body = f'''
<circle cx="560" cy="210" r="130" stroke="{accent}" stroke-width="3" opacity="0.45"/>
<g stroke="{accent}" stroke-width="9" opacity="0.9">
  <path d="M170 250h300"/>
  <path d="M170 310h420"/>
  <path d="M170 370h240"/>
</g>
<rect x="470" y="330" width="90" height="90" rx="6" fill="{accent}" opacity="0.22" stroke="{accent}" stroke-width="4"/>
<circle cx="620" cy="430" r="18" fill="{accent}" stroke="none"/>
<path d="M170 460h430" stroke="{INK}" stroke-width="4" opacity="0.22"/>
'''
    with open(os.path.join(OUT, f"tile-cat-{name}.svg"), "w", encoding="utf-8") as f:
        f.write(wrap(body, bg))
    print("wrote category", name)
