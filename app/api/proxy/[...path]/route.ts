import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gateway.tst.in.compell.io';
const SESSION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY || 'nethereum';

/**
 * Constructs a full API URL from the base URL and path segments
 */
const constructApiUrl = (baseUrl: string, path: string[]): string => {
  const normalizedBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;
  
  const pathSegment = path.join('/');
  
  return `${normalizedBaseUrl}/${pathSegment}`;
};

// GET route handler with updated parameter type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const apiUrl = constructApiUrl(API_BASE_URL, path);
    const fullUrl = searchParams ? `${apiUrl}?${searchParams}` : apiUrl;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });
    headers.set('x-session-key', SESSION_KEY);
    headers.set('Accept', 'application/json');

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404 && path.includes('find')) {
        return NextResponse.json([]);
      }
      return NextResponse.json(
        await response.json().catch(() => ({ error: 'API Error' })),
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Request error', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST route handler with updated parameter type
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    const apiUrl = constructApiUrl(API_BASE_URL, path);
    
    console.log(`Proxy POST request to ${apiUrl}`);

    // Parse the request body
    let body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json().catch(() => ({}));
    } else {
      body = await request.text().catch(() => '');
    }

    // Prepare headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Add required headers
    headers.set('x-session-key', SESSION_KEY);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    console.log(`Making POST request to: ${apiUrl} with headers:`, Object.fromEntries(headers.entries()));

    // Make the fetch request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      cache: 'no-store',
    });

    // Handle 404 errors from find endpoint - return empty array instead of error
    if (response.status === 404 && path.includes('find')) {
      console.log('Search returned 404, returning empty array instead of error');
      return NextResponse.json([]);
    }

    if (!response.ok) {
      console.error(`API proxy POST error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        await response.json().catch(() => ({ error: 'API Error' })),
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Proxy POST request to ${apiUrl} successful:`, {
      status: response.status,
      dataType: typeof data,
      isArray: Array.isArray(data),
      responseLength: JSON.stringify(data).length
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(`API proxy POST error:`, error);
    if (path.includes('find')) {
      console.log('Error in search endpoint, returning empty array');
      return NextResponse.json([]);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Request error', message: errorMessage },
      { status: 500 }
    );
  }
}
