// 首页「精选项目」三个项目的展示数据
// 结构与文案搬运自 design-mockup/index-v9.html L946–1035（HTML）；
// 设计稿每个卡片之间只差数据，故抽成数据文件，模板只负责渲染（与 glossary.ts / evolution.ts 同一口径）。
//
// 与设计稿的两处刻意差异（均已在 task-8-report.md 里逐条举证）：
//   1. 项目 01 的文案：设计稿写「10 章递进式开发 · 独立完成设计与实现」，
//      但该项目的性质是课程项目，`nature` 已裁决为「课程项目 · 按章节复现并二次开发」
//      （见 task-10-brief.md:22）。desc 首句据此改为诚实标注，role 同步改口径，
//      不再声称「独立完成设计与实现」。
//   2. 项目名用已裁决的新名（MewHelp / 城觅 / 智学云课堂），与 Task 10 的
//      content/projects frontmatter 保持一致。

export interface ProjectMetric {
  value: number;
  label: string;
  suffix?: string;
}

export interface Project {
  index: string;
  title: string;
  role: string;
  desc: string;
  badge: string;
  badgePrimary?: boolean;
  metrics: ProjectMetric[];
  tags: string[];
  href: string;
}

export const projects: Project[] = [
  {
    index: '01',
    title: 'MewHelp · 电商智能客服 Agent',
    role: '10 章递进式开发 · 按章节复现并二次开发',
    desc:
      '这是一个课程项目，按章节复现并二次开发：从一条纯对话接口起步，逐章长出完整的客服系统——' +
      '工具链、向量检索、混合检索与重排、图编排骨架、意图分流与指代消解、双层上下文管理、' +
      'MCP 工具系统、可观测与数据飞轮，最后微调一个 17 类主题分类器。' +
      '每一章都有设计文档、实现计划与评审记录。',
    badge: '主线',
    badgePrimary: true,
    metrics: [
      { value: 10, label: '递进章节' },
      { value: 6727, label: '应用代码行' },
      { value: 48, label: '测试文件' },
      { value: 46, label: 'Make 任务' },
    ],
    tags: ['FastAPI', 'LangGraph', 'Milvus', 'BGE-M3', 'Reranker', 'MCP', 'Langfuse', 'RoBERTa'],
    href: '/projects/mewhelp/',
  },
  {
    index: '02',
    title: '城觅 · 生活服务平台',
    role: '高并发交易系统 + AI 智能客服模块',
    desc:
      'SpringBoot + Redis + Kafka 的本地生活服务平台。在秒杀主链路上完成四轮迭代' +
      '（阻塞队列 → Lua 原子扣减 → Redisson 分布式锁 → Kafka 异步削峰），' +
      '并在此之上用 LangChain4j 新增智能客服模块：AI 提议、用户二次确认后执行，' +
      '写操作复用既有消息链路。',
    badge: 'Java + AI',
    metrics: [
      { value: 1849, label: 'Agent 模块代码行' },
      { value: 6, label: 'Agent 工具' },
      { value: 0, label: '新增数据库表' },
    ],
    tags: ['SpringBoot', 'Redis', 'Lua', 'Kafka', 'Redisson', 'LangChain4j'],
    href: '/projects/chengmi/',
  },
  {
    index: '03',
    title: '智学云课堂 · 在线教育微服务系统',
    role: '独立复现 16 个微服务模块',
    desc:
      '依据课程讲义与学习目标，按模块逐一实现并调试。覆盖学习计划与进度、互动问答、' +
      '点赞系统、积分签到、实时排行榜、优惠券管理与优惠方案推荐，' +
      '含分布式锁封装、BitMap 签到、定时任务跑批与历史榜单分表持久化。',
    badge: '工程基础',
    metrics: [
      { value: 16, label: '微服务模块' },
      { value: 66, label: '完成学习目标' },
      { value: 12, label: '业务章节' },
    ],
    tags: ['SpringCloud', 'Redisson', 'RabbitMQ', 'XXL-JOB', 'Caffeine', 'Nacos'],
    href: '/projects/zhixue/',
  },
];
