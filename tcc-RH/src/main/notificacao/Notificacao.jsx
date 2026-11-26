
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../componentes/cardNomePag/nomePag.css';
import './css-notificacao/notificacao.css';

import {
  buscarNotificacoes,
  marcarNotificacaoComoLida,
  verificarNotificacaoLida,
} from './servicos/notificacaoService';


//----------------- ROTAS DOS MÓDULOS ---------------------------//

const ROTAS_MODULO = [
  {
    match: ['plano'],
    rota: '/planos-acao',
    rotulo: 'Acompanhar Plano de ação',
  },
  {
    match: ['férias', 'ferias'],
    rota: '/ferias',
    rotulo: 'Acompanhar Férias',
  },
  {
    match: ['doc'],
    rota: '/documentos',
    rotulo: 'Acompanhar Documentos',
  },
  {
    match: ['benef'],
    rota: '/beneficios',
    rotulo: 'Acompanhar Benefícios',
  },
  {
    match: ['avalia', 'psico'],
    rota: '/avaliacao-psicossocial',
    rotulo: 'Acompanhar Avaliação',
  },
  {
    match: ['pesquisa'],
    rota: '/pesquisas',
    rotulo: 'Acompanhar Pesquisa',
  },
  {
    match: ['regra'],
    rota: '/motor-regras',
    rotulo: 'Acompanhar Motor de Regras',
  },
  {
    match: ['indicador'],
    rota: '/indicadores',
    rotulo: 'Acompanhar Indicadores',
  },
];


//----------------- COMPONENTE NOTIFICAÇÃO ----------------------//

