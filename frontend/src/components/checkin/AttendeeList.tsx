"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export type Attendee = {
  id: number;
  registrationId: number;
  fullName: string;
  email: string;
  seatNumber?: string | null;
  registeredAt: string;
  checkedInAt?: string | null;
  status: string;
};

interface AttendeeListProps {
  attendees: Attendee[];
  onCheckIn: (registrationId: number) => Promise<void>;
  isLoading?: boolean;
}

export function AttendeeList({ attendees, onCheckIn, isLoading }: AttendeeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingIn, setCheckingIn] = useState<number | null>(null);

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckIn = async (registrationId: number) => {
    setCheckingIn(registrationId);
    try {
      await onCheckIn(registrationId);
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle>Attendees ({attendees.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {filteredAttendees.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No attendees found</p>
          ) : (
            filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{attendee.fullName}</p>
                    {attendee.checkedInAt ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Checked In</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{attendee.email}</p>
                  <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                    {attendee.seatNumber && <span>Seat: {attendee.seatNumber}</span>}
                    <span>
                      Registered: {format(new Date(attendee.registeredAt), "MMM d, yyyy")}
                    </span>
                    {attendee.checkedInAt && (
                      <span>
                        Checked in: {format(new Date(attendee.checkedInAt), "MMM d, h:mm a")}
                      </span>
                    )}
                  </div>
                </div>
                {!attendee.checkedInAt && (
                  <Button
                    size="sm"
                    onClick={() => handleCheckIn(attendee.registrationId)}
                    disabled={checkingIn === attendee.registrationId || isLoading}
                  >
                    {checkingIn === attendee.registrationId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking in...
                      </>
                    ) : (
                      "Check In"
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
