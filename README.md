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

Desenvolvido com ❤️ para fins educativos.*
