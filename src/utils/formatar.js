// src/utils/formatar.js
// Datas vêm da API como "2026-10-21". Usar new Date("2026-10-21") no Brasil mostra
// o dia ANTERIOR (o JS interpreta como meia-noite UTC). Por isso montamos a data manualmente.

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
  'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function formatarData(iso, longo = false) {
  if (!iso) return '';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  if (!a || !m || !d) return String(iso);
  return longo ? `${Number(d)} de ${MESES[Number(m) - 1]} de ${a}` : `${d}/${m}/${a}`;
}

export function formatarHora(h) {
  return h ? String(h).slice(0, 5) : '';
}

export function formatarHorario(inicio, fim) {
  const i = formatarHora(inicio), f = formatarHora(fim);
  return i && f ? `${i} às ${f}` : i;
}

/** Data de hoje (fuso do celular) no formato da API: "2026-11-15". */
export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "1 vaga", "12 vagas", "Esgotado". */
export function textoVagas(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  if (v <= 0) return 'Esgotado';
  return v === 1 ? '1 vaga' : `${v} vagas`;
}

/** A confirmação de presença só faz sentido no dia de um evento ativo. */
export function podeConfirmarPresenca(status, data) {
  return status === 'ATIVO' && !!data && String(data).slice(0, 10) === hojeISO();
}