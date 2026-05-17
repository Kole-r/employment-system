const request = require('supertest');
const secret = process.env.JWT_SECRET || 'test-secret';

jest.mock('axios');
jest.mock('../db/db', () => ({ query: jest.fn() }));
jest.mock('../util/JWT', () => {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'test-secret';
  return {
    generate: (value, expires) => jwt.sign(value, secret, { expiresIn: expires }),
    verify: (token) => {
      try { return jwt.verify(token, secret); }
      catch { return false; }
    }
  };
});

const axios = require('axios');
const app = require('../app');

describe('AI 服务健康检查', () => {
  beforeEach(() => axios.get.mockReset());

  describe('GET /api/health', () => {
    it('应该返回健康状态（无需 token）', async () => {
      axios.get.mockResolvedValue({
        data: { status: 'healthy', model_loaded: true, chroma_ready: true, document_count: 65 }
      });

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
    });
  });
});
