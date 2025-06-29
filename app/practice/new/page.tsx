'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Webcam from 'react-webcam'
import { 
  Mic, 
  Video, 
  FileText, 
  Play, 
  Pause, 
  Square,
  Send,
  Brain,
  Loader2,
  Volume2,
  VolumeX,
  ChevronDown
} from 'lucide-react'
import { speechRecognition, getSpeechRecognitionSupport, SpeechRecognitionResult } from '../../../lib/speech'

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
  const [count, setCount] = useState(5)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['behavioral', 'technical', 'situational'])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoRecording, setIsVideoRecording] = useState(false)
  const [textResponse, setTextResponse] = useState('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  
  // Clarifying question state
  const [clarifyingQuestion, setClarifyingQuestion] = useState('')
  const [guidance, setGuidance] = useState('')
  const [showGuidance, setShowGuidance] = useState(false)
  const [loadingGuidance, setLoadingGuidance] = useState(false)
  const [showClarifyingQuestions, setShowClarifyingQuestions] = useState(false)

  // Advanced section state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [candidateAnalysis, setCandidateAnalysis] = useState('')

  // Speech recognition states
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)

  // Refs for video recording
  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Initialize speech recognition
  useEffect(() => {
    const support = getSpeechRecognitionSupport()
    setSpeechSupported(support.supported)
    
    if (support.supported) {
      // Configure speech recognition
      speechRecognition.configure({
        continuous: true,
        interimResults: true,
        lang: 'en-US'
      })

      // Set up event handlers
      speechRecognition.onResult((result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          setTranscript(prev => prev + ' ' + result.transcript)
          setInterimTranscript('')
        } else {
          setInterimTranscript(result.transcript)
        }
      })

      speechRecognition.onError((error: string) => {
        setSpeechError(error)
        setIsListening(false)
      })

      speechRecognition.onEnd(() => {
        setIsListening(false)
      })
    }
  }, [])

  // Navigate to results page when session is complete
  useEffect(() => {
    if (showResults && sessionId) {
      router.push(`/practice/complete?sessionId=${sessionId}`)
    }
  }, [showResults, sessionId, router])

  const generateQuestions = async () => {
    if (!subject.trim()) return
    
    // Check if at least one question type is selected
    if (selectedTypes.length === 0) {
      alert('Please select at least one question type')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject, 
          count: count,
          types: selectedTypes,
          // Advanced fields (optional)
          resume: resume.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
          candidateAnalysis: candidateAnalysis.trim() || undefined
        })
      })
      
      const data = await response.json()
      
      // Check if we have questions in the response
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
        
        // Create practice session
        try {
          const sessionResponse = await fetch('/api/sessions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `${subject} Practice Session`,
              subject,
              totalQuestions: data.questions.length,
              // Include context fields for personalized evaluation
              resume: resume.trim() || undefined,
              jobDescription: jobDescription.trim() || undefined,
              candidateAnalysis: candidateAnalysis.trim() || undefined
            })
          })
          
          const sessionData = await sessionResponse.json()
          if (sessionData.success) {
            setSessionId(sessionData.session.id)
          }
        } catch (sessionError) {
          console.error('Failed to create session:', sessionError)
          // Continue without session creation
        }
      } else {
        console.error('No questions received from API')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Video recording functions
  const startVideoRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2
        } 
      })
      
      if (webcamRef.current) {
        webcamRef.current.video!.srcObject = stream
      }
      
      // Configure MediaRecorder with better settings
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      }
      
      // Check if the preferred codec is supported, fallback to default if not
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log('Preferred codec not supported, using default')
        mediaRecorderRef.current = new MediaRecorder(stream)
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, options)
      }
      
      recordedChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        })
        const url = URL.createObjectURL(blob)
        setRecordedVideo(url)
        setShowCamera(false)
      }
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        alert('Error during recording. Please try again.')
        setIsVideoRecording(false)
        setShowCamera(false)
      }
      
      mediaRecorderRef.current.onstart = () => {
        console.log('MediaRecorder started successfully')
      }
      
      // Start recording with timeslice parameter (100ms chunks) to prevent audio cuts
      mediaRecorderRef.current.start(100)
      setIsVideoRecording(true)
      setShowCamera(true)
    } catch (error) {
      console.error('Error starting video recording:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }, [])

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isVideoRecording) {
      try {
        mediaRecorderRef.current.stop()
        setIsVideoRecording(false)
        
        // Stop all tracks to prevent memory leaks
        if (webcamRef.current?.video?.srcObject) {
          const stream = webcamRef.current.video.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            track.stop()
            console.log('Stopped track:', track.kind)
          })
        }
        
        // Clear the video source
        if (webcamRef.current?.video) {
          webcamRef.current.video.srcObject = null
        }
      } catch (error) {
        console.error('Error stopping video recording:', error)
        setIsVideoRecording(false)
      }
    }
  }, [isVideoRecording])

  const handleVideoToggle = () => {
    if (isVideoRecording) {
      stopVideoRecording()
    } else {
      startVideoRecording()
    }
  }

  // Speech recognition functions
  const startListening = useCallback(() => {
    if (!speechSupported) {
      setSpeechError('Speech recognition not supported in this browser')
      return
    }

    setSpeechError(null)
    const success = speechRecognition.start()
    if (success) {
      setIsListening(true)
    } else {
      setSpeechError('Failed to start speech recognition')
    }
  }, [speechSupported])

  const stopListening = useCallback(() => {
    speechRecognition.stop()
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  const handleSubmitResponse = async () => {
    if (!sessionId || currentQuestionIndex >= questions.length) return

    setSubmitting(true)
    try {
      // Combine text response with speech transcript
      const finalResponse = textResponse.trim() || transcript.trim()
      
      if (!finalResponse) {
        alert('Please provide a response (text or speech)')
        return
      }

      // Include clarifying question in the response context if it exists
      const responseContext = clarifyingQuestion.trim() 
        ? `Clarifying Question: "${clarifyingQuestion}"\n\nFinal Response: ${finalResponse}`
        : finalResponse

      const response = await fetch('/api/responses/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          questionId: questions[currentQuestionIndex].id,
          questionText: questions[currentQuestionIndex].question,
          textResponse: responseContext,
          videoUrl: recordedVideo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit response')
      }

      const data = await response.json()
      setEvaluation(data.evaluation)

      // Move to next question or complete session
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setTextResponse('')
        setTranscript('')
        setInterimTranscript('')
        setRecordedVideo(null)
        setEvaluation(null)
        // Reset clarifying question state
        setClarifyingQuestion('')
        setGuidance('')
        setShowGuidance(false)
      } else {
        setSessionComplete(true)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Failed to submit response. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAskClarification = async () => {
    if (!clarifyingQuestion.trim()) {
      alert('Please enter a clarifying question')
      return
    }

    setLoadingGuidance(true)
    try {
      const response = await fetch('/api/clarification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clarifyingQuestion: clarifyingQuestion.trim(),
          interviewQuestion: questions[currentQuestionIndex].question,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get guidance')
      }

      const data = await response.json()
      setGuidance(data.guidance)
      setShowGuidance(true)
    } catch (error) {
      console.error('Error getting clarification guidance:', error)
      alert('Failed to get guidance. Please try again.')
    } finally {
      setLoadingGuidance(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Start New Practice Session</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tips Section - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Pro Tips</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">Use Voice Input</h4>
                      <p className="mt-1 text-xs text-gray-600">
                        Speak naturally to answer questions. Voice input provides a more authentic interview experience and helps you practice verbal communication skills.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">Record Video for Review</h4>
                      <p className="mt-1 text-xs text-gray-600">
                        Enable video recording to review your body language, facial expressions, and overall presentation. This helps you identify areas for improvement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">Mute Your System</h4>
                      <p className="mt-1 text-xs text-gray-600">
                        Mute your computer speakers while recording video to avoid voice feedback issues and ensure clear audio quality in your recordings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">Take Your Time</h4>
                      <p className="mt-1 text-xs text-gray-600">
                        Don't rush your answers. Take a moment to think, structure your response, and speak clearly. Quality over speed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form - Right Column */}
            <div className="lg:col-span-2">
              <div className="card">
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
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Types
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes('behavioral')}
                          onChange={(e) => setSelectedTypes(prev => e.target.checked ? [...prev, 'behavioral'] : prev.filter(t => t !== 'behavioral'))}
                          className="mr-2"
                        />
                        Behavioral
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes('technical')}
                          onChange={(e) => setSelectedTypes(prev => e.target.checked ? [...prev, 'technical'] : prev.filter(t => t !== 'technical'))}
                          className="mr-2"
                        />
                        Technical
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes('situational')}
                          onChange={(e) => setSelectedTypes(prev => e.target.checked ? [...prev, 'situational'] : prev.filter(t => t !== 'situational'))}
                          className="mr-2"
                        />
                        Situational
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes('coding')}
                          onChange={(e) => setSelectedTypes(prev => e.target.checked ? [...prev, 'coding'] : prev.filter(t => t !== 'coding'))}
                          className="mr-2"
                        />
                        Coding
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes('sql_query_writing')}
                          onChange={(e) => setSelectedTypes(prev => e.target.checked ? [...prev, 'sql_query_writing'] : prev.filter(t => t !== 'sql_query_writing'))}
                          className="mr-2"
                        />
                        SQL Query Writing
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes('python_data_science')}
                          onChange={(e) => setSelectedTypes(prev => e.target.checked ? [...prev, 'python_data_science'] : prev.filter(t => t !== 'python_data_science'))}
                          className="mr-2"
                        />
                        Python Data Science
                      </label>
                    </div>
                  </div>

                  {/* Advanced Section */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    >
                      <span className="text-sm font-medium text-gray-700">Advanced Options</span>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                          showAdvanced ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showAdvanced && (
                      <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resume/Background (Optional)
                          </label>
                          <textarea
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                            placeholder="Paste your resume or describe your background..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            This helps generate more relevant questions based on your experience
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description (Optional)
                          </label>
                          <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description or role requirements..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            This helps tailor questions to the specific role you're interviewing for
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Interview Topics (Optional)
                          </label>
                          <textarea
                            value={candidateAnalysis}
                            onChange={(e) => setCandidateAnalysis(e.target.value)}
                            placeholder="What topics do you expect to be asked about? Any specific areas you want to focus on?"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Your analysis of what topics are typically asked in this type of interview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={generateQuestions}
                    disabled={loading || !subject.trim()}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    {loading ? (
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
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="w-full space-y-6">
          {/* Question Section - Full Width */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.type === 'behavioral' ? 'bg-blue-100 text-blue-800' :
                currentQuestion.type === 'technical' ? 'bg-green-100 text-green-800' :
                currentQuestion.type === 'situational' ? 'bg-orange-100 text-orange-800' :
                currentQuestion.type === 'coding' ? 'bg-purple-100 text-purple-800' :
                currentQuestion.type === 'sql_query_writing' ? 'bg-indigo-100 text-indigo-800' :
                currentQuestion.type === 'python_data_science' ? 'bg-teal-100 text-teal-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{currentQuestion.category}</span>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{currentQuestionIndex + 1}/{questions.length}</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-sm lg:text-base xl:text-lg font-semibold text-gray-900 leading-relaxed mb-4 max-w-none">
              {currentQuestion.question}
            </h2>

            {/* Clarifying Questions Section - Collapsible */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowClarifyingQuestions(!showClarifyingQuestions)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need Help? Ask a Clarifying Question
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showClarifyingQuestions ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showClarifyingQuestions && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={clarifyingQuestion}
                    onChange={(e) => setClarifyingQuestion(e.target.value)}
                    placeholder="Ask a clarifying question to get guidance on how to approach this question..."
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                  />
                  
                  <button
                    onClick={handleAskClarification}
                    disabled={loadingGuidance || !clarifyingQuestion.trim()}
                    className="btn-secondary flex items-center justify-center text-sm"
                  >
                    {loadingGuidance ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Getting Guidance...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ask for Guidance
                      </>
                    )}
                  </button>

                  {/* Guidance Display */}
                  {showGuidance && guidance && (
                    <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-700 text-sm">AI Guidance</h5>
                        <button
                          onClick={() => setShowGuidance(false)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Hide
                        </button>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {guidance}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Response Section - Full Width */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 space-y-6">
            {/* Recording Controls Row - Horizontal Ribbon */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Voice Input Button - Compact */}
                {speechSupported && (
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`p-3 rounded-full transition-colors shadow-md flex-shrink-0 ${
                          isListening 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={!speechSupported}
                      >
                        {isListening ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Voice Input</span>
                          {isListening && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-red-600">Listening</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {isListening ? 'Click to stop' : 'Click to start voice response'}
                        </span>
                      </div>
                      
                      {transcript && (
                        <button
                          onClick={clearTranscript}
                          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {/* Compact Transcript Display */}
                    {transcript && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-gray-600">Live Transcript:</div>
                          <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <span>{showTranscript ? 'Hide' : 'Show'}</span>
                            <svg
                              className={`w-3 h-3 transition-transform ${showTranscript ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        {showTranscript && (
                          <div className="p-2 bg-white border rounded text-xs text-gray-800 max-h-20 overflow-y-auto">
                            {transcript}
                            {interimTranscript && (
                              <span className="text-gray-400 italic">
                                {interimTranscript}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Video Recording Button - Compact */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                    <button
                      onClick={showCamera ? stopVideoRecording : startVideoRecording}
                      className={`p-3 rounded-full transition-colors shadow-md flex-shrink-0 ${
                        isVideoRecording 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isVideoRecording ? <Square size={20} /> : <Video size={20} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Video Recording</span>
                        {isVideoRecording && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-red-600">Recording</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {isVideoRecording ? 'Click to stop' : 'Record video response'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speech Error Display */}
              {speechError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {speechError}
                </div>
              )}

              {/* Browser Support Warning - Compact */}
              {!speechSupported && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Voice input not available. Use Chrome, Edge, or Safari for voice response.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Preview Area - Large when active */}
            {(showCamera || recordedVideo) && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {showCamera && (
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      className="w-full h-auto object-contain"
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: 'user'
                      }}
                    />
                  </div>
                )}

                {recordedVideo && (
                  <div className="relative">
                    <video
                      src={recordedVideo}
                      controls
                      className="w-full h-auto object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Text Input Area - Reduced vertical size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Response {speechSupported && '(or use voice above)'}
              </label>
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Type your response here... You can also use voice input or video recording above."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                rows={Math.max(2, Math.min(6, textResponse.split('\n').length + 1))}
                style={{ minHeight: '60px', maxHeight: '160px' }}
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>{textResponse.length} characters</span>
                <span>{textResponse.split(/\s+/).filter(word => word.length > 0).length} words</span>
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <button
              onClick={handleSubmitResponse}
              disabled={submitting || (!textResponse.trim() && !transcript.trim() && !recordedVideo)}
              className="btn-primary w-full flex items-center justify-center py-4 text-lg font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={24} />
                  Submit Response
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 