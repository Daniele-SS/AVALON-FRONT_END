import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../componentes/cardNomePag/nomePag.css';
import './css-dashboard/dashboard.css';
import buscarDadosDashboard from './servico/dashboardService';

const ESTADO_INICIAL = {
  colaboradores: [],
  usuarios: [],
  setores: [],
  avaliacoes: [],
  participacoes: [],
  avaliacoesSetores: [],
  avaliacoesCargos: [],
  ferias: [],
  planosAcao: [],
  resultados: [],
  gestor: null,
  equipeGestor: [],
  idColaboradorGestor: null,
  idSetorGestor: null,
};

const DIMENSOES_AVALIACAO = [
  { nome: 'Ambiente', palavras: ['equilibrio', 'demandas', 'recursos'] },
  { nome: 'Comunicação', palavras: ['comunicacao'] },
  { nome: 'Reconhecimento', palavras: ['reconhecimento'] },
  { nome: 'Carga de trabalho', palavras: ['carga', 'trabalho'] },
];

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

function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function obterDataRegistro(item) {
  if (!item) return 0;

  const avaliacao = item.avaliacao ?? item;

  for (const chave of CHAVES_DATA) {
    const valor = avaliacao[chave];

    if (!valor) continue;

    const data = new Date(valor).getTime();

    if (!Number.isNaN(data)) return data;
  }

  return 0;
}

function ordenarMaisRecentes(lista) {
  return [...lista].sort(
    (a, b) => obterDataRegistro(b) - obterDataRegistro(a)
  );
}

function obterNumero(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return null;
  }

  const numero = Number(String(valor).replace(',', '.'));

  if (Number.isNaN(numero) || numero < 0 || numero > 5) {
    return null;
  }

  return numero;
}

function obterUsuarioLogado() {
  try {
    const salvo =
      localStorage.getItem('usuario') ||
      localStorage.getItem('usuarioLogin');

    if (!salvo) return {};

    const usuario = JSON.parse(salvo);

    return (
      usuario?.usuario ??
      usuario?.response?.usuario ??
      usuario
    );
  } catch {
    return {};
  }
}

// Obtém o ID do colaborador em diferentes formatos retornados pela API.
function obterIdColaborador(item) {
  const id =
    item?.id_colaborador ??
    item?.colaborador?.id_colaborador ??
    item?.colaborador?.id ??
    null;

  return id == null ? null : String(id);
}

// Obtém o setor do colaborador em diferentes formatos.
function obterIdSetorColaborador(colaborador) {
  const setor = Array.isArray(colaborador?.setor)
    ? colaborador.setor[0]
    : colaborador?.setor;

  const id =
    colaborador?.id_setor ??
    setor?.id_setor ??
    setor?.id ??
    colaborador?.setor_id ??
    colaborador?.colaborador?.id_setor ??
    colaborador?.colaborador?.setor?.id_setor ??
    colaborador?.colaborador?.setor?.id;

  return id == null ? null : String(id);
}

function obterIdResponsavelPlano(plano) {
  const colaborador =
    plano?.colaborador ??
    plano?.colaborador_responsavel ??
    plano?.responsavel ??
    plano?.usuario_responsavel ??
    plano?.gestor ??
    null;

  const id =
    plano?.id_colaborador ??
    plano?.id_responsavel ??
    plano?.id_responsavel_plano ??
    colaborador?.id_colaborador ??
    colaborador?.colaborador?.id_colaborador ??
    colaborador?.id;

  return id == null ? null : String(id);
}

function isStatusConcluido(valor) {
  if (typeof valor === 'number') return valor === 1;
  if (typeof valor === 'boolean') return valor;

  return [
    '1',
    'true',
    'concluido',
    'concluida',
    'encerrado',
    'encerrada',
    'finalizado',
    'finalizada',
  ].includes(normalizarTexto(valor));
}

function isAvaliacaoConcluida(avaliacao) {
  return isStatusConcluido(
    avaliacao?.status ??
    avaliacao?.situacao ??
    avaliacao?.estado
  );
}

// Participações podem usar Respondido/Respondida além de Concluído.
function isParticipacaoConcluida(participacao) {
  const status =
    participacao?.status ??
    participacao?.situacao ??
    participacao?.estado;

  if (typeof status === 'number') return status === 1;
  if (typeof status === 'boolean') return status;

  return [
    '1',
    'true',
    'concluido',
    'concluida',
    'respondido',
    'respondida',
    'finalizado',
    'finalizada',
  ].includes(normalizarTexto(status));
}

