const express = require('express');
const router = express.Router();
const axios = require('axios');

// Python AI服务地址
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// 聊天接口 - 流式转发到Python AI服务
router.post('/chat/stream', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '请输入您的问题'
      });
    }

    console.log(`收到用户问题(流式): ${question}`);

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // 转发到Python AI服务的流式接口
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat/stream`, {
      question: question,
    }, {
      timeout: 120000,
      responseType: 'stream',
    });

    // 直接管道转发SSE流
    response.data.pipe(res);

    response.data.on('error', (err) => {
      console.error('流转发错误:', err.message);
      res.end();
    });

  } catch (error) {
    console.error('聊天接口错误:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI服务未启动，请稍后再试'
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI服务异常，请稍后再试'
    });
  }
});

// 聊天接口 - 非流式（兼容旧版本）
router.post('/chat', async (req, res) => {
  try {
    const { question, history } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '请输入您的问题'
      });
    }

    console.log(`收到用户问题: ${question}`);

    // 转发到Python AI服务
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat`, {
      question: question,
      history: history || []
    }, {
      timeout: 60000 // 60秒超时
    });

    console.log(`AI回答: ${response.data.answer.substring(0, 100)}...`);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('聊天接口错误:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI服务未启动，请稍后再试'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'AI服务响应超时，请稍后再试'
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI服务异常，请稍后再试'
    });
  }
});

// 同步文档到向量库接口
router.post('/embed', async (req, res) => {
  try {
    const { doc_type, doc_id, content, metadata } = req.body;
    
    if (!doc_type || !doc_id || !content) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }
    
    console.log(`同步文档到向量库: ${doc_type}_${doc_id}`);
    
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/embed`, {
      doc_type,
      doc_id,
      content,
      metadata
    }, {
      timeout: 30000
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('同步文档错误:', error.message);
    res.status(500).json({
      success: false,
      message: '同步文档失败'
    });
  }
});

// 删除文档接口
router.delete('/document/:docType/:docId', async (req, res) => {
  try {
    const { docType, docId } = req.params;
    
    console.log(`从向量库删除文档: ${docType}_${docId}`);
    
    const response = await axios.delete(`${AI_SERVICE_URL}/api/ai/document/${docType}/${docId}`, {
      timeout: 30000
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('删除文档错误:', error.message);
    res.status(500).json({
      success: false,
      message: '删除文档失败'
    });
  }
});

// 更新文档接口
router.put('/document/:docType/:docId', async (req, res) => {
  try {
    const { docType, docId } = req.params;
    const { content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '内容不能为空'
      });
    }
    
    console.log(`更新向量库文档: ${docType}_${docId}`);
    
    const response = await axios.put(`${AI_SERVICE_URL}/api/ai/document/${docType}/${docId}`, {
      content,
      metadata
    }, {
      timeout: 30000
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('更新文档错误:', error.message);
    res.status(500).json({
      success: false,
      message: '更新文档失败'
    });
  }
});

// 健康检查接口
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      ai_service: response.data
    });
  } catch (error) {
    res.json({
      success: false,
      ai_service: {
        status: 'unavailable',
        error: error.message
      }
    });
  }
});

module.exports = router;
