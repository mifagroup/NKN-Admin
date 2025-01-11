// React Imports
import React, { useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Utils Imports
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { type Editor, EditorContent, type EditorEvents, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import classnames from 'classnames'
import { Card, CardContent, Divider } from '@mui/material'

import { useGetDictionary } from '@/utils/useGetDictionary'
import CustomIconButton from '../mui/IconButton'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

type TextEditorProps = {
  placeholder?: string
  onChange: (props: EditorEvents['update']) => void
  value: string
}

const TextEditor: React.FC<TextEditorProps> = ({ placeholder, onChange, value }) => {
  // Hooks
  const { lang } = useParams()

  const dictionary = useGetDictionary()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,

      // Image,
      Placeholder.configure({
        placeholder: placeholder ?? dictionary?.editor?.defaultPlaceholder
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: lang === 'fa' ? 'right' : 'left'
      }),
      Underline
    ],
    onUpdate: editor => onChange(editor)
  })

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return (
    <Card className='p-0 border shadow-none'>
      <CardContent className='p-0'>
        <EditorToolbar editor={editor} />
        <Divider className='mli-5' />
        <EditorContent editor={editor} className='bs-[135px] overflow-y-auto' />
      </CardContent>
    </Card>
  )
}

export default TextEditor

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  // TODO: Implement image upload

  // const fileInputRef = useRef<HTMLInputElement | null>(null) // Create a ref for the file input

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0] // Get the first selected file

  //   if (file) {
  //     const reader = new FileReader()

  //     reader.onloadend = () => {
  //       const base64Image = reader.result as string // Convert to Base64 string

  //       editor?.chain().focus().setImage({ src: base64Image }).run() // Insert the image into the editor
  //     }

  //     reader.readAsDataURL(file) // Read the file as a Data URL (Base64)
  //   }
  // }

  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-5 pbe-4 pli-5'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('ri-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('ri-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('ri-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('ri-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className={classnames('ri-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i
          className={classnames('ri-align-center', {
            'text-textSecondary': !editor.isActive({ textAlign: 'center' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i
          className={classnames('ri-align-right', {
            'text-textSecondary': !editor.isActive({ textAlign: 'right' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i
          className={classnames('ri-align-justify', {
            'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
          })}
        />
      </CustomIconButton>
      {/* <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='outlined'
        size='small'
        onClick={() => fileInputRef.current?.click()} // Open the file picker
      >
        <i
          className={classnames('ri-image-add-line', {
            'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
          })}
        />
      </CustomIconButton>

      <input
        type='file'
        accept='image/*' // Only accept image files
        ref={fileInputRef} // Reference to trigger file input programmatically
        style={{ display: 'none' }} // Hide the file input
        onChange={handleFileChange} // Handle file selection
      /> */}
    </div>
  )
}
