const JobModel = require('../../models/JobModel');
const BehaviorModel = require('../../models/BehaviorModel');
const syncUserPreferences = require('../../services/web/syncPreferences');

const JobController = {
  // 获取招聘中的岗位列表
  getList: async (req, res) => {
    try {
      const filters = {
        city: req.query.city,
        job_type: req.query.job_type,
        keyword: req.query.keyword,
        status: 1,
        limit: req.query.limit,
      };
      const jobs = await JobModel.findAll(filters);
      res.status(200).json({ code: 200, data: jobs });
    } catch (error) {
      console.error('获取岗位列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },

  // 获取岗位详情
  getDetail: async (req, res) => {
    try {
      const job = await JobModel.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ code: 404, message: '岗位不存在' });
      }

      // 记录用户行为并同步偏好
      const userId = req.user?.id;
      if (userId) {
        await BehaviorModel.create(userId, 'job', req.params.id, 'view');
        await syncUserPreferences(userId, job.city, job.job_type);
      }

      res.status(200).json({ code: 200, data: job });
    } catch (error) {
      console.error('获取岗位详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = JobController;
