/**
 * Diário de Chamada: servidor no Google Apps Script.
 * Guarda turmas, alunos, aulas e chamadas em abas da planilha.
 * Instalação: veja google-planilhas/COMO-INSTALAR.md
 */

const PIN_PROVISORIO = '4826';

const ABAS = {
  turmas:   ['id', 'nome'],
  alunos:   ['id', 'turmaId', 'nome'],
  aulas:    ['id', 'materia', 'professor', 'turmaId', 'dias', 'inicio', 'fim', 'ownerId'],
  // as primeiras colunas são para leitura da coordenação; as últimas são usadas pelo app
  chamadas: ['id', 'data', 'materia', 'turma', 'presentesN', 'ausentesN', 'total', 'ausentesNomes',
             'aulaId', 'turmaId', 'presentes', 'ausentes', 'por', 'em'],
};
const NOMES_ABAS = { turmas: 'Turmas', alunos: 'Alunos', aulas: 'Aulas', chamadas: 'Chamadas' };
const COLS_JSON = ['dias', 'presentes', 'ausentes'];
const COLS_NUM = ['total', 'presentesN', 'ausentesN'];

/* ---------- página ---------- */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Diário de Chamada')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/* ---------- instalação (rodar uma vez pelo editor) ---------- */
function instalar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('PLANILHA', ss.getId());
  const cfg = ss.getSheetByName('Config') || ss.insertSheet('Config', 0);
  if (!cfg.getRange('B1').getDisplayValue()) {
    cfg.getRange('A1:B1').setNumberFormat('@').setValues([['PIN', PIN_PROVISORIO]]);
    cfg.getRange('A3').setValue('Troque o PIN na célula B1 quando quiser. Os professores digitam o novo PIN no celular.');
  }
  Object.keys(ABAS).forEach(c => aba_(c));
  // base inicial (arquivo Base.gs, opcional)
  if (typeof BASE !== 'undefined') {
    ['turmas', 'alunos', 'aulas'].forEach(c => {
      if (BASE[c] && ler_(c).length === 0) gravarVarios_(c, BASE[c]);
    });
  }
  const padrao = ss.getSheetByName('Página1') || ss.getSheetByName('Sheet1');
  if (padrao && padrao.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(padrao);
  return 'Pronto. PIN: ' + cfg.getRange('B1').getDisplayValue();
}

/* ---------- API chamada pelo app ---------- */
function apiLoad(pin, hoje) {
  confere_(pin);
  return estado_(hoje);
}
function apiPut(pin, colecao, id, dados, hoje) {
  confere_(pin);
  return comTrava_(() => { gravarVarios_(colecao, [{ id: id, data: dados }]); return estado_(hoje); });
}
function apiPutMany(pin, colecao, linhas, hoje) {
  confere_(pin);
  return comTrava_(() => { gravarVarios_(colecao, linhas); return estado_(hoje); });
}
function apiDel(pin, colecao, ids, hoje) {
  confere_(pin);
  return comTrava_(() => { apagar_(colecao, ids); return estado_(hoje); });
}
function apiQuery(pin, colecao, campo, valor) {
  confere_(pin);
  return ler_(colecao).filter(r => r[campo] === valor);
}

/* ---------- internos ---------- */
function planilha_() {
  const id = PropertiesService.getScriptProperties().getProperty('PLANILHA');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function confere_(pin) {
  const cfg = planilha_().getSheetByName('Config');
  const certo = cfg ? String(cfg.getRange('B1').getDisplayValue()).trim() : PIN_PROVISORIO;
  if (String(pin || '').trim() !== certo) throw new Error('PIN');
}
function comTrava_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function colecaoValida_(c) {
  if (!Object.prototype.hasOwnProperty.call(ABAS, c)) throw new Error('Coleção inválida');
}
function aba_(c) {
  colecaoValida_(c);
  const ss = planilha_();
  let sh = ss.getSheetByName(NOMES_ABAS[c]);
  if (!sh) {
    sh = ss.insertSheet(NOMES_ABAS[c]);
    const cols = ABAS[c].length;
    sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@'); // tudo como texto: datas e horários não viram números
    sh.getRange(1, 1, 1, cols).setValues([ABAS[c]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function ler_(c) {
  const sh = aba_(c), cols = ABAS[c];
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, cols.length).getDisplayValues()
    .filter(l => l[0])
    .map(l => {
      const o = {};
      cols.forEach((k, i) => {
        let v = l[i];
        if (COLS_JSON.indexOf(k) >= 0) { try { v = v ? JSON.parse(v) : []; } catch (e) { v = []; } }
        else if (COLS_NUM.indexOf(k) >= 0) v = Number(v) || 0;
        o[k] = v;
      });
      return o;
    });
}
function texto_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v).slice(0, 2000);
}
function gravarVarios_(c, linhas) {
  colecaoValida_(c);
  const sh = aba_(c), cols = ABAS[c];
  const ultima = sh.getLastRow();
  const ids = ultima > 1 ? sh.getRange(2, 1, ultima - 1, 1).getDisplayValues().map(l => l[0]) : [];
  let extra = c === 'chamadas' ? contexto_() : null;
  let proxima = ultima + 1;
  linhas.forEach(item => {
    const id = String(item.id || '').slice(0, 200);
    if (!id) return;
    const d = Object.assign({}, item.data, { id: id });
    if (extra) completaChamada_(d, extra);
    const valores = [cols.map(k => texto_(d[k]))];
    const pos = ids.indexOf(id);
    let linha;
    if (pos >= 0) linha = pos + 2;
    else {
      linha = proxima++;
      ids.push(id);
      if (linha > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 200);
    }
    sh.getRange(linha, 1, 1, cols.length).setNumberFormat('@').setValues(valores);
  });
}
function apagar_(c, ids) {
  colecaoValida_(c);
  const sh = aba_(c);
  const ultima = sh.getLastRow();
  if (ultima < 2) return;
  const atuais = sh.getRange(2, 1, ultima - 1, 1).getDisplayValues().map(l => l[0]);
  const alvo = {};
  (ids || []).forEach(id => alvo[id] = true);
  for (let i = atuais.length - 1; i >= 0; i--) if (alvo[atuais[i]]) sh.deleteRow(i + 2);
}
function contexto_() {
  const turmas = {}, alunos = {};
  ler_('turmas').forEach(t => turmas[t.id] = t.nome);
  ler_('alunos').forEach(a => alunos[a.id] = a.nome);
  return { turmas: turmas, alunos: alunos };
}
function completaChamada_(d, ctx) {
  d.turma = ctx.turmas[d.turmaId] || '';
  d.presentesN = (d.presentes || []).length;
  d.ausentesN = (d.ausentes || []).length;
  d.ausentesNomes = (d.ausentes || []).map(id => ctx.alunos[id] || '?').join(', ');
}
function estado_(hoje) {
  return {
    turmas: ler_('turmas'),
    alunos: ler_('alunos'),
    aulas: ler_('aulas'),
    chamadas: ler_('chamadas').filter(r => r.data === hoje),
  };
}
