'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  BarChart3, 
  Play, 
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface PracticeSession {
  id: string
  title: string
  subject: string
  created_at: string
  total_questions: number
  completed_questions: number
  average_score?: number
}

export default function HistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your practice history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice History</h1>
            <p className="text-gray-600">Review your past interview practice sessions</p>
          </div>
          <button
            onClick={() => router.push('/practice/new')}
            className="btn-primary flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            New Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="card text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Practice Sessions Yet</h2>
            <p className="text-gray-600 mb-6">Start your first practice session to see your progress here.</p>
            <button
              onClick={() => router.push('/practice/new')}
              className="btn-primary"
            >
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{session.subject}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {session.average_score && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {Math.round(session.average_score)}
                      </div>
                      <div className="text-xs text-gray-500">Avg Score</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    {session.completed_questions} / {session.total_questions} questions
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(session.completed_questions / session.total_questions) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/practice/complete?sessionId=${session.id}`)}
                    className="btn-secondary flex-1 flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Results
                  </button>
                  <button
                    onClick={() => router.push(`/practice/replay?sessionId=${session.id}`)}
                    className="btn-secondary flex-1 flex items-center justify-center text-sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Replay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {sessions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Your Progress Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {sessions.length}
                </div>
                <div className="text-gray-600">Total Sessions</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {sessions.reduce((acc, session) => acc + session.completed_questions, 0)}
                </div>
                <div className="text-gray-600">Questions Answered</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {sessions.length > 0 ? 
                    Math.round(sessions.reduce((acc, session) => acc + (session.average_score || 0), 0) / sessions.length) : 
                    0
                  }
                </div>
                <div className="text-gray-600">Average Score</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {sessions.length > 0 ? 
                    new Date(Math.max(...sessions.map(s => new Date(s.created_at).getTime()))).toLocaleDateString() : 
                    'N/A'
                  }
                </div>
                <div className="text-gray-600">Last Practice</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 