function isRegistroPendente(item) {
  const bruto =
    item?.status ??
    item?.situacao ??
    item?.estado;

  if (typeof bruto === 'number') return bruto === 0;
  if (typeof bruto === 'boolean') return !bruto;

  return [
    'pendente',
    'pendencia',
    'aguardando',
    'em analise',
    'aberto',
    'aberta',
    '0',
  ].includes(normalizarTexto(bruto));
}

function formatarStatusPlano(plano) {
  const valor =
    plano?.status ??
    plano?.situacao ??
    plano?.estado;

  if (
    typeof valor === 'number' ||
    /^\d+$/.test(String(valor ?? ''))
  ) {
    return Number(valor) === 1
      ? 'Concluído'
      : 'Em andamento';
  }

  if (typeof valor === 'boolean') {
    return valor ? 'Em andamento' : 'Não iniciado';
  }

  const texto = normalizarTexto(valor);

  if (
    [
      'concluido',
      'concluida',
      'encerrado',
      'encerrada',
      'finalizado',
      'finalizada',
    ].includes(texto)
  ) {
    return 'Concluído';
  }

  if (
    ['atrasado', 'atrasada', 'em atraso'].includes(texto)
  ) {
    return 'Atrasado';
  }

  if (
    [
      'em andamento',
      'andamento',
      'ativo',
      'ativa',
      'iniciado',
      'iniciada',
    ].includes(texto)
  ) {
    return 'Em andamento';
  }

  if (
    [
      'nao iniciado',
      'nao iniciada',
      'pendente',
      'aguardando',
    ].includes(texto)
  ) {
    return 'Não iniciado';
  }

  return valor ? String(valor) : 'Em andamento';
}

function formatarDataPlano(valor) {
  if (!valor) return 'Não definida';

  const partes = String(valor)
    .split('T')[0]
    .split('-');

  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : String(valor);
}

function obterNomeResponsavelPlano(plano) {
  const responsavel =
    plano?.colaborador ??
    plano?.colaborador_responsavel ??
    plano?.responsavel ??
    plano?.usuario_responsavel ??
    plano?.gestor ??
    null;

  if (typeof responsavel === 'string') {
    return responsavel.trim() || 'Responsável não definido';
  }

  const nome =
    responsavel?.nome ??
    responsavel?.nome_completo ??
    responsavel?.nome_colaborador ??
    responsavel?.colaborador?.nome ??
    responsavel?.usuario?.nome ??
    plano?.nome_responsavel ??
    '';

  return String(nome).trim() || 'Responsável não definido';
}

// Obtém o ID da avaliação, inclusive quando ela vem aninhada.
function obterIdAvaliacao(avaliacao) {
  const id =
    avaliacao?.id_avaliacao ??
    avaliacao?.avaliacao?.id_avaliacao ??
    avaliacao?.avaliacao?.id ??
    avaliacao?.id;

  return Number(id);
}

function obterIdAvaliacaoParticipacao(item) {
  const id =
    item?.avaliacao?.id_avaliacao ??
    item?.avaliacao?.id ??
    item?.id_avaliacao ??
    item?.avaliacao_id;

  return Number(id);
}

function obterIdAvaliacaoSetor(item) {
  const id =
    item?.id_avaliacao ??
    item?.avaliacao?.id_avaliacao ??
    item?.avaliacao?.id ??
    item?.avaliacao_id;

  return Number(id);
}

function obterIdSetorAvaliacaoLink(item) {
  const setor = Array.isArray(item?.setor)
    ? item.setor[0]
    : item?.setor;

  const id =
    item?.id_setor ??
    setor?.id_setor ??
    setor?.id;

  return id == null ? null : String(id);
}

function obterIdSetorResultado(resultado) {
  const setor = Array.isArray(resultado?.setor)
    ? resultado.setor[0]
    : resultado?.setor;

  const id =
    resultado?.avaliacao?.id_setor ??
    resultado?.avaliacao?.setor?.id_setor ??
    resultado?.avaliacao?.setor?.id ??
    resultado?.id_setor ??
    setor?.id_setor ??
    setor?.id;

  return id == null ? null : String(id);
}

function obterNomeFatorResultado(resultado) {
  return (
    resultado?.fator_psicossocial?.psicossocialFator?.nome ??
    resultado?.fator_psicossocial?.psicossocial_fator?.nome ??
    resultado?.fator_psicossocial?.nome ??
    resultado?.psicossocial_fator?.nome ??
    resultado?.fator?.nome ??
    resultado?.nome_fator ??
    ''
  );
}

