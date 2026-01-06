
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { 
  FileCodeIcon, 
  FolderIcon, 
  FolderOpenIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  FilePlusIcon,
  FolderPlusIcon,
  Trash2Icon,
  Edit2Icon,
  CopyIcon,
  FileTypeIcon,
  FileJsonIcon,
  Code2Icon,
  LayoutIcon,
  PaletteIcon,
  AtomIcon
} from 'lucide-react';

interface FileTree {
  [key: string]: {
    type: 'file' | 'folder';
    fullPath: string;
    children?: FileTree;
  };
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return <AtomIcon size={12} className="text-blue-400" />;
    case 'ts':
    case 'js':
      return <FileCodeIcon size={12} className="text-yellow-500" />;
    case 'json':
      return <FileJsonIcon size={12} className="text-orange-400" />;
    case 'html':
      return <LayoutIcon size={12} className="text-orange-500" />;
    case 'css':
      return <PaletteIcon size={12} className="text-blue-500" />;
    default:
      return <Code2Icon size={12} className="text-gray-400" />;
  }
};

const FileExplorer: React.FC = () => {
  const { files, activeFilePath, setActiveFile, addFile, deleteFile, renameFile } = useStore();
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['components']));
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((isCreating || renamingPath) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating, renamingPath]);

  const toggleFolder = (path: string) => {
    const newOpen = new Set(openFolders);
    if (newOpen.has(path)) newOpen.delete(path);
    else newOpen.add(path);
    setOpenFolders(newOpen);
  };

  const buildTree = (): FileTree => {
    const tree: FileTree = {};
    files.forEach((file) => {
      const parts = file.path.split('/');
      let current = tree;
      let pathAcc = '';
      parts.forEach((part, index) => {
        pathAcc = pathAcc ? `${pathAcc}/${part}` : part;
        const isLast = index === parts.length - 1;
        if (!current[part]) {
          current[part] = { type: isLast ? 'file' : 'folder', fullPath: pathAcc, children: isLast ? undefined : {} };
        }
        if (!isLast) current = current[part].children!;
      });
    });
    return tree;
  };

  const handleCreate = () => {
    if (!newItemName.trim()) { setIsCreating(null); return; }
    let finalPath = newItemName.trim();
    if (isCreating === 'folder') addFile(`${finalPath}/.keep`, '');
    else addFile(finalPath, '');
    setNewItemName('');
    setIsCreating(null);
  };

  const handleRename = () => {
    if (!newItemName.trim() || !renamingPath) { setRenamingPath(null); return; }
    renameFile(renamingPath, newItemName.trim());
    setNewItemName('');
    setRenamingPath(null);
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const renderTree = (tree: FileTree, level = 0) => {
    const entries = Object.entries(tree).sort((a, b) => {
      if (a[1].type !== b[1].type) return a[1].type === 'folder' ? -1 : 1;
      return a[0].localeCompare(b[0]);
    });

    return entries.map(([name, node]) => {
      if (name === '.keep') return null;
      const isFolder = node.type === 'folder';
      const isOpen = openFolders.has(node.fullPath);
      const isActive = activeFilePath === node.fullPath;
      const isRenaming = renamingPath === node.fullPath;

      if (isRenaming) {
        return (
          <div key={node.fullPath} className="px-3 py-1 bg-blue-500/10 border-l-2 border-blue-500">
             <input
                ref={inputRef}
                className="w-full bg-transparent text-[11px] outline-none text-blue-400"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenamingPath(null); }}
                onBlur={handleRename}
             />
          </div>
        );
      }

      return (
        <div key={node.fullPath}>
          <div
            onClick={() => isFolder ? toggleFolder(node.fullPath) : setActiveFile(node.fullPath)}
            className={`
              group flex items-center gap-1.5 px-3 py-1 cursor-pointer text-[11px] transition-all
              ${isActive ? 'bg-blue-600/10 text-blue-300 border-l-2 border-blue-500' : 'text-gray-500 hover:bg-[#161b22] hover:text-gray-200'}
            `}
            style={{ paddingLeft: `${(level * 12) + 12}px` }}
          >
            {isFolder ? (isOpen ? <ChevronDownIcon size={10} /> : <ChevronRightIcon size={10} />) : <div className="w-2.5" />}
            {isFolder ? (isOpen ? <FolderOpenIcon size={12} className="text-indigo-400/80" /> : <FolderIcon size={12} className="text-indigo-400/80" />) : getFileIcon(name)}
            <span className="truncate flex-1 tracking-tight">{name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
               <CopyIcon size={10} className="hover:text-blue-400" onClick={(e) => { e.stopPropagation(); copyPath(node.fullPath); }} />
               <Edit2Icon size={10} className="hover:text-amber-400" onClick={(e) => { e.stopPropagation(); setRenamingPath(node.fullPath); setNewItemName(node.fullPath); }} />
               <Trash2Icon size={10} className="hover:text-red-400" onClick={(e) => { e.stopPropagation(); if (confirm(`Deletar ${name}?`)) deleteFile(node.fullPath, isFolder); }} />
            </div>
          </div>
          {isFolder && isOpen && node.children && renderTree(node.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="w-64 bg-[#0d0f12] border-r border-[#1c2128] flex flex-col h-full shrink-0">
      <div className="p-4 flex items-center justify-between border-b border-[#1c2128] bg-[#161b22]/50">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">Explorador</span>
        <div className="flex gap-2">
          <button onClick={() => { setIsCreating('file'); setNewItemName(''); }} title="Novo Arquivo"><FilePlusIcon size={14} className="text-gray-500 hover:text-blue-400" /></button>
          <button onClick={() => { setIsCreating('folder'); setNewItemName(''); }} title="Nova Pasta"><FolderPlusIcon size={14} className="text-gray-500 hover:text-blue-400" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        {isCreating && (
          <div className="px-3 py-1 mb-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <input ref={inputRef} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(null); }} className="w-full bg-transparent text-[11px] outline-none text-blue-300" placeholder="Nome..." />
          </div>
        )}
        {renderTree(buildTree())}
      </div>
    </div>
  );
};

export default FileExplorer;
