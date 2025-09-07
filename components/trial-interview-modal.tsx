"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Clock } from "lucide-react"

interface TrialInterviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext?: () => void
}

export function TrialInterviewModal({ open, onOpenChange, onNext }: TrialInterviewModalProps) {
  const [company, setCompany] = useState("Microsoft...")
  const [jobDescription, setJobDescription] = useState("Software Engineer versed in Python, SQL, and AWS...")

  const handleNext = () => {
    // Store company and job description in sessionStorage for AI responses
    window.sessionStorage.setItem('company', company)
    window.sessionStorage.setItem('jobDescription', jobDescription)
    
    onNext?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            <DialogTitle>Trial Interview (10 min)</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Type in the what company you are interviewing with and for what position. This lets the AI know what kind of
            answers to suggest.
          </p>

          <div className="space-y-3">
            <div>
              <Label htmlFor="company" className="text-sm font-medium">
                🏢 Company
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Microsoft..."
              />
            </div>

            <div>
              <Label htmlFor="job-description" className="text-sm font-medium">
                📝 Job Description
              </Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Software Engineer versed in Python, SQL, and AWS..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
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
