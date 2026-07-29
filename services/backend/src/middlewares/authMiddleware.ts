import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'captur_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Suporta via Header Authorization ou Query Param ?token= para downloads CSV
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user as { id: string; role: string; email: string };
    next();
  });
}
