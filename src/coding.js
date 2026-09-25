// ── CODING PRACTICE ───────────────────────────────────────────────────────────
// Pattern-based coding interview practice: write an approach + code, ask for
// progressive hints, then get a rubric-scored review from an AI interviewer.
import { state, save, uid } from './state.js'
import { t } from './i18n.js'
import { esc, md2h } from './util.js'
import { claude, claudeJSON } from './api.js'
import { TARGET, TARGET_BAR } from './target.js'

// ── Catalogue ─────────────────────────────────────────────────────────────────

export const PATTERNS = [
  'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search',
  'Linked List', 'Trees', 'Graphs', 'Heap', 'Intervals', 'Dynamic Programming',
]

const P = (id, pattern, title, difficulty, prompt, examples, constraints = []) =>
  ({ id, pattern, title, difficulty, prompt, examples, constraints })

const PROBLEMS = [
  P('two-sum', 'Arrays & Hashing', 'Two Sum', 'easy',
    'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Exactly one valid answer exists, and you may not use the same element twice.',
    [{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' }, { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }],
    ['2 ≤ nums.length ≤ 10^4', 'Aim for better than O(n²)']),
  P('group-anagrams', 'Arrays & Hashing', 'Group Anagrams', 'medium',
    'Given a list of strings, group together the strings that are anagrams of each other. Return the groups in any order.',
    [{ input: '["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]' }],
    ['1 ≤ strs.length ≤ 10^4', 'Strings contain lowercase English letters']),
  P('top-k-frequent', 'Arrays & Hashing', 'Top K Frequent Elements', 'medium',
    'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements, in any order.',
    [{ input: 'nums = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' }],
    ['The answer is unique', 'Follow-up: can you beat O(n log n)?']),
  P('valid-palindrome', 'Two Pointers', 'Valid Palindrome', 'easy',
    'A phrase is a palindrome if, after lowercasing it and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return whether it is a palindrome.',
    [{ input: '"A man, a plan, a canal: Panama"', output: 'true' }, { input: '"race a car"', output: 'false' }],
    ['Use O(1) extra space']),
  P('container-water', 'Two Pointers', 'Container With Most Water', 'medium',
    'You are given an array `height` where each value is the height of a vertical line at that index. Pick two lines that, together with the x-axis, hold the most water. Return that maximum amount.',
    [{ input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]', output: '49', note: 'Lines at index 1 and 8: min(8, 7) × 7 = 49' }],
    ['2 ≤ height.length ≤ 10^5']),
  P('longest-unique-substring', 'Sliding Window', 'Longest Substring Without Repeating Characters', 'medium',
    'Given a string `s`, return the length of the longest substring that contains no repeated characters.',
    [{ input: '"abcabcbb"', output: '3', note: '"abc"' }, { input: '"pwwkew"', output: '3', note: '"wke"' }],
    ['0 ≤ s.length ≤ 5 × 10^4']),
  P('valid-parentheses', 'Stack', 'Valid Parentheses', 'easy',
    'Given a string containing only the characters `()[]{}`, return whether every opening bracket is closed by the same type of bracket in the correct order.',
    [{ input: '"()[]{}"', output: 'true' }, { input: '"(]"', output: 'false' }, { input: '"([)]"', output: 'false' }]),
  P('rotated-search', 'Binary Search', 'Search in Rotated Sorted Array', 'medium',
    'A sorted array of distinct integers was rotated at an unknown pivot, e.g. `[0,1,2,4,5,6,7]` became `[4,5,6,7,0,1,2]`. Given the rotated array and a `target`, return its index, or -1 if it is not present.',
    [{ input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4' }, { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', output: '-1' }],
    ['Must run in O(log n)']),
  P('reverse-list', 'Linked List', 'Reverse Linked List', 'easy',
    'Given the head of a singly linked list, reverse the list and return the new head.',
    [{ input: '1 → 2 → 3 → 4 → 5', output: '5 → 4 → 3 → 2 → 1' }],
    ['Follow-up: solve it both iteratively and recursively']),
  P('merge-sorted-lists', 'Linked List', 'Merge Two Sorted Lists', 'easy',
    'Given the heads of two sorted linked lists, merge them into one sorted list by splicing together their nodes, and return the merged head.',
    [{ input: '1 → 2 → 4 and 1 → 3 → 4', output: '1 → 1 → 2 → 3 → 4 → 4' }]),
  P('max-depth', 'Trees', 'Maximum Depth of Binary Tree', 'easy',
    'Given the root of a binary tree, return its maximum depth: the number of nodes on the longest path from the root down to a leaf.',
    [{ input: 'root = [3, 9, 20, null, null, 15, 7]', output: '3' }]),
  P('level-order', 'Trees', 'Binary Tree Level Order Traversal', 'medium',
    'Given the root of a binary tree, return the node values level by level, from left to right.',
    [{ input: 'root = [3, 9, 20, null, null, 15, 7]', output: '[[3], [9, 20], [15, 7]]' }]),
  P('num-islands', 'Graphs', 'Number of Islands', 'medium',
    'Given a 2D grid of `"1"` (land) and `"0"` (water), return the number of islands. An island is land connected horizontally or vertically and surrounded by water.',
    [{ input: '[["1","1","0","0"],\n ["1","1","0","0"],\n ["0","0","1","0"],\n ["0","0","0","1"]]', output: '3' }],
    ['1 ≤ rows, cols ≤ 300']),
  P('kth-largest', 'Heap', 'Kth Largest Element in an Array', 'medium',
    'Given an integer array `nums` and an integer `k`, return the kth largest element (by sorted order, not the kth distinct element).',
    [{ input: 'nums = [3, 2, 1, 5, 6, 4], k = 2', output: '5' }],
    ['Can you do better than sorting the whole array?']),
  P('merge-intervals', 'Intervals', 'Merge Intervals', 'medium',
    'Given a list of intervals `[start, end]`, merge all overlapping intervals and return the non-overlapping intervals that cover the same ranges.',
    [{ input: '[[1, 3], [2, 6], [8, 10], [15, 18]]', output: '[[1, 6], [8, 10], [15, 18]]' }]),
  P('climbing-stairs', 'Dynamic Programming', 'Climbing Stairs', 'easy',
    'You are climbing a staircase with `n` steps and can take 1 or 2 steps at a time. In how many distinct ways can you reach the top?',
    [{ input: 'n = 3', output: '3', note: '1+1+1, 1+2, 2+1' }],
    ['1 ≤ n ≤ 45']),
  P('coin-change', 'Dynamic Programming', 'Coin Change', 'medium',
    'Given coin denominations `coins` and a total `amount`, return the fewest coins needed to make that amount, or -1 if it cannot be made. You have unlimited coins of each type.',
    [{ input: 'coins = [1, 2, 5], amount = 11', output: '3', note: '5 + 5 + 1' }, { input: 'coins = [2], amount = 3', output: '-1' }]),
]

const LANGS = [
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
]

const DIMENSIONS = [
  ['correctness', 'Correctness', '正确性'],
  ['complexity', 'Complexity', '复杂度'],
  ['edgeCases', 'Edge Cases', '边界情况'],
  ['codeQuality', 'Code Quality', '代码质量'],
  ['communication', 'Communication', '表达思路'],
]
const VERDICTS = ['Strong Hire', 'Hire', 'Lean Hire', 'No Hire']
const PASSING = ['Strong Hire', 'Hire']
const MAX_HINTS = 3

// ── Module state ──────────────────────────────────────────────────────────────
let _currentPid = null
let _busy = false
let _openedAt = 0
let _timer = null

// ── Data helpers ──────────────────────────────────────────────────────────────

function _cs() {
  if (!state.S.coding) state.S.coding = { attempts: {}, generated: [] }
  return state.S.coding
}

function _allProblems() { return [...PROBLEMS, ..._cs().generated] }
function _getP(pid) { return _allProblems().find(p => p.id === pid) }

function _attempt(pid) {
  const cs = _cs()
  if (!cs.attempts[pid]) cs.attempts[pid] = { lang: 'python', approach: '', code: {}, hints: [], review: null, history: [] }
  return cs.attempts[pid]
}

/** 'solved' | 'attempted' | 'new' — shared with the dashboard. */
export function problemStatus(pid) {
  const a = _cs().attempts[pid]
  if (!a) return 'new'
  if (a.history?.some(h => PASSING.includes(h.verdict))) return 'solved'
  if (a.approach?.trim() || Object.values(a.code || {}).some(c => c?.trim()) || a.history?.length) return 'attempted'
  return 'new'
}

/** Summary used by the dashboard. */
export function codingStats() {
  const all = _allProblems()
  const statuses = all.map(p => ({ p, s: problemStatus(p.id) }))
  const touchedPatterns = new Set(statuses.filter(x => x.s !== 'new').map(x => x.p.pattern))
  return {
    total: all.length,
    solved: statuses.filter(x => x.s === 'solved').length,
    attempted: statuses.filter(x => x.s === 'attempted').length,
    untouchedPatterns: PATTERNS.filter(p => !touchedPatterns.has(p)),
  }
}

function _problemText(p) {
  const ex = p.examples.map((e, i) => `Example ${i + 1}:\nInput: ${e.input}\nOutput: ${e.output}${e.note ? `\n(${e.note})` : ''}`).join('\n\n')
  const cons = p.constraints?.length ? `\n\nConstraints:\n${p.constraints.map(c => '- ' + c).join('\n')}` : ''
  return `${p.title} (${p.difficulty}, pattern: ${p.pattern})\n\n${p.prompt}\n\n${ex}${cons}`
}

/** Parse a JSON object from model output: direct parse, then the outermost {...} span. */
function _parseJsonObject(raw) {
  const s = String(raw || '').trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim()
  try { return JSON.parse(s) } catch (_) {}
  const start = s.indexOf('{'), end = s.lastIndexOf('}')
  if (start > -1 && end > start) {
    try { return JSON.parse(s.slice(start, end + 1)) } catch (_) {}
  }
  return null
}

function _normalizeReview(obj) {
  const clamp = n => Math.min(4, Math.max(1, Math.round(Number(n) || 1)))
  const list = v => Array.isArray(v) ? v.map(String).filter(Boolean) : []
  const scores = {}
  DIMENSIONS.forEach(([k]) => { scores[k] = clamp(obj?.scores?.[k]) })
  return {
    scores,
    verdict: VERDICTS.includes(obj?.verdict) ? obj.verdict : 'Lean Hire',
    summary: String(obj?.summary || ''),
    timeComplexity: String(obj?.timeComplexity || ''),
    spaceComplexity: String(obj?.spaceComplexity || ''),
    bugs: list(obj?.bugs),
    missedEdgeCases: list(obj?.missedEdgeCases),
    improvements: list(obj?.improvements),
    followUp: String(obj?.followUp || ''),
  }
}

// ── Editor sync ───────────────────────────────────────────────────────────────

/** Copy editor contents into the attempt (in memory). */
function _syncEditors() {
  if (!_currentPid) return
  const a = _attempt(_currentPid)
  const code = document.getElementById('cpCode')
  const approach = document.getElementById('cpApproach')
  if (code) a.code[a.lang] = code.value
  if (approach) a.approach = approach.value
}

export function codingInput() { _syncEditors() }
export function codingCommit() { _syncEditors(); save() }

// ── Renders ───────────────────────────────────────────────────────────────────

function _header(sub) {
  return `<div class="bh-header">
      <div class="bh-title">
        <span class="bh-icon">💻</span>
        <div>
          <div class="bh-h1">${t('编程练习', 'Coding Practice')}</div>
          <div class="bh-sub">${sub}</div>
        </div>
      </div>
    </div>`
}

function _diffBadge(d) {
  const label = d[0].toUpperCase() + d.slice(1)
  return `<span class="cp-diff ${esc(d)}">${esc(label)}</span>`
}

function _statusBadge(s) {
  if (s === 'solved') return `<span class="cp-status solved">✓ ${t('已通过', 'Solved')}</span>`
  if (s === 'attempted') return `<span class="cp-status attempted">● ${t('进行中', 'Attempted')}</span>`
  return ''
}

export function renderCoding() {
  _stopTimer()
  if (_currentPid && _getP(_currentPid)) { _renderProblem(); return }
  _currentPid = null
  const { total, solved, attempted } = codingStats()
  const all = _allProblems()

  const groups = PATTERNS.map(pattern => {
    const items = all.filter(p => p.pattern === pattern)
    const rows = items.map(p => `
      <div class="cp-row" onclick="codingOpen('${p.id}')">
        <div class="cp-row-title">${esc(p.title)}${p.generated ? ` <span class="cp-gen-tag">AI</span>` : ''}</div>
        <div class="cp-row-meta">
          ${_statusBadge(problemStatus(p.id))}
          ${_diffBadge(p.difficulty)}
          ${p.generated ? `<button class="btn-icon" onclick="event.stopPropagation();codingDeleteGenerated('${p.id}')" title="${t('删除', 'Delete')}">✕</button>` : ''}
        </div>
      </div>`).join('')
    return `<div class="cp-group">
        <div class="cp-group-hd">
          <span class="bq-cat-label">${esc(pattern)}</span>
          <button class="btn-sec btn-xs" onclick="codingGenerate('${esc(pattern)}')" ${_busy ? 'disabled' : ''}>✨ ${t('AI 出新题', 'New problem')}</button>
        </div>
        ${rows}
      </div>`
  }).join('')

  document.getElementById('mainContent').innerHTML = `
    <div class="bh-view">
      ${_header(t(`按题型练习 ${TARGET.shortZh}面试高频算法题 · AI 面试官打分`, `Pattern-based practice for ${TARGET.short} coding rounds · scored by an AI interviewer`))}
      <div class="bh-body">
        <div class="cp-stats">
          <div class="dash-stat-card"><div class="dash-stat-n">${solved}/${total}</div><div class="dash-stat-l">✓ ${t('已通过', 'Solved')}</div></div>
          <div class="dash-stat-card"><div class="dash-stat-n">${attempted}</div><div class="dash-stat-l">● ${t('进行中', 'In progress')}</div></div>
          <div class="dash-stat-card cp-tip">${t(
            '面试技巧：写代码前先说出思路和复杂度，再动手；写完后用例子走一遍。',
            'Interview habit: state your approach and complexity before coding, then walk through an example after.')}</div>
        </div>
        ${_busy ? `<div class="bh-loading"><span class="spin-icon">⟳</span> ${t('AI 正在出题…', 'Generating a new problem…')}</div>` : ''}
        ${groups}
      </div>
    </div>`
}

function _renderProblem() {
  const p = _getP(_currentPid)
  const a = _attempt(p.id)
  const lang = LANGS.find(l => l.id === a.lang) || LANGS[0]

  const examples = p.examples.map((e, i) => `
    <div class="cp-example"><div class="cp-example-hd">${t('示例', 'Example')} ${i + 1}</div><pre>Input:  ${esc(e.input)}
Output: ${esc(e.output)}${e.note ? `\n        ${esc(e.note)}` : ''}</pre></div>`).join('')
  const constraints = p.constraints?.length
    ? `<ul class="cp-constraints">${p.constraints.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''

  const hints = a.hints.map((h, i) => `
    <div class="cp-hint"><span class="cp-hint-n">${t('提示', 'Hint')} ${i + 1}</span>${md2h(h)}</div>`).join('')
  const hintsLeft = MAX_HINTS - a.hints.length

  document.getElementById('mainContent').innerHTML = `
    <div class="bh-view">
      ${_header(esc(p.pattern))}
      <div class="bh-body">
        <div class="bh-page-hd">
          <button class="btn-sec" onclick="codingBackToList()">← ${t('题目列表', 'All problems')}</button>
          <h2 class="cp-title">${esc(p.title)}</h2>
          ${_diffBadge(p.difficulty)}
          ${_statusBadge(problemStatus(p.id))}
          <span class="cp-timer" id="cpTimer" title="${t('本次用时（面试通常 20–25 分钟一题）', 'Time on this problem (interviews allow ~20–25 min each)')}">⏱ 0:00</span>
        </div>
        <div class="cp-layout">
          <div class="cp-col">
            <div class="cp-problem">
              <div class="cp-prompt">${md2h(p.prompt)}</div>
              ${examples}
              ${constraints}
            </div>
            <label class="cp-label" for="cpApproach">🗣️ ${t('解题思路（先说后写）', 'Approach — say it before you code')}</label>
            <textarea class="cp-approach" id="cpApproach" rows="4" oninput="codingInput()" onchange="codingCommit()"
              placeholder="${t('例：用哈希表记录已见过的数… 时间 O(n)，空间 O(n)', 'e.g. Use a hash map from value to index… O(n) time, O(n) space')}">${esc(a.approach)}</textarea>
            <div class="ood-code-hd">
              <span class="ood-code-file">solution.${lang.ext}</span>
              <div class="ood-lang-tabs cp-lang-tabs">
                ${LANGS.map(l => `<button class="ood-lang-tab${l.id === lang.id ? ' active' : ''}" onclick="codingSwitchLang('${l.id}')">${l.label}</button>`).join('')}
              </div>
            </div>
            <textarea class="ood-textarea cp-code" id="cpCode" spellcheck="false" autocorrect="off" autocomplete="off"
              oninput="codingInput()" onchange="codingCommit()"
              placeholder="${t('在此编写代码…', 'Write your solution here…')}">${esc(a.code[lang.id] || '')}</textarea>
          </div>
          <div class="cp-col">
            <div class="cp-actions">
              <button class="btn-sec" id="cpHintBtn" onclick="codingHint()" ${hintsLeft <= 0 || _busy ? 'disabled' : ''}>
                💡 ${hintsLeft > 0 ? t(`要提示（剩 ${hintsLeft} 次）`, `Hint (${hintsLeft} left)`) : t('提示已用完', 'No hints left')}
              </button>
              <button class="btn-primary" id="cpReviewBtn" onclick="codingReview()" ${_busy ? 'disabled' : ''}>🧑‍💻 ${t('提交给面试官', 'Submit for review')}</button>
            </div>
            <div id="cpHints">${hints}</div>
            <div id="cpReview">${a.review ? _reviewHtml(a) : `<div class="cp-review-empty">${t(
              '提交后，AI 面试官会按正确性、复杂度、边界情况、代码质量和表达思路打分，并给出追问。',
              'After you submit, an AI interviewer scores correctness, complexity, edge cases, code quality, and communication, then asks a follow-up.')}</div>`}</div>
          </div>
        </div>
      </div>
    </div>`

  _wireEditor()
  _startTimer()
}

function _reviewHtml(a) {
  const r = a.review
  if (r.raw) return `<div class="cp-review"><div class="cp-review-note">${t('无法解析结构化评分，以下为原始评审：', 'Could not parse a structured scorecard; raw review below:')}</div>${md2h(r.raw)}</div>`
  const vClass = PASSING.includes(r.verdict) ? 'pass' : r.verdict === 'Lean Hire' ? 'lean' : 'fail'
  const scoreRows = DIMENSIONS.map(([k, en, zh]) => {
    const n = r.scores[k]
    return `<div class="cp-score-row">
        <span class="cp-score-label">${t(zh, en)}</span>
        <span class="cp-score-bar">${[1, 2, 3, 4].map(i => `<span class="cp-seg${i <= n ? ' on s' + n : ''}"></span>`).join('')}</span>
        <span class="cp-score-n">${n}/4</span>
      </div>`
  }).join('')
  const list = (title, items) => items.length
    ? `<div class="cp-list-hd">${title}</div><ul class="cp-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
  const hist = a.history.length > 1
    ? `<div class="cp-history">${t('历史', 'History')}: ${a.history.map(h => esc(h.verdict)).join(' → ')}</div>` : ''
  return `<div class="cp-review">
      <div class="cp-verdict-row"><span class="cp-verdict ${vClass}">${esc(r.verdict)}</span>
        ${r.timeComplexity ? `<span class="cp-complexity">${t('时间', 'Time')} ${esc(r.timeComplexity)} · ${t('空间', 'Space')} ${esc(r.spaceComplexity)}</span>` : ''}
      </div>
      ${r.summary ? `<p class="cp-summary">${esc(r.summary)}</p>` : ''}
      <div class="cp-scores">${scoreRows}</div>
      ${list('🐞 ' + t('问题', 'Bugs'), r.bugs)}
      ${list('🧪 ' + t('遗漏的边界情况', 'Missed edge cases'), r.missedEdgeCases)}
      ${list('🔧 ' + t('改进建议', 'Improvements'), r.improvements)}
      ${r.followUp ? `<div class="cp-followup"><div class="cp-list-hd">❓ ${t('面试官追问', 'Follow-up question')}</div>${esc(r.followUp)}</div>` : ''}
      ${hist}
    </div>`
}

function _wireEditor() {
  const ta = document.getElementById('cpCode')
  if (!ta) return
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = ta.selectionStart, end = ta.selectionEnd
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(end)
      ta.selectionStart = ta.selectionEnd = s + 4
      _syncEditors()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      codingReview()
    }
  })
}

