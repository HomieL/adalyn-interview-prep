// ── PROGRESS DASHBOARD ────────────────────────────────────────────────────────
import { state } from './state.js'
import { t } from './i18n.js'
import { esc } from './util.js'
import { codingStats } from './coding.js'

export function renderDashboard() {
  const chapters = state.S.chapters
  if (chapters.length === 0) {
    document.getElementById('mainContent').innerHTML = `
      <div class="dash-wrap">
        <div class="dash-hd">
          <div class="dash-icon">📊</div>
          <div>
            <div class="dash-title">${t('备考进度总览', 'Progress Dashboard')}</div>
            <div class="dash-sub">${t('追踪编程练习、行为面试准备与各章节学习进度', 'Track coding practice, behavioral prep, and study progress')}</div>
          </div>
        </div>
        ${_prepHtml()}
        <div class="empty-state" style="padding:40px 0">
          <div class="empty-icon">📚</div>
          <div class="empty-text">${t('暂无章节。<br>从欢迎页面添加技术文档开始备考。', 'No chapters yet.<br>Add a technical doc from the welcome page to start.')}</div>
        </div>
        ${_buildRecommendations([])}
      </div>`
    return
  }

  // ── Aggregate stats ──────────────────────────────────────────────────────────
  let totalQuizSessions = 0, totalScore = 0, totalScoreCount = 0
  let totalFcKnown = 0, totalFcCards = 0
  let notStarted = 0, inProgress = 0, mastered = 0

  const rows = chapters.map(c => {
    const history = c.quizHistory || []
    const fcCards = c.flashcards?.length || 0
    const fcKnown = c.flashcardProgress
      ? Object.values(c.flashcardProgress).filter(v => v === 'known').length : 0
    const fcLearning = c.flashcardProgress
      ? Object.values(c.flashcardProgress).filter(v => v === 'learning').length : 0

    totalQuizSessions += history.length
    totalFcCards += fcCards
    totalFcKnown += fcKnown

    const scores = history.map(h => Math.round(h.score / h.total * 100))
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    const bestScore = scores.length > 0 ? Math.max(...scores) : null

    if (avgScore !== null) { totalScore += avgScore; totalScoreCount++ }

    // Readiness status
    let status = 'new'
    if (avgScore !== null && avgScore >= 80 && fcCards > 0 && fcKnown / fcCards >= 0.8) {
      status = 'mastered'; mastered++
    } else if (history.length > 0 || fcKnown > 0) {
      status = 'progress'; inProgress++
    } else {
      notStarted++
    }

    return { c, history, fcCards, fcKnown, fcLearning, avgScore, bestScore, scores, status }
  })

  const overallAvg = totalScoreCount > 0 ? Math.round(totalScore / totalScoreCount) : null
  const readinessPct = chapters.length > 0
    ? Math.round((mastered * 1 + inProgress * 0.5) / chapters.length * 100) : 0

  // ── Render ───────────────────────────────────────────────────────────────────
  document.getElementById('mainContent').innerHTML = `
    <div class="dash-wrap">
      <div class="dash-hd">
        <div class="dash-icon">📊</div>
        <div>
          <div class="dash-title">${t('备考进度总览', 'Progress Dashboard')}</div>
          <div class="dash-sub">${t('追踪编程练习、行为面试准备与各章节学习进度', 'Track coding practice, behavioral prep, and study progress')}</div>
        </div>
      </div>

      <div class="dash-stat-grid">
        <div class="dash-stat-card">
          <div class="dash-stat-n">${chapters.length}</div>
          <div class="dash-stat-l">📚 ${t('章节数', 'Chapters')}</div>
        </div>
        <div class="dash-stat-card">
          <div class="dash-stat-n">${totalQuizSessions}</div>
          <div class="dash-stat-l">🎯 ${t('Quiz 次数', 'Quiz Sessions')}</div>
        </div>
        <div class="dash-stat-card">
          <div class="dash-stat-n">${overallAvg !== null ? overallAvg + '%' : '—'}</div>
          <div class="dash-stat-l">📈 ${t('平均得分', 'Avg Score')}</div>
        </div>
        <div class="dash-stat-card">
          <div class="dash-stat-n">${totalFcCards > 0 ? totalFcKnown + '/' + totalFcCards : '—'}</div>
          <div class="dash-stat-l">🃏 ${t('已掌握闪卡', 'Flashcards Known')}</div>
        </div>
      </div>

      <div class="dash-readiness">
        <div class="dash-readiness-label">
          ${t('整体备考就绪度', 'Overall Readiness')}
          <span class="dash-readiness-pct">${readinessPct}%</span>
        </div>
        <div class="dash-readiness-bar">
          <div class="dash-readiness-fill" style="width:${readinessPct}%;background:${readinessPct >= 80 ? 'var(--green)' : readinessPct >= 50 ? 'var(--accent)' : 'var(--yellow)'}"></div>
        </div>
        <div class="dash-legend">
          <span class="dash-legend-item"><span class="dash-dot" style="background:var(--green)"></span>${mastered} ${t('已精通', 'Mastered')}</span>
          <span class="dash-legend-item"><span class="dash-dot" style="background:var(--accent)"></span>${inProgress} ${t('进行中', 'In Progress')}</span>
          <span class="dash-legend-item"><span class="dash-dot" style="background:var(--muted2)"></span>${notStarted} ${t('未开始', 'Not Started')}</span>
        </div>
      </div>

      ${_prepHtml()}

      <div class="dash-section-hd">${t('章节详情', 'Chapter Breakdown')}</div>
      <div class="dash-chapter-list">
        ${rows.map(({ c, history, fcCards, fcKnown, avgScore, bestScore, status }) => {
          const locale = state.lang === 'en' ? 'en-US' : 'zh-CN'
          const lastDate = history.length > 0
            ? new Date(history[0].date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
            : null
          const scoreColor = bestScore === null ? '' : bestScore >= 80 ? 'good' : bestScore >= 60 ? 'ok' : 'bad'
          const statusBadge = {
            mastered: `<span class="dash-status mastered">${t('精通', 'Mastered')}</span>`,
            progress: `<span class="dash-status progress">${t('进行中', 'In Progress')}</span>`,
            new:      `<span class="dash-status new-ch">${t('未开始', 'New')}</span>`,
          }[status]

          return `
          <div class="dash-ch-row" onclick="selCh('${c.id}')">
            <div class="dash-ch-info">
              <div class="dash-ch-name">${esc(c.name)}</div>
              ${lastDate ? `<div class="dash-ch-meta">${t('上次:', 'Last:')} ${lastDate}</div>` : ''}
            </div>
            <div class="dash-ch-quiz">
              ${history.length > 0 ? `
                <span class="qh-score ${scoreColor}" style="font-size:12px">${t('最高', 'Best')} ${bestScore}%</span>
                <span style="font-size:11px;color:var(--muted)">${history.length} ${t('次', 'runs')}</span>
              ` : `<span style="font-size:11px;color:var(--muted2)">${t('未测验', 'No quizzes')}</span>`}
            </div>
            <div class="dash-ch-fc">
              ${fcCards > 0
                ? `<span style="font-size:12px;color:var(--text2)">🃏 ${fcKnown}/${fcCards}</span>`
                : `<span style="font-size:11px;color:var(--muted2)">${t('无闪卡', 'No cards')}</span>`}
            </div>
            <div>${statusBadge}</div>
          </div>`
        }).join('')}
      </div>

      ${_buildRecommendations(rows)}
    </div>`
}

