const request = require('supertest');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'test-secret';

// Mock 必须在 require 之前
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

const db = require('../db/db');
const app = require('../app');

describe('认证模块', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  describe('POST /adminApi/user/login', () => {
    it('应该成功登录管理员', async () => {
      db.query.mockResolvedValue([[{
        id: 1, username: 'admin', password: '123456',
        role: 1, real_name: '管理员', status: 1,
        email: 'admin@test.com', avatar: null
      }]]);

      const res = await request(app)
        .post('/adminApi/user/login')
        .send({ username: 'admin', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.username).toBe('admin');
      expect(res.body.data.role).toBe(1);
      expect(res.headers.authorization).toBeDefined();
    });

    it('应该拒绝错误密码', async () => {
      // findByUsernameAndPassword 返回空（密码不匹配）
      db.query.mockResolvedValue([[]]);

      const res = await request(app)
        .post('/adminApi/user/login')
        .send({ username: 'admin', password: 'wrong' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(401);
    });

    it('应该拒绝空参数', async () => {
      const res = await request(app)
        .post('/adminApi/user/login')
        .send({ username: '', password: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /webApi/user/login', () => {
    it('应该成功登录并返回 token', async () => {
      db.query.mockResolvedValue([[{
        id: 2, username: 'zhangsan', password: '123456',
        role: 0, real_name: '张三', status: 1,
        avatar: null, major: '计算机', degree: '本科', university: '北大'
      }]]);

      const res = await request(app)
        .post('/webApi/user/login')
        .send({ username: 'zhangsan', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.username).toBe('zhangsan');
    });

    it('应该拒绝被禁用的账号', async () => {
      db.query.mockResolvedValue([[{
        id: 2, username: 'zhangsan', password: '123456',
        role: 0, status: 0
      }]]);

      const res = await request(app)
        .post('/webApi/user/login')
        .send({ username: 'zhangsan', password: '123456' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe(403);
    });
  });

  describe('POST /webApi/user/register', () => {
    it('应该成功注册新用户', async () => {
      db.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 10 }]);

      const res = await request(app)
        .post('/webApi/user/register')
        .send({ username: 'newuser', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('应该拒绝重复用户名', async () => {
      db.query.mockResolvedValue([[{ id: 1, username: 'existing' }]]);

      const res = await request(app)
        .post('/webApi/user/register')
        .send({ username: 'existing', password: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });
  });

  describe('Token 验证', () => {
    it('无 token 应该返回 401', async () => {
      const res = await request(app).get('/adminApi/user/list');
      expect(res.status).toBe(401);
    });

    it('无效 token 应该返回 401', async () => {
      const res = await request(app)
        .get('/adminApi/user/list')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('有效 token 应该通过验证', async () => {
      const validToken = jwt.sign({ id: 1, username: 'admin', role: 1 }, secret, { expiresIn: '1h' });
      db.query.mockResolvedValue([[{ id: 1, username: 'admin', role: 1 }]]);

      const res = await request(app)
        .get('/adminApi/user/list')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('白名单路由', () => {
    it('新闻列表不需要 token', async () => {
      db.query.mockResolvedValue([[{ id: 1, title: '测试新闻', status: 1 }]]);

      const res = await request(app).get('/webApi/news/list');
      expect(res.status).toBe(200);
    });

    it('职位列表不需要 token', async () => {
      db.query.mockResolvedValue([[{ id: 1, job_title: '测试职位', status: 1 }]]);

      const res = await request(app).get('/webApi/job/list');
      expect(res.status).toBe(200);
    });
  });
});