function _startTimer() {
  const tick = () => {
    const el = document.getElementById('cpTimer')
    if (!el) { _stopTimer(); return }
    const sec = Math.floor((Date.now() - _openedAt) / 1000)
    el.textContent = `⏱ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
    el.classList.toggle('over', sec > 25 * 60)
  }
  tick()
  _timer = setInterval(tick, 1000)
}

function _stopTimer() { if (_timer) { clearInterval(_timer); _timer = null } }

// ── Navigation ────────────────────────────────────────────────────────────────

export function codingOpen(pid) {
  if (pid !== _currentPid) _openedAt = Date.now()
  _currentPid = pid
  renderCoding()
}

export function codingBackToList() {
  codingCommit()
  _currentPid = null
  renderCoding()
}

export function codingSwitchLang(lang) {
  codingCommit()
  _attempt(_currentPid).lang = lang
  save()
  renderCoding()
}

export function codingDeleteGenerated(pid) {
  if (!confirm(t('删除这道 AI 生成的题目？', 'Delete this AI-generated problem?'))) return
  const cs = _cs()
  cs.generated = cs.generated.filter(p => p.id !== pid)
  delete cs.attempts[pid]
  save()
  renderCoding()
}

// ── AI actions ────────────────────────────────────────────────────────────────

function _setBusy(on, btnId, label) {
  _busy = on
  const btn = document.getElementById(btnId)
  if (btn && on) { btn.disabled = true; btn.innerHTML = `<span class="spin-icon">⟳</span> ${label}` }
}

export async function codingHint() {
  if (_busy || !_currentPid) return
  codingCommit()
  const p = _getP(_currentPid), a = _attempt(p.id)
  if (a.hints.length >= MAX_HINTS) return
  const n = a.hints.length + 1
  _setBusy(true, 'cpHintBtn', t('思考中…', 'Thinking…'))
  const pid = p.id
  try {
    const sys = `You are an interviewer giving a ${TARGET.role} candidate a hint during a live coding interview. This is hint ${n} of ${MAX_HINTS}.
- Hint 1: a gentle nudge — a question to ask themselves, or which data structure or pattern to consider.
- Hint 2: the key insight that unlocks an efficient solution.
- Hint 3: a step-by-step outline of the algorithm, still without code.
Never write code and never state the full solution. Build on what the candidate has written: if they are on track, say so and point to the next step; if there is a bug, hint at where to look. At most 3 sentences.`
    const userMsg = `PROBLEM:\n${_problemText(p)}\n\nPREVIOUS HINTS:\n${a.hints.map((h, i) => `${i + 1}. ${h}`).join('\n') || '(none)'}\n\nCANDIDATE APPROACH:\n${a.approach || '(not written yet)'}\n\nCANDIDATE CODE (${a.lang}):\n${a.code[a.lang] || '(not written yet)'}`
    const hint = (await claude(sys, userMsg, 400, 'fast')).trim()
    _attempt(pid).hints.push(hint)
    save()
  } catch (err) {
    alert(t('获取提示失败：', 'Hint failed: ') + (err?.message || String(err)))
  } finally {
    _busy = false
    if (_currentPid === pid) renderCoding()
  }
}

export async function codingReview() {
  if (_busy || !_currentPid) return
  codingCommit()
  const p = _getP(_currentPid), a = _attempt(p.id)
  const code = a.code[a.lang]?.trim()
  if (!code) { alert(t('请先写代码再提交。', 'Write some code before submitting.')); return }
  const langLabel = (LANGS.find(l => l.id === a.lang) || LANGS[0]).label
  _setBusy(true, 'cpReviewBtn', t('面试官评审中…', 'Interviewer reviewing…'))
  const pid = p.id
  try {
    const sys = `You are a software engineer running a coding interview with a ${TARGET.role} candidate.

${TARGET_BAR}

Evaluate the candidate's ${langLabel} solution. Mentally run it on the examples and on edge cases before scoring. Hints used: ${a.hints.length} of ${MAX_HINTS} (using hints is fine but lowers the ceiling slightly).
Score each dimension from 1 to 4 (1 = major problems, 2 = partially there, 3 = solid, 4 = excellent):
- correctness: does it produce the right output for all valid inputs?
- complexity: is the time/space complexity optimal or near-optimal, and did the candidate state it?
- edgeCases: empty input, single element, duplicates, negatives, overflow, and so on, as relevant
- codeQuality: naming, structure, idiomatic ${langLabel}
- communication: does the written approach explain the idea and complexity clearly? Score 1 if it is empty.
verdict must be exactly one of: "Strong Hire", "Hire", "Lean Hire", "No Hire".
Return ONLY a JSON object with these keys:
{"scores":{"correctness":0,"complexity":0,"edgeCases":0,"codeQuality":0,"communication":0},"verdict":"","summary":"2-3 sentences","timeComplexity":"O(...) of the candidate's code","spaceComplexity":"O(...)","bugs":["specific bug with line or variable name"],"missedEdgeCases":["..."],"improvements":["..."],"followUp":"one follow-up question the interviewer would ask next"}`
    const userMsg = `PROBLEM:\n${_problemText(p)}\n\nCANDIDATE APPROACH:\n${a.approach || '(empty)'}\n\nCANDIDATE CODE (${langLabel}):\n\`\`\`\n${code}\n\`\`\``
    const raw = await claudeJSON(sys, userMsg, 1500, '{')
    const parsed = _parseJsonObject(raw)
    const target = _attempt(pid)
    if (parsed) {
      target.review = _normalizeReview(parsed)
      target.history.push({ date: new Date().toISOString(), verdict: target.review.verdict })
    } else {
      target.review = { raw: String(raw || '') }
    }
    save()
  } catch (err) {
    alert(t('评审失败：', 'Review failed: ') + (err?.message || String(err)))
  } finally {
    _busy = false
    if (_currentPid === pid) renderCoding()
  }
}

