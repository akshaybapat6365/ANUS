import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the backend API
    const response = await fetch('http://localhost:8002/api/test');
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      frontend: 'working',
      backend: data,
      message: 'API test successful'
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error)
    }, { status: 500 });
  }
} 