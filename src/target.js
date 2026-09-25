// ── INTERVIEW TARGET ──────────────────────────────────────────────────────────
// Single source of truth for the role every AI prompt calibrates against.
// Change these strings to retarget the app (e.g. new grad instead of intern).

export const TARGET = {
  role: 'Software Engineering Intern',
  roleZh: '软件工程实习生',
  short: 'SDE Intern',
  shortZh: 'SDE 实习',
}

/** What interviewers expect from this level. Appended to evaluator/coach prompts. */
export const TARGET_BAR = `${TARGET.role} candidates are evaluated on:
- CS fundamentals: data structures, algorithms, and Big-O analysis
- Writing correct, readable code and testing it against edge cases
- Communicating their thought process clearly while solving problems
- Learning ability and coachability: using hints, asking good questions
- Genuine ownership of the projects on their resume: they can explain what they personally built, why they chose that approach, and what they would change
They are NOT expected to have led teams, influenced org-wide decisions, or designed large-scale distributed systems from scratch. Do not penalize the absence of those; do reward curiosity, clarity, and solid fundamentals.`

export const TARGET_BAR_ZH = `${TARGET.roleZh}的面试考察重点：
- 计算机基础：数据结构、算法、时间/空间复杂度分析
- 写出正确、可读的代码，并能针对边界情况进行测试
- 解题过程中清晰地表达思路
- 学习能力与可塑性：能利用提示、提出好问题
- 真正理解简历上的项目：能说清自己做了什么、为什么这样设计、如果重来会如何改进
不要求带领团队、推动跨团队决策或从零设计大规模分布式系统；应重点考察基础扎实程度、思路清晰度和求知欲。`
