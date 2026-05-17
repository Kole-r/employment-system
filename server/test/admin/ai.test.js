const request = require('supertest');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'test-secret';

jest.mock('axios');
jest.mock('../../db/db', () => ({ query: jest.fn() }));
jest.mock('../../util/JWT', () => {
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
const db = require('../../db/db');
const app = require('../../app');
const token = jwt.sign({ id: 1, username: 'admin', role: 1 }, secret, { expiresIn: '1h' });
const authHeader = { Authorization: `Bearer ${token}` };

describe('管理端 - AI 写作助手', () => {
  beforeEach(() => {
    db.query.mockReset();
    axios.post.mockReset();
  });

  describe('POST /adminApi/ai/chat', () => {
    it('应该返回 AI 生成的内容', async () => {
      axios.post.mockResolvedValue({
        data: { content: [{ type: 'text', text: 'AI 生成的新闻标题建议' }] }
      });

      const res = await request(app)
        .post('/adminApi/ai/chat')
        .set(authHeader)
        .send({ prompt: '帮我写新闻标题', type: 'news_topic' });

      expect(res.status).toBe(200);
      expect(res.body.data.answer).toBe('AI 生成的新闻标题建议');
    });

    it('应该拒绝空 prompt', async () => {
      const res = await request(app)
        .post('/adminApi/ai/chat')
        .set(authHeader)
        .send({ prompt: '', type: 'general' });

      expect(res.status).toBe(400);
    });

    it('应该处理 AI 服务错误', async () => {
      axios.post.mockRejectedValue(new Error('Service unavailable'));

      const res = await request(app)
        .post('/adminApi/ai/chat')
        .set(authHeader)
        .send({ prompt: '测试', type: 'general' });

      expect(res.status).toBe(500);
    });
  });
});
