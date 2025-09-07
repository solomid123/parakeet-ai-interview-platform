"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, X } from "lucide-react"

interface SelectResumeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext?: () => void
}

const mockResumes = [
  { 
    id: "1", 
    name: "My Resume",
    content: `PERSONAL INFORMATION:
Name: Professional Developer
Email: developer@email.com
Phone: +1234567890
Address: Professional Address

PROFESSIONAL SUMMARY:
Experienced software developer with strong technical background in full-stack development. Skilled in modern programming languages and frameworks with a passion for creating efficient, scalable solutions.

EDUCATION:
• Computer Science Degree - University of Technology (2018-2022)
  Location: Tech City
  Comprehensive computer science education with focus on software engineering principles, algorithms, and system design.

EXPERIENCE:
• Software Developer at Tech Company (2022-Present)
  Location: Tech City
  Full-stack development using modern frameworks and technologies. Experience with agile methodologies and collaborative development.

SKILLS:
• PROGRAMMING LANGUAGES:
  JavaScript, TypeScript, Python, Java, C++, SQL
• FRAMEWORKS & TECHNOLOGIES:
  React, Next.js, Node.js, Express, MongoDB, PostgreSQL, AWS
• TOOLS & SOFTWARE:
  Git, Docker, VS Code, Postman, Jira, Figma`
  },
  { 
    id: "2", 
    name: "Badreddine_CV.pdf",
    content: `PERSONAL INFORMATION:
Name: badreddine barki
Email: badreddinebarki@gmail.com
Phone: +33758551524
Address: 14 rue de la 2E DB

PROFESSIONAL SUMMARY:
Mechanical Engineer with comprehensive experience in CAD modeling, finite element analysis, and developing innovative solutions for complex projects. Passionate about enhancing product quality and operational efficiency, with a strong track record of implementing successful projects.

EDUCATION:
• Master's in Mechanical Engineering : Materials - University School of Physics and Engineering (2020-2022)
  Location: Clermont-Ferrand, France
  specialized training in mechanics, covering areas such as materials and structures, machines and robotic systems, reliability and risk management, and civil engineering. final year project thesis title: Building a Finite Element Analysis (FEA) model for a carbon/epoxy composite material.

• Engineering in Product and Process Industrial; - National Higher School of Arts and Trades (2015-2020)
  Location: Meknes, Morocco
  Specialized training in industrial engineering, covering areas such as mechanical engineering, manufacturing processes, automation, and industrial management.

EXPERIENCE:
• R&D Mechanical Engineer at SLB GROUP (2022-2024)
  Location: Abbeville, France
  - Utilized Creo/SolidWorks for 3D CAD modeling and Drawings, improving design efficiency and collaboration across teams.
  - Developed the first Finite element model for wireline (Carbon / Epoxy) composite cables.

• R&D Mechanical Engineer Intern at Sigma (2021)
  Location: Clermont-Ferrand, France
  - Contributed to the Structural Health Monitoring project, focusing on modal identification of structures using advanced sensors, improving structural monitoring by 25% and reducing maintenance costs by 15%.

• Mechanical Engineering Intern at OCP Group (2017)
  Location: Morocco
  - Validated, tolerance designs and coordinated with suppliers to monitor and ensure the quality of parts, reducing part defects by 20% and improving supplier quality.
  - Improved the quality of designs and parts, reducing production errors and improving overall quality.

SKILLS:
• SKILLS in SOFTWARE & SIMULATION:
  Abaqus, Ansys, Autocad, Inventor, SolidWorks, Creo, PTC, Catiav5, RDM6, Simens NX, Comsol, MS Project, Excel, Powerpoint, ILLUSTRATOR, Photoshop, Machine Learning, 3D printing
• SKILLS in Mechanical Engineering:
  Mechanical Engineering, Mechanical design and development, CAD/CAM, Finite element analysis (FEA), 3D Modeling/Drawing, Structural analysis, Materials science, Sensor technology, Measurement and calibration, Quality control and assurance, Machining
• SKILLS in Electrical Engineering:
  Electrical Engineering, Fiber optic sensor installation and configuration, Measurement sensor design and calibration, Analog/digital electronics, Power electronics, Automation
• SKILLS in Materials & Processes:
  Composite materials, Materials science, Foundry, Forming calculations, Materials mechanics, Plastics and composites polymers, Rheology, Designing materials, Design of Experiments
• SKILLS in PROGRAMMING LANGUAGES:
  JAVA, C /C++, MATLAB, PYTHON
• COMMUNICATION SKILLS:
  Team collaboration and teamwork, Stakeholder communication (suppliers, industrial partners), Project coordination and management, Effective communication in a cross-functional team environment, Ability to work with external partners and stakeholders, Research-Oriented`
  },
]

export function SelectResumeModal({ open, onOpenChange, onNext }: SelectResumeModalProps) {
  const [selectedResume, setSelectedResume] = useState("2")
  const [resumeData, setResumeData] = useState(mockResumes)

  // Load actual CV content from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updatedResumes = mockResumes.map(resume => {
        const storedContent = localStorage.getItem(`cv_content_${resume.id}`)
        if (storedContent) {
          return {
            ...resume,
            content: storedContent
          }
        }
        return resume
      })
      setResumeData(updatedResumes)
    }
  }, [open]) // Reload when modal opens

  const handleNext = () => {
    // Store the selected resume content in sessionStorage
    const resume = resumeData.find(r => r.id === selectedResume)
    if (resume) {
      window.sessionStorage.setItem('selectedResumeId', selectedResume)
      window.sessionStorage.setItem('selectedResumeName', resume.name)
      window.sessionStorage.setItem('cvContent', resume.content)
      
      console.log('Selected CV content for AI:', {
        id: selectedResume,
        name: resume.name,
        contentLength: resume.content.length,
        preview: resume.content.substring(0, 200) + '...'
      })
    }
    
    onNext?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>Select Resume</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a resume to help the AI provide more personalized answers based on your experience.
          </p>

          <RadioGroup value={selectedResume} onValueChange={setSelectedResume}>
            {resumeData.map((resume) => (
              <div key={resume.id} className="flex items-center space-x-2">
                <RadioGroupItem value={resume.id} id={resume.id} />
                <Label htmlFor={resume.id} className="flex-1 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">{resume.name}</span>
                    <span className="text-xs text-gray-500">
                      {resume.content.includes('PERSONAL INFORMATION:') 
                        ? 'Detailed CV with personal info, education & experience' 
                        : 'Basic resume information'}
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> You can edit your CV details by going to CVs/Resumes page and clicking on your resume. 
              The AI will use this information to generate personalized interview responses.
            </p>
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
