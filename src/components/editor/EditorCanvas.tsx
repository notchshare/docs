'use client';

import React, { useRef, useEffect } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { isTextBlock } from '@/types/editor';
import { RichTextBlock } from './RichTextBlock';

export function EditorCanvas() {
  const { state } = useEditor();
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the first block on initial load
    if (canvasRef.current && state.document.blocks.length > 0) {
      const firstBlock = canvasRef.current.querySelector('[data-block-id]') as HTMLElement;
      const firstBlockData = state.document.blocks[0];
      if (firstBlock && 'content' in firstBlockData && firstBlockData.content.spans.length === 0) {
        firstBlock.focus();
      }
    }
  }, [state.document.blocks]);

  return (
    <div 
      ref={canvasRef}
      className="flex-1 max-w-4xl mx-auto p-8 bg-white shadow-sm min-h-[80vh] rounded-lg border border-border"
      style={{
        fontFamily: 'var(--font-sans)'
      }}
    >
      {state.document.blocks.map((block) => {
        if (isTextBlock(block)) {
          return (
            <RichTextBlock
              key={block.id}
              block={block}
            />
          );
        }
        
        // Placeholder for other block types
        return (
          <div key={block.id} className="mb-2 p-4 border border-dashed border-gray-300 rounded">
            <span className="text-gray-500">
              {block.type} block (coming soon)
            </span>
          </div>
        );
      })}
    </div>
  );
}