"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Film, Music, File } from "lucide-react";
import { toast } from "sonner";

const FILE_ICONS: Record<string, React.ReactNode> = {
  image: null,
  pdf: <FileText className="h-8 w-8 text-red-500" />,
  video: <Film className="h-8 w-8 text-purple-500" />,
  audio: <Music className="h-8 w-8 text-green-500" />,
  document: <FileText className="h-8 w-8 text-blue-500" />,
  default: <File className="h-8 w-8 text-gray-400" />,
};

function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("word") || mimeType.includes("presentation") || mimeType.includes("excel")) return "document";
  return "default";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf,video/mp4,video/webm,audio/mpeg,audio/wav,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onClear?: () => void;
  label?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  showPreview?: boolean;
}

export function FileUpload({
  value,
  onChange,
  onClear,
  label = "Arquivo",
  accept = DEFAULT_ACCEPT,
  maxSize = 10 * 1024 * 1024,
  className,
  showPreview = true,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro no upload");
      setFileName(file.name);
      onChange(data.url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    setFileName(null);
    onChange("");
    onClear?.();
  }

  const category = value && fileName ? getFileCategory(fileName.split(".").pop() ?? "") : "default";
  const isImage = category === "image";

  return (
    <div className={className}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="mt-1.5">
        {value ? (
          <div className="relative inline-block">
            {showPreview && isImage ? (
              <img src={value} alt="" className="h-24 w-24 rounded border object-cover" />
            ) : (
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded border bg-gray-50">
                {FILE_ICONS[category] || FILE_ICONS.default}
                {fileName && (
                  <span className="mt-1 max-w-[80px] truncate text-[10px] text-gray-500">
                    {fileName}
                  </span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"
          >
            {uploading ? (
              <span className="text-xs">Enviando...</span>
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">Enviar</span>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
