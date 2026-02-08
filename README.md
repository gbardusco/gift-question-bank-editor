# 🎓 Moodle GIFT Manager v2
> **Do Caos à Clareza Pedagógica:** A ferramenta definitiva para gestão visual de bancos de questões no formato GIFT.

![Licença](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blueviolet)

---

## 💡 O Pitch: Por que este projeto existe?

Todo professor que utiliza o Moodle conhece a dor de cabeça que é gerenciar o Banco de Questões nativo. A interface é lenta, a organização de categorias é burocrática e editar arquivos **GIFT** (General Import Format Technology) manualmente é um convite ao erro de sintaxe.

O **Moodle GIFT Manager** transforma esse processo técnico e árduo em uma experiência visual e fluida. Ele permite que educadores e designers instrucionais organizem milhares de questões com a facilidade de quem organiza pastas no computador, garantindo que o que você vê no editor é exatamente o que o aluno verá no Moodle.

---

## 🚀 Diferenciais Exclusivos

### 1. Hierarquia Multinível (Drag & Drop)
Ao contrário de outros editores que geram listas planas, nosso sistema foca na **estrutura**. Arraste categorias para dentro de outras e mova questões entre pastas com um clique. A organização lógica do seu curso começa aqui.

### 2. Simulador Fiel ao Moodle
Chega de importar arquivos para descobrir que uma imagem quebrou ou uma fórmula LaTeX não renderizou. Nosso simulador mimetiza o CSS e o comportamento do Moodle 5.0+, permitindo testes de resposta em tempo real.

### 3. Editor Rich Text com Superpoderes
Integramos o **Tiptap** (motor do Notion/Mirror) para oferecer:
- **LaTeX Nativo:** Assistente visual para fórmulas matemáticas complexas.
- **Limpeza de HTML:** O exportador limpa automaticamente códigos sujos vindos do Word, garantindo uma importação "limpa" no Moodle.
- **Suporte a Imagens:** Inserção via URL ou Base64.

### 4. Privacidade "Local-First"
Nenhum dado sai do seu navegador. O banco de dados utiliza o `LocalStorage` e as exportações são processadas inteiramente no lado do cliente. Segurança total para seus exames.

---

## 🛠️ Detalhes Técnicos

A aplicação foi construída com o que há de mais moderno no ecossistema Web:

- **Frontend:** React 19 (Hooks, Context, Memoization para performance em bancos grandes).
- **Estilização:** Tailwind CSS com suporte completo a **Dark Mode** e design responsivo.
- **Editor:** Tiptap (Headless Editor) configurado para gerar saída compatível com a engine do Moodle.
- **Renderização Matemática:** KaTeX para visualização instantânea de fórmulas.
- **Persistência:** Sistema de Registro de Bancos múltiplo (você pode ter vários bancos de questões diferentes no mesmo navegador).

---

## 💻 Guia de Instalação e Desenvolvimento

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **NPM** ou **Yarn**

### Passos para rodar localmente

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/gbardusco/gift-question-bank-editor.git
   cd gift-question-bank-editor
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *A aplicação estará disponível em `http://localhost:3000`*

4. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 📂 Estrutura do Projeto

```text
├── components/         # Componentes de UI (Modais, Editor, Árvore)
├── hooks/              # Lógica de estado (useQuestionStore, useTheme)
├── services/           # Motores de Exportação, Importação e Storage
├── constants.tsx       # Configurações globais e ícones
├── types.ts            # Definições de interfaces TypeScript
├── App.tsx             # Layout principal e orquestração
└── index.tsx           # Ponto de entrada da aplicação
```

---

## 📝 Formato GIFT Suportado

O sistema exporta arquivos `.txt` otimizados para Moodle 5.0, seguindo as regras:
- `$CATEGORY`: Caminhos automáticos baseados na sua árvore.
- `::Título::`: Nomes de questões limpos.
- `[html]`: Enunciados formatados.
- `=`: Respostas corretas.
- `~`: Distratores (opções incorretas).
- `{}`: Blocos de resposta para questões dissertativas.

---

## 🤝 Contribuição

Este é um projeto Open Source focado em melhorar a educação digital. Sinta-se à vontade para abrir issues ou enviar Pull Requests.