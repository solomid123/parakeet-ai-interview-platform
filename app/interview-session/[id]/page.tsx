"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Mic, Video, Monitor, Settings, Send, MoreHorizontal, X } from "lucide-react"

// Import Speechmatics client
import { RealtimeClient } from '@speechmatics/real-time-client'
import { createSpeechmaticsJWT } from '@speechmatics/auth'

// Import Google Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function InterviewSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const speechmaticsClientRef = useRef<RealtimeClient | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  
  const [isConnected, setIsConnected] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [autoScrollChat, setAutoScrollChat] = useState(true)
  const [message, setMessage] = useState("")
  const [transcript, setTranscript] = useState("")
  const [currentPartialWords, setCurrentPartialWords] = useState("")
  const [timer, setTimer] = useState("9 mins")
  const [isTrial, setIsTrial] = useState(params.id.includes("trial"))
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("english")

  // AI Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [cvContent, setCvContent] = useState("")

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI('AIzaSyCM-ayeO7JR8EkBL-b4NP0KIvkhAL925-k')

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        // Keep the connection alive - removed the transcript reset
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  // Auto-scroll transcript
  useEffect(() => {
    if (autoScroll && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript, autoScroll])

  // Auto-scroll chat
  useEffect(() => {
    if (autoScrollChat && chatRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
      }, 100)
    }
  }, [chatMessages, autoScrollChat])

  // Load AI context data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const company = window.sessionStorage.getItem('company') || ''
      const jobDesc = window.sessionStorage.getItem('jobDescription') || ''
      const cvData = window.sessionStorage.getItem('cvContent') || ''
      const lang = window.sessionStorage.getItem('selectedLanguage') || 'english'
      
      // Combine company and job description for context
      const fullJobDescription = company ? `${jobDesc} at ${company}` : jobDesc
      setJobDescription(fullJobDescription)
      setCvContent(cvData)
      
      // Ensure language is properly set
      setSelectedLanguage(lang)
      
      console.log('🎯 AI Context Loaded:', {
        jobDescription: fullJobDescription,
        cvContentLength: cvData.length,
        selectedLanguage: lang,
        cvQuality: cvData.length > 500 ? 'Detailed CV' : cvData.length > 100 ? 'Basic CV' : 'Minimal CV'
      })
    }
  }, [])

  // Auto-start screen sharing if user came from connect flow
  useEffect(() => {
    const shouldStartScreenShare = window.sessionStorage.getItem('shouldStartScreenShare')
    if (shouldStartScreenShare === 'true') {
      // Clear the flag immediately to prevent multiple calls
      window.sessionStorage.removeItem('shouldStartScreenShare')
      
      // Get the selected language
      const lang = window.sessionStorage.getItem('selectedLanguage') || 'english'
      setSelectedLanguage(lang)
      
      // Start screen sharing automatically
      handleConnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('Setting video stream in useEffect:', stream)
      videoRef.current.srcObject = stream
      
      // Force play
      videoRef.current.play().catch(err => {
        console.warn('Video play failed:', err)
      })

      // Start transcription when stream is available
      if (stream.getAudioTracks().length > 0) {
        startTranscription(stream)
      }
    }
  }, [stream])

  const startTranscription = async (mediaStream: MediaStream) => {
    try {
      console.log('Starting transcription for language:', selectedLanguage)
      setIsTranscribing(true)

      // Map language selection to Speechmatics language codes
      const languageCode = selectedLanguage === 'french' ? 'fr' : 'en'

      // Create JWT token for authentication
      const jwt = await createSpeechmaticsJWT({
        type: 'rt',
        apiKey: '9H7qJMUKIEyIrB8cZGkr3TcwpdMn1pw7',
        ttl: 3600, // 1 hour
      })

      // Initialize Speechmatics client
      const client = new RealtimeClient()
      speechmaticsClientRef.current = client

      // Set up audio processing variables
      let audioContext: AudioContext | null = null
      let source: MediaStreamAudioSourceNode | null = null
      let processor: ScriptProcessorNode | null = null
      let isReadyToSendAudio = false

      // Set up transcript event handlers
      client.addEventListener('receiveMessage', ({ data }: any) => {
        console.log('Received Speechmatics message:', data.message, data)
        
        if (data.message === 'RecognitionStarted') {
          console.log('Speechmatics recognition started - setting up audio processing')
          setTranscript(prev => prev + '\n[Transcription started...]\n')
          
          // Now set up audio processing
          try {
            audioContext = new AudioContext({ 
              sampleRate: 16000,
              latencyHint: 'interactive' // Optimize for low latency
            })
            audioContextRef.current = audioContext
            
            source = audioContext.createMediaStreamSource(mediaStream)
            // Use smaller buffer for faster updates (2048 instead of 4096)
            processor = audioContext.createScriptProcessor(2048, 1, 1)
            
            processor.onaudioprocess = (event) => {
              if (client && isReadyToSendAudio) {
                const inputBuffer = event.inputBuffer.getChannelData(0)
                
                // Apply light audio enhancement for better recognition
                const enhanced = new Float32Array(inputBuffer.length)
                for (let i = 0; i < inputBuffer.length; i++) {
                  // Light noise gate and normalization
                  const sample = inputBuffer[i]
                  enhanced[i] = Math.abs(sample) > 0.01 ? sample * 1.2 : 0
                }
                
                // Convert to 16-bit PCM with better precision
                const pcmData = new Int16Array(enhanced.length)
                for (let i = 0; i < enhanced.length; i++) {
                  const sample = Math.max(-1, Math.min(1, enhanced[i]))
                  pcmData[i] = sample * 32767
                }
                
                try {
                  client.sendAudio(pcmData.buffer)
                } catch (audioError) {
                  console.error('Error sending audio:', audioError)
                }
              }
            }
            
            // Connect the audio chain
            source.connect(processor)
            processor.connect(audioContext.destination)
            
            // Now we're ready to send audio
            isReadyToSendAudio = true
            console.log('Audio processing chain connected, ready to send audio')
            
          } catch (audioError) {
            console.error('Error setting up audio processing:', audioError)
            setTranscript(prev => prev + '\n[Audio setup error: ' + audioError + ']\n')
          }
        }
        else if (data.message === 'AddPartialTranscript') {
          // Handle partial transcripts (word-by-word real-time updates)
          if (data.results && data.results.length > 0) {
            console.log('⚡ Partial transcript with', data.results.length, 'results (fast mode)')
            
            // Process individual words from the results array
            let newWords = ''
            data.results.forEach((result: any) => {
              if (result.type === 'word' && result.alternatives && result.alternatives[0]) {
                newWords += result.alternatives[0].content + ' '
              } else if (result.type === 'punctuation' && result.alternatives && result.alternatives[0]) {
                newWords = newWords.trim() + result.alternatives[0].content + ' '
              }
            })
            
            // Update current partial words with faster refresh
            if (newWords.trim()) {
              setCurrentPartialWords(newWords.trim())
            }
          }
        }
        else if (data.message === 'AddTranscript') {
          // Handle final transcripts (word-by-word finalization)
          if (data.results && data.results.length > 0) {
            console.log('✅ Final transcript with', data.results.length, 'results (enhanced accuracy)')
            
            // Process individual words from the results array
            let finalWords = ''
            data.results.forEach((result: any) => {
              if (result.type === 'word' && result.alternatives && result.alternatives[0]) {
                finalWords += result.alternatives[0].content + ' '
              } else if (result.type === 'punctuation' && result.alternatives && result.alternatives[0]) {
                finalWords = finalWords.trim() + result.alternatives[0].content + ' '
              }
            })
            
            if (finalWords.trim()) {
              // Add the final words to the main transcript
              setTranscript(prev => {
                const newTranscript = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalWords.trim()
                return newTranscript
              })
              
              // Clear partial words since they're now finalized
              setCurrentPartialWords('')
            }
          }
        }
        else if (data.message === 'Error') {
          console.error('Speechmatics error:', data)
          setTranscript(prev => prev + '\n[Transcription error: ' + (data.reason || JSON.stringify(data)) + ']\n')
          isReadyToSendAudio = false
        }
        else if (data.message === 'EndOfTranscript') {
          console.log('Speechmatics transcription ended')
          setTranscript(prev => prev + '\n[Transcription ended]\n')
          isReadyToSendAudio = false
        }
      })

      // Start the client with optimized configuration for speed and accuracy
      console.log('Starting Speechmatics client...')
      await client.start(jwt, {
        audio_format: {
          type: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 16000
        },
        transcription_config: {
          language: languageCode,
          operating_point: 'enhanced', // Better accuracy and speed
          enable_partials: true,
          max_delay: 0.7, // Minimum delay for fastest response
          max_delay_mode: 'fixed', // Fixed delay for consistent timing
          transcript_filtering_config: {
            remove_disfluencies: true, // Remove "um", "uh" etc for cleaner output
          },
          punctuation_overrides: {
            sensitivity: 0.8, // Higher punctuation sensitivity for better formatting
          },
        },
      })

      console.log('Speechmatics client started, waiting for RecognitionStarted...')

    } catch (error) {
      console.error('Failed to start transcription:', error)
      setTranscript(prev => prev + '\n[Failed to start transcription: ' + error + ']\n')
      setIsTranscribing(false)
    }
  }

  const stopTranscription = async () => {
    try {
      if (speechmaticsClientRef.current) {
        await speechmaticsClientRef.current.stopRecognition()
        speechmaticsClientRef.current = null
      }
      
      if (audioContextRef.current) {
        await audioContextRef.current.close()
        audioContextRef.current = null
      }
      
      setIsTranscribing(false)
      console.log('Transcription stopped')
    } catch (error) {
      console.error('Error stopping transcription:', error)
    }
  }

  const handleConnect = async () => {
    try {
      console.log('Starting screen sharing...')
      
      // Request screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      
      console.log('Screen stream obtained:', screenStream)
      console.log('Video tracks:', screenStream.getVideoTracks())
      console.log('Audio tracks:', screenStream.getAudioTracks())
      
      // Check if video tracks are active
      const videoTracks = screenStream.getVideoTracks()
      if (videoTracks.length > 0) {
        console.log('Video track state:', videoTracks[0].readyState)
        console.log('Video track enabled:', videoTracks[0].enabled)
      }
      
      setStream(screenStream)
      setIsScreenSharing(true)
      setIsConnected(true)
      
      // Handle stream end (when user stops sharing)
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing ended')
        stopTranscription()
        setIsScreenSharing(false)
        setIsConnected(false)
        setStream(null)
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      })
      
    } catch (error) {
      console.error('Screen sharing failed:', error)
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Screen sharing was denied. Please allow screen sharing to continue.')
      } else {
        alert('Failed to start screen sharing. Please try again.')
      }
    }
  }

  const handleClear = () => {
    setTranscript("")
    setCurrentPartialWords("")
    setChatMessages([])
    console.log('🧹 Manual clear - reset all data')
  }
  
  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message.trim(),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, userMessage])
      setMessage("")
    }
  }

  // Handle spacebar for AI Answer (global keyboard shortcut)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && event.target === document.body && !isGeneratingResponse) {
        event.preventDefault()
        generateAIResponse()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isGeneratingResponse]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleExit = () => {
    stopTranscription()
    router.push("/dashboard/interview-sessions")
  }

  const generateAIResponse = async () => {
    setIsGeneratingResponse(true)
    setStreamingResponse("")

    // Store current transcript for analysis
    const currentTranscript = transcript.trim()
    
    // Debug: Log the current language setting
    console.log('🌍 Language Debug:', {
      selectedLanguage,
      isSelectedLanguageFrench: selectedLanguage === 'french',
      languageFromSessionStorage: typeof window !== 'undefined' ? window.sessionStorage.getItem('selectedLanguage') : null
    })

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      const hasTranscript = currentTranscript.length > 0
      
      // Clean up transcript and try to extract the main question
      const cleanTranscript = hasTranscript ? 
        currentTranscript
          .replace(/\s+/g, ' ')  // Clean multiple spaces
          .replace(/[.,!?]+\s*$/, '')  // Remove trailing punctuation
          .trim() 
        : ''

      // Check if transcript contains meaningful content (question indicators)
      const hasQuestion = hasTranscript && (
        cleanTranscript.length >= 15 && (
          cleanTranscript.includes('?') ||
          /\b(tell me|describe|explain|what|how|why|when|where|can you|would you|could you|do you|have you|are you|will you)\b/i.test(cleanTranscript) ||
          /\b(about|experience|background|skills|projects|work|role|position|company|team)\b/i.test(cleanTranscript) ||
          cleanTranscript.length >= 30  // Longer transcript likely contains question
        )
      )

      // Determine response language - make it more robust
      const responseLanguage = selectedLanguage.toLowerCase().includes('french') || selectedLanguage === 'french' ? 'French' : 'English'
      
      console.log('🗣️ AI will respond in:', responseLanguage)

      const context = hasQuestion ? `
You are an expert job candidate in an interview. Analyze the conversation and provide an appropriately sized response based on the question type.

**Position**: ${jobDescription}
**Your CV/Background**: ${cvContent}
**IMPORTANT - Language**: You MUST answer in ${responseLanguage}. This is critical - respond only in ${responseLanguage}.

**Conversation/Question**: "${cleanTranscript}"

**Response Format Required:**
1. First, identify and categorize the main interview question
2. Then provide your appropriately detailed strategic response

**Question Analysis Guidelines:**

**DETAILED ANSWERS (3-5+ sentences with examples) for:**
- Experience questions: "Tell me about your experience with...", "Describe your background in..."
- Technical skills: "How do you approach...", "What's your experience with [technology]..."
- Project examples: "Give me an example of...", "Tell me about a time when..."
- Problem-solving: "How would you handle...", "Describe a challenge you faced..."
- Strengths/achievements: "What are your main strengths?", "What are you most proud of?"
- Behavioral questions: "Describe a situation where...", "How do you work in teams?"

**BRIEF ANSWERS (1-2 sentences) for:**
- Yes/no questions: "Do you have experience with...", "Are you familiar with...", "Can you..."
- Availability: "When can you start?", "What's your availability?"
- Simple preferences: "Do you prefer...", "What do you think about..."
- Logistics: "Any questions for us?", "How did you hear about us?"
- Confirmation questions: "Is that correct?", "Do you understand?"

**Instructions:**
- Format your response with clear sections
- Use "**1. Question Analysis:**" as the first section header
- Use "**2. Strategic Response in ${responseLanguage}:**" as the second section header
- In section 1: Categorize the question type and explain the appropriate response length
- In section 2: Provide response matching the identified category
  - For DETAILED questions: Include multiple specific examples, concrete details, numbers, achievements, storytelling
  - For BRIEF questions: Give direct, concise answers while still showing competence
- CRITICAL: Respond ONLY in ${responseLanguage}

Generate your intelligent analysis and appropriately sized response:
` : hasTranscript ? `
You are in an interview but the conversation isn't clear yet. Provide a helpful response.

**Position**: ${jobDescription}
**Your Background**: ${cvContent}
**IMPORTANT - Language**: You MUST respond in ${responseLanguage}. This is critical - respond only in ${responseLanguage}.

**What you heard**: "${cleanTranscript}"

**Response Format:**
**1. Analysis:** Explain what you heard and whether it seems complete or partial
**2. Response in ${responseLanguage}:** Give an appropriate professional response - if it seems like a partial question, ask for clarification politely. If it contains enough context, provide a brief relevant response.
` : `
You are starting an interview for: ${jobDescription}

**Your Background**: ${cvContent}
**IMPORTANT - Language**: You MUST respond in ${responseLanguage}. This is critical - respond only in ${responseLanguage}.

**Response Format:**
**Professional Introduction in ${responseLanguage}:** Give a comprehensive, well-structured introduction that highlights your key strengths and most relevant achievements for this role. Include 2-3 specific examples that demonstrate your value.
`

      // Use streaming response instead of regular generateContent
      const result = await model.generateContentStream(context)
      let fullResponse = ""

      // Add question to chat if there's a meaningful transcript
      if (hasQuestion) {
        const questionMessage: ChatMessage = {
          id: `question-${Date.now()}`,
          type: 'user',
          content: `**Summarized question:** ${cleanTranscript}`,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, questionMessage])
      }

      // Process the streaming response
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        fullResponse += chunkText
        setStreamingResponse(fullResponse)
        
        // Auto-scroll during streaming
        if (autoScrollChat && chatRef.current) {
          setTimeout(() => {
            chatRef.current?.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: 'smooth'
            })
          }, 50)
        }
      }

      // Add final response to chat messages
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: fullResponse,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, newMessage])
      setStreamingResponse("") // Clear streaming text
      
      // Clear analyzed transcript
      if (hasTranscript) {
        setTranscript("")
        setCurrentPartialWords("")
        console.log('🎯 Question Detection Results:', {
          originalLength: currentTranscript.length,
          cleanedText: cleanTranscript.substring(0, 100) + '...',
          hasQuestion: hasQuestion,
          questionIndicators: {
            hasQuestionMark: cleanTranscript.includes('?'),
            hasQuestionWords: /\b(tell me|describe|explain|what|how|why|when|where|can you|would you|could you|do you|have you|are you|will you)\b/i.test(cleanTranscript),
            hasInterviewKeywords: /\b(about|experience|background|skills|projects|work|role|position|company|team)\b/i.test(cleanTranscript),
            lengthThreshold: cleanTranscript.length >= 30
          }
        })
      }
      
      console.log('🤖 AI Response generated for:', hasQuestion ? 'detected question' : hasTranscript ? 'unclear conversation' : 'introduction')

    } catch (error) {
      console.error('Error generating AI response:', error)
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error generating a response. Please try again.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
      setStreamingResponse("")
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-bold">ParakeetAI</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isTrial && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {timer} (Trial)
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleExit}>
            Exit
          </Button>
        </div>
      </header>

      {/* Main Interface — 50/50 split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Panel — Video + Transcript (6/12) */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Video Area */}
          <div className="bg-black relative h-80 sm:h-96 lg:h-[500px]">
            {isScreenSharing && stream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain bg-black"
                onLoadedMetadata={() => console.log('Video metadata loaded')}
                onCanPlay={() => console.log('Video can play')}
                onError={(e) => console.error('Video error:', e)}
              />
            ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-8 text-white text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm">
                    {isConnected ? "Screen sharing active" : "Ready to share screen"}
                  </p>
                <p className="text-xs text-gray-400 mt-2">
                    {isConnected 
                      ? "Your shared content will appear here" 
                      : "Click 'Connect' below to start screen sharing"
                    }
                </p>
              </div>
            </div>
            )}

            {/* Video controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                <Mic className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                <Monitor className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="flex-1 bg-white border-t flex flex-col min-h-0">
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Transcript</span>
                  {!isConnected ? (
                    <Button size="sm" onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
                      Connect
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Connected</span>
                        {isTranscribing && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-600">Transcribing ({selectedLanguage}) • Enhanced Mode</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={handleClear}>
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">AutoScroll</span>
                        <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div 
              ref={transcriptRef} 
              className="flex-1 p-4 overflow-y-auto min-h-0 max-h-96"
              style={{ height: '300px' }}
            >
              <div className="text-gray-600 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {transcript || "Listening for audio..."}
                {currentPartialWords && (
                  <span className="text-blue-600 opacity-80 animate-pulse">
                    {transcript && !transcript.endsWith(' ') ? ' ' : ''}{currentPartialWords}
                    <span className="inline-block w-1 h-4 bg-blue-400 ml-1 animate-pulse"></span>
                  </span>
                )}
                {isTranscribing && !currentPartialWords && (
                  <span className="inline-block w-1 h-4 bg-green-400 ml-1 animate-pulse"></span>
                )}
                
                {/* Question Detection Indicator */}
                {transcript && transcript.length >= 15 && (
                  <div className="mt-2 text-xs">
                    {(() => {
                      const cleanText = transcript.replace(/\s+/g, ' ').trim();
                      const hasQ = cleanText.includes('?') ||
                        /\b(tell me|describe|explain|what|how|why|when|where|can you|would you|could you|do you|have you|are you|will you)\b/i.test(cleanText) ||
                        /\b(about|experience|background|skills|projects|work|role|position|company|team)\b/i.test(cleanText) ||
                        cleanText.length >= 30;
                      
                      return hasQ ? (
                        <span className="text-green-600 font-medium">🎯 Question detected - Ready for AI response</span>
                      ) : (
                        <span className="text-yellow-600">⏳ Listening for complete question...</span>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Chat (6/12) */}
        <div className="lg:col-span-6 bg-white border-l flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
            <h3 className="font-medium">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-scroll-chat"
                  checked={autoScrollChat}
                  onCheckedChange={setAutoScrollChat}
                />
                <span className="text-sm">AutoScroll</span>
              </div>
            </div>
            {isGeneratingResponse && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600">Generating response...</span>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatRef} 
            className="p-4 overflow-y-auto"
            style={{ height: '800px' }}
          >
            {chatMessages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-center">
            <div className="text-gray-400 mb-4">
              <MoreHorizontal className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No messages yet.</p>
            </div>
            <p className="text-xs text-gray-500">Click "AI Answer" to start!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg text-sm ${
                      message.type === 'ai' 
                        ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                        : 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs opacity-70">
                        {message.type === 'ai' ? '🤖 AI Assistant' : '👤 Question'}
                      </span>
                      <span className="text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {/* Show streaming response while generating */}
                {isGeneratingResponse && streamingResponse && (
                  <div className="p-3 rounded-lg text-sm bg-blue-50 border border-blue-200 text-blue-900 opacity-90">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs opacity-70">
                        🤖 AI Assistant
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-xs opacity-50">Generating...</span>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {streamingResponse}
                      <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>
                    </div>
                  </div>
                )}
                
                {/* Loading indicator when starting generation */}
                {isGeneratingResponse && !streamingResponse && (
                  <div className="p-3 rounded-lg text-sm bg-blue-50 border border-blue-200 text-blue-900 opacity-70">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Starting analysis...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t space-y-3 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a manual message..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="sm" onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-50" 
              onClick={generateAIResponse}
              disabled={isGeneratingResponse}
            >
              {isGeneratingResponse ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating Response...
                </>
              ) : (
                transcript.length >= 20 ? '🎯 AI Answer (Space)' : '✨ AI Introduction (Space)'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
