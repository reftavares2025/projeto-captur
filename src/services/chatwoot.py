import httpx
from config.settings import settings

class ChatwootService:
    @staticmethod
    def _headers():
        return {
            "api_access_token": settings.CHATWOOT_API_ACCESS_TOKEN,
            "Content-Type": "application/json"
        }

    @staticmethod
    async def obter_ou_criar_contato(telefone: str, nome: str = None) -> int:
        """Localiza ou cria um contato pelo número de telefone e retorna o ID do contato."""
        numero_limpo = telefone.replace("+", "").strip()
        nome_contato = nome or f"Cliente {numero_limpo}"
        headers = ChatwootService._headers()

        async with httpx.AsyncClient() as client:
            try:
                # 1. Tentar buscar contato existente
                search_url = f"{settings.CHATWOOT_API_URL}/api/v1/accounts/{settings.CHATWOOT_ACCOUNT_ID}/contacts/search"
                resp = await client.get(search_url, params={"q": numero_limpo}, headers=headers)
                if resp.status_code == 200:
                    payload = resp.json().get("payload", [])
                    if payload:
                        return payload[0]["id"]

                # 2. Criar contato se não encontrado
                create_url = f"{settings.CHATWOOT_API_URL}/api/v1/accounts/{settings.CHATWOOT_ACCOUNT_ID}/contacts"
                contact_data = {
                    "inbox_id": settings.CHATWOOT_INBOX_ID,
                    "name": nome_contato,
                    "phone_number": f"+{numero_limpo}"
                }
                create_resp = await client.post(create_url, json=contact_data, headers=headers)
                if create_resp.status_code in (200, 201):
                    return create_resp.json().get("payload", {}).get("contact", {}).get("id")
                else:
                    print(f"Aviso ao criar contato no Chatwoot: {create_resp.text}")
            except Exception as e:
                print(f"Erro ao buscar/criar contato no Chatwoot: {e}")
        return None

    @staticmethod
    async def transferir_para_agente(telefone: str, agente_id: int, mensagem: str):
        """Cria/encontra contato, abre a conversa no Chatwoot e atribui ao agente."""
        contato_id = await ChatwootService.obter_ou_criar_contato(telefone)
        if not contato_id:
            print(f"Não foi possível obter contato no Chatwoot para {telefone}")
            return None

        headers = ChatwootService._headers()
        conv_url = f"{settings.CHATWOOT_API_URL}/api/v1/accounts/{settings.CHATWOOT_ACCOUNT_ID}/conversations"
        payload = {
            "source_id": str(contato_id),
            "inbox_id": settings.CHATWOOT_INBOX_ID,
            "contact_id": contato_id,
            "assignee_id": agente_id,
            "status": "open",
            "message": {
                "content": f"[Triagem Captur]: Cliente transferido. Opção escolhida: {mensagem}"
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(conv_url, json=payload, headers=headers)
                if resp.status_code in (200, 201):
                    conv_data = resp.json()
                    print(f"Conversa criada com sucesso no Chatwoot (ID: {conv_data.get('id')}) para o agente {agente_id}")
                    return conv_data
                else:
                    print(f"Erro ao criar conversa no Chatwoot: {resp.text}")
            except Exception as e:
                print(f"Erro na requisição para criar conversa no Chatwoot: {e}")
        return None
