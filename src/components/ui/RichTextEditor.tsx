

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import FontFamily from '@tiptap/extension-font-family'  // ← NEW
import { Extension } from '@tiptap/core'
import React, { useEffect, useCallback } from 'react'
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
    Link as LinkIcon, Undo, Redo,
} from 'lucide-react'

// ─── Font Size Extension ──────────────────────────────────────────────────────
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return { types: ['textStyle'] }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (el) => el.style.fontSize || null,
                        renderHTML: (attrs) => {
                            if (!attrs.fontSize) return {}
                            return { style: `font-size: ${attrs.fontSize}` }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize:
                (size: string) =>
                    ({ chain }: any) =>
                        chain().setMark('textStyle', { fontSize: size }).run(),
            unsetFontSize:
                () =>
                    ({ chain }: any) =>
                        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
        } as any
    },
})

// ─── Font families ────────────────────────────────────────────────────────────
const FONT_FAMILIES = [
    { label: 'Default', value: '' },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: 'Sans-serif', value: 'ui-sans-serif, system-ui, sans-serif' },
    { label: 'Serif', value: 'Georgia, ui-serif, serif' },
    { label: 'Monospace', value: 'ui-monospace, "Courier New", monospace' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: "Times New Roman", value: "Times New Roman, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Tahoma", value: "Tahoma, sans-serif" },
    { label: "Courier New", value: "Courier New, monospace" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Palatino", value: "Palatino, serif" },
    { label: "Garamond", value: "Garamond, serif" },
    { label: "Comic Sans MS", value: "Comic Sans MS, sans-serif" },
    { label: "Arial Black", value: "Arial Black, sans-serif" },
    { label: "Impact", value: "Impact, sans-serif" },
    { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
    { label: "Arial Narrow", value: "Arial Narrow, sans-serif" },
    { label: "Arial Rounded MT Bold", value: "Arial Rounded MT Bold, sans-serif" },
    { label: "Arial Unicode MS", value: "Arial Unicode MS, sans-serif" },
    { label: "Arial Unicode MS", value: "Arial Unicode MS, sans-serif" },
]

// ─── Text colors ──────────────────────────────────────────────────────────────
const TEXT_COLORS = [
    { hex: '#000B60', label: 'Navy' },
    { hex: '#185FA5', label: 'Blue' },
    { hex: '#0F6E56', label: 'Green' },
    { hex: '#D85A30', label: 'Orange' },
    { hex: '#A32D2D', label: 'Red' },
    { hex: '#6B21A8', label: 'Purple' },
    { hex: '#374151', label: 'Dark gray' },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
    value?: string
    onChange?: (html: string) => void
    placeholder?: string
    error?: string
    label?: string
    minHeight?: number
}

interface ToolbarButtonProps {
    onClick: () => void
    active?: boolean
    title: string
    disabled?: boolean
    children: React.ReactNode
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
const ToolbarButton = ({ onClick, active, title, disabled, children }: ToolbarButtonProps) => (
    <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={`
      w-7 h-7 flex items-center justify-center rounded text-sm transition-colors
      ${active
                ? 'bg-[#000B60] text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }
      disabled:opacity-30 disabled:cursor-not-allowed
    `}
    >
        {children}
    </button>
)

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

// ─── Main component ───────────────────────────────────────────────────────────
const RichTextEditor = ({
    value = '',
    onChange,
    placeholder = 'Write your message here...',
    error,
    label,
    minHeight = 180,
}: RichTextEditorProps) => {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false }),
            TextStyle,
            Color,
            FontSize,
            FontFamily,              // ← NEW
            Underline,
            TextAlign.configure({ types: ['paragraph'] }),
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }: any) => {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-sm max-w-none text-gray-800',
                style: `min-height: ${minHeight}px; padding: 12px 14px;`,
            },
        },
    })

    useEffect(() => {
        if (!editor) return
        if (value !== editor.getHTML()) {
            editor.commands.setContent(value || '')
        }
    }, [value, editor])

    const setLink = useCallback(() => {
        if (!editor) return
        const prev = editor.getAttributes('link').href
        const url = window.prompt('Enter URL', prev || 'https://')
        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
    }, [editor])

    const currentFontSize = editor?.getAttributes('textStyle')?.fontSize
        ? parseInt(editor.getAttributes('textStyle').fontSize)
        : ''

    // ← NEW: detect active font family
    const currentFontFamily = editor?.getAttributes('textStyle')?.fontFamily ?? ''

    if (!editor) return null

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-bold text-gray-700">{label}</label>
            )}

            <div
                className={`
          rounded-lg border bg-white overflow-hidden transition-colors
          focus-within:ring-2 focus-within:ring-[#000B60]/20 focus-within:border-[#000B60]
          ${error ? 'border-red-400' : 'border-gray-200'}
        `}
            >
                {/* Toolbar */}
                <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-gray-100 bg-gray-50">

                    {/* Undo / Redo */}
                    <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                        <Undo size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                        <Redo size={14} />
                    </ToolbarButton>

                    <Divider />

                    {/* ── Font family selector ── NEW */}
                    <select
                        title="Font family"
                        value={currentFontFamily}
                        onChange={(e) => {
                            const val = e.target.value
                            if (val === '') {
                                editor.chain().focus().unsetFontFamily().run()
                            } else {
                                editor.chain().focus().setFontFamily(val).run()
                            }
                        }}
                        className="h-7 px-1.5 text-xs border border-gray-200 rounded bg-white text-gray-700 outline-none hover:border-gray-300 focus:border-[#000B60] cursor-pointer"
                        style={{ fontFamily: currentFontFamily || 'inherit' }}
                    >
                        {FONT_FAMILIES.map((f) => (
                            <option
                                key={f.value}
                                value={f.value}
                                style={{ fontFamily: f.value || 'inherit' }}
                            >
                                {f.label}
                            </option>
                        ))}
                    </select>

                    <Divider />

                    {/* Font size number input */}
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            min={8}
                            max={72}
                            value={currentFontSize}
                            placeholder="14"
                            onChange={(e) => {
                                const val = e.target.value
                                if (val === '') {
                                    ; (editor.chain().focus() as any).unsetFontSize().run()
                                } else {
                                    ; (editor.chain().focus() as any).setFontSize(`${val}px`).run()
                                }
                            }}
                            className="w-12 h-7 px-1.5 text-xs text-center border border-gray-200 rounded bg-white text-gray-700 outline-none hover:border-gray-300 focus:border-[#000B60]"
                        />
                        <span className="text-xs text-gray-400">px</span>
                    </div>

                    <Divider />

                    {/* Inline marks */}
                    <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <Bold size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <Italic size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                        <UnderlineIcon size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                        <Strikethrough size={14} />
                    </ToolbarButton>

                    <Divider />

                    {/* Lists */}
                    <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <List size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <ListOrdered size={14} />
                    </ToolbarButton>

                    <Divider />

                    {/* Alignment */}
                    <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                        <AlignLeft size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                        <AlignCenter size={14} />
                    </ToolbarButton>
                    <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                        <AlignRight size={14} />
                    </ToolbarButton>

                    <Divider />

                    {/* Link */}
                    <ToolbarButton title="Insert link" active={editor.isActive('link')} onClick={setLink}>
                        <LinkIcon size={14} />
                    </ToolbarButton>

                    <Divider />

                    {/* Text colors */}
                    <div className="flex items-center gap-1 ml-0.5">
                        {TEXT_COLORS.map((c) => (
                            <button
                                key={c.hex}
                                type="button"
                                title={`Color: ${c.label}`}
                                onClick={() => editor.chain().focus().setColor(c.hex).run()}
                                className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
                                style={{
                                    background: c.hex,
                                    borderColor: editor.isActive('textStyle', { color: c.hex }) ? '#000B60' : 'transparent',
                                    outline: editor.isActive('textStyle', { color: c.hex }) ? '1.5px solid #000B60' : 'none',
                                    outlineOffset: '1px',
                                }}
                            />
                        ))}
                        {/* Reset color */}
                        <button
                            type="button"
                            title="Reset color"
                            onClick={() => editor.chain().focus().unsetColor().run()}
                            className="w-4 h-4 rounded-full border border-dashed border-gray-400 hover:border-gray-600 bg-white"
                        />
                    </div>

                </div>

                {/* Editor area */}
                <EditorContent editor={editor} />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    )
}

export default RichTextEditor