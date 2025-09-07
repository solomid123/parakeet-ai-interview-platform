"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare, FileText, Download, Mail, CreditCard, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { GetCreditsModal } from "@/components/get-credits-modal"
import { SelectResumeModal } from "@/components/select-resume-modal"
import { ConnectModal } from "@/components/connect-modal"
import { TrialInterviewModal } from "@/components/trial-interview-modal"
import { LanguageInstructionsModal } from "@/components/language-instructions-modal"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<"trial" | "regular" | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const [userCredits, setUserCredits] = useState(1)

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Interview Sessions", href: "/dashboard/interview-sessions", icon: MessageSquare },
    { name: "CVs / Resumes", href: "/dashboard/resumes", icon: FileText },
  ]

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

  const createSession = () => {
    if (userCredits > 0) {
      startSessionFlow("regular")
    } else {
      setShowCreditsModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-xl">ParakeetAI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t space-y-3">
            <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
              <Download className="w-4 h-4" />
              Download Desktop App
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
              <Mail className="w-4 h-4" />
              Email Support
            </Button>

            {/* Interview Credits */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-sm">Interview Credits</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                You have <span className="font-semibold text-gray-900">{userCredits}</span> Interview Credits.
              </p>
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowCreditsModal(true)}
              >
                Get Credits
              </Button>
            </div>

            {/* User info */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">badreddinebarki@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => startSessionFlow("trial")}>
              Start Trial Session
            </Button>
            <Button size="sm" className="bg-gray-900 hover:bg-gray-800" onClick={createSession}>
              Start Session
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      <GetCreditsModal open={showCreditsModal} onOpenChange={setShowCreditsModal} />

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
