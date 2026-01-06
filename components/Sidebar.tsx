
import React from 'react';
import { Project } from '../types';
import { FolderIcon, FileTextIcon, PlusIcon, MoreVerticalIcon } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, activeProjectId, onSelectProject, onAddProject }) => {
  return (
    <aside className="w-64 bg-[#1a1d23] border-r border-[#2d333b] flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Projetos</h2>
        <button 
          onClick={onAddProject}
          className="p-1.5 hover:bg-[#2d333b] rounded-md transition-colors text-blue-400"
          title="Novo Projeto"
        >
          <PlusIcon size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`
              flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all group
              ${activeProjectId === project.id ? 'bg-[#2d333b] text-white' : 'text-gray-400 hover:bg-[#24292e] hover:text-gray-200'}
            `}
          >
            <div className="flex-shrink-0">
              {project.id === 'root' ? <FolderIcon size={16} /> : <FileTextIcon size={16} />}
            </div>
            <span className="truncate text-sm font-medium flex-1">{project.name}</span>
            <MoreVerticalIcon 
              size={14} 
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity" 
            />
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#2d333b]">
        <div className="flex items-center gap-3 p-2 rounded-md bg-[#24292e]">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">User Studio</span>
            <span className="text-xs text-gray-500 truncate">Settings</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
