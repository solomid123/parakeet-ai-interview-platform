"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ArrowLeft } from "lucide-react"

interface UploadResumeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResumeCreated?: () => void
}

export function UploadResumeModal({ open, onOpenChange, onResumeCreated }: UploadResumeModalProps) {
  const [step, setStep] = useState<"method" | "upload" | "manual">("method")
  const [title, setTitle] = useState("")
  const router = useRouter()

  const handleClose = () => {
    setStep("method")
    setTitle("")
    onOpenChange(false)
  }

  const handleBack = () => {
    if (step === "upload" || step === "manual") {
      setStep("method")
    }
  }

  const createNewResume = (resumeTitle: string, type: "pdf" | "manual" = "manual") => {
    // Generate a unique ID for the new resume
    const newId = Date.now().toString()
    
    // Create complete CV structure with all sections
    const newCVData = {
      id: newId,
      title: resumeTitle,
      personalDetails: {
        name: "",
        email: "",
        phone: "",
        address: ""
      },
      introduction: "",
      education: [],
      experience: [],
      skills: []
    }

    // Generate complete CV content template
    const cvContent = `PERSONAL INFORMATION:
Name: [Your Name]
Email: [Your Email]
Phone: [Your Phone]
Address: [Your Address]

PROFESSIONAL SUMMARY:
[Add your professional summary here - describe your background, experience, and key strengths]

EDUCATION:
[Add your education details here - degrees, institutions, dates, descriptions]

EXPERIENCE:
[Add your work experience here - companies, positions, dates, achievements]

SKILLS:
[Add your skills here - technical skills, software proficiency, languages, etc.]
• TECHNICAL SKILLS: [List relevant technical skills]
• SOFTWARE: [List software you're proficient with]  
• LANGUAGES: [List programming/spoken languages]
• OTHER SKILLS: [List additional relevant skills]`

    // Save to localStorage
    localStorage.setItem(`cv_${newId}`, JSON.stringify(newCVData))
    localStorage.setItem(`cv_content_${newId}`, cvContent)

    // Add to resume list
    const existingResumes = JSON.parse(localStorage.getItem('resumes_list') || '[]')
    const newResume = {
      id: newId,
      title: resumeTitle,
      filename: type === "pdf" ? `${resumeTitle}.pdf` : "",
      type: type,
      createdAt: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
    existingResumes.push(newResume)
    localStorage.setItem('resumes_list', JSON.stringify(existingResumes))

    console.log('Created new resume with complete structure:', newResume)

    // Close modal and notify parent
    handleClose()
    onResumeCreated?.()

    // Navigate to edit the new resume
    router.push(`/dashboard/resumes/${newId}`)
  }

  const handleManualCreate = () => {
    if (title.trim()) {
      createNewResume(title.trim(), "manual")
    } else {
      alert('Please enter a title for your resume')
    }
  }

  const handleUploadCreate = () => {
    if (title.trim()) {
      // For now, create a manual resume (PDF upload can be implemented later)
      createNewResume(title.trim(), "pdf")
    } else {
      alert('Please enter a title for your resume')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            {step !== "method" && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>Create New Resume</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              The contents of the resume will be used to generate interview answers.
            </p>

            <div className="space-y-3">
              <Button onClick={() => setStep("upload")} className="w-full bg-gray-900 hover:bg-gray-800 h-12">
                <Upload className="w-4 h-4 mr-2" />
                Create from Title (PDF Style)
              </Button>

              <Button onClick={() => setStep("manual")} variant="outline" className="w-full h-12">
                Create Manually
              </Button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">Create a new resume with a professional template</p>
              <p className="text-xs text-gray-500">You can edit all details after creation</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resume Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., John_Smith_CV.pdf"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleUploadCreate} className="flex-1 bg-gray-900 hover:bg-gray-800">
                Create Resume
              </Button>
            </div>
          </div>
        )}

        {step === "manual" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Create a new resume that you can edit manually with your personal details, education, and experience.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Resume Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., My Professional Resume"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleManualCreate} className="flex-1 bg-gray-900 hover:bg-gray-800">
                Create & Edit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
