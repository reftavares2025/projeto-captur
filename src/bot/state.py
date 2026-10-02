from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.database.models import EstadoAtendimento

async def get_estado(db: AsyncSession, telefone: str):
    result = await db.execute(select(EstadoAtendimento).filter(EstadoAtendimento.telefone == telefone))
    estado = result.scalars().first()
    if not estado:
        estado = EstadoAtendimento(telefone=telefone, estado='aguardando_opcao')
        db.add(estado)
        await db.commit()
        await db.refresh(estado)
    return estado

async def update_estado(db: AsyncSession, telefone: str, novo_estado: str, agente_id: int = None):
    estado = await get_estado(db, telefone)
    estado.estado = novo_estado
    if agente_id:
        estado.agente_id = agente_id
    await db.commit()
    await db.refresh(estado)
    return estado
