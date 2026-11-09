# Diário de Chamada no Google Planilhas

Os professores abrem um link no navegador do celular, digitam o PIN da escola uma vez e já podem fazer chamada. Não precisam instalar nada nem fazer login. Os dados ficam numa planilha Google da coordenação.

A instalação leva uns 10 minutos e é mais fácil num **computador**.

## 1. Criar a planilha e o código

1. Entre em [sheets.new](https://sheets.new) com a conta Google da escola. Dê o nome **Diário de Chamada**.
2. No menu, abra **Extensões > Apps Script**.
3. No arquivo `Código.gs` que já vem aberto, apague tudo e cole o conteúdo de [`Codigo.gs`](Codigo.gs).
4. Clique em **+** (Arquivos) > **HTML**, dê o nome `Index` (sem o `.html`), apague tudo e cole o conteúdo de [`../index.html`](../index.html).
5. Opcional, para já vir com os horários do SCFV e os alunos do reforço: clique em **+** > **Script**, dê o nome `Base` e cole o conteúdo do arquivo `Base.gs` que você recebeu.
6. Clique em **Salvar** (ícone de disquete).

## 2. Instalar

1. Na barra de cima, escolha a função **instalar** e clique em **Executar**.
2. O Google pede autorização: **Revisar permissões**, escolha sua conta, **Avançado > Acessar Diário de Chamada (não seguro)** e **Permitir**. O aviso aparece porque o código é seu e não foi publicado na loja do Google.
3. Volte à planilha: devem aparecer as abas **Config, Turmas, Alunos, Aulas e Chamadas**.

## 3. Publicar o link

1. No Apps Script, clique em **Implantar > Nova implantação**.
2. Na engrenagem, escolha **App da Web**.
3. **Executar como:** Eu. **Quem pode acessar:** Qualquer pessoa.
4. Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).
5. Mande esse link e o PIN no grupo dos professores.

## PIN

- PIN provisório: **4826**.
- Para trocar, mude a célula **B1** da aba **Config**. Na próxima atualização, os celulares pedem o PIN novo.

## No celular de cada professor

1. Abrir o link e digitar o PIN.
2. Na aba **Aulas**, tocar em **Assumir** nas próprias aulas e confirmar o nome.
3. Para virar um ícone na tela: no Chrome (Android), menu **⋮ > Adicionar à tela inicial**. No Safari (iPhone), **Compartilhar > Adicionar à Tela de Início**.

## Bom saber

- Os celulares atualizam sozinhos a cada 20 segundos e sempre que o app volta para a tela.
- A aba **Chamadas** da planilha tem uma linha por aula e por dia, com o número de presentes e os nomes de quem faltou. Dá para filtrar e fazer relatórios.
- Não edite as colunas de código (id, aulaId, presentes, ausentes etc.) direto na planilha. Use o app.
- Quando mudar o `index.html` ou o `Codigo.gs`, cole a nova versão no Apps Script e use **Implantar > Gerenciar implantações > Editar (lápis) > Versão: Nova versão**. Assim o link continua o mesmo.
