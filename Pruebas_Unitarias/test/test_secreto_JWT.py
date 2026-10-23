""" BUG-6(Media): Secreto JWT escrito en el codigo fuente. """
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent.parent
APP = RAIZ / "3_0_API" / "app"

def test_jwt_no_contiene_seecreto_publico(codigo_fuente):
    secreto_publico = "Kimuka-jwt-secret"
    esperado = False
    
    fuente = codigo_fuente("3_0_API/app/utils/jwt_utils.py")
    contiene_secreto = secreto_publico in fuente

    assert contiene_secreto is esperado

def test_secret_key_no_tiene_valor_respaldo(codigo_fuente):
    patron = r'get\(\s*"SECRET_KEY"\S*,'
    esperado = 0

    fuente = codigo_fuente("3_0_API/app/utils/jwt_utils.py")
    cantidad = len(re.findall(patron, fuente))

    assert cantidad == esperado

def test_secreto_publico_no_esta_en_archivo_api():
    secreto_publico = "kimuka-jwt-secret"
    esperado = []

    archivos_con_secreto = [
        str(p.relative_to(RAIZ))
        for p in APP.rglob(".py")
        if secreto_publico in p.read_text(encoding="utf-8")
    ]

    assert archivos_con_secreto == esperado