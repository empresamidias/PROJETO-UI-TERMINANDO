import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  CpuIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon, 
  AlertTriangleIcon 
} from 'lucide-react'; // Ícones necessários para a barra

const toBase64 = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) { return ''; }
};

const Preview: React.FC = () => {
  const { files } = useStore();
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePreview = async () => {
      setError(null);
      try {
        const { transform } = await import('https://esm.sh/sucrase@3.35.0');
        const importMap: { imports: Record<string, string> } = {
          imports: {
            "react": "https://esm.sh/react@19.0.0",
            "react-dom": "https://esm.sh/react-dom@19.0.0",
            "react-dom/client": "https://esm.sh/react-dom@19.0.0/client",
            "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
            "react/jsx-dev-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
            "lucide-react": "https://esm.sh/lucide-react@0.460.0?external=react"
          }
        };

        for (const file of files) {
          if (/\.(tsx|ts|jsx|js)$/.test(file.path)) {
            let { code } = transform(file.content, {
              transforms: ['typescript', 'jsx'],
              jsxRuntime: 'automatic',
              production: true,
            });

            code = code.replace(/from\s+["']\.\/([^"']+)["']/g, 'from "$1"');
            code = code.replace(/import\s+["']\.\/([^"']+)["']/g, 'import "$1"');

            const b64 = `data:application/javascript;base64,${toBase64(code)}`;
            const nameOnly = file.path.replace(/\.(tsx|ts|jsx|js)$/, '');
            
            importMap.imports[nameOnly] = b64;
            importMap.imports[file.path] = b64;
          }
        }

        const htmlFile = files.find(f => f.path === 'index.html');
        const htmlBase = htmlFile ? htmlFile.content : '<div id="root"></div>';

        const finalDoc = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <script src="https://cdn.tailwindcss.com"></script>
              <script type="importmap">${JSON.stringify(importMap)}</script>
              <style>body { margin: 0; padding: 0; }</style>
            </head>
            <body>
              ${htmlBase.includes('id="root"') ? htmlBase : '<div id="root"></div>' + htmlBase}
              <script type="module">
                import "index"; 
              </script>
            </body>
          </html>
        `;

        setSrcDoc(finalDoc);
      } catch (err: any) {
        setError(err.message);
      }
    };

    const timer = setTimeout(generatePreview, 500);
    return () => clearTimeout(timer);
  }, [files]);

  // ESTA PARTE FOI CORRIGIDA PARA O LAYOUT FICAR NO LUGAR CERTO
  return (
    <div className="flex-1 flex flex-col border-l border-[#1c2128] bg-[#0d0f12] h-full min-w-0">
      {/* Barra Superior */}
      <div className="h-9 border-b border-[#1c2128] bg-[#161b22] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CpuIcon size={10} />
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCwIcon 
            size={12} 
            className="text-gray-500 cursor-pointer hover:text-white transition-colors" 
            onClick={() => setSrcDoc(prev => prev + ' ')} 
          />
          <ExternalLinkIcon size={12} className="text-gray-500 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Container do Iframe */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {error ? (
          <div className="absolute inset-0 z-20 bg-[#0d1117] p-6 font-mono text-xs overflow-auto">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertTriangleIcon size={16} />
              <span className="font-bold">ERRO DE COMPILAÇÃO</span>
            </div>
            <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
          </div>
        ) : (
          <iframe
            key={srcDoc.length}
            title="Preview"
            srcDoc={srcDoc}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          />
        )}
      </div>
    </div>
  );
};

export default Preview;