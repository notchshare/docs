'use client';

import React, { useRef, useEffect } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { TextBlock, isTextBlock } from '@/types/editor';

interface EditableBlockProps {
  block: TextBlock;
}

function EditableBlock({ block }: EditableBlockProps) {
  const { state, dispatch } = useEditor();
  const ref = useRef<HTMLDivElement>(null);

  const handleContentChange = (content: string) => {
    dispatch({
      type: 'UPDATE_BLOCK',
      payload: {
        id: block.id,
        updates: { content }
      }
    });
  };

  const handleFocus = () => {
    dispatch({
      type: 'SET_SELECTION',
      payload: { blockId: block.id, start: null, end: null }
    });
    dispatch({
      type: 'TOGGLE_EDITING',
      payload: true
    });
  };

  const handleBlur = () => {
    dispatch({
      type: 'TOGGLE_EDITING',
      payload: false
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock = {
        id: `block-${Date.now()}`,
        type: 'paragraph' as const,
        content: '',
        style: { ...state.currentStyle },
        alignment: { type: 'left' as const }
      };
      
      dispatch({
        type: 'ADD_BLOCK',
        payload: newBlock
      });
      
      // Focus the new block after a brief delay
      setTimeout(() => {
        const newElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
        if (newElement) {
          newElement.focus();
        }
      }, 10);
    }
  };

  const getTextStyle = () => {
    const { style } = block;
    return {
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: [
        style.underline ? 'underline' : '',
        style.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      fontSize: `${style.fontSize}px`,
      fontFamily: style.fontFamily,
      color: style.color,
      backgroundColor: style.backgroundColor,
      textAlign: block.alignment.type as 'left' | 'center' | 'right' | 'justify'
    };
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading1':
        return 'Heading 1';
      case 'heading2':
        return 'Heading 2';
      case 'heading3':
        return 'Heading 3';
      default:
        return 'Type something...';
    }
  };

  const getClassName = () => {
    const baseClasses = 'outline-none w-full min-h-[1.5em] break-words';
    const typeClasses = {
      paragraph: 'text-base leading-relaxed',
      heading1: 'text-3xl font-bold leading-tight',
      heading2: 'text-2xl font-semibold leading-tight',
      heading3: 'text-xl font-medium leading-tight'
    };
    
    return `${baseClasses} ${typeClasses[block.type]} ${
      state.selectedBlockId === block.id ? 'ring-2 ring-primary ring-offset-2 rounded-sm' : ''
    }`;
  };

  return (
    <div className="mb-2">
      <div
        ref={ref}
        data-block-id={block.id}
        contentEditable
        suppressContentEditableWarning
        className={getClassName()}
        style={getTextStyle()}
        onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: block.content || `<span style="color: #999;">${getPlaceholder()}</span>` }}
      />
    </div>
  );
}

export function EditorCanvas() {
  const { state } = useEditor();
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the first block on initial load
    if (canvasRef.current && state.document.blocks.length > 0) {
      const firstBlock = canvasRef.current.querySelector('[data-block-id]') as HTMLElement;
      const firstBlockData = state.document.blocks[0];
      if (firstBlock && 'content' in firstBlockData && firstBlockData.content === '') {
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
            <EditableBlock
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