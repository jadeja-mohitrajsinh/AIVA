/*=================================================================
* Project: AIVA-WEB
* File: Button.jsx
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Button component for displaying buttons.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEditor, FloatingMenu } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { FiPlus, FiTrash2, FiBold, FiItalic, FiList, FiCode, FiCheckSquare, FiImage, FiDelete, FiRotateCcw, FiRotateCw } from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';
import { RxHeading, RxQuote } from 'react-icons/rx';
import { TbListNumbers, TbTable } from 'react-icons/tb';
import { toast, Toaster } from 'sonner';
import { useGetWorkspaceNotesQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } from '../redux/slices/api/noteApiSlice';
import { LoadingSpinner } from '../components/shared/feedback/LoadingSpinner';
import { debounce } from 'lodash';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { FaStickyNote, FaSearch } from 'react-icons/fa';
import { Transition, Fragment } from 'react';

// Update Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyB0CGJLI9NU_IVAnMUYv8IZT7DWtO9bbas';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Update the TEMPLATES configuration
const TEMPLATES = {
  "table": (dimensions) => {
    const [rows, cols] = dimensions.split('x').map(num => parseInt(num.trim())) || [3, 3];
    return `
<div class="generated-content prose dark:prose-invert max-w-none">
  <h3>Generated ${rows}x${cols} Table</h3>
  <table class="border-collapse table-auto w-full my-4">
    <tr>
      ${Array(cols).fill(0).map((_, i) => `
      <th class="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-2 text-left">Header ${i + 1}</th>`).join('')}
  </tr>
    ${Array(rows).fill(0).map((_, i) => `
    <tr>
      ${Array(cols).fill(0).map((_, j) => `
      <td class="border border-gray-300 dark:border-gray-600 p-2">Cell ${i + 1}-${j + 1}</td>`).join('')}
    </tr>`).join('')}
</table>
</div>`;
  },

  "code": (language, code) => `
<div class="generated-content prose dark:prose-invert max-w-none">
  <pre class="relative bg-gray-100 dark:bg-gray-800 rounded-lg my-4 overflow-x-auto">
    <div class="absolute top-0 right-0 px-4 py-2 rounded-tr-lg rounded-bl-lg text-xs font-mono bg-blue-500 text-white">${language}</div>
    <code class="block language-${language} p-4 pt-8 text-sm font-mono whitespace-pre">${code}</code>
  </pre>
</div>`,

  "list": (items, type = 'bullet') => `
<div class="generated-content prose dark:prose-invert max-w-none">
  ${type === 'bullet' ? '<ul>' : '<ol>'}
    ${items.map(item => `<li>${item}</li>`).join('\n    ')}
  ${type === 'bullet' ? '</ul>' : '</ol>'}
</div>`,

  "task": (items) => `
<div class="generated-content prose dark:prose-invert max-w-none">
<ul data-type="taskList">
    ${items.map(item => `<li data-type="taskItem" data-checked="false">${item}</li>`).join('\n    ')}
    </ul>
</div>`
};

// Update the THEME configuration
const THEME = {
  light: {
    // Background colors
    mainBg: 'bg-gray-50',
    sidebarBg: 'bg-white',
    headerBg: 'bg-white',
    editorBg: 'bg-white',
    inputBg: 'bg-gray-50',
    
    // Text colors
    primaryText: 'text-gray-900',
    secondaryText: 'text-gray-600',
    mutedText: 'text-gray-400',
    
    // Border colors
    border: 'border-gray-200',
    
    // Interactive elements
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonDisabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
    noteHover: 'hover:bg-gray-50',
    noteSelected: 'bg-blue-50',
    
    // Input elements
    input: 'bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900',
    inputPlaceholder: 'placeholder-gray-400',
    
    // Editor specific
    editorToolbar: 'bg-white border-gray-200',
    proseMirror: 'prose max-w-none text-gray-900',
    
    // Utility
    divider: 'bg-gray-200',
    shadow: 'shadow-sm',
    highlight: 'ring-2 ring-blue-500',
  },
  dark: {
    // Background colors
    mainBg: 'bg-[#0f172a]',
    sidebarBg: 'bg-[#1e293b]',
    headerBg: 'bg-[#1e293b]',
    editorBg: 'bg-[#0f172a]',
    inputBg: 'bg-[#1e293b]',
    
    // Text colors
    primaryText: 'text-white',
    secondaryText: 'text-gray-300',
    mutedText: 'text-gray-500',
    
    // Border colors
    border: 'border-[#334155]',
    
    // Interactive elements
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonDisabled: 'bg-gray-700 text-gray-500 cursor-not-allowed',
    noteHover: 'hover:bg-[#2d3b54]',
    noteSelected: 'bg-[#2d3b54]',
    
    // Input elements
    input: 'bg-[#1e293b] border-[#334155] focus:border-blue-500 text-white',
    inputPlaceholder: 'placeholder-gray-500',
    
    // Editor specific
    editorToolbar: 'bg-[#1e293b] border-[#334155]',
    proseMirror: 'prose prose-invert max-w-none text-gray-100',
    
    // Utility
    divider: 'bg-[#334155]',
    shadow: 'shadow-md shadow-black/10',
    highlight: 'ring-2 ring-blue-500',
  },
};

const MenuBar = ({ editor, isDarkMode, theme }) => {
  if (!editor) {
    return null;
  }

  const buttonBaseClass = "p-2 rounded-md transition-all duration-200";
  const buttonClass = `${buttonBaseClass} ${theme.secondaryText} hover:${theme.noteHover.replace('hover:', '')}`;
  const activeButtonClass = `${buttonBaseClass} bg-blue-600 text-white`;

  const addImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const handleKeyboardShortcut = (e, callback) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      callback();
    }
  };

  return (
    <div className={`flex items-center gap-1.5 p-2 ${theme.editorToolbar} rounded-md transition-colors duration-300`}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        onKeyDown={(e) => handleKeyboardShortcut(e, () => editor.chain().focus().toggleBold().run())}
        className={editor.isActive('bold') ? activeButtonClass : buttonClass}
        title="Bold (Ctrl+B)"
      >
        <FiBold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        onKeyDown={(e) => handleKeyboardShortcut(e, () => editor.chain().focus().toggleItalic().run())}
        className={editor.isActive('italic') ? activeButtonClass : buttonClass}
        title="Italic (Ctrl+I)"
      >
        <FiItalic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? activeButtonClass : buttonClass}
        title="Strikethrough"
      >
        <FiDelete className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? activeButtonClass : buttonClass}
        title="Inline Code"
      >
        <FiCode className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? activeButtonClass : buttonClass}
        title="Heading 1"
      >
        <span className="text-base font-semibold">H1</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? activeButtonClass : buttonClass}
        title="Heading 2"
      >
        <span className="text-base font-semibold">H2</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? activeButtonClass : buttonClass}
        title="Heading 3"
      >
        <span className="text-base font-semibold">H3</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? activeButtonClass : buttonClass}
        title="Quote"
      >
        <RxQuote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? activeButtonClass : buttonClass}
        title="Bullet List"
      >
        <FiList className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? activeButtonClass : buttonClass}
        title="Numbered List"
      >
        <TbListNumbers className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={editor.isActive('taskList') ? activeButtonClass : buttonClass}
        title="Task List"
      >
        <FiCheckSquare className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? activeButtonClass : buttonClass}
        title="Code Block"
      >
        <FiCode className="w-4 h-4" />
      </button>
      <button
        onClick={addImage}
        className={editor.isActive('image') ? activeButtonClass : buttonClass}
        title="Insert Image"
      >
        <FiImage className="w-4 h-4" />
      </button>
      <button
        onClick={addTable}
        className={editor.isActive('table') ? activeButtonClass : buttonClass}
        title="Insert Table"
      >
        <TbTable className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${buttonClass} ${!editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Undo (Ctrl+Z)"
      >
        <FiRotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${buttonClass} ${!editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Redo (Ctrl+Shift+Z)"
      >
        <FiRotateCw className="w-4 h-4" />
      </button>
    </div>
  );
};

const Notes = () => {
  const { workspaceId } = useParams();
  const [selectedNote, setSelectedNote] = useState(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const currentTheme = THEME[isDarkMode ? 'dark' : 'light'];

  const { data: notesData, isLoading, error, refetch } = useGetWorkspaceNotesQuery(workspaceId, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true
  });

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000);

    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    const initializeDefaultNote = async () => {
      if (isLoading || !notesData) {
        return;
      }

      if ((!notesData.notes || notesData.notes.length === 0) && !selectedNote) {
        try {
          const result = await createNote({
            workspaceId,
            title: 'Untitled',
            content: '<h1>Welcome to your new note!</h1><p>Start writing here...</p>'
          }).unwrap();
          
          if (result.status) {
            setSelectedNote(result.data._id);
            toast.success('Created your first note!');
          }
        } catch (err) {
          toast.error('Failed to create default note');

          //console.error('Error creating default note:', err);

        }
      } else if (notesData.notes && notesData.notes.length > 0 && !selectedNote) {
        const mostRecentNote = notesData.notes.sort((a, b) => 
          new Date(b.lastModified || b.updatedAt) - new Date(a.lastModified || a.updatedAt)
        )[0];
        setSelectedNote(mostRecentNote._id);
      }
    };

    initializeDefaultNote();
  }, [notesData, selectedNote, isLoading, createNote, workspaceId]);

  const handleManualSave = async () => {
    if (!selectedNote || !editor || isUpdating) return;
    
    setIsSaving(true);
    try {
      const result = await updateNote({
        noteId: selectedNote,
        content: editor.getHTML(),
        lastModified: new Date()
      }).unwrap();
      
      if (result.status) {
        toast.success('Changes saved successfully');
      } else {
        throw new Error(result.message || 'Failed to save changes');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save changes');

      //console.error('Manual save error:', error);

    } finally {
      setIsSaving(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: true,
        orderedList: true,
        listItem: true,
        blockquote: true,
        code: {
          HTMLAttributes: {
            class: 'inline-code'
          }
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block-wrapper'
          },
          renderHTML({ node }) {
            return [
              'div',
              { class: 'code-block-wrapper' },
              [
                'div',
                { class: 'code-block-header' },
                node.attrs.language || 'text'
              ],
              [
                'pre',
                { class: 'code-block-content' },
                [
                  'code',
                  {},
                  node.textContent
                ]
              ]
            ]
          }
        }
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        inline: true
      }),
      Placeholder.configure({
        placeholder: 'Start writing...'
      })
    ],
    content: '',
    autofocus: 'end',
    editable: true,
    injectCSS: true,
    editorProps: {
      attributes: {
        class: 'editor-container'
      }
    }
  });

  useEffect(() => {
    if (editor && selectedNote) {
      const note = notesData?.notes?.find(note => note._id === selectedNote);
      if (note?.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [selectedNote, editor, notesData]);

  // Auto-save effect
  useEffect(() => {
    if (!editor || !selectedNote) return;

    const debouncedAutoSave = debounce(async (content) => {
      try {
        setIsSaving(true);
        const result = await updateNote({
          noteId: selectedNote,
          content: content,
          lastModified: new Date()
        }).unwrap();
        
        if (result.status) {
          setLastSaved(new Date());
        }
      } catch (error) {

        //console.error('Auto-save error:', error);

        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 5000);

    // Subscribe to editor changes and store the unsubscribe function
    const unsubscribe = editor.on('update', () => {
      debouncedAutoSave(editor.getHTML());
    });

    // Cleanup function
    return () => {
      // Cancel any pending auto-saves
      debouncedAutoSave.cancel();
      
      // Only call unsubscribe if it's a function
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [editor, selectedNote, updateNote]);

  const handleCreateNewNote = async () => {
    if (isCreating) return;

    try {
      const result = await createNote({
        workspaceId,
        title: 'Untitled',
        content: '<h1>New Note</h1><p>Start writing here...</p>'
      }).unwrap();
      
      if (result.status) {
        setSelectedNote(result.data._id);
        toast.success('New note created');
      } else {
        throw new Error(result.message || 'Failed to create note');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create note');

      //console.error('Error creating note:', err);

    }
  };

  const handleDeleteNote = async (noteId) => {
    if (isDeleting) return;

    try {
      const result = await deleteNote(noteId).unwrap();
      if (result.status) {
        if (selectedNote === noteId) {
          setSelectedNote(null);
        }
        toast.success('Note deleted');
      } else {
        throw new Error(result.message || 'Failed to delete note');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete note');

      //console.error('Error deleting note:', err);

    }
  };

  const handleUpdateNoteTitle = async (noteId, newTitle) => {
    if (isUpdating) return;

    try {
      const result = await updateNote({
        noteId,
        title: newTitle,
        lastModified: new Date()
      }).unwrap();
      
      if (result.status) {
        refetch();
      } else {
        throw new Error(result.message || 'Failed to update note title');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update note title');

      //console.error('Error updating note title:', err);

    }
  };

  const generateContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsAiGenerating(true);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a brief, concise response for: ${aiPrompt}

Instructions:
1. Keep the response short and to the point
2. For simple greetings or basic phrases, just return the phrase with a brief explanation
3. For technical topics, provide a short, practical example
4. Use minimal formatting, only when necessary:
   - Use <h2> for main heading
   - Use <p> for text
   - Use <pre><code> for code blocks
   - Use <ul> or <ol> for lists only when needed
5. No need for extensive sections or detailed explanations
6. Limit response to 2-3 paragraphs maximum

Example format:
<div class="generated-content prose dark:prose-invert max-w-none">
  <h2>Topic</h2>
  <p>Brief explanation</p>
  <pre><code>Code example (if needed)</code></pre>
</div>`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      let content = data.candidates[0].content.parts[0].text;

      // Ensure content is wrapped in the main container div if not already
      if (!content.includes('class="generated-content')) {
        content = `<div class="generated-content prose dark:prose-invert max-w-none">${content}</div>`;
      }
        
        if (editor) {
        editor.commands.setContent(content);
        await updateNote({
            noteId: selectedNote,
          content: content,
            lastModified: new Date()
          });
        
        setAiPrompt('');
        toast.success('Content generated successfully!');
      }
    } catch (error) {

      //console.error('Error generating content:', error);

      toast.error(error.message || 'Failed to generate content');
    } finally {
    setIsAiGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">Failed to load notes</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const notes = notesData?.notes || [];

  return (
    <div className={`h-screen flex flex-col ${currentTheme.mainBg}`}>
      {/* Top Navigation Bar */}
      <div className={`flex-none h-14 ${currentTheme.headerBg} border-b ${currentTheme.border}`}>
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <FaStickyNote className="text-blue-500 w-5 h-5" />
            <h1 className={`text-lg font-semibold ${currentTheme.primaryText}`}>Notes</h1>
          </div>
          <button
            onClick={handleCreateNewNote}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${currentTheme.buttonPrimary}`}
          >
            <FiPlus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className={`w-72 flex flex-col ${currentTheme.sidebarBg} border-r ${currentTheme.border}`}>
          {/* Search Bar */}
          <div className={`p-3 border-b ${currentTheme.border}`}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                className={`w-full pl-9 pr-4 py-2 rounded-md border text-sm transition-colors duration-200 ${currentTheme.input} ${currentTheme.inputPlaceholder}`}
              />
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${currentTheme.mutedText}`} />
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
          {notes.map(note => (
            <div
              key={note._id}
              onClick={() => setSelectedNote(note._id)}
                className={`group border-b ${currentTheme.border} transition-colors duration-200 ${
                  selectedNote === note._id
                    ? currentTheme.noteSelected
                    : currentTheme.noteHover
                }`}
              >
                <div className="px-4 py-3 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm truncate ${
                      selectedNote === note._id
                        ? currentTheme.primaryText
                        : currentTheme.secondaryText
                    }`}>
                      {note.title || 'Untitled'}
                    </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note._id);
                  }}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 ${currentTheme.mutedText}`}
                >
                      <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
                  <p className={`text-xs mt-1 ${currentTheme.mutedText}`}>
                {new Date(note.lastModified || note.updatedAt).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
                </div>
            </div>
          ))}
        </div>
      </div>

        {/* Editor Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${currentTheme.editorBg}`}>
          {selectedNote ? (
            <>
              {/* Editor Header */}
              <div className={`flex-none border-b ${currentTheme.border}`}>
                {/* Title and Save Status */}
                <div className="px-6 py-3 flex items-center justify-between">
              <input
                type="text"
                defaultValue={notesData?.notes?.find(n => n._id === selectedNote)?.title || ''}
                onBlur={(e) => handleUpdateNoteTitle(selectedNote, e.target.value)}
                    className={`text-lg font-semibold bg-transparent border-none rounded focus:ring-2 focus:ring-blue-500 w-full max-w-2xl ${currentTheme.primaryText} ${currentTheme.inputPlaceholder}`}
                placeholder="Untitled"
              />
                  <div className="flex items-center gap-3">
                    {isSaving ? (
                      <span className={`text-sm ${currentTheme.mutedText}`}>Saving...</span>
                    ) : lastSaved && (
                      <span className={`text-sm ${currentTheme.mutedText}`}>
                        Last saved {new Date(lastSaved).toLocaleTimeString()}
                      </span>
                    )}
            <button
              onClick={handleManualSave}
              disabled={isSaving}
                      className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors duration-200 ${
                        isSaving ? currentTheme.buttonDisabled : currentTheme.buttonPrimary
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

                {/* Menu Bar */}
                {editor && (
                  <div className={`px-6 py-1 border-t ${currentTheme.border}`}>
                    <MenuBar 
                      editor={editor} 
                      isDarkMode={isDarkMode} 
                      theme={currentTheme} 
                    />
                  </div>
                )}

                {/* AI Generation Bar */}
                <div className={`px-6 py-3 border-t ${currentTheme.border}`}>
                  <div className="flex gap-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter a topic for AI-generated content..."
                      className={`flex-1 px-4 py-2 rounded-md border text-sm transition-colors duration-200 ${currentTheme.input} ${currentTheme.inputPlaceholder}`}
                  />
                  <button
                    onClick={generateContent}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors duration-200 ${
                      isAiGenerating || !aiPrompt.trim()
                        ? currentTheme.buttonDisabled
                          : currentTheme.buttonPrimary
                    }`}
                  >
                      <BiBrain className="w-4 h-4" />
                    {isAiGenerating ? 'Generating...' : 'Generate'}
                  </button>
                  </div>
                </div>
              </div>
              
              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-4">
                  <EditorContent
                    editor={editor}
                    className={`${currentTheme.proseMirror} min-h-[calc(100vh-16rem)] focus:outline-none`}
                  />
                </div>
            </div>
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${currentTheme.mutedText}`}>
              <div className="text-center">
                <FaStickyNote className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg">Select a note or create a new one</p>
          </div>
        </div>
          )}
      </div>
      </div>
    </div>
  );
};

export default Notes; 