// script.js

const STATUS = {
  CONFORME: "conforme",
  NAO_CONFORME: "nao-conforme",
  NAO_APLICAVEL: "nao-aplicavel",
};

const STATUS_LABEL = {
  [STATUS.CONFORME]: "Conforme",
  [STATUS.NAO_CONFORME]: "Não Conforme",
  [STATUS.NAO_APLICAVEL]: "Não Aplicável",
};

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 84; // r = 84

const listaEl = document.getElementById("listaRequisitos");

/* ==========================================================================
   RENDERIZAÇÃO DOS CARDS
   ========================================================================== */
function renderCard(item, index) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.index = index;

  const checklistItems = item.pontosVerificacao
    .map((ponto) => `<li>${ponto}</li>`)
    .join("");

  const statusButtons = Object.values(STATUS)
    .map(
      (value) => `
      <button type="button" class="status-btn" data-value="${value}">
        ${STATUS_LABEL[value]}
      </button>`
    )
    .join("");

  card.innerHTML = `
    <div class="card-head">
      <span class="card-code">${item.requisito}</span>
      <h2>${item.titulo}</h2>
      <span class="card-dept">${item.departamento}</span>
    </div>

    <ul class="checklist">${checklistItems}</ul>

    <div class="card-fields">
      <div class="field">
        <label>Responsável</label>
        <input type="text" data-field="responsavel" placeholder="Nome do responsável">
      </div>
      <div class="field">
        <label>Local</label>
        <input type="text" data-field="local" placeholder="Setor / local verificado">
      </div>
      <div class="field evidencias">
        <label>Evidências</label>
        <textarea data-field="evidencias" rows="2" placeholder="Documentos, registros ou observações coletadas na verificação"></textarea>
      </div>
    </div>

    <div class="status-row">
      <div class="status-options">${statusButtons}</div>
    </div>
  `;

  // liga os campos de texto ao objeto de dados
  card.querySelectorAll("[data-field]").forEach((el) => {
    el.addEventListener("input", () => {
      item[el.dataset.field] = el.value;
    });
  });

  // liga os botões de status
  card.querySelectorAll(".status-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      item.status = btn.dataset.value;
      atualizarEstadoCard(card, item.status);
      atualizarPainel();
    });
  });

  listaEl.appendChild(card);
}

function atualizarEstadoCard(card, status) {
  card.dataset.status = status;
  card.querySelectorAll(".status-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === status);
  });
}

function renderTudo() {
  listaEl.innerHTML = "";
  auditoria.forEach(renderCard);
}

/* ==========================================================================
   PAINEL DE CONFORMIDADE
   ========================================================================== */
function atualizarPainel() {
  const total = auditoria.length;
  const conforme = auditoria.filter((i) => i.status === STATUS.CONFORME).length;
  const naoConforme = auditoria.filter((i) => i.status === STATUS.NAO_CONFORME).length;
  const naoAplicavel = auditoria.filter((i) => i.status === STATUS.NAO_APLICAVEL).length;
  const pendente = total - conforme - naoConforme - naoAplicavel;

  document.getElementById("countTotal").textContent = total;
  document.getElementById("countConforme").textContent = conforme;
  document.getElementById("countNaoConforme").textContent = naoConforme;
  document.getElementById("countNaoAplicavel").textContent = naoAplicavel;
  document.getElementById("countPendente").textContent = pendente;

  // percentual de conformidade: conforme / (avaliados aplicáveis)
  const avaliadosAplicaveis = conforme + naoConforme;
  const percentual = avaliadosAplicaveis === 0
    ? 0
    : Math.round((conforme / avaliadosAplicaveis) * 100);

  document.getElementById("gaugePercentText").textContent = `${percentual}%`;

  const offset = GAUGE_CIRCUMFERENCE - (percentual / 100) * GAUGE_CIRCUMFERENCE;
  const gaugeCircle = document.getElementById("gaugeCircle");
  gaugeCircle.style.strokeDashoffset = offset;

  let cor = "var(--pendente)";
  if (avaliadosAplicaveis > 0) {
    if (percentual >= 80) cor = "var(--conforme)";
    else if (percentual >= 50) cor = "var(--nao-aplicavel)";
    else cor = "var(--nao-conforme)";
  }
  gaugeCircle.style.stroke = cor;

  return { total, conforme, naoConforme, naoAplicavel, pendente, percentual };
}

/* ==========================================================================
   GERAÇÃO DO RELATÓRIO (PDF via impressão do navegador)
   ========================================================================== */
function montarCapaImpressao(resumo) {
  const empresa = document.getElementById("empresa").value || "—";
  const auditor = document.getElementById("auditor").value || "—";
  const dataInput = document.getElementById("dataAuditoria").value;
  const escopo = document.getElementById("escopo").value || "—";

  const dataFormatada = dataInput
    ? new Date(dataInput + "T00:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  const cover = document.getElementById("printCover");
  cover.innerHTML = `
    <h1>Relatório de Auditoria — SGQ</h1>
    <p>Documento gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
    <div class="cover-grid">
      <div><strong>Empresa auditada:</strong> ${empresa}</div>
      <div><strong>Auditor responsável:</strong> ${auditor}</div>
      <div><strong>Data da auditoria:</strong> ${dataFormatada}</div>
      <div><strong>Escopo:</strong> ${escopo}</div>
    </div>

    <div class="print-summary">
      <h3>Resumo da conformidade</h3>
      <table>
        <thead>
          <tr>
            <th>Total de requisitos</th>
            <th>Conforme</th>
            <th>Não conforme</th>
            <th>Não aplicável</th>
            <th>Pendente</th>
            <th>% de conformidade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${resumo.total}</td>
            <td>${resumo.conforme}</td>
            <td>${resumo.naoConforme}</td>
            <td>${resumo.naoAplicavel}</td>
            <td>${resumo.pendente}</td>
            <td><strong>${resumo.percentual}%</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function montarTagsStatusImpressao() {
  document.querySelectorAll(".card").forEach((card) => {
    const status = card.dataset.status || "pendente";
    const label = status === "pendente" ? "Pendente" : STATUS_LABEL[status];

    let tag = card.querySelector(".status-tag-print");
    if (!tag) {
      tag = document.createElement("span");
      tag.className = "status-tag-print";
      card.querySelector(".status-row").appendChild(tag);
    }
    tag.textContent = label;
    tag.className = `status-tag-print ${status}`;
  });
}

function gerarRelatorioPdf() {
  const resumo = atualizarPainel();
  montarCapaImpressao(resumo);
  montarTagsStatusImpressao();
  window.print();
}

document.getElementById("btnGerarPdf").addEventListener("click", gerarRelatorioPdf);

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
renderTudo();
atualizarPainel();
