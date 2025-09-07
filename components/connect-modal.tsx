"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, X, Play, Monitor, Smartphone, Video, Phone, Headphones } from "lucide-react"

interface ConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect?: () => void
  onBack?: () => void
}

export function ConnectModal({ open, onOpenChange, onConnect, onBack }: ConnectModalProps) {
  const [language, setLanguage] = useState("english")
  const [aiModel, setAiModel] = useState("claude-4-sonnet")
  const [shareAudio, setShareAudio] = useState(true)

  const handleConnect = () => {
    // Set flag to indicate user is coming from connect flow
    window.sessionStorage.setItem('shouldStartScreenShare', 'true')
    
    // Store the selected language and AI model for the interview session
    window.sessionStorage.setItem('selectedLanguage', language)
    window.sessionStorage.setItem('selectedAiModel', aiModel)
    window.sessionStorage.setItem('shareAudio', shareAudio.toString())
    
    // Note: Company, job description, and CV content are already stored by previous modals
    // No need to override them with placeholder data
    
    // Navigate to interview session
    onConnect?.()
    onOpenChange(false)
  }

  // Get stored data for display
  const storedCompany = typeof window !== 'undefined' ? window.sessionStorage.getItem('company') || 'Unknown Company' : 'Unknown Company'
  const storedJobDescription = typeof window !== 'undefined' ? window.sessionStorage.getItem('jobDescription') || 'Position' : 'Position'
  const storedResumeName = typeof window !== 'undefined' ? window.sessionStorage.getItem('selectedResumeName') || 'Resume' : 'Resume'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>Connect</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              This is an Interview Session for a position <strong>"{storedJobDescription}"</strong> at <strong>"{storedCompany}"</strong> with{" "}
              <strong>{storedResumeName}</strong> and <strong>extra context</strong>.
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">🌐 Language</span>
              <span className="text-sm text-gray-600">Simple</span>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">🤖 AI Model</span>
              <span className="text-sm text-gray-600">(Optional)</span>
            </div>
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-4-sonnet">Claude 4 Sonnet</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share Audio Option */}
          <div className="flex items-center justify-between">
            <Label htmlFor="share-audio" className="text-sm">
              💡 Make sure to select the "Also share tab audio" option when sharing the screen.
            </Label>
            <Switch id="share-audio" checked={shareAudio} onCheckedChange={setShareAudio} />
          </div>

          {/* Connection Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How to Connect:</Label>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Monitor className="w-4 h-4" />
                Zoom
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Video className="w-4 h-4" />
                Teams
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Smartphone className="w-4 h-4" />
                Meet
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Phone className="w-4 h-4" />
                Skype
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Headphones className="w-4 h-4" />
                Phone
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Play className="w-4 h-4" />
                Video Tutorial
              </Button>
            </div>
          </div>

          {/* Mock Interview Option */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 bg-green-200 rounded flex items-center justify-center">
                <Play className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-800 mb-2">
                  💡 Instead of an interview tab, you can also share a <strong>mock interview</strong> on YouTube and
                  test ParakeetAI that way.
                </p>
                <p className="text-sm text-green-700">
                  Example video: <span className="underline">Mock Interview</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleConnect} 
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              🚀 Continue to Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
