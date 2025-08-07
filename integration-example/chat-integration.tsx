import { useChat } from '@ai-sdk/react';
import { FlightTracker } from '@/components/flight-tracker-implementation';
import { FlightLoadingState, FlightErrorState } from '@/ui-components/flight-loading-state';
import { trackFlightTool } from '@/api/flight-tracker-api';

// Example integration with AI SDK
export function ChatWithFlightTracker() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    // Include the flight tracking tool
    tools: {
      track_flight: trackFlightTool,
    },
  });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* User/Assistant message */}
            <div className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 dark:bg-blue-900 ml-8' 
                : 'bg-gray-100 dark:bg-gray-800 mr-8'
            }`}>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {message.content}
              </p>
            </div>

            {/* Tool Invocations */}
            {message.toolInvocations?.map((toolInvocation) => {
              if (toolInvocation.toolName === 'track_flight') {
                // Loading state
                if (toolInvocation.state === 'call') {
                  return (
                    <FlightLoadingState 
                      key={toolInvocation.toolCallId}
                      flightNumber={toolInvocation.args.flight_number}
                    />
                  );
                }
                
                // Error state
                if (toolInvocation.state === 'result' && toolInvocation.result.error) {
                  return (
                    <FlightErrorState 
                      key={toolInvocation.toolCallId}
                      error={toolInvocation.result.error}
                      flightNumber={toolInvocation.args.flight_number}
                    />
                  );
                }
                
                // Success state
                if (toolInvocation.state === 'result' && toolInvocation.result.data) {
                  return (
                    <div key={toolInvocation.toolCallId} className="my-4">
                      <FlightTracker data={toolInvocation.result} />
                    </div>
                  );
                }
              }
              
              return null;
            })}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
            <span>Assistant is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={input}
            placeholder="Ask me to track a flight (e.g., 'Track flight AA1234')..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// Example API route handler (app/api/chat/route.ts)
export const chatApiExample = `
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { trackFlightTool } from '@/api/flight-tracker-api';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      track_flight: trackFlightTool,
    },
    system: \`You are a helpful assistant that can track flights. When users ask about flight information, use the track_flight tool to get real-time data.\`,
  });

  return result.toDataStreamResponse();
}
`;

// Example usage patterns
export const usageExamples = {
  // User queries that would trigger flight tracking
  queries: [
    "Track flight AA1234",
    "What's the status of United flight UA456?", 
    "Is Delta 789 on time?",
    "Show me information for British Airways BA123",
    "Track my flight LH890 from Frankfurt to New York"
  ],
  
  // How the assistant would respond
  responses: [
    "I'll track flight AA1234 for you. Let me get the latest information...",
    "Let me check the current status of United flight UA456...",
    "I'll look up the status of Delta flight 789 to see if it's on time...",
    "I'll get the latest information for British Airways flight BA123...",
    "I'll track your Lufthansa flight LH890 from Frankfurt to New York..."
  ]
};