function obterIdFatorResultado(resultado) {
  return Number(
    resultado?.fator_psicossocial?.psicossocialFator?.id ??
    resultado?.fator_psicossocial?.psicossocialFator?.id_psicossocial_fator ??
    resultado?.fator_psicossocial?.psicossocial_fator?.id ??
    resultado?.fator_psicossocial?.id_psicossocial_fator ??
    resultado?.fator_psicossocial?.id ??
    resultado?.psicossocial_fator?.id ??
    resultado?.fator?.id ??
    resultado?.id_psicossocial_fator
  );
}

// Obtém o setor do usuário logado.
function obterIdSetorUsuario(usuario, colaboradores) {
  const setorUsuario = Array.isArray(usuario?.setor)
    ? usuario.setor[0]
    : usuario?.setor;

  const setorColaborador = Array.isArray(
    usuario?.colaborador?.setor
  )
    ? usuario.colaborador.setor[0]
    : usuario?.colaborador?.setor;

  const setorDireto =
    usuario?.id_setor ??
    setorUsuario?.id_setor ??
    setorUsuario?.id ??
    usuario?.colaborador?.id_setor ??
    setorColaborador?.id_setor ??
    setorColaborador?.id;

  if (setorDireto != null) {
    return String(setorDireto);
  }

  const idColaborador = obterIdColaborador(usuario);

  if (!idColaborador) {
    return null;
  }

  const colaboradorGestor = colaboradores.find(
    (item) => obterIdColaborador(item) === idColaborador
  );

  return obterIdSetorColaborador(colaboradorGestor);
}

function formatarIndicador(nota) {
  if (nota === null || nota === undefined) {
    return {
      nota: '— / 5',
      percentual: 0,
      status: 'Sem dados',
      tipo: 'normal',
    };
  }

  const notaFinal = Math.max(0, Math.min(5, nota));
  const percentual = Math.round((notaFinal / 5) * 100);

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
}

