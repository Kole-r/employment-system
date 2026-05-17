import pytest
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_model_and_chroma():
    """Mock model, tokenizer, and chroma for all tests."""
    mock_model = MagicMock()
    mock_model.device = 'cpu'
    mock_output = MagicMock()
    mock_output.__getitem__ = MagicMock(return_value=MagicMock())
    mock_model.generate.return_value = mock_output

    # tokenizer(prompt) returns an object with .to() method
    mock_inputs = MagicMock()
    mock_inputs.to.return_value = mock_inputs
    mock_tokenizer = MagicMock()
    mock_tokenizer.return_value = mock_inputs
    # decode returns a string that includes the prompt prefix so answer extraction works
    mock_tokenizer.decode.return_value = '系统提示词用户问题这是AI的回答'

    mock_collection = MagicMock()
    mock_collection.count.return_value = 5
    mock_collection.query.return_value = {
        'documents': [['参考资料1内容']],
        'metadatas': [[{'type': 'job', 'company': '测试公司'}]],
        'distances': [[0.3]],
    }

    with patch('main.model', mock_model), \
         patch('main.tokenizer', mock_tokenizer), \
         patch('main.collection', mock_collection), \
         patch('main.load_model'), \
         patch('main.init_chroma'):
        yield {
            'model': mock_model,
            'tokenizer': mock_tokenizer,
            'collection': mock_collection,
        }
