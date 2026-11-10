import type { Request as ExpressReq, Response as ExpressRes } from 'express';

const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.2838 103.8591" (latitude longitude)
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y' | string; // C: Cars, H: Heavy vehicles, Y: Motorcycles
  Agency: 'HDB' | 'URA' | 'LTA' | string;
}

export interface LTAResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

// In-memory cache to prevent exceeding LTA DataMall rate limits
interface CacheEntry {
  timestamp: number;
  data: LTAResponse;
}

let cachedResponse: CacheEntry | null = null;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache (LTA updates every ~1 min)

/**
 * Universal Serverless Handler for /api/carparkavailability
 * Connects to Singapore LTA DataMall CarParkAvailabilityv2 endpoint.
 */
export default async function handler(req: ExpressReq | Request, res?: ExpressRes): Promise<Response | void> {
  // Extract headers & query parameters across Express or Web Request
  let requestHeaders: Record<string, string | string[] | undefined> = {};
  let queryParams = new URLSearchParams();

  if ('headers' in req && typeof (req as ExpressReq).get === 'function') {
    const expressReq = req as ExpressReq;
    requestHeaders = expressReq.headers;
    const query = expressReq.query || {};
    Object.entries(query).forEach(([k, v]) => {
      if (typeof v === 'string') queryParams.set(k, v);
    });
  } else if ('url' in req) {
    const webReq = req as Request;
    const url = new URL(webReq.url);
    queryParams = url.searchParams;
    webReq.headers.forEach((v, k) => {
      requestHeaders[k.toLowerCase()] = v;
    });
  }

  // Check for AccountKey from environment variable, with fallback to request header
  const accountKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_KEY ||
    (requestHeaders['accountkey'] as string) ||
    (requestHeaders['x-account-key'] as string) ||
    queryParams.get('accountKey') ||
    '';

  // If AccountKey is missing, respond with actionable guidance without failing fatally
  if (!accountKey.trim()) {
    const noKeyResponse = {
      success: false,
      error: 'LTA DataMall AccountKey is not configured.',
      message:
        'Please configure LTA_DATAMALL_ACCOUNT_KEY in your environment variables (.env) or pass it via the AccountKey header.',
      ltaEndpoint: LTA_CARPARK_API_URL,
      requiredHeader: 'AccountKey',
      timestamp: new Date().toISOString(),
      value: [],
      count: 0,
    };

    if (res && typeof (res as ExpressRes).status === 'function') {
      (res as ExpressRes).setHeader('Content-Type', 'application/json');
      (res as ExpressRes).setHeader('Access-Control-Allow-Origin', '*');
      (res as ExpressRes).status(200).json(noKeyResponse);
      return;
    }

    return new Response(JSON.stringify(noKeyResponse, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Handle caching (if no specific $skip parameter is requested)
  const skipParam = queryParams.get('$skip');
  const now = Date.now();
  if (!skipParam && cachedResponse && now - cachedResponse.timestamp < CACHE_TTL_MS) {
    const cachedData = {
      success: true,
      cached: true,
      cacheAgeSeconds: Math.floor((now - cachedResponse.timestamp) / 1000),
      timestamp: new Date(cachedResponse.timestamp).toISOString(),
      count: cachedResponse.data.value?.length || 0,
      value: cachedResponse.data.value || [],
    };

    if (res && typeof (res as ExpressRes).status === 'function') {
      (res as ExpressRes).setHeader('Content-Type', 'application/json');
      (res as ExpressRes).setHeader('Access-Control-Allow-Origin', '*');
      (res as ExpressRes).status(200).json(cachedData);
      return;
    }

    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const targetUrl = skipParam
      ? `${LTA_CARPARK_API_URL}?$skip=${encodeURIComponent(skipParam)}`
      : LTA_CARPARK_API_URL;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const ltaResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!ltaResponse.ok) {
      const errorText = await ltaResponse.text();
      const errorPayload = {
        success: false,
        status: ltaResponse.status,
        statusText: ltaResponse.statusText,
        error: `LTA DataMall responded with HTTP ${ltaResponse.status}`,
        details: errorText,
        timestamp: new Date().toISOString(),
      };

      if (res && typeof (res as ExpressRes).status === 'function') {
        (res as ExpressRes).setHeader('Content-Type', 'application/json');
        (res as ExpressRes).setHeader('Access-Control-Allow-Origin', '*');
        (res as ExpressRes).status(ltaResponse.status).json(errorPayload);
        return;
      }

      return new Response(JSON.stringify(errorPayload), {
        status: ltaResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = (await ltaResponse.json()) as LTAResponse;

    // Save to cache if primary query
    if (!skipParam) {
      cachedResponse = {
        timestamp: Date.now(),
        data,
      };
    }

    const successPayload = {
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      count: data.value?.length || 0,
      value: data.value || [],
    };

    if (res && typeof (res as ExpressRes).status === 'function') {
      (res as ExpressRes).setHeader('Content-Type', 'application/json');
      (res as ExpressRes).setHeader('Access-Control-Allow-Origin', '*');
      (res as ExpressRes).status(200).json(successPayload);
      return;
    }

    return new Response(JSON.stringify(successPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    const failurePayload = {
      success: false,
      error: error.name === 'AbortError' ? 'Connection to LTA DataMall timed out.' : error.message,
      timestamp: new Date().toISOString(),
      value: [],
      count: 0,
    };

    if (res && typeof (res as ExpressRes).status === 'function') {
      (res as ExpressRes).setHeader('Content-Type', 'application/json');
      (res as ExpressRes).setHeader('Access-Control-Allow-Origin', '*');
      (res as ExpressRes).status(502).json(failurePayload);
      return;
    }

    return new Response(JSON.stringify(failurePayload), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Named export for GET
export { handler as GET };
