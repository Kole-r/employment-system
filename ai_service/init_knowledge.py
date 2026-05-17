import json
import os
import sys
import pymysql
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv
load_dotenv()

# 数据库配置
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'employment_platform'),
    'charset': 'utf8mb4'
}

# 向量数据库存储路径
CHROMA_DB_PATH = os.path.join(os.path.dirname(__file__), 'chroma_db')
COLLECTION_NAME = 'employment_knowledge'

def get_db_connection():
    """获取数据库连接"""
    return pymysql.connect(**DB_CONFIG)

def fetch_jobs():
    """从数据库获取所有岗位信息"""
    conn = get_db_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT id, company_name, job_title, job_type, city, district,
                       salary_min, salary_max, degree_required, experience,
                       job_description, job_requirements, benefits, tags
                FROM jobs 
                WHERE status = 1
                ORDER BY created_at DESC
            """
            cursor.execute(sql)
            jobs = cursor.fetchall()
            print(f"从数据库获取到 {len(jobs)} 条岗位信息")
            return jobs
    finally:
        conn.close()

def fetch_news():
    """从数据库获取所有新闻信息"""
    conn = get_db_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT id, title, content, category
                FROM news 
                WHERE status = 1
                ORDER BY created_at DESC
            """
            cursor.execute(sql)
            news = cursor.fetchall()
            print(f"从数据库获取到 {len(news)} 条新闻信息")
            return news
    finally:
        conn.close()

def job_to_text(job):
    """将岗位信息转换为自然语言描述"""
    salary = ""
    if job['salary_min'] and job['salary_max']:
        salary = f"，薪资{job['salary_min']}-{job['salary_max']}元"
    
    benefits = ""
    if job['benefits']:
        benefits = f"，福利待遇包括{job['benefits']}"
    
    district = f"，{job['district']}" if job.get('district') else ''
    major = f"，{job['major_required']}" if job.get('major_required') else ''
    exp = f"，需要{job['experience']}经验" if job.get('experience') else ''
    cat = f"，岗位分类：{job['job_category']}" if job.get('job_category') else ''

    text = (
        f"{job['company_name']}招聘{job['job_title']}，"
        f"工作地点{job['city']}{district}"
        f"{salary}"
        f"，要求{job['degree_required']}学历{major}{exp}"
        f"{benefits}"
        f"。岗位类型：{job['job_type']}{cat}。"
    )
    
    if job.get('job_description'):
        text += f"岗位职责：{job['job_description']}"
    
    if job.get('job_requirements'):
        text += f"任职要求：{job['job_requirements']}"
    
    if job.get('tags'):
        text += f"标签：{job['tags']}"
    
    return text

def news_to_text(news):
    """将新闻信息转换为自然语言描述"""
    content = news['content']
    # 去除HTML标签，保留纯文本
    import re
    content = re.sub(r'<[^>]+>', '', content)
    # 截取前500字符避免过长
    if len(content) > 500:
        content = content[:500] + '...'
    
    return f"就业新闻：{news['title']}。{content}"

def load_knowledge_json():
    """加载本地知识库JSON文件"""
    knowledge_file = os.path.join(os.path.dirname(__file__), 'knowledge.json')
    if not os.path.exists(knowledge_file):
        print(f"警告：未找到知识库文件 {knowledge_file}")
        return []
    
    with open(knowledge_file, 'r', encoding='utf-8') as f:
        knowledge = json.load(f)
    
    print(f"从本地加载了 {len(knowledge)} 条就业知识文档")
    return knowledge

def init_chroma_db(documents, metadatas, ids):
    """初始化Chroma向量数据库"""
    # 如果chroma_db目录不存在则创建
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)
    
    # 创建PersistentClient
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    
    # 删除已存在的collection（如果存在）
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"已删除旧的collection: {COLLECTION_NAME}")
    except:
        pass
    
    # 创建新的collection
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"已创建collection: {COLLECTION_NAME}")
    
    # 批量添加文档
    batch_size = 100
    total = len(documents)
    
    for i in range(0, total, batch_size):
        batch_end = min(i + batch_size, total)
        collection.add(
            documents=documents[i:batch_end],
            metadatas=metadatas[i:batch_end],
            ids=ids[i:batch_end]
        )
        print(f"已导入 {batch_end}/{total} 条文档")
    
    print(f"向量数据库初始化完成，共导入 {total} 条文档")
    return collection

def main():
    print("=" * 50)
    print("就业知识库初始化脚本")
    print("=" * 50)
    
    documents = []
    metadatas = []
    ids = []
    
    # 1. 从数据库获取岗位信息
    print("\n1. 正在从数据库获取岗位信息...")
    try:
        jobs = fetch_jobs()
        for job in jobs:
            doc_id = f"job_{job['id']}"
            text = job_to_text(job)
            documents.append(text)
            metadatas.append({
                "source": "database",
                "type": "job",
                "id": job['id'],
                "company": job['company_name'],
                "title": job['job_title']
            })
            ids.append(doc_id)
    except Exception as e:
        print(f"获取岗位信息失败: {e}")
        print("请确认MySQL服务是否运行，数据库配置是否正确")
    
    # 2. 从数据库获取新闻信息
    print("\n2. 正在从数据库获取新闻信息...")
    try:
        news_list = fetch_news()
        for news in news_list:
            doc_id = f"news_{news['id']}"
            text = news_to_text(news)
            documents.append(text)
            metadatas.append({
                "source": "database",
                "type": "news",
                "id": news['id'],
                "title": news['title']
            })
            ids.append(doc_id)
    except Exception as e:
        print(f"获取新闻信息失败: {e}")
        print("请确认MySQL服务是否运行，数据库配置是否正确")
    
    # 3. 加载本地知识库文档
    print("\n3. 正在加载本地知识库文档...")
    knowledge_docs = load_knowledge_json()
    for doc in knowledge_docs:
        doc_id = f"knowledge_{doc['id']}"
        documents.append(doc['content'])
        metadatas.append({
            "source": "local",
            "type": "knowledge",
            "category": doc['category'],
            "title": doc['title']
        })
        ids.append(doc_id)
    
    # 4. 初始化向量数据库
    print("\n4. 正在初始化向量数据库...")
    if documents:
        collection = init_chroma_db(documents, metadatas, ids)
        print("\n" + "=" * 50)
        print("知识库初始化完成！")
        print(f"向量数据库路径: {CHROMA_DB_PATH}")
        print(f"Collection名称: {COLLECTION_NAME}")
        print(f"文档总数: {len(documents)}")
        print("=" * 50)
    else:
        print("\n没有找到任何文档，初始化失败")
        sys.exit(1)

if __name__ == '__main__':
    main()
