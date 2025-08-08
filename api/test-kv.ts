
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    const testKey = 'kv_connection_test';
    const testValue = `ok_${new Date().toISOString()}`;

    // Use `(kv as any)` to bypass potential TypeScript type issues.
    await (kv as any).set(testKey, testValue, { ex: 60 }); // Set with a 60-second expiration
    console.log(`Wrote test key '${testKey}' with value '${testValue}'`);

    const readValue = await (kv as any).get(testKey);
    console.log(`Read back value: '${readValue}'`);

    if (readValue === testValue) {
      // Clean up the test key
      await (kv as any).del(testKey);

      return res.status(200).json({
        success: true,
        message: "✅ Connection to Vercel KV is working perfectly!",
        details: "A test key was successfully written, read, and deleted from your database."
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "❌ Connection established, but data mismatch.",
        details: `Wrote '${testValue}' but read back '${readValue}'. This could indicate a caching issue or a problem with the KV store.`,
      });
    }

  } catch (error: any) {
    console.error("Vercel KV connection test failed:", error);
    return res.status(500).json({
        success: false,
        message: "❌ Failed to connect to Vercel KV.",
        details: "The application could not perform a write/read operation on the database. Please check your Vercel project's Storage tab to ensure the KV store is correctly linked.",
        error: error.message
    });
  }
}
