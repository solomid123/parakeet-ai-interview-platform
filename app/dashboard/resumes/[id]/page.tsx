"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

interface CVData {
  id: string
  title: string
  personalDetails: {
    name: string
    email: string
    phone: string
    address: string
  }
  introduction: string
  education: Array<{
    school: string
    degree: string
    location: string
    timesPeriod: string
    description: string
  }>
  experience: Array<{
    company: string
    position: string
    location: string
    timesPeriod: string
    description: string
  }>
  skills: Array<{
    title: string
    description: string
  }>
}

// Mock detailed CV data that matches the screenshot structure
const mockCVData: CVData = {
  id: "2",
  title: "My Resume",
  personalDetails: {
    name: "badreddine barki",
    email: "badreddinebarki@gmail.com",
    phone: "+33758551524",
    address: "14 rue de la 2E DB"
  },
  introduction: "Mechanical Engineer with comprehensive experience in CAD modeling, finite element analysis, and developing innovative solutions for complex projects. Passionate about enhancing product quality and operational efficiency, with a strong track record of implementing successful projects.",
  education: [
    {
      school: "University School of Physics and Engineering",
      degree: "Master's in Mechanical Engineering : Materials",
      location: "Clermont-Ferrand, France", 
      timesPeriod: "2020-2022",
      description: "specialized training in mechanics, covering areas such as materials and structures, machines and robotic systems, reliability and risk management, and civil engineering. final year project thesis title: Building a Finite Element Analysis (FEA) model for a carbon/epoxy composite material."
    },
    {
      school: "National Higher School of Arts and Trades",
      degree: "Engineering in Product and Process Industrial;",
      location: "Meknes, Morocco",
      timesPeriod: "2015-2020", 
      description: "Specialized training in industrial engineering, covering areas such as mechanical engineering, manufacturing processes, automation, and industrial management."
    }
  ],
  experience: [
    {
      company: "SLB GROUP",
      position: "R&D Mechanical Engineer",
      location: "Abbeville, France",
      timesPeriod: "2022-2024",
      description: "- Utilized Creo/SolidWorks for 3D CAD modeling and Drawings, improving design efficiency and collaboration across teams.\n- Developed the first Finite element model for wireline (Carbon / Epoxy) composite cables."
    },
    {
      company: "Sigma",
      position: "R&D Mechanical Engineer Intern",
      location: "Clermont-Ferrand, France",
      timesPeriod: "2021",
      description: "- Contributed to the Structural Health Monitoring project, focusing on modal identification of structures using advanced sensors, improving structural monitoring by 25% and reducing maintenance costs by 15%."
    },
    {
      company: "OCP Group",
      position: "Mechanical Engineering Intern",
      location: "Morocco",
      timesPeriod: "2017",
      description: "- Validated, tolerance designs and coordinated with suppliers to monitor and ensure the quality of parts, reducing part defects by 20% and improving supplier quality.\n- Improved the quality of designs and parts, reducing production errors and improving overall quality."
    }
  ],
  skills: [
    {
      title: "SKILLS in SOFTWARE & SIMULATION",
      description: "Abaqus, Ansys, Autocad, Inventor, SolidWorks, Creo, PTC, Catiav5, RDM6, Simens NX, Comsol, MS Project, Excel, Powerpoint, ILLUSTRATOR, Photoshop, Machine Learning, 3D printing"
    },
    {
      title: "SKILLS in Mechanical Engineering",
      description: "Mechanical Engineering, Mechanical design and development, CAD/CAM, Finite element analysis (FEA), 3D Modeling/Drawing, Structural analysis, Materials science, Sensor technology, Measurement and calibration, Quality control and assurance, Machining"
    },
    {
      title: "SKILLS in Electrical Engineering",
      description: "Electrical Engineering, Fiber optic sensor installation and configuration, Measurement sensor design and calibration, Analog/digital electronics, Power electronics, Automation"
    },
    {
      title: "SKILLS in Materials & Processes",
      description: "Composite materials, Materials science, Foundry, Forming calculations, Materials mechanics, Plastics and composites polymers, Rheology, Designing materials, Design of Experiments"
    },
    {
      title: "SKILLS in PROGRAMMING LANGUAGES",
      description: "JAVA, C /C++, MATLAB, PYTHON"
    },
    {
      title: "COMMUNICATION SKILLS",
      description: "Team collaboration and teamwork, Stakeholder communication (suppliers, industrial partners), Project coordination and management, Effective communication in a cross-functional team environment, Ability to work with external partners and stakeholders, Research-Oriented"
    }
  ]
}

