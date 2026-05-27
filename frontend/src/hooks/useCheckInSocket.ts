"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type CheckInBroadcast = {
  registrationId: number;
  eventId: number;
  attendeeName: string;
  attendeeEmail: string | null;
  seatNumber: string | null;
  checkedInAt: string;
  method: string;
};

export function useCheckInSocket(
  eventId: number | null,
  onCheckIn: (broadcast: CheckInBroadcast) => void,
  token: string | null | undefined
) {
  const clientRef = useRef<Client | null>(null);
  const onCheckInRef = useRef(onCheckIn);

  // Keep ref in sync with latest callback without triggering reconnects
  useEffect(() => {
    onCheckInRef.current = onCheckIn;
  });

  const connect = useCallback(() => {
    if (!eventId || !token) return;

    const wsUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws`
      : "http://localhost:8081/ws";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/checkins/${eventId}`, (msg) => {
          try {
            const broadcast: CheckInBroadcast = JSON.parse(msg.body);
            onCheckInRef.current(broadcast);
          } catch {
            // malformed message — ignore
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;
  }, [eventId, token]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [connect]);
}
