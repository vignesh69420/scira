import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for flight tracking parameters
const flightTrackingSchema = z.object({
  flight_number: z.string().describe('The flight number to track (IATA format)'),
});

// Flight tracking API route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flight_number } = flightTrackingSchema.parse(body);

    // Get API key from environment variables
    const apiKey = process.env.AVIATION_STACK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Aviation Stack API key not configured' },
        { status: 500 }
      );
    }

    // Make request to Aviation Stack API
    const response = await fetch(
      `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flight_number}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Aviation Stack API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Check if flight data was found
    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: `No flight data found for flight ${flight_number}` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Flight tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track flight. Please try again later.' },
      { status: 500 }
    );
  }
}

// Tool definition for AI frameworks (compatible with Vercel AI SDK)
export const trackFlightTool = {
  description: 'Track flight information and status in real-time',
  parameters: z.object({
    flight_number: z.string().describe('The flight number to track (IATA format, e.g., AA1234, BA456)'),
  }),
  execute: async ({ flight_number }: { flight_number: string }) => {
    try {
      const apiKey = process.env.AVIATION_STACK_API_KEY;
      
      if (!apiKey) {
        throw new Error('Aviation Stack API key not configured');
      }

      const response = await fetch(
        `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flight_number}`
      );

      if (!response.ok) {
        throw new Error(`Aviation Stack API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error(`No flight data found for flight ${flight_number}`);
      }

      return data;

    } catch (error) {
      console.error('Flight tracking error:', error);
      throw error;
    }
  },
};