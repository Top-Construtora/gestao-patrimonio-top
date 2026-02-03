# GIO - Sistema de Controle de Patrimonio

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169e1?logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/Licenca-Privado-red)

Sistema web para gestao e controle de patrimonio, com cadastro de equipamentos, solicitacoes de compra, termos de responsabilidade, relatorios e trilha de auditoria completa. Monorepo com frontend React e backend Express, ambos em TypeScript.

---

## Funcionalidades

### Gestao de Equipamentos
- **CRUD completo** de equipamentos com numero de patrimonio, marca, modelo e especificacoes
- **Controle de status** (ativo / manutencao / desativado) com badges visuais
- **Transferencia** de equipamentos entre locais e responsaveis
- **Registro de manutencao** com descricao e historico
- **Busca e filtros** por numero de patrimonio, descricao, marca, modelo, responsavel, local e status
- **Ordenacao** por colunas (patrimonio, descricao, local, status, valor)

### Anexos de Arquivos
- **Upload de arquivos** associados a equipamentos (limite de 10MB)
- **Download e exclusao** de anexos
- **Armazenamento** no Supabase Storage (bucket `equipment-attachments`)

### Solicitacoes de Compra
- **Registro de solicitacoes** com descricao, marca, modelo, fornecedor e especificacoes
- **Niveis de urgencia**: baixa, media, alta, critica
- **Fluxo de aprovacao**: pendente → aprovado / rejeitado → adquirido
- **Conversao automatica** de compra aprovada em equipamento cadastrado

### Termos de Responsabilidade
- **Geracao de PDF** com dados do equipamento e responsavel
- **Captura de assinatura manual** na tela
- **Controle de status**: rascunho, enviado, assinado, cancelado
- **Armazenamento** do PDF gerado no Supabase Storage

### Relatorios e Exportacao
- **Dashboard** com metricas: total de equipamentos, ativos, em manutencao, valor total
- **Grafico de pizza** com distribuicao por status
- **Feed de atividades** recentes com tipos de alteracao codificados por cor
- **Filtros** por periodo, status e local
- **Exportacao CSV** dos dados de equipamentos

### Trilha de Auditoria
- **Historico completo** de todas as alteracoes em equipamentos
- **Tipos de evento**: criou, editou, excluiu, manutencao, alterou status, anexou arquivo, removeu arquivo
- **Atribuicao de usuario** em cada registro

---

## Arquitetura

```
gestao-patrimonio/
├── frontend/          # React 18 + Vite + Tailwind CSS
├── backend/           # Express + TypeScript + Supabase
└── package.json       # Scripts do monorepo (concurrently)
```

**Gerenciador de pacotes**: npm

---

