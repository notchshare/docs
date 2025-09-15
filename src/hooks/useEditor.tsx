'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EditorState, EditorAction, Document, TextStyle, Block } from '@/types/editor';

const defaultDocument: Document = {
  id: 'default',
  title: 'Untitled Document',
  createdAt: new Date(),
  updatedAt: new Date(),
  blocks: [
    {
      id: 'block-1',
      type: 'paragraph',
      content: '',
      style: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: 14,
        fontFamily: 'Inter',
        color: '#000000',
        backgroundColor: 'transparent'
      },
      alignment: { type: 'left' }
    }
  ],
  metadata: {
    author: 'Anonymous',
    version: 1
  }
};

const defaultStyle: TextStyle = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  fontSize: 14,
  fontFamily: 'Inter',
  color: '#000000',
  backgroundColor: 'transparent'
};

const initialState: EditorState = {
  document: defaultDocument,
  selectedBlockId: 'block-1',
  cursorPosition: 0,
  selectionStart: null,
  selectionEnd: null,
  isEditing: false,
  currentStyle: defaultStyle
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return {
        ...state,
        document: action.payload
      };

    case 'UPDATE_BLOCK': {
      const { id, updates } = action.payload;
      return {
        ...state,
        document: {
          ...state.document,
          blocks: state.document.blocks.map(block => 
            block.id === id
              ? { ...block, ...updates } as Block
              : block
          ),
          updatedAt: new Date()
        }
      };
    }

    case 'ADD_BLOCK':
      return {
        ...state,
        document: {
          ...state.document,
          blocks: [...state.document.blocks, action.payload],
          updatedAt: new Date()
        }
      };

    case 'DELETE_BLOCK':
      return {
        ...state,
        document: {
          ...state.document,
          blocks: state.document.blocks.filter(block => block.id !== action.payload),
          updatedAt: new Date()
        }
      };

    case 'SET_SELECTION':
      return {
        ...state,
        selectedBlockId: action.payload.blockId,
        selectionStart: action.payload.start,
        selectionEnd: action.payload.end
      };

    case 'SET_STYLE':
      return {
        ...state,
        currentStyle: { ...state.currentStyle, ...action.payload }
      };

    case 'TOGGLE_EDITING':
      return {
        ...state,
        isEditing: action.payload
      };

    case 'SET_CURSOR_POSITION':
      return {
        ...state,
        cursorPosition: action.payload
      };

    default:
      return state;
  }
}

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}