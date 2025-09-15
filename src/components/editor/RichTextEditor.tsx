'use client';

import React from 'react';
import { EditorProvider } from '@/hooks/useEditor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorCanvas } from '@/components/editor/EditorCanvas';

export function RichTextEditor() {
  return (
    <EditorProvider>
      <div className="flex flex-col h-screen">
        {/* Document Header */}
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Docs</h1>
            <div className="relative">
              <input
                type="text"
                defaultValue="Untitled Document"
                className="text-base font-medium bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1 min-w-[200px]"
                placeholder="Document title"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Saving...</span>
          </div>
        </div>

        {/* Editor Toolbar */}
        <EditorToolbar />

        {/* Editor Canvas */}
        <div className="flex-1 overflow-auto p-6">
          <EditorCanvas />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 bg-white text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Words: 0</span>
            <span>Characters: 0</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Version 1.0</span>
            <span>Last saved: Just now</span>
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}