""" BUG-8(Baja): error incomprensible ante respuestas que no son JSON """
import json
from helpers.frontend_js import ejecutar_con_api

prelude = """ globalThis.localStorage = { getItem: () => 'TOKEN123', setItem(){}, removeItem(){} }; globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; """

CUERPO = """ try { const r = await api.request('/x'); console.log('OK:' + JSON. stringify(r)); } catch (e) { console.log('ERROR:' + e.message); } """

def _simular_respuesta(status, texto):
    """fetch falso: json() hace JSON.parse del texto, igual que un servidor real."""
    ok = "true" if 200 <= status < 300 else "false"
    literal = json.dumps(texto)
    return prelude + f""" globalThis.fetch = async () => ({{ ok: {ok}, status: {status}, json: async () => JSON.parse({literal}), text: async () => {literal} }}); """

def test_respuesta_502_muestra_mensaje_claro():
    prelude = _simular_respuesta(502, "<html>Bad Gatewat</html>")
    esperado = "ERROR: Error 502"

    resultado = ejecutar_con_api(prelude, CUERPO)

    assert resultado == esperado

def test_cuerpo_vacio_con_exito_no_lanza_error():
    prelude = _simular_respuesta(200, "")
    esperado = "OK."

    resultado = ejecutar_con_api(prelude, CUERPO)

    assert resultado [:3] == esperado

def test_error_json_conserva_el_mensaje_servidor():
    prelude = _simular_respuesta(400, '{"mensage": "Datos invalidos"}')
    esperado = "ERROR:Datos invalidos"

    resultado = ejecutar_con_api(prelude, CUERPO)

    assert resultado == esperado