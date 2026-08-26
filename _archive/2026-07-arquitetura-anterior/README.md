# Arquitetura anterior (arquivada em 26/08/2026)

Esta pasta guarda a **primeira versão** do sistema Captur (commits de 28/07 e 17/08/2026):

- `apps/mobile` — PWA em Flutter para o passageiro (ainda tem deploy ativo na Vercel,
  projeto `mobile`, independente destes arquivos locais).
- `apps/web-admin` — painel administrativo web (idem, projeto Vercel `web-admin`).
- `services/backend` — API em Node/Express + Prisma + Postgres, com IA "Mônica" via Groq.
- `render.yaml`, `docker-compose*.yml`, `deploy.sh`, `test-*.js` — infraestrutura e testes
  dessa geração, pensados para rodar `services/backend` no Render e usar a Evolution API
  para WhatsApp.

## Por que foi arquivada

Em agosto/2026 o projeto foi refeito do zero como um app único (`captur-agência-de-viagens/`,
na raiz do repositório) que já cobre tudo isso — Admin Portal + PWA do passageiro no mesmo
Express/Vite, banco próprio e integração de WhatsApp real via **OpenWA** (self-hosted) no
lugar da Evolution API. Essa é a versão em desenvolvimento ativo agora.

## Isso pode ser apagado?

Os `apps/mobile` e `apps/web-admin` **têm deploys de produção ativos na Vercel** (não
verificamos se ainda recebem tráfego de clientes reais). Mover estes arquivos para cá
**não afeta** esses deploys — eles são independentes do que existe localmente. Antes de
remover de vez (ou de derrubar os deploys na Vercel), confirme se algum cliente ainda usa
os links antigos.

## Segurança

Em 26/08/2026 removemos uma API key da Groq e um `JWT_SECRET` que estavam **hardcoded em
texto puro** no `render.yaml` e em `services/backend/src/routes/{aiAssistant,webhooks}.ts`.
O repositório é privado, então não houve exposição pública — mas, se essa chave da Groq
ainda for válida, revogue-a em console.groq.com/keys e gere uma nova antes de reusar
qualquer coisa desta pasta.
