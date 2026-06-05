#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Create document
doc = Document()

# Set font to SimSun (宋体)
style = doc.styles['Normal']
style.font.name = 'SimSun'
style.font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

# Set page margins
sections = doc.sections
for section in sections:
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.left_margin = Cm(3.17)
    section.right_margin = Cm(3.17)

# Title
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("毕业设计指导记录")
run.bold = True
run.font.size = Pt(16)
run.font.name = 'SimHei'
run.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimHei')
title.paragraph_format.space_after = Pt(12)

# Student information
info_items = [
    ("学生姓名", "朱泳达"),
    ("学号", "20220440306"),
    ("专业班级", "软件工程 本22软工04班"),
    ("指导教师", "刘永彬（教授）"),
    ("学院", "计算机学院"),
    ("课题名称", "基于RAG与推荐算法的智能就业服务平台设计与实现")
]

for label, value in info_items:
    p = doc.add_paragraph()
    run_label = p.add_run(f"{label}：")
    run_label.bold = True
    run_label.font.size = Pt(11)
    run_label.font.name = 'SimSun'
    run_label.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    run_value = p.add_run(value)
    run_value.font.size = Pt(11)
    run_value.font.name = 'SimSun'
    run_value.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    p.paragraph_format.space_after = Pt(6)

doc.add_paragraph()  # Empty line

# Section header
section_header = doc.add_paragraph()
run_header = section_header.add_run("指导记录（共16条）")
run_header.bold = True
run_header.font.size = Pt(12)
run_header.font.name = 'SimSun'
run_header.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
section_header.paragraph_format.space_after = Pt(8)

