import React, { useState, useEffect } from 'react';
import '../../componentes/cardNomePag/nomePag.css';
import './css-dashboard/dashboard.css';
import buscarDadosDashboard from './servico/dashboardService';

function Dashboard() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dadosDashboard, setDadosDashboard] = useState({
    colaboradores: [],
    setores: [],
    avaliacoes: [],
    participacoes: [],
    avaliacoesSetores: [],
    avaliacoesCargos: [],
    documentos: [],
    ferias: [],
    planosAcao: [],
  });

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro('');

        const resultado = await buscarDadosDashboard();
        setDadosDashboard(resultado);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setErro(err.message || 'Erro ao carregar o dashboard.');
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  // --- CÁLCULOS E EXTRAÇÃO DOS DADOS DO BANCO / API ---
  const totalColaboradores = dadosDashboard.colaboradores?.length ?? 248;
  const totalPendencias = (dadosDashboard.documentos?.length ?? 0) + (dadosDashboard.ferias?.length ?? 0);
  const totalPesquisas = dadosDashboard.avaliacoes?.length ?? 3;
  const totalPlanos = dadosDashboard.planosAcao?.length ?? 5;

  const kpis = [
    {
      id: 1,
      titulo: 'Total de colaboradores',
      valor: String(totalColaboradores),
      statusTexto: 'Ativos na organização',
      statusCor: 'verde',
      iconeBg: '#dcfce7',
      iconeCor: '#16a34a',
      linkTexto: 'Ver todos os colaboradores',
      iconeTipo: 'usuarios',
      statusIcone: 'seta-cima',
    },
    {
      id: 2,
      titulo: 'Pendências',
      valor: String(totalPendencias),
      statusTexto: 'Documentos e férias pendentes',
      statusCor: 'amarelo',
      iconeBg: '#fef9c3',
      iconeCor: '#ca8a04',
      linkTexto: 'Ver todas as pendências',
      iconeTipo: 'relogio',
      statusIcone: 'exclamacao',
    },
    {
      id: 3,
      titulo: 'Pesquisas e avaliações',
      valor: String(totalPesquisas),
      statusTexto: 'Em andamento',
      statusCor: 'azul',
      iconeBg: '#dbeafe',
      iconeCor: '#2563eb',
      linkTexto: 'Ver todas as pesquisas',
      iconeTipo: 'documento',
      statusIcone: 'pulso',
    },
    {
      id: 4,
      titulo: 'Planos de ação',
      valor: String(totalPlanos),
      statusTexto: 'Registrados no sistema',
      statusCor: 'amarelo',
      iconeBg: '#fef9c3',
      iconeCor: '#ca8a04',
      linkTexto: 'Ver todos os planos de ação',
      iconeTipo: 'check-circulo',
      statusIcone: 'alerta',
    },
  ];

  const indicadores = [
    { nome: 'Satisfação', nota: '4,2 / 5', percentual: 84, status: 'Normal', tipo: 'normal' },
    { nome: 'Ambiente', nota: '4,0 / 5', percentual: 80, status: 'Normal', tipo: 'normal' },
    { nome: 'Comunicação', nota: '3,8 / 5', percentual: 76, status: 'Normal', tipo: 'normal' },
    { nome: 'Reconhecimento', nota: '3,5 / 5', percentual: 70, status: 'Atenção', tipo: 'atencao' },
    { nome: 'Carga de trabalho', nota: '2,9 / 5', percentual: 58, status: 'Prioridade', tipo: 'prioridade' },
  ];

  const pesquisasFormatadas = (dadosDashboard.avaliacoes?.length > 0
    ? dadosDashboard.avaliacoes.slice(0, 3)
    : [
        { titulo: 'Pesquisa de Clima Organizacional', setor: 'Produção', participacao: 27, status: 'Em andamento' },
        { titulo: 'Experiência do Colaborador', setor: 'Tecnologia', participacao: 55, status: 'Em andamento' },
        { titulo: 'Avaliação Psicossocial', setor: 'Administrativo', participacao: 42, status: 'Em andamento' },
      ]
  ).map((pesq, idx) => ({
    nome: pesq.titulo ?? pesq.nome ?? `Pesquisa ${idx + 1}`,
    setor: pesq.setor ?? pesq.nome_setor ?? 'Geral',
    participacao: pesq.participacao ?? 50,
    metaTexto: idx === 0 ? '< meta' : '',
    corBarra: idx === 0 ? '#e69500' : '#0b5ed7',
    corTexto: idx === 0 ? '#d97706' : '#1e293b',
    status: pesq.status ?? 'Em andamento',
  }));

  const planosFormatados = (dadosDashboard.planosAcao?.length > 0
    ? dadosDashboard.planosAcao.slice(0, 4)
    : [
        { titulo: 'Carga de trabalho', origem: 'Indicador', responsavel: 'Gestor Produção', prazo: '15/09/2026', status: 'Em andamento' },
        { titulo: 'Comunicação interna', origem: 'Pesquisa', responsavel: 'RH', prazo: '20/09/2026', status: 'Não iniciada' },
        { titulo: 'Ambiente', origem: 'Avaliação', responsavel: 'Gestor', prazo: '05/09/2026', status: 'Atrasada' },
      ]
  ).map((plano) => {
    const statusStr = String(plano.status ?? plano.situacao ?? 'Em andamento');
    const atrasado = statusStr.toLowerCase().includes('atrasada') || statusStr.toLowerCase().includes('atrasado');

    return {
      plano: plano.titulo ?? plano.descricao ?? 'Plano de Ação',
      origem: plano.origem ?? 'Sistema',
      responsavel: plano.responsavel ?? plano.nome_responsavel ?? 'RH',
      prazo: plano.prazo ?? plano.data_termino ?? '20/09/2026',
      status: statusStr,
      atrasado,
      statusTipo: atrasado ? 'atrasada' : statusStr.toLowerCase().includes('não') ? 'nao-iniciada' : 'andamento',
    };
  });

  const renderKpiIcone = (tipo, cor) => {
    switch (tipo) {
      case 'usuarios':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'relogio':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'documento':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'check-circulo':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderStatusIcone = (tipo) => {
    switch (tipo) {
      case 'seta-cima':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        );
      case 'exclamacao':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'pulso':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        );
      case 'alerta':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="card-tiulo">
        <div className="titulo-descricao">
          <h2>Dashboard</h2>
          <p>Visão geral da organização e principais informações.</p>
        </div>
      </div>

      <div className="dashboard-conteudo">
        {erro && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 500 }}>
            {erro}
          </div>
        )}

        {carregando ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            Carregando dados do dashboard...
          </div>
        ) : (
          <>
            {/* Linha 1: 4 Cards de Resumo */}
            <section className="kpi-grid">
              {kpis.map((item) => (
                <div key={item.id} className="dash-card kpi-card">
                  <div className="kpi-topo">
                    <span className="kpi-titulo">{item.titulo}</span>
                    <span
                      className="kpi-icone-box"
                      style={{ backgroundColor: item.iconeBg }}
                    >
                      {renderKpiIcone(item.iconeTipo, item.iconeCor)}
                    </span>
                  </div>

                  <div className="kpi-numero">{item.valor}</div>

                  <div className={`kpi-substatus status-${item.statusCor}`}>
                    {renderStatusIcone(item.statusIcone)}
                    <span>{item.statusTexto}</span>
                  </div>

                  <a href="#/" className="dash-link" onClick={(e) => e.preventDefault()}>
                    {item.linkTexto}
                  </a>
                </div>
              ))}
            </section>

            {/* Linha 2: Indicadores (esquerda) + Pesquisas em andamento (direita) */}
            <section className="meio-grid">
              <div className="dash-card card-indicadores">
                <h3 className="card-titulo-secao">Indicadores</h3>

                <div className="indicadores-lista">
                  {indicadores.map((ind, idx) => (
                    <div key={idx} className="indicador-item">
                      <div className="indicador-linha-info">
                        <span className="indicador-nome">{ind.nome}</span>
                        <div className="indicador-direita">
                          <span className={`indicador-nota nota-${ind.tipo}`}>
                            {ind.nota}
                          </span>
                          <span className={`badge-indicador badge-${ind.tipo}`}>
                            {ind.status}
                          </span>
                        </div>
                      </div>
                      <div className="indicador-barra-bg">
                        <div
                          className={`indicador-barra-fill fill-${ind.tipo}`}
                          style={{ width: `${ind.percentual}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card-rodape-link">
                  <a href="#/" className="dash-link" onClick={(e) => e.preventDefault()}>
                    Ver Mais
                  </a>
                </div>
              </div>

              <div className="dash-card card-pesquisas">
                <h3 className="card-titulo-secao">Pesquisas em andamento</h3>

                <div className="tabela-responsiva">
                  <table className="dash-tabela tabela-pesquisas">
                    <thead>
                      <tr>
                        <th>PESQUISA</th>
                        <th>SETOR</th>
                        <th>PARTICIPAÇÃO</th>
                        <th>STATUS</th>
                        <th>AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pesquisasFormatadas.map((pesq, idx) => (
                        <tr key={idx}>
                          <td className="celula-pesquisa-nome">{pesq.nome}</td>
                          <td className="celula-setor">{pesq.setor}</td>
                          <td className="celula-participacao">
                            <div className="part-topo">
                              <span style={{ color: pesq.corTexto, fontWeight: 700 }}>
                                {pesq.participacao}%
                              </span>
                              {pesq.metaTexto && (
                                <span className="part-meta">{pesq.metaTexto}</span>
                              )}
                            </div>
                            <div className="part-barra-bg">
                              <div
                                className="part-barra-fill"
                                style={{
                                  width: `${pesq.participacao}%`,
                                  backgroundColor: pesq.corBarra,
                                }}
                              ></div>
                            </div>
                          </td>
                          <td>
                            <span className="pill-status pill-azul">{pesq.status}</span>
                          </td>
                          <td>
                            <button type="button" className="btn-ver">
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-rodape-link">
                  <a href="#/" className="dash-link" onClick={(e) => e.preventDefault()}>
                    Ver Mais
                  </a>
                </div>
              </div>
            </section>

            {/* Linha 3: Planos de ação (centralizado embaixo) */}
            <section className="planos-wrapper">
              <div className="dash-card card-planos">
                <h3 className="card-titulo-secao">Planos de ação</h3>

                <div className="tabela-responsiva">
                  <table className="dash-tabela tabela-planos">
                    <thead>
                      <tr>
                        <th>PLANO</th>
                        <th>ORIGEM</th>
                        <th>RESPONSÁVEL</th>
                        <th>PRAZO</th>
                        <th>STATUS</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {planosFormatados.map((plano, idx) => (
                        <tr
                          key={idx}
                          className={plano.atrasado ? 'linha-atrasada' : ''}
                        >
                          <td className="celula-plano-nome">
                            {plano.atrasado && <span className="ponto-vermelho"></span>}
                            {plano.plano}
                          </td>
                          <td>
                            <span className="tag-origem">{plano.origem}</span>
                          </td>
                          <td className="celula-responsavel">{plano.responsavel}</td>
                          <td className={plano.atrasado ? 'celula-prazo-atrasado' : 'celula-prazo'}>
                            {plano.atrasado && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginRight: '5px', verticalAlign: '-2px' }}
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                            )}
                            {plano.prazo}
                          </td>
                          <td>
                            <span className={`pill-status pill-${plano.statusTipo}`}>
                              {plano.status}
                            </span>
                          </td>
                          <td className="celula-detalhes">
                            <a
                              href="#/"
                              className={plano.atrasado ? 'link-detalhes-vermelho' : 'link-detalhes'}
                              onClick={(e) => e.preventDefault()}
                            >
                              Detalhes
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-rodape-link">
                  <a href="#/" className="dash-link" onClick={(e) => e.preventDefault()}>
                    Ver Mais
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;