function Dashboard() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dados, setDados] = useState(ESTADO_INICIAL);

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

  const usuarioLogado = obterUsuarioLogado();

  const nivelAcesso = normalizarTexto(
    usuarioLogado?.nivel_acesso?.nome ??
    usuarioLogado?.nivel_acesso ??
    usuarioLogado?.nivel ??
    ''
  );

  const ehGestor = nivelAcesso === 'gestor';

  // O serviço identifica o colaborador Gestor usando a mesma
  // função utilizada na tela Minha Equipe.
  const idGestor =
    dados.idColaboradorGestor != null
      ? String(dados.idColaboradorGestor)
      : obterIdColaborador(usuarioLogado);

  const idSetorGestor =
    dados.idSetorGestor != null
      ? String(dados.idSetorGestor)
      : obterIdSetorUsuario(
          usuarioLogado,
          dados.colaboradores
        );

  // Usa a equipe já montada pelo serviço, para que o total
  // seja igual ao exibido na tela Minha Equipe.
  const equipeGestor = useMemo(() => {
    if (!ehGestor) return [];

    if (Array.isArray(dados.equipeGestor)) {
      return dados.equipeGestor;
    }

    if (!idSetorGestor) return [];

    return (
      Array.isArray(dados.colaboradores)
        ? dados.colaboradores
        : []
    ).filter((colaborador) => {
      const mesmoSetor =
        obterIdSetorColaborador(colaborador) ===
        String(idSetorGestor);

      const id = obterIdColaborador(colaborador);

      return mesmoSetor && id !== idGestor;
    });
  }, [
    ehGestor,
    idSetorGestor,
    idGestor,
    dados.equipeGestor,
    dados.colaboradores,
  ]);

  //----------------- FÉRIAS E PLANOS DO GESTOR -----------------//

  const feriasPendentesGestor = (
    Array.isArray(dados.ferias)
      ? dados.ferias
      : []
  ).filter(isRegistroPendente);

  const planosDoGestor = (
    Array.isArray(dados.planosAcao)
      ? dados.planosAcao
      : []
  ).filter(
    (plano) =>
      obterIdResponsavelPlano(plano) === idGestor
  );

  const planosEmAndamentoGestor =
    planosDoGestor.filter((plano) => {
      const status = formatarStatusPlano(plano);

      return (
        status === 'Em andamento' ||
        status === 'Atrasado'
      );
    });

  //----------------- SETOR E PARTICIPAÇÃO DAS AVALIAÇÕES -----------------//

  const obterSetorAvaliacao = (avaliacao) => {
    const idAvaliacao = obterIdAvaliacao(avaliacao);

    const vinculo = (
      Array.isArray(dados.avaliacoesSetores)
        ? dados.avaliacoesSetores
        : []
    ).find(
      (item) =>
        obterIdAvaliacaoSetor(item) === idAvaliacao
    );

    const idSetor =
      obterIdSetorAvaliacaoLink(vinculo) ??
      obterIdSetorResultado(avaliacao);

    if (idSetor != null) {
      const setor = (
        Array.isArray(dados.setores)
          ? dados.setores
          : []
      ).find(
        (item) =>
          String(item.id_setor ?? item.id) ===
          String(idSetor)
      );

      const setorVinculado = Array.isArray(vinculo?.setor)
        ? vinculo.setor[0]
        : vinculo?.setor;

      return (
        setor?.nome ??
        setor?.descricao ??
        setorVinculado?.nome ??
        vinculo?.nome_setor ??
        'Não informado'
      );
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

  const calcularParticipacaoAvaliacao = (avaliacao) => {
    const idAvaliacao = obterIdAvaliacao(avaliacao);

    const participacoes = (
      Array.isArray(dados.participacoes)
        ? dados.participacoes
        : []
    ).filter(
      (item) =>
        obterIdAvaliacaoParticipacao(item) ===
        idAvaliacao
    );

    if (!idAvaliacao || participacoes.length === 0) {
      return 0;
    }

    const concluidos = participacoes.filter(
      isParticipacaoConcluida
    ).length;

    return Math.min(
      100,
      Math.round(
        (concluidos / participacoes.length) * 100
      )
    );
  };

  //----------------- RESULTADOS AGRUPADOS POR FATOR -----------------//

  const obterResultadosValidos = (
    somenteEquipe = false
  ) => {
    const avaliacoes = Array.isArray(dados.avaliacoes)
      ? dados.avaliacoes
      : [];

    const avaliacoesConcluidas = new Set(
      avaliacoes
        .filter(isAvaliacaoConcluida)
        .map(obterIdAvaliacao)
        .filter(Boolean)
    );

    const avaliacoesComParticipanteValido = new Set();

    (
      Array.isArray(dados.participacoes)
        ? dados.participacoes
        : []
    ).forEach((participacao) => {
      const idAvaliacao =
        obterIdAvaliacaoParticipacao(participacao);

      if (
        !idAvaliacao ||
        !isParticipacaoConcluida(participacao)
      ) {
        return;
      }

      avaliacoesComParticipanteValido.add(
        idAvaliacao
      );
    });

    const resultadosValidos = (
      Array.isArray(dados.resultados)
        ? dados.resultados
        : []
    )
      .map((resultado) => {
        const avaliacao =
          resultado?.avaliacao ?? {};

        const idAvaliacao =
          obterIdAvaliacao(resultado);

        const idFator =
          obterIdFatorResultado(resultado);

        const nomeFator = normalizarTexto(
          obterNomeFatorResultado(resultado)
        );

        const dimensao =
          DIMENSOES_AVALIACAO.find((item) =>
            item.palavras.every((palavra) =>
              nomeFator.includes(palavra)
            )
          ) ?? null;

        const nota = obterNumero(
          resultado.valor_medio ??
          resultado.media ??
          resultado.valor
        );

        return {
          ...resultado,
          idAvaliacao,
          idFator,
          dimensao,
          nota,
          avaliacao,
        };
      })
      .filter((resultado) => {
        if (
          !resultado.idAvaliacao ||
          !resultado.idFator ||
          !resultado.dimensao ||
          resultado.nota === null
        ) {
          return false;
        }

        // Só considera avaliações encerradas.
        if (
          resultado.avaliacao.status !== undefined ||
          resultado.avaliacao.situacao !== undefined ||
          resultado.avaliacao.estado !== undefined
        ) {
          if (
            !isAvaliacaoConcluida(
              resultado.avaliacao
            )
          ) {
            return false;
          }
        } else if (
          !avaliacoesConcluidas.has(
            resultado.idAvaliacao
          )
        ) {
          return false;
        }

        if (somenteEquipe) {
          // Só considera avaliações com pelo menos uma
          // participação válida e concluída.
          if (
            !avaliacoesComParticipanteValido.has(
              resultado.idAvaliacao
            )
          ) {
            return false;
          }

          const avaliacaoCompleta =
            avaliacoes.find(
              (item) =>
                obterIdAvaliacao(item) ===
                resultado.idAvaliacao
            );

          const vinculosSetor = (
            Array.isArray(dados.avaliacoesSetores)
              ? dados.avaliacoesSetores
              : []
          ).filter(
            (item) =>
              obterIdAvaliacaoSetor(item) ===
              resultado.idAvaliacao
          );

          const idSetorLink = vinculosSetor
            .map(obterIdSetorAvaliacaoLink)
            .find(Boolean);

          const idSetorAvaliacao =
            idSetorLink ??
            obterIdSetorResultado(avaliacaoCompleta) ??
            obterIdSetorResultado(resultado);

          if (
            idSetorAvaliacao == null ||
            idSetorGestor == null ||
            String(idSetorAvaliacao) !==
              String(idSetorGestor)
          ) {
            return false;
          }
        }

        return true;
      });

    const grupos = {};

    resultadosValidos.forEach((resultado) => {
      const chave =
        `${resultado.idAvaliacao}-${resultado.idFator}`;

      if (!grupos[chave]) {
        grupos[chave] = {
          idAvaliacao: resultado.idAvaliacao,
          idFator: resultado.idFator,
          dimensao: resultado.dimensao,
          total: 0,
          quantidade: 0,
          data: obterDataRegistro(resultado),
        };
      }

      grupos[chave].total += resultado.nota;
      grupos[chave].quantidade += 1;
    });

    return Object.values(grupos).map((grupo) => ({
      ...grupo,
      nota: grupo.quantidade
        ? grupo.total / grupo.quantidade
        : null,
    }));
  };

  const calcularIndicadores = (
    somenteEquipe = false
  ) => {
    const resultados =
      obterResultadosValidos(somenteEquipe);

    const obterUltimaNota = (dimensao) => {
      const encontrados = resultados
        .filter(
          (item) =>
            item.dimensao.nome === dimensao.nome
        )
        .sort((a, b) =>
          b.data !== a.data
            ? b.data - a.data
            : b.idAvaliacao - a.idAvaliacao
        );

      return encontrados[0]?.nota ?? null;
    };

    const notas = DIMENSOES_AVALIACAO
      .map(obterUltimaNota)
      .filter((nota) => nota !== null);

    const satisfacao = notas.length
      ? notas.reduce(
          (soma, nota) => soma + nota,
          0
        ) / notas.length
      : null;

    return [
      {
        nome: 'Satisfação',
        ...formatarIndicador(satisfacao),
      },
      ...DIMENSOES_AVALIACAO.map(
        (dimensao) => ({
          nome: dimensao.nome,
          ...formatarIndicador(
            obterUltimaNota(dimensao)
          ),
        })
      ),
    ];
  };

  // RH utiliza os indicadores gerais.
  // Gestor utiliza somente os indicadores do seu setor.
  const indicadoresRH = calcularIndicadores(false);
  const indicadoresGestor = calcularIndicadores(true);

  const indicadores = ehGestor
    ? indicadoresGestor
    : indicadoresRH;

  //----------------- KPI RH -----------------//

  const totalFeriasPendentes = (
    Array.isArray(dados.ferias)
      ? dados.ferias
      : []
  ).filter(isRegistroPendente).length;

  const kpisRH = [
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

  //----------------- KPI GESTOR -----------------//

  const kpisGestor = [
    {
      id: 1,
      titulo: 'Colaboradores da equipe',
      valor: String(equipeGestor.length),
      statusTexto: 'Na sua equipe',
      statusCor: 'verde',
      iconeBg: '#dcfce7',
      iconeCor: '#16a34a',
      linkTexto: 'Ver minha equipe',
      rota: '/minha-equipe',
      iconeTipo: 'usuarios',
      statusIcone: 'seta-cima',
    },
    {
      id: 2,
      titulo: 'Solicitações de férias',
      valor: String(feriasPendentesGestor.length),
      statusTexto: 'Aguardando sua análise',
      statusCor: 'amarelo',
      iconeBg: '#fef9c3',
      iconeCor: '#ca8a04',
      linkTexto: 'Analisar férias',
      rota: '/ferias',
      iconeTipo: 'relogio',
      statusIcone: 'exclamacao',
    },
    {
      id: 3,
      titulo: 'Planos em andamento',
      valor: String(planosEmAndamentoGestor.length),
      statusTexto: 'Atribuídos a você',
      statusCor: 'azul',
      iconeBg: '#dbeafe',
      iconeCor: '#2563eb',
      linkTexto: 'Ver planos de ação',
      rota: '/planos-acao',
      iconeTipo: 'check-circulo',
      statusIcone: 'pulso',
    },
  ];

  const kpis = ehGestor
    ? kpisGestor
    : kpisRH;

  //----------------- AVALIAÇÕES RECENTES (RH) -----------------//

  const avaliacoesFormatadas = ordenarMaisRecentes(
    Array.isArray(dados.avaliacoes)
      ? dados.avaliacoes
      : []
  )
    .slice(0, 3)
    .map((av, idx) => {
      const participacao =
        calcularParticipacaoAvaliacao(av);

      const status =
        typeof av.status === 'boolean'
          ? av.status
            ? 'Ativo'
            : 'Inativo'
          : Number(av.status) === 1 ||
            [
              'ativo',
              'ativa',
              'true',
            ].includes(normalizarTexto(av.status))
          ? 'Ativo'
          : 'Inativo';

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
        corBarra: abaixoMeta
          ? '#e69500'
          : '#0b5ed7',
        corTexto: abaixoMeta
          ? '#d97706'
          : '#1e293b',
        status,
      };
    });

  //----------------- PLANOS FORMATADOS -----------------//

  const listaPlanosDashboard = ehGestor
    ? planosDoGestor
    : Array.isArray(dados.planosAcao)
      ? dados.planosAcao
      : [];

  const planosFormatados = ordenarMaisRecentes(
    listaPlanosDashboard
  )
    .slice(0, 3)
    .map((plano, idx) => {
      let status = formatarStatusPlano(plano);

      const dataInicio =
        plano.data_inicio ??
        plano.dataInicio ??
        plano.data_inicio_plano ??
        null;

      const dataFim =
        plano.data_fim ??
        plano.dataFim ??
        plano.data_encerramento ??
        plano.data_termino ??
        plano.prazo ??
        null;

      const statusConcluido =
        status === 'Concluído';

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataFinalPlano = dataFim
        ? new Date(
            `${String(dataFim).split('T')[0]}T00:00:00`
          )
        : null;

      const atrasado =
        !statusConcluido &&
        dataFinalPlano &&
        !Number.isNaN(dataFinalPlano.getTime()) &&
        dataFinalPlano < hoje;

      if (atrasado) {
        status = 'Atrasado';
      }

      const statusTipo =
        status === 'Concluído'
          ? 'concluido'
          : status === 'Atrasado'
            ? 'atrasada'
            : status === 'Não iniciado'
              ? 'nao-iniciada'
              : 'andamento';

      return {
        id:
          plano.id_plano_acao ??
          plano.id ??
          idx,
        plano:
          plano.titulo ??
          plano.descricao ??
          `Plano de ação ${idx + 1}`,
        origem:
          plano.origem ??
          'Avaliação Psicossocial',
        responsavel:
          obterNomeResponsavelPlano(plano),
        dataInicio:
          formatarDataPlano(dataInicio),
        dataFim:
          formatarDataPlano(dataFim),
        status,
        atrasado: Boolean(atrasado),
        statusTipo,
      };
    });

  const handleAbrirAvaliacao = (item) =>
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

  //----------------- ÍCONES KPI -----------------//

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
            {ehGestor
              ? 'Visão geral da sua equipe e principais informações.'
              : 'Visão geral da organização e principais informações.'}
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
                    {renderStatusIcone(
                      item.statusIcone
                    )}

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

              {!ehGestor && (
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
              )}
            </section>

            <section className="planos-wrapper">
              <div className="dash-card card-planos">
                <h3 className="card-titulo-secao">
                  {ehGestor
                    ? 'Meus planos de ação'
                    : 'Planos de ação'}
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
                            {ehGestor
                              ? 'Você não possui planos de ação atribuídos.'
                              : 'Nenhum plano de ação encontrado.'}
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

                              <div>
                                <span
                                  style={{ fontWeight: 600 }}
                                >
                                  Início:
                                </span>{' '}
                                {plano.dataInicio}
                              </div>

                              <div>
                                <span
                                  style={{ fontWeight: 600 }}
                                >
                                  Encerramento:
                                </span>{' '}
                                {plano.dataFim}
                              </div>
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