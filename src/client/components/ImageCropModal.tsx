"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Check, X } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
  imageSrc: string;
  aspectRatio?: number;
}

export function ImageCropModal({ open, onClose, onConfirm, imageSrc, aspectRatio = 1 }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const size = 320;

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setImgLoaded(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [open, imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x, offset.y);

    const imgAspect = img.width / img.height;
    let drawW: number, drawH: number;
    if (aspectRatio >= 1) {
      drawW = size * aspectRatio;
      drawH = drawW / imgAspect;
    } else {
      drawH = size / aspectRatio;
      drawW = drawH * imgAspect;
    }

    if (imgAspect > aspectRatio) {
      drawH = size;
      drawW = drawH * imgAspect;
    } else {
      drawW = size;
      drawH = drawW / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, rotation, offset, imgLoaded, aspectRatio]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const outputCanvas = document.createElement("canvas");
    const outputSize = 512;
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(canvas, 0, 0, outputSize, outputSize);
    onConfirm(outputCanvas.toDataURL("image/jpeg", 0.9));
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajustar Foto</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative cursor-grab active:cursor-grabbing"
            style={{ width: size, height: size }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />
            <div className="pointer-events-none absolute inset-0 rounded-full border-4 border-white shadow-lg" />
          </div>
        </div>

        <div className="space-y-3 px-2">
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 shrink-0 text-gray-500" />
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRotation(r => r - 90)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <span className="flex-1 text-center text-xs text-gray-500">{rotation}°</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRotation(r => r + 90)}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!imgLoaded}>
            <Check className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
