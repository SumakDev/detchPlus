"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ImageUploader({
  value,
  onChange,
  label = "Imagen del producto",
}: {
  value?: File | null;
  onChange: (file: File | null) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onChange(f);
  }, [onChange]);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-2 border-2 border-dashed rounded-lg p-3 text-center text-sm text-gray-600 hover:bg-gray-50"
      >
        {preview ? (
          <div className="flex items-center justify-between gap-3">
            <img src={preview} alt="preview" className="h-16 w-16 object-cover rounded border" />
            <div className="flex gap-2">
              <button
                type="button"
                className="border rounded px-2 py-1 text-sm"
                onClick={() => inputRef.current?.click()}
              >
                Cambiar
              </button>
              <button
                type="button"
                className="border rounded px-2 py-1 text-sm"
                onClick={() => onChange(null)}
              >
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p>Arrastra una imagen aquí o</p>
            <button
              type="button"
              className="border rounded px-3 py-1 text-sm"
              onClick={() => inputRef.current?.click()}
            >
              Seleccionar archivo
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
}