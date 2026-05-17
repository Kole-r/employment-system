const JobService = require('../../services/admin/JobService');
const JobModel = require('../../models/JobModel');
const { embedJob, deleteDocument } = require('../../util/syncToAI');

const JobController = {
  // 获取岗位列表或单个岗位
  getJobs: async (req, res) => {
    try {
      const jobId = req.params.id;
      const filters = {
        city: req.query.city,
        job_type: req.query.job_type,
        keyword: req.query.keyword,
        status: req.query.status,
        limit: req.query.limit,
      };
      const result = await JobService.getJobs(jobId, filters);
      const jobList = Array.isArray(result) ? result : (result ? [result] : []);

      res.status(200).json({
        code: 200,
        message: '岗位列表获取成功',
        data: jobList
      });
    } catch (error) {
      console.error('获取岗位列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: error.message
      });
    }
  },

  // 添加岗位
  addJob: async (req, res) => {
    try {
      const jobData = req.body;

      if (!jobData.job_title) {
        return res.status(400).json({ code: 400, message: '请填写岗位名称' });
      }
      if (!jobData.company_name) {
        return res.status(400).json({ code: 400, message: '请填写公司名称' });
      }

      const jobId = await JobService.addJob(jobData);
      // 同步到 ChromaDB 向量数据库
      embedJob({ ...jobData, id: jobId });
      res.status(200).json({
        code: 200,
        message: '岗位添加成功',
        data: { id: jobId }
      });
    } catch (error) {
      console.error('添加岗位失败:', error);
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },

  // 更新岗位
  updateJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      if (!jobId) {
        return res.status(400).json({ code: 400, message: '请指定要更新的岗位 ID' });
      }

      await JobService.updateJob(jobId, req.body);
      // 获取更新后的完整数据，同步到 ChromaDB
      const updatedJob = await JobModel.findById(jobId);
      if (updatedJob) embedJob(updatedJob);
      res.status(200).json({ code: 200, message: '岗位更新成功' });
    } catch (error) {
      console.error('更新岗位失败:', error);
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },

  // 删除岗位
  deleteJob: async (req, res) => {
    try {
      const jobId = req.params.id;
      if (!jobId) {
        return res.status(400).json({ code: 400, message: '请指定要删除的岗位 ID' });
      }

      await JobService.deleteJob(jobId);
      // 从 ChromaDB 删除对应文档
      deleteDocument('job', jobId);
      res.status(200).json({ code: 200, message: '岗位删除成功' });
    } catch (error) {
      console.error('删除岗位失败:', error);
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = JobController;
