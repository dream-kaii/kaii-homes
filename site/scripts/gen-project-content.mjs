#!/usr/bin/env node
/**
 * 生成/修复 `src/content/projects/*.mdx` 的三个内容文件。
 *
 * 为什么要用脚本生成而不是手写：
 *   这三个文件在本任务实现期间被**外部进程反复删除**（至少 3 次：
 *   `src/content/projects/` 与 `src/pages/projects/` 整目录消失，而同批
 *   新建的 `src/components/*.astro` 存活）。原因未定位 —— 推测是并行任务
 *   或清理脚本按「路径前缀」误删。把内容落成可重放的生成器，是让这几份
 *   产物既可恢复、又可复核的做法：`node scripts/gen-project-content.mjs`
 *   能从零重建全部三份文件，字节级确定。
 *
 * 内容口径：
 *   - frontmatter 严格照 task-10-brief.md Step 1 / 修补 3：
 *     `order` 裸数字、`year` 字符串、`stack`/`metrics` 与 src/data/projects.ts 一致。
 *   - 正文五章**不写显式锚点**（修补 4 的方案 2）：右栏目录从 `render()` 返回的
 *     `headings` 动态构造 `href: '#' + h.slug`，与标题文本永远一致。
 *     为什么不用方案 1（`## 标题 {#sec1}`）：MDX 把 `{...}` 当 JSX 表达式，
 *     `#sec1` 不是合法 JS，构建直接以 acorn 解析失败终止（实测
 *     `Could not parse expression with acorn`）。方案 2 对 MDX 与纯 Markdown
 *     都成立，且标题改动时目录自动跟随，是这里唯一稳的选择。
 *   - 组件（ProjectStages / CaseCard / ProjectLimits / SourceList）内嵌在
 *     对应章节之后 —— 需要 `.mdx` 才生效（纯 `.md` 会把标签转义成字面量）。
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = resolve(ROOT, 'src/content/projects');

const IMPORTS = `import CaseCard from '../../components/CaseCard.astro';
import ProjectStages from '../../components/ProjectStages.astro';
import ProjectLimits from '../../components/ProjectLimits.astro';
import SourceList from '../../components/SourceList.astro';
`;

/** stages: [n, tag, title, desc, tags[]] */
const stagesBlock = (rows) => `<ProjectStages
  stages={[
${rows.map(([n, tag, title, desc, tags]) =>
  `    { n: '${n}', tag: '${tag}', title: '${title}', desc: '${desc}', tags: [${tags.map((t) => `'${t}'`).join(', ')}] },`).join('\n')}
  ]}
/>`;

/** fields: [label, html][]；slot 名由中文标签映射 */
const SLOT = { 问题: 'problem', 后果: 'impact', 定位: 'locate', 方案: 'fix', 验证: 'verify', 取舍: 'tradeoff' };
const caseBlock = (severity, title, fields) => `<CaseCard severity="${severity}" title="${title}">
${fields.map(([label, html]) => `  <Fragment slot="${SLOT[label]}">${html}</Fragment>`).join('\n')}
</CaseCard>`;

const limitsBlock = (items) => `<ProjectLimits
  items={[
${items.map((i) => `    '${i}',`).join('\n')}
  ]}
/>`;

const sourcesBlock = (rows) => `<SourceList
  sources={[
${rows.map(([title, url, kind]) => `    { title: '${title}', url: '${url}', kind: '${kind}' },`).join('\n')}
  ]}
/>`;

