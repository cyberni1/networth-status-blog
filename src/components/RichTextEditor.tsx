"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Link2, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Quote, Minus, Undo, Redo, Code2, Type, ChevronDown, Eye, FileCode,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type HeadingLevel = 1 | 2 | 3;

export default function RichTextEditor({ content, onChange, placeholder = "Schreibe deinen Artikel..." }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(content);
  const [showHeadings, setShowHeadings] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: "bg-black/40 rounded-lg p-4 font-mono text-sm" },
        },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-purple-400 underline" },
      }),
    ],
    content,
    editorProps: {
      attributes: { class: "tiptap-editor focus:outline-none" },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const addLink = () => {
    const url = window.prompt("URL eingeben:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Bild-URL eingeben:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const applyHtml = () => {
    if (editor) {
      editor.commands.setContent(htmlContent, { emitUpdate: false });
      onChange(htmlContent);
      setIsHtmlMode(false);
    }
  };

  if (!editor) return null;

  const ToolbarBtn = ({
    onClick,
    active = false,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-all ${
        active
          ? "bg-purple-500/30 text-purple-300"
          : "text-white/50 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/10">
        {/* Heading dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHeadings(!showHeadings)}
            className="flex items-center gap-1 px-2 py-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-all text-xs"
          >
            <Type className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showHeadings && (
            <div className="absolute top-full left-0 mt-1 glass rounded-lg p-1 z-10 min-w-[120px]">
              {([1, 2, 3] as HeadingLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    setShowHeadings(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-all ${
                    editor.isActive("heading", { level })
                      ? "bg-purple-500/30 text-purple-300"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  H{level}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setShowHeadings(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded text-sm text-white/70 hover:bg-white/10"
              >
                Normal
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Fett">
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Kursiv">
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Unterstrichen">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Durchgestrichen">
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <Code className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Links">
          <AlignLeft className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Zentriert">
          <AlignCenter className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Rechts">
          <AlignRight className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Blocksatz">
          <AlignJustify className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Aufzählung">
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Nummerierte Liste">
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Zitat">
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Trennlinie">
          <Minus className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Link">
          <Link2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} active={false} title="Bild einfügen">
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Rückgängig">
          <Undo className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Wiederholen">
          <Redo className="w-4 h-4" />
        </ToolbarBtn>

        <div className="flex-1" />

        {/* HTML toggle */}
        <button
          type="button"
          onClick={() => {
            if (!isHtmlMode) {
              setHtmlContent(editor.getHTML());
            } else {
              applyHtml();
            }
            setIsHtmlMode(!isHtmlMode);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isHtmlMode
              ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
              : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          {isHtmlMode ? <Eye className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
          {isHtmlMode ? "Vorschau" : "HTML"}
        </button>
      </div>

      {/* Editor content */}
      {isHtmlMode ? (
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          className="w-full min-h-[400px] p-4 bg-transparent text-white/80 font-mono text-sm resize-none focus:outline-none"
          placeholder="HTML Code eingeben..."
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
