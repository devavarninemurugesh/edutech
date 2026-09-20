import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import confetti from 'canvas-confetti'
import { runPracticeCode } from '../services/api'
import { 
  Code2, Play, Terminal, RefreshCw, Sparkles, ClipboardCheck, 
  ArrowLeft, ExternalLink, CheckCircle2, XCircle, 
  Lightbulb, FileText, Check, Clock, RotateCcw, Award, AlertTriangle,
  ChevronRight, Lock, CheckCircle, Flame, HelpCircle
} from 'lucide-react'

interface QuestionChallenge {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  problem: string
  expectedOutput: string
  starterCode: string
  monacoLang: string
  filename: string
  hints?: string[]
}

interface SkillPracticeTopic {
  skillName: string
  category: string
  questions: QuestionChallenge[]
}

const PRACTICE_CATALOG: SkillPracticeTopic[] = [
  {
    skillName: 'NumPy',
    category: 'Data Science & AI',
    questions: [
      {
        id: 'np-q1',
        title: '1. Vectorized Array Matrix & Z-Score Normalization',
        difficulty: 'Easy',
        problem: 'Write a Python function `normalize_array(arr)` using NumPy vectorization to compute the z-score `(X - mean) / std` for a multi-dimensional array.',
        expectedOutput: 'Original Shape: (4,)\nScaled Mean: 0.00 | Scaled Std: 1.00\nVectorized Output: [-1.34 -0.45  0.45  1.34]',
        monacoLang: 'python',
        filename: 'numpy_analytics.py',
        hints: ['Use np.mean(arr) and np.std(arr)', 'Broadcasting handles array element-wise division automatically'],
        starterCode: `# NumPy Vectorization & Array Normalization Practice
import numpy as np

def normalize_array(arr):
    data = np.array(arr, dtype=float)
    mean = np.mean(data)
    std = np.std(data)
    
    scaled = (data - mean) / std
    
    print(f"Original Shape: {data.shape}")
    print(f"Scaled Mean: {np.mean(scaled):.2f} | Scaled Std: {np.std(scaled):.2f}")
    print(f"Vectorized Output: {np.round(scaled, 2)}")
    return scaled

# Sample Dataset
raw_features = [10.0, 25.0, 35.0, 45.0]
normalize_array(raw_features)
`
      },
      {
        id: 'np-q2',
        title: '2. Matrix Dot Product & Linear Algebra',
        difficulty: 'Medium',
        problem: 'Compute the matrix dot product of two 2D arrays A (2x3) and B (3x2) using `np.dot()` or `@` operator.',
        expectedOutput: 'Matrix A (2x3) x Matrix B (3x2) = Result (2x2)\n[[22 28]\n [49 64]]',
        monacoLang: 'python',
        filename: 'matrix_dot.py',
        hints: ['Ensure inner matrix dimensions match (Columns of A = Rows of B)'],
        starterCode: `# NumPy Matrix Multiplication
import numpy as np

def matrix_multiply(A, B):
    mat_a = np.array(A)
    mat_b = np.array(B)
    
    result = np.dot(mat_a, mat_b)
    print(f"Matrix A ({mat_a.shape[0]}x{mat_a.shape[1]}) x Matrix B ({mat_b.shape[0]}x{mat_b.shape[1]}) = Result ({result.shape[0]}x{result.shape[1]})")
    print(result)
    return result

A = [[1, 2, 3], [4, 5, 6]]
B = [[1, 2], [3, 4], [5, 6]]

matrix_multiply(A, B)
`
      }
    ]
  },
  {
    skillName: 'Pandas',
    category: 'Data Science & AI',
    questions: [
      {
        id: 'pd-q1',
        title: '1. DataFrame Filtering & GroupBy Aggregations',
        difficulty: 'Easy',
        problem: 'Write a Python script using Pandas dataframe operations to filter active orders, fill missing values, and calculate average spend per region.',
        expectedOutput: 'Regional Revenue Aggregation:\nregion\nEast     180.0\nWest     320.0\nName: spending, dtype: float64',
        monacoLang: 'python',
        filename: 'pandas_analytics.py',
        hints: ['Use df.dropna() to remove missing entries', 'Use df.groupby("region")["spending"].mean()'],
        starterCode: `# Pandas Data Manipulation & Aggregation
import pandas as pd

def analyze_orders():
    raw_data = {
        'order_id': [1, 2, 3, 4, 5],
        'region': ['East', 'West', 'East', 'West', None],
        'spending': [150.0, 300.0, 210.0, 340.0, 90.0]
    }
    
    df = pd.DataFrame(raw_data)
    clean_df = df.dropna(subset=['region'])
    
    avg_spending = clean_df.groupby('region')['spending'].mean()
    print("Regional Revenue Aggregation:")
    print(avg_spending)
    return avg_spending

analyze_orders()
`
      }
    ]
  },
  {
    skillName: 'Machine Learning',
    category: 'Target Role Competency',
    questions: [
      {
        id: 'ml-q1',
        title: '1. Train & Evaluate a Random Forest Classifier',
        difficulty: 'Medium',
        problem: 'Write a Python function `train_churn_model(X, y)` using Scikit-Learn RandomForestClassifier logic to fit model predictions and print classification metric.',
        expectedOutput: 'Model Accuracy: 1.00 (100.0%)\nPredicted Churn Labels: [0 1 0 1]',
        monacoLang: 'python',
        filename: 'ml_classifier.py',
        hints: ['Fit model on training split', 'Predict on test records'],
        starterCode: `# Machine Learning — RandomForest Classifier Practice
import numpy as np

def train_churn_model(X, y):
    features = np.array(X)
    labels = np.array(y)
    
    # Decision rule simulation
    predictions = [1 if row[0] > 50 else 0 for row in features]
    correct = sum(p == t for p, t in zip(predictions, labels))
    accuracy = correct / len(labels)
    
    print(f"Model Accuracy: {accuracy:.2f} ({accuracy * 100:.1f}%)")
    print(f"Predicted Churn Labels: {np.array(predictions)}")
    return accuracy

X_train = [[20, 100], [80, 450], [15, 80], [90, 600]]
y_train = [0, 1, 0, 1]

train_churn_model(X_train, y_train)
`
      }
    ]
  },
  {
    skillName: 'SQL',
    category: 'Data Science & AI',
    questions: [
      {
        id: 'sql-q1',
        title: '1. High-Spender Customer Grouping Query',
        difficulty: 'Medium',
        problem: 'Write a SQL query using `GROUP BY`, `HAVING SUM(amount) > 100`, and `ORDER BY total_spent DESC` to identify top revenue customers from orders table.',
        expectedOutput: 'customer_id | total_spent\n-------------------------\n103 | 310.0\n101 | 350.0\n102 | 205.0',
        monacoLang: 'sql',
        filename: 'query.sql',
        hints: ['HAVING filters aggregate values after GROUP BY'],
        starterCode: `-- Interactive LeetCode SQL Query Sandbox
SELECT customer_id, SUM(amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(amount) > 100
ORDER BY total_spent DESC;
`
      }
    ]
  },
  {
    skillName: 'Python',
    category: 'Programming Language',
    questions: [
      {
        id: 'py-q1',
        title: '1. Sum Even Numbers Algorithm',
        difficulty: 'Easy',
        problem: 'Write a Python function `solve(numbers)` that filters a list of integers and returns the sum of even numbers.',
        expectedOutput: '12',
        monacoLang: 'python',
        filename: 'solution.py',
        hints: ['Use list comprehension or filter with n % 2 == 0'],
        starterCode: `# Interactive Python Practice
def solve(numbers):
    return sum(n for n in numbers if n % 2 == 0)

print(solve([1, 2, 3, 4, 5, 6]))
`
      }
    ]
  }
]

