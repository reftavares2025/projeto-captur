import asyncio
from fastapi import FastAPI
from src.api.routes import router
from src.database.connection import engine
from src.database.models import Base
from src.bot.sla_monitor import sla_monitor_loop

app = FastAPI(title="Captur Webhook API")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Inicia o monitor de SLA em segundo plano
    asyncio.create_task(sla_monitor_loop())

app.include_router(router)
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000)
