"use client";

import { useState } from "react";
import type { Task } from "@/types/todo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListChecks, Users } from "lucide-react";

interface TaskTemplatesProps {
  onClose: () => void;
  onApplyTemplate: (tasks: Task[]) => void;
}

export default function TaskTemplates({
  onClose,
  onApplyTemplate,
}: TaskTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Predefined templates
  const templates = {
    wedding: {
      name: "Wedding Planning",
      description:
        "A comprehensive template for planning a wedding with all essential tasks.",
      tasks: [
        {
          id: `wedding-1-${Date.now()}`,
          title: "Set wedding date and budget",
          description: "Decide on a date and establish your overall budget",
          priority: "high",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `wedding-1-1-${Date.now()}`,
              title: "Research venue availability",
              completed: false,
            },
            {
              id: `wedding-1-2-${Date.now()}`,
              title: "Create initial budget spreadsheet",
              completed: false,
            },
          ],
        },
        {
          id: `wedding-2-${Date.now()}`,
          title: "Book venue and vendors",
          description:
            "Secure your ceremony and reception venues, plus key vendors",
          priority: "high",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `wedding-2-1-${Date.now()}`,
              title: "Visit and compare venues",
              completed: false,
            },
            {
              id: `wedding-2-2-${Date.now()}`,
              title: "Research and contact photographers",
              completed: false,
            },
            {
              id: `wedding-2-3-${Date.now()}`,
              title: "Book catering service",
              completed: false,
            },
          ],
        },
        {
          id: `wedding-3-${Date.now()}`,
          title: "Send invitations",
          description: "Design, order, and mail wedding invitations",
          priority: "medium",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          subTasks: [
            {
              id: `wedding-3-1-${Date.now()}`,
              title: "Finalize guest list",
              completed: false,
            },
            {
              id: `wedding-3-2-${Date.now()}`,
              title: "Design invitations",
              completed: false,
            },
            {
              id: `wedding-3-3-${Date.now()}`,
              title: "Address and mail invitations",
              completed: false,
            },
          ],
        },
      ],
    },
    conference: {
      name: "Conference Organization",
      description:
        "Tasks for planning and executing a professional conference or event.",
      tasks: [
        {
          id: `conf-1-${Date.now()}`,
          title: "Define conference goals and theme",
          description:
            "Establish the purpose, audience, and theme of your conference",
          priority: "high",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `conf-1-1-${Date.now()}`,
              title: "Conduct market research",
              completed: false,
            },
            {
              id: `conf-1-2-${Date.now()}`,
              title: "Draft conference mission statement",
              completed: false,
            },
          ],
        },
        {
          id: `conf-2-${Date.now()}`,
          title: "Secure venue and set date",
          description:
            "Book an appropriate venue and establish conference dates",
          priority: "high",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `conf-2-1-${Date.now()}`,
              title: "Research venue options",
              completed: false,
            },
            {
              id: `conf-2-2-${Date.now()}`,
              title: "Negotiate contracts",
              completed: false,
            },
            {
              id: `conf-2-3-${Date.now()}`,
              title: "Confirm availability of key speakers",
              completed: false,
            },
          ],
        },
        {
          id: `conf-3-${Date.now()}`,
          title: "Develop marketing strategy",
          description: "Create and implement a plan to promote the conference",
          priority: "medium",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          dueDate: new Date(
            Date.now() + 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
          subTasks: [
            {
              id: `conf-3-1-${Date.now()}`,
              title: "Design conference logo and branding",
              completed: false,
            },
            {
              id: `conf-3-2-${Date.now()}`,
              title: "Create social media campaign",
              completed: false,
            },
            {
              id: `conf-3-3-${Date.now()}`,
              title: "Develop conference website",
              completed: false,
            },
          ],
        },
      ],
    },
    project: {
      name: "Project Management",
      description:
        "A template for managing general projects with phases and milestones.",
      tasks: [
        {
          id: `proj-1-${Date.now()}`,
          title: "Project Initiation",
          description: "Define the project scope, objectives, and stakeholders",
          priority: "high",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `proj-1-1-${Date.now()}`,
              title: "Create project charter",
              completed: false,
            },
            {
              id: `proj-1-2-${Date.now()}`,
              title: "Identify stakeholders",
              completed: false,
            },
            {
              id: `proj-1-3-${Date.now()}`,
              title: "Define project scope",
              completed: false,
            },
          ],
        },
        {
          id: `proj-2-${Date.now()}`,
          title: "Project Planning",
          description:
            "Develop detailed project plan with timelines and resources",
          priority: "high",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `proj-2-1-${Date.now()}`,
              title: "Create work breakdown structure",
              completed: false,
            },
            {
              id: `proj-2-2-${Date.now()}`,
              title: "Develop project schedule",
              completed: false,
            },
            {
              id: `proj-2-3-${Date.now()}`,
              title: "Allocate resources",
              completed: false,
            },
            {
              id: `proj-2-4-${Date.now()}`,
              title: "Identify risks and mitigation strategies",
              completed: false,
            },
          ],
        },
        {
          id: `proj-3-${Date.now()}`,
          title: "Project Execution",
          description: "Implement the project plan and manage the work",
          priority: "medium",
          completed: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          subTasks: [
            {
              id: `proj-3-1-${Date.now()}`,
              title: "Conduct kickoff meeting",
              completed: false,
            },
            {
              id: `proj-3-2-${Date.now()}`,
              title: "Execute tasks according to plan",
              completed: false,
            },
            {
              id: `proj-3-3-${Date.now()}`,
              title: "Monitor progress and report to stakeholders",
              completed: false,
            },
          ],
        },
      ],
    },
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate && templates[selectedTemplate]) {
      onApplyTemplate(templates[selectedTemplate].tasks);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task Templates</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="wedding" onValueChange={setSelectedTemplate}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="wedding" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Wedding
            </TabsTrigger>
            <TabsTrigger value="conference" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Conference
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center">
              <ListChecks className="h-4 w-4 mr-2" />
              Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wedding">
            <Card>
              <CardHeader>
                <CardTitle>Wedding Planning Template</CardTitle>
                <CardDescription>
                  A comprehensive template for planning a wedding with all
                  essential tasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">This template includes:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Setting wedding date and budget</li>
                    <li>Booking venue and vendors</li>
                    <li>Sending invitations</li>
                    <li>And more essential wedding planning tasks</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleApplyTemplate()}
                  className="w-full"
                >
                  Apply Wedding Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="conference">
            <Card>
              <CardHeader>
                <CardTitle>Conference Organization Template</CardTitle>
                <CardDescription>
                  Tasks for planning and executing a professional conference or
                  event.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">This template includes:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Defining conference goals and theme</li>
                    <li>Securing venue and setting dates</li>
                    <li>Developing marketing strategy</li>
                    <li>And more conference planning essentials</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleApplyTemplate()}
                  className="w-full"
                >
                  Apply Conference Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="project">
            <Card>
              <CardHeader>
                <CardTitle>Project Management Template</CardTitle>
                <CardDescription>
                  A template for managing general projects with phases and
                  milestones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">This template includes:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Project initiation tasks</li>
                    <li>Detailed project planning</li>
                    <li>Execution and monitoring</li>
                    <li>Project closure and evaluation</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleApplyTemplate()}
                  className="w-full"
                >
                  Apply Project Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
