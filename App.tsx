
import React from 'react';
import { useStore } from './store';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ChatConsole from './components/ChatConsole';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

const App: React.FC = () => {
  const { projectId, viewMode } = useStore();

  if (!projectId) {
    return <Dashboard />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#0d0f12] overflow-hidden text-[#e6edf3]">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar fixa em todos os modos, exceto se for só Preview (opcional) */}
        {viewMode !== 'preview' && <FileExplorer />}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex overflow-hidden">
            {/* Editor condicional */}
            {(viewMode === 'split' || viewMode === 'code') && <Editor />}
            
            {/* Preview condicional */}
            {(viewMode === 'split' || viewMode === 'preview') && <Preview />}
          </div>

          {/* Terminal AI sempre na base se não for modo Preview Puro */}
          {viewMode !== 'preview' && <ChatConsole />}
        </div>
      </div>

      <footer className="h-6 bg-[#0d0f12] border-t border-[#30363d] px-3 flex items-center justify-between text-[9px] font-mono text-gray-600 shrink-0 z-50">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ENGINE: ESM_READY</span>
          <span className="uppercase">View: {viewMode}</span>
        </div>
        <div className="flex gap-4 uppercase font-bold text-gray-700">
          <span>React 19.0.0</span>
          <span>UTF-8</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
