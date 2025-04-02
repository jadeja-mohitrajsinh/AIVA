/*=================================================================
* Project: AIVA-WEB
* File: NoteEditor.jsx
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* NoteEditor component for displaying the note editor.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useUpdateNoteMutation } from '../../redux/slices/api/noteApiSlice';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const colors = [
  '#000000', // black
  '#FF0000', // red
  '#00FF00', // green
  '#0000FF', // blue
  '#FFA500', // orange
  '#800080', // purple
  '#FFC0CB', // pink
  '#A52A2A', // brown
];

const ColorSelector = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 mb-2">
      {colors.map(color => (
        <button
          key={color}
          onClick={() => editor.chain().focus().setColor(color).run()}
          className={`w-6 h-6 rounded-full border border-gray-300 ${
            editor.isActive('textStyle', { color }) ? 'ring-2 ring-offset-2 ring-blue-500' : ''
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <button
        onClick={() => editor.chain().focus().unsetColor().run()}
        className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        title="Remove color"
      >
        Clear
      </button>
    </div>
  );
};

const NoteEditor = ({ note, workspaceId }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [updateNote] = useUpdateNoteMutation();
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave({ content: html });
    },
  });

  const debouncedSave = useCallback(
    debounce(async (updates) => {
      if (!note?._id || !workspaceId) return;

      setIsSaving(true);
      try {
        await updateNote({
          noteId: note._id,
          workspaceId,
          updates
        }).unwrap();
        toast.success('Changes saved', {
          duration: 1000,
          position: 'bottom-right'
        });
      } catch (error) {
        toast.error('Failed to save changes');

        //.error('Auto-save error:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [note?._id, workspaceId]
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleContentChange = ({ editor }) => {
    const html = editor.getHTML();
    debouncedSave({ content: html });
  };

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return (
    <div className="border rounded-lg p-4">
      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
        className="w-full text-2xl font-bold mb-4 p-2 border-b focus:outline-none focus:border-blue-500"
      />

      {/* Toolbar */}
      <div className="border-b pb-2 mb-4">
        <ColorSelector editor={editor} />
      </div>

      {/* Editor */}
      <div className="relative">
        {isSaving && (
          <div className="absolute top-2 right-2 text-sm text-gray-500">
            Saving...
          </div>
        )}
        <EditorContent 
          editor={editor} 
          className="prose max-w-none min-h-[300px]"
        />
      </div>
    </div>
  );
};

export default NoteEditor; 