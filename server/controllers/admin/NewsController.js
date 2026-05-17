const NewsService = require('../../services/admin/NewsService');
const NewsModel = require('../../models/NewsModel');
const JWT = require('../../util/JWT');
const { embedNews, deleteDocument } = require('../../util/syncToAI');

const NewsController = {
  // 获取新闻列表或单个新闻
  getNews: async (req, res) => {
    try {
      const newsId = req.params.id;
      const result = await NewsService.getNews(newsId);

      const newsList = Array.isArray(result) ? result : (result ? [result] : []);

      // 映射字段：数据库字段 → 前端期望字段
      const mappedList = newsList.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        summary: item.summary,
        category: item.category,
        cover: item.cover,
        tags: item.tags,
        views: item.views,
        isPublish: item.status,
        editTime: item.updated_at,
        userId: item.publisher_id,
        created_at: item.created_at,
      }));

      res.status(200).json({
        code: 200,
        message: '新闻列表获取成功',
        data: mappedList
      });
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: error.message
      });
    }
  },

  // 按分类获取新闻
  getNewsByCategory: async (req, res) => {
    try {
      const category = req.params.category;
      if (!category) {
        return res.status(400).json({
          code: 400,
          message: '请指定新闻分类'
        });
      }

      const result = await NewsService.getNewsByCategory(category);
      res.status(200).json({
        code: 200,
        message: '分类新闻获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取分类新闻失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 添加新闻
  addNews: async (req, res) => {
    try {
      const { title, content, summary, category, tags, isPublish } = req.body;
      const cover = req.file ? `/newsuploads/${req.file.filename}` : null;

      // 获取当前用户 ID
      const token = req.headers['authorization']?.split(' ')[1];
      const payload = JWT.verify(token);
      const publisher_id = payload.id;

      // 参数验证
      if (!title || title.length < 5 || title.length > 100) {
        return res.status(400).json({
          code: 400,
          message: '新闻标题长度必须在 5 - 100 之间'
        });
      }
      if (!content || content.length < 20) {
        return res.status(400).json({
          code: 400,
          message: '新闻内容长度必须至少 20 字'
        });
      }
      if (!category) {
        return res.status(400).json({
          code: 400,
          message: '请选择新闻分类'
        });
      }

      // 调用 Service 层添加新闻
      const newsData = {
        title,
        content,
        summary: summary || null,
        category: Number(category),
        cover,
        tags: tags || null,
        status: Number(isPublish) || 0,
        publisher_id
      };

      const newsId = await NewsService.addNews(newsData);
      // 同步到 ChromaDB 向量数据库
      embedNews({ ...newsData, id: newsId });

      res.status(200).json({
        code: 200,
        message: '新闻添加成功',
        data: { id: newsId }
      });
    } catch (error) {
      console.error('添加新闻失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 更新新闻
  updateNews: async (req, res) => {
    try {
      const newsId = req.params.id;
      const { title, content, summary, category, tags, isPublish } = req.body;
      const cover = req.file ? `/newsuploads/${req.file.filename}` : null;

      // 参数验证
      if (!newsId) {
        return res.status(400).json({
          code: 400,
          message: '请指定要更新的新闻 ID'
        });
      }

      if (title && (title.length < 5 || title.length > 100)) {
        return res.status(400).json({
          code: 400,
          message: '新闻标题长度必须在 5 - 100 之间'
        });
      }

      if (content && content.length < 20) {
        return res.status(400).json({
          code: 400,
          message: '新闻内容长度必须至少 20 字'
        });
      }

      // 构建更新数据对象
      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (summary !== undefined) updateData.summary = summary;
      if (category) updateData.category = Number(category);
      if (tags !== undefined) updateData.tags = tags;
      if (isPublish !== undefined) updateData.status = Number(isPublish);
      if (cover) updateData.cover = cover;

      // 调用 Service 层更新新闻
      await NewsService.updateNews(newsId, updateData);
      // 获取更新后的完整数据，同步到 ChromaDB
      const updatedNews = await NewsModel.findById(newsId);
      if (updatedNews) embedNews(updatedNews);

      res.status(200).json({
        code: 200,
        message: '新闻更新成功'
      });
    } catch (error) {
      console.error('更新新闻失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 删除新闻
  deleteNews: async (req, res) => {
    try {
      const newsId = req.params.id;
      if (!newsId) {
        return res.status(400).json({
          code: 400,
          message: '请指定要删除的新闻 ID'
        });
      }

      await NewsService.deleteNews(newsId);
      // 从 ChromaDB 删除对应文档
      deleteDocument('news', newsId);
      res.status(200).json({
        code: 200,
        message: '新闻删除成功'
      });
    } catch (error) {
      console.error('删除新闻失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  }
};

module.exports = NewsController;
