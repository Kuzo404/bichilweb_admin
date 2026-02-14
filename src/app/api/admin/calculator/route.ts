import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (in production, use a database)
let calculatorConfig = {
  id: 'default',
  defaultAmount: '10000000',
  defaultRate: '2.5',
  defaultTerm: '12',
  maxAmount: 100000000,
  maxTerm: 60,
  minRate: 0.5,
  maxRate: 5.0,
  // Styling
  labelColor: '#1f2937',
  labelFontSize: 14,
  inputTextColor: '#1f2937',
  inputFontSize: 16,
  inputBgColor: '#ffffff',
  inputBorderColor: '#e5e7eb',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(calculatorConfig, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.defaultAmount || !body.defaultRate || !body.defaultTerm) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update configuration
    calculatorConfig = {
      ...body,
      id: body.id || 'default',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(calculatorConfig, { status: 200 });
  } catch (error) {
    console.error('Calculator API error:', error);
    return NextResponse.json(
      { error: 'Failed to update calculator configuration' },
      { status: 500 }
    );
  }
}