function Notificacao() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [abaAtiva, setAbaAtiva] = useState('todas');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesLidas, setNotificacoesLidas] = useState([]);

  const [notificacaoSelecionada, setNotificacaoSelecionada] =
    useState(null);

  const itensPorPagina = 10;


  //----------------- CARREGAR NOTIFICAÇÕES ---------------------//

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro('');

        const lista = await buscarNotificacoes();

        setNotificacoes(lista);

        // Recupera quais notificações já foram lidas localmente.
        const lidas = lista
          .filter((item) => verificarNotificacaoLida(item))
          .map((item) => obterChaveNotificacao(item));

        setNotificacoesLidas(lidas);
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);

        setErro(
          err.message || 'Erro ao carregar notificações.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);


  //----------------- IDENTIFICAR ID DA NOTIFICAÇÃO -------------//

  const obterIdNotificacao = (item) => {
    return item.id_notificacao ?? item.id;
  };


  //----------------- IDENTIFICAR CHAVE DA NOTIFICAÇÃO ----------//

  const obterChaveNotificacao = (item) => {
    const id = obterIdNotificacao(item);

    if (id === undefined || id === null) {
      return null;
    }

    return `${id}_${item.tipo_origem || 'geral'}`;
  };


  //----------------- IDENTIFICAR MÓDULO ------------------------//

  const identificarModulo = (item) => {
    if (
      item.tipo_origem &&
      String(item.tipo_origem).trim() !== ''
    ) {
      return item.tipo_origem;
    }

    const texto =
      `${item.titulo ?? ''} ${item.mensagem ?? ''}`.toLowerCase();

    if (
      texto.includes('férias') ||
      texto.includes('ferias')
    ) {
      return 'Férias';
    }

    if (
      texto.includes('benefício') ||
      texto.includes('beneficio')
    ) {
      return 'Benefícios';
    }

    if (
      texto.includes('pesquisa') ||
      texto.includes('avaliação') ||
      texto.includes('avaliacao')
    ) {
      return 'Avaliação Psicossocial';
    }

    if (texto.includes('documento')) {
      return 'Documentos';
    }

    if (texto.includes('plano')) {
      return 'Plano de Ação';
    }

    if (
      texto.includes('regra') ||
      texto.includes('indicador')
    ) {
      return 'Motor de Regras';
    }

    return 'Sistema';
  };


  //----------------- IDENTIFICAR ÍCONE --------------------------//

  const obterTipoIcone = (modulo = '') => {
    const mod = String(modulo).toLowerCase();

    if (
      mod.includes('regra') ||
      mod.includes('indicador')
    ) {
      return 'raio';
    }

    if (mod.includes('doc')) {
      return 'pasta';
    }

    if (mod.includes('benef')) {
      return 'cartao';
    }

    if (
      mod.includes('avalia') ||
      mod.includes('psico') ||
      mod.includes('pesquisa')
    ) {
      return 'mente';
    }

    return 'prancheta';
  };


  //----------------- IDENTIFICAR DESTINO ------------------------//

  const obterDestinoModulo = (modulo = '') => {
    const mod = String(modulo).toLowerCase();

    const encontrado = ROTAS_MODULO.find((item) =>
      item.match.some((termo) => mod.includes(termo))
    );

    return encontrado || {
      rota: '/dashboard',
      rotulo: 'Acompanhar',
    };
  };


  //----------------- FORMATAR DATA E HORA -----------------------//

  const formatarDataHora = (dataBruta) => {
    if (!dataBruta) return '';

    const texto = String(dataBruta).trim();

    if (
      texto.includes('/') ||
      texto.toLowerCase().includes('hoje')
    ) {
      return texto;
    }

    const normalizada =
      texto.includes(' ') && !texto.includes('T')
        ? texto.replace(' ', 'T')
        : texto;

    const dataObj = new Date(normalizada);

    if (isNaN(dataObj.getTime())) {
      return texto;
    }

    const hoje = new Date();

    const mesmoDia =
      dataObj.getDate() === hoje.getDate() &&
      dataObj.getMonth() === hoje.getMonth() &&
      dataObj.getFullYear() === hoje.getFullYear();

    const hora = dataObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return mesmoDia
      ? `Hoje, ${hora}`
      : `${dataObj.toLocaleDateString('pt-BR')}, ${hora}`;
  };


  //----------------- FORMATAR NOTIFICAÇÕES ----------------------//

  const notificacoesFormatadas = notificacoes.map((item) => {
    const chave = obterChaveNotificacao(item);

    // Verifica leitura no localStorage.
    const estaLida =
      verificarNotificacaoLida(item) ||
      item.lida === true ||
      Number(item.lida) === 1 ||
      String(item.status ?? '').toLowerCase() === 'lida';

    const modulo = identificarModulo(item);

    const chaveData = Object.keys(item).find(
      (k) =>
        (
          k.toLowerCase().includes('data') ||
          k.toLowerCase().startsWith('dt_') ||
          k.toLowerCase().includes('created') ||
          k.toLowerCase().includes('updated')
        ) &&
        item[k] !== null &&
        item[k] !== ''
    );

    return {
      original: item,
      id: obterIdNotificacao(item),
      chave,
      modulo,
      dataHora: formatarDataHora(
        chaveData ? item[chaveData] : null
      ),
      lida: estaLida,
      icone: obterTipoIcone(modulo),
      titulo: item.titulo ?? 'Notificação do sistema',
      descricao: item.mensagem ?? '',
    };
  });


  //----------------- CONTADORES -------------------------------//

  const totalTodas = notificacoesFormatadas.length;

  const totalNaoLidas = notificacoesFormatadas.filter(
    (n) => !n.lida
  ).length;


  //----------------- FILTRAR NOTIFICAÇÕES ----------------------//

  const listaFiltrada =
    abaAtiva === 'nao-lidas'
      ? notificacoesFormatadas.filter((n) => !n.lida)
      : notificacoesFormatadas;


  //----------------- PAGINAÇÃO -------------------------------//

  const totalPaginas = Math.max(
    1,
    Math.ceil(listaFiltrada.length / itensPorPagina)
  );

  const indiceInicio =
    (paginaAtual - 1) * itensPorPagina;

  const indiceFim = Math.min(
    indiceInicio + itensPorPagina,
    listaFiltrada.length
  );

  const itensExibidos = listaFiltrada.slice(
    indiceInicio,
    indiceFim
  );


  //----------------- CLICAR NA NOTIFICAÇÃO ---------------------//

  const handleCliqueNotificacao = async (itemFormatado) => {
    const chave = itemFormatado.chave;

    // Atualiza visualmente a notificação para lida.
    setNotificacaoSelecionada({
      ...itemFormatado,
      lida: true,
    });

    if (!itemFormatado.lida && chave) {
      // Marca como lida somente no localStorage.
      try {
        await marcarNotificacaoComoLida(
          itemFormatado.original
        );

        setNotificacoesLidas((prev) =>
          prev.includes(chave)
            ? prev
            : [...prev, chave]
        );
      } catch (err) {
        console.error(
          'Erro ao marcar notificação como lida:',
          err
        );
      }
    }
  };


  //----------------- RENDERIZAR ÍCONES --------------------------//

  const renderIcone = (tipo) => {
    switch (tipo) {
      case 'raio':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        );

      case 'pasta':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        );

      case 'cartao':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="1"
              y="4"
              width="22"
              height="16"
              rx="2"
              ry="2"
            />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );

      case 'mente':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2" />
            <path d="M9 21h6" />
          </svg>
        );

      default:
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="8"
              y="2"
              width="8"
              height="4"
              rx="1"
              ry="1"
            />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <line x1="12" y1="11" x2="12" y2="15" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        );
    }
  };


  //----------------- DESTINO DA NOTIFICAÇÃO ---------------------//

  const destino = notificacaoSelecionada
    ? obterDestinoModulo(notificacaoSelecionada.modulo)
    : null;


  //----------------- JSX -------------------------------//

  return (
    <div className="notificacao-wrapper">

      <div className="card-tiulo">
        <div className="titulo-descricao">
          <h2>Notificação</h2>

          <p>
            Consulte e acompanhe as notificações geradas pelo
            sistema para os diferentes módulos e colaboradores
            da organização.
          </p>
        </div>
      </div>


      <div className="notificacao-conteudo">

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


        <div className="notif-card-principal">

          <div className="notif-topo-secao">
            <h3>Todas as notificações</h3>
          </div>


          {/* Abas */}

          <div className="notif-abas">

            <button
              type="button"
              className={`notif-aba-btn ${
                abaAtiva === 'todas' ? 'ativa' : ''
              }`}
              onClick={() => {
                setAbaAtiva('todas');
                setPaginaAtual(1);
              }}
            >
              Todas ({totalTodas})
            </button>

            <button
              type="button"
              className={`notif-aba-btn ${
                abaAtiva === 'nao-lidas' ? 'ativa' : ''
              }`}
              onClick={() => {
                setAbaAtiva('nao-lidas');
                setPaginaAtual(1);
              }}
            >
              Não lidas ({totalNaoLidas})
            </button>

          </div>


          {/* Lista */}

          <div className="notif-lista">

            {carregando ? (
              <div
                style={{
                  padding: '36px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                Carregando notificações...
              </div>
            ) : erro ? (
              <div
                style={{
                  padding: '36px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                Não foi possível carregar as notificações.
              </div>
            ) : itensExibidos.length === 0 ? (
              <div
                style={{
                  padding: '36px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                Nenhuma notificação encontrada.
              </div>
            ) : (
              itensExibidos.map((item) => (
                <div
                  key={item.chave || item.id}
                  className={`notif-item ${
                    !item.lida ? 'nao-lida' : 'lida'
                  }`}
                  onClick={() =>
                    handleCliqueNotificacao(item)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(evento) => {
                    if (
                      evento.key === 'Enter' ||
                      evento.key === ' '
                    ) {
                      evento.preventDefault();
                      handleCliqueNotificacao(item);
                    }
                  }}
                >

                  <div className="notif-indicador-coluna">
                    {!item.lida && (
                      <span className="notif-ponto-azul" />
                    )}
                  </div>


                  <div
                    className={`notif-icone-box ${
                      !item.lida
                        ? 'icone-azul'
                        : 'icone-cinza'
                    }`}
                  >
                    {renderIcone(item.icone)}
                  </div>


                  <div className="notif-corpo">

                    <div className="notif-meta">

                      <span
                        className={`notif-badge-modulo ${
                          !item.lida
                            ? 'mod-azul'
                            : 'mod-cinza'
                        }`}
                      >
                        {item.modulo}
                      </span>

                      {item.dataHora && (
                        <>
                          <span className="notif-separador">
                            •
                          </span>

                          <span className="notif-data">
                            {item.dataHora}
                          </span>
                        </>
                      )}

                      <span
                        className={`notif-badge-status ${
                          !item.lida
                            ? 'st-nao-lida'
                            : 'st-lida'
                        }`}
                      >
                        {!item.lida
                          ? 'Não lida'
                          : 'Lida'}
                      </span>

                    </div>


                    <h4 className="notif-titulo">
                      {item.titulo}
                    </h4>

                    <p className="notif-descricao">
                      {item.descricao}
                    </p>

                  </div>

                </div>
              ))
            )}

          </div>


          {/* Rodapé e paginação */}

          <div className="notif-rodape">

            <div className="notif-contagem">
              Exibindo{' '}

              <strong>
                {listaFiltrada.length === 0
                  ? 0
                  : indiceInicio + 1}
                –{indiceFim}
              </strong>{' '}

              de{' '}

              <strong>
                {listaFiltrada.length}
              </strong>{' '}

              notificações

              <span className="notif-rodape-sep">
                •
              </span>

              <span>
                {itensPorPagina} por página
              </span>
            </div>


            <div className="notif-paginacao">

              <button
                type="button"
                className="pag-btn pag-texto"
                disabled={paginaAtual === 1}
                onClick={() =>
                  setPaginaAtual((p) =>
                    Math.max(1, p - 1)
                  )
                }
              >
                ‹ Anterior
              </button>


              {Array.from(
                { length: totalPaginas },
                (_, i) => i + 1
              ).map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`pag-btn pag-num ${
                    paginaAtual === num ? 'ativa' : ''
                  }`}
                  onClick={() => setPaginaAtual(num)}
                >
                  {num}
                </button>
              ))}


              <button
                type="button"
                className="pag-btn pag-texto"
                disabled={paginaAtual === totalPaginas}
                onClick={() =>
                  setPaginaAtual((p) =>
                    Math.min(totalPaginas, p + 1)
                  )
                }
              >
                Próxima ›
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* Modal da notificação */}

      {notificacaoSelecionada && (
        <div
          className="notif-fundo-alerta"
          onClick={() =>
            setNotificacaoSelecionada(null)
          }
        >

          <div
            className="notif-card-alerta"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-notificacao-alerta"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="notif-cabecalho-alerta">

              <div className="notif-icone-box icone-azul">
                {renderIcone(
                  notificacaoSelecionada.icone
                )}
              </div>


              <div className="notif-titulo-alerta">
                <h2 id="titulo-notificacao-alerta">
                  {notificacaoSelecionada.titulo}
                </h2>
              </div>


              <button
                type="button"
                className="notif-fechar-alerta"
                onClick={() =>
                  setNotificacaoSelecionada(null)
                }
                aria-label="Fechar alerta"
              >
                ×
              </button>

            </div>


            <div className="notif-corpo-alerta">

              <span className="notif-label-descricao">
                Descrição
              </span>

              <p className="notif-mensagem-alerta">
                {notificacaoSelecionada.descricao}
              </p>

            </div>


            <div className="notif-botoes-alerta">

              <button
                type="button"
                className="notif-botao-voltar"
                onClick={() =>
                  setNotificacaoSelecionada(null)
                }
              >
                Voltar
              </button>


              <button
                type="button"
                className="notif-botao-acompanhar"
                onClick={() => {
                  const rotaDestino =
                    destino?.rota || '/dashboard';

                  const dadosNotificacao =
                    notificacaoSelecionada.original;

                  setNotificacaoSelecionada(null);

                  navigate(rotaDestino, {
                    state: {
                      notificacao: dadosNotificacao,
                    },
                  });
                }}
              >
                {destino?.rotulo || 'Acompanhar'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Notificacao;
