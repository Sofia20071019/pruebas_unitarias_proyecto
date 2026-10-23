from app.utils.generador_excel import normalizar_texto

def test_normalizar_texto():
    # Caso de prueba 1: Texto con acentos y caracteres especiales
    texto_entrada = "áéíóúñü"
    resultado_esperado = "aeiounu"
    assert normalizar_texto(texto_entrada) == resultado_esperado
    
    
def test_texto_mausculas ():
    # Caso de prueba 2: Texto con mayúsculas y minúsculas
    texto_entrada = "ÁÉÍÓÚÑÜ"
    resultado_esperado = "AEIOUNU"
    assert normalizar_texto(texto_entrada) == resultado_esperado

def test_texto_espacios_puntuacion():
    # Caso de prueba 3: Texto con espacios y puntuación
    texto_entrada = "¡Hola, mundo!"
    resultado_esperado = "Hola_mundo"
    assert normalizar_texto(texto_entrada) == resultado_esperado

def test_texto_vacio_y_sin_caracteres_especiales():
    # Caso de prueba 4: Texto vacío
    texto_entrada = ""
    resultado_esperado = "reporte"
    assert normalizar_texto(texto_entrada) == resultado_esperado


def test_texto_sin_caracteres_especiales():
    # Caso de prueba 5: Texto sin caracteres especiales
    texto_entrada = "Python"
    resultado_esperado = "Python"
    assert normalizar_texto(texto_entrada) == resultado_esperado