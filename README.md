# Moodle GIFT Manager

Uma aplicação web profissional e de alta performance projetada para educadores e designers instrucionais gerenciarem bancos de questões complexos no formato GIFT (General Import Format Technology) do Moodle.

## 🚀 Principais Funcionalidades

- **Organização Hierárquica**: Crie níveis infinitos de categorias e subcategorias para manter suas questões organizadas.
- **Simulador de Questões Moodle**: Visualize como suas questões aparecerão no ambiente real do Moodle através de um simulador integrado que mimetiza o layout clássico da plataforma.
- **Editor de Texto Rico (WYSIWYG)**: Suporte completo para formatação de texto (negrito, listas, alinhamento) tanto no enunciado quanto nas alternativas.
- **Drag & Drop Nativo**:
  - Reorganize categorias arrastando-as umas para as outras na sidebar.
  - Mova questões entre pastas instantaneamente arrastando os cards do dashboard para a árvore lateral.
- **Dashboard Interativo**: Fluxo de trabalho otimizado onde clicar em qualquer card de questão abre instantaneamente o modo de edição.
- **Importação/Exportação Inteligente**:
  - **Importar**: Cole arquivos GIFT existentes para reconstruir automaticamente a árvore de categorias e questões.
  - **Exportar**: Baixe o banco completo ou categorias específicas formatadas perfeitamente para o Moodle.
- **Privacidade e Persistência**: Todos os dados são salvos localmente no seu navegador (LocalStorage). Nenhum dado sai da sua máquina a menos que você escolha exportar.

## 📖 Como Usar

### 1. Gerenciando Categorias
- Use o botão **"+ Root"** para criar categorias de nível superior.
- Passe o mouse sobre qualquer categoria na sidebar para ver opções de adicionar subcategorias, editar nomes ou excluir.
- **Mover**: Clique e segure uma categoria para movê-la para dentro de outra.

### 2. Criando e Editando Questões
- Selecione uma categoria na sidebar para ver suas questões.
- Clique em **"Nova Questão"** no cabeçalho ou **clique diretamente em um card** no dashboard para editar uma questão existente.
- Para Múltipla Escolha, defina a alternativa correta usando o botão de rádio.

### 3. Simulador Moodle (Preview)
- Na árvore lateral (sidebar), clique no ícone de **Lupa** ao lado do nome de uma questão para abrir o simulador.
- Isso permite verificar se a formatação e as alternativas estão visualmente corretas antes de levar o arquivo para o Moodle.

### 4. Organizando com Drag & Drop
- Você pode mover questões entre categorias sem abrir o formulário. Basta arrastar o card da questão no painel principal e soltá-lo sobre a pasta de destino na sidebar.

### 5. Importação e Exportação
- **Importar**: Clique em "Importar GIFT" no rodapé da sidebar e cole o conteúdo do seu arquivo `.txt` ou `.gift`.
- **Exportar**: Use o botão no rodapé da sidebar para baixar todo o repositório organizado.

## 🛠 Tecnologias
- **React 19**
- **Tailwind CSS** (Design Responsivo e Dark Mode)
- **FontAwesome 6** (Iconografia)
- **Local Storage API** (Persistência de dados)

## 📄 Licença
Este projeto é de código aberto e disponível para uso educacional e profissional.