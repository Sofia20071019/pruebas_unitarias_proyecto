import subprocess
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent.parent
FRONT = RAIZ / "config tu"


def ejecutar_con_api(prelude: str, cuerpo: str) -> str:
    src = (FRONT / "src" / "api.js").read_text(encoding="utf-8")
    src = src.replace("import.meta.env", "({VITE_API_URL: 'http://test'})")
    codigo = f"{prelude}\n{src}\n;(async () => {{\n{cuerpo}\n}})();"
    with tempfile.TemporaryDirectory() as tmp:
        archivo = Path(tmp) / "prueba.mjs"
        archivo.write_text(codigo, encoding="utf-8")
        r = subprocess.run(["node", str(archivo)], capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        raise RuntimeError(f"Node fallo:\n{r.stderr}")
    return r.stdout.strip()