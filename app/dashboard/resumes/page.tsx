"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { UploadResumeModal } from "@/components/upload-resume-modal"

interface Resume {
  id: string
  title: string
  filename: string
  type: "pdf" | "manual"
  createdAt: string
}

// Default/demo resumes that will always be shown
const defaultResumes: Resume[] = [
  {
    id: "1",
    title: "My Resume",
    filename: "",
    type: "manual",
    createdAt: "Demo",
  },
  {
    id: "2",
    title: "Badreddine_CV.pdf",
    filename: "Badreddine_CV.pdf",
    type: "pdf",
    createdAt: "May 21, 2025",
  },
]

export default function ResumesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>(defaultResumes)
  const router = useRouter()

  // Load resumes from localStorage on component mount
  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = () => {
    if (typeof window !== 'undefined') {
      const storedResumes = JSON.parse(localStorage.getItem('resumes_list') || '[]')
      
      // Combine default resumes with user-created ones
      const allResumes = [...defaultResumes, ...storedResumes]
      
      setResumes(allResumes)
      console.log('Loaded resumes:', allResumes)
    }
  }

  const handleResumeClick = (resumeId: string) => {
    router.push(`/dashboard/resumes/${resumeId}`)
  }

  const handleDeleteResume = (resumeId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click
    
    // Don't allow deleting default resumes
    if (resumeId === "1" || resumeId === "2") {
      alert("Cannot delete demo resumes")
      return
    }

    if (confirm("Are you sure you want to delete this resume?")) {
      // Remove from localStorage
      const storedResumes = JSON.parse(localStorage.getItem('resumes_list') || '[]')
      const updatedResumes = storedResumes.filter((r: Resume) => r.id !== resumeId)
      localStorage.setItem('resumes_list', JSON.stringify(updatedResumes))
      
      // Remove CV data
      localStorage.removeItem(`cv_${resumeId}`)
      localStorage.removeItem(`cv_content_${resumeId}`)
      
      // Reload the list
      loadResumes()
    }
  }

  const handleResumeCreated = () => {
    // Refresh the resumes list
    loadResumes()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">CVs / Resumes</h1>
          <p className="text-sm text-gray-600 mt-1">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="bg-gray-900 hover:bg-gray-800">
          Create New Resume
        </Button>
      </div>

      {/* Resumes List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Title</th>
                  <th className="text-left p-4 font-medium text-gray-600">Created At</th>
                  <th className="w-12 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <tr key={resume.id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="p-4" onClick={() => handleResumeClick(resume.id)}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 hover:text-blue-600">
                          {resume.title}
                        </span>
                        {resume.type === "pdf" && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            PDF Style
                          </Badge>
                        )}
                        {(resume.id === "1" || resume.id === "2") && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Demo
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4" onClick={() => handleResumeClick(resume.id)}>
                      <span className="text-gray-600">{resume.createdAt || "-"}</span>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={(e) => handleDeleteResume(resume.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="text-center mt-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 text-sm font-medium mb-2">💡 How to add your CV:</p>
          <p className="text-blue-700 text-sm">
            Click "<strong>Create New Resume</strong>" above → Choose creation method → Enter title → 
            Edit your personal details, education, and experience → Save
          </p>
          <p className="text-blue-600 text-xs mt-2">
            Your CV content will be used by the AI to generate personalized interview responses!
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadResumeModal 
        open={showUploadModal} 
        onOpenChange={setShowUploadModal}
        onResumeCreated={handleResumeCreated}
      />
    </div>
  )
}
