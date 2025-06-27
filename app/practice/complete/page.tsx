'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

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

interface SessionData {
  id: string
  title: string
  subject: string
  created_at: string
  total_questions: number
  completed_questions: number
  responses: Array<{
    id: string
    question_text: string
    transcription: string
    audio_url?: string
    video_url?: string
    text_response?: string
    evaluation: Evaluation
  }>
}

export default function CompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('sessionId')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId])

  const toggleResponse = (index: number) => {
    const newExpanded = new Set(expandedResponses)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedResponses(newExpanded)
  }

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/results`)
      const data = await response.json()
      if (data.success) {
        setSessionData(data.session)
      }
    } catch (error) {
      console.error('Error fetching session data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The practice session you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/practice/new')}
            className="btn-primary"
          >
            Start New Session
          </button>
        </div>
      </div>
    )
  }

  const averageScore = sessionData.responses.reduce((acc, response) => 
    acc + response.evaluation.score, 0) / sessionData.responses.length

  const timelineData = [
    { name: 'Clarity', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.clarity, 0) / sessionData.responses.length },
    { name: 'Confidence', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.confidence, 0) / sessionData.responses.length },
    { name: 'Technical Depth', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.technical_depth, 0) / sessionData.responses.length },
    { name: 'Communication', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.communication, 0) / sessionData.responses.length },
    { name: 'Structure', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.structure, 0) / sessionData.responses.length },
    { name: 'Engagement', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.engagement, 0) / sessionData.responses.length },
    { name: 'Completeness', value: sessionData.responses.reduce((acc, r) => acc + r.evaluation.timeline_analysis.completeness, 0) / sessionData.responses.length },
  ]

  const radarData = timelineData.map(item => ({
    subject: item.name,
    A: item.value,
    fullMark: 10,
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/history')}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </button>
          
          <div className="flex space-x-4">
            <button className="btn-secondary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
            <button className="btn-secondary flex items-center">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{sessionData.title}</h1>
              <p className="text-gray-600">Subject: {sessionData.subject}</p>
              <p className="text-gray-600">Completed: {new Date(sessionData.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">{Math.round(averageScore)}</div>
              <div className="text-gray-600">Average Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Performance */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Overall Performance
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Radar */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Skills Analysis
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question-by-Question Analysis */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Question-by-Question Analysis</h2>
          
          <div className="space-y-6">
            {sessionData.responses.map((response, index) => (
              <div key={response.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Question {index + 1}: {response.question_text}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-primary-600">
                        {response.evaluation.score}
                      </span>
                      <span className="text-gray-600">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Response Viewer */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleResponse(index)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 mr-2 transition-transform ${
                        expandedResponses.has(index) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {expandedResponses.has(index) ? 'Hide Response' : 'View Response'}
                  </button>
                  
                  {expandedResponses.has(index) && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Your Response:</h4>
                      
                      {/* Video Recording */}
                      {response.video_url && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Video Recording:</h5>
                          <video 
                            controls 
                            className="w-full max-w-md rounded-lg shadow-sm"
                            preload="metadata"
                          >
                            <source src={response.video_url} type="video/webm" />
                            <source src={response.video_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      
                      {/* Audio Recording */}
                      {response.audio_url && response.audio_url !== 'audio_url_placeholder' && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Audio Recording:</h5>
                          <audio 
                            controls 
                            className="w-full max-w-md"
                            preload="metadata"
                          >
                            <source src={response.audio_url} type="audio/webm" />
                            <source src={response.audio_url} type="audio/mp4" />
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                      )}
                      
                      {/* Text Response */}
                      {response.text_response && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Text Response:</h5>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                            {response.text_response}
                          </p>
                        </div>
                      )}
                      
                      {/* Transcription */}
                      {response.transcription && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h5>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                            {response.transcription}
                          </p>
                        </div>
                      )}
                      
                      {/* Fallback if no response recorded */}
                      {!response.video_url && !response.audio_url && !response.text_response && !response.transcription && (
                        <p className="text-sm text-gray-500 italic">No response recorded</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {response.evaluation.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-600">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {response.evaluation.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-gray-600">• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Detailed Feedback</h4>
                  <p className="text-sm text-gray-700">{response.evaluation.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => router.push('/practice/new')}
            className="btn-primary"
          >
            Start New Practice Session
          </button>
          <button
            onClick={() => router.push('/history')}
            className="btn-secondary"
          >
            View All Sessions
          </button>
        </div>
      </div>
    </div>
  )
} 