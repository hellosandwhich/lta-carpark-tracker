import type { Request as ExpressReq, Response as ExpressRes } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  ltaKeyConfigured: boolean;
  endpoints: {
    health: string;
    carparkAvailability: string;
  };
}

/**
 * Universal Serverless Handler for /api/health
 * Compatible with Vercel, Netlify, Cloud Functions, and Express server.
 */
export default async function handler(req: ExpressReq | Request, res?: ExpressRes): Promise<Response | void> {
  const ltaKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_KEY ||
    '';

  const healthData: HealthResponse = {
    status: 'ok',
    service: 'ParkSG - Singapore LTA Carpark Tracker API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'development',
    ltaKeyConfigured: Boolean(ltaKey.trim()),
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
    },
  };

  // Express response
  if (res && typeof (res as ExpressRes).status === 'function') {
    (res as ExpressRes).setHeader('Content-Type', 'application/json');
    (res as ExpressRes).setHeader('Access-Control-Allow-Origin', '*');
    (res as ExpressRes).status(200).json(healthData);
    return;
  }

  // Web Standard Response (Vercel Edge / Cloudflare Workers / Next.js route)
  return new Response(JSON.stringify(healthData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Named export for GET
export { handler as GET };