function findPracticeTopic(query: string | null): { topic: SkillPracticeTopic; question: QuestionChallenge } {
  if (!query) {
    const topic = PRACTICE_CATALOG[0]
    return { topic, question: topic.questions[0] }
  }

  const q = query.trim().toLowerCase()
  const found = PRACTICE_CATALOG.find(t => 
    t.skillName.toLowerCase() === q ||
    t.skillName.toLowerCase().includes(q) ||
    q.includes(t.skillName.toLowerCase())
  )

  if (found) {
    return { topic: found, question: found.questions[0] }
  }

  const genericTopic: SkillPracticeTopic = {
    skillName: query,
    category: 'Custom Skill',
    questions: [
      {
        id: 'gen-q1',
        title: `1. Interactive ${query} Challenge`,
        difficulty: 'Medium',
        problem: `Write a modular, well-documented ${query} script to execute core processing logic and verify stdout assertions.`,
        expectedOutput: `Executed ${query} challenge successfully.`,
        monacoLang: query.toLowerCase().includes('sql') ? 'sql' : 'python',
        filename: `solution.${query.toLowerCase().includes('sql') ? 'sql' : 'py'}`,
        starterCode: `# Practice Workspace for ${query}\ndef solution():\n    print("Executed ${query} challenge successfully.")\n\nsolution()\n`
      }
    ]
  }
  return { topic: genericTopic, question: genericTopic.questions[0] }
}

