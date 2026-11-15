#!/usr/bin/env python3
"""Bundle src/ into one self-contained dist/index.html (no external files needed)."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
order = ["config", "data", "audio", "sprites", "sprites2", "teamsprites", "teamchars", "world", "render", "props2", "ui", "main", "story", "minigames", "minigames2", "mars3d", "scenes", "introfx", "intro", "boot"]
js = "\n".join(f"// ---- {n}.js ----\n" + (src / f"{n}.js").read_text() for n in order)
css = (src / "style.css").read_text()
html = (src / "index.html").read_text()
html = html.replace("/*CSS*/", css).replace("/*JS*/", js.replace("</script>", "<\\/script>"))
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "index.html").write_text(html)
print("built dist/index.html", len(html) // 1024, "KB")
(root / "index.html").write_text(html)
