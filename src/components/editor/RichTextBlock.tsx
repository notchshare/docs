'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { TextBlock, InlineStyle, createRichTextFromString, createEmptyRichText } from '@/types/editor';

interface RichTextBlockProps {
  block: TextBlock;
}

export function RichTextBlock({ block }: RichTextBlockProps) {
  const { state, dispatch } = useEditor();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Convert inline style to CSS style object
  const getInlineStyleCSS = (style?: InlineStyle) => {
    if (!style) return {};
    
    return {
      fontWeight: style.bold ? 'bold' : undefined,
      fontStyle: style.italic ? 'italic' : undefined,
      textDecoration: [
        style.underline ? 'underline' : '',
        style.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || undefined,
      fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
      fontFamily: style.fontFamily || undefined,
      color: style.color || undefined,
      backgroundColor: style.backgroundColor || undefined,
    };
  };

  // Render rich text content as JSX
  const renderRichText = () => {
    if (!block.content.spans.length) {
      return <span className="text-gray-400">{getPlaceholder()}</span>;
    }

    return block.content.spans.map((span, index) => (
      <span key={index} style={getInlineStyleCSS(span.style)}>
        {span.text || '\u200B'} {/* Zero-width space for empty spans */}
      </span>
    ));
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

  const getBlockStyle = () => {
    const { style } = block;
    return {
      textAlign: block.alignment.type as 'left' | 'center' | 'right' | 'justify'
    };
  };

  const getClassName = () => {
    const baseClasses = 'outline-none w-full min-h-[1.5em] break-words cursor-text';
    const typeClasses = {
      paragraph: 'text-base leading-relaxed',
      heading1: 'text-3xl font-bold leading-tight',
      heading2: 'text-2xl font-semibold leading-tight',
      heading3: 'text-xl font-medium leading-tight'
    };
    
    return `${baseClasses} ${typeClasses[block.type]} ${
      state.selectedBlockId === block.id ? 'ring-2 ring-blue-500 ring-offset-2 rounded-sm' : ''
    }`;
  };

  // Get current cursor position in the text
  const getCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current || selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    return preCaretRange.toString().length;
  }, []);

  // Set cursor position in the text
  const setCursorPosition = useCallback((position: number) => {
    if (!editorRef.current) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentPosition = 0;
    let targetNode: Node | null = null;
    let targetOffset = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const nodeLength = node.textContent?.length || 0;
      
      if (currentPosition + nodeLength >= position) {
        targetNode = node;
        targetOffset = position - currentPosition;
        break;
      }
      currentPosition += nodeLength;
    }

    if (targetNode) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);

  // Handle text input and formatting
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) return;

    const currentText = e.currentTarget.textContent || '';
    const cursorPos = getCursorPosition();

    // For now, update the entire content as a single span with current style
    // This preserves the basic functionality while we build up the inline formatting
    dispatch({
      type: 'UPDATE_BLOCK',
      payload: {
        id: block.id,
        updates: { 
          content: currentText.length > 0 
            ? createRichTextFromString(currentText, state.currentStyle)
            : createEmptyRichText()
        }
      }
    });

    // Update cursor position
    dispatch({
      type: 'SET_CURSOR_POSITION',
      payload: cursorPos
    });
  }, [block.id, dispatch, getCursorPosition, isComposing, state.currentStyle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          dispatch({
            type: 'SET_STYLE',
            payload: { bold: !state.currentStyle.bold }
          });
          return;
        case 'i':
          e.preventDefault();
          dispatch({
            type: 'SET_STYLE',
            payload: { italic: !state.currentStyle.italic }
          });
          return;
        case 'u':
          e.preventDefault();
          dispatch({
            type: 'SET_STYLE',
            payload: { underline: !state.currentStyle.underline }
          });
          return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock: TextBlock = {
        id: `block-${Date.now()}`,
        type: 'paragraph',
        content: createEmptyRichText(),
        style: { ...block.style },
        alignment: { type: 'left' }
      };
      
      dispatch({
        type: 'ADD_BLOCK',
        payload: newBlock
      });
      
      // Focus the new block after creation
      setTimeout(() => {
        const newElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
        if (newElement) {
          newElement.focus();
        }
      }, 10);
    }
  }, [block.id, block.style, dispatch, state.currentStyle]);

  const handleFocus = useCallback(() => {
    dispatch({
      type: 'SET_SELECTION',
      payload: { blockId: block.id, start: null, end: null }
    });
    dispatch({
      type: 'TOGGLE_EDITING',
      payload: true
    });
  }, [block.id, dispatch]);

  const handleBlur = useCallback(() => {
    dispatch({
      type: 'TOGGLE_EDITING',
      payload: false
    });
  }, [dispatch]);

  const handleSelectionChange = useCallback(() => {
    if (!editorRef.current || document.activeElement !== editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Calculate selection positions relative to the text content
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.endContainer, range.endOffset);
    const end = preSelectionRange.toString().length;

    dispatch({
      type: 'SET_SELECTION',
      payload: { 
        blockId: block.id, 
        start: start, 
        end: end 
      }
    });

    // Update cursor position
    dispatch({
      type: 'SET_CURSOR_POSITION',
      payload: start
    });
  }, [block.id, dispatch]);

  // Set up selection change listener
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Apply formatting to selected text
  useEffect(() => {
    if (state.selectedBlockId === block.id && 
        state.selectionStart !== null && 
        state.selectionEnd !== null &&
        state.selectionStart !== state.selectionEnd) {
      
      // We have a text selection, so we should apply formatting when style changes
      const lastStyleKeys = Object.keys(state.currentStyle);
      const hasStyleChange = lastStyleKeys.some(key => {
        const styleKey = key as keyof typeof state.currentStyle;
        return state.currentStyle[styleKey] !== undefined;
      });

      if (hasStyleChange) {
        // Apply the current style to the selected range
        dispatch({
          type: 'APPLY_FORMATTING',
          payload: {
            blockId: block.id,
            start: state.selectionStart,
            end: state.selectionEnd,
            style: state.currentStyle
          }
        });
      }
    }
  }, [state.currentStyle, state.selectedBlockId, state.selectionStart, state.selectionEnd, block.id, dispatch]);

  return (
    <div className="mb-2">
      <div
        ref={editorRef}
        data-block-id={block.id}
        contentEditable
        suppressContentEditableWarning
        className={getClassName()}
        style={getBlockStyle()}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        role="textbox"
        aria-multiline="false"
        aria-label={`${block.type} text editor`}
      >
        {renderRichText()}
      </div>
    </div>
  );
}