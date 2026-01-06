
import React from 'react';
import { useStore, ViewMode } from '../store';
import { saveProject } from '../services/api';
import { 
  SaveIcon, 
  Loader2Icon, 
  ArrowLeftIcon, 
  LayoutIcon, 
  CodeIcon, 
  EyeIcon, 
  ColumnsIcon 
} from 'lucide-react';

const Header: React.FC = () => {
  const { 
    projectId, 
    projectName, 
    setProjectName, 
    files, 
    isSaving, 
    setSaving,
    viewMode,
    setViewMode,
    reset 
  } = useStore();

  const handleManualSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await saveProject(projectName, files, projectId);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const modes: { id: ViewMode; icon: any; label: string }[] = [
    { id: 'code', icon: CodeIcon, label: 'Code' },
    { id: 'split', icon: ColumnsIcon, label: 'Split' },
    { id: 'preview', icon: EyeIcon, label: 'Preview' },
  ];

  return (
    <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-4 overflow-hidden">
        <button 
          onClick={reset}
          className="p-2 hover:bg-[#2d333b] rounded-lg text-gray-400 transition-colors"
          title="Voltar ao Dashboard"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div className="h-6 w-[1px] bg-[#30363d]"></div>
        <div className="flex flex-col">
          <input 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-sm font-semibold focus:outline-none focus:text-blue-400 transition-colors truncate max-w-[150px]"
          />
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter truncate">
            {projectId || 'Sessão Local'}
          </span>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-lg p-1 gap-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            className={`
              flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
              ${viewMode === m.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            <m.icon size={12} />
            <span className="hidden md:inline">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleManualSave}
          disabled={isSaving || !projectId}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
            ${isSaving 
              ? 'bg-gray-700 text-gray-400' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:scale-95'}
          `}
        >
          {isSaving ? <Loader2Icon size={14} className="animate-spin" /> : <SaveIcon size={14} />}
          <span>Salvar Projeto</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
