const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, Header, Footer, SectionType } = require('docx');
const fs = require('fs');

// Helper function for creating table cells
function createCell(text, width, options = {}) {
  const { bold = false, alignment = AlignmentType.LEFT, shading = null } = options;
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  return new TableCell({
    borders: { top: border, bottom: border, left: border, right: border },
    width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: shading ? { fill: shading, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment,
      children: [new TextRun({ text, bold, size: 20, font: "SimSun" })]
    })]
  });
}

// Helper function for table rows
function createRow(date, phase, subject, content) {
  return new TableRow({
    children: [
      createCell(date, 1400),
      createCell(phase, 1200),
      createCell(subject, 2000),
      createCell(content, 4360)
    ]
  });
}

// Records data
const records = [
  { date: "2025.11.18", phase: "选题", subject: "双选见面，毕业设计启动会", content: "和指导老师见面，确定选题为基于RAG与推荐算法的智能就业服务平台设计与实现。老师下达毕业设计任务，需要完成一个融合检索增强生成（RAG）与个性化推荐算法的智能就业服务平台设计与实现，包括系统设计、代码实现、论文撰写三部分工作。\n\n任务安排：完成参考文献学习、整理，书写文献综述。在2025年12月16日前提交文献综述初稿。\n\n讲解文献综述的写法：根据选题，结合国内外的研究现状书写文献综述。字数3000-4000字，文献综述部分可以作为毕业设计论文正文的绪论部分。具体写法查看qq群文件中文献综述的书写方法。" },
  { date: "2025.11.25", phase: "选题", subject: "选题可行性分析", content: "与学生讨论选题的技术可行性，确认采用RAG技术与推荐算法相结合的技术路线。\n\n分析当前高校就业服务平台存在的问题：信息碎片化严重、缺乏个性化推荐、学生获取招聘信息效率低等问题。\n\n确定系统采用前后端分离架构，前端使用Vue 3 + Element Plus，后端使用Express.js，AI服务采用FastAPI，向量数据库使用ChromaDB。\n\n安排学生开始收集和整理国内外关于RAG技术、推荐算法、就业服务平台的相关文献资料。" },
  { date: "2025.12.02", phase: "任务书", subject: "任务书内容确认与细化", content: "审阅并确认任务书的具体内容要求，明确毕业设计需要完成的工作：系统设计、代码实现、论文撰写。\n\n明确任务书中的关键节点和交付物：文献综述、开题报告、中期检查、论文初稿、最终论文。\n\n讨论系统的核心功能需求：用户管理、岗位管理、新闻管理、RAG智能问答、个性化推荐等功能模块。\n\n要求学生根据任务书内容，制定详细的项目开发计划和时间表。" },
  { date: "2025.12.10", phase: "文献综述", subject: "文献综述初稿指导", content: "审阅学生提交的文献综述初稿，检查文献综述的结构、逻辑和内容完整性。\n\n指出初稿中存在的问题：部分文献引用不够规范、RAG技术研究现状部分需要补充最新文献、推荐算法部分需要加强对比分析。\n\n建议增加关于LoRA微调方法和向量数据库在RAG系统中作用的相关文献综述。\n\n要求学生在一周内完成文献综述修改，重点强化国内外研究现状的对比分析部分。" },
  { date: "2025.12.17", phase: "文献综述", subject: "文献综述终稿审定", content: "审阅修改后的文献综述终稿，确认文献综述达到3000-4000字的要求。\n\n检查文献综述的学术规范性：参考文献格式、文献引用是否恰当、综述结构是否清晰。\n\n确认文献综述涵盖四个方面：检索增强生成技术、大语言模型在信息服务中的应用、个性化推荐算法、高校就业服务平台研究现状。\n\n确认文献综述可作为毕业设计论文正文的绪论部分，同意定稿。" },
  { date: "2026.01.08", phase: "开题报告", subject: "开题报告撰写指导", content: "讲解开题报告的撰写要求和评审标准，明确开题报告需要包含研究背景、研究现状、研究内容、技术方案、进度安排等内容。\n\n指导学生根据文献综述内容，梳理和完善开题报告的研究背景和意义部分。\n\n讨论系统的技术方案：采用前后端分离架构、MySQL数据库、ChromaDB向量数据库、FastAPI的AI服务架构。\n\n要求学生在1月15日前完成开题报告初稿，提交给指导老师审阅。" },
  { date: "2026.01.15", phase: "开题报告", subject: "开题报告审阅与修改", content: "审阅学生提交的开题报告初稿，肯定整体框架和研究思路。\n\n指出开题报告中存在的问题：研究内容的创新点需要更清晰地阐述、系统架构图需要补充、进度安排需要更加详细。\n\n建议学生在开题报告中突出RAG技术与推荐算法融合的创新性，以及系统在高校就业服务领域的实用价值。\n\n要求学生在三天内完成开题报告修改，准备开题答辩。" },
  { date: "2026.03.05", phase: "中期检查", subject: "中期检查，项目进度汇报", content: "听取学生汇报项目开发进度，审阅已完成的系统模块：用户管理模块、岗位管理模块、新闻管理模块。\n\n检查系统的后端API接口开发情况，确认Express.js后端已实现基本的CRUD操作。\n\n审阅前端页面的设计，确认Vue 3 + Element Plus的界面设计符合规范。\n\n指出当前存在的问题：RAG智能问答模块和个性化推荐模块需要加快进度，要求学生在3月底前完成核心功能的开发。" },
  { date: "2026.03.15", phase: "中期检查", subject: "系统架构设计审查", content: "详细审阅系统的技术架构设计，确认前后端分离的架构方案合理可行。\n\n检查数据库表结构设计：用户表、岗位表、新闻表、用户行为表、收藏表等表结构是否合理。\n\n指导学生完善ChromaDB向量数据库的集成方案，确保RAG智能问答模块能够正常运行。\n\n要求学生加强系统的测试工作，编写单元测试用例，确保系统功能的稳定性和可靠性。" },
  { date: "2026.04.01", phase: "论文指导", subject: "论文撰写规范指导", content: "讲解毕业论文的撰写规范和格式要求，包括论文结构、章节安排、图表格式、参考文献格式等。\n\n指导学生根据开题报告和项目实际情况，拟定论文的详细大纲：绪论、相关技术、系统设计、系统实现、系统测试、总结与展望。\n\n明确论文各部分的字数要求和重点内容，绪论部分可直接使用文献综述内容进行扩展。\n\n要求学生在4月10日前完成论文初稿的前三章：绪论、相关技术介绍、系统设计。" },
  { date: "2026.04.10", phase: "论文指导", subject: "论文初稿（前三章）审阅", content: "审阅学生提交的论文初稿前三章：绪论、相关技术、系统设计。\n\n指出绪论部分存在的问题：研究背景的论述需要更加深入，研究现状部分需要进一步完善。\n\n检查系统设计章节：系统架构图需要补充、数据库设计需要详细说明、功能模块划分需要更加清晰。\n\n要求学生在4月15日前完成论文初稿的后三章：系统实现、系统测试、总结与展望。" },
  { date: "2026.04.15", phase: "论文指导", subject: "论文初稿（后三章）审阅", content: "审阅学生提交的论文初稿后三章：系统实现、系统测试、总结与展望。\n\n检查系统实现章节：核心代码展示是否恰当、系统截图是否清晰、功能实现的描述是否准确。\n\n审阅系统测试章节：测试用例设计是否全面、测试结果分析是否充分、系统性能评估是否合理。\n\n指出总结与展望部分需要进一步完善，要求学生总结系统的主要创新点和贡献，展望未来改进方向。" },
  { date: "2026.04.22", phase: "论文指导", subject: "论文整体修改完善", content: "通篇审阅论文初稿，检查论文的整体逻辑性、结构完整性和内容一致性。\n\n指出论文中存在的共性问题：部分章节衔接不够自然、专业术语使用不够规范、图表需要统一格式。\n\n要求学生对论文进行整体修改，重点改进：加强各章节之间的逻辑衔接、统一专业术语的表述、规范图表格式和编号。\n\n要求学生在4月28日前完成论文修改稿，准备提交中期检查后的第一次论文审查。" },
  { date: "2026.05.05", phase: "论文指导", subject: "论文修改稿审阅", content: "审阅学生提交的论文修改稿，确认修改内容符合要求。\n\n检查论文中的细节问题：参考文献格式、错别字、标点符号、页眉页脚格式等。\n\n指导学生完善摘要部分：中文摘要和英文摘要需要更加精炼，突出系统的创新点和主要工作。\n\n要求学生在5月10日前完成论文的最终修改，并准备好答辩PPT。" },
  { date: "2026.05.12", phase: "论文指导", subject: "论文定稿与查重", content: "审阅论文的最终版本，确认论文格式、内容、参考文献等均已达到要求。\n\n指导学生进行论文查重，确保论文的重复率符合学校要求。\n\n讲解论文查重的注意事项和降重技巧，帮助学生理解如何合理引用和表述。\n\n确认论文可以在5月15日前完成定稿，准备进入答辩准备阶段。" },
  { date: "2026.05.18", phase: "论文指导", subject: "答辩准备指导", content: "审阅学生的答辩PPT，检查PPT的内容完整性和视觉效果。\n\n指导学生准备答辩演讲内容，包括项目背景、技术方案、系统实现、创新点、总结展望等部分。\n\n模拟答辩提问，提前准备可能的答辩问题：RAG技术的应用细节、推荐算法的实现方案、系统的测试结果等。\n\n提醒学生答辩时间是5月24日，要求学生提前做好准备，熟悉论文内容和系统功能。" }
];

