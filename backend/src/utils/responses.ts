import { Response } from 'express';

// Типы ошибок
export enum ErrorCode {
  // Аутентификация и авторизация
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Ресурсы
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Валидация
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Бизнес-логика
  CART_EMPTY = 'CART_EMPTY',
  PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
  ORDER_NOT_PROCESSABLE = 'ORDER_NOT_PROCESSABLE',

  // Серверные ошибки
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// Базовая структура ответа
interface BaseResponse {
  success: boolean;
  timestamp: string;
}

// Успешный ответ
interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data: T;
}

// Ответ с ошибкой
interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

// Ответ с пагинацией
interface PaginatedResponse<T = any> extends BaseResponse {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ApiResponse {
  /**
   * Успешный ответ
   */
  static success<T>(res: Response, data: T, statusCode = 200) {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Успешный ответ с пагинацией
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: { page: number; limit: number; total: number; pages: number },
    statusCode = 200
  ) {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Ответ с ошибкой
   */
  static error(
    res: Response,
    code: ErrorCode,
    message: string,
    statusCode = 400,
    details?: any
  ) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details })
      },
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Ошибка аутентификации
   */
  static unauthorized(res: Response, message = 'Требуется аутентификация') {
    return this.error(res, ErrorCode.AUTH_REQUIRED, message, 401);
  }

  /**
   * Ошибка авторизации
   */
  static forbidden(res: Response, message = 'Доступ запрещен') {
    return this.error(res, ErrorCode.ACCESS_DENIED, message, 403);
  }

  /**
   * Ресурс не найден
   */
  static notFound(res: Response, message = 'Ресурс не найден') {
    return this.error(res, ErrorCode.NOT_FOUND, message, 404);
  }

  /**
   * Ошибка валидации
   */
  static validationError(res: Response, message = 'Ошибка валидации', details?: any) {
    return this.error(res, ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  /**
   * Внутренняя ошибка сервера
   */
  static internalError(res: Response, message = 'Внутренняя ошибка сервера') {
    return this.error(res, ErrorCode.INTERNAL_ERROR, message, 500);
  }

  /**
   * Ошибка бизнес-логики
   */
  static businessError(res: Response, code: ErrorCode, message: string) {
    return this.error(res, code, message, 400);
  }
}