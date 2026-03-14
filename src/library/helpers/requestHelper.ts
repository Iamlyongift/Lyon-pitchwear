// src/library/helpers/request.helper.ts
import { Request } from 'express';

export const getParam = (req: Request, key: string): string => {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
};