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

describe('管理端 - 用户管理', () => {
  beforeEach(() => db.query.mockReset());

  describe('GET /adminApi/user/list', () => {
    it('应该返回用户列表', async () => {
      db.query.mockResolvedValue([[
        { id: 1, username: 'admin', role: 1, real_name: '管理员', status: 1 },
        { id: 2, username: 'zhangsan', role: 0, real_name: '张三', status: 1 }
      ]]);

      const res = await request(app).get('/adminApi/user/list').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].username).toBe('admin');
    });
  });

  describe('GET /adminApi/user/list/:id', () => {
    it('应该返回指定用户', async () => {
      db.query.mockResolvedValue([[
        { id: 1, username: 'admin', role: 1, real_name: '管理员', status: 1 }
      ]]);

      const res = await request(app).get('/adminApi/user/list/1').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data[0].username).toBe('admin');
    });
  });

  describe('POST /adminApi/user/add', () => {
    it('应该成功添加用户', async () => {
      db.query.mockResolvedValue([{ insertId: 10 }]);

      const res = await request(app)
        .post('/adminApi/user/add')
        .set(authHeader)
        .send({ username: 'newuser', password: '123456', role: 0, real_name: '新用户' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });

    it('应该拒绝用户名过短', async () => {
      const res = await request(app)
        .post('/adminApi/user/add')
        .set(authHeader)
        .send({ username: 'ab', password: '123456' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝密码过短', async () => {
      const res = await request(app)
        .post('/adminApi/user/add')
        .set(authHeader)
        .send({ username: 'newuser', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /adminApi/user/list/:id', () => {
    it('应该成功更新用户', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/adminApi/user/list/1')
        .set(authHeader)
        .send({ username: 'admin', real_name: '更新后的管理员' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /adminApi/user/delete/:id', () => {
    it('应该成功删除用户', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const res = await request(app).delete('/adminApi/user/delete/2').set(authHeader);

      expect(res.status).toBe(200);
    });
  });
});
