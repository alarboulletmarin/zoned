import sys, re

def extract_screen(filepath, start_label, end_label=None):
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    start_marker = f'data-screen-label="{start_label}"'
    start = content.index(start_marker)
    # walk back to the opening <div ...> that contains this attribute
    div_start = content.rfind("<div", 0, start)
    if end_label:
        end_marker = f'data-screen-label="{end_label}"'
        end = content.index(end_marker)
        end = content.rfind("<div", 0, end)
    else:
        end = len(content)
    fragment = content[div_start:end]
    # extract the <style> block from <helmet>
    style_match = re.search(r"<style>(.*?)</style>", content, re.S)
    style = style_match.group(1) if style_match else ""
    return fragment, style

if __name__ == "__main__":
    filepath, start_label, out_prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    end_label = sys.argv[4] if len(sys.argv) > 4 else None
    fragment, style = extract_screen(filepath, start_label, end_label)
    for theme in ["dark", "light"]:
        html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=general-sans@400,500,600,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
<style>{style}</style>
</head>
<body>
<div data-theme="{theme}" style="font-family:'General Sans',system-ui,sans-serif; width:max-content; padding:32px;">
{fragment}
</div>
</body>
</html>"""
        outpath = f"{out_prefix}-{theme}.html"
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(html)
        print(outpath)