// ============================================================
// 01 MewHelp
// ============================================================
const mewhelp = `---
title: MewHelp · 电商智能客服 Agent
subtitle: 从一条纯对话接口起步，逐章长成一个能用的客服系统
role: 独立完成
nature: 课程项目 · 按章节复现并二次开发
status: completed
year: '2026'
order: 1
stack: [FastAPI, LangGraph, LangChain, Milvus, BGE-M3, Reranker, MCP, Langfuse, RoBERTa]
metrics:
  - { value: '10', label: '递进章节' }
  - { value: '6727', label: '应用代码行' }
  - { value: '48', label: '测试文件' }
  - { value: '46', label: 'Make 任务' }
repo: https://github.com/dream-kaii/MewHelp
---

${IMPORTS}
## 这个项目做了什么

MewHelp 是一个面向电商场景的智能客服系统。用户在聊天页问一句，后端会判断他到底想问什么，
决定要不要去查订单、检索知识库、或者走退款流程，最后把结果组织成人话回答出来。

整个项目是**按章节逐步长出来的**，不分支、不推倒重来。第一章只有一条对话接口，
到第十章收尾时已经是完整的一套东西 —— 这也是我觉得它比「一次写完的玩具项目」更有价值的地方：
每一章都在解决上一章暴露出来的真实问题。

需要说清楚的是：这是一个**课程项目**，我按课程章节的顺序复现并在此基础上做了二次开发。
项目的骨架与章节划分来自课程，我在每一章里补了设计文档、实现计划和评审记录，
并在若干处（上下文分组裁剪、工具重试边界、嵌入模型进程级复用）做了自己的判断和改动。

## 架构是怎么一步步长出来的

每一章都因为前一章不够用才存在。下面按依赖顺序排开。

${stagesBlock([
  ['CH01', '对话', '先把一次对话做稳', '流式输出让用户不用干等，多轮上下文让第二句话接得住第一句，历史按 token 预算裁剪避免越聊越贵。', ['SSE', '多轮上下文', '结构化抽取']],
  ['CH02', '工具', '让它会查数据', '把业务能力包装成工具，让模型自己决定调哪个。关键词查 FAQ 暴露出同义说法漏召回的问题，留给下一章。', ['Function Calling', '工具注册表', 'MySQL']],
  ['CH03', '检索', '从关键词换成向量', '文档切块、嵌入、存向量库，检索按语义而不是字面。工具对外的契约一行没改。', ['BGE-M3', 'Milvus', '双写状态机']],
  ['CH04', '质量', '召回要宽，排序要准', 'BM25 和向量双路召回后用 RRF 融合，再上重排模型精筛。配套一整套检索评估。', ['BM25', 'RRF', 'Reranker', '引用溯源']],
  ['CH05', '编排', '把稳定的部分焊死', '单轮工具调用接不住「先查订单拿单号、再查物流」这类多步任务。改成图编排：确定性骨架加一个主力 Agent 节点。', ['LangGraph', 'State', 'Checkpointer']],
  ['CH06', '理解', '听懂人话', '「它能退吗」脱离上下文毫无意义。加入指代消解、意图分流，缺订单号时弹选择器让人点，不让模型猜。', ['指代消解', '意图识别', 'interrupt/resume']],
  ['CH07', '上下文', '聊久了不能爆', '全量历史递给模型必然撑爆。改成双层：最近几轮留原文，更早的异步压成摘要。', ['滑动窗口', '滚动摘要', '前缀缓存']],
  ['CH08', '工具系统', '工具成为生态', '几个写死的工具撑不起真实业务。统一注册、校验、鉴权、执行、审计，并用 MCP 接外部工具。', ['MCP', '权限分级', '审计日志']],
  ['CH09', '可观测', '照亮黑盒，回收问题', '接 Langfuse 看每次调用的完整链路，按意图算 token 账；答不上来的问题进池子，人审后补回知识库。', ['Langfuse', '成本账', '数据飞轮']],
  ['CH10', '微调', '该训就训', '池子里的问题按 17 类主题归类，决定先补哪块知识。说法无穷、类目固定 —— 微调小模型比提示词划算。', ['RoBERTa', '微调', 'ONNX 推理']],
])}

## 我解决过的工程问题

这一节是我觉得最有价值的部分 —— 它们不是「功能做完了」，而是「这东西真的能跑起来」。

${caseBlock('critical', '上下文裁剪把工具调用链拆散，导致之后每一轮请求都失败', [
  ['问题', '多轮对话要按 token 预算裁剪历史，原实现按「一问一答」成对删除。'],
  ['后果', '一旦对话里有工具调用，这个假设就不成立 —— 窗口会把 <code>assistant(tool_calls)</code> 和对应的 <code>tool</code> 消息拆开。<b>超限后窗口以 tool 行开头，被上游拒收，之后每一轮都报错。</b>'],
  ['定位', '来自最终全流程评审。根因是设计文档里写了「复用上一章的裁剪逻辑」，但那一章没有工具调用，成对裁剪在工具结构下不成立。'],
  ['方案', '升级为<b>分组感知裁剪</b>：一个组 = <code>user</code>，或 <code>user + assistant(tool_calls) + tool… + assistant</code>。保证窗口必然以 user 开头，当前轮永不删除。'],
  ['验证', '补 8 个边界用例，全量测试通过，重启服务实测多轮链路正常。'],
])}

${caseBlock('important', '工具超时取消不了同步调用，写操作被重试了两次', [
  ['问题', '工具执行引擎统一做了超时加重试。但 <code>asyncio.wait_for</code> 只能取消协程，<b>取消不了跑在线程里的同步工具</b>。'],
  ['后果', '超时触发重试后，一个已经执行过的写操作会被<b>再执行一遍</b> —— 静默的数据重复，日志里看不出异常。'],
  ['方案', '引入构建期的 <code>non_retryable</code> 黑名单，把有副作用的工具排除在重试之外。读操作照旧重试，写操作绝不。'],
  ['取舍', '为什么不直接对所有工具都不重试？因为读操作超时重试是安全的，放弃重试会明显降低成功率。'],
])}

${caseBlock('important', '嵌入模型每轮请求重建，每轮重载几 GB 权重', [
  ['问题', '检索链路里，嵌入模型是在每次请求时构造的。'],
  ['后果', '权重加载一次约十几秒，而且向量库连接会随对象一起泄漏。<b>第一个知识类问题会直接超时失败。</b>'],
  ['方案', '改为<b>进程级复用</b>嵌入模型与向量库连接，并引入延迟连接的包装。同时把冷启动时阻塞事件循环的同步计算挪到线程池。'],
  ['验证', '用真实嵌入模型加向量库跑端到端冒烟，换说法的问句稳定命中。'],
])}

${caseBlock('important', '测试替身把 bug 藏起来了', [
  ['问题', '模块重构后，一个调用方用的还是已被删掉的旧方法名，但我把测试里的替身对象写得<b>比真实实现更宽容</b>，所以测试全绿。'],
  ['后果', '<b>测试通过，但线上路径一调就崩。</b>这是最难发现的一类问题 —— 你以为有测试保护，实际上测试保护的是错的接口。'],
  ['方案', '把替身对象<b>重建为镜像真实实现的接口面</b>，返回类型也要一致。测试的价值在于复刻真实约束，不是模拟一个更好说话的世界。'],
])}

## 一段关键实现

工具执行的第一阶段：跨 chunk 合并工具调用，并对无法解析的调用主动失败。

\`\`\`python
async def stream_first_round(model_with_tools, messages, on_delta):
    """第一阶段：流式收集工具调用，同时逐 chunk 回调文本。"""
    acc = None
    parts = []
    async for chunk in model_with_tools.astream(messages):
        acc = chunk if acc is None else acc + chunk   # 跨 chunk 合并
        text = _text_of(chunk)
        if text:
            parts.append(text); on_delta(text)

    calls   = getattr(acc, "tool_calls", None) or []
    invalid = getattr(acc, "invalid_tool_calls", None) or []

    # 工具调用 JSON 无法解析时，处理不当本轮会静默无输出
    if not calls and invalid:
        raise ValueError(f"工具调用 JSON 无法解析：{invalid}")

    return normalize(calls), "".join(parts)
\`\`\`

## 已知限制

主动写清楚边界，比声称「完美」更接近工程现实。

${limitsBlock([
  '关键词降级路径对同义表达仍会漏召回 —— 这正是引入混合检索的直接原因，但降级路径本身保持原样未升级。',
  '<code>user_id</code> 目前没有鉴权，会话归属只按 id 过滤。这是课程项目的简化设计，不是生产形态。',
  '会话级并发锁覆盖了同一 session 的写冲突，但没有做跨实例的分布式协调。',
  '嵌入与重排模型绑定本机缓存路径，换环境需要重新下载权重或改配置。',
])}

${sourcesBlock([
  ['LangGraph 官方文档 · Persistence 与 Checkpointer', 'https://langchain-ai.github.io/langgraph/concepts/persistence/', 'official'],
  ['Milvus 官方文档 · 向量索引与检索', 'https://milvus.io/docs/index.md', 'official'],
  ['Model Context Protocol 规范', 'https://modelcontextprotocol.io/specification', 'official'],
  ['BAAI/bge-m3 模型卡', 'https://huggingface.co/BAAI/bge-m3', 'official'],
])}
`;

