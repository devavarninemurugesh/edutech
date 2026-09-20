import { useState, useRef, useEffect } from 'react'
import { Card, Badge } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { askAssistant, getHealth, getSettings, updateSettings } from '../services/api'
import { Bot, Send, User, Sparkles, RefreshCw, Key, Check, Copy, ExternalLink, ChevronRight, Zap } from 'lucide-react'


// Lightweight Markdown Formatter component for AI responses
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n')
  let inCodeBlock = false
  let codeBuffer: string[] = []
  const renderedElements: React.ReactNode[] = []

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <div key={`code-${idx}`} className="my-2 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto custom-scrollbar">
            <pre>{codeBuffer.join('\n')}</pre>
          </div>
        )
        codeBuffer = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      return
    }

    if (!line.trim()) {
      renderedElements.push(<div key={`empty-${idx}`} className="h-2" />)
      return
    }

    const formattedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded text-xs font-mono font-bold">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-600 underline font-semibold hover:text-indigo-800">$1</a>')

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      renderedElements.push(
        <div key={idx} className="flex items-start gap-2 my-1 pl-2">
          <span className="text-indigo-600 font-bold mt-1">•</span>
          <span dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />
        </div>
      )
    } else if (/^\d+\.\s/.test(line.trim())) {
      renderedElements.push(
        <div key={idx} className="flex items-start gap-2 my-1 pl-2">
          <span className="text-indigo-600 font-bold font-mono text-xs mt-0.5">{line.trim().split(' ')[0]}</span>
          <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s/, '') }} />
        </div>
      )
    } else if (line.trim().startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} className="font-bold text-base text-slate-900 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.substring(4) }} />
      )
    } else if (line.trim().startsWith('## ')) {
      renderedElements.push(
        <h2 key={idx} className="font-bold text-lg text-slate-900 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(3) }} />
      )
    } else {
      renderedElements.push(
        <p key={idx} className="my-1 leading-relaxed text-slate-800" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      )
    }
  })

  return <div className="space-y-1">{renderedElements}</div>
}

export default function Assistant() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: "Hello! I'm your **EduPath Adaptive Learning Assistant** powered by **Google Gemini API**. I have full context of your profile, roadmap progress, and current skill gaps. Ask me anything about your learning journey!"
    }
  ])
  const [loading, setLoading] = useState(false)
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false)
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false)
  const [inputKey, setInputKey] = useState('')
  const [savingKey, setSavingKey] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    "What should I study today based on my skill gaps?",
    "Why is SQL listed as my current focus?",
    "How can I prepare for my upcoming skill assessment?",
    "Give me 3 Python coding tips for machine learning."
  ]

  useEffect(() => {
    checkGeminiStatus()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const checkGeminiStatus = async () => {
    try {
      const res = await getHealth()
      if (res.data && res.data.gemini_configured) {
        setGeminiConfigured(true)
      } else {
        const settingsRes = await getSettings()
        if (settingsRes.data && settingsRes.data.gemini_api_key) {
          setGeminiConfigured(true)
        } else {
          setGeminiConfigured(false)
        }
      }
    } catch {
      setGeminiConfigured(false)
    }
  }

  const handleSaveKey = async () => {
    if (!inputKey.trim()) return
    setSavingKey(true)
    try {
      const currentSettings = (await getSettings()).data || {}
      await updateSettings({ ...currentSettings, gemini_api_key: inputKey.trim() })
      setGeminiConfigured(true)
      setShowKeyInput(false)
      setInputKey('')
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "✨ **Google Gemini API Key successfully saved and activated!** I am now connected live to Gemini AI models. What would you like to explore?"
        }
      ])
    } catch (e) {
      alert("Failed to save Gemini API Key. Please verify backend connection.")
    } finally {
      setSavingKey(false)
    }
  }

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || question
    if (!textToSend.trim() || loading) return

    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', text: textToSend }])
    setLoading(true)

    try {
      const res = await askAssistant(textToSend)
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't process your request right now. Please verify backend connection." }])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Sparkles size={16} className="text-indigo-600 animate-pulse" /> Google Gemini API Assistant
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900 flex items-center gap-3">
            AI Assistant
          </h1>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed">
            Personalized, context-aware AI learning mentor powered by Google Gemini API.
          </p>
        </div>

        {/* Gemini AI Active Indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Gemini AI Connected</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0 border-slate-200 shadow-sm">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[88%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`
                h-9 w-9 rounded-2xl font-bold flex items-center justify-center shrink-0 text-xs shadow-sm
                ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-indigo-700 border border-slate-200'}
              `}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className="group relative">
                <div className={`
                  p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none'}
                `}>
                  <div className="flex items-center justify-between gap-4 text-[10px] font-bold opacity-75 mb-1.5 uppercase tracking-wider font-mono">
                    <span>{m.role === 'user' ? 'You' : 'EduPath Gemini AI'}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(m.text, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedIdx === idx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                  {m.role === 'assistant' ? (
                    <FormattedMessage text={m.text} />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 mr-auto items-center py-2 px-3 rounded-2xl bg-white border border-slate-200 shadow-sm animate-fadeIn">
              <LogoLoader 
                size="sm" 
                showBrandText={false} 
                text="Gemini AI is generating recommendation..." 
              />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length < 5 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <span className="text-xs text-slate-500 font-semibold shrink-0">Try asking:</span>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-indigo-700 whitespace-nowrap transition-all font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{p}</span>
                <ChevronRight size={12} className="opacity-50" />
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold placeholder-slate-400 focus:border-indigo-600 outline-none transition-all"
              placeholder="Ask Gemini AI anything about your learning roadmap or career goals..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="btn btn-primary px-5"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