export default function CVDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [cvData, setCvData] = useState<CVData>(mockCVData)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Load CV data based on the ID
    const cvId = params.id as string
    
    // Try to load from localStorage first
    const storedData = localStorage.getItem(`cv_${cvId}`)
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setCvData(parsedData)
      } catch (error) {
        console.error('Error parsing stored CV data:', error)
      }
    } else {
      // Use appropriate mock data based on ID
      if (cvId === "1") {
        setCvData({
          ...mockCVData,
          id: "1",
          title: "My Resume",
          personalDetails: {
            name: "Professional Developer",
            email: "developer@email.com",
            phone: "+1234567890",
            address: "Professional Address"
          },
          introduction: "Experienced software developer with strong technical background in full-stack development. Skilled in modern programming languages and frameworks with a passion for creating efficient, scalable solutions.",
          education: [
            {
              school: "University of Technology",
              degree: "Computer Science Degree",
              location: "Tech City",
              timesPeriod: "2018-2022",
              description: "Comprehensive computer science education with focus on software engineering principles, algorithms, and system design."
            }
          ],
          experience: [
            {
              company: "Tech Company",
              position: "Software Developer",
              location: "Tech City", 
              timesPeriod: "2022-Present",
              description: "Full-stack development using modern frameworks and technologies. Experience with agile methodologies and collaborative development."
            }
          ],
          skills: [
            {
              title: "PROGRAMMING LANGUAGES",
              description: "JavaScript, TypeScript, Python, Java, C++, SQL"
            },
            {
              title: "FRAMEWORKS & TECHNOLOGIES",
              description: "React, Next.js, Node.js, Express, MongoDB, PostgreSQL, AWS"
            },
            {
              title: "TOOLS & SOFTWARE",
              description: "Git, Docker, VS Code, Postman, Jira, Figma"
            }
          ]
        })
      } else {
        // Use default Badreddine data for ID "2" or any other ID
        setCvData(mockCVData)
      }
    }
  }, [params.id])

  const handleSave = () => {
    // Save the CV data
    const cvContent = generateCVText(cvData)
    
    // Store in localStorage
    localStorage.setItem(`cv_${cvData.id}`, JSON.stringify(cvData))
    localStorage.setItem(`cv_content_${cvData.id}`, cvContent)
    
    console.log('Saved detailed CV content:', {
      id: cvData.id,
      title: cvData.title,
      contentLength: cvContent.length,
      preview: cvContent.substring(0, 300) + '...'
    })
    
    // Show success feedback
    setIsEditing(false)
    
    // Trigger a brief success notification
    const originalTitle = cvData.title
    setCvData(prev => ({ ...prev, title: '✅ Saved - ' + originalTitle }))
    setTimeout(() => {
      setCvData(prev => ({ ...prev, title: originalTitle }))
    }, 2000)
  }

  const generateCVText = (cv: CVData): string => {
    return `
PERSONAL INFORMATION:
Name: ${cv.personalDetails.name}
Email: ${cv.personalDetails.email}
Phone: ${cv.personalDetails.phone}
Address: ${cv.personalDetails.address}

PROFESSIONAL SUMMARY:
${cv.introduction}

EDUCATION:
${cv.education.map(edu => `
• ${edu.degree} - ${edu.school} (${edu.timesPeriod})
  Location: ${edu.location}
  ${edu.description}
`).join('')}

EXPERIENCE:
${cv.experience.map(exp => `
• ${exp.position} at ${exp.company} (${exp.timesPeriod})
  Location: ${exp.location}
  ${exp.description}
`).join('')}

SKILLS:
${cv.skills.map(skill => `
• ${skill.title}:
  ${skill.description}
`).join('')}
`.trim()
  }

  const updatePersonalDetails = (field: keyof CVData['personalDetails'], value: string) => {
    setCvData(prev => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value
      }
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const updateExperience = (index: number, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const updateSkills = (index: number, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        school: "",
        degree: "",
        location: "",
        timesPeriod: "",
        description: ""
      }]
    }))
  }

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: "",
        position: "",
        location: "",
        timesPeriod: "",
        description: ""
      }]
    }))
  }

  const addSkill = () => {
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        title: "",
        description: ""
      }]
    }))
  }

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const removeExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const removeSkill = (index: number) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-sm text-gray-500">Auto Saved ✓</span>
        </div>
        <Button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="bg-gray-900 hover:bg-gray-800">
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          ) : (
            'Edit'
          )}
        </Button>
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-600">The contents of the resume will be used to generate interview answers.</p>
      </div>

      {/* Title Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Input
              value={cvData.title}
              onChange={(e) => setCvData(prev => ({ ...prev, title: e.target.value }))}
            />
          ) : (
            <p>{cvData.title}</p>
          )}
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👤 Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            {isEditing ? (
              <Input
                value={cvData.personalDetails.name}
                onChange={(e) => updatePersonalDetails('name', e.target.value)}
              />
            ) : (
              <p className="text-gray-700">{cvData.personalDetails.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            {isEditing ? (
              <Input
                value={cvData.personalDetails.address}
                onChange={(e) => updatePersonalDetails('address', e.target.value)}
              />
            ) : (
              <p className="text-gray-700">{cvData.personalDetails.address}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            {isEditing ? (
              <Input
                value={cvData.personalDetails.email}
                onChange={(e) => updatePersonalDetails('email', e.target.value)}
              />
            ) : (
              <p className="text-gray-700">{cvData.personalDetails.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            {isEditing ? (
              <Input
                value={cvData.personalDetails.phone}
                onChange={(e) => updatePersonalDetails('phone', e.target.value)}
              />
            ) : (
              <p className="text-gray-700">{cvData.personalDetails.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Introduction */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 Introduction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={cvData.introduction}
              onChange={(e) => setCvData(prev => ({ ...prev, introduction: e.target.value }))}
              rows={4}
            />
          ) : (
            <p className="text-gray-700">{cvData.introduction}</p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎓 Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cvData.education.map((edu, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">School</label>
                  {isEditing ? (
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium">{edu.school}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Degree</label>
                  {isEditing ? (
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{edu.degree}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Period</label>
                  {isEditing ? (
                    <Input
                      value={edu.timesPeriod}
                      onChange={(e) => updateEducation(index, 'timesPeriod', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{edu.timesPeriod}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  {isEditing ? (
                    <Input
                      value={edu.location}
                      onChange={(e) => updateEducation(index, 'location', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{edu.location}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                {isEditing ? (
                  <Textarea
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{edu.description}</p>
                )}
              </div>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          {isEditing && (
            <Button variant="outline" onClick={addEducation} className="w-full">
              Add Education
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💼 Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cvData.experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-green-200 pl-4">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  {isEditing ? (
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium">{exp.company}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  {isEditing ? (
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{exp.position}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Period</label>
                  {isEditing ? (
                    <Input
                      value={exp.timesPeriod}
                      onChange={(e) => updateExperience(index, 'timesPeriod', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{exp.timesPeriod}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  {isEditing ? (
                    <Input
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{exp.location}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                {isEditing ? (
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{exp.description}</p>
                )}
              </div>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          {isEditing && (
            <Button variant="outline" onClick={addExperience} className="w-full">
              Add Experience
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cvData.skills.map((skill, index) => (
            <div key={index} className="border-l-4 border-purple-200 pl-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Skill Category</label>
                    {isEditing ? (
                      <Input
                        value={skill.title}
                        onChange={(e) => updateSkills(index, 'title', e.target.value)}
                        placeholder="e.g., SKILLS in SOFTWARE & SIMULATION"
                      />
                    ) : (
                      <p className="font-medium text-lg">{skill.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills Description</label>
                    {isEditing ? (
                      <Textarea
                        value={skill.description}
                        onChange={(e) => updateSkills(index, 'description', e.target.value)}
                        rows={3}
                        placeholder="List specific skills, software, technologies, etc."
                      />
                    ) : (
                      <p className="text-gray-700">{skill.description}</p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-600 ml-4">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <Button variant="outline" onClick={addSkill} className="w-full">
              Add Skill Category
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 