// ============================================================
// 02 城觅
// ============================================================
const chengmi = `---
title: 城觅 · 生活服务平台
subtitle: 高并发交易系统之上，长出一个能动手的 AI 客服
role: 独立完成
nature: 个人项目
status: completed
year: '2026'
order: 2
stack: [SpringBoot, Redis, Lua, Kafka, Redisson, LangChain4j, MySQL]
metrics:
  - { value: '1849', label: 'Agent 模块代码行' }
  - { value: '6', label: 'Agent 工具' }
  - { value: '0', label: '新增数据库表' }
  - { value: '4', label: '秒杀链路迭代' }
---

${IMPORTS}
## 这个项目做了什么

城觅是一个本地生活服务平台：商户、优惠券、秒杀、订单。业务本身不新鲜，
我想练的是**秒杀那条链路上的并发问题**，以及后来加上去的智能客服模块。

这条链路我改了四轮，每一轮都因为上一轮压不住才存在：

1. **阻塞队列** —— 单机内存队列削峰，服务重启就丢，多实例也不共享。
2. **Lua 原子扣减** —— 把「查库存 → 判断 → 扣减」压成一段 Lua 脚本，在 Redis 里原子执行，超卖没了。
3. **Redisson 分布式锁** —— 多实例下同一用户重复下单互相踩，用锁把用户维度串起来。
4. **Kafka 异步削峰** —— 同步落库扛不住瞬时流量，改成本地消息表 + Kafka 异步消费，并处理消费幂等。

## 架构怎么长出来的

${stagesBlock([
  ['STEP 1', '削峰', '阻塞队列扛第一波', '下单请求先进内存队列，后台线程慢慢消费。问题很直接：重启即丢，多实例各排各的队。', ['BlockingQueue', '单机', '可丢弃']],
  ['STEP 2', '原子性', '把判断和扣减压成一段 Lua', '库存查询与扣减分成两步就会超卖。改成一段 Lua 脚本在 Redis 侧原子执行，超卖消失。', ['Lua', 'Redis', '原子扣减']],
  ['STEP 3', '一致性', '锁住「同一个人」', '多实例部署后，同一用户并发下单会重复扣减。用 Redisson 分布式锁按用户 id 串行化，一人一单成立。', ['Redisson', '分布式锁', '一人一单']],
  ['STEP 4', '异步', '落库走消息，不走同步', '同步写 MySQL 是整条链路的瓶颈。改为本地消息表 + Kafka 异步消费，并对消费端做幂等。', ['Kafka', '本地消息表', '幂等']],
  ['STEP 5', 'AI', '让客服能动手', '在既有交易系统上加 LangChain4j 智能客服：AI 只负责提议，用户二次确认后才执行，写操作复用既有消息链路。', ['LangChain4j', 'Function Calling', '二次确认']],
])}

## 我解决过的工程问题

${caseBlock('critical', 'AI 直接调写操作：模型说「帮你退了」，其实没退', [
  ['问题', '客服模块最初让模型直接调工具，包括取消订单、申请退款这类写操作。'],
  ['后果', '模型会在用户只是抱怨时提前发起写操作，也会在参数缺失时编一个订单号。<b>对话里说「已为你取消」，数据库里订单还在。</b>这比答不出来严重得多。'],
  ['方案', '定下<b>「AI 提议，用户确认，系统执行」</b>三段式：模型只能生成一个待确认的意图对象，前端渲染成可点的确认卡，用户点了才走既有服务方法。'],
  ['取舍', '为什么不让模型自己判断该不该确认？因为「该不该动数据」是权限问题，不是语义问题，不能交给概率模型决定。'],
])}

${caseBlock('important', '客服模块一行表都没加，却要读写交易库', [
  ['问题', '最省事的做法是给 Agent 建几张会话表、工具日志表。但这样它就成了一个需要独立运维的子系统。'],
  ['方案', '约束自己<b>不新增任何数据库表</b>：会话上下文放 Redis 带 TTL，工具调用复用已有的服务方法与消息链路，审计落到现有日志管线。'],
  ['验证', '最终交付时 <code>git diff --stat</code> 里 0 张新增表的 DDL；Agent 模块 1849 行代码全在既有结构内。'],
])}

${caseBlock('important', '消息消费重试，同一笔订单扣了两次库存', [
  ['问题', 'Kafka 消费端异常会重试，但下单消息的重试不是「重放」，是<b>再执行一遍业务</b>。'],
  ['后果', '用户看到一次下单，库存掉了 2。这类问题只在流量起来时才暴露，本地单线程测永远测不到。'],
  ['方案', '消费端按<b>业务幂等键</b>（用户 + 优惠券 + 时间片）落库前查重，重复消息直接 ack 丢弃，而不是依赖 at-least-once 语义蒙混过关。'],
])}

## 一段关键实现

秒杀扣减的 Lua 脚本：把「查库存、判断是否已售罄、扣减」压进一次 Redis 原子执行。

\`\`\`lua
-- seckill.lua —— 单脚本内完成判断与扣减，杜绝「查完再扣」之间的窗口
local stockKey = KEYS[1]
local orderKey = KEYS[2]
local userId   = ARGV[1]

-- 同一用户重复请求直接短路，不消耗库存
if redis.call('SISMEMBER', orderKey, userId) == 1 then
  return 2
end

local stock = tonumber(redis.call('GET', stockKey) or '-1')
if stock <= 0 then
  return 1   -- 已售罄
end

redis.call('DECR', stockKey)
redis.call('SADD', orderKey, userId)
return 0     -- 扣减成功
\`\`\`

## 已知限制

${limitsBlock([
  'Agent 模块的工具是硬编码注册的，没有做成插件化，加第 7 个工具要改构建期代码。',
  '会话上下文只存 Redis 且带 TTL，服务重启后超过 TTL 的历史对话不可恢复。',
  '秒杀链路的压测是在单机 Docker 环境做的，没有真正验证多机房部署下的时钟与锁表现。',
  'LangChain4j 的模型调用没有做降级兜底：模型服务不可用时，客服模块整体不可用而不是退化成人工话术。',
])}

${sourcesBlock([
  ['Redis 官方文档 · Lua 脚本与 EVAL', 'https://redis.io/docs/latest/develop/interact/programmability/eval-intro/', 'official'],
  ['Redisson 官方文档 · 分布式锁', 'https://redisson.pro/docs/data-and-services/locks-and-synchronizers/', 'official'],
  ['Apache Kafka 官方文档 · 消费者与投递语义', 'https://kafka.apache.org/documentation/#semantics', 'official'],
  ['LangChain4j 官方文档 · Tools (Function Calling)', 'https://docs.langchain4j.dev/tutorials/tools/', 'official'],
])}
`;

