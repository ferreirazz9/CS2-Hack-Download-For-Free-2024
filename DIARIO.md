# Diário de Chamada

App de chamada para professores usarem no celular. Arquivo único: `index.html`.

## O que faz

- **Turmas**: cada turma tem sua lista de alunos (dá para colar a lista inteira, um nome por linha).
- **Aulas**: cada professor cadastra a própria matéria com o nome que quiser, a turma, os dias da semana e o horário.
- **Hoje**: mostra as aulas do dia em ordem de horário, destaca a aula que está acontecendo agora e indica quais já têm chamada.
- **Chamada**: todos começam com **P**; toque no aluno que faltou para marcar **F**. Mostra o histórico das chamadas anteriores daquela aula.
- **Lanches**: soma quantos alunos estão presentes hoje em todas as turmas. Cada aluno conta uma vez por dia, mesmo que apareça em chamadas de várias matérias. Mostra também quantos alunos ainda podem chegar das turmas sem chamada e copia um resumo para mandar à cozinha.

## Como usar

- **Compartilhado (recomendado)**: o app está publicado como página do Claude com banco de dados em tempo real. Compartilhe o link com os professores com acesso de **Colaborador** para que todos possam fazer chamadas; quem tiver só acesso de leitura vê os dados, mas não grava.
- **Só neste aparelho**: aberto fora do Claude (por exemplo, pelo GitHub Pages), o app funciona igual, mas os dados ficam salvos apenas no navegador daquele celular.
