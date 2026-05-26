import sys
from PIL import Image

def make_square(im, min_size=256, fill_color=(0, 0, 0, 0)):
    x, y = im.size
    size = max(min_size, x, y)
    new_im = Image.new('RGBA', (size, size), fill_color)
    new_im.paste(im, (int((size - x) / 2), int((size - y) / 2)))
    return new_im

try:
    img = Image.open('logo.png').convert('RGBA')
    square_img = make_square(img)
    # Resize down for lighter favicon
    square_img.thumbnail((256, 256), Image.Resampling.LANCZOS)
    square_img.save('favicon.png', 'PNG')
    print('SUCCESS')
except Exception as e:
    print('ERROR:', e)
