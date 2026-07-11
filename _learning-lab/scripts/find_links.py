import urllib.request
import shutil

url = 'https://h5p.org/sites/default/files/h5p/exports/berries-28-441940.h5p'
dest = r'c:\Users\nabnu\Desktop\XIRH\template_book.h5p'

print("Downloading template with Referer header...")
req = urllib.request.Request(
    url, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://h5p.org/content-types/interactive-book'
    }
)

try:
    with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
        shutil.copyfileobj(response, out_file)
    print("Download successful! Saved to:", dest)
except Exception as e:
    print("Download failed:", e)
