"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface FileUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  name: string;
  fileState: File | null;
  setFileState: (file: File | null) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ value, onChange, label, name, fileState, setFileState }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileState(file);
    setPreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  const showPreview = preview && preview !== "";

  return (
    <div className="mb-2 w-full min-w-0">
      <label className="block text-xs font-medium mb-1 text-blue-900/80 truncate">{label}</label>
      <div className="flex flex-wrap items-center gap-4 min-w-0">
        <button
          type="button"
          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 text-xs font-semibold transition min-w-[120px]"
          onClick={() => inputRef.current?.click()}
        >
          {fileState ? "Change Image" : value ? "Change Image" : "Upload Image"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {showPreview && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200 shadow flex-shrink-0">
            <Image src={preview!} alt={label} fill className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadField;
