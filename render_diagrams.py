import base64
import urllib.request
import os

diagrams = {
    "class_diagram_fixed.png": r"d:\medvision-ai\docs\class_diagram.mmd",
    "login_sequence_fixed.png": r"d:\medvision-ai\docs\login_sequence.mmd",
    "upload_sequence_fixed.png": r"d:\medvision-ai\docs\upload_sequence.mmd",
    "state_chart_fixed.png": r"d:\medvision-ai\docs\state_chart.mmd"
}

def render_mermaid(mmd_path, output_path):
    with open(mmd_path, 'r') as f:
        graph = f.read()
    
    # Base64 encode for mermaid.ink
    graphbytes = graph.encode("utf8")
    base64_bytes = base64.b64encode(graphbytes)
    base64_string = base64_bytes.decode("ascii")
    
    url = "https://mermaid.ink/img/" + base64_string
    
    print(f"Downloading {url} to {output_path}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with open(output_path, 'wb') as f:
                f.write(response.read())
        print("Success!")
    except Exception as e:
        print(f"Failed: {e}")

for img_name, mmd_path in diagrams.items():
    output_path = os.path.join(r"d:\medvision-ai\docs", img_name)
    render_mermaid(mmd_path, output_path)
