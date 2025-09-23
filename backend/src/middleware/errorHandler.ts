import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorCode } from '../utils/responses';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Логируем ошибку
  console.error('🔥 Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Определяем статус код и код ошибки
  const statusCode = error.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Определяем код ошибки на основе статуса
  let errorCode: ErrorCode;
  switch (statusCode) {
    case 401:
      errorCode = ErrorCode.AUTH_REQUIRED;
      break;
    case 403:
      errorCode = ErrorCode.ACCESS_DENIED;
      break;
    case 404:
      errorCode = ErrorCode.NOT_FOUND;
      break;
    case 400:
      errorCode = ErrorCode.VALIDATION_ERROR;
      break;
    default:
      errorCode = ErrorCode.INTERNAL_ERROR;
  }

  // Подготавливаем детали ошибки для разработки
  const details = isDevelopment ? {
    stack: error.stack,
    originalMessage: error.message,
    path: req.url,
    method: req.method
  } : undefined;

  // Используем унифицированный формат ответа
  const message = statusCode >= 500 ? 'Внутренняя ошибка сервера' : error.message;
  return ApiResponse.error(res, errorCode, message, statusCode, details);
};

// Функция для создания операционных ошибок
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};