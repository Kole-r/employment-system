const request = require('supertest');
const jwt = require('jsonwebtoken');
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
const token = jwt.sign({ id: 1, username: 'admin', role: 1 }, secret, { expiresIn: '1h' });
const authHeader = { Authorization: `Bearer ${token}` };

describe('管理端 - 新闻管理', () => {
  beforeEach(() => db.query.mockReset());

  describe('GET /adminApi/news/list', () => {
    it('应该返回新闻列表', async () => {
      db.query.mockResolvedValue([[
        { id: 1, title: '测试新闻1', category: 1, status: 1 },
        { id: 2, title: '测试新闻2', category: 2, status: 1 }
      ]]);

      const res = await request(app).get('/adminApi/news/list').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /adminApi/news/list/:id', () => {
    it('应该返回指定新闻', async () => {
      db.query.mockResolvedValue([[
        { id: 1, title: '测试新闻', content: '内容', category: 1 }
      ]]);

      const res = await request(app).get('/adminApi/news/list/1').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data[0].title).toBe('测试新闻');
    });
  });

  describe('GET /adminApi/news/category/:category', () => {
    it('应该按分类返回新闻', async () => {
      db.query.mockResolvedValue([[{ id: 1, title: '就业政策', category: 1 }]]);

      const res = await request(app).get('/adminApi/news/category/1').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /adminApi/news/add', () => {
    it('应该成功添加新闻', async () => {
      db.query.mockResolvedValue([{ insertId: 10 }]);

      const res = await request(app)
        .post('/adminApi/news/add')
        .set(authHeader)
        .field('title', '测试新闻标题测试新闻标题')
        .field('content', '这是一段足够长的新闻内容用于通过验证这是一段足够长的新闻内容')
        .field('summary', '摘要')
        .field('category', '1')
        .field('status', '1');

      expect(res.status).toBe(200);
    });

    it('应该拒绝内容过短的新闻', async () => {
      const res = await request(app)
        .post('/adminApi/news/add')
        .set(authHeader)
        .field('title', '标题')
        .field('content', '太短')
        .field('category', '1');

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /adminApi/news/update/:id', () => {
    it('应该成功更新新闻', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/adminApi/news/update/1')
        .set(authHeader)
        .send({ title: '更新后的标题' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /adminApi/news/delete/:id', () => {
    it('应该成功删除新闻', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const res = await request(app).delete('/adminApi/news/delete/1').set(authHeader);

      expect(res.status).toBe(200);
    });
  });
});