// ============================================================
// 03 智学云课堂
// ============================================================
const zhixue = `---
title: 智学云课堂 · 在线教育微服务系统
subtitle: 十六个微服务模块，一个一个实现、一个一个调通
role: 独立完成
nature: 个人项目
status: completed
year: '2026'
order: 3
stack: [SpringCloud, Nacos, Redisson, RabbitMQ, XXL-JOB, Caffeine, MySQL, Redis]
metrics:
  - { value: '16', label: '微服务模块' }
  - { value: '66', label: '完成学习目标' }
  - { value: '12', label: '业务章节' }
  - { value: '4', label: '分布式锁封装' }
---

${IMPORTS}
## 这个项目做了什么

智学云课堂是一个在线教育平台的后端系统。我依据课程讲义与学习目标，
把十六个微服务模块逐个实现并调通，覆盖学习计划与进度、互动问答、点赞系统、
积分签到、实时排行榜、优惠券管理与优惠方案推荐。

和城觅不同，这个项目的重点不在某一条链路的极限性能，而在**模块之间的协作边界**：
哪些状态该放 Redis、哪些该落库、定时任务和实时请求怎么不互相打架、
缓存与数据库的一致性由谁来保证。

## 架构怎么长出来的

${stagesBlock([
  ['M1', '骨架', '先把服务注册与调用跑通', 'Nacos 做注册中心与配置中心，OpenFeign 做服务间调用，网关统一入口与鉴权。这一层不跑通，后面全是空中楼阁。', ['Nacos', 'OpenFeign', 'Gateway']],
  ['M2', '学习', '计划、进度与互动', '学习计划生成、进度上报、互动问答。状态变更频繁但只关心最终值，进度这类热数据放 Redis 而不是每次都写库。', ['学习计划', '进度', '互动问答']],
  ['M3', '互动', '点赞要防重复，也要能扛读', '点赞是典型的「写少读多 + 必须去重」。用 Redis Set 记录谁点过，计数走缓存，落库异步化。', ['点赞', '去重', 'Caffeine']],
  ['M4', '激励', '积分签到与实时排行榜', '签到用 BitMap 把「某月哪天签过」压进一个整数，排行榜用 Redis ZSet 实时排序，历史榜单分表落库。', ['BitMap', 'ZSet', '排行榜']],
  ['M5', '交易', '优惠券与优惠方案推荐', '券的领取、核销要防超发，用分布式锁封装统一处理；优惠方案推荐按用户已有券与订单金额算最优组合。', ['优惠券', '分布式锁', '推荐']],
  ['M6', '批处理', '定时任务与历史数据沉降', 'XXL-JOB 跑批把热点榜单沉降成历史榜单并分表持久化，减轻 Redis 与主表的长期压力。', ['XXL-JOB', '分表', '沉降']],
])}

## 我解决过的工程问题

${caseBlock('critical', '签到用「查一次再写一次」，跨月那天算错了两天', [
  ['问题', '签到最初按「读上次签到日期 → 判断是否连续 → 更新连续天数」实现，两步之间没有原子性。'],
  ['后果', '用户跨零点、或跨月最后一天点签到时，两次请求都读到同一份旧状态，<b>连续天数被加了两遍，或者整月记录被重置。</b>'],
  ['方案', '签到标记改用 <b>BitMap</b>（一个用户一个月一个整数），连续天数从 BitMap 现算而不是存状态，读改写变成幂等的位或操作。'],
  ['验证', '补边界用例：跨日、跨月、重复点击、断签后重签，四种场景的连续天数与位图都符合预期。'],
])}

${caseBlock('important', '四个模块各写了一遍分布式锁，四份都有点毛病', [
  ['问题', '点赞去重、券领取、秒杀、签到各写了一份加锁逻辑，每份细节都不同。'],
  ['后果', '有的忘了 finally 释放，有的锁过期时间拍脑袋写死，有的没处理重入。<b>同一类问题被修了四次，还修得不一致。</b>'],
  ['方案', '抽出一层<b>分布式锁封装</b>（基于 Redisson）：统一的 key 命名、统一的超时与等待策略、统一的失败返回，四个调用点只关心业务语义。'],
  ['取舍', '为什么不做成注解式 AOP？因为锁的粒度与业务强相关，注解很容易被误用到「锁了一整个方法」的位置。'],
])}

${caseBlock('important', '排行榜的实时榜单和历史榜单对不上', [
  ['问题', '实时榜单在 Redis ZSet，历史榜单靠 XXL-JOB 跑批落库分表。跑批失败或重复执行时两边数据会错位。'],
  ['方案', '跑批做成<b>按周期幂等</b>：以周期为唯一键写入历史表，重复执行是覆盖而不是追加；实时 ZSet 只在写成功后清理，失败则保留等待下次重跑。'],
  ['验证', '手动中止一次跑批再重跑，验证历史表不出现重复周期记录。'],
])}

## 一段关键实现

BitMap 签到与连续天数计算：把「本月哪天签过」压进一个整数，连续天数从位图现算。

\`\`\`java
/** 签到：本月第 day 天置位，返回是否首次签到（幂等） */
public boolean signIn(Long userId, LocalDate date) {
    String key = "sign:" + userId + ":" + date.getYear() + date.getMonthValue();
    int offset = date.getDayOfMonth() - 1;

    // setbit 返回的是「原来那一位的值」：1 说明今天已经签过
    boolean firstTime = redis.opsForValue().setBit(key, offset, true) == false;
    if (!firstTime) return false;

    // 连续天数不存状态，直接从位图往前数，天然幂等
    int streak = 0;
    for (int i = offset; i >= 0; i--) {
        if (!redis.opsForValue().getBit(key, i)) break;
        streak++;
    }
    updateStreakCache(userId, streak);
    return true;
}
\`\`\`

## 已知限制

${limitsBlock([
  '未接入链路追踪，一个跨五个服务的调用出问题时要靠日志时间戳人工拼链路。',
  '优惠方案推荐是规则计算，不是模型推荐；规则数量上去以后维护成本会明显变高。',
  '缓存与数据库的一致性用的是「先写库再删缓存」，没有处理删除失败的重试补偿。',
  'XXL-JOB 的跑批是单机执行器，没有做分片广播，历史榜单数据量再大就只能加长执行窗口。',
])}

${sourcesBlock([
  ['Redis 官方文档 · Bitmaps', 'https://redis.io/docs/latest/develop/data-types/bitmaps/', 'official'],
  ['Redis 官方文档 · Sorted sets', 'https://redis.io/docs/latest/develop/data-types/sorted-sets/', 'official'],
  ['XXL-JOB 官方文档 · 分布式任务调度', 'https://www.xuxueli.com/xxl-job/', 'official'],
  ['Spring Cloud Alibaba · Nacos 配置与服务发现', 'https://sca.aliyun.com/en/docs/2023/user-guide/nacos/quick-start/', 'official'],
])}
`;

mkdirSync(DIR, { recursive: true });
const files = { 'mewhelp.mdx': mewhelp, 'chengmi.mdx': chengmi, 'zhixue.mdx': zhixue };
for (const [name, body] of Object.entries(files)) {
  writeFileSync(resolve(DIR, name), body, 'utf8');
  console.log('wrote', name, body.length, 'bytes');
}
