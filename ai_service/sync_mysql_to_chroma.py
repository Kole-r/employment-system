"""把 MySQL 里所有岗位和新闻同步到 ChromaDB"""
import os
import pymysql
import requests
import re
from dotenv import load_dotenv
load_dotenv()

AI_URL = os.getenv('AI_SERVICE_URL', 'http://localhost:8000/api/ai/embed')

conn = pymysql.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'employment_platform'),
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

# ── 岗位 ──
with conn.cursor() as cur:
    cur.execute('SELECT * FROM jobs')
    jobs = cur.fetchall()
    print(f'MySQL 岗位数: {len(jobs)}')

for job in jobs:
    text = f"{job['company_name']}招聘{job['job_title']}，工作地点{job['city']}"
    if job.get('salary_min') and job.get('salary_max'):
        text += f"，薪资{job['salary_min']}-{job['salary_max']}元"
    text += f"，要求{job.get('degree_required') or '不限'}学历"
    if job.get('experience'):
        text += f"，需要{job['experience']}经验"
    if job.get('benefits'):
        text += f"，福利待遇包括{job['benefits']}"
    text += f"。岗位类型：{job.get('job_type') or '全职'}"
    if job.get('job_category'):
        text += f"，岗位分类：{job['job_category']}"
    text += "。"
    if job.get('job_description'):
        text += f"岗位职责：{job['job_description']}"
    if job.get('job_requirements'):
        text += f"任职要求：{job['job_requirements']}"
    if job.get('tags'):
        text += f"标签：{job['tags']}"

    r = requests.post(AI_URL, json={
        'doc_type': 'job', 'doc_id': job['id'],
        'content': text,
        'metadata': {'company': job['company_name'], 'title': job['job_title']}
    })
    status = 'ok' if r.status_code == 200 else 'fail'
    print(f"  [{status}] job_{job['id']} - {job['job_title']}")

# ── 新闻 ──
with conn.cursor() as cur:
    cur.execute('SELECT * FROM news')
    news_list = cur.fetchall()
    print(f'MySQL 新闻数: {len(news_list)}')

for news in news_list:
    content = news.get('content') or ''
    content = re.sub(r'<[^>]+>', '', content)
    if len(content) > 500:
        content = content[:500] + '...'
    text = f"就业新闻：{news['title']}。{content}"

    r = requests.post(AI_URL, json={
        'doc_type': 'news', 'doc_id': news['id'],
        'content': text,
        'metadata': {'title': news['title']}
    })
    status = 'ok' if r.status_code == 200 else 'fail'
    print(f"  [{status}] news_{news['id']} - {news['title']}")

conn.close()

# 验证
health = requests.get('http://localhost:8000/health').json()
print(f"\n同步完成！ChromaDB 当前文档数: {health['document_count']}")
