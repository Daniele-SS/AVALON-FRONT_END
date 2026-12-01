
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../componentes/cardNomePag/nomePag.css';
import './css-dashboard/dashboard.css';

import buscarDadosDashboard from './servico/dashboardService';

//----------------- ESTADO INICIAL -----------------//

const ESTADO_INICIAL = {
  colaboradores: [],
  setores: [],
  avaliacoes: [],
  participacoes: [],
  avaliacoesSetores: [],
  avaliacoesCargos: [],
  ferias: [],
  planosAcao: [],
  resultados: [],
};

//----------------- DIMENSÕES DOS INDICADORES -----------------//

const DIMENSOES_AVALIACAO = [
  {
    nome: 'Ambiente',
    palavras: ['ambiente'],
  },
  {
    nome: 'Comunicação',
    palavras: ['comunicacao'],
  },
  {
    nome: 'Reconhecimento',
    palavras: ['reconhecimento'],
  },
  {
    nome: 'Carga de trabalho',
    palavras: ['carga', 'trabalho'],
  },
];

//----------------- DATAS -----------------//

const CHAVES_DATA = [
  'data_criacao',
  'data_cadastro',
  'data_inicio',
  'data_avaliacao',
  'data_publicacao',
  'data_resposta',
  'data_conclusao',
  'created_at',
  'createdAt',
  'data',
];

function obterDataRegistro(item) {
  if (!item) return 0;

  const avaliacao = item.avaliacao ?? item;

  for (const chave of CHAVES_DATA) {
    const valor = avaliacao[chave];

    if (!valor) continue;

    const data = new Date(valor).getTime();

    if (!Number.isNaN(data)) {
      return data;
    }
  }

  return 0;
}

function ordenarMaisRecentes(lista) {
  return [...lista].sort(
    (a, b) => obterDataRegistro(b) - obterDataRegistro(a)
  );
}

//----------------- NÚMEROS -----------------//

function obterNumero(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return null;
  }

  const numero = Number(
    String(valor).replace(',', '.')
  );

  if (
    Number.isNaN(numero) ||
    numero < 0 ||
    numero > 5
  ) {
    return null;
  }

  return numero;
}

//----------------- NORMALIZAR TEXTO -----------------//

function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

//----------------- COMPONENTE DASHBOARD -----------------//

