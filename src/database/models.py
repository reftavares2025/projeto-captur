from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Conversa(Base):
    __tablename__ = 'conversas'
    
    id = Column(Integer, primary_key=True, index=True)
    remetente = Column(String(255), index=True)
    destinatario = Column(String(255), index=True)
    texto = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    agente_responsavel = Column(String(255), nullable=True)
    origem = Column(String(50)) # 'whatsapp', 'chatwoot', etc.

class EstadoAtendimento(Base):
    __tablename__ = 'estados'
    
    id = Column(Integer, primary_key=True, index=True)
    telefone = Column(String(50), unique=True, index=True)
    estado = Column(String(50), default='aguardando_opcao') # aguardando_opcao, atendimento_humano
    agente_id = Column(Integer, nullable=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