# Records data
records = [
    {
        "num": 1,
        "date": "2025年11月18日",
        "phase": "选题",
        "subject": "双选见面，毕业设计启动会",
        "content": [
            "1.和指导老师见面，确定选题为基于RAG与推荐算法的智能就业服务平台设计与实现。老师下达毕业设计任务，需要完成一个融合检索增强生成（RAG）与个性化推荐算法的智能就业服务平台设计与实现，包括系统设计、代码实现、论文撰写三部分工作。",
            "2.任务安排：完成参考文献学习、整理，书写文献综述。在2025年12月16日前提交文献综述初稿。",
            "3.讲解文献综述的写法：根据选题，结合国内外的研究现状书写文献综述。字数3000-4000字，文献综述部分可以作为毕业设计论文正文的绪论部分。具体写法查看qq群文件中文献综述的书写方法。"
        ]
    },
    {
        "num": 2,
        "date": "2025年11月25日",
        "phase": "选题",
        "subject": "选题可行性分析",
        "content": [
            "1.与学生讨论选题的技术可行性，确认采用RAG技术与推荐算法相结合的技术路线。",
            "2.分析当前高校就业服务平台存在的问题：信息碎片化严重、缺乏个性化推荐、学生获取招聘信息效率低等问题。",
            "3.确定系统采用前后端分离架构，前端使用Vue 3 + Element Plus，后端使用Express.js，AI服务采用FastAPI，向量数据库使用ChromaDB。",
            "4.安排学生开始收集和整理国内外关于RAG技术、推荐算法、就业服务平台的相关文献资料。"
        ]
    },
    {
        "num": 3,
        "date": "2025年12月2日",
        "phase": "任务书",
        "subject": "任务书内容确认与细化",
        "content": [
            "1.审阅并确认任务书的具体内容要求，明确毕业设计需要完成的工作：系统设计、代码实现、论文撰写。",
            "2.明确任务书中的关键节点和交付物：文献综述、开题报告、中期检查、论文初稿、最终论文。",
            "3.讨论系统的核心功能需求：用户管理、岗位管理、新闻管理、RAG智能问答、个性化推荐等功能模块。",
            "4.要求学生根据任务书内容，制定详细的项目开发计划和时间表。"
        ]
    },
    {
        "num": 4,
        "date": "2025年12月10日",
        "phase": "文献综述",
        "subject": "文献综述初稿指导",
        "content": [
            "1.审阅学生提交的文献综述初稿，检查文献综述的结构、逻辑和内容完整性。",
            "2.指出初稿中存在的问题：部分文献引用不够规范、RAG技术研究现状部分需要补充最新文献、推荐算法部分需要加强对比分析。",
            "3.建议增加关于LoRA微调方法和向量数据库在RAG系统中作用的相关文献综述。",
            "4.要求学生在一周内完成文献综述修改，重点强化国内外研究现状的对比分析部分。"
        ]
    },
    {
        "num": 5,
        "date": "2025年12月17日",
        "phase": "文献综述",
        "subject": "文献综述终稿审定",
        "content": [
            "1.审阅修改后的文献综述终稿，确认文献综述达到3000-4000字的要求。",
            "2.检查文献综述的学术规范性：参考文献格式、文献引用是否恰当、综述结构是否清晰。",
            "3.确认文献综述涵盖四个方面：检索增强生成技术、大语言模型在信息服务中的应用、个性化推荐算法、高校就业服务平台研究现状。",
            "4.确认文献综述可作为毕业设计论文正文的绪论部分，同意定稿。"
        ]
    },
    {
        "num": 6,
        "date": "2026年1月8日",
        "phase": "开题报告",
        "subject": "开题报告撰写指导",
        "content": [
            "1.讲解开题报告的撰写要求和评审标准，明确开题报告需要包含研究背景、研究现状、研究内容、技术方案、进度安排等内容。",
            "2.指导学生根据文献综述内容，梳理和完善开题报告的研究背景和意义部分。",
            "3.讨论系统的技术方案：采用前后端分离架构、MySQL数据库、ChromaDB向量数据库、FastAPI的AI服务架构。",
            "4.要求学生在1月15日前完成开题报告初稿，提交给指导老师审阅。"
        ]
    },
    {
        "num": 7,
        "date": "2026年1月15日",
        "phase": "开题报告",
        "subject": "开题报告审阅与修改",
        "content": [
            "1.审阅学生提交的开题报告初稿，肯定整体框架和研究思路。",
            "2.指出开题报告中存在的问题：研究内容的创新点需要更清晰地阐述、系统架构图需要补充、进度安排需要更加详细。",
            "3.建议学生在开题报告中突出RAG技术与推荐算法融合的创新性，以及系统在高校就业服务领域的实用价值。",
            "4.要求学生在三天内完成开题报告修改，准备开题答辩。"
        ]
    },
    {
        "num": 8,
        "date": "2026年3月5日",
        "phase": "中期检查",
        "subject": "中期检查，项目进度汇报",
        "content": [
            "1.听取学生汇报项目开发进度，审阅已完成的系统模块：用户管理模块、岗位管理模块、新闻管理模块。",
            "2.检查系统的后端API接口开发情况，确认Express.js后端已实现基本的CRUD操作。",
            "3.审阅前端页面的设计，确认Vue 3 + Element Plus的界面设计符合规范。",
            "4.指出当前存在的问题：RAG智能问答模块和个性化推荐模块需要加快进度，要求学生在3月底前完成核心功能的开发。"
        ]
    },
    {
        "num": 9,
        "date": "2026年3月15日",
        "phase": "中期检查",
        "subject": "系统架构设计审查",
        "content": [
            "1.详细审阅系统的技术架构设计，确认前后端分离的架构方案合理可行。",
            "2.检查数据库表结构设计：用户表、岗位表、新闻表、用户行为表、收藏表等表结构是否合理。",
            "3.指导学生完善ChromaDB向量数据库的集成方案，确保RAG智能问答模块能够正常运行。",
            "4.要求学生加强系统的测试工作，编写单元测试用例，确保系统功能的稳定性和可靠性。"
        ]
    },
    {
        "num": 10,
        "date": "2026年4月1日",
        "phase": "论文指导",
        "subject": "论文撰写规范指导",
        "content": [
            "1.讲解毕业论文的撰写规范和格式要求，包括论文结构、章节安排、图表格式、参考文献格式等。",
            "2.指导学生根据开题报告和项目实际情况，拟定论文的详细大纲：绪论、相关技术、系统设计、系统实现、系统测试、总结与展望。",
            "3.明确论文各部分的字数要求和重点内容，绪论部分可直接使用文献综述内容进行扩展。",
            "4.要求学生在4月10日前完成论文初稿的前三章：绪论、相关技术介绍、系统设计。"
        ]
    },
    {
        "num": 11,
        "date": "2026年4月10日",
        "phase": "论文指导",
        "subject": "论文初稿（前三章）审阅",
        "content": [
            "1.审阅学生提交的论文初稿前三章：绪论、相关技术、系统设计。",
            "2.指出绪论部分存在的问题：研究背景的论述需要更加深入，研究现状部分需要进一步完善。",
            "3.检查系统设计章节：系统架构图需要补充、数据库设计需要详细说明、功能模块划分需要更加清晰。",
            "4.要求学生在4月15日前完成论文初稿的后三章：系统实现、系统测试、总结与展望。"
        ]
    },
    {
        "num": 12,
        "date": "2026年4月15日",
        "phase": "论文指导",
        "subject": "论文初稿（后三章）审阅",
        "content": [
            "1.审阅学生提交的论文初稿后三章：系统实现、系统测试、总结与展望。",
            "2.检查系统实现章节：核心代码展示是否恰当、系统截图是否清晰、功能实现的描述是否准确。",
            "3.审阅系统测试章节：测试用例设计是否全面、测试结果分析是否充分、系统性能评估是否合理。",
            "4.指出总结与展望部分需要进一步完善，要求学生总结系统的主要创新点和贡献，展望未来改进方向。"
        ]
    },
    {
        "num": 13,
        "date": "2026年4月22日",
        "phase": "论文指导",
        "subject": "论文整体修改完善",
        "content": [
            "1.通篇审阅论文初稿，检查论文的整体逻辑性、结构完整性和内容一致性。",
            "2.指出论文中存在的共性问题：部分章节衔接不够自然、专业术语使用不够规范、图表需要统一格式。",
            "3.要求学生对论文进行整体修改，重点改进：加强各章节之间的逻辑衔接、统一专业术语的表述、规范图表格式和编号。",
            "4.要求学生在4月28日前完成论文修改稿，准备提交中期检查后的第一次论文审查。"
        ]
    },
    {
        "num": 14,
        "date": "2026年5月5日",
        "phase": "论文指导",
        "subject": "论文修改稿审阅",
        "content": [
            "1.审阅学生提交的论文修改稿，确认修改内容符合要求。",
            "2.检查论文中的细节问题：参考文献格式、错别字、标点符号、页眉页脚格式等。",
            "3.指导学生完善摘要部分：中文摘要和英文摘要需要更加精炼，突出系统的创新点和主要工作。",
            "4.要求学生在5月10日前完成论文的最终修改，并准备好答辩PPT。"
        ]
    },
    {
        "num": 15,
        "date": "2026年5月12日",
        "phase": "论文指导",
        "subject": "论文定稿与查重",
        "content": [
            "1.审阅论文的最终版本，确认论文格式、内容、参考文献等均已达到要求。",
            "2.指导学生进行论文查重，确保论文的重复率符合学校要求。",
            "3.讲解论文查重的注意事项和降重技巧，帮助学生理解如何合理引用和表述。",
            "4.确认论文可以在5月15日前完成定稿，准备进入答辩准备阶段。"
        ]
    },
    {
        "num": 16,
        "date": "2026年5月18日",
        "phase": "论文指导",
        "subject": "答辩准备指导",
        "content": [
            "1.审阅学生的答辩PPT，检查PPT的内容完整性和视觉效果。",
            "2.指导学生准备答辩演讲内容，包括项目背景、技术方案、系统实现、创新点、总结展望等部分。",
            "3.模拟答辩提问，提前准备可能的答辩问题：RAG技术的应用细节、推荐算法的实现方案、系统的测试结果等。",
            "4.提醒学生答辩时间是5月24日，要求学生提前做好准备，熟悉论文内容和系统功能。"
        ]
    }
]

