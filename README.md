# Moodle GIFT Manager

Uma aplicação web profissional e intuitiva projetada para educadores e designers instrucionais gerenciarem bancos de questões no formato GIFT (General Import Format Technology) do Moodle com máxima eficiência.

## 🚀 Principais Funcionalidades

- **Organização Hierárquica Multinível**: Crie uma árvore complexa de categorias e subcategorias para organizar seus repositórios de questões.
- **Simulador de Questões Moodle**: Visualize instantaneamente como suas questões aparecerão para os alunos. O simulador mimetiza fielmente o layout, as cores e o comportamento do ambiente Moodle.
- **Edição Direta e Fluida**:
  - No Dashboard, basta clicar em qualquer card de questão para entrar no modo de edição.
  - Interface limpa que prioriza o conteúdo e a velocidade de navegação.
- **Editor de Texto Rico (WYSIWYG)**: Formate enunciados e alternativas com negrito, itálico, listas e alinhamentos que persistem na exportação.
- **Sistema de Drag & Drop Inteligente**:
  - Arraste categorias para reorganizar a hierarquia na barra lateral.
  - Mova questões entre categorias arrastando os cards do painel central diretamente para as pastas na barra lateral.
- **Importação e Exportação Poderosas**:
  - **Importar**: Converta arquivos GIFT existentes em uma estrutura editável instantaneamente.
  - **Exportar**: Gere arquivos GIFT padronizados do banco completo ou de categorias específicas.
- **Privacidade Total**: Seus dados são armazenados localmente no navegador (LocalStorage). Nenhuma informação é enviada para servidores externos.

## 📖 Como Usar

### 1. Estrutura de Categorias
- Utilize o botão **"+ Root"** na barra lateral para criar categorias principais.
- Use os ícones de ação ao passar o mouse sobre as categorias para adicionar subníveis ou editar.
- Reorganize sua árvore arrastando uma categoria para dentro de outra.

### 2. Gestão de Questões
- **Criar**: Clique em "Nova Questão" após selecionar uma categoria.
- **Editar**: Clique em qualquer card de questão no painel central ou use o ícone de edição.
- **Mover**: Arraste uma questão do painel central para uma pasta na barra lateral para mudar sua categoria.

### 3. Simulador (Preview)
- Clique no ícone da **Lupa** (presente tanto nos cards quanto na barra lateral) para abrir o Simulador Moodle.
- Verifique se a formatação e as opções de múltipla escolha estão corretas antes de importar para o Moodle.

### 4. Importar Dados Existentes
- Clique em **"Importar GIFT"** na base da barra lateral e cole o conteúdo do seu arquivo. O sistema processará as marcas `$CATEGORY` e criará a estrutura automaticamente.

## 🛠 Tecnologias Utilizadas
- **React 19**: Framework de UI moderno e performante.
- **Tailwind CSS**: Estilização responsiva com suporte completo a Modo Escuro (Dark Mode).
- **Lucide/FontAwesome**: Iconografia clara e funcional.
- **GIFT Parser Customizado**: Lógica robusta para processamento de metadados e categorias.

## 📄 Licença
Desenvolvido para a comunidade educacional. Livre para uso, modificação e distribuição.