function Dashboard() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dados, setDados] = useState(ESTADO_INICIAL);

  //----------------- CARREGAR DADOS -----------------//

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro('');

        const resultado = await buscarDadosDashboard();

        setDados({
          ...ESTADO_INICIAL,
          ...resultado,
        });
      } catch (err) {
        console.error(
          'Erro ao buscar dados do dashboard:',
          err
        );

        setErro(
          err.message || 'Erro ao carregar o dashboard.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  //----------------- STATUS PENDENTE -----------------//

  const isRegistroPendente = (item) => {
    const bruto =
      item?.status ??
      item?.situacao ??
      item?.estado;

    if (typeof bruto === 'number') {
      return bruto === 0;
    }

    if (typeof bruto === 'boolean') {
      return !bruto;
    }

    const texto = normalizarTexto(bruto);

    if (!texto) return false;

    return [
      'pendente',
      'pendencia',
      'aguardando',
      'em analise',
      'aberto',
      'aberta',
      '0',
    ].includes(texto);
  };

  //----------------- STATUS ATIVO/INATIVO -----------------//

  const formatarStatusAtivoInativo = (valor) => {
    if (typeof valor === 'boolean') {
      return valor ? 'Ativo' : 'Inativo';
    }

    if (typeof valor === 'number') {
      return valor === 1 ? 'Ativo' : 'Inativo';
    }

    const texto = normalizarTexto(valor);

    if (
      ['1', 'true', 'ativo', 'ativa'].includes(texto)
    ) {
      return 'Ativo';
    }

    return 'Inativo';
  };

  //----------------- ID DA AVALIAÇÃO -----------------//

  const obterIdAvaliacao = (avaliacao) =>
    Number(
      avaliacao?.id ??
      avaliacao?.id_avaliacao ??
      avaliacao?.avaliacao?.id
    );

  //----------------- SETOR DA AVALIAÇÃO -----------------//

  const obterSetorAvaliacao = (avaliacao) => {
    const idAvaliacao = obterIdAvaliacao(avaliacao);

    const vinculosSetor = Array.isArray(
      dados.avaliacoesSetores
    )
      ? dados.avaliacoesSetores
      : [];

    const listaSetores = Array.isArray(dados.setores)
      ? dados.setores
      : [];

    const vinculo = vinculosSetor.find(
      (item) =>
        Number(
          item.id_avaliacao ??
          item.avaliacao?.id
        ) === idAvaliacao
    );

    const idSetor =
      vinculo?.id_setor ??
      vinculo?.setor?.id ??
      vinculo?.setor?.id_setor ??
      avaliacao?.id_setor ??
      avaliacao?.setor?.id;

    if (idSetor != null) {
      const setorEncontrado = listaSetores.find(
        (setor) =>
          Number(
            setor.id ??
            setor.id_setor
          ) === Number(idSetor)
      );

      if (
        setorEncontrado?.nome ||
        setorEncontrado?.descricao
      ) {
        return (
          setorEncontrado.nome ??
          setorEncontrado.descricao
        );
      }

      if (
        vinculo?.setor?.nome ||
        vinculo?.nome_setor
      ) {
        return (
          vinculo.setor?.nome ??
          vinculo.nome_setor
        );
      }
    }

    const publico = normalizarTexto(
      avaliacao?.publico_selecionado
    );

    if (publico === 'todos') {
      return 'Todos os setores';
    }

    if (publico === 'cargo') {
      return 'Por cargo';
    }

    return 'Não informado';
  };

  //----------------- PARTICIPAÇÃO DA AVALIAÇÃO -----------------//

  const calcularParticipacaoAvaliacao = (avaliacao) => {
    const idAvaliacao = obterIdAvaliacao(avaliacao);

    const participacoes = Array.isArray(
      dados.participacoes
    )
      ? dados.participacoes
      : [];

    if (
      !idAvaliacao ||
      participacoes.length === 0
    ) {
      return 0;
    }

    const daAvaliacao = participacoes.filter(
      (participacao) =>
        Number(
          participacao.avaliacao?.id ??
          participacao.id_avaliacao
        ) === idAvaliacao
    );

    if (daAvaliacao.length === 0) {
      return 0;
    }

    const concluidos = daAvaliacao.filter(
      (participacao) => {
        if (typeof participacao.status === 'number') {
          return participacao.status === 1;
        }

        if (typeof participacao.status === 'boolean') {
          return participacao.status;
        }

        const status = normalizarTexto(
          participacao.status
        );

        return [
          '1',
          'true',
          'concluido',
          'respondido',
          'respondida',
        ].includes(status);
      }
    ).length;

    return Math.min(
      100,
      Math.round(
        (concluidos / daAvaliacao.length) * 100
      )
    );
  };

  //----------------- RESULTADOS DOS FATORES -----------------//

  const obterNomeFatorResultado = (resultado) => {
    return (
      resultado?.fator_psicossocial?.nome ??
      resultado?.psicossocial_fator?.nome ??
      resultado?.fator?.nome ??
      resultado?.nome_fator ??
      ''
    );
  };

  const obterIdFatorResultado = (resultado) => {
    return Number(
      resultado?.fator_psicossocial?.id ??
      resultado?.psicossocial_fator?.id ??
      resultado?.fator?.id ??
      resultado?.id_psicossocial_fator
    );
  };

  const obterDimensaoResultado = (resultado) => {
    const nomeFator = normalizarTexto(
      obterNomeFatorResultado(resultado)
    );

    return DIMENSOES_AVALIACAO.find(
      (dimensao) =>
        dimensao.palavras.every(
          (palavra) => nomeFator.includes(palavra)
        )
    ) ?? null;
  };

  //----------------- RESULTADOS VÁLIDOS -----------------//

  const obterResultadosValidos = () => {
    const resultados = Array.isArray(dados.resultados)
      ? dados.resultados
      : [];

    return resultados
      .map((resultado) => ({
        ...resultado,
        idAvaliacao: obterIdAvaliacao(resultado),
        idFator: obterIdFatorResultado(resultado),
        dimensao: obterDimensaoResultado(resultado),
        nota: obterNumero(
          resultado.valor_medio ??
          resultado.media ??
          resultado.valor
        ),
      }))
      .filter(
        (resultado) =>
          resultado.idAvaliacao &&
          resultado.idFator &&
          resultado.dimensao &&
          resultado.nota !== null
      );
  };

  //----------------- ÚLTIMA NOTA DE CADA FATOR -----------------//

  const obterUltimaNotaDoFator = (dimensao) => {
    const resultados = obterResultadosValidos().filter(
      (resultado) =>
        resultado.dimensao.nome === dimensao.nome
    );

    if (resultados.length === 0) {
      return null;
    }

    const resultadosPorAvaliacao = {};

    resultados.forEach((resultado) => {
      const chave =
        `${resultado.idFator}-${resultado.idAvaliacao}`;

      if (!resultadosPorAvaliacao[chave]) {
        resultadosPorAvaliacao[chave] = {
          idFator: resultado.idFator,
          idAvaliacao: resultado.idAvaliacao,
          nota: resultado.nota,
          data: obterDataRegistro(resultado),
        };
      }
    });

    const resultadosOrdenados = Object.values(
      resultadosPorAvaliacao
    ).sort((a, b) => {
      if (a.data !== b.data) {
        return b.data - a.data;
      }

      return b.idAvaliacao - a.idAvaliacao;
    });

    return resultadosOrdenados[0]?.nota ?? null;
  };

  //----------------- FORMATAR INDICADOR -----------------//

  const formatarIndicador = (nota) => {
    if (nota === null) {
      return {
        nota: '— / 5',
        percentual: 0,
        status: 'Sem dados',
        tipo: 'normal',
      };
    }

    const notaFinal = Math.max(
      0,
      Math.min(5, nota)
    );

    const percentual = Math.round(
      (notaFinal / 5) * 100
    );

    if (notaFinal < 3) {
      return {
        nota: `${notaFinal.toFixed(1).replace('.', ',')} / 5`,
        percentual,
        status: 'Prioridade',
        tipo: 'prioridade',
      };
    }

    if (notaFinal < 3.7) {
      return {
        nota: `${notaFinal.toFixed(1).replace('.', ',')} / 5`,
        percentual,
        status: 'Atenção',
        tipo: 'atencao',
      };
    }

    return {
      nota: `${notaFinal.toFixed(1).replace('.', ',')} / 5`,
      percentual,
      status: 'Normal',
      tipo: 'normal',
    };
  };

  //----------------- CALCULAR INDICADORES -----------------//

  const calcularIndicadorDaAvaliacao = (dimensao) => {
    const nota = obterUltimaNotaDoFator(dimensao);

    return formatarIndicador(nota);
  };

  //----------------- SATISFAÇÃO -----------------//

  const calcularIndicadorSatisfacao = () => {
    const notasFatores = DIMENSOES_AVALIACAO
      .map((dimensao) =>
        obterUltimaNotaDoFator(dimensao)
      )
      .filter((nota) => nota !== null);

    if (notasFatores.length === 0) {
      return formatarIndicador(null);
    }

    const media =
      notasFatores.reduce(
        (total, nota) => total + nota,
        0
      ) / notasFatores.length;

    return formatarIndicador(media);
  };

  //----------------- FÉRIAS PENDENTES -----------------//

  const totalFeriasPendentes = (
    Array.isArray(dados.ferias)
      ? dados.ferias
      : []
  ).filter(isRegistroPendente).length;

  //----------------- CARDS KPI -----------------//

  const kpis = [
    {
      id: 1,
      titulo: 'Total de colaboradores',
      valor: String(dados.colaboradores.length),
      statusTexto: 'Cadastrados no sistema',
      statusCor: 'verde',
      iconeBg: '#dcfce7',
      iconeCor: '#16a34a',
      linkTexto: 'Ver todos os colaboradores',
      rota: '/colaboradores',
      iconeTipo: 'usuarios',
      statusIcone: 'seta-cima',
    },
    {
      id: 2,
      titulo: 'Pendências de férias',
      valor: String(totalFeriasPendentes),
      statusTexto: 'Solicitações pendentes',
      statusCor: 'amarelo',
      iconeBg: '#fef9c3',
      iconeCor: '#ca8a04',
      linkTexto: 'Ver férias',
      rota: '/ferias',
      iconeTipo: 'relogio',
      statusIcone: 'exclamacao',
    },
    {
      id: 4,
      titulo: 'Pesquisas e avaliações',
      valor: String(dados.avaliacoes.length),
      statusTexto: 'Avaliações psicossociais',
      statusCor: 'azul',
      iconeBg: '#dbeafe',
      iconeCor: '#2563eb',
      linkTexto: 'Ver todas as pesquisas',
      rota: '/avaliacao-psicossocial',
      iconeTipo: 'documento',
      statusIcone: 'pulso',
    },
    {
      id: 5,
      titulo: 'Planos de ação',
      valor: String(dados.planosAcao.length),
      statusTexto: 'Registrados no sistema',
      statusCor: 'amarelo',
      iconeBg: '#fef9c3',
      iconeCor: '#ca8a04',
      linkTexto: 'Ver todos os planos de ação',
      rota: '/planos-acao',
      iconeTipo: 'check-circulo',
      statusIcone: 'alerta',
    },
  ];

  //----------------- LISTA DE INDICADORES -----------------//

  const indicadores = [
    {
      nome: 'Satisfação',
      ...calcularIndicadorSatisfacao(),
    },
    ...DIMENSOES_AVALIACAO.map((dimensao) => ({
      nome: dimensao.nome,
      ...calcularIndicadorDaAvaliacao(dimensao),
    })),
  ];

  //----------------- AVALIAÇÕES RECENTES -----------------//

  const avaliacoesRecentes = ordenarMaisRecentes(
    Array.isArray(dados.avaliacoes)
      ? dados.avaliacoes
      : []
  );

  const avaliacoesFormatadas = avaliacoesRecentes
    .slice(0, 3)
    .map((av, idx) => {
      const participacao =
        calcularParticipacaoAvaliacao(av);

      const status =
        formatarStatusAtivoInativo(av.status);

      const abaixoMeta = participacao < 50;

      return {
        id: obterIdAvaliacao(av) || idx,
        original: av,
        nome:
          av.titulo ??
          av.nome ??
          `Avaliação Psicossocial ${idx + 1}`,
        setor: obterSetorAvaliacao(av),
        participacao,
        metaTexto: abaixoMeta ? '< meta' : '',
        corBarra: abaixoMeta ? '#e69500' : '#0b5ed7',
        corTexto: abaixoMeta ? '#d97706' : '#1e293b',
        status,
      };
    });

  //----------------- PLANOS DE AÇÃO RECENTES -----------------//

  const planosRecentes = ordenarMaisRecentes(
    Array.isArray(dados.planosAcao)
      ? dados.planosAcao
      : []
  );

  const planosFormatados = planosRecentes
    .slice(0, 3)
    .map((plano, idx) => {
      const status =
        formatarStatusAtivoInativo(plano.status);

      const atrasado = normalizarTexto(
        plano.status
      ).includes('atrasad');

      return {
        id:
          plano.id ??
          plano.id_plano_acao ??
          idx,
        plano:
          plano.titulo ??
          plano.descricao ??
          `Plano de ação ${idx + 1}`,
        origem:
          plano.origem ??
          'Avaliação Psicossocial',
        responsavel:
          plano.responsavel ??
          plano.nome_responsavel ??
          'RH',
        prazo:
          plano.prazo ??
          plano.data_termino ??
          '-',
        status,
        atrasado,
        statusTipo: atrasado
          ? 'atrasada'
          : status === 'Ativo'
            ? 'andamento'
            : 'nao-iniciada',
      };
    });

  //----------------- ABRIR AVALIAÇÃO -----------------//

  const handleAbrirAvaliacao = (item) => {
    navigate(
      `/avaliacao-psicossocial?avaliacaoId=${item.id}`,
      {
        state: {
          avaliacaoId: item.id,
          avaliacao: item.original,
          abrirAvaliacao: true,
        },
      }
    );
  };

  //----------------- ÍCONES DOS KPI -----------------//

  const renderKpiIcone = (tipo, cor) => {
    switch (tipo) {
      case 'usuarios':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );

      case 'relogio':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );

      case 'documento':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );

      case 'check-circulo':
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );

      default:
        return null;
    }
  };

  //----------------- ÍCONES DE STATUS -----------------//

  const renderStatusIcone = (tipo) => {
    switch (tipo) {
      case 'seta-cima':
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        );

      case 'exclamacao':
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );

      case 'pulso':
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        );

      case 'alerta':
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );

      default:
        return null;
    }
  };

  //----------------- RENDERIZAÇÃO -----------------//

  return (
    <div className="dashboard-wrapper">
      <div className="card-tiulo">
        <div className="titulo-descricao">
          <h2>Dashboard</h2>
          <p>
            Visão geral da organização e principais informações.
          </p>
        </div>
      </div>

      <div className="dashboard-conteudo">
        {erro && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontWeight: 500,
            }}
          >
            {erro}
          </div>
        )}

        {carregando ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Carregando dados do dashboard...
          </div>
        ) : (
          <>
            {/*----------------- CARDS KPI -----------------*/}

            <section
              className="kpi-grid"
              style={{
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(210px, 1fr))',
              }}
            >
              {kpis.map((item) => (
                <div
                  key={item.id}
                  className="dash-card kpi-card"
                >
                  <div className="kpi-topo">
                    <span className="kpi-titulo">
                      {item.titulo}
                    </span>

                    <span
                      className="kpi-icone-box"
                      style={{
                        backgroundColor: item.iconeBg,
                      }}
                    >
                      {renderKpiIcone(
                        item.iconeTipo,
                        item.iconeCor
                      )}
                    </span>
                  </div>

                  <div className="kpi-numero">
                    {item.valor}
                  </div>

                  <div
                    className={`kpi-substatus status-${item.statusCor}`}
                  >
                    {renderStatusIcone(item.statusIcone)}
                    <span>{item.statusTexto}</span>
                  </div>

                  <a
                    href={item.rota}
                    className="dash-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.rota);
                    }}
                  >
                    {item.linkTexto}
                  </a>
                </div>
              ))}
            </section>

            {/*----------------- INDICADORES E AVALIAÇÕES -----------------*/}

            <section className="meio-grid">
              <div className="dash-card card-indicadores">
                <h3 className="card-titulo-secao">
                  Indicadores
                </h3>

                <div className="indicadores-lista">
                  {indicadores.map((ind) => (
                    <div
                      key={ind.nome}
                      className="indicador-item"
                    >
                      <div className="indicador-linha-info">
                        <span className="indicador-nome">
                          {ind.nome}
                        </span>

                        <div className="indicador-direita">
                          <span
                            className={`indicador-nota nota-${ind.tipo}`}
                          >
                            {ind.nota}
                          </span>

                          <span
                            className={`badge-indicador badge-${ind.tipo}`}
                          >
                            {ind.status}
                          </span>
                        </div>
                      </div>

                      <div className="indicador-barra-bg">
                        <div
                          className={`indicador-barra-fill fill-${ind.tipo}`}
                          style={{
                            width: `${ind.percentual}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card-rodape-link">
                  <a
                    href="/indicadores"
                    className="dash-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/indicadores');
                    }}
                  >
                    Ver Mais
                  </a>
                </div>
              </div>

              {/*----------------- AVALIAÇÕES PSICOSSOCIAIS -----------------*/}

              <div className="dash-card card-pesquisas">
                <h3 className="card-titulo-secao">
                  Avaliações psicossociais
                </h3>

                <div className="tabela-responsiva">
                  <table className="dash-tabela tabela-pesquisas">
                    <thead>
                      <tr>
                        <th>AVALIAÇÃO</th>
                        <th>SETOR</th>
                        <th>PARTICIPAÇÃO</th>
                        <th>STATUS</th>
                        <th>AÇÃO</th>
                      </tr>
                    </thead>

                    <tbody>
                      {avaliacoesFormatadas.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              textAlign: 'center',
                              color: '#64748b',
                            }}
                          >
                            Nenhuma avaliação psicossocial encontrada.
                          </td>
                        </tr>
                      ) : (
                        avaliacoesFormatadas.map((item) => (
                          <tr key={item.id}>
                            <td className="celula-pesquisa-nome">
                              {item.nome}
                            </td>

                            <td className="celula-setor">
                              {item.setor}
                            </td>

                            <td className="celula-participacao">
                              <div className="part-topo">
                                <span
                                  style={{
                                    color: item.corTexto,
                                    fontWeight: 700,
                                  }}
                                >
                                  {item.participacao}%
                                </span>

                                {item.metaTexto && (
                                  <span className="part-meta">
                                    {item.metaTexto}
                                  </span>
                                )}
                              </div>

                              <div className="part-barra-bg">
                                <div
                                  className="part-barra-fill"
                                  style={{
                                    width: `${item.participacao}%`,
                                    backgroundColor: item.corBarra,
                                  }}
                                />
                              </div>
                            </td>

                            <td>
                              <span className="pill-status pill-azul">
                                {item.status}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn-ver"
                                onClick={() =>
                                  handleAbrirAvaliacao(item)
                                }
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="card-rodape-link">
                  <a
                    href="/avaliacao-psicossocial"
                    className="dash-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/avaliacao-psicossocial');
                    }}
                  >
                    Ver Mais
                  </a>
                </div>
              </div>
            </section>

            {/*----------------- PLANOS DE AÇÃO -----------------*/}

            <section className="planos-wrapper">
              <div className="dash-card card-planos">
                <h3 className="card-titulo-secao">
                  Planos de ação
                </h3>

                <div className="tabela-responsiva">
                  <table className="dash-tabela tabela-planos">
                    <thead>
                      <tr>
                        <th>PLANO</th>
                        <th>ORIGEM</th>
                        <th>RESPONSÁVEL</th>
                        <th>PRAZO</th>
                        <th>STATUS</th>
                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {planosFormatados.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: 'center',
                              color: '#64748b',
                            }}
                          >
                            Nenhum plano de ação encontrado.
                          </td>
                        </tr>
                      ) : (
                        planosFormatados.map((plano) => (
                          <tr
                            key={plano.id}
                            className={
                              plano.atrasado
                                ? 'linha-atrasada'
                                : ''
                            }
                          >
                            <td className="celula-plano-nome">
                              {plano.atrasado && (
                                <span className="ponto-vermelho" />
                              )}

                              {plano.plano}
                            </td>

                            <td>
                              <span className="tag-origem">
                                {plano.origem}
                              </span>
                            </td>

                            <td className="celula-responsavel">
                              {plano.responsavel}
                            </td>

                            <td
                              className={
                                plano.atrasado
                                  ? 'celula-prazo-atrasado'
                                  : 'celula-prazo'
                              }
                            >
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
                                  style={{
                                    marginRight: '5px',
                                    verticalAlign: '-2px',
                                  }}
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                  />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                              )}

                              {plano.prazo}
                            </td>

                            <td>
                              <span
                                className={`pill-status pill-${plano.statusTipo}`}
                              >
                                {plano.status}
                              </span>
                            </td>

                            <td className="celula-detalhes">
                              <a
                                href="/planos-acao"
                                className={
                                  plano.atrasado
                                    ? 'link-detalhes-vermelho'
                                    : 'link-detalhes'
                                }
                                onClick={(e) => {
                                  e.preventDefault();

                                  navigate('/planos-acao', {
                                    state: {
                                      planoId: plano.id,
                                    },
                                  });
                                }}
                              >
                                Detalhes
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="card-rodape-link">
                  <a
                    href="/planos-acao"
                    className="dash-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/planos-acao');
                    }}
                  >
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
