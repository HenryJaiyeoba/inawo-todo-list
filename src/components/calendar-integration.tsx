"use client";

import { useState } from "react";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Check } from "lucide-react";

interface CalendarIntegrationProps {
  onClose: () => void;
}

export default function CalendarIntegration({
  onClose,
}: CalendarIntegrationProps) {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  const calendarOptions = [
    { id: "google", name: "Google Calendar", connected: false },
    { id: "outlook", name: "Microsoft Outlook", connected: false },
    { id: "apple", name: "Apple Calendar", connected: false },
  ];

  const toggleCalendarSelection = (calendarId: string) => {
    if (selectedCalendars.includes(calendarId)) {
      setSelectedCalendars(selectedCalendars.filter((id) => id !== calendarId));
    } else {
      setSelectedCalendars([...selectedCalendars, calendarId]);
    }
  };

  const handleConnect = () => {
    // In a real app, we would connect to the selected calendars
    // For now, we'll just close the dialog
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Calendar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Connect your calendar to automatically sync tasks with due dates and
            receive reminders.
          </p>

          <div className="space-y-2">
            {calendarOptions.map((calendar) => (
              <Card
                key={calendar.id}
                className={`cursor-pointer transition-all ${
                  selectedCalendars.includes(calendar.id)
                    ? "border-primary"
                    : ""
                }`}
                onClick={() => toggleCalendarSelection(calendar.id)}
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{calendar.name}</CardTitle>
                    <CardDescription>
                      {calendar.connected ? "Connected" : "Not connected"}
                    </CardDescription>
                  </div>
                  {selectedCalendars.includes(calendar.id) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={selectedCalendars.length === 0}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Connect Calendars
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
