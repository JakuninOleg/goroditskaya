"""Build AVIF alternatives without changing the approved artwork or its proportions."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'images'

def convert(path, widths=()):
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        variants = [(path.with_suffix('.avif'), image)]
        for width in widths:
            if width < image.width:
                height = round(image.height * width / image.width)
                variants.append((path.with_name(f'{path.stem}-{width}.avif'), image.resize((width,height),Image.Resampling.LANCZOS)))
        for target, pixels in variants:
            if target.exists() and target.stat().st_mtime >= path.stat().st_mtime:
                continue
            pixels.save(target,'AVIF',quality=72,speed=5)
            print(f'{target.relative_to(ROOT)}: {target.stat().st_size} bytes')

for path in (ASSETS/'editorial').glob('*.webp'):
    convert(path)
for name,widths in {
    'hero-mobile-desktop-companion-v8':(480,640),
    'hero-neck-v4':(1280,1600),
    'hero-neck-tablet-v4':(768,1024),
    'iceberg-panorama':(960,1280),
    'about-natalia-v2':(),
    'about-natalia-v2-640':(),
}.items():
    convert(ASSETS/'hybrid'/f'{name}.webp',widths)
