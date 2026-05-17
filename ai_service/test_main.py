import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_root(self):
        res = client.get('/')
        assert res.status_code == 200
        assert 'message' in res.json()

    def test_health(self):
        res = client.get('/health')
        assert res.status_code == 200
        data = res.json()
        assert data['status'] == 'healthy'
        assert 'model_loaded' in data
        assert 'chroma_ready' in data
        assert 'document_count' in data


class TestEmbedEndpoint:
    def test_embed_document(self, mock_model_and_chroma):
        mock_collection = mock_model_and_chroma['collection']
        res = client.post('/api/ai/embed', json={
            'doc_type': 'job',
            'doc_id': 1,
            'content': '前端工程师岗位描述',
            'metadata': {'company': '字节跳动'},
        })
        assert res.status_code == 200
        data = res.json()
        assert data['success'] is True
        assert 'job_1' in data['message']
        mock_collection.add.assert_called_once()

    def test_embed_without_metadata(self, mock_model_and_chroma):
        res = client.post('/api/ai/embed', json={
            'doc_type': 'news',
            'doc_id': 5,
            'content': '就业政策新闻',
        })
        assert res.status_code == 200
        assert res.json()['success'] is True

    def test_embed_missing_fields(self):
        res = client.post('/api/ai/embed', json={
            'doc_type': 'job',
        })
        assert res.status_code == 422


class TestChatEndpoint:
    def test_chat_with_context(self, mock_model_and_chroma):
        mock_tokenizer = mock_model_and_chroma['tokenizer']
        mock_model = mock_model_and_chroma['model']

        # Mock generate output
        mock_output = MagicMock()
        mock_output.__getitem__ = lambda self, key: MagicMock()
        mock_model.generate.return_value = [MagicMock()]

        res = client.post('/api/ai/chat', json={
            'question': '有哪些前端岗位？',
        })
        assert res.status_code == 200
        data = res.json()
        assert 'answer' in data
        assert 'sources' in data

    def test_chat_with_history(self, mock_model_and_chroma):
        res = client.post('/api/ai/chat', json={
            'question': '薪资多少？',
            'history': [
                {'role': 'user', 'content': '有哪些岗位？'},
                {'role': 'assistant', 'content': '有前端、后端等岗位'},
            ],
        })
        assert res.status_code == 200
        assert 'answer' in res.json()

    def test_chat_empty_question(self):
        res = client.post('/api/ai/chat', json={
            'question': '',
        })
        # 即使空问题也应返回（由模型处理）
        assert res.status_code == 200 or res.status_code == 422


class TestDeleteDocument:
    def test_delete_document(self, mock_model_and_chroma):
        mock_collection = mock_model_and_chroma['collection']
        res = client.delete('/api/ai/document/job/1')
        assert res.status_code == 200
        data = res.json()
        assert data['success'] is True
        assert 'job_1' in data['message']
        mock_collection.delete.assert_called_once_with(ids=['job_1'])

    def test_delete_news_document(self, mock_model_and_chroma):
        res = client.delete('/api/ai/document/news/5')
        assert res.status_code == 200
        assert 'news_5' in res.json()['message']


class TestUpdateDocument:
    def test_update_document(self, mock_model_and_chroma):
        mock_collection = mock_model_and_chroma['collection']
        res = client.put('/api/ai/document/job/1', json={
            'doc_type': 'job',
            'doc_id': 1,
            'content': '更新后的岗位描述',
        })
        assert res.status_code == 200
        data = res.json()
        assert data['success'] is True
        # 应先删除再添加
        mock_collection.delete.assert_called_once()
        mock_collection.add.assert_called_once()

    def test_update_with_metadata(self, mock_model_and_chroma):
        res = client.put('/api/ai/document/news/3', json={
            'doc_type': 'news',
            'doc_id': 3,
            'content': '更新后的新闻内容',
            'metadata': {'title': '新标题'},
        })
        assert res.status_code == 200
        assert res.json()['success'] is True
