
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { SendIcon, Trash2Icon, UserIcon, BotIcon, Loader2Icon, AlertCircleIcon, LockIcon } from 'lucide-react';

interface ChatPreviewProps {
  projectId: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ projectId = '', messages, onSendMessage, onClearChat, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // A project is considered "unsaved" if its ID still has the temporary prefix or is empty
  const isUnsaved = !projectId || projectId.startsWith('temp-') || projectId.startsWith('project-');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isUnsaved) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-[400px] bg-[#1a1d23] border-l border-[#2d333b] flex flex-col h-full shadow-2xl relative">
      <header className="h-14 border-b border-[#2d333b] flex items-center justify-between px-4 bg-[#16191f]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-300">Preview do App</h2>
          {isUnsaved && (
             <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">Não Salvo</span>
          )}
        </div>
        <button 
          onClick={onClearChat}
          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
          title="Limpar Conversa"
        >
          <Trash2Icon size={16} />
        </button>
      </header>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1115]/50"
      >
        {isUnsaved ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
              <LockIcon size={32} className="text-amber-500" />
            </div>
            <h3 className="text-gray-200 font-semibold mb-2">Salve para Testar</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              O Preview requer um ID válido do banco de dados. Envie seu primeiro comando no terminal abaixo para sincronizar.
            </p>
          </div>
        ) : messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <BotIcon size={40} className="mb-4 text-gray-700" />
            <p className="text-sm text-gray-500">
              Pronto para teste! Envie uma mensagem para ver como sua IA se comporta.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}
                 `}>
                   {msg.role === 'user' ? <UserIcon size={16} /> : <BotIcon size={16} />}
                 </div>
                 <div className={`
                    p-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#2d333b] text-gray-200 rounded-tl-none border border-[#3e444d]'}
                 `}>
                   {msg.content}
                 </div>
              </div>
              <span className="text-[10px] text-gray-600 mt-1 px-11 uppercase font-bold">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center animate-pulse">
                <BotIcon size={16} />
             </div>
             <div className="bg-[#2d333b] p-3 rounded-2xl rounded-tl-none border border-[#3e444d] flex items-center">
                <Loader2Icon size={18} className="animate-spin text-blue-400" />
                <span className="ml-2 text-xs text-gray-400 italic">IA pensando...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2d333b] bg-[#16191f]">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isUnsaved}
            placeholder={isUnsaved ? "Salve o projeto primeiro..." : "Digite sua mensagem para testar..."}
            className={`
              w-full border rounded-xl pl-4 pr-12 py-3 text-sm transition-all
              ${isUnsaved 
                ? 'bg-[#1a1d23] border-[#2d333b] text-gray-600 cursor-not-allowed' 
                : 'bg-[#2d333b] border-[#3e444d] text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500'}
            `}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isUnsaved}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
              ${!input.trim() || isLoading || isUnsaved ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:bg-blue-400/10'}
            `}
          >
            <SendIcon size={18} />
          </button>
        </form>
        {isUnsaved && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-amber-500 uppercase font-bold">
            <AlertCircleIcon size={10} />
            Chat bloqueado: Sincronização pendente
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPreview;
