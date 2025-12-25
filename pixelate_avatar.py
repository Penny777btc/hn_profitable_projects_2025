from PIL import Image
import os

source_path = "/Users/pennys/.gemini/antigravity/brain/56afc7fe-0894-400a-8d31-e7dde1219405/uploaded_image_1766646433977.jpg"
target_path = "assets/img/avatar_pixel.png"

try:
    img = Image.open(source_path)
    # Convert to grayscale
    img = img.convert("L")
    
    # Resize to tiny to lose detail (pixelate effect)
    # 50x50 seems like a good "icon" resolution
    small = img.resize((50, 50), Image.Resampling.LANCZOS)
    
    # Enforce strict black and white (dither=None for cleaner pixel art look, or Dither for retro look)
    # Let's try 1-bit thresholding for that manga look
    bw = small.point(lambda x: 0 if x < 128 else 255, '1')
    
    # Resize back up to be distinct pixels
    # 200x200 so it looks big and chunky on screen
    pixelated = bw.resize((200, 200), Image.Resampling.NEAREST)
    
    pixelated.save(target_path)
    print(f"Successfully saved to {target_path}")

except Exception as e:
    print(f"Error: {e}")