export async function codingGenerate(pattern) {
  if (_busy) return
  _busy = true
  renderCoding()
  try {
    const existing = _allProblems().filter(p => p.pattern === pattern).map(p => p.title).join('; ')
    const sys = `You write coding interview problems for ${TARGET.role} candidates. Create one original problem that practices the "${pattern}" pattern at easy or medium difficulty, in the style of common intern interview questions. It must differ from these existing problems: ${existing || '(none)'}.
Return ONLY a JSON object:
{"title":"...","difficulty":"easy or medium","prompt":"problem statement in 2-5 sentences; wrap identifiers in backticks","examples":[{"input":"...","output":"...","note":"optional short explanation"}],"constraints":["..."]}
Include exactly 2 examples, and make sure each example output is correct.`
    const raw = await claudeJSON(sys, `Pattern: ${pattern}`, 1200, '{', 'fast')
    const obj = _parseJsonObject(raw)
    if (!obj?.title || !obj?.prompt || !Array.isArray(obj.examples)) throw new Error(t('生成的题目格式不正确，请重试', 'The generated problem was malformed — please try again'))
    const problem = {
      id: 'gen_' + uid(),
      pattern,
      title: String(obj.title),
      difficulty: obj.difficulty === 'medium' ? 'medium' : 'easy',
      prompt: String(obj.prompt),
      examples: obj.examples.slice(0, 3).map(e => ({ input: String(e?.input ?? ''), output: String(e?.output ?? ''), note: e?.note ? String(e.note) : '' })),
      constraints: Array.isArray(obj.constraints) ? obj.constraints.map(String) : [],
      generated: true,
    }
    _cs().generated.push(problem)
    save()
    _busy = false
    codingOpen(problem.id)
    return
  } catch (err) {
    alert(t('出题失败：', 'Generation failed: ') + (err?.message || String(err)))
  }
  _busy = false
  renderCoding()
}
