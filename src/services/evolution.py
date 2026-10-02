import httpx
from config.settings import settings

class EvolutionService:
    @staticmethod
    async def enviar_mensagem(numero: str, texto: str):
        url = f"{settings.EVOLUTION_API_URL}/message/sendText/captur"
        headers = {"apikey": settings.EVOLUTION_GLOBAL_API_KEY}
        payload = {
            "number": numero,
            "text": texto,
            "delay": 1200
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                print(f"[Evolution API] Envio para {numero}: status={response.status_code}, resp={response.text}")
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Erro ao enviar mensagem via Evolution: {e}")
                return None
