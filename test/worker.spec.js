import { createExecutionContext } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src/worker.ts';

describe('Conversion.Business Edge Firewall', () => {
  
  // Create a mock environment with fake API keys
  const mockEnv = {
    CB_SECRET_KEY: 'test_secret_key'
  };

  it('allows GET requests to pass through untouched', async () => {
    const request = new Request('https://api.customer.com/checkout', { method: 'GET' });
    const ctx = createExecutionContext();
    
    // We mock the origin server response
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));

    const response = await worker.fetch(request, mockEnv, ctx);
    
    expect(response.status).toBe(200);
  });

  it('blocks POST requests that lack the X-CB-Token header', async () => {
    const request = new Request('https://api.customer.com/checkout', { 
      method: 'POST',
      body: JSON.stringify({ item: 'shoes' })
    });
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, mockEnv, ctx);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.error).toBe("Missing CAPTCHA validation token.");
  });

  it('blocks POST requests with an invalid/bot token', async () => {
    // Mock the Conversion.Business backend to reject the fake token
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false }))
    );

    const request = new Request('https://api.customer.com/checkout', { 
      method: 'POST',
      headers: { 'X-CB-Token': 'fake_bot_token' }
    });
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, mockEnv, ctx);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.error).toBe("CAPTCHA verification failed. Bot detected.");
  });

  it('allows POST requests with a valid token and strips the header', async () => {
    // Mock the CB backend to approve the token, then mock the origin server to succeed
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }))) // CB API Mock
      .mockResolvedValueOnce(new Response("Origin Success", { status: 200 })); // Origin Mock
      
    globalThis.fetch = fetchMock;

    const request = new Request('https://api.customer.com/checkout', { 
      method: 'POST',
      headers: { 'X-CB-Token': 'real_human_token' },
      body: JSON.stringify({ item: 'shoes' })
    });
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, mockEnv, ctx);
    
    expect(response.status).toBe(200);
    
    // Verify that the second fetch (to the origin server) removed the CAPTCHA header
    const originRequest = fetchMock.mock.calls[1][0];
    expect(originRequest.headers.has('X-CB-Token')).toBe(false);
  });
});
