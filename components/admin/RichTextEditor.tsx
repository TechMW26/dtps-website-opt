'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import type { ComponentType } from 'react';

type ReactQuillProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  modules?: Record<string, unknown>;
  theme?: string;
};

const ReactQuill = dynamic(
  async () => {
    const { default: Quill } = await import('react-quill-new');
    return Quill;
  },
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] bg-slate-700 border border-slate-600 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-slate-400">Loading editor...</span>
      </div>
    ),
  }
) as unknown as ComponentType<ReactQuillProps>;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md';
  required?: boolean;
  name?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = '',
  theme = 'dark',
  size = 'md',
  required = false,
  name,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  if (!mounted) {
    return (
      <div className={`rte rte-${size} ${theme === 'dark' ? 'rte-dark' : 'rte-light'} ${className}`}>
        <div className="w-full h-[200px] bg-slate-700 border border-slate-600 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-slate-400">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rte rte-${size} ${theme === 'dark' ? 'rte-dark' : 'rte-light'} ${className}`}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
      />
      {required && (
        <input
          type="text"
          name={name}
          value={value || ''}
          readOnly
          required
          className="sr-only"
          tabIndex={-1}
        />
      )}
      <style jsx global>{`
        .rte .ql-toolbar {
          border-radius: 10px 10px 0 0;
          border: 1px solid #374151;
          border-bottom: 0;
          background: #111827;
        }

        .rte .ql-container {
          border-radius: 0 0 10px 10px;
          border: 1px solid #374151;
          background: #0f172a;
          color: #e5e7eb;
        }

        .rte .ql-editor {
          min-height: 160px;
          font-size: 14px;
          line-height: 1.6;
        }

        .rte-sm .ql-editor {
          min-height: 110px;
        }

        .rte-md .ql-editor {
          min-height: 200px;
        }

        .rte-light .ql-toolbar {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .rte-light .ql-container {
          background: #ffffff;
          border-color: #e2e8f0;
          color: #0f172a;
        }

        .rte-light .ql-editor::placeholder {
          color: #94a3b8;
        }

        .rte-dark .ql-toolbar .ql-stroke,
        .rte-dark .ql-toolbar .ql-fill,
        .rte-dark .ql-toolbar .ql-picker {
          color: #e5e7eb;
        }

        .rte-dark .ql-toolbar .ql-stroke {
          stroke: #e5e7eb;
        }

        .rte-dark .ql-toolbar .ql-fill {
          fill: #e5e7eb;
        }

        .rte-dark .ql-toolbar .ql-picker-options {
          background: #0f172a;
        }

        .rte-dark .ql-editor.ql-blank::before {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
