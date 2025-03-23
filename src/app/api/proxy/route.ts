import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/services/agentService';

// If BACKEND_URL is not imported properly, fallback to a hardcoded value
const API_URL = BACKEND_URL || 'http://localhost:8003';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendPath = request.nextUrl.searchParams.get('path') || '/api/task';
    
    console.log('Proxy POST request to:', `${API_URL}${backendPath}`, 'with body:', body);
    
    const response = await fetch(`${API_URL}${backendPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Proxy POST response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const backendPath = request.nextUrl.searchParams.get('path') || '/api/task';
    const taskId = request.nextUrl.searchParams.get('taskId');
    
    let url = `${API_URL}${backendPath}`;
    if (taskId) {
      url += `/${taskId}`;
    }
    
    console.log('Proxy GET request to:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Proxy GET response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error)
    }, { status: 500 });
  }
} 