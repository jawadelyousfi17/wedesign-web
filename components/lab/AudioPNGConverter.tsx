"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, ArrowLeftRight, Music, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";

type Mode = "encode" | "decode";
type Status = "idle" | "loading" | "done" | "error";

const MAGIC = new Uint8Array([0x57, 0x44, 0x4d, 0x50]); // "WDMP"

async function encodeAudioToPNG(bytes: Uint8Array, filename: string): Promise<Blob> {
  const fnBytes = new TextEncoder().encode(filename);
  // Layout: magic(4) + fileSize(4) + fnLen(2) + filename + data
  const headerSize = 4 + 4 + 2 + fnBytes.length;
  const totalBytes = headerSize + bytes.length;

  const raw = new Uint8Array(totalBytes);
  const view = new DataView(raw.buffer);
  raw.set(MAGIC, 0);
  view.setUint32(4, bytes.length, false);
  view.setUint16(8, fnBytes.length, false);
  raw.set(fnBytes, 10);
  raw.set(bytes, headerSize);

  // 3 bytes per pixel (RGB), alpha fixed at 255 — lossless in PNG
  const totalPixels = Math.ceil(totalBytes / 3);
  const w = Math.ceil(Math.sqrt(totalPixels));
  const h = Math.ceil(totalPixels / w);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(w, h);
  const px = imgData.data;

  for (let i = 0; i < w * h; i++) {
    const b = i * 3;
    px[i * 4 + 0] = b     < raw.length ? raw[b]     : 0;
    px[i * 4 + 1] = b + 1 < raw.length ? raw[b + 1] : 0;
    px[i * 4 + 2] = b + 2 < raw.length ? raw[b + 2] : 0;
    px[i * 4 + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}

async function decodePNGtoAudio(file: File): Promise<{ data: Uint8Array; filename: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, img.width, img.height).data;
        URL.revokeObjectURL(url);

        const totalPixels = img.width * img.height;
        const raw = new Uint8Array(totalPixels * 3);
        for (let i = 0; i < totalPixels; i++) {
          raw[i * 3 + 0] = px[i * 4 + 0];
          raw[i * 3 + 1] = px[i * 4 + 1];
          raw[i * 3 + 2] = px[i * 4 + 2];
        }

        if (raw[0] !== 0x57 || raw[1] !== 0x44 || raw[2] !== 0x4d || raw[3] !== 0x50) {
          reject(new Error("Not a WDMP-encoded PNG"));
          return;
        }

        const view = new DataView(raw.buffer);
        const fileSize = view.getUint32(4, false);
        const fnLen = view.getUint16(8, false);
        const filename = new TextDecoder().decode(raw.slice(10, 10 + fnLen));
        const dataStart = 10 + fnLen;
        const data = raw.slice(dataStart, dataStart + fileSize);
        resolve({ data, filename });
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function AudioPNGConverter() {
  const [mode, setMode] = useState<Mode>("encode");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    prevUrl.current = null;
    setFile(null);
    setStatus("idle");
    setResultUrl(null);
    setResultName("");
    setErrorMsg("");
    setPreview(null);
    setAudioUrl(null);
  }, []);

  const switchMode = (m: Mode) => { setMode(m); reset(); };

  const pickFile = (f: File) => {
    reset();
    if (mode === "encode" && !f.type.startsWith("audio/") && !f.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
      setErrorMsg("Need an audio file (MP3, WAV, OGG, FLAC…)");
      setStatus("error");
      return;
    }
    if (mode === "decode" && f.type !== "image/png" && !f.name.endsWith(".png")) {
      setErrorMsg("Need a WDMP-encoded PNG file");
      setStatus("error");
      return;
    }
    setFile(f);
  };

  const run = async () => {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      if (mode === "encode") {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = await encodeAudioToPNG(bytes, file.name);
        const url = URL.createObjectURL(blob);
        prevUrl.current = url;
        const name = file.name.replace(/\.[^.]+$/, "") + ".wdmp.png";
        setResultUrl(url);
        setResultName(name);
        setPreview(url);
        setStatus("done");
      } else {
        const { data, filename } = await decodePNGtoAudio(file);
        const ext = filename.split(".").pop()?.toLowerCase() ?? "mp3";
        const mime = ext === "wav" ? "audio/wav" : ext === "ogg" ? "audio/ogg" : "audio/mpeg";
        const blob = new Blob([data.buffer as ArrayBuffer], { type: mime });
        const url = URL.createObjectURL(blob);
        prevUrl.current = url;
        setResultUrl(url);
        setResultName(filename);
        setAudioUrl(url);
        setStatus("done");
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  const accept = mode === "encode" ? "audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a" : "image/png";

  return (
    <div className="w-full h-full flex flex-col font-mono text-foreground">

      {/* Mode tabs */}
      <div className="flex border-b border-foreground/20 mb-8 shrink-0">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
              mode === m
                ? "border-b-2 border-foreground text-foreground"
                : "text-foreground/40 hover:text-foreground/70"
            }`}
          >
            {m === "encode" ? <Music size={13} /> : <ImageIcon size={13} />}
            {m === "encode" ? "Audio → PNG" : "PNG → Audio"}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">

        {/* ── INPUT ── */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="text-[10px] uppercase tracking-[0.4em] text-foreground/40">
            {mode === "encode" ? "Audio file" : "WDMP-encoded PNG"}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}
            onClick={() => inputRef.current?.click()}
            className="flex-1 min-h-[180px] border border-dashed border-foreground/25 hover:border-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 p-8"
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); e.target.value = ""; }}
            />
            {file ? (
              <>
                <span className="text-4xl select-none">{mode === "encode" ? "🎵" : "🖼️"}</span>
                <div className="text-center">
                  <p className="text-sm truncate max-w-[220px]">{file.name}</p>
                  <p className="text-xs text-foreground/40 mt-1">{formatBytes(file.size)}</p>
                </div>
              </>
            ) : (
              <>
                <Upload size={28} strokeWidth={1} className="text-foreground/25" />
                <div className="text-center">
                  <p className="text-xs text-foreground/50">Drop file here</p>
                  <p className="text-[10px] text-foreground/25 mt-1">or click to browse</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={run}
            disabled={!file || status === "loading"}
            className="border border-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <><span className="inline-block animate-spin">⟳</span> Processing…</>
            ) : (
              <><ArrowLeftRight size={13} /> {mode === "encode" ? "Encode to PNG" : "Decode to Audio"}</>
            )}
          </button>

          {status === "error" && (
            <p className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={13} /> {errorMsg}
            </p>
          )}

          {/* How it works */}
          <div className="border border-foreground/10 p-4 text-[10px] text-foreground/30 leading-relaxed">
            {mode === "encode" ? (
              <>Audio bytes packed 3-per-pixel into RGB channels of a PNG. Alpha locked at 255. PNG is lossless — every byte survives exactly.</>
            ) : (
              <>Reads RGB channels pixel-by-pixel, strips the WDMP header, reconstructs the original file byte-for-byte. Only works on files encoded by this tool.</>
            )}
          </div>
        </div>

        {/* ── OUTPUT ── */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="text-[10px] uppercase tracking-[0.4em] text-foreground/40">Output</div>

          <div className="flex-1 min-h-[180px] border border-foreground/20 flex flex-col items-center justify-center gap-5 p-8">
            {status === "done" ? (
              <>
                <CheckCircle2 size={28} strokeWidth={1} className="text-foreground/50" />
                <div className="text-center">
                  <p className="text-sm truncate max-w-[220px]">{resultName}</p>
                  <p className="text-[10px] text-foreground/40 mt-1">Ready</p>
                </div>

                {preview && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={preview}
                      alt="Encoded PNG"
                      className="max-w-[140px] max-h-[140px] border border-foreground/20 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-[10px] text-foreground/30">noise = your audio</span>
                  </div>
                )}

                {audioUrl && (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <audio controls src={audioUrl} className="w-full max-w-[260px]" />
                )}

                <a
                  href={resultUrl!}
                  download={resultName}
                  className="border border-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors flex items-center gap-2"
                >
                  <Download size={13} /> Download
                </a>
              </>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-foreground/20">
                {status === "loading" ? "Working…" : "Result appears here"}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
