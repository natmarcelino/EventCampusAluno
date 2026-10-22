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
