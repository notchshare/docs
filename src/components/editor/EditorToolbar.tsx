'use client';

import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Palette,
  Table,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEditor } from '@/hooks/useEditor';
import { TextBlock } from '@/types/editor';

export function EditorToolbar() {
  const { state, dispatch } = useEditor();

  const toggleStyle = (styleKey: keyof typeof state.currentStyle) => {
    if (typeof state.currentStyle[styleKey] === 'boolean') {
      dispatch({
        type: 'SET_STYLE',
        payload: { [styleKey]: !state.currentStyle[styleKey] }
      });
    }
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (state.selectedBlockId) {
      dispatch({
        type: 'UPDATE_BLOCK',
        payload: {
          id: state.selectedBlockId,
          updates: { alignment: { type: alignment } }
        }
      });
    }
  };

  const addBlock = (type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulleted' | 'numbered' | 'table' | 'image') => {
    if (type === 'paragraph' || type === 'heading1' || type === 'heading2' || type === 'heading3') {
      const newBlock: TextBlock = {
        id: `block-${Date.now()}`,
        type,
        content: '',
        style: { ...state.currentStyle },
        alignment: { type: 'left' }
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
    // TODO: Add handlers for other block types
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-background sticky top-0 z-10">
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant={state.currentStyle.bold ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={state.currentStyle.italic ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={state.currentStyle.underline ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('underline')}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant={state.currentStyle.strikethrough ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('strikethrough')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('left')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('center')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('right')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('justify')}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Insert Elements */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Style Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}