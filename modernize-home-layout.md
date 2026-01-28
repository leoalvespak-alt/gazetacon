# Task: Modernizar Layout da Home Page

## 🎯 Objetivo

Substituir o cabeçalho gigante (Hero) por uma seção de conteúdo dinâmico que destaca os posts mais recentes imediatamente, melhorando a densidade de informação e o engajamento.

## 🛠 Atividades

### Fase 1: Novos Componentes de Conteúdo

- [ ] Criar `src/components/blog/FeaturedGrid.tsx`: Uma seção que organiza o post mais recente em destaque e os seguintes em formato compacto.
- [ ] Criar `src/components/blog/EmptySate.tsx`: Um estado vazio mais atraente e informativo.

### Fase 2: Refatoração da Home (`src/app/page.tsx`)

- [ ] Remover o componente `<Hero />` atual.
- [ ] Integrar a nova lógica de destaque.
- [ ] Ajustar os espaçamentos (paddings/margins) para "subir" o conteúdo.
- [ ] Melhorar a barra de categorias para torná-la mais integrada ao design.

### Fase 3: Polimento Visual

- [ ] Adicionar micro-animações de hover.
- [ ] Garantir responsividade perfeita no mobile.

## 🔍 Critérios de Aceite

- Os posts devem ser visíveis sem necessidade de scroll no desktop.
- O site deve parecer um portal de notícias e não apenas uma landing page institucional.
- Performance e SEO mantidos.
