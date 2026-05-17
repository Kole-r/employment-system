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

describe('管理端 - 职位管理', () => {
  beforeEach(() => db.query.mockReset());

  describe('GET /adminApi/job/list', () => {
    it('应该返回职位列表', async () => {
      db.query.mockResolvedValue([[
        { id: 1, job_title: '前端开发', company_name: '测试公司', city: '北京', status: 1 },
        { id: 2, job_title: '后端开发', company_name: '另一公司', city: '上海', status: 1 }
      ]]);

      const res = await request(app).get('/adminApi/job/list').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('应该支持按城市筛选', async () => {
      db.query.mockResolvedValue([[
        { id: 1, job_title: '前端开发', city: '北京', status: 1 }
      ]]);

      const res = await request(app).get('/adminApi/job/list?city=北京').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('应该支持关键词搜索', async () => {
      db.query.mockResolvedValue([[
        { id: 1, job_title: '前端开发工程师', company_name: '测试公司' }
      ]]);

      const res = await request(app).get('/adminApi/job/list?keyword=前端').set(authHeader);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /adminApi/job/add', () => {
    it('应该成功添加职位', async () => {
      db.query.mockResolvedValue([{ insertId: 10 }]);

      const res = await request(app)
        .post('/adminApi/job/add')
        .set(authHeader)
        .send({ company_name: '测试公司', job_title: '前端开发', city: '北京', salary_min: 10000, salary_max: 20000, status: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(10);
    });

    it('应该拒绝缺少岗位名称', async () => {
      const res = await request(app)
        .post('/adminApi/job/add')
        .set(authHeader)
        .send({ company_name: '测试公司' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝缺少公司名称', async () => {
      const res = await request(app)
        .post('/adminApi/job/add')
        .set(authHeader)
        .send({ job_title: '前端开发' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /adminApi/job/update/:id', () => {
    it('应该成功更新职位', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/adminApi/job/update/1')
        .set(authHeader)
        .send({ job_title: '高级前端开发' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /adminApi/job/delete/:id', () => {
    it('应该成功删除职位', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const res = await request(app).delete('/adminApi/job/delete/1').set(authHeader);

      expect(res.status).toBe(200);
    });
  });
});
