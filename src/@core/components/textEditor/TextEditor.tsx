import React from 'react'

import { Box, Card, CardContent } from '@mui/material'
import { Editor } from '@tinymce/tinymce-react'

import '@/libs/styles/tiptapEditor.css'

type TextEditorProps = {
  placeholder?: string
  onChange: (content: string) => void
  value: string
  className?: string
  height?: string
}

const TextEditor: React.FC<TextEditorProps> = ({ placeholder, onChange, value, className, height = '600px' }) => {
  return (
    <Card className={`p-0 border shadow-none ${className || ''}`}>
      <CardContent className='p-0'>
        <Box sx={{ direction: 'ltr !important' }}>
          <Editor
            tinymceScriptSrc='/js/tinymce/tinymce.min.js'
            onEditorChange={onChange}
            value={value}
            init={{
              placeholder: placeholder,
              selector: 'textarea#open-source-plugins',
              plugins:
                'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
              imagetools_cors_hosts: ['picsum.photos'],
              menubar: 'file edit view insert format tools table help',
              toolbar:
                'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview save print | insertfile image media template link anchor codesample | ltr rtl',
              toolbar_sticky: true,
              autosave_ask_before_unload: true,
              directionality: 'rtl',
              autosave_interval: '30s',
              autosave_prefix: '{path}{query}-{id}-',
              autosave_restore_when_empty: false,
              autosave_retention: '2m',
              templates: [
                {
                  title: 'New Table',
                  description: 'creates a new table',
                  content:
                    '<div class="mceTmpl"><table width="98%%" border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>'
                },
                {
                  title: 'Starting my story',
                  description: 'A cure for writers block',
                  content: 'Once upon a time...'
                },
                {
                  title: 'New list with dates',
                  description: 'New List with dates',
                  content:
                    '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>'
                }
              ],
              template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
              template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
              height: height,
              image_caption: true,
              quickbars_selection_toolbar: 'bold italic | h1 h2 h3 h4 h5 h6 | link blockquote quickimage quicktable',
              noneditable_noneditable_class: 'mceNonEditable',
              toolbar_mode: 'sliding',
              contextmenu: 'link image imagetools table',
              skin: 'oxide',
              content_css: 'default',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default TextEditor
