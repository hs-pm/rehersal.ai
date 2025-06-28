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
                  currentQuestion.type === 'situational' ? 'bg-orange-100 text-orange-800' :
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

            {/* Response Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Your Response</h3>
              
              {/* Speech Recognition Controls */}
              {speechSupported && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Voice Response</h4>
                    <div className="flex items-center space-x-2">
                      {isListening && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-red-600">Listening...</span>
                        </div>
                      )}
                      {speechError && (
                        <span className="text-sm text-red-600">{speechError}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`p-3 rounded-full transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={!speechSupported}
                    >
                      {isListening ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <span className="text-sm text-gray-600">
                      {isListening ? 'Click to stop recording' : 'Click to start voice response'}
                    </span>
                    {transcript && (
                      <button
                        onClick={clearTranscript}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Transcript Display */}
                  {transcript && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Transcript:</div>
                      <div className="p-3 bg-white border rounded-lg text-gray-800">
                        {transcript}
                        {interimTranscript && (
                          <span className="text-gray-400 italic">
                            {interimTranscript}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Browser Support Warning */}
              {!speechSupported && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Voice Response Not Available
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari for voice response functionality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Response */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Response {speechSupported && '(or use voice above)'}
                </label>
                <textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Ask Clarifying Question Section */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need Help? Ask a Clarifying Question
                </h4>
                
                <div className="space-y-3">
                  <textarea
                    value={clarifyingQuestion}
                    onChange={(e) => setClarifyingQuestion(e.target.value)}
                    placeholder="Ask a clarifying question to get guidance on how to approach this question..."
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
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
                </div>

                {/* Guidance Display */}
                {showGuidance && guidance && (
                  <div className="mt-4 p-3 bg-white border border-blue-300 rounded-lg">
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

              {/* Video Recording Section */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <button
                    onClick={showCamera ? stopVideoRecording : startVideoRecording}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoRecording 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isVideoRecording ? <Square size={20} /> : <Video size={20} />}
                  </button>
                  <span className="text-sm text-gray-600">
                    {isVideoRecording ? 'Recording... Click to stop' : 'Record video response'}
                  </span>
                </div>

                {/* Video Preview */}
                {showCamera && (
                  <div className="mb-3">
                    <Webcam
                      ref={webcamRef}
                      className="w-full rounded-lg"
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                      }}
                    />
                  </div>
                )}

                {/* Recorded Video Playback */}
                {recordedVideo && (
                  <div className="mb-3">
                    <video
                      src={recordedVideo}
                      controls
                      className="w-full rounded-lg"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitResponse}
                disabled={submitting || (!textResponse.trim() && !transcript.trim() && !recordedVideo)}
                className="btn-primary w-full flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={20} />
                    Submit Response
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Preview</h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              {showCamera ? (
                <Webcam
                  ref={webcamRef}
                  audio={true}
                  className="w-full h-full object-cover"
                  screenshotFormat="image/jpeg"
                />
              ) : recordedVideo ? (
                <video
                  src={recordedVideo}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <Video className="w-12 h-12 mx-auto mb-2" />
                  <p>Video recording will appear here</p>
                  <p className="text-sm mt-1">Click the video button to start recording</p>
                </div>
              )}
              
              {isVideoRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  REC
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 