/**
 * 結構化錯誤日誌
 * 輸出：時間、方法、路徑、狀態碼、錯誤訊息（開發環境含 stack）
 */

import { Request } from 'express';

export function logError(
  req: Request,
  statusCode: number,
  message: string,
  err?: any
): void {
  const ts = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl || req.url;
  const logLine = `[${ts}] ${method} ${path} → ${statusCode} ${message}`;
  console.error('❌', logLine);
  if (err?.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
}
