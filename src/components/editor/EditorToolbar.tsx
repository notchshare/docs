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
  Image,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEditor } from '@/hooks/useEditor';
import { TextBlock, createEmptyRichText } from '@/types/editor';

export function EditorToolbar() {
  const { state, dispatch } = useEditor();

  const toggleStyle = (styleKey: keyof typeof state.currentStyle) => {
    if (typeof state.currentStyle[styleKey] === 'boolean') {
      const newValue = !state.currentStyle[styleKey];
      dispatch({
        type: 'SET_STYLE',
        payload: { [styleKey]: newValue }
      });

      // If there's a text selection, apply formatting to it
      if (state.selectedBlockId && 
          state.selectionStart !== null && 
          state.selectionEnd !== null &&
          state.selectionStart !== state.selectionEnd) {
        dispatch({
          type: 'APPLY_FORMATTING',
          payload: {
            blockId: state.selectedBlockId,
            start: state.selectionStart,
            end: state.selectionEnd,
            style: { [styleKey]: newValue }
          }
        });
      }
    }
  };

  const changeFontSize = (delta: number) => {
    const currentSize = state.currentStyle.fontSize || 14;
    const newSize = Math.max(8, Math.min(72, currentSize + delta));
    
    dispatch({
      type: 'SET_STYLE',
      payload: { fontSize: newSize }
    });

    // If there's a text selection, apply formatting to it
    if (state.selectedBlockId && 
        state.selectionStart !== null && 
        state.selectionEnd !== null &&
        state.selectionStart !== state.selectionEnd) {
      dispatch({
        type: 'APPLY_FORMATTING',
        payload: {
          blockId: state.selectedBlockId,
          start: state.selectionStart,
          end: state.selectionEnd,
          style: { fontSize: newSize }
        }
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
        content: createEmptyRichText(),
        style: {
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: type === 'heading1' ? 32 : type === 'heading2' ? 24 : type === 'heading3' ? 20 : 14,
          fontFamily: 'Inter',
          color: '#000000',
          backgroundColor: 'transparent'
        },
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
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={state.currentStyle.italic ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={state.currentStyle.underline ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant={state.currentStyle.strikethrough ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleStyle('strikethrough')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Size Controls */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 px-2">
          {state.currentStyle.fontSize || 14}px
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeFontSize(-2)}
          title="Decrease font size"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeFontSize(2)}
          title="Increase font size"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('left')}
          title="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('center')}
          title="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('right')}
          title="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlignment('justify')}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Types */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
          title="Add paragraph"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('heading1')}
          title="Add heading 1"
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('heading2')}
          title="Add heading 2"
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('heading3')}
          title="Add heading 3"
        >
          H3
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
          title="Bulleted list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
          title="Numbered list"
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
          title="Insert table"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
          title="Insert image"
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
          title="Text color"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}