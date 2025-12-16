import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';
import Code from '@tiptap/extension-code';
import { PageContainer } from '@/components';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  Minus,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Type,
} from 'lucide-react';
import styles from './index.module.less';

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const addLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('请输入图片URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffcc00', '#008a00', '#0066cc', '#9933ff',
    '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
    '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b266', '#66a3e0', '#c285ff',
    '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
    '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466',
  ];

  if (!editor) return null;

  return (
    <div className={styles.toolbar}>
      {/* 撤销重做 */}
      <div className={styles.toolbarGroup}>
        <button
          className={styles.toolbarButton}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销"
        >
          <Undo size={16} />
        </button>
        <button
          className={styles.toolbarButton}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* 标题 */}
      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 1 }) ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="标题1"
        >
          <Heading1 size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 2 }) ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="标题2"
        >
          <Heading2 size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 3 }) ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="标题3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      {/* 文本格式 */}
      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="粗体"
        >
          <Bold size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜体"
        >
          <Italic size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="下划线"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('strike') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="删除线"
        >
          <Strikethrough size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('code') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="行内代码"
        >
          <CodeIcon size={16} />
        </button>
      </div>

      {/* 颜色和高亮 */}
      <div className={styles.toolbarGroup}>
        <div className={styles.colorPicker}>
          <button
            className={`${styles.toolbarButton} ${styles.colorButton}`}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="文字颜色"
            style={{ color: editor.getAttributes('textStyle').color || '#000000' }}
          >
            <Type size={16} />
          </button>
          {showColorPicker && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1000,
              background: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              width: '168px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {colors.map((color) => (
                <button
                  key={color}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    border: '1px solid #d9d9d9',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('highlight') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="高亮"
        >
          <Highlighter size={16} />
        </button>
      </div>

      {/* 列表 */}
      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="无序列表"
        >
          <List size={16} />
        </button>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="有序列表"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* 引用和分割线 */}
      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('blockquote') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="引用"
        >
          <Quote size={16} />
        </button>
        <button
          className={styles.toolbarButton}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分割线"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* 链接和图片 */}
      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.active : ''}`}
          onClick={() => setShowLinkInput(!showLinkInput)}
          title="链接"
        >
          <LinkIcon size={16} />
        </button>
        {showLinkInput && (
          <div className={styles.linkInput}>
            <input
              type="text"
              placeholder="输入链接URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addLink();
                } else if (e.key === 'Escape') {
                  setShowLinkInput(false);
                }
              }}
            />
            <button onClick={addLink}>确定</button>
            <button onClick={removeLink}>移除</button>
          </div>
        )}
        <button
          className={styles.toolbarButton}
          onClick={addImage}
          title="图片"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* 表格 */}
      <div className={styles.toolbarGroup}>
        <button
          className={styles.toolbarButton}
          onClick={insertTable}
          title="插入表格"
        >
          <TableIcon size={16} />
        </button>
      </div>
    </div>
  );
};

const RichTextEditor: React.FC = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Highlight,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      HorizontalRule,
      Blockquote,
      Code,
    ],
    content: `
      <h2>欢迎使用富文本编辑器</h2>
      <p>这是一个功能完整的富文本编辑器，支持以下功能：</p>
      <ul>
        <li><strong>文本格式化</strong>：粗体、斜体、下划线、删除线</li>
        <li><em>标题</em>：支持 H1-H6 标题</li>
        <li><u>列表</u>：有序列表和无序列表</li>
        <li><mark>高亮</mark>和<span style="color: #e60000">颜色</span></li>
        <li>链接和图片插入</li>
        <li>表格支持</li>
        <li>代码块和行内<code>代码</code></li>
      </ul>
      <blockquote>
        <p>这是一个引用块示例</p>
      </blockquote>
      <p>开始编辑吧！</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  return (
    <PageContainer title="富文本编辑器" ghost>
      <div className={styles.richTextEditor}>
        <Toolbar editor={editor} />
        <div className={styles.editorContent}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </PageContainer>
  );
};

export default RichTextEditor;
