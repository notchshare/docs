export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
}

export interface TextAlignment {
  type: 'left' | 'center' | 'right' | 'justify';
}

export interface ListItem {
  id: string;
  content: string;
  level: number;
  style: TextStyle;
}

export interface ListBlock {
  id: string;
  type: 'bulleted' | 'numbered';
  items: ListItem[];
}

export interface TableCell {
  id: string;
  content: string;
  style: TextStyle;
  colspan?: number;
  rowspan?: number;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableBlock {
  id: string;
  type: 'table';
  rows: TableRow[];
  columnWidths: number[];
}

export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  width: number;
  height: number;
  alignment: 'left' | 'center' | 'right';
}

export interface TextBlock {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3';
  content: string;
  style: TextStyle;
  alignment: TextAlignment;
}

export type Block = TextBlock | ListBlock | TableBlock | ImageBlock;

// Type guards
export function isTextBlock(block: Block): block is TextBlock {
  return block.type === 'paragraph' || block.type === 'heading1' || 
         block.type === 'heading2' || block.type === 'heading3';
}

export function isListBlock(block: Block): block is ListBlock {
  return block.type === 'bulleted' || block.type === 'numbered';
}

export function isTableBlock(block: Block): block is TableBlock {
  return block.type === 'table';
}

export function isImageBlock(block: Block): block is ImageBlock {
  return block.type === 'image';
}

export interface Document {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  blocks: Block[];
  metadata: {
    author: string;
    version: number;
  };
}

export interface EditorState {
  document: Document;
  selectedBlockId: string | null;
  cursorPosition: number;
  selectionStart: number | null;
  selectionEnd: number | null;
  isEditing: boolean;
  currentStyle: TextStyle;
}

export type EditorAction = 
  | { type: 'SET_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<Block> } }
  | { type: 'ADD_BLOCK'; payload: Block }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'SET_SELECTION'; payload: { blockId: string; start: number | null; end: number | null } }
  | { type: 'SET_STYLE'; payload: Partial<TextStyle> }
  | { type: 'TOGGLE_EDITING'; payload: boolean }
  | { type: 'SET_CURSOR_POSITION'; payload: number };