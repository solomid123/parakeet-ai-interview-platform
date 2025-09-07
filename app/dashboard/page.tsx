"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrialBadge, TrialLimitation } from "@/components/trial-features"
import { SelectResumeModal } from "@/components/select-resume-modal"
import { ConnectModal } from "@/components/connect-modal"
import { TrialInterviewModal } from "@/components/trial-interview-modal"
import { LanguageInstructionsModal } from "@/components/language-instructions-modal"
import { UploadResumeModal } from "@/components/upload-resume-modal"

export default function DashboardHome() {
  const router = useRouter()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<"trial" | "regular" | null>(null)

  const startSessionFlow = (type: "trial" | "regular") => {
    setSessionType(type)
    setCurrentModal("select-resume")
  }

  const handleModalNext = (nextModal: string | null) => {
    if (nextModal === "complete") {
      const sessionId = sessionType === "trial" ? `trial-${Date.now()}` : `session-${Date.now()}`
      router.push(`/interview-session/${sessionId}`)
      setCurrentModal(null)
      setSessionType(null)
    } else {
      setCurrentModal(nextModal)
    }
  }

  const closeModals = () => {
    setCurrentModal(null)
    setSessionType(null)
  }

  const handleUploadResume = () => {
    setShowUploadModal(true)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Hi, badreddine 👋</h2>
        <div className="flex items-center gap-2">
          <TrialBadge />
          <span className="text-sm text-gray-600">Free trial active - upgrade for unlimited sessions</span>
        </div>
      </div>

      {/* 3-Step Process */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Step 1: Trial Session */}
        <Card className="p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-600">Optional: </span>
            <span className="font-semibold">Resume 📝</span>
          </div>
          <div className="mb-4">
            <span className="text-sm text-gray-600">Step 1: </span>
            <span className="font-semibold">Trial Session ⏱️</span>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Upload your resume so ParakeetAI can generate customs answers to the job interview questions.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600">
              See how easy ParakeetAI is to use. Trial Sessions are free and limited to 10 minutes.
            </span>
            <div className="text-2xl">→</div>
          </div>
          <Button className="w-full mb-4" onClick={handleUploadResume}>
            Upload Resume
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => startSessionFlow("trial")}>
            Create Session
          </Button>
        </Card>

        {/* Step 2: Buy Credits */}
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="mb-4">
            <span className="text-sm text-gray-600">Step 2: </span>
            <span className="font-semibold">Buy Credits 💳</span>
          </div>
          <p className="text-sm text-gray-600 mb-6">Buy credits to use for the real interview. No subscription!</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-2xl">→</div>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              Get Credits
            </Button>
            <p className="text-xs text-center text-gray-500">Starting from $9.99 for 5 credits</p>
          </div>
        </Card>

        {/* Step 3: Real Interview */}
        <Card className="p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-600">Step 3: </span>
            <span className="font-semibold">Real Interview 🎯</span>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Use ParakeetAI for a real interview to get the job you have always dreamed of.
          </p>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => startSessionFlow("regular")}>
            Start
          </Button>
        </Card>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Trial Limitations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <TrialLimitation
            feature="Session Duration"
            description="Trial sessions are limited to 10 minutes. Upgrade for unlimited session time."
          />
          <TrialLimitation
            feature="Advanced AI Models"
            description="Access to GPT-4 and Claude requires credits. Trial uses basic AI model."
            upgradeRequired={true}
          />
        </div>
      </div>

      {/* Desktop App vs Browser Version */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Badge className="bg-blue-100 text-blue-800">New</Badge>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Desktop App vs Browser Version</h3>
              <p className="text-sm text-gray-600 mb-4">
                ParakeetAI is available as both a Desktop App and a Browser/Web version. The Desktop App works
                seamlessly with any interview platform, while the Browser/Web version is easier and quicker to use.
              </p>
              <Button variant="outline" size="sm">
                Video Tutorial: Desktop App vs Web Version
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coding Interview Support */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Badge className="bg-orange-100 text-orange-800">Coding Interview Support</Badge>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Coding Interview Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can use ParakeetAI for coding interviews. It can both listen for coding questions and capture the
                screen if a LeetCode-style question is being screen shared with you.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Video: Web/Browser
                </Button>
                <Button variant="outline" size="sm">
                  Video: Desktop App
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Where did you hear about us */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-6 text-center">Where did you hear about us?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              Google
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-black rounded"></div>
              TikTok
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              Conference
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              Instagram
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              YouTube
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              Reddit
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              Friend
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              ChatGPT
            </Button>
            <Button variant="outline" className="justify-start gap-2 bg-transparent">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              Snapchat
            </Button>
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">OR</span>
          </div>
          <div className="mt-4 flex gap-2">
            <input type="text" placeholder="Other" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <Button size="sm">Submit Other</Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal components for session creation flow */}
      <UploadResumeModal open={showUploadModal} onOpenChange={setShowUploadModal} />

      <SelectResumeModal
        open={currentModal === "select-resume"}
        onOpenChange={closeModals}
        onNext={() => handleModalNext("trial-interview")}
      />

      <TrialInterviewModal
        open={currentModal === "trial-interview"}
        onOpenChange={closeModals}
        onNext={() => handleModalNext("language-instructions")}
        onBack={() => setCurrentModal("select-resume")}
      />

      <LanguageInstructionsModal
        open={currentModal === "language-instructions"}
        onOpenChange={closeModals}
        onNext={() => handleModalNext("connect")}
        onBack={() => setCurrentModal("trial-interview")}
      />

      <ConnectModal
        open={currentModal === "connect"}
        onOpenChange={closeModals}
        onConnect={() => handleModalNext("complete")}
        onBack={() => setCurrentModal("language-instructions")}
      />
    </div>
  )
}
