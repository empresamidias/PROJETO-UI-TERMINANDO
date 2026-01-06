
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';
import { useStore } from '../store';
import { 
  Code2Icon, 
  XIcon, 
  SaveIcon, 
  Loader2Icon, 
  ChevronDownIcon,
  AlignLeftIcon,
  AlertCircleIcon,
  TerminalIcon,
  ChevronUpIcon
} from 'lucide-react';
import { saveProject } from '../services/api';

loader.init().then(monaco => {
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
  // Habilitar auto-fechamento e sugestões extras
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ["node_modules/@types"]
  });
});

const Editor: React.FC = () => {
  const { 
    activeFilePath, 
    openFilePaths, 
    getFile, 
    updateFileContent, 
    setActiveFile, 
    closeFile,
    isSaving,
    setSaving,
    projectName,
    files,
    projectId
  } = useStore();

  const [isFormatting, setIsFormatting] = useState(false);
  const [problems, setProblems] = useState<any[]>([]);
  const [showProblems, setShowProblems] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const activeFile = activeFilePath ? getFile(activeFilePath) : null;

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listener para erros/warnings do Monaco
    monaco.editor.onDidChangeMarkers(([uri]: any) => {
      const markers = monaco.editor.getModelMarkers({ resource: uri });
      setProblems(markers);
    });
  };

  const handleEditorSave = async () => {
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

  const handleFormat = async () => {
    if (!activeFile) return;
    setIsFormatting(true);
    try {
      const prettier = await import('https://esm.sh/prettier@3.1.0/standalone');
      const parserHtml = await import('https://esm.sh/prettier@3.1.0/plugins/html');
      const parserBabel = await import('https://esm.sh/prettier@3.1.0/plugins/babel');
      const parserEstree = await import('https://esm.sh/prettier@3.1.0/plugins/estree');
      const parserPostcss = await import('https://esm.sh/prettier@3.1.0/plugins/postcss');

      let parser = '';
      const plugins = [parserEstree];
      
      if (activeFile.path.endsWith('.html')) {
        parser = 'html';
        plugins.push(parserHtml);
      } else if (activeFile.path.endsWith('.css')) {
        parser = 'css';
        plugins.push(parserPostcss);
      } else if (activeFile.path.endsWith('.js') || activeFile.path.endsWith('.jsx')) {
        parser = 'babel';
        plugins.push(parserBabel);
      } else if (activeFile.path.endsWith('.ts') || activeFile.path.endsWith('.tsx')) {
        parser = 'babel-ts';
        plugins.push(parserBabel);
      } else if (activeFile.path.endsWith('.json')) {
        parser = 'json';
        plugins.push(parserBabel);
      }

      if (parser) {
        const formatted = await prettier.format(activeFile.content, {
          parser,
          plugins,
          semi: true,
          singleQuote: false,
          tabWidth: 2,
          printWidth: 100,
        });
        updateFileContent(activeFile.path, formatted);
      }
    } catch (error) {
      console.error("Erro ao formatar:", error);
    } finally {
      setIsFormatting(false);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#0d1117] flex flex-col items-center justify-center text-gray-700">
        <Code2Icon size={48} className="mb-4 opacity-10" />
        <p className="text-sm font-medium">Nenhum arquivo aberto</p>
        <p className="text-[10px] mt-2 text-gray-800 uppercase tracking-widest">Selecione um arquivo no Explorer</p>
      </div>
    );
  }

  const getLanguage = (path: string) => {
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.json')) return 'json';
    return 'markdown';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0 overflow-hidden relative">
      {/* Tabs Header */}
      <div className="h-9 border-b border-[#1c2128] bg-[#161b22] flex items-center shrink-0 overflow-x-auto no-scrollbar">
        {openFilePaths.map((path) => (
          <div
            key={path}
            onClick={() => setActiveFile(path)}
            className={`
              flex items-center gap-2 h-full px-3 border-r border-[#1c2128] cursor-pointer transition-all text-[11px] font-medium min-w-fit
              ${activeFilePath === path 
                ? 'bg-[#0d1117] text-blue-400 border-t-2 border-t-blue-500 shadow-xl' 
                : 'text-gray-500 hover:bg-[#1c2128] hover:text-gray-300'}
            `}
          >
            <span className="truncate max-w-[120px]">{path.split('/').pop()}</span>
            <XIcon 
              size={12} 
              className="hover:bg-red-500/20 hover:text-red-400 rounded p-0.5 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
            />
          </div>
        ))}
      </div>

      {/* Editor Sub-header */}
      <div className="h-8 bg-[#0d1117] border-b border-[#1c2128] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <ChevronDownIcon size={12} />
          {activeFile.path}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleFormat}
            disabled={isFormatting}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-emerald-600/10 text-emerald-500/80 transition-all text-[10px] font-bold uppercase active:scale-95 disabled:opacity-30"
          >
            {isFormatting ? <Loader2Icon size={12} className="animate-spin" /> : <AlignLeftIcon size={12} />}
            Formatar
          </button>
          <div className="h-4 w-[1px] bg-[#1c2128]"></div>
          <button 
            onClick={handleEditorSave}
            disabled={isSaving || !projectId}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-blue-600/10 text-blue-500/80 transition-all text-[10px] font-bold uppercase active:scale-95 disabled:opacity-30"
          >
            {isSaving ? <Loader2Icon size={12} className="animate-spin" /> : <SaveIcon size={12} />}
            Salvar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            language={getLanguage(activeFile.path)}
            theme="vs-dark"
            value={activeFile.content}
            onMount={handleEditorDidMount}
            onChange={(val) => updateFileContent(activeFile.path, val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              padding: { top: 15 },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              folding: true,
              formatOnPaste: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              // Fix: Removed invalid property 'autoClosingTags' from Monaco options
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto'
              }
            }}
          />
        </div>

        {/* Problems Drawer */}
        <div className={`border-t border-[#1c2128] bg-[#0d1117] flex flex-col transition-all duration-200 ${showProblems ? 'h-32' : 'h-8'}`}>
          <div 
            onClick={() => setShowProblems(!showProblems)}
            className="h-8 flex items-center justify-between px-4 cursor-pointer hover:bg-[#161b22] transition-colors shrink-0"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <TerminalIcon size={12} />
                Problemas
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${problems.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-500'}`}>
                  {problems.length} Erros
                </span>
              </div>
            </div>
            {showProblems ? <ChevronDownIcon size={14} className="text-gray-600" /> : <ChevronUpIcon size={14} className="text-gray-600" />}
          </div>
          
          {showProblems && (
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px]">
              {problems.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 italic">Nenhum problema detectado. Tudo limpo!</div>
              ) : (
                <div className="space-y-1">
                  {problems.map((prob, i) => (
                    <div key={i} className="flex items-start gap-2 p-1 hover:bg-white/5 rounded cursor-default group">
                      <AlertCircleIcon size={12} className="text-red-500 shrink-0 mt-0.5" />
                      <span className="text-gray-300 group-hover:text-white">{prob.message}</span>
                      <span className="text-gray-600 ml-auto">[Linha {prob.startLineNumber}, Col {prob.startColumn}]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