# Create table
for i, record in enumerate(records):
    # Record header
    p = doc.add_paragraph()
    run_num = p.add_run(f"第{record['num']}条")
    run_num.bold = True
    run_num.font.size = Pt(11)
    run_num.font.name = 'SimSun'
    run_num.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    p.paragraph_format.space_after = Pt(4)

    # Info line
    p = doc.add_paragraph()
    run_phase = p.add_run(f"过程环节：{record['phase']}")
    run_phase.bold = True
    run_phase.font.size = Pt(10.5)
    run_phase.font.name = 'SimSun'
    run_phase.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    p.paragraph_format.space_after = Pt(2)

    # Date
    p = doc.add_paragraph()
    run_date = p.add_run(f"指导时间：{record['date']}")
    run_date.font.size = Pt(10.5)
    run_date.font.name = 'SimSun'
    run_date.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    p.paragraph_format.space_after = Pt(2)

    # Subject
    p = doc.add_paragraph()
    run_subject = p.add_run(f"主题：{record['subject']}")
    run_subject.font.size = Pt(10.5)
    run_subject.font.name = 'SimSun'
    run_subject.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    p.paragraph_format.space_after = Pt(4)

    # Content
    p = doc.add_paragraph()
    run_content_label = p.add_run("指导内容：")
    run_content_label.bold = True
    run_content_label.font.size = Pt(10.5)
    run_content_label.font.name = 'SimSun'
    run_content_label.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    p.paragraph_format.space_after = Pt(4)

    for item in record['content']:
        p = doc.add_paragraph()
        run_item = p.add_run(item)
        run_item.font.size = Pt(10.5)
        run_item.font.name = 'SimSun'
        run_item.element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.first_line_indent = Cm(0.74)  # 2 chars indent

    doc.add_paragraph()  # Empty line between records

# Save document
doc.save('/mnt/outputs/导师指导记录-朱泳达.docx')
print("文档创建成功！")
