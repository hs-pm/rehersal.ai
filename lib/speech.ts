// Web Speech API utilities

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any
    webkitSpeechRecognition?: any
  }
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  maxAlternatives?: number
}

class SpeechRecognitionManager {
  private recognition: any = null
  private supported: boolean = false
  private isListening: boolean = false
  private onResultCallback?: (result: SpeechRecognitionResult) => void
  private onErrorCallback?: (error: string) => void
  private onEndCallback?: () => void

  constructor() {
    this.checkSupport()
  }

  private checkSupport(): void {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.supported = !!SpeechRecognition
      
      if (this.supported) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return

    // Default configuration
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    this.recognition.maxAlternatives = 1

    // Event handlers
    this.recognition.onresult = (event: any) => {
      if (this.onResultCallback) {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        const isFinal = result.isFinal

        this.onResultCallback({
          transcript,
          confidence,
          isFinal
        })
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      this.isListening = false
      
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEndCallback) {
        this.onEndCallback()
      }
    }

    this.recognition.onstart = () => {
      this.isListening = true
      console.log('Speech recognition started')
    }
  }

  public configure(options: SpeechRecognitionOptions): void {
    if (!this.recognition) return

    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous
    }
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults
    }
    if (options.lang) {
      this.recognition.lang = options.lang
    }
    if (options.maxAlternatives !== undefined) {
      this.recognition.maxAlternatives = options.maxAlternatives
    }
  }

  public start(): boolean {
    if (!this.supported) {
      console.error('Speech recognition not supported')
      return false
    }

    if (this.isListening) {
      console.warn('Speech recognition already active')
      return false
    }

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      return false
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    }
  }

  public abort(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort()
      } catch (error) {
        console.error('Error aborting speech recognition:', error)
      }
    }
  }

  public onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  public onEnd(callback: () => void): void {
    this.onEndCallback = callback
  }

  public isSupported(): boolean {
    return this.supported
  }

  public getListeningState(): boolean {
    return this.isListening
  }
}

// Export singleton instance
export const speechRecognition = new SpeechRecognitionManager()

// Utility function to get browser support status
export const getSpeechRecognitionSupport = (): {
  supported: boolean
  browser: string
  error?: string
} => {
  if (typeof window === 'undefined') {
    return { supported: false, browser: 'server-side' }
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    return { 
      supported: false, 
      browser: navigator.userAgent,
      error: 'Web Speech API not supported in this browser'
    }
  }

  return { supported: true, browser: navigator.userAgent }
} 