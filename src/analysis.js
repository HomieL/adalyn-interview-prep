// ── ANALYSIS ──────────────────────────────────────────────────────────────────
import { invoke } from '@tauri-apps/api/core'
import { t } from './i18n.js'
import { updateLoading } from './util.js'
import { claude } from './api.js'
import { TARGET, TARGET_BAR_ZH } from './target.js'

// Cap paste/file content to avoid blowing the context window.
// URL content is already capped at 12 000 chars by the Rust fetch_url command.
const PASTE_CAP = 25_000

export async function buildAnalysis(name, url, pasteContent = '') {
  const sys = `你是一名经验丰富的软件工程师兼面试官，正在为备考${TARGET.roleZh}面试的候选人撰写中文学习笔记。

${TARGET_BAR_ZH}

【核心原则】：
- 先讲清楚「它是什么、解决什么问题」，再讲「为什么这样设计」和关键权衡
- 从基础原理讲起，循序渐进，让有扎实 CS 基础但缺少工业经验的候选人能读懂
- 所有输出使用中文（技术术语、组件名、配置参数除外）
- 使用 Markdown 格式：多用对比表格、ASCII 架构图、编号步骤
- 代码规则：仅在必须说明关键算法思路时，用 5 行以内的伪代码；禁止粘贴完整类/函数实现
- 必须完整覆盖参考文档中的所有重要知识点`

  // Step 1 – obtain page content (fetched or pasted)
  let pageContent = pasteContent
    ? pasteContent.slice(0, PASTE_CAP)
    : ''

  if (!pageContent) {
    updateLoading(t('正在获取页面内容…', 'Fetching page content…'), url)
    try {
      pageContent = await invoke('fetch_url', { url })
    } catch (fetchErr) {
      pageContent = `[注：页面内容自动获取失败（${fetchErr}）— 以下分析基于 AI 训练知识]`
    }
  }

  // Step 2 – three parallel deep-analysis calls
  updateLoading(t('正在 AI 深度分析…', 'AI deep-analyzing…'), `Claude ${t('正在解析', 'is analyzing')}「${name}」`)

  const context = `参考文档：${url}\n\n文档内容（请仔细阅读并确保覆盖其中所有重要知识点）：\n${pageContent}\n\n---\n\n`

  const [p1, p2, p3] = await Promise.all([

    // ── Part 1: Concepts + Architecture + Data Flow ────────────────────────────
    claude(sys,
      context +
      `请为「${name}」撰写学习笔记第一部分。

## 🔑 核心概念与术语词典
列出文档中出现的**所有**重要技术术语（不限数量）。
每条格式：**术语** — 精确定义（1-2句）+ 它在系统中的作用 + 为什么面试中可能会被问到。

## 🏗️ 系统架构
- 用 ASCII art 或分层文字描述整体架构（组件、层次、边界）
- 逐一介绍每个核心组件：职责是什么、内部如何组织、与其他组件如何交互
- 说明使用的设计模式（如 Pub/Sub、分片、主从、一致性哈希）及选择理由
- 如有多个子系统，每个单独成段

## 🔄 数据流与生命周期
- 一个请求/数据从入口到出口的完整路径，逐步骤描述每个阶段发生什么
- 关键状态转换和异步处理机制
- 用文字版序列图描述核心交互（格式：Client → ComponentA → ComponentB → ...）`, 6000),

    // ── Part 2: Design Decisions + Performance + Comparisons ──────────────────
    claude(sys,
      context +
      `请为「${name}」撰写学习笔记第二部分。聚焦设计决策、性能特征和横向对比。

## ⚙️ 核心设计决策与权衡
对于每个关键设计选择，说明：
- **选择了什么**（数据结构、存储引擎、通信协议、一致性模型等）
- **为什么这样选**（性能、一致性、运维复杂度等驱动因素）
- **放弃了什么**（这个选择牺牲了哪些特性）
不需要贴实现代码——用一两句话解释清楚设计意图即可。

## 📊 性能特征与可扩展性
- 各操作的时间复杂度（读/写/扫描/删除）
- 吞吐量量级、延迟特征、关键瓶颈
- 水平扩展 vs 垂直扩展策略
- CAP 定理定位：CP 还是 AP？在什么场景下会牺牲哪个保证？
- 容量估算参考数字（如有：每秒请求数、存储容量等）

## ⚖️ 与替代方案的横向对比
创建对比表格，列：方案 | 适用场景 | 核心优势 | 核心劣势 | 典型生产案例
涵盖文档中提到的所有替代方案，以及面试中常被拿来比较的相关技术。

## 🔧 适用场景与反模式
- 最适合的场景（附理由）
- 不应使用的场景（附理由）
- Google/Netflix/Amazon 等公司的真实使用案例`, 6000),

    // ── Part 3: Best Practices + Pitfalls + Interview Focus + Q&A ───────────
    claude(sys,
      context +
      `请为「${name}」撰写学习笔记第三部分。聚焦实战经验和实习面试应对。

## ✅ 最佳实践
用 bullet list 列出所有重要最佳实践（配置选项、使用模式、容量规划、监控运维）。
每条说明「为什么」，而不只是「做什么」。

## ⚠️ 常见陷阱与误区
编号列表，格式：**陷阱名** — 描述问题 + 说明后果 + 给出正确做法。
包含：配置错误、性能陷阱、一致性误解、运维盲区、常见面试误答。

## 🎯 实习面试考点精析
列出所有实习面试中可能考察的知识点（不限数量）。
格式：**考点** → 面试官对实习生期望的回答深度 + 如何结合自己的项目经验作答。

## 💬 模拟面试 Q&A（5题）
提供 5 道典型实习面试问题（概念理解题 + 「你在项目中为什么用它」式的追问）+ 示范回答。
每道回答结构：核心答案（1-2句）→ 关键原理或权衡 → 可加分的深入补充。
回答聚焦原理理解和清晰表达，不写大段代码。`, 6000),
  ])

  return p1 + '\n\n---\n\n' + p2 + '\n\n---\n\n' + p3
}