// ── Coding + behavioral prep stats ─────────────────────────────────────────────

function _bqStats() {
  const bh = state.S.behavioral || {}
  const stories = bh.stories || []
  const bqs = bh.bqStore || []
  const linked = bqs.filter(b => b.linkedStoryId && stories.some(s => s.id === b.linkedStoryId)).length
  const answered = (bh.resumes || []).flatMap(r => r.bullets || []).flatMap(b => b.hmQuestions || []).filter(q => q.answer?.trim()).length
  return { total: bqs.length, linked, stories: stories.length, answered }
}

function _prepHtml() {
  const cs = codingStats()
  const bq = _bqStats()
  return `
      <div class="dash-section-hd">${t('面试准备', 'Interview Prep')}</div>
      <div class="dash-stat-grid">
        <div class="dash-stat-card" style="cursor:pointer" onclick="selCoding()">
          <div class="dash-stat-n">${cs.solved}/${cs.total}</div>
          <div class="dash-stat-l">💻 ${t('编程题已通过', 'Coding Solved')}</div>
        </div>
        <div class="dash-stat-card" style="cursor:pointer" onclick="selBqPrep()">
          <div class="dash-stat-n">${bq.linked}/${bq.total}</div>
          <div class="dash-stat-l">🎯 ${t('BQ 已关联故事', 'BQs with a Story')}</div>
        </div>
        <div class="dash-stat-card" style="cursor:pointer" onclick="selBqPrep()">
          <div class="dash-stat-n">${bq.stories}</div>
          <div class="dash-stat-l">📖 ${t('STAR 故事', 'STAR Stories')}</div>
        </div>
        <div class="dash-stat-card" style="cursor:pointer" onclick="selResume()">
          <div class="dash-stat-n">${bq.answered}</div>
          <div class="dash-stat-l">📄 ${t('简历追问已作答', 'Resume Q&As')}</div>
        </div>
      </div>`
}

