const request = require('supertest');
const secret = process.env.JWT_SECRET || 'test-secret';

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

const db = require('../../db/db');
const app = require('../../app');

describe('客户端 - 新闻模块', () => {
  beforeEach(() => db.query.mockReset());

  describe('GET /webApi/news/list', () => {
    it('应该返回已发布新闻列表（无需 token）', async () => {
      db.query.mockResolvedValue([[
        { id: 1, title: '新闻1', status: 1, summary: '摘要1' },
        { id: 2, title: '新闻2', status: 1, summary: '摘要2' }
      ]]);

      const res = await request(app).get('/webApi/news/list');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('应该支持 limit 参数', async () => {
      db.query.mockResolvedValue([[{ id: 1, title: '新闻1', status: 1 }]]);

      const res = await request(app).get('/webApi/news/list?limit=1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /webApi/news/detail/:id', () => {
    it('应该返回新闻详情', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1, title: '测试新闻', content: '详细内容', views: 10, status: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).get('/webApi/news/detail/1');

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('测试新闻');
    });

    it('不存在的新闻应返回 404', async () => {
      db.query.mockResolvedValue([[]]);

      const res = await request(app).get('/webApi/news/detail/999');

      expect(res.status).toBe(404);
    });
  });
});
