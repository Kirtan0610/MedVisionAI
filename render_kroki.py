import zlib
import base64
import urllib.request
import os

def render_kroki(text, diagram_type, output_format, output_path):
    # Compress with zlib
    compressed = zlib.compress(text.encode('utf-8'), 9)
    # Encode with base64 (using URL-safe encoding)
    encoded = base64.urlsafe_b64encode(compressed).decode('ascii')
    
    url = f"https://kroki.io/{diagram_type}/{output_format}/{encoded}"
    
    print(f"Downloading from Kroki: {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with open(output_path, 'wb') as f:
                f.write(response.read())
        print(f"Success! Saved to {output_path}")
    except Exception as e:
        print(f"Failed: {e}")

diagrams = {
    "class_diagram.png": (r"d:\medvision-ai\docs\class_diagram.mmd", "mermaid"),
    "login_sequence.png": (r"d:\medvision-ai\docs\login_sequence.mmd", "mermaid"),
    "upload_sequence.png": (r"d:\medvision-ai\docs\upload_sequence.mmd", "mermaid"),
    "state_chart.png": (r"d:\medvision-ai\docs\state_chart.mmd", "mermaid")
}

for img_name, (mmd_path, d_type) in diagrams.items():
    with open(mmd_path, 'r') as f:
        content = f.read()
    output_path = os.path.join(r"d:\medvision-ai\docs", img_name)
    render_kroki(content, d_type, "png", output_path)
