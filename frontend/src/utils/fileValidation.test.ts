import { describe, it, expect } from 'vitest';
import {
  validateFile,
  validateFiles,
  formatFileSize,
  getFileIcon,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  DANGEROUS_EXTENSIONS,
  ALLOWED_EXTENSIONS
} from './fileValidation';

// Helper para criar mock de File
const createMockFile = (
  name: string,
  size: number,
  type: string
): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('validateFile', () => {
  describe('validações básicas', () => {
    it('deve rejeitar arquivo null/undefined', () => {
      const result = validateFile(null as unknown as File);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nenhum arquivo selecionado');
    });

    it('deve rejeitar arquivo vazio', () => {
      const file = createMockFile('test.pdf', 0, 'application/pdf');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('O arquivo está vazio');
    });

    it('deve rejeitar arquivo muito grande (>10MB)', () => {
      const file = createMockFile('test.pdf', MAX_FILE_SIZE + 1, 'application/pdf');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Arquivo muito grande');
      expect(result.error).toContain('10MB');
    });
  });

  describe('validação de tipos de arquivo', () => {
    it('deve aceitar PDF', () => {
      const file = createMockFile('documento.pdf', 1024, 'application/pdf');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.category).toBe('document');
    });

    it('deve aceitar imagem JPG', () => {
      const file = createMockFile('foto.jpg', 1024, 'image/jpeg');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.category).toBe('image');
    });

    it('deve aceitar imagem PNG', () => {
      const file = createMockFile('imagem.png', 1024, 'image/png');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.category).toBe('image');
    });

    it('deve aceitar DOCX', () => {
      const file = createMockFile('documento.docx', 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.category).toBe('document');
    });

    it('deve aceitar XLSX', () => {
      const file = createMockFile('planilha.xlsx', 1024, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.category).toBe('document');
    });

    it('deve aceitar ZIP', () => {
      const file = createMockFile('arquivo.zip', 1024, 'application/zip');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.category).toBe('archive');
    });
  });

  describe('validação de extensões perigosas', () => {
    DANGEROUS_EXTENSIONS.slice(0, 5).forEach(ext => {
      it(`deve rejeitar arquivos ${ext}`, () => {
        const file = createMockFile(`malware${ext}`, 1024, 'application/octet-stream');
        const result = validateFile(file);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('não permitido por segurança');
        expect(result.error).toContain(ext);
      });
    });

    it('deve rejeitar arquivo .exe', () => {
      const file = createMockFile('virus.exe', 1024, 'application/x-msdownload');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('.exe');
    });

    it('deve rejeitar arquivo .php', () => {
      const file = createMockFile('shell.php', 1024, 'text/x-php');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('.php');
    });

    it('deve rejeitar arquivo .bat', () => {
      const file = createMockFile('script.bat', 1024, 'application/x-bat');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('.bat');
    });
  });

  describe('validação de tamanho de imagens', () => {
    it('deve rejeitar imagem maior que 5MB', () => {
      const file = createMockFile('grande.jpg', MAX_IMAGE_SIZE + 1, 'image/jpeg');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Imagem muito grande');
      expect(result.error).toContain('5MB');
    });

    it('deve aceitar imagem menor que 5MB', () => {
      const file = createMockFile('pequena.jpg', MAX_IMAGE_SIZE - 1, 'image/jpeg');
      const result = validateFile(file);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validação de tipos não suportados', () => {
    it('deve rejeitar tipo de arquivo desconhecido', () => {
      const file = createMockFile('arquivo.xyz', 1024, 'application/x-unknown');
      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Tipo de arquivo não suportado');
    });
  });
});

describe('validateFiles', () => {
  it('deve validar múltiplos arquivos válidos', () => {
    const files = [
      createMockFile('doc1.pdf', 1024, 'application/pdf'),
      createMockFile('doc2.pdf', 2048, 'application/pdf'),
      createMockFile('img.jpg', 1024, 'image/jpeg'),
    ];

    const result = validateFiles(files);

    expect(result.validFiles).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
  });

  it('deve separar arquivos válidos e inválidos', () => {
    const files = [
      createMockFile('valid.pdf', 1024, 'application/pdf'),
      createMockFile('malware.exe', 1024, 'application/x-msdownload'),
      createMockFile('valid.jpg', 1024, 'image/jpeg'),
    ];

    const result = validateFiles(files);

    expect(result.validFiles).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('malware.exe');
  });

  it('deve retornar array vazio para lista vazia', () => {
    const result = validateFiles([]);

    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});

describe('formatFileSize', () => {
  it('deve formatar 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('deve formatar bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('deve formatar kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('deve formatar megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(5.5 * 1024 * 1024)).toBe('5.5 MB');
  });

  it('deve formatar gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('getFileIcon', () => {
  it('deve retornar ícone de PDF', () => {
    expect(getFileIcon('documento.pdf')).toBe('📄');
  });

  it('deve retornar ícone de documento Word', () => {
    expect(getFileIcon('arquivo.doc')).toBe('📝');
    expect(getFileIcon('arquivo.docx')).toBe('📝');
  });

  it('deve retornar ícone de planilha', () => {
    expect(getFileIcon('dados.xls')).toBe('📊');
    expect(getFileIcon('dados.xlsx')).toBe('📊');
    expect(getFileIcon('dados.csv')).toBe('📊');
  });

  it('deve retornar ícone de imagem', () => {
    expect(getFileIcon('foto.jpg')).toBe('🖼️');
    expect(getFileIcon('foto.jpeg')).toBe('🖼️');
    expect(getFileIcon('imagem.png')).toBe('🖼️');
    expect(getFileIcon('animacao.gif')).toBe('🖼️');
  });

  it('deve retornar ícone de arquivo compactado', () => {
    expect(getFileIcon('backup.zip')).toBe('📦');
    expect(getFileIcon('backup.rar')).toBe('📦');
    expect(getFileIcon('backup.7z')).toBe('📦');
  });

  it('deve retornar ícone padrão para tipo desconhecido', () => {
    expect(getFileIcon('arquivo.xyz')).toBe('📎');
    expect(getFileIcon('sem-extensao')).toBe('📎');
  });
});
