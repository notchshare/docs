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

// New interface for inline text formatting
export interface InlineStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
}

// Represents a formatted text span within a line
export interface TextSpan {
  text: string;
  style?: InlineStyle;
}

// Represents rich text content with inline formatting
export interface RichTextContent {
  spans: TextSpan[];
}

export interface TextAlignment {
  type: 'left' | 'center' | 'right' | 'justify';
}

export interface ListItem {
  id: string;
  content: RichTextContent;
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
  content: RichTextContent;
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
  content: RichTextContent;
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
  currentStyle: InlineStyle;
}

export type EditorAction = 
  | { type: 'SET_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<Block> } }
  | { type: 'ADD_BLOCK'; payload: Block }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'SET_SELECTION'; payload: { blockId: string; start: number | null; end: number | null } }
  | { type: 'SET_STYLE'; payload: Partial<InlineStyle> }
  | { type: 'TOGGLE_EDITING'; payload: boolean }
  | { type: 'SET_CURSOR_POSITION'; payload: number }
  | { type: 'APPLY_FORMATTING'; payload: { blockId: string; start: number; end: number; style: InlineStyle } }
  | { type: 'INSERT_TEXT'; payload: { blockId: string; position: number; text: string; style?: InlineStyle } };

// Utility functions for working with rich text
export function createEmptyRichText(): RichTextContent {
  return { spans: [{ text: '', style: {} }] };
}

export function createRichTextFromString(text: string, style?: InlineStyle): RichTextContent {
  return { spans: [{ text, style: style || {} }] };
}

export function richTextToPlainText(content: RichTextContent): string {
  return content.spans.map(span => span.text).join('');
}

export function insertTextIntoRichContent(
  content: RichTextContent,
  position: number,
  text: string,
  style?: InlineStyle
): RichTextContent {
  let currentPos = 0;
  let targetSpanIndex = 0;
  let positionInSpan = 0;

  // Find the span and position within that span where we want to insert
  for (let i = 0; i < content.spans.length; i++) {
    const span = content.spans[i];
    if (currentPos + span.text.length >= position) {
      targetSpanIndex = i;
      positionInSpan = position - currentPos;
      break;
    }
    currentPos += span.text.length;
  }

  const newSpans = [...content.spans];
  const targetSpan = newSpans[targetSpanIndex];
  
  if (positionInSpan === 0) {
    // Insert at the beginning of the span
    newSpans.splice(targetSpanIndex, 0, { text, style: style || {} });
  } else if (positionInSpan === targetSpan.text.length) {
    // Insert at the end of the span
    newSpans.splice(targetSpanIndex + 1, 0, { text, style: style || {} });
  } else {
    // Split the span and insert in the middle
    const beforeText = targetSpan.text.substring(0, positionInSpan);
    const afterText = targetSpan.text.substring(positionInSpan);
    
    newSpans[targetSpanIndex] = { ...targetSpan, text: beforeText };
    newSpans.splice(targetSpanIndex + 1, 0, { text, style: style || {} });
    newSpans.splice(targetSpanIndex + 2, 0, { ...targetSpan, text: afterText });
  }

  return { spans: newSpans };
}

export function applyFormattingToRichContent(
  content: RichTextContent,
  start: number,
  end: number,
  style: InlineStyle
): RichTextContent {
  if (start >= end) return content;
  
  const newSpans: TextSpan[] = [];
  let currentPos = 0;

  for (const span of content.spans) {
    const spanStart = currentPos;
    const spanEnd = currentPos + span.text.length;

    if (spanEnd <= start || spanStart >= end) {
      // Span is completely outside the selection
      newSpans.push(span);
    } else if (spanStart >= start && spanEnd <= end) {
      // Span is completely inside the selection
      newSpans.push({
        text: span.text,
        style: { ...span.style, ...style }
      });
    } else {
      // Span is partially inside the selection - need to split
      const selectionStart = Math.max(start, spanStart);
      const selectionEnd = Math.min(end, spanEnd);
      
      // Before selection
      if (spanStart < selectionStart) {
        newSpans.push({
          text: span.text.substring(0, selectionStart - spanStart),
          style: span.style
        });
      }
      
      // Inside selection
      if (selectionStart < selectionEnd) {
        newSpans.push({
          text: span.text.substring(selectionStart - spanStart, selectionEnd - spanStart),
          style: { ...span.style, ...style }
        });
      }
      
      // After selection
      if (selectionEnd < spanEnd) {
        newSpans.push({
          text: span.text.substring(selectionEnd - spanStart),
          style: span.style
        });
      }
    }

    currentPos += span.text.length;
  }

  return { spans: newSpans };
}