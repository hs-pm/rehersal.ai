'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Mic, 
  Video, 
  FileText, 
  Play, 
  BarChart3, 
  Plus,
  Brain,
  Clock,
  Sparkles,
  MessageSquare,
  UserCheck
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Interview Practice</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                About Harshit
              </Link>
              <Link href="/practice" className="text-gray-600 hover:text-primary-600 transition-colors">
                Practice
              </Link>
              <Link href="/history" className="text-gray-600 hover:text-primary-600 transition-colors">
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Your Interviews with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice interviews with AI-generated questions, record your responses, and get detailed feedback to improve your skills.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card text-center relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Simulate Real Interview Experience</h3>
            <p className="text-gray-600">Practice in an environment that mimics actual interview conditions with realistic questions and feedback.</p>
          </div>

          <div className="card text-center relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Questions</h3>
            <p className="text-gray-600">Get questions tailored to your resume or job description for highly relevant practice sessions.</p>
          </div>

          <div className="card text-center relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Speech or Text Responses</h3>
            <p className="text-gray-600">Answer questions naturally through voice recording or type your responses - your choice!</p>
          </div>

          <div className="card text-center relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Self-Analysis</h3>
            <p className="text-gray-600">Record video responses to analyze your body language, presentation skills, and overall delivery.</p>
          </div>

          <div className="card text-center relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Clarifying Questions</h3>
            <p className="text-gray-600">Ask for guidance and get clarifying questions from AI, just like a real interviewer would provide.</p>
          </div>

          <div className="card text-center relative group hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Performance Analysis</h3>
            <p className="text-gray-600">Receive comprehensive feedback with scoring, strengths, and improvement suggestions.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start New Practice Session</h3>
            <p className="text-gray-600 mb-6">
              Begin a new interview practice session with AI-generated questions or your custom questions.
            </p>
            <Link href="/practice/new" className="btn-primary inline-flex items-center">
              <Play className="w-4 h-4 mr-2" />
              Start Practice
            </Link>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Previous Sessions</h3>
            <p className="text-gray-600 mb-6">
              Watch your recorded sessions and review AI feedback to track your progress over time.
            </p>
            <Link href="/history" className="btn-secondary inline-flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              View History
            </Link>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">100+</div>
              <div className="text-gray-600">AI-Generated Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">Real-time</div>
              <div className="text-gray-600">Speech-to-Text</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">Detailed</div>
              <div className="text-gray-600">Performance Reports</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 