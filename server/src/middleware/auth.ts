import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as AuthenticatedRequest).user = {
      id: payload.id,
      email: payload.email
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

export function signToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
