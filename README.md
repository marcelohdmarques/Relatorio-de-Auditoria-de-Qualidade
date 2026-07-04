# Relatório de Auditoria — SGQ

Projeto acadêmico da disciplina de **Front-end**, desenvolvido com **HTML, CSS e JavaScript puro** (sem frameworks ou bibliotecas externas).

A aplicação simula uma ferramenta de auditoria de um Sistema de Gestão da Qualidade (SGQ): lista os requisitos a serem verificados, permite registrar responsável, local e evidências de cada um, classificar o status da verificação e gera automaticamente um relatório em PDF com o percentual de conformidade.

## Objetivo

Praticar manipulação do DOM, renderização dinâmica de dados, manipulação de eventos, cálculo em tempo real e uso dos recursos nativos do navegador para geração de documentos (impressão/PDF), sem depender de bibliotecas externas.

## Estrutura de arquivos

```
relatorio-auditoria/
├── index.html   → estrutura da página (cabeçalho, painel, lista de requisitos)
├── style.css    → estilo visual (tela) e estilo de impressão (PDF)
├── data.js      → base de dados dos requisitos da auditoria
├── script.js    → lógica: renderização, eventos, cálculos e geração do relatório
└── README.md    → este arquivo
```

## Como executar

1. Baixe os 4 arquivos (`index.html`, `style.css`, `script.js`, `data.js`) e mantenha-os na **mesma pasta**.
2. Dê duplo clique em `index.html` para abrir no navegador (Chrome, Firefox ou Edge).
3. Não é necessário instalar nada nem rodar servidor — é um projeto 100% estático.

## Funcionalidades

### 1. Dados da auditoria
Campos no topo da página para preencher **empresa auditada**, **auditor responsável**, **data** e **escopo** da auditoria. Esses dados entram na capa do relatório em PDF.

### 2. Lista de requisitos (dados dinâmicos)
Os 10 requisitos ficam armazenados em `data.js`, em um array de objetos. O `script.js` percorre esse array com `.forEach()` e monta um "card" HTML para cada requisito, exibindo:
- código e título do requisito (ex.: `4.1` — Requisitos gerais);
- departamento responsável;
- lista de pontos de verificação (checklist);
- campos de texto: **Responsável**, **Local** e **Evidências**;
- botões de status: **Conforme**, **Não Conforme** e **Não Aplicável**.

Cada campo é ligado por eventos (`input` e `click`) diretamente ao objeto correspondente no array `auditoria`, então tudo que é digitado ou selecionado na tela fica salvo na estrutura de dados em memória.

### 3. Painel de conformidade (tempo real)
Um medidor circular (gráfico em SVG, sem bibliotecas) mostra o percentual de conformidade, além de contadores de quantos requisitos estão conformes, não conformes, não aplicáveis ou ainda pendentes. Tudo é recalculado a cada clique em um botão de status.

**Fórmula do percentual:**

```
% de conformidade = conforme / (conforme + não conforme) × 100
```

Itens marcados como "não aplicável" ou ainda não avaliados ("pendente") não entram no denominador, pois não fazem sentido penalizar ou favorecer o resultado com requisitos que não se aplicam ao escopo auditado — prática comum em auditorias reais.

### 4. Geração do relatório em PDF
Ao clicar em **"Gerar relatório em PDF"**, o JavaScript:
1. Recalcula o resumo de conformidade;
2. Monta uma capa (empresa, auditor, data, escopo e tabela-resumo);
3. Substitui os botões de status por etiquetas de texto (já que botões não fazem sentido em um documento impresso);
4. Chama `window.print()`, a função nativa do navegador para impressão.

Na janela de impressão que se abre, basta escolher a opção **"Salvar como PDF"** como destino. Uma folha de estilo específica (`@media print` no `style.css`) reorganiza o layout para o formato de papel, escondendo os elementos interativos (botões, cabeçalho fixo) e exibindo apenas o conteúdo do relatório.

> Essa abordagem foi escolhida por não depender de nenhuma biblioteca externa (como jsPDF), funcionando totalmente offline e com total controle do layout via CSS.

## Tecnologias utilizadas

- **HTML5** — estrutura semântica da página.
- **CSS3** — variáveis CSS (`:root`), Flexbox, Grid, SVG e `@media print`.
- **JavaScript (ES6+)** — manipulação do DOM, `template literals`, `arrow functions`, `Array.prototype` (`filter`, `map`, `forEach`).

## Possíveis melhorias futuras

- Salvar os dados preenchidos no `localStorage`, para não perdê-los ao atualizar a página.
- Exportar/importar os dados da auditoria em JSON.
- Adicionar múltiplas auditorias (histórico).
- Validar campos obrigatórios antes de liberar a geração do PDF.

## Autor

Marcelo Henrique D. Marques — Trabalho acadêmico da disciplina de Front-end.
