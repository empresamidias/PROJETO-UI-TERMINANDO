
import { IDEFile, Message } from '../types';

const BASE_URL = 'https://lineable-maricela-primly.ngrok-free.dev';

/**
 * Busca a lista inicial de arquivos de um projeto existente
 */
export const getProjectFiles = async (projectId: string): Promise<IDEFile[]> => {
  try {
    const response = await fetch(`${BASE_URL}/projeto/${projectId}/arquivos`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar arquivos: ${response.status}`);
    }

    const data = await response.json();
    // Mapeamento corrigido para o schema do Supabase (nome_arquivo e conteudo_texto)
    const arquivos = Array.isArray(data) ? data : (data.arquivos || []);
    
    return arquivos.map((f: any) => ({
      path: String(f.nome_arquivo || f.caminho || f.path || f.nome || ''),
      content: String(f.conteudo_texto || f.conteudo || f.content || '')
    })).filter(f => f.path); // Remove entradas sem nome
  } catch (error) {
    console.error('Fetch Files Error:', error);
    throw error;
  }
};

/**
 * Salva o projeto no banco de dados (Criação ou Atualização)
 */
export const saveProject = async (name: string, files: IDEFile[], existingId?: string | null): Promise<{ id: string }> => {
  const payload = {
    nome: name,
    arquivos: files.map(f => ({ 
      nome_arquivo: f.path, 
      conteudo_texto: f.content 
    }))
  };

  const response = await fetch(`${BASE_URL}/salvar-projeto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao salvar: ${response.status} ${text}`);
  }
  
  const responseData = await response.json();
  const data = Array.isArray(responseData) ? responseData[0] : responseData;
  
  const id = data.id || data.projetoId || data.uuid || data.projeto_id;
  
  if (!id) {
    throw new Error('Servidor não retornou um ID válido.');
  }
  
  return { id };
};

/**
 * Gera código via AI enviando o ID real do projeto
 */
export const generateCode = async (
  prompt: string, 
  history: Message[],
  projectId: string
): Promise<IDEFile[]> => {
  try {
    const response = await fetch(`${BASE_URL}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        // CORREÇÃO DOS NOMES AQUI:
        projeto_id: projectId,   // O servidor espera projeto_id com underline
        prompt: prompt,          // O servidor espera prompt e não mensagemUsuario
        historico: history.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status} no servidor: ${errorText}`);
    }
    
    const data = await response.json();
    const arquivos = data.arquivos || data;
    
    if (Array.isArray(arquivos)) {
      return arquivos.map((f: any) => ({
        path: String(f.path || f.caminho || f.nome_arquivo || 'unnamed_file'),
        content: String(f.content || f.conteudo || f.conteudo_texto || '')
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Generation Error:', error);
    throw error;
  }
};