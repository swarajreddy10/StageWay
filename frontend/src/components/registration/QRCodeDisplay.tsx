"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  qrCode: string;
  registrationId: number;
  eventName?: string;
}

export function QRCodeDisplay({ qrCode, registrationId, eventName }: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const qrCanvas = qrCanvasRef.current;
      if (!qrCanvas) return;

      canvas.width = 400;
      canvas.height = 500;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      ctx.drawImage(qrCanvas, 50, 50, 300, 300);

      // Draw text
      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      if (eventName) {
        ctx.fillText(eventName, canvas.width / 2, 380);
      }
      ctx.font = "14px Arial";
      ctx.fillText(`Registration #${registrationId}`, canvas.width / 2, 410);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `qr-code-${registrationId}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle>Your QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-lg">
          <QRCodeSVG value={qrCode} size={256} level="H" />
          <QRCodeCanvas ref={qrCanvasRef} value={qrCode} size={256} level="H" className="hidden" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Show this QR code at the event for check-in
        </p>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          variant="outline"
          className="border-white/70 bg-white/70 hover:bg-white"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download QR Code"}
        </Button>
      </CardContent>
    </Card>
  );
}
