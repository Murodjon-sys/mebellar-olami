export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (obj) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // Initialize global clients store
      if (!globalThis.__ORDERS_SSE_CLIENTS__) {
        globalThis.__ORDERS_SSE_CLIENTS__ = new Set();
      }

      // Create a writer-like response using TransformStream with Response below
      // We keep a minimal heartbeat to avoid timeouts on some proxies
      const interval = setInterval(() => {
        send({ type: 'heartbeat', t: Date.now() });
      }, 25000);

      // We cannot access the Response here, so we simulate a sink via proxy
      // We'll store a function that writes to this controller
      const proxy = {
        write: (chunk) => controller.enqueue(chunk instanceof Uint8Array ? chunk : encoder.encode(String(chunk))),
      };
      globalThis.__ORDERS_SSE_CLIENTS__.add(proxy);

      controller.enqueue(encoder.encode('retry: 10000\n\n'));
      send({ type: 'connected' });

      controller.close = () => {
        clearInterval(interval);
        globalThis.__ORDERS_SSE_CLIENTS__?.delete(proxy);
      };
    },
    cancel() {
      try {
        globalThis.__ORDERS_SSE_CLIENTS__?.clear?.();
      } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}


