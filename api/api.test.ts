import { vi, describe, it, expect, beforeEach } from 'vitest';

// Provide a factory to vi.mock to ensure the original module is never imported.
vi.mock('@vercel/kv', () => {
  return {
    kv: {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    },
  };
});

// Now that the mock is in place, we can import from the mocked module.
import { kv } from '@vercel/kv';
import getDataHandler from './getData';
import saveDataHandler from './savedata';
import resetDataHandler from './resetData';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { presetData } from '../data/presetSchedule';

// Helper function to create mock Vercel request/response objects for testing.
const createMockRequest = (body: any = null, method: string = 'GET'): VercelRequest => {
  return {
    body,
    method,
    query: {},
    cookies: {},
    headers: {},
  } as unknown as VercelRequest;
};

const createMockResponse = (): VercelResponse => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as VercelResponse;
};

describe('API Endpoints', () => {

  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation.
    vi.mocked(kv.get).mockReset();
    vi.mocked(kv.set).mockReset();
    vi.mocked(kv.del).mockReset();
  });

  describe('GET /api/getData', () => {
    it('should return existing data if found', async () => {
      const mockData = { leagues: { 'test-league': {} } };
      vi.mocked(kv.get).mockResolvedValue(mockData);

      const req = createMockRequest();
      const res = createMockResponse();

      await getDataHandler(req, res);

      expect(vi.mocked(kv.get)).toHaveBeenCalledWith('discoveryLeagueData');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
      expect(vi.mocked(kv.set)).not.toHaveBeenCalled();
    });

    it('should seed data if no data or flag exists (first run)', async () => {
      vi.mocked(kv.get).mockResolvedValue(null);

      const req = createMockRequest();
      const res = createMockResponse();

      await getDataHandler(req, res);

      expect(vi.mocked(kv.get)).toHaveBeenCalledWith('discoveryLeagueData');
      expect(vi.mocked(kv.get)).toHaveBeenCalledWith('db_initialized_flag');

      expect(vi.mocked(kv.set)).toHaveBeenCalledWith('discoveryLeagueData', expect.any(Object));
      expect(vi.mocked(kv.set)).toHaveBeenCalledWith('db_initialized_flag', 'true');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        leagues: { 'summer-league-preset-2025': presetData.config }
      }));
    });

    it('should return a critical error if data is missing but flag exists', async () => {
      vi.mocked(kv.get).mockImplementation(async (key: string) => {
        if (key === 'discoveryLeagueData') return null;
        if (key === 'db_initialized_flag') return 'true';
        return null;
      });

      const req = createMockRequest();
      const res = createMockResponse();

      await getDataHandler(req, res);

      expect(vi.mocked(kv.set)).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        upcomingEvent: expect.objectContaining({ title: 'Critical Error' })
      }));
    });

    it('should return a fallback error if the KV store throws an error', async () => {
        vi.mocked(kv.get).mockRejectedValue(new Error('KV Store unavailable'));

        const req = createMockRequest();
        const res = createMockResponse();

        await getDataHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            upcomingEvent: expect.objectContaining({ title: 'Error Loading Data' })
        }));
    });
  });

  describe('POST /api/saveData', () => {
    it('should save valid data and return success', async () => {
      const appDataToSave = { leagues: { 'new-league': {} } };
      const req = createMockRequest(appDataToSave, 'POST');
      const res = createMockResponse();

      await saveDataHandler(req, res);

      expect(vi.mocked(kv.set)).toHaveBeenCalledWith('discoveryLeagueData', appDataToSave);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should reject requests with the wrong method', async () => {
      const req = createMockRequest({}, 'GET');
      const res = createMockResponse();

      await saveDataHandler(req, res);

      expect(vi.mocked(kv.set)).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(405);
    });

    it('should reject requests with invalid data format', async () => {
      const req = createMockRequest({ some: 'invalid data' }, 'POST'); // Missing 'leagues'
      const res = createMockResponse();

      await saveDataHandler(req, res);

      expect(vi.mocked(kv.set)).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid appData format received.' });
    });
  });

  describe('POST /api/resetData', () => {
    it('should delete both data and flag keys on reset', async () => {
      const req = createMockRequest(null, 'POST');
      const res = createMockResponse();

      await resetDataHandler(req, res);

      expect(vi.mocked(kv.del)).toHaveBeenCalledWith('discoveryLeagueData', 'db_initialized_flag');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Data reset successfully.' });
    });

    it('should reject requests with the wrong method', async () => {
      const req = createMockRequest(null, 'GET');
      const res = createMockResponse();

      await resetDataHandler(req, res);

      expect(vi.mocked(kv.del)).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});
