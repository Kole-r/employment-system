import os
import json
import re
import threading
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
import chromadb

# 配置
MODEL_PATH = "/Users/dadanrw/Desktop/Code/project/ai_tuning/merged_model"
CHROMA_DB_PATH = os.path.join(os.path.dirname(__file__), 'chroma_db')
COLLECTION_NAME = 'employment_knowledge'

# 初始化FastAPI应用
app = FastAPI(title="就业服务AI助手", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
model = None
tokenizer = None
chroma_client = None
collection = None

class ChatRequest(BaseModel):
    question: str
    history: Optional[list] = None

class EmbedRequest(BaseModel):
    doc_type: str  # "job" or "news"
    doc_id: int
    content: str
    metadata: Optional[dict] = None

class ChatResponse(BaseModel):
    answer: str
    sources: list

def load_model():
    """加载微调后的模型"""
    global model, tokenizer
    
    print(f"正在加载模型: {MODEL_PATH}")
    
    # 加载tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_PATH,
        trust_remote_code=True
    )
    
    # 加载模型，使用MPS加速 + SDPA注意力优化
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        device_map="mps",
        torch_dtype=torch.float16,
        trust_remote_code=True,
        attn_implementation="sdpa"
    )

    print("模型加载完成")

def init_chroma():
    """初始化Chroma向量数据库"""
    global chroma_client, collection
    
    print(f"正在连接向量数据库: {CHROMA_DB_PATH}")
    
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    
    # 获取或创建collection
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    
    print(f"向量数据库连接完成，当前文档数: {collection.count()}")

@app.on_event("startup")
async def startup_event():
    """应用启动时加载模型和向量数据库"""
    load_model()
    init_chroma()

@app.get("/")
async def root():
    return {"message": "就业服务AI助手API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "chroma_ready": collection is not None,
        "document_count": collection.count() if collection else 0
    }

@app.post("/api/ai/embed")
async def embed_document(request: EmbedRequest):
    """将新文档嵌入到向量数据库中"""
    try:
        doc_id = f"{request.doc_type}_{request.doc_id}"
        
        metadata = {
            "source": "api",
            "type": request.doc_type,
            "id": request.doc_id
        }
        if request.metadata:
            metadata.update(request.metadata)
        
        # 添加到向量数据库
        collection.add(
            documents=[request.content],
            metadatas=[metadata],
            ids=[doc_id]
        )
        
        return {
            "success": True,
            "message": f"文档 {doc_id} 已成功添加到向量数据库",
            "total_documents": collection.count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"嵌入文档失败: {str(e)}")

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """与AI助手对话"""
    try:
        # 1. 在向量数据库中检索相关文档
        query_results = collection.query(
            query_texts=[request.question],
            n_results=3
        )
        
        # 2. 提取检索到的文档作为上下文
        context = ""
        sources = []
        
        if query_results and query_results['documents'][0]:
            for i, doc in enumerate(query_results['documents'][0]):
                metadata = query_results['metadatas'][0][i] if query_results['metadatas'] else {}
                distance = query_results['distances'][0][i] if query_results['distances'] else 0
                
                context += f"参考资料{i+1}: {doc}\n\n"
                
                source_info = {
                    "content": doc[:200] + "..." if len(doc) > 200 else doc,
                    "type": metadata.get("type", "unknown"),
                    "relevance": round(1 - distance, 4)
                }
                if metadata.get("company"):
                    source_info["company"] = metadata["company"]
                if metadata.get("title"):
                    source_info["title"] = metadata["title"]
                sources.append(source_info)
        
        # 3. 构建精简Prompt
        system_prompt = "你是就业服务AI助手，根据参考资料回答求职就业问题，回答简洁专业。"

        if context:
            prompt = f"{system_prompt}\n参考资料：\n{context}\n用户：{request.question}\n助手："
        else:
            prompt = f"{system_prompt}\n用户：{request.question}\n助手："

        # 4. 使用模型生成回答（优化参数）
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                use_cache=True
            )

        # 5. 只取新生成的token
        generated_ids = outputs[0][inputs['input_ids'].shape[-1]:]
        answer = tokenizer.decode(generated_ids, skip_special_tokens=True)
        
        answer = answer.strip()
        
        return ChatResponse(
            answer=answer,
            sources=sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"对话失败: {str(e)}")