function _prepRecs() {
  const recs = []
  const cs = codingStats()
  if (cs.untouchedPatterns.length) {
    const names = cs.untouchedPatterns.slice(0, 4).join(', ') + (cs.untouchedPatterns.length > 4 ? '…' : '')
    recs.push({ onclick: 'selCoding()', title: t('编程练习', 'Coding Practice'),
      sub: t(`还未练习的题型：${names}`, `Patterns not practiced yet: ${names}`) })
  }
  const bq = _bqStats()
  if (bq.total > bq.linked) {
    recs.push({ onclick: 'selBqPrep()', title: t('BQ 备考', 'BQ Prep'),
      sub: t(`${bq.total - bq.linked} 道行为题还没有关联 STAR 故事`, `${bq.total - bq.linked} behavioral questions have no STAR story yet`) })
  }
  return recs
}

function _buildRecommendations(rows) {
  const needs = rows.filter(r => r.status === 'new' || (r.avgScore !== null && r.avgScore < 70))
  const prepRecs = _prepRecs()
  const prepItems = prepRecs.map(r => `
        <div class="dash-rec-item" onclick="${r.onclick}">
          <span class="dash-rec-dot"></span>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(r.title)}</div>
            <div style="font-size:11px;color:var(--muted)">${esc(r.sub)}</div>
          </div>
        </div>`).join('')
  if (needs.length === 0 && prepRecs.length === 0) return `
    <div class="dash-section-hd" style="margin-top:20px">🎉 ${t('备考建议', 'Recommendations')}</div>
    <div class="dash-rec-box dash-rec-great">
      ${t('所有章节表现良好！继续保持，拿下实习 offer！', 'All chapters looking great! Keep it up — you\'re on track for that internship!')}
    </div>`

  return `
    <div class="dash-section-hd" style="margin-top:20px">💡 ${t('备考建议', 'Recommendations')}</div>
    <div class="dash-rec-list">
      ${prepItems}
      ${needs.map(({ c, status, avgScore }) => `
        <div class="dash-rec-item" onclick="selCh('${c.id}')">
          <span class="dash-rec-dot"></span>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.name)}</div>
            <div style="font-size:11px;color:var(--muted)">
              ${status === 'new'
                ? t('尚未开始 — 建议先阅读知识框架并生成 Flashcard', 'Not started — review knowledge framework and generate flashcards')
                : t(`平均得分 ${avgScore}% — 建议再次测验巩固`, `Avg score ${avgScore}% — take another quiz to reinforce`)}
            </div>
          </div>
        </div>`).join('')}
    </div>`
}
