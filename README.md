# 🎓 Campo Minado Educativo com IA (Gemini)

Um jogo de Campo Minado reimaginado como uma ferramenta pedagógica. Neste projeto, as "minas" não são apenas obstáculos, mas oportunidades de aprendizado. Ao encontrar uma bomba, o jogador deve responder a uma pergunta gerada por Inteligência Artificial para desarmá-la.

---

## 🌟 Sobre o Projeto

O **Campo Minado Educativo** foi desenvolvido para transformar o clássico jogo de lógica em uma experiência de aprendizado dinâmica para alunos do Ensino Fundamental II. O diferencial está na integração com o **Google Gemini API**, que gera perguntas personalizadas e fornece explicações didáticas em tempo real.

### Como funciona:
1.  **Exploração:** O jogador navega pelo campo como no jogo tradicional.
2.  **Desafio IA:** Ao clicar em uma mina, em vez de explodir imediatamente, o jogo consulta a IA para gerar uma pergunta sobre a matéria selecionada.
3.  **Sistema de Vidas:** Acertar a pergunta desarma a bomba e permite continuar. Errar consome uma das 3 vidas.
4.  **Feedback Pedagógico:** Independentemente de acertar ou errar, a IA fornece uma explicação detalhada sobre o tema para garantir a fixação do conteúdo.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza uma stack moderna focada em performance e tipagem segura:

-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (TSX)
-   **Frontend:** [React 19](https://react.dev/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Ícones:** [Lucide React](https://lucide.dev/)
-   **Inteligência Artificial:** [Google Generative AI SDK (@google/genai)](https://ai.google.dev/)
-   **Build Tool:** [Vite](https://vitejs.dev/)

---

## 🧠 Integração com Inteligência Artificial

O projeto utiliza o modelo **Gemini 3 Flash** para duas funções críticas:
-   `generateQuestion`: Cria perguntas de múltipla escolha com distratores (opções incorretas) plausíveis, adaptadas ao nível escolar.
-   `getExplanation`: Atua como um tutor, explicando o erro ou reforçando o acerto do aluno após cada desafio.

---

## 🛠️ Configuração e Instalação

### Pré-requisitos
-   Node.js instalado.
-   Uma chave de API do Google Gemini (obtenha em [Google AI Studio](https://aistudio.google.com/)).

### Passo a passo
1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/campo-minado-educativo.git
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure a variável de ambiente:
    Crie um arquivo `.env` na raiz ou configure sua chave de API como `API_KEY`.
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

---

## 📚 Contexto Acadêmico

Este projeto foi documentado utilizando fluxos de design profissional.
-   **Design System:** Criado com base no Tailwind CSS para garantir consistência visual.
-   **UI/UX:** Protótipo estruturado para facilitar a acessibilidade e o engajamento do aluno.
-   **Arquitetura:** Componentização seguindo os padrões de Single Page Application (SPA).

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---
*Desenvolvido com ❤️ para fins educativos.*
