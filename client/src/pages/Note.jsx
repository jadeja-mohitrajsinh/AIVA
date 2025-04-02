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
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Note = () => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('Untitled');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Untitled',
      date: 'Feb 28, 2025, 02:55 PM',
      content: ''
    }
  ]);
  
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`w-64 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Notes
            </h1>
            <button className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
              <span className="text-xl">+</span>
            </button>
          </div>
          
          {/* Notes List */}
          <div className="space-y-2">
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-3 rounded-lg cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-blue-900/20 hover:bg-blue-900/30' 
                    : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {note.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {note.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`text-xl font-medium bg-transparent border-none outline-none ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
            placeholder="Untitled"
          />
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* AI Input */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a topic for AI-generated content..."
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-100 border-gray-200'
              }`}
            />
            <button className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-4 py-2 border-b border-gray-200 space-x-4">
          <button className="font-bold">B</button>
          <button className="italic">I</button>
          <button className="font-mono">{`<>`}</button>
          <button>H1</button>
          <button>H2</button>
          <button>H3</button>
          <button>"</button>
          <button>•</button>
          <button>1.</button>
          <button>✓</button>
          <button>{`<>`}</button>
          <button>⊞</button>
          <button>⊟</button>
          <button>↺</button>
          <button>↻</button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto">
          <div className={`h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div 
              className={`max-w-4xl mx-auto p-8 min-h-full outline-none ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`} 
              contentEditable
            >
              {/* Note content goes here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;
