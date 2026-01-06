
import { create } from 'zustand';
import { IDEFile, Message } from './types';

export type ViewMode = 'split' | 'code' | 'preview';

interface IDEStore {
  projectId: string | null;
  projectName: string;
  files: IDEFile[];
  activeFilePath: string | null;
  openFilePaths: string[];
  viewMode: ViewMode;
  chatHistory: Message[];
  isGenerating: boolean;
  isSaving: boolean;
  
  // Actions
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setFiles: (files: IDEFile[]) => void;
  mergeFiles: (files: IDEFile[]) => void;
  addFile: (path: string, content?: string) => void;
  deleteFile: (path: string, isFolder?: boolean) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  moveFile: (oldPath: string, newPath: string) => void;
  updateFileContent: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
  closeFile: (path: string) => void;
  addChatMessage: (msg: Message) => void;
  setGenerating: (generating: boolean) => void;
  setSaving: (saving: boolean) => void;
  reset: () => void;
  
  // Helpers
  getFile: (path: string) => IDEFile | undefined;
}

export const useStore = create<IDEStore>((set, get) => ({
  projectId: null,
  projectName: "Novo Agente",
  viewMode: "split",
  files: [
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>AI Studio App</title>
  </head>
  <body class="bg-[#0d1117] text-white">
    <div id="root"></div>
  </body>
</html>`,
    },
    {
      path: "index.tsx",
      content: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Não foi possível encontrar o container root.");
}`,
    },
    {
      path: "App.tsx",
      content: `import React from "react";
import { Sparkles, Rocket, Cpu } from "lucide-react";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-white p-8 text-center">
      <div className="w-24 h-24 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/30 shadow-2xl">
        <Cpu size={48} />
      </div>
      
      <h1 className="text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tighter">
        Agente Pronto
      </h1>
      
      <p className="text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed text-xl">
        Seu ambiente de desenvolvimento React 19 está operante. 
        Use o terminal abaixo para solicitar mudanças ou criar novos componentes.
      </p>

      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all flex items-center gap-2">
          <Sparkles size={18} />
          Explorar IAs
        </button>
      </div>
    </div>
  );
}`,
    },
    {
      path: "metadata.json",
      content: `{
  "name": "AI Studio Project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "lucide-react": "latest"
  }
}`,
    }
  ],
  activeFilePath: "App.tsx",
  openFilePaths: ["App.tsx", "index.tsx", "index.html"],
  chatHistory: [],
  isGenerating: false,
  isSaving: false,

  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setViewMode: (viewMode) => set({ viewMode }),
  setFiles: (files) => set({ files }),
  
  mergeFiles: (newFiles) => set((state) => {
    const updatedFiles = [...state.files];
    newFiles.forEach(newFile => {
      const normalizedPath = newFile.path.replace(/^(src\/|public\/)/, '');
      const idx = updatedFiles.findIndex(f => f.path.replace(/^(src\/|public\/)/, '') === normalizedPath);
      
      if (idx !== -1) {
        updatedFiles[idx] = { ...newFile, path: normalizedPath };
      } else {
        updatedFiles.push({ ...newFile, path: normalizedPath });
      }
    });
    return { files: updatedFiles };
  }),

  addFile: (path, content = '') => set((state) => {
    if (state.files.some(f => f.path === path)) return state;
    return {
      files: [...state.files, { path, content }],
      activeFilePath: path,
      openFilePaths: Array.from(new Set([...state.openFilePaths, path]))
    };
  }),

  deleteFile: (path, isFolder = false) => set((state) => {
    const filteredFiles = state.files.filter(f => {
      if (isFolder) return !f.path.startsWith(path + '/') && f.path !== path;
      return f.path !== path;
    });

    const filteredOpen = state.openFilePaths.filter(p => {
      if (isFolder) return !p.startsWith(path + '/') && p !== path;
      return p !== path;
    });

    let nextActive = state.activeFilePath;
    if (isFolder && state.activeFilePath?.startsWith(path + '/')) {
      nextActive = filteredOpen[0] || null;
    } else if (!isFolder && state.activeFilePath === path) {
      nextActive = filteredOpen[0] || null;
    }

    return {
      files: filteredFiles,
      openFilePaths: filteredOpen,
      activeFilePath: nextActive
    };
  }),

  renameFile: (oldPath, newPath) => set((state) => {
    const files = state.files.map(f => f.path === oldPath ? { ...f, path: newPath } : f);
    const openFilePaths = state.openFilePaths.map(p => p === oldPath ? newPath : p);
    const activeFilePath = state.activeFilePath === oldPath ? newPath : state.activeFilePath;
    return { files, openFilePaths, activeFilePath };
  }),

  moveFile: (oldPath, newPath) => set((state) => {
    if (oldPath === newPath) return state;
    if (state.files.some(f => f.path === newPath)) return state;
    return {
      files: state.files.map(f => f.path === oldPath ? { ...f, path: newPath } : f),
      openFilePaths: state.openFilePaths.map(p => p === oldPath ? newPath : p),
      activeFilePath: state.activeFilePath === oldPath ? newPath : state.activeFilePath
    };
  }),

  updateFileContent: (path, content) => set((state) => ({
    files: state.files.map(f => f.path === path ? { ...f, content } : f)
  })),
  
  setActiveFile: (path) => set((state) => ({ 
    activeFilePath: path,
    openFilePaths: Array.from(new Set([...state.openFilePaths, path]))
  })),

  closeFile: (path) => set((state) => {
    const newOpenPaths = state.openFilePaths.filter(p => p !== path);
    let newActive = state.activeFilePath;
    if (state.activeFilePath === path) {
      newActive = newOpenPaths[newOpenPaths.length - 1] || null;
    }
    return { openFilePaths: newOpenPaths, activeFilePath: newActive };
  }),
  
  addChatMessage: (msg) => set((state) => ({ 
    chatHistory: [...state.chatHistory, msg] 
  })),
  
  setGenerating: (isGenerating) => set({ isGenerating }),
  setSaving: (isSaving) => set({ isSaving }),
  
  reset: () => set({
    projectId: null,
    projectName: 'Novo Agente',
    chatHistory: [],
    isGenerating: false,
    activeFilePath: 'App.tsx',
    openFilePaths: ['App.tsx', 'index.tsx', 'index.html'],
    viewMode: 'split'
  }),

  getFile: (path) => get().files.find(f => f.path === path),
}));