## Pre-requisitos

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x
- Conta no [Supabase](https://supabase.com/) com projeto PostgreSQL

## Instalacao

```bash
# Instalar todas as dependencias (raiz, frontend e backend)
npm run install:all

# Configurar banco de dados (executar no Supabase SQL Editor)
# Schema descrito na secao "Banco de Dados" abaixo
```

## Executando

```bash
# Frontend + Backend simultaneamente (recomendado)
npm run dev

# Apenas frontend (http://localhost:5173)
npm run dev:frontend

# Apenas backend (http://localhost:3001)
npm run dev:backend
```

## Build & Deploy

```bash
# Build completo (backend + frontend)
npm run build

# Build individual
npm run build:frontend    # Gera frontend/dist/ estatico
npm run build:backend     # Compila TypeScript para backend/dist/

# Producao
npm run start
```

## Testes

```bash
# Frontend (Vitest)
cd frontend
npm run test              # Testes unitarios
npm run test:ui           # Interface visual do Vitest
npm run test:coverage     # Com cobertura

# Lint
npm run lint
```

---

## Frontend

### Estrutura

```
frontend/src/
├── components/
│   ├── common/              # Componentes reutilizaveis
│   │   ├── Button, Badge, Card
│   │   ├── Toast, ConfirmationModal, DeleteConfirmationModal
│   │   ├── ErrorBoundary, LoadingOverlay
│   │   └── ...
│   ├── equipment/           # EquipmentDetails, TransferEquipment
│   ├── layout/              # Layout, Sidebar, Header
│   ├── purchases/           # PurchaseToEquipmentModal
│   └── responsability/      # ResponsabilityTerm (PDF + assinatura)
├── pages/
│   ├── Dashboard             # Metricas, graficos e atividades recentes
│   ├── EquipmentList         # Listagem com filtros e busca
│   ├── EquipmentDetailsPage  # Detalhes, anexos, historico, termos
│   ├── AddEquipment          # Formulario de cadastro
│   ├── EditEquipment         # Formulario de edicao
│   ├── EquipmentPurchaseList # Listagem de solicitacoes de compra
│   ├── AddEquipmentPurchase  # Formulario de solicitacao
│   ├── Reports               # Relatorios com filtros e exportacao
│   └── Settings              # Configuracoes
├── services/
│   ├── inventoryService.ts          # CRUD de equipamentos, anexos, historico
│   ├── purchaseService.ts           # Gestao de solicitacoes de compra
│   ├── responsabilityTermService.ts # Termos de responsabilidade
│   ├── pdfGenerator.ts              # Geracao de PDF (jsPDF)
│   ├── apiClient.ts                 # Cliente HTTP para o backend
│   ├── api.ts                       # Funcoes utilitarias de API
│   └── assinafyService.ts           # Servico de assinatura digital
├── hooks/
│   ├── useEquipment.ts       # Estado de equipamentos
│   ├── usePurchases.ts       # Estado de compras
│   ├── useNavigation.ts      # Navegacao por estado
│   └── useOnlineStatus.ts    # Deteccao online/offline
├── contexts/
│   ├── ToastContext.tsx       # Notificacoes toast
│   └── UserContext.tsx        # Contexto do usuario
├── types/                    # Definicoes TypeScript
├── utils/                    # Validacao de arquivos
├── lib/                      # Cliente Supabase
└── App.tsx                   # Componente principal com roteamento
```

### Principais Bibliotecas

| Biblioteca | Uso |
|---|---|
| **React 18** | Framework UI |
| **Vite** | Build tool com HMR |
| **Tailwind CSS** | Estilizacao utility-first |
| **Lucide React** | Icones SVG |
| **jsPDF** | Geracao de PDF client-side |
| **Supabase JS** | Cliente do banco de dados |
| **UUID** | Geracao de identificadores unicos |
| **Vitest** | Framework de testes |

### Variaveis de Ambiente (frontend)

Crie `frontend/.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

---

## Backend

### Estrutura

```
backend/src/
├── index.ts                 # Bootstrap Express (porta 3001)
├── config/
│   └── supabase.ts          # Cliente Supabase
├── controllers/
│   ├── equipmentController.ts
│   ├── purchaseController.ts
│   ├── responsibilityTermController.ts
│   └── historyController.ts
├── services/
│   ├── equipmentService.ts
│   ├── purchaseService.ts
│   ├── responsibilityTermService.ts
│   └── historyService.ts
├── routes/
│   ├── index.ts             # Agregador de rotas
│   ├── equipmentRoutes.ts
│   ├── purchaseRoutes.ts
│   ├── responsibilityTermRoutes.ts
│   └── historyRoutes.ts
├── middlewares/
│   └── errorHandler.ts      # Tratamento de erros e 404
└── types/
    └── index.ts             # Tipos compartilhados
```

### Principais Bibliotecas

| Biblioteca | Uso |
|---|---|
| **Express** | Framework HTTP |
| **Supabase JS** | Cliente do banco de dados |
| **Multer** | Upload de arquivos (10MB) |
| **express-validator** | Validacao de requisicoes |
| **CORS** | Controle de origens permitidas |
| **dotenv** | Variaveis de ambiente |
| **tsx** | Execucao TypeScript em desenvolvimento |

### Endpoints da API

#### Equipamentos (`/api/equipment`)

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/` | Listar equipamentos |
| GET | `/stats` | Estatisticas dos equipamentos |
| GET | `/next-asset-number` | Proximo numero de patrimonio |
| GET | `/:id` | Detalhes do equipamento |
| POST | `/` | Criar equipamento |
| PUT | `/:id` | Atualizar equipamento |
| DELETE | `/:id` | Remover equipamento |
| POST | `/:id/transfer` | Transferir equipamento |
| POST | `/:id/maintenance` | Registrar manutencao |
| GET | `/:id/history` | Historico do equipamento |
| GET | `/:id/attachments` | Listar anexos |
| POST | `/:id/attachments` | Upload de anexo (10MB) |
| DELETE | `/attachments/:attachmentId` | Remover anexo |

#### Solicitacoes de Compra (`/api/purchases`)

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/` | Listar solicitacoes |
| GET | `/stats` | Estatisticas de compras |
| GET | `/:id` | Detalhes da solicitacao |
| POST | `/` | Criar solicitacao |
| PUT | `/:id` | Atualizar solicitacao |
| DELETE | `/:id` | Remover solicitacao |
| POST | `/:id/approve` | Aprovar solicitacao |
| POST | `/:id/reject` | Rejeitar solicitacao |
| POST | `/:id/acquire` | Marcar como adquirido |
| POST | `/:id/convert-to-equipment` | Converter em equipamento |

#### Termos de Responsabilidade (`/api/responsibility-terms`)

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/equipment/:equipmentId` | Termos por equipamento |
| GET | `/:id` | Detalhes do termo |
| POST | `/` | Criar termo |
| PATCH | `/:id/status` | Atualizar status do termo |
| DELETE | `/:id` | Remover termo |

#### Historico (`/api/history`)

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/` | Listar todo o historico |
| GET | `/recent` | Historico recente |
| GET | `/equipment/:equipmentId` | Historico por equipamento |
| GET | `/entity/:entityType` | Historico por tipo de entidade |
| POST | `/` | Criar entrada de historico |

#### Outros

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/health` | Health check |

### Variaveis de Ambiente (backend)

Crie `backend/.env`:

```env
# Servidor
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_KEY=sua-service-key
```

---

## Banco de Dados

### Tabelas principais

| Grupo | Tabelas |
|---|---|
| **Equipamentos** | `equipments` |
| **Historico** | `history_entries` |
| **Anexos** | `attachments` |
| **Compras** | `equipment_purchases` |
| **Termos** | `responsibility_terms` |

### Entidades principais

| Entidade | Campos chave |
|---|---|
| **Equipment** | id, asset_number, description, brand, model, specs, status (ativo/manutencao/desativado), location, responsible, acquisition_date, value |
| **HistoryEntry** | id, equipment_id, user_name, change_type, field, old_value, new_value, timestamp |
| **Attachment** | id, equipment_id, name, size, type, file_path, uploaded_by |
| **EquipmentPurchase** | id, description, brand, model, urgency (baixa/media/alta/critica), status (pendente/aprovado/rejeitado/adquirido), requested_by, request_date, supplier |
| **ResponsibilityTerm** | id, equipment_id, responsible_person, responsible_email, responsible_department, term_date, status (draft/sent/signed/cancelled), manual_signature, pdf_url |

### Schema SQL

As tabelas devem ser criadas no Supabase SQL Editor. O schema completo esta documentado no arquivo `CLAUDE.md` na secao "Database Schema".

---

## Design e Interface

- **Logo**: GIO - design minimalista com elementos geometricos
- **Fonte**: Space Grotesk
- **Cores principais**: Teal (#12b0a0), Dark Blue-Green (#1e6076), Gold (#baa673)
- **Layout**: Header fixo + Sidebar colapsavel + Area de conteudo responsiva
- **Tema**: Header/Sidebar escuro com area de conteudo claro
- **Icones**: Lucide React (50+ icones)
- **Responsivo**: Mobile-first com breakpoints sm, md, lg

---

## Deploy

| Componente | Plataforma |
|---|---|
| Frontend | Vercel (build estatico) |
| Backend | Render (Node.js) |
| Banco de dados | Supabase (PostgreSQL gerenciado) |
| Arquivos | Supabase Storage |

---

Desenvolvido para **Top Construtora**