@app.post("/api/ai/chat/stream")
async def chat_stream(request: ChatRequest):
    """流式对话接口 — 边生成边返回"""
    try:
        # 1. RAG检索
        query_results = collection.query(
            query_texts=[request.question],
            n_results=3
        )

        context = ""
        sources = []
        if query_results and query_results['documents'][0]:
            for i, doc in enumerate(query_results['documents'][0]):
                metadata = query_results['metadatas'][0][i] if query_results['metadatas'] else {}
                distance = query_results['distances'][0][i] if query_results['distances'] else 0
                context += f"资料{i+1}: {doc}\n\n"
                source_info = {
                    "content": doc[:200] + "..." if len(doc) > 200 else doc,
                    "type": metadata.get("type", "unknown"),
                    "relevance": round(1 - distance, 4)
                }
                if metadata.get("company"):
                    source_info["company"] = metadata["company"]
                if metadata.get("title"):
                    source_info["title"] = metadata["title"]
                sources.append(source_info)

        # 2. 构建精简Prompt
        system_prompt = "你是就业服务AI助手，根据参考资料回答求职就业问题，回答简洁专业。"
        if context:
            prompt = f"{system_prompt}\n参考资料：\n{context}\n用户：{request.question}\n助手："
        else:
            prompt = f"{system_prompt}\n用户：{request.question}\n助手："

        # 3. 设置流式生成
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        streamer = TextIteratorStreamer(
            tokenizer,
            skip_prompt=True,
            skip_special_tokens=True
        )

        generate_kwargs = {
            **inputs,
            "max_new_tokens": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "repetition_penalty": 1.1,
            "do_sample": True,
            "pad_token_id": tokenizer.eos_token_id,
            "use_cache": True,
            "streamer": streamer,
        }

        # 在后台线程中运行generate（streamer会阻塞直到生成完毕）
        thread = threading.Thread(target=model.generate, kwargs=generate_kwargs)
        thread.start()

        # 4. SSE流式返回
        async def generate_stream():
            # 先发送参考来源
            if sources:
                yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

            # 逐token流式返回
            for text in streamer:
                yield f"data: {json.dumps({'type': 'token', 'token': text})}\n\n"

            # 结束标记
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"对话失败: {str(e)}")


@app.delete("/api/ai/document/{doc_type}/{doc_id}")
async def delete_document(doc_type: str, doc_id: int):
    """从向量数据库中删除文档"""
    try:
        doc_id_str = f"{doc_type}_{doc_id}"
        
        collection.delete(ids=[doc_id_str])
        
        return {
            "success": True,
            "message": f"文档 {doc_id_str} 已从向量数据库中删除",
            "total_documents": collection.count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除文档失败: {str(e)}")

@app.put("/api/ai/document/{doc_type}/{doc_id}")
async def update_document(doc_type: str, doc_id: int, request: EmbedRequest):
    """更新向量数据库中的文档"""
    try:
        doc_id_str = f"{doc_type}_{doc_id}"
        
        # 先删除旧文档
        try:
            collection.delete(ids=[doc_id_str])
        except:
            pass
        
        # 添加新文档
        metadata = {
            "source": "api",
            "type": doc_type,
            "id": doc_id
        }
        if request.metadata:
            metadata.update(request.metadata)
        
        collection.add(
            documents=[request.content],
            metadatas=[metadata],
            ids=[doc_id_str]
        )
        
        return {
            "success": True,
            "message": f"文档 {doc_id_str} 已更新",
            "total_documents": collection.count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新文档失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
