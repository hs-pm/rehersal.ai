'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Mic, 
  Video, 
  FileText, 
  Play, 
  Pause, 
  Square,
  Send,
  Brain,
  Loader2
} from 'lucide-react'

interface Question {
  id: string
  question: string
  type: string
  category: string
}

interface Evaluation {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  timeline_analysis: {
    clarity: number
    confidence: number
    technical_depth: number
    communication: number
    structure: number
    engagement: number
    completeness: number
  }
}

export default function NewPracticePage() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoRecording, setIsVideoRecording] = useState(false)
  const [textResponse, setTextResponse] = useState('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const generateQuestions = async () => {
    if (!subject.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, count: questionCount })
      })
      
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions)
        
        // Create practice session
        const sessionResponse = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${subject} Practice Session`,
            subject,
            totalQuestions: data.questions.length
          })
        })
        
        const sessionData = await sessionResponse.json()
        if (sessionData.success) {
          setSessionId(sessionData.session.id)
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const submitResponse = async () => {
    if (!sessionId || currentQuestionIndex >= questions.length) return
    
    setIsLoading(true)
    try {
      const currentQuestion = questions[currentQuestionIndex]
      
      const response = await fetch('/api/responses/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          questionText: currentQuestion.question,
          textResponse,
          audioData: null,
          videoUrl: null
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setEvaluations([...evaluations, data.evaluation])
        
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setTextResponse('')
        } else {
          router.push(`/practice/complete?sessionId=${sessionId}`)
        }
      }
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Start New Practice Session</h1>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject/Topic
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., React, System Design, Behavioral Questions"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
              
              <button
                onClick={generateQuestions}
                disabled={!subject.trim() || isGenerating}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question and Response Section */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentQuestion.type === 'behavioral' ? 'bg-blue-100 text-blue-800' :
                  currentQuestion.type === 'technical' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {currentQuestion.type}
                </span>
                <span className="text-sm text-gray-500">{currentQuestion.category}</span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Recording Controls */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Your Response</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isRecording ? <Pause className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Audio</p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setIsVideoRecording(!isVideoRecording)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                      isVideoRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isVideoRecording ? <Square className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Video</p>
                </div>
              </div>
            </div>

            {/* Text Response */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Or Type Your Response</h3>
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Type your response here..."
                className="input-field min-h-[200px] resize-none"
              />
            </div>

            <button
              onClick={submitResponse}
              disabled={isLoading || (!textResponse.trim())}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Response
                </>
              )}
            </button>
          </div>

          {/* Video Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Preview</h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Video className="w-12 h-12 mx-auto mb-2" />
                <p>Video recording will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 