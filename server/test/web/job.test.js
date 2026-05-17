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
const token = jwt.sign({ id: 2, username: 'zhangsan', role: 0 }, secret, { expiresIn: '7d' });
const authHeader = { Authorization: `Bearer ${token}` };

describe('客户端 - 职位模块', () => {
  beforeEach(() => db.query.mockReset());

  describe('GET /webApi/job/list', () => {
    it('应该返回职位列表（无需 token）', async () => {
      db.query.mockResolvedValue([[
        { id: 1, job_title: '前端开发', company_name: '公司A', city: '北京', status: 1 },
        { id: 2, job_title: '后端开发', company_name: '公司B', city: '上海', status: 1 }
      ]]);

      const res = await request(app).get('/webApi/job/list');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('应该支持按城市筛选', async () => {
      db.query.mockResolvedValue([[{ id: 1, job_title: '前端开发', city: '北京', status: 1 }]]);

      const res = await request(app).get('/webApi/job/list?city=北京');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('应该支持关键词搜索', async () => {
      db.query.mockResolvedValue([[{ id: 1, job_title: '前端开发工程师', company_name: '测试公司' }]]);

      const res = await request(app).get('/webApi/job/list?keyword=前端');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /webApi/job/detail/:id', () => {
    it('应该返回职位详情', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1, job_title: '前端开发', company_name: '测试公司', salary_min: 10000 }]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app).get('/webApi/job/detail/1');

      expect(res.status).toBe(200);
      expect(res.body.data.job_title).toBe('前端开发');
    });
  });

  describe('GET /webApi/job/recommend', () => {
    it('应该返回推荐职位', async () => {
      db.query
        .mockResolvedValueOnce([[{ major: '计算机', degree: '本科', city_preference: '北京', job_preference: '技术' }]]) // user profile
        .mockResolvedValueOnce([[{ target_id: 1, behavior: 'view', duration: 10 }]]) // behaviors
        .mockResolvedValueOnce([[{ city: '北京', job_type: '技术', tags: '前端' }]]) // viewed jobs
        .mockResolvedValueOnce([[ // candidates
          { id: 2, job_title: '后端开发', company_name: '公司B', city: '上海', job_type: '技术', status: 1, tags: null, degree_required: '本科' }
        ]]);

      const res = await request(app).get('/webApi/job/recommend').set(authHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('未登录应返回 401', async () => {
      const res = await request(app).get('/webApi/job/recommend');
      expect(res.status).toBe(401);
    });
  });
});