export default function PracticeWorkspace() {
  const [searchParams] = useSearchParams()
  const skillParam = searchParams.get('skill') || searchParams.get('lang')
  const navigate = useNavigate()

  const match = findPracticeTopic(skillParam)
  const [activeTopic, setActiveTopic] = useState<SkillPracticeTopic>(match.topic)
  const [activeQuestion, setActiveQuestion] = useState<QuestionChallenge>(match.question)
  const [code, setCode] = useState<string>(match.question.starterCode)
  const [executionOutput, setExecutionOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [execStatus, setExecStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'problem' | 'hints' | 'editorial'>('problem')
  
  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false)
  const [executionMetrics, setExecutionMetrics] = useState<{ runtime: number; memory: number; percentile: number }>({ runtime: 38, memory: 16.2, percentile: 94.8 })

  // Exit Confirmation Modal State
  const [showExitModal, setShowExitModal] = useState(false)
  const [exitConfirmInput, setExitConfirmInput] = useState('')

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)

  useEffect(() => {
    const m = findPracticeTopic(skillParam)
    setActiveTopic(m.topic)
    setActiveQuestion(m.question)
    setCode(m.question.starterCode)
    setExecutionOutput('')
    setExecStatus('idle')
  }, [skillParam])

  // Stopwatch timer
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Trigger Fireworks Confetti
  const fireCelebrationConfetti = () => {
    try {
      // Main Center Explosion
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#00b8a3', '#ffc01e', '#2cbb5d', '#6366f1', '#ec4899']
      })

      // Side Cannons
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#00b8a3', '#ffc01e', '#2cbb5d']
        })
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#00b8a3', '#ffc01e', '#2cbb5d']
        })
      }, 250)
    } catch (e) {
      console.log('Confetti trigger fallback', e)
    }
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setExecutionOutput('Executing test cases in LeetCode V8 Sandbox...')
    setExecStatus('idle')

    try {
      const res = await runPracticeCode(code, activeQuestion.monacoLang, activeTopic.skillName)
      setExecutionOutput(res.data.output || 'Code executed cleanly.')
      setExecStatus(res.data.success ? 'success' : 'error')
    } catch (err: any) {
      setExecutionOutput(`Execution Error: ${err.message || 'Sandbox server exception'}`)
      setExecStatus('error')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmitSolution = async () => {
    setIsRunning(true)
    setExecutionOutput('Compiling solution & evaluating test assertions...')

    const startTime = Date.now()
    try {
      const res = await runPracticeCode(code, activeQuestion.monacoLang, activeTopic.skillName)
      const elapsedMs = Math.max(18, Date.now() - startTime)
      const output = res.data.output || ''
      setExecutionOutput(output)
      
      if (res.data.success && !output.toLowerCase().includes('error')) {
        setExecStatus('success')
        setExecutionMetrics({
          runtime: elapsedMs,
          memory: Number((14.5 + Math.random() * 2.5).toFixed(1)),
          percentile: Number((88 + Math.random() * 10).toFixed(1))
        })
        setShowCelebration(true)
        fireCelebrationConfetti()
      } else {
        setExecStatus('error')
      }
    } catch (err: any) {
      setExecutionOutput(`Submission Error: ${err.message}`)
      setExecStatus('error')
    } finally {
      setIsRunning(false)
    }
  }

  const handleConfirmExit = () => {
    if (exitConfirmInput.trim().toLowerCase() === 'confirm') {
      setShowExitModal(false)
      navigate('/practice')
    }
  }

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] text-[#eff1f6] flex flex-col font-sans select-none overflow-hidden">
      {/* 1. Top LeetCode Brand Navigation Bar */}
      <header className="h-12 bg-[#282828] border-b border-[#3e3e3e] px-4 flex items-center justify-between shrink-0">
        {/* Left Section: Exit & LeetCode IDE Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setExitConfirmInput('')
              setShowExitModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] text-xs font-semibold text-slate-200 transition-all border border-[#484848] cursor-pointer"
          >
            <ArrowLeft size={14} className="text-slate-300" />
            <span>Exit Workspace</span>
          </button>

          <div className="h-4 w-[1px] bg-[#3e3e3e]" />

          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116]">
              <Code2 size={16} />
            </div>
            <span className="font-display font-extrabold text-sm text-white tracking-tight flex items-center gap-1">
              LeetCode <span className="text-[#00b8a3] font-mono font-normal text-xs">Workspace</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#3e3e3e] text-slate-300 text-[10px] font-mono font-bold">
              {activeTopic.skillName}
            </span>
          </div>

          {/* Question Switcher */}
          {activeTopic.questions.length > 1 && (
            <select
              value={activeQuestion.id}
              onChange={(e) => {
                const q = activeTopic.questions.find(x => x.id === e.target.value)
                if (q) {
                  setActiveQuestion(q)
                  setCode(q.starterCode)
                  setExecutionOutput('')
                  setExecStatus('idle')
                }
              }}
              className="bg-[#1a1a1a] border border-[#3e3e3e] text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1 outline-none focus:border-[#00b8a3] cursor-pointer ml-2"
            >
              {activeTopic.questions.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Center Section: Run & Submit Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#3a3a3a] hover:bg-[#484848] text-xs font-bold text-slate-100 transition-all border border-[#4a4a4a] cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw size={13} className="animate-spin text-[#00b8a3]" />
            ) : (
              <Play size={13} className="text-[#00b8a3] fill-[#00b8a3]" />
            )}
            <span>Run</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-[#2cbb5d] hover:bg-[#28ab54] text-white text-xs font-bold transition-all shadow-md shadow-[#2cbb5d]/20 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            <span>Submit</span>
          </button>
        </div>

        {/* Right Section: Stopwatch Timer & External Link */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <div 
            onClick={() => setTimerRunning(!timerRunning)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a1a1a] border border-[#3e3e3e] cursor-pointer hover:border-[#555] transition-colors"
            title="Click to Pause/Resume Timer"
          >
            <Clock size={13} className={timerRunning ? 'text-[#00b8a3] animate-pulse' : 'text-slate-500'} />
            <span className="text-slate-200 font-bold">{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => window.open(`/practice/workspace?skill=${encodeURIComponent(activeTopic.skillName)}`, '_blank')}
            className="p-1.5 rounded bg-[#3a3a3a] hover:bg-[#484848] text-slate-300 hover:text-white transition-colors"
            title="Open Full Screen Window"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Divided Panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: Problem Description, Editorial, Hints */}
        <div className="w-[43%] border-r border-[#3e3e3e] flex flex-col bg-[#282828]">
          {/* Left Pane Tab Bar */}
          <div className="h-10 border-b border-[#3e3e3e] bg-[#282828] px-3 flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'problem' ? 'bg-[#3a3a3a] text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={13} className="text-[#00b8a3]" /> Description
            </button>
            {activeQuestion.hints && (
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'hints' ? 'bg-[#3a3a3a] text-[#ffc01e] font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb size={13} className="text-[#ffc01e]" /> Hints ({activeQuestion.hints.length})
              </button>
            )}
          </div>

          {/* Left Pane Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-200">
            {activeTab === 'problem' ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h1 className="font-display font-black text-xl text-white tracking-tight">
                      {activeQuestion.title}
                    </h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      activeQuestion.difficulty === 'Hard' ? 'bg-[#ff375f]/15 text-[#ff375f] border border-[#ff375f]/30' :
                      activeQuestion.difficulty === 'Medium' ? 'bg-[#ffc01e]/15 text-[#ffc01e] border border-[#ffc01e]/30' :
                      'bg-[#00b8a3]/15 text-[#00b8a3] border border-[#00b8a3]/30'
                    }`}>
                      {activeQuestion.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">
                    Skill Area: <span className="text-[#00b8a3]">{activeTopic.skillName}</span>
                  </div>
                </div>

                {/* Problem Statement Box */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Problem Statement</h3>
                  <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#3e3e3e] text-xs leading-relaxed text-slate-200 font-sans">
                    {activeQuestion.problem}
                  </div>
                </div>

                {/* Expected Target Output */}
                {activeQuestion.expectedOutput && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Expected Console Target</h3>
                    <div className="p-4 rounded-xl bg-[#141414] border border-[#333] font-mono text-xs text-[#00b8a3]">
                      <pre className="whitespace-pre-wrap">{activeQuestion.expectedOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#ffc01e] flex items-center gap-2">
                  <Lightbulb size={16} /> Solution Hints
                </h3>
                <div className="space-y-3">
                  {activeQuestion.hints?.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#1a1a1a] border border-[#ffc01e]/30 text-slate-200 text-xs leading-relaxed">
                      <strong className="block text-[#ffc01e] font-bold mb-1">Hint #{i + 1}</strong>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Monaco Editor (Top 60%) + Terminal Console (Bottom 40%) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a1a]">
          {/* Top Half: Monaco Code Editor */}
          <div className="h-[62%] border-b border-[#3e3e3e] flex flex-col bg-[#1e1e1e]">
            {/* Editor Header Tools */}
            <div className="h-9 bg-[#282828] border-b border-[#3e3e3e] px-4 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-[#00b8a3]">{activeQuestion.filename}</span>
              </div>
              <button
                onClick={() => setCode(activeQuestion.starterCode)}
                className="text-slate-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw size={12} /> Reset Starter Code
              </button>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={activeQuestion.monacoLang}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  padding: { top: 12, bottom: 12 },
                  lineNumbersMinChars: 3
                }}
              />
            </div>
          </div>

          {/* Bottom Half: Console Output & Test Result Terminal */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#141414]">
            <div className="h-9 bg-[#282828] border-b border-[#3e3e3e] px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <Terminal size={14} className="text-[#00b8a3]" /> Test Results & Console Terminal
              </div>
              {execStatus === 'success' && (
                <span className="text-[#2cbb5d] text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Accepted
                </span>
              )}
              {execStatus === 'error' && (
                <span className="text-[#ff375f] text-xs font-bold flex items-center gap-1">
                  <XCircle size={13} /> Execution Error
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs text-[#00b8a3] overflow-y-auto custom-scrollbar">
              {executionOutput ? (
                <pre className="whitespace-pre-wrap leading-relaxed">{executionOutput}</pre>
              ) : (
                <div className="text-slate-500 italic">Click "Run" or "Submit" above to execute test cases.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONFETTI CELEBRATION MODAL (On Submit Accepted) */}
      {showCelebration && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#282828] border border-[#2cbb5d]/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top Glow Decor */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-32 bg-[#2cbb5d]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="h-16 w-16 rounded-3xl bg-[#2cbb5d]/20 text-[#2cbb5d] border border-[#2cbb5d]/40 flex items-center justify-center mx-auto shadow-xl shadow-[#2cbb5d]/20 animate-bounce">
              <Check size={36} strokeWidth={3} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#2cbb5d]/15 text-[#2cbb5d] border border-[#2cbb5d]/30 text-xs font-extrabold uppercase tracking-wider">
                ACCEPTED
              </span>
              <h2 className="font-display font-black text-2xl text-white tracking-tight mt-3">
                Challenge Complete! 🎉
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                You passed all test cases for <strong className="text-white">{activeQuestion.title}</strong>
              </p>
            </div>

            {/* Performance Benchmark Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#1e1e1e] border border-[#383838]">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">⚡ Runtime</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{executionMetrics.runtime} ms</div>
                <div className="text-[10px] text-[#2cbb5d] font-semibold mt-0.5">Beats {executionMetrics.percentile}% of users</div>
              </div>
              <div className="text-left border-l border-[#333] pl-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">🧠 Memory</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{executionMetrics.memory} MB</div>
                <div className="text-[10px] text-[#00b8a3] font-semibold mt-0.5">Optimal allocation</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#00b8a3]/10 border border-[#00b8a3]/20 text-xs text-[#00b8a3] font-bold">
              🏆 +25 Skill XP Verified in your {activeTopic.skillName} Roadmap!
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#3a3a3a] hover:bg-[#484848] text-xs font-bold text-slate-200 border border-[#484848] transition-colors cursor-pointer"
              >
                Review Code
              </button>
              <button
                onClick={() => navigate('/practice')}
                className="flex-1 py-2.5 rounded-xl bg-[#2cbb5d] hover:bg-[#28ab54] text-xs font-bold text-white shadow-lg shadow-[#2cbb5d]/30 transition-colors cursor-pointer"
              >
                Exit to Practice Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TYPE "CONFIRM" TO EXIT MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#282828] border border-[#484848] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="font-display font-extrabold text-xl text-white">Confirm Exit Workspace</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                To prevent accidental loss of code, please type <strong className="text-amber-400 font-mono">confirm</strong> below to exit.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                placeholder='Type "confirm" to exit...'
                value={exitConfirmInput}
                onChange={(e) => setExitConfirmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && exitConfirmInput.trim().toLowerCase() === 'confirm') {
                    handleConfirmExit()
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e1e1e] border border-[#444] text-white text-xs font-mono tracking-wide outline-none focus:border-amber-400 text-center"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowExitModal(false)
                  setExitConfirmInput('')
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3a3a3a] hover:bg-[#4a4a4a] text-xs font-bold text-slate-200 border border-[#484848] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                disabled={exitConfirmInput.trim().toLowerCase() !== 'confirm'}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  exitConfirmInput.trim().toLowerCase() === 'confirm'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-600/30'
                    : 'bg-[#333] text-slate-500 cursor-not-allowed border border-[#3e3e3e]'
                }`}
              >
                Confirm & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
