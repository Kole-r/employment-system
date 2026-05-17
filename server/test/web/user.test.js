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

describe('客户端 - 用户模块', () => {
  beforeEach(() => db.query.mockReset());

  describe('GET /webApi/user/profile', () => {
    it('应该返回用户资料', async () => {
      db.query.mockResolvedValue([[{
        id: 2, username: 'zhangsan', role: 0,
        real_name: '张三', avatar: null,
        major: '计算机', degree: '本科', university: '北大'
      }]]);

      const res = await request(app).get('/webApi/user/profile').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('zhangsan');
    });
  });

  describe('GET /webApi/user/favorites', () => {
    it('应该返回收藏列表', async () => {
      db.query
        .mockResolvedValueOnce([[
          { id: 1, user_id: 2, target_type: 'job', target_id: 1 }
        ]])
        .mockResolvedValueOnce([[
          { id: 1, job_title: '前端开发', company_name: '测试公司' }
        ]]);

      const res = await request(app).get('/webApi/user/favorites').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
    });
  });

  describe('GET /webApi/user/favorite/check', () => {
    it('应该返回收藏状态', async () => {
      db.query.mockResolvedValue([[{ id: 1 }]]);

      const res = await request(app)
        .get('/webApi/user/favorite/check?target_type=job&target_id=1')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.favorited).toBe(true);
    });

    it('未收藏应返回 false', async () => {
      db.query.mockResolvedValue([[]]);

      const res = await request(app)
        .get('/webApi/user/favorite/check?target_type=job&target_id=999')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.favorited).toBe(false);
    });
  });

  describe('POST /webApi/user/favorite', () => {
    it('应该成功添加收藏', async () => {
      db.query
        .mockResolvedValueOnce([[]])  // isFavorited
        .mockResolvedValueOnce([{ insertId: 1 }])  // FavoriteModel.create
        .mockResolvedValueOnce([{ insertId: 1 }])  // BehaviorModel.create
        .mockResolvedValueOnce([[{ id: 1, city: '北京', job_type: '技术' }]])  // JobModel.findById
        .mockResolvedValueOnce([[{ city_preference: '北京,上海' }]])  // syncPreferences: city
        .mockResolvedValueOnce([[{ job_preference: '技术' }]]);  // syncPreferences: job_type

      const res = await request(app)
        .post('/webApi/user/favorite')
        .set(authHeader)
        .send({ target_type: 'job', target_id: 1 });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('收藏');
    });

    it('应该取消已收藏的项目', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/webApi/user/favorite')
        .set(authHeader)
        .send({ target_type: 'job', target_id: 1 });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('取消');
    });
  });
});
