"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, X } from "lucide-react"

interface LanguageInstructionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext?: () => void
}

export function LanguageInstructionsModal({ open, onOpenChange, onNext }: LanguageInstructionsModalProps) {
  const [language, setLanguage] = useState("english")
  const [simpleEnglish, setSimpleEnglish] = useState(false)
  const [extraInstructions, setExtraInstructions] = useState("Be more technical, use a more casual tone, etc.")
  const [aiModel, setAiModel] = useState("claude-4-sonnet")

  const handleNext = () => {
    onNext?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>Language & Instructions</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose your language and provide special instructions for the AI when generating answers.
          </p>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">🌐 Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simple English Option */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Simple English <span className="text-gray-500">(Optional)</span>
            </Label>
            <p className="text-xs text-gray-600">
              If English is not your first language, you can use this option to make sure the AI doesn't use complex
              words.
            </p>
          </div>

          {/* Extra Instructions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Extra Context/Instructions <span className="text-gray-500">(Optional)</span>
            </Label>
            <Textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="Be more technical, use a more casual tone, etc."
              rows={3}
            />
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              🤖 AI Model <span className="text-gray-500">(Optional)</span>
            </Label>
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

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-gray-900 hover:bg-gray-800">
              Next →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
