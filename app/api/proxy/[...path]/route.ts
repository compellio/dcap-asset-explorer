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

/**
 * Handles GET requests to the proxy API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construct the full API URL
    const apiUrl = constructApiUrl(API_BASE_URL, params.path);
    
    console.log(`Proxy GET request to ${apiUrl}`);

    // Get URL search params
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${apiUrl}?${searchParams}` : apiUrl;

    // Prepare headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Don't forward host and connection-related headers
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Add session key
    headers.set('x-session-key', SESSION_KEY);
    headers.set('Accept', 'application/json');

    // Make the fetch request
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API proxy GET error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        await response.json().catch(() => ({ error: 'API Error' })),
        { status: response.status }
      );
    }

    // Return the response
    const data = await response.json();
    console.log(`Proxy GET request to ${apiUrl} successful:`, {
      status: response.status,
      dataLength: JSON.stringify(data).length
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`API proxy GET error:`, error);
    
    // Handle different error types
    if (error.response) {
      return NextResponse.json(
        error.response.data || { error: 'API Error' }, 
        { status: error.response.status }
      );
    } else if (error.request) {
      // request was made but no response was received
      return NextResponse.json(
        { error: 'No response received from API', message: error.message }, 
        { status: 503 }
      );
    } else {
      return NextResponse.json(
        { error: 'Request error', message: error.message }, 
        { status: 500 }
      );
    }
  }
}

/**
 * Handles POST requests to the proxy API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construct the full API URL
    const apiUrl = constructApiUrl(API_BASE_URL, params.path);
    
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
      // Don't forward host and connection-related headers
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

    // Make the fetch request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      cache: 'no-store',
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`API proxy POST error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        await response.json().catch(() => ({ error: 'API Error' })),
        { status: response.status }
      );
    }

    // Return the response
    const data = await response.json();
    console.log(`Proxy POST request to ${apiUrl} successful:`, {
      status: response.status,
      dataType: typeof data,
      isArray: Array.isArray(data),
      responseLength: JSON.stringify(data).length
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`API proxy POST error:`, error);
    
    // Handle different error types
    return NextResponse.json(
      { error: 'Request error', message: error.message },
      { status: 500 }
    );
  }
}