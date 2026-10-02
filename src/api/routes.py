import os
import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.connection import get_db
from src.bot.router import processar_mensagem
from src.services.transcription import TranscriptionService
from config.settings import settings

router = APIRouter()

HTML_TEMPLATE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "qrcode.html")
BRAND_ASSETS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "config", "brand_assets")

@router.get("/health")
async def health_check():
    return {"status": "ok", "app": "Captur Bot"}

@router.get("/qrcode", response_class=HTMLResponse)
async def qrcode_page():
    if os.path.exists(HTML_TEMPLATE_PATH):
        with open(HTML_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h2>Página de QR Code não encontrada.</h2>", status_code=404)

@router.get("/brand-assets/{filename}")
async def brand_assets(filename: str):
    file_path = os.path.join(BRAND_ASSETS_PATH, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse({"error": "File not found"}, status_code=404)

@router.get("/qr-status")
@router.get("/api/qr-status")
async def qr_status():
    headers = {"apikey": settings.EVOLUTION_GLOBAL_API_KEY}
    url_state = f"{settings.EVOLUTION_API_URL}/instance/connectionState/captur"
    url_connect = f"{settings.EVOLUTION_API_URL}/instance/connect/captur?number=5515991707443"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res_state = await client.get(url_state, headers=headers)
            state_data = res_state.json()
            state = state_data.get("instance", {}).get("state", "close")

            if state == "open":
                return {"state": "open"}

            res_connect = await client.get(url_connect, headers=headers)
            connect_data = res_connect.json()

            return {
                "state": state,
                "base64": connect_data.get("base64"),
                "pairingCode": connect_data.get("pairingCode"),
                "code": connect_data.get("code")
            }
    except Exception as e:
        return {"state": "error", "error": str(e)}

@router.post("/webhook/evolution")
async def evolution_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    event = payload.get("event")
    event_str = str(event or "").lower().replace("-", "_").replace(".", "_")

    if event_str == "messages_upsert" or not event:
        event_data = payload.get("data", {})
        
        messages = []
        if isinstance(event_data, dict):
            if "messages" in event_data and isinstance(event_data["messages"], list):
                messages = event_data["messages"]
            elif "key" in event_data:
                messages = [event_data]
        elif isinstance(event_data, list):
            messages = event_data

        for msg in messages:
            key = msg.get("key", {})
            if key.get("fromMe", False):
                continue
                
            remote_jid = key.get("remoteJid", "")
            # Ignora grupos ou broadcasts do WhatsApp
            if not remote_jid or "@g.us" in remote_jid or "status@broadcast" in remote_jid:
                continue

            telefone = remote_jid.split("@")[0]
            msg_id = key.get("id")
            message_content = msg.get("message", {}) or {}

            # 1. Extração de Texto
            texto = (
                message_content.get("conversation")
                or message_content.get("extendedTextMessage", {}).get("text")
                or ""
            ).strip()

            # 2. Extração e Transcrição de Áudio com Whisper
            if not texto and "audioMessage" in message_content:
                print(f"\n[WhatsApp] 🎙️ Áudio recebido de {telefone}! Transcrevendo com IA...")
                audio_bytes = await TranscriptionService.obter_audio_evolution(msg_id)
                if audio_bytes:
                    texto = await TranscriptionService.transcrever_audio_bytes(audio_bytes)
                    if texto:
                        print(f"[WhatsApp] Áudio transcrito: '{texto}'")

            if texto:
                print(f"\n[WhatsApp] Mensagem de {telefone}: '{texto}'")
                await processar_mensagem(db, telefone, texto)

    return {"status": "ok"}
