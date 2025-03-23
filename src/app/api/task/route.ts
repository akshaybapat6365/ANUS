import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { task, mode } = await request.json();
    
    // Input validation
    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { error: 'Invalid task. Please provide a valid task description.' },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, this would call the ANUS backend or AI service
    // For now, we'll simulate a response
    const response = {
      taskId: `task-${Date.now()}`,
      result: `Processed task "${task}" using ${mode || 'single'} agent mode.`,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    // Return the response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing task:', error);
    return NextResponse.json(
      { error: 'Failed to process task. Please try again.' },
      { status: 500 }
    );
  }
} 