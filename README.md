# 🏛️ Gazeta dos Concursos

Portal completo de concursos públicos com CMS administrativo integrado.

## 🚀 Stack Tecnológica

- **Framework:** Next.js 16+ (App Router)
- **Estilização:** Tailwind CSS v4
- **Componentes:** Shadcn UI
- **Ícones:** Lucide React
- **Banco de Dados:** Supabase (PostgreSQL)
- **IA:** Google Gemini 2.5 Flash

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (public)/          # Páginas públicas
│   │   └── provas/        # Banco de provas público
│   ├── admin/             # Área administrativa
│   │   ├── ai/            # Assistente IA
│   │   ├── calendar/      # Calendário editorial
│   │   ├── categories/    # Gerenciar categorias
│   │   ├── concursos/     # CRUD de concursos
│   │   ├── posts/         # CRUD de posts
│   │   ├── provas/        # CRUD de provas
│   │   ├── settings/      # Configurações do sistema
│   │   └── users/         # Gestão de usuários
│   ├── blog/              # Páginas de artigos
│   └── login/             # Autenticação
├── components/
│   ├── admin/             # Componentes do admin
│   ├── blog/              # Componentes do blog
│   └── ui/                # Componentes Shadcn
├── hooks/                 # Custom hooks
├── lib/                   # Utilities e configs
└── types/                 # Definições TypeScript
```

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Gemini AI
GEMINI_API_KEY=sua-api-key-do-gemini
```

## 🗃️ Configuração do Banco de Dados

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Execute o arquivo `supa/EXECUTE_THIS.sql`

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📦 Funcionalidades

### Área Pública

- ✅ Home com posts em destaque
- ✅ Blog com artigos completos
- ✅ Banco de provas com filtros
- ✅ Busca de conteúdo
- ✅ Dark/Light mode

### Área Administrativa

- ✅ Dashboard com métricas
- ✅ CRUD completo de Posts
- ✅ CRUD completo de Concursos
- ✅ CRUD completo de Provas
- ✅ Gestão de Categorias
- ✅ Gestão de Usuários e Roles
- ✅ Logs de Atividade
- ✅ Calendário Editorial + Kanban
- ✅ Assistente IA (geração de títulos, SEO)
- ✅ Configurações do Sistema

### Integrações

- ✅ Supabase Auth
- ✅ Supabase Storage
- ✅ Google Gemini AI
- ✅ Google Analytics (configurável)

## 👥 Roles de Usuário

| Role     | Permissões                     |
| -------- | ------------------------------ |
| `admin`  | Acesso total                   |
| `editor` | Criar/editar posts e concursos |
| `author` | Criar rascunhos                |

## 🎨 Cores do Tema

As cores podem ser configuradas em `/admin/settings`:

- Cor primária: Azul institucional
- Cor de destaque: Laranja/Âmbar

## 📝 Licença

MIT © Gazeta dos Concursos
