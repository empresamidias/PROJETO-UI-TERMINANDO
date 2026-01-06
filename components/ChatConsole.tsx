
import React, { useState } from 'react';
import { useStore } from '../store';
import { generateCode } from '../services/api';
import { SparklesIcon, SendIcon, Loader2Icon, ZapIcon } from 'lucide-react';

const SUGGESTIONS = [
  "Adicionar filtro de data",
  "Otimizar para mobile",
  "Trocar para Dark Mode",
  "Criar gráfico com Recharts",
  "Adicionar animações Framer"
];

const ChatConsole: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { 
    projectId, 
    chatHistory, 
    addChatMessage, 
    isGenerating, 
    setGenerating, 
    mergeFiles 
  } = useStore();

  const handleCommand = async (text: string) => {
    if (!text.trim() || isGenerating || !projectId) return;

    const userPrompt = text.trim();
    setPrompt('');
    setGenerating(true);

    // Adiciona mensagem do usuário ao histórico visual
    addChatMessage({ role: 'user', content: userPrompt, timestamp: Date.now() });

    try {
      const novosArquivos = await generateCode(userPrompt, chatHistory, projectId);
      
      if (novosArquivos && novosArquivos.length > 0) {
        mergeFiles(novosArquivos);
        addChatMessage({ 
          role: 'assistant', 
          content: "Comando executado com sucesso. Apliquei as alterações ao projeto.", 
          timestamp: Date.now() 
        });
      } else {
        addChatMessage({ 
          role: 'assistant', 
          content: "O comando foi processado, mas não detectei mudanças estruturais necessárias.", 
          timestamp: Date.now() 
        });
      }
    } catch (error: any) {
      console.error(error);
      addChatMessage({ 
        role: 'assistant', 
        content: `Erro na API: ${error.message || "Não foi possível processar o comando."}`, 
        timestamp: Date.now() 
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-56 border-t border-[#1c2128] bg-[#0d0f12] flex flex-col p-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40">
      {/* Mensagens e Histórico */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 scrollbar-hide">
        {chatHistory.length === 0 && !isGenerating && (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-1 opacity-50">
            <SparklesIcon size={14} />
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold">Terminal Inteligente</p>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`text-[11px] leading-relaxed flex gap-2 ${msg.role === 'user' ? 'text-blue-400' : 'text-gray-300'}`}>
            <span className="font-bold opacity-40 flex-shrink-0">[{msg.role === 'user' ? 'USER' : 'AI'}]</span>
            <span className="break-words">{msg.content}</span>
          </div>
        ))}
        {isGenerating && (
          <div className="flex items-center gap-2 text-amber-500 text-[11px] animate-pulse">
            <Loader2Icon size={12} className="animate-spin" />
            <span className="font-bold uppercase tracking-wider">AI está codificando suas ideias...</span>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold text-blue-500/70 uppercase">
          <ZapIcon size={10} />
          Sugestões:
        </div>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleCommand(s)}
            disabled={isGenerating || !projectId}
            className="flex-shrink-0 px-3 py-1 bg-[#161b22] border border-[#30363d] hover:border-blue-500/50 hover:bg-[#1c2128] text-gray-400 hover:text-blue-400 text-[10px] rounded-full transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input de Comando */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleCommand(prompt); }} 
        className="relative group"
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Peça para mudar o design, criar botões, fluxos..."
          className="w-full bg-[#161b22] border border-[#30363d] rounded-xl py-3.5 pl-5 pr-14 text-xs focus:border-blue-500 outline-none transition-all shadow-xl text-gray-200 placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/20"
        />
        <button 
          type="submit" 
          disabled={isGenerating || !prompt.trim() || !projectId}
          className={`absolute right-3 top-2.5 p-1.5 rounded-lg transition-all ${isGenerating || !prompt.trim() ? 'text-gray-600' : 'text-green-500 hover:bg-green-500/10'}`}
        >
          <SendIcon size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatConsole;