// Create document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "SimSun", size: 21 }
      }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
      }
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "毕业设计指导记录",
            bold: true,
            size: 32,
            font: "SimHei"
          })
        ]
      }),

      // Student info
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({ text: "学生姓名：", bold: true, size: 21, font: "SimSun" }),
          new TextRun({ text: "朱泳达", size: 21, font: "SimSun" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({ text: "学号：", bold: true, size: 21, font: "SimSun" }),
          new TextRun({ text: "20220440306", size: 21, font: "SimSun" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({ text: "专业班级：", bold: true, size: 21, font: "SimSun" }),
          new TextRun({ text: "软件工程 本22软工04班", size: 21, font: "SimSun" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({ text: "指导教师：", bold: true, size: 21, font: "SimSun" }),
          new TextRun({ text: "刘永彬（教授）", size: 21, font: "SimSun" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({ text: "学院：", bold: true, size: 21, font: "SimSun" }),
          new TextRun({ text: "计算机学院", size: 21, font: "SimSun" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({ text: "课题名称：", bold: true, size: 21, font: "SimSun" }),
          new TextRun({ text: "基于RAG与推荐算法的智能就业服务平台设计与实现", size: 21, font: "SimSun" })
        ]
      }),

      // Table header
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [new TextRun({ text: "指导记录（共16条）", size: 21, font: "SimSun" })]
      }),

      // Main table
      new Table({
        width: { size: 9506, type: WidthType.DXA }, // A4 with 1200 margins
        columnWidths: [1400, 1200, 2000, 4360],
        rows: [
          // Table header
          new TableRow({
            children: [
              createCell("指导时间", 1400, { bold: true, alignment: AlignmentType.CENTER, shading: "D5E8F0" }),
              createCell("过程环节", 1200, { bold: true, alignment: AlignmentType.CENTER, shading: "D5E8F0" }),
              createCell("主题", 2000, { bold: true, alignment: AlignmentType.CENTER, shading: "D5E8F0" }),
              createCell("指导内容", 4360, { bold: true, alignment: AlignmentType.CENTER, shading: "D5E8F0" })
            ]
          }),
          // Data rows
          ...records.map(r => createRow(r.date, r.phase, r.subject, r.content))
        ]
      }),

      // Page break
      new Paragraph({ children: [] })
    ]
  }]
});

// Save document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/Users/dadanrw/Desktop/Code/project/导师指导记录-朱泳达.docx', buffer);
  console.log('Document created successfully');
});
