#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[3]
SCREENSHOT_ROOT = ROOT / "app-store/releases/va-document-finder-ios/screenshots"
RAW = SCREENSHOT_ROOT / "raw"
FINAL = SCREENSHOT_ROOT / "final"
APP_ICON = (
    ROOT
    / "apps/va-document-finder-ios/VA Document Finder/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png"
)

FONT_REGULAR = "/System/Library/Fonts/SFNS.ttf"
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"

NAVY = (12, 28, 52)
INK = (15, 22, 36)
BLUE = (26, 93, 210)
GOLD = (193, 143, 45)
MIST = (245, 247, 251)
WHITE = (255, 255, 255)
GRAY = (104, 112, 124)


SCREENS = [
    {
        "slug": "home",
        "title": "Organize every claim record",
        "subtitle": "Intake, evidence gaps, rating math, and support notes in one native workspace.",
        "raw": "01-home",
    },
    {
        "slug": "intake",
        "title": "Start with the medical issue",
        "subtitle": "Drill from body system to 38 CFR diagnosis paths, DBQs, and evidence needs.",
        "raw": "02-intake",
    },
    {
        "slug": "dossier",
        "title": "Build a local dossier",
        "subtitle": "Import PDFs, images, and notes into a private on-device working set.",
        "raw": "03-dossier",
    },
    {
        "slug": "calculator",
        "title": "Model rating scenarios",
        "subtitle": "Combine current and target ratings before choosing the next record to find.",
        "raw": "04-calculator",
    },
    {
        "slug": "tools",
        "title": "Keep strategy in reach",
        "subtitle": "PACT Act cues, opinion prep, evidence checklist, and Digital Sync support notes.",
        "raw": "05-tools",
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def text_wrap(draw: ImageDraw.ImageDraw, text: str, text_font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = word if not current else f"{current} {word}"
        if draw.textbbox((0, 0), test, font=text_font)[2] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    text_font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_gap: int,
) -> int:
    x, y = xy
    for line in text_wrap(draw, text, text_font, max_width):
        draw.text((x, y), line, font=text_font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=text_font)
        y = bbox[3] + line_gap
    return y


def gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    width, height = size
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(height):
        t = y / max(1, height - 1)
        row = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(width):
            px[x, y] = row
    return img


def paste_card(base: Image.Image, content: Image.Image, box: tuple[int, int, int, int], radius: int) -> None:
    x, y, w, h = box
    shadow = Image.new("RGBA", (w + 96, h + 96), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((48, 48, 48 + w, 48 + h), radius=radius, fill=(8, 22, 45, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))
    base.alpha_composite(shadow, (x - 48, y - 34))

    mask = rounded_mask((w, h), radius)
    card = Image.new("RGBA", (w, h), WHITE + (255,))
    fitted = ImageOps_fit(content, (w, h))
    card.paste(fitted, (0, 0), mask)
    base.alpha_composite(card, (x, y))

    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border)
    border_draw.rounded_rectangle((1, 1, w - 2, h - 2), radius=radius, outline=(255, 255, 255, 210), width=3)
    base.alpha_composite(border, (x, y))


def ImageOps_fit(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    src_ratio = img.width / img.height
    dst_ratio = size[0] / size[1]
    if src_ratio > dst_ratio:
        new_h = size[1]
        new_w = round(new_h * src_ratio)
    else:
        new_w = size[0]
        new_h = round(new_w / src_ratio)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = max(0, (new_w - size[0]) // 2)
    top = 0
    return resized.crop((left, top, left + size[0], top + size[1]))


def prepare_app_crop(raw: Image.Image, device: str) -> Image.Image:
    if device == "iphone":
        return raw.crop((0, 300, raw.width, raw.height - 90))
    return raw.crop((0, 86, raw.width, raw.height - 20))


def draw_brand_header(draw: ImageDraw.ImageDraw, icon: Image.Image, title_y: int, scale: int) -> int:
    icon_size = 112 if scale == 1 else 132
    icon_x = 86 if scale == 1 else 128
    icon_y = 92 if scale == 1 else 108
    icon = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS).convert("RGBA")
    draw.rounded_rectangle((icon_x - 12, icon_y - 12, icon_x + icon_size + 12, icon_y + icon_size + 12), radius=28, fill=(255, 255, 255, 30))
    return icon_x, icon_y, icon_size


def render(device: str, screen: dict[str, str]) -> Path:
    if device == "iphone":
        size = (1320, 2868)
        header_h = 850
        title_font = font(76, True)
        subtitle_font = font(39)
        eyebrow_font = font(28, True)
        x = 86
        title_y = 250
        max_text = 1110
        card = (110, 900, 1100, 1810)
        radius = 54
        output = FINAL / f"iphone-69-{SCREENS.index(screen) + 1:02d}-{screen['slug']}.png"
    else:
        size = (2064, 2752)
        header_h = 670
        title_font = font(82, True)
        subtitle_font = font(42)
        eyebrow_font = font(30, True)
        x = 126
        title_y = 228
        max_text = 1450
        card = (152, 750, 1760, 1820)
        radius = 46
        output = FINAL / f"ipad-13-{SCREENS.index(screen) + 1:02d}-{screen['slug']}.png"

    base = Image.new("RGBA", size, MIST + (255,))
    header = gradient((size[0], header_h), NAVY, BLUE).convert("RGBA")
    base.alpha_composite(header, (0, 0))
    draw = ImageDraw.Draw(base)

    draw.rounded_rectangle((x, 92, x + 520, 158), radius=33, fill=(255, 255, 255, 232))
    icon = Image.open(APP_ICON).convert("RGBA")
    icon_size = 52
    icon = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    base.alpha_composite(icon, (x + 10, 99))
    draw.text((x + 76, 112), "VA Doc Finder", font=eyebrow_font, fill=INK)

    draw_wrapped(draw, screen["title"], (x, title_y), title_font, WHITE, max_text, 10)
    draw_wrapped(draw, screen["subtitle"], (x, title_y + (190 if device == "iphone" else 140)), subtitle_font, (226, 235, 250), max_text, 8)

    draw.rounded_rectangle((x, header_h - 104, x + 398, header_h - 44), radius=30, fill=(193, 143, 45, 255))
    draw.text((x + 32, header_h - 90), "Native iPhone + iPad", font=font(28 if device == "iphone" else 30, True), fill=INK)

    raw = Image.open(RAW / f"{device}-{screen['raw']}.png").convert("RGBA")
    content = prepare_app_crop(raw, device)
    paste_card(base, content, card, radius)

    base.convert("RGB").save(output, quality=96)
    return output


def main() -> None:
    FINAL.mkdir(parents=True, exist_ok=True)
    for device in ("iphone", "ipad"):
        for screen in SCREENS:
            path = render(device, screen)
            print(path)


if __name__ == "__main__":
    main()
