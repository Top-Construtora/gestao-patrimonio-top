// Tipos de arquivo permitidos para upload
export const ALLOWED_FILE_TYPES = {
  // Documentos
  'application/pdf': { extension: '.pdf', category: 'document' },
  'application/msword': { extension: '.doc', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extension: '.docx', category: 'document' },
  'application/vnd.ms-excel': { extension: '.xls', category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { extension: '.xlsx', category: 'document' },
  'text/plain': { extension: '.txt', category: 'document' },
  'text/csv': { extension: '.csv', category: 'document' },

  // Imagens
  'image/jpeg': { extension: '.jpg', category: 'image' },
  'image/png': { extension: '.png', category: 'image' },
  'image/gif': { extension: '.gif', category: 'image' },
  'image/webp': { extension: '.webp', category: 'image' },
  'image/svg+xml': { extension: '.svg', category: 'image' },

  // Arquivos compactados
  'application/zip': { extension: '.zip', category: 'archive' },
  'application/x-rar-compressed': { extension: '.rar', category: 'archive' },
  'application/x-7z-compressed': { extension: '.7z', category: 'archive' },
} as const;

// Extensões permitidas (para validação dupla)
export const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.zip', '.rar', '.7z'
];

// Extensões perigosas que nunca devem ser permitidas
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr',
  '.js', '.vbs', '.wsf', '.wsh',
  '.php', '.asp', '.aspx', '.jsp',
  '.sh', '.bash', '.ps1', '.psm1',
  '.dll', '.sys', '.drv',
  '.reg', '.inf', '.hta'
];

// Tamanho máximo (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Tamanho máximo para imagens (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: string;
  category?: string;
}

/**
 * Valida um arquivo para upload
 */
export const validateFile = (file: File): FileValidationResult => {
  // 1. Verificar se o arquivo existe
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo selecionado' };
  }

  // 2. Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Arquivo muito grande (${sizeMB}MB). Tamanho máximo: 10MB`
    };
  }

  // 3. Verificar se o arquivo está vazio
  if (file.size === 0) {
    return { isValid: false, error: 'O arquivo está vazio' };
  }

  // 4. Obter extensão do arquivo
  const fileName = file.name.toLowerCase();
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : '';

  // 5. Verificar extensões perigosas
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido por segurança (${extension})`
    };
  }

  // 6. Verificar tipo MIME
  const fileTypeInfo = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];

  // 7. Verificar extensão permitida
  const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(extension) ||
    ALLOWED_EXTENSIONS.includes(extension.replace('.jpeg', '.jpg'));

  // 8. Validação combinada (MIME type OU extensão deve ser válida)
  if (!fileTypeInfo && !isExtensionAllowed) {
    return {
      isValid: false,
      error: `Tipo de arquivo não suportado. Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, JPG, PNG, GIF, ZIP`
    };
  }

  // 9. Validação específica para imagens (tamanho menor)
  if (fileTypeInfo?.category === 'image' && file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Imagem muito grande (${sizeMB}MB). Tamanho máximo para imagens: 5MB`
    };
  }

  return {
    isValid: true,
    fileType: file.type || 'application/octet-stream',
    category: fileTypeInfo?.category || 'other'
  };
};

/**
 * Valida múltiplos arquivos
 */
export const validateFiles = (files: File[]): {
  validFiles: File[];
  errors: string[];
} => {
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach(file => {
    const result = validateFile(file);
    if (result.isValid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  });

  return { validFiles, errors };
};

/**
 * Formata tamanho de arquivo para exibição
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtém ícone baseado no tipo de arquivo
 */
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.toLowerCase().split('.').pop() || '';

  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    txt: '📃',
    csv: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
    svg: '🖼️',
    zip: '📦',
    rar: '📦',
    '7z': '📦',
  };

  return iconMap[extension] || '📎';
};
