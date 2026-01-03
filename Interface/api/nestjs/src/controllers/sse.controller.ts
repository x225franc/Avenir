import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('sse')
export class SseController {
  /**
   * SSE endpoint for real-time updates
   * Clients can connect to this endpoint to receive server-sent events
   */
  @Sse('stream')
  sendEvents(): Observable<MessageEvent> {
    // Send a heartbeat every 30 seconds to keep connection alive
    return interval(30000).pipe(
      map(() => ({
        data: { type: 'heartbeat', timestamp: new Date().toISOString() },
      })),
    );
  }

  /**
   * Get SSE status
   */
  @Get('status')
  getStatus() {
    return {
      message: 'SSE endpoint is active',
      endpoint: '/sse/stream',
      status: 'operational',
    };
  }
}
