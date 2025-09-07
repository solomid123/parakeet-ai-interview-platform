import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Copy, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface InterviewSession {
  id: string
  company: string
  position: string
  status: "expired" | "trial"
  credits?: number
  createdAt: string
}

const mockSessions: InterviewSession[] = [
  {
    id: "1",
    company: "deq",
    position: "qv",
    status: "expired",
    credits: 0.5,
    createdAt: "Sep 6, 2025",
  },
  {
    id: "2",
    company: "dv",
    position: "ds",
    status: "expired",
    createdAt: "Sep 6, 2025",
  },
  {
    id: "3",
    company: "ggfv",
    position: "g",
    status: "expired",
    createdAt: "Jul 6, 2025",
  },
  {
    id: "4",
    company: "ku leuven",
    position: "phd",
    status: "expired",
    createdAt: "Jun 18, 2025",
  },
  {
    id: "5",
    company: "egfd",
    position: "gerg",
    status: "expired",
    createdAt: "Jun 5, 2025",
  },
  {
    id: "6",
    company: "agap2 consulting",
    position: "",
    status: "expired",
    createdAt: "Jun 5, 2025",
  },
  {
    id: "7",
    company: "sofia engineering consulting",
    position: "",
    status: "expired",
    createdAt: "Jun 2, 2025",
  },
  {
    id: "8",
    company: "sofia engineering",
    position: "",
    status: "expired",
    createdAt: "May 28, 2025",
  },
  {
    id: "9",
    company: "Sofial engineering consulting",
    position: "Mechanical Engineering Consultant",
    status: "expired",
    createdAt: "May 28, 2025",
  },
  {
    id: "10",
    company: "agap2 consulting",
    position: "Mechanical Engineering Consultant",
    status: "expired",
    createdAt: "May 27, 2025",
  },
]

export default function InterviewSessionsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Company</th>
                  <th className="text-left p-4 font-medium text-gray-600">Position</th>
                  <th className="text-left p-4 font-medium text-gray-600">Ends In</th>
                  <th className="text-left p-4 font-medium text-gray-600">Created At</th>
                  <th className="w-12 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {mockSessions.map((session, index) => (
                  <tr key={session.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Link
                        href={`/interview-session/${session.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {session.company}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600">{session.position || "-"}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Expired</span>
                        <Badge
                          variant="secondary"
                          className={
                            session.status === "trial"
                              ? "bg-blue-100 text-blue-800"
                              : session.credits
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {session.status === "trial"
                            ? "Trial"
                            : session.credits
                              ? `Credits: ${session.credits}`
                              : "Trial"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600">{session.createdAt}</span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Copy className="h-4 w-4" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">Page 1 • Showing 1-10 of 36</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state message */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">A list of your Interview Sessions.</p>
      </div>
    </div>
  )
}
