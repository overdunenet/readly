import { Injectable } from '@nestjs/common';
import { Response } from 'express';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

@Injectable()
export class CookieService {
  private readonly defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  };

  /**
   * Set a cookie with the given name, value, and options
   */
  setCookie(
    res: Response,
    name: string,
    value: string,
    options?: CookieOptions
  ): void {
    const finalOptions = { ...this.defaultOptions, ...options };
    res.cookie(name, value, finalOptions);
  }

  /**
   * Set refresh token cookie
   */
  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    this.setCookie(res, 'refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Clear a cookie
   */
  clearCookie(res: Response, name: string, options?: CookieOptions): void {
    const finalOptions = { ...this.defaultOptions, ...options };
    res.clearCookie(name, finalOptions);
  }

  /**
   * Clear refresh token cookie
   */
  clearRefreshTokenCookie(res: Response): void {
    this.clearCookie(res, 'refreshToken');
  }

  /**
   * Get cookie value from request
   */
  getCookie(req: any, name: string): string | undefined {
    return req.cookies?.[name];
  }

  /**
   * Get refresh token from request cookies
   */
  getRefreshTokenFromCookie(req: any): string | undefined {
    return this.getCookie(req, 'refreshToken');
  }
}
