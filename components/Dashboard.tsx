
import React, { useState } from 'react';
import { useStore } from '../store';
import { saveProject, getProjectFiles } from '../services/api';
import { PlusCircleIcon, Loader2Icon, SparklesIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setProjectId, setProjectName, setFiles, setActiveFile, files: currentFiles } = useStore();

  const handleCreateProject = async () => {
    setIsLoading(true);
    try {
      const defaultName = "Novo Agente " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const { id } = await saveProject(defaultName, currentFiles);
      
      // Busca arquivos iniciais que o servidor pode ter gerado por padrão
      const initialFiles = await getProjectFiles(id);
      
      setProjectId(id);
      setProjectName(defaultName);
      
      if (initialFiles && initialFiles.length > 0) {
        setFiles(initialFiles);
        setActiveFile(initialFiles[0].path);
      }
      
      console.log('Projeto inicializado com sucesso. ID:', id);
    } catch (error: any) {
      console.error('Falha na inicialização do projeto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0d0f12] text-[#e6edf3] p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <SparklesIcon size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agent Studio</h1>
          <p className="text-gray-500 text-sm">
            Crie, edite e teste seus agentes inteligentes em tempo real com nossa IDE integrada.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleCreateProject}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2Icon size={20} className="animate-spin" />
            ) : (
              <PlusCircleIcon size={20} />
            )}
            <span>Criar Novo Projeto</span>
          </button>

          <div className="pt-8 border-t border-[#1c2128]">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600 mb-4">Conectado a</p>
            <div className="bg-[#161b22] p-3 rounded-lg border border-[#30363d] flex items-center justify-between">
              <span className="text-[11px] font-mono text-blue-400 truncate max-w-[200px]">lineable-maricela-primly.ngrok-free.dev</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
