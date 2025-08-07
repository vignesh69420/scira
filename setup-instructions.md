# Flight Tracker Feature - Setup Instructions

## Overview
The Flight Tracker feature (originally called "lookout" feature) provides real-time flight information with a beautiful, responsive UI. It uses the Aviation Stack API to fetch flight data and displays it with animated progress tracking.

## Prerequisites

### 1. API Key Setup
- Sign up for an account at [Aviation Stack](https://aviationstack.com/)
- Get your API key from the dashboard
- Add it to your environment variables:

```bash
# .env.local
AVIATION_STACK_API_KEY=your_api_key_here
```

### 2. Required Dependencies
Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@ai-sdk/react": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.400.0",
    "zod": "^3.22.0"
  }
}
```

Install them:
```bash
npm install @ai-sdk/react @radix-ui/react-dialog framer-motion lucide-react zod
# or
yarn add @ai-sdk/react @radix-ui/react-dialog framer-motion lucide-react zod
# or
pnpm add @ai-sdk/react @radix-ui/react-dialog framer-motion lucide-react zod
```

## File Structure

```
your-project/
├── components/
│   ├── ui/
│   │   ├── card.tsx           # Basic card component
│   │   └── badge.tsx          # Badge component for status
│   ├── flight-tracker.tsx     # Main flight tracker component
│   └── flight-loading-state.tsx # Loading and error states
├── app/
│   └── api/
│       ├── flight/
│       │   └── route.ts       # API route for flight tracking
│       └── chat/
│           └── route.ts       # Chat API with flight tool integration
└── lib/
    └── flight-utils.ts        # Utility functions
```

## Implementation Steps

### Step 1: Create Base UI Components

First, ensure you have the basic UI components. If using shadcn/ui:

```bash
npx shadcn-ui@latest add card badge
```

### Step 2: Add the Flight Tracker Component

Copy the `FlightTracker` component from `/components/flight-tracker-implementation.tsx` to your project:

```tsx
// components/flight-tracker.tsx
// Copy the entire FlightTracker component code here
```

### Step 3: Add Loading and Error States

Copy the loading components from `/ui-components/flight-loading-state.tsx`:

```tsx
// components/flight-loading-state.tsx
// Copy FlightLoadingState and FlightErrorState components
```

### Step 4: Create the API Route

Create the flight tracking API route:

```tsx
// app/api/flight/route.ts
// Copy the API implementation from /api/flight-tracker-api.ts
```

### Step 5: Integrate with Your Chat System

#### For AI SDK Integration:

```tsx
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { trackFlightTool } from '@/api/flight-tracker-api';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      track_flight: trackFlightTool,
    },
    system: `You are a helpful assistant that can track flights. When users ask about flight information, use the track_flight tool to get real-time data.`,
  });

  return result.toDataStreamResponse();
}
```

#### For Custom Integration:

```tsx
// In your chat component
const handleFlightTracking = async (flightNumber: string) => {
  try {
    const response = await fetch('/api/flight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flight_number: flightNumber }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Flight tracking error:', error);
    throw error;
  }
};
```

### Step 6: Add to Your Chat Interface

Update your chat component to handle flight tracking:

```tsx
// components/chat.tsx
import { FlightTracker } from '@/components/flight-tracker';
import { FlightLoadingState, FlightErrorState } from '@/components/flight-loading-state';

// In your message rendering logic:
{toolInvocation.toolName === 'track_flight' && (
  <>
    {toolInvocation.state === 'call' && (
      <FlightLoadingState flightNumber={toolInvocation.args.flight_number} />
    )}
    {toolInvocation.state === 'result' && toolInvocation.result.error && (
      <FlightErrorState 
        error={toolInvocation.result.error}
        flightNumber={toolInvocation.args.flight_number}
      />
    )}
    {toolInvocation.state === 'result' && toolInvocation.result.data && (
      <FlightTracker data={toolInvocation.result} />
    )}
  </>
)}
```

## Styling Requirements

The components use Tailwind CSS. Ensure you have these configurations:

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

## Usage Examples

Users can trigger flight tracking with natural language:

- "Track flight AA1234"
- "What's the status of United flight UA456?"
- "Is Delta 789 on time?"
- "Show me information for British Airways BA123"
- "Track my flight LH890 from Frankfurt to New York"

## Features Included

✅ **Real-time Flight Data**: Live flight status, delays, gates, terminals  
✅ **Responsive Design**: Works on mobile and desktop  
✅ **Animated Progress**: Visual flight progress with animated plane icon  
✅ **Status Indicators**: Color-coded status badges (On Time, Delayed, Landed, etc.)  
✅ **Error Handling**: Graceful error messages for invalid flights  
✅ **Loading States**: Smooth loading animations  
✅ **Dark Mode Support**: Full dark/light theme compatibility  
✅ **Airport Information**: Departure/arrival airports with IATA codes  
✅ **Flight Duration**: Calculated flight duration display  
✅ **Last Updated**: Timestamp showing when data was last refreshed  

## API Response Format

The Aviation Stack API returns data in this format:

```typescript
interface FlightApiResponse {
  data: Array<{
    flight_date: string;
    flight_status: string; // 'scheduled', 'active', 'landed', etc.
    departure: {
      airport: string;
      timezone: string;
      iata: string;        // Airport code (e.g., 'JFK')
      terminal: string | null;
      gate: string | null;
      delay: number | null;
      scheduled: string;   // ISO timestamp
    };
    arrival: {
      airport: string;
      timezone: string;
      iata: string;
      terminal: string | null;
      gate: string | null;
      delay: number | null;
      scheduled: string;
    };
    airline: {
      name: string;        // e.g., 'American Airlines'
      iata: string;        // e.g., 'AA'
    };
    flight: {
      number: string;
      iata: string;        // e.g., 'AA1234'
      duration: number | null;
    };
  }>;
}
```

## Troubleshooting

### Common Issues:

1. **API Key Not Working**: Ensure your Aviation Stack API key is valid and has sufficient quota
2. **Flight Not Found**: Some flights may not be available in the Aviation Stack database
3. **CORS Issues**: Make sure API calls are made from server-side (API routes)
4. **Styling Issues**: Ensure Tailwind CSS is properly configured

### Debug Mode:

Add debug logging to troubleshoot issues:

```tsx
// In your API route
console.log('Flight tracking request:', { flight_number });
console.log('Aviation Stack response:', data);
```

## Rate Limits

Aviation Stack has rate limits depending on your plan:
- Free Plan: 1,000 requests/month
- Basic Plan: 10,000 requests/month
- Professional Plan: 100,000 requests/month

Implement caching to reduce API calls:

```tsx
// Simple in-memory cache (consider Redis for production)
const flightCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In your API route
const cacheKey = `flight_${flight_number}`;
const cached = flightCache.get(cacheKey);

if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return NextResponse.json(cached.data);
}
```

## Security Considerations

- ✅ API key stored in environment variables
- ✅ Input validation with Zod schemas
- ✅ Error handling to prevent information leakage
- ✅ Rate limiting on API endpoints (recommended)

## Next Steps

1. **Enhanced Features**: Add flight history, flight path maps, price tracking
2. **Real-time Updates**: Implement WebSocket connections for live updates  
3. **Push Notifications**: Alert users about flight status changes
4. **Multi-language Support**: Internationalize the component
5. **Accessibility**: Add ARIA labels and keyboard navigation