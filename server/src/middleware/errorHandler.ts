import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  status?: number;
}

/**
 * Middleware de manejo de errores
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    error: message,
    status
  });
}

/**
 * Middleware para capturar rutas no encontradas
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
}
