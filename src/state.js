// ── STATE ─────────────────────────────────────────────────────────────────────

// localStorage keys. Legacy keys (from the app's "L5 Prep" days) are copied over
// once so existing browser data survives the rename.
export const KEYS = {
  data: 'aip_data',
  lang: 'aip_lang',
  provider: 'aip_provider',
  apiKey: 'aip_api_key',
  geminiKey: 'aip_gemini_key',
  openaiKey: 'aip_openai_key',
  syncTs: 'aip_sync_ts',
}
const _LEGACY_KEYS = {
  data: 'l5v3', lang: 'l5lang', provider: 'l5provider', apiKey: 'l5_api_key',
  geminiKey: 'l5_gemini_key', openaiKey: 'l5_openai_key', syncTs: 'l5sync_ts',
}
for (const [k, legacy] of Object.entries(_LEGACY_KEYS)) {
  const old = localStorage.getItem(legacy)
  if (old !== null && localStorage.getItem(KEYS[k]) === null) localStorage.setItem(KEYS[k], old)
}

// Categories for the behavioral question bank, in display order.
export const BQ_CATEGORIES = ['Motivation', 'Learning', 'Teamwork', 'Conflict', 'Failure', 'Ownership', 'Ambiguity', 'User Focus']

function _defaultBqStore() {
  const make = (id, category, question) => ({ id, question, category, isBuiltIn: true, linkedStoryId: null, tunedAnswer: null })
  return [
    make('bq_intern_01', 'Motivation',  'Tell me about yourself.'),
    make('bq_intern_02', 'Motivation',  'Why software engineering, and why now? What drew you from your previous path into building software?'),
    make('bq_intern_03', 'Motivation',  'Why do you want to intern here, and what do you hope to learn this summer?'),
    make('bq_intern_04', 'Learning',    'Tell me about a time you had to learn a new technology quickly to deliver something.'),
    make('bq_intern_05', 'Learning',    'Describe a technical concept you found hard to understand. How did you get unstuck?'),
    make('bq_intern_06', 'Teamwork',    'Tell me about a team project. What was your specific contribution?'),
    make('bq_intern_07', 'Teamwork',    'Describe a time you asked for help or received critical feedback. What did you do with it?'),
    make('bq_intern_08', 'Conflict',    'Tell me about a time you disagreed with a teammate or partner. How did you resolve it?'),
    make('bq_intern_09', 'Failure',     'Tell me about a time something you built did not work as expected. How did you debug and recover?'),
    make('bq_intern_10', 'Failure',     'Describe a mistake you made and what you changed afterwards.'),
    make('bq_intern_11', 'Ownership',   'Tell me about a project you took from idea to a finished, working product.'),
    make('bq_intern_12', 'Ownership',   'Describe a time you balanced several deadlines at once, such as coursework, projects, and work.'),
    make('bq_intern_13', 'Ambiguity',   'Tell me about a time you started a task with unclear requirements. How did you decide what to build?'),
    make('bq_intern_14', 'Ambiguity',   'Describe a time you had to make a technical decision without knowing the right answer. How did you choose?'),
    make('bq_intern_15', 'User Focus',  'Tell me about a time you used user feedback or data to change what you were building.'),
    make('bq_intern_16', 'User Focus',  'Describe a time you had to explain a technical idea to a non-technical person.'),
  ]
}

function _initS() {
  const s = JSON.parse(localStorage.getItem(KEYS.data) || 'null') || {
    folders: [{ id: 'f1', name: 'Distributed Systems', icon: '⚡', open: true }],
    chapters: []
  }
  if (!s.behavioral) s.behavioral = { resumes: [], stories: [], bqStore: _defaultBqStore() }
  else {
    if (!s.behavioral.resumes) {
      // Migrate old format (flat resumeText + bullets) → resumes array
      const oldBullets = (s.behavioral.bullets || []).map(b => ({
        id: b.id || _uid(), text: b.text, role: b.role || 'Experience',
        hmQuestions: (b.hmQuestions || []).map(q => typeof q === 'string' ? { id: _uid(), text: q, answer: '' } : { ...q, answer: q.answer || '' }),
        questionsGenerated: (b.hmQuestions || []).length > 0
      }))
      s.behavioral.resumes = oldBullets.length > 0
        ? [{ id: _uid(), name: 'Imported Resume', text: s.behavioral.resumeText || '', bullets: oldBullets, createdAt: new Date().toISOString() }]
        : []
      delete s.behavioral.bullets; delete s.behavioral.resumeText
    }
    if (!s.behavioral.bqStore) s.behavioral.bqStore = _defaultBqStore()
  }
  if (!s.jobPrep) s.jobPrep = { companies: [] }
  if (!s.aggregator) s.aggregator = { title: '', result: '', updatedAt: null }
  if (!s.coding) s.coding = { attempts: {}, generated: [] }
  return s
}

function _uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

export const state = {
  S: _initS(),
  activeCid: null,
  activeTab: 'knowledge',
  quizState: null,
  setupModes: {},
  dragState: null,
  behavioralTab: 'resume',   // kept for backward compat, not used for routing
  bqTab: 'bqstore',          // 'bqstore' | 'storystore'
  bqDetailId: null,          // string id of BQ being viewed in detail, null = list
  bhResumeId: null,
  bhBulletId: null,
  bhAddingResume: false,
  editingStoryId: null,
  jobPrepView: null,         // null = home | { type: 'company', name } | { type: 'posting', id }
  apiKey: '',
  geminiKey: '',
  openaiKey: '',
  provider: localStorage.getItem(KEYS.provider) || 'claude', // 'claude' | 'gemini' | 'openai'
  lang: localStorage.getItem(KEYS.lang) || 'zh',
  // Flashcard session state (ephemeral — not persisted)
  fcSession: [],       // card objects for current pass
  fcIdx: 0,           // index into fcSession
  fcFlipped: false,   // is current card face-up (showing back)?
  fcSessionCid: null, // which chapter this session belongs to
}

let _syncCb = null
/** Called once by main.js after sync.js is initialised. Avoids circular imports. */
export function setSyncCallback(fn) { _syncCb = fn }

export function save() {
  localStorage.setItem(KEYS.data, JSON.stringify(state.S))
  if (_syncCb) _syncCb()
}
export function gch() { return state.S.chapters.find(c => c.id === state.activeCid) }
export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

export const BH_COMPETENCIES = ['Learning Agility', 'Ownership', 'Collaboration', 'Communication', 'Problem Solving', 'Technical Depth', 'Ambiguity', 'User Focus']
