
import { useEffect, useMemo, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CardIndicador from './componentes/CardIndicador';
import GraficoEvolucao from './componentes/GraficoEvolucao';
import ComparacaoSetores from './componentes/ComparacaoSetores';

import { buscarDadosIndicadores } from './servicos/indicadoresApi';

import { calcularIndicadores } from './funcoes/calcularIndicadores';
import { calcularEvolucao } from './funcoes/calcularEvolucao';
import { calcularComparacaoSetores } from './funcoes/calcularComparacaoSetores';

import './css-indicadores/indicadores.css';

const PARAMETRO_MINIMO = 2.5;

const FATORES_PADRAO = [
    'Comunicação',
    'Reconhecimento',
    'Carga de Trabalho'
];

const DADOS_INICIAIS = {
    avaliacoes: [],
    participacoes: [],
    respostas: [],
    regras: [],
    setores: [],
    feedbacks: []
};

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function obterDataAvaliacao(avaliacao) {
    return (
        avaliacao.data_fim ||
        avaliacao.data_final ||
        avaliacao.data_inicio ||
        avaliacao.data ||
        avaliacao.created_at ||
        ''
    );
}

function obterColaborador(participacao) {
    return Array.isArray(participacao?.colaborador)
        ? participacao.colaborador[0]
        : participacao?.colaborador;
}

function obterSetorColaborador(participacao) {
    const colaborador = obterColaborador(participacao);

    return Array.isArray(colaborador?.setor)
        ? colaborador.setor[0]
        : colaborador?.setor;
}

function obterIdSetorParticipacao(participacao) {
    const colaborador = obterColaborador(participacao);
    const setor = obterSetorColaborador(participacao);

    return Number(
        colaborador?.id_setor ??
        setor?.id ??
        participacao?.id_setor ??
        participacao?.setor?.id
    );
}

function obterIdAvaliacao(participacao) {
    return Number(
        participacao.id_avaliacao ??
        participacao.avaliacao?.id
    );
}

function obterNomeFator(regra) {
    return (
        regra.factor_psicossocial?.nome ||
        regra.fator_psicossocial?.nome ||
        regra.motor_regras?.fator_psicossocial?.nome ||
        regra.motor_regras?.factor_psicossocial?.nome ||
        regra.nome_fator ||
        ''
    );
}

function obterIdFator(regra) {
    return Number(
        regra.factor_psicossocial?.id ??
        regra.fator_psicossocial?.id ??
        regra.motor_regras?.fator_psicossocial?.id ??
        regra.motor_regras?.factor_psicossocial?.id ??
        regra.motor_regras?.id_psicossocial_fator ??
        regra.id_psicossocial_fator
    );
}

function obterMediaFator(mediasFatores = {}, nomeFator) {
    if (!mediasFatores || !nomeFator) {
        return null;
    }

    const chaveEncontrada = Object.keys(mediasFatores).find(
        chave =>
            normalizarTexto(chave) === normalizarTexto(nomeFator)
    );

    if (!chaveEncontrada) {
        return null;
    }

    const valor = mediasFatores[chaveEncontrada];

    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    if (typeof valor === 'object') {
        const media = valor.media ?? valor.valor ?? valor.mediaFator;

        return media === null || media === undefined
            ? null
            : Number(media);
    }

    const numero = Number(
        String(valor).replace(',', '.')
    );

    return Number.isFinite(numero) ? numero : null;
}

function formatarMedia(media) {
    if (media === null || media === undefined || media === '') {
        return '—';
    }

    const numero = Number(media);

    if (!Number.isFinite(numero)) {
        return '—';
    }

    return numero.toFixed(1).replace('.', ',');
}

function obterClassificacao(media) {
    if (
        media === null ||
        media === undefined ||
        !Number.isFinite(Number(media))
    ) {
        return 'Sem dados';
    }

    if (Number(media) < PARAMETRO_MINIMO) {
        return 'Abaixo da Meta';
    }

    if (Number(media) < 3.5) {
        return 'Atenção';
    }

    return 'Normal';
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

function Indicadores() {
    const [dados, setDados] = useState(DADOS_INICIAIS);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [perfilUsuario, setPerfilUsuario] = useState({
        nivel: '',
        idSetor: null,
        setor: null
    });

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: 'Todos'
    });

    const [fatorSelecionado, setFatorSelecionado] =
        useState('Carga de Trabalho');

    const ehGestor =
        normalizarTexto(perfilUsuario.nivel) === 'gestor';

    /* =====================================================
       CARREGAMENTO DOS DADOS
    ===================================================== */

    useEffect(() => {
        const usuario = JSON.parse(
            localStorage.getItem('usuario') || '{}'
        );

        const nivelAcesso = usuario.nivel_acesso?.nome || '';

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro('');

                const resultado = await buscarDadosIndicadores();

                const participacoes = Array.isArray(
                    resultado.participacoes
                )
                    ? resultado.participacoes
                    : [];

                /* =========================================
                   IDENTIFICAR O SETOR DO GESTOR
                ========================================= */

                let setorGestor = null;

                if (normalizarTexto(nivelAcesso) === 'gestor') {
                    const participacaoGestor = participacoes.find(
                        participacao => {
                            const colaborador =
                                obterColaborador(participacao);

                            const idColaborador = Number(
                                colaborador?.id ??
                                colaborador?.id_colaborador ??
                                participacao.id_colaborador
                            );

                            return (
                                idColaborador ===
                                Number(usuario.id_colaborador)
                            );
                        }
                    );

                    if (participacaoGestor) {
                        setorGestor = obterSetorColaborador(
                            participacaoGestor
                        );
                    }

                    const idSetorGestor = Number(
                        setorGestor?.id ??
                        obterIdSetorParticipacao(
                            participacaoGestor || {}
                        )
                    );

                    if (
                        Number.isFinite(idSetorGestor) &&
                        idSetorGestor > 0
                    ) {
                        const setorCadastrado = (
                            resultado.setores || []
                        ).find(
                            setor =>
                                Number(setor.id) === idSetorGestor
                        );

                        setorGestor = {
                            ...(setorCadastrado || {}),
                            ...(setorGestor || {}),
                            id: idSetorGestor
                        };
                    } else {
                        setorGestor = null;
                    }

                    console.log(
                        'SETOR DO GESTOR:',
                        setorGestor
                    );
                }

                setPerfilUsuario({
                    nivel: nivelAcesso,
                    idSetor: setorGestor
                        ? Number(setorGestor.id)
                        : null,
                    setor: setorGestor
                });

                /* =========================================
                   SALVAR OS DADOS DA TELA
                ========================================= */

                setDados({
                    ...DADOS_INICIAIS,
                    ...resultado
                });

            } catch (error) {
                setErro(
                    error.message ||
                    'Não foi possível carregar os indicadores.'
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    /* =====================================================
       AVALIAÇÃO MAIS RECENTE
    ===================================================== */

    const ultimaAvaliacao = useMemo(() => {
        if (!dados.avaliacoes.length) {
            return null;
        }

        return [...dados.avaliacoes].sort((a, b) => {
            const dataA = new Date(obterDataAvaliacao(a)).getTime();
            const dataB = new Date(obterDataAvaliacao(b)).getTime();

            return (
                (Number.isFinite(dataB) ? dataB : 0) -
                (Number.isFinite(dataA) ? dataA : 0)
            );
        })[0];
    }, [dados.avaliacoes]);

    /* =====================================================
       FATORES PSICOSSOCIAIS COM ID
    ===================================================== */

    const fatores = useMemo(() => {
        const mapa = new Map();

        dados.regras.forEach(regra => {
            const id = obterIdFator(regra);
            const nome = obterNomeFator(regra);

            if (Number.isFinite(id) && id > 0 && nome) {
                mapa.set(id, nome);
            }
        });

        return Array.from(mapa.entries()).map(([id, nome]) => ({
            id,
            nome
        }));
    }, [dados.regras]);

    /* =====================================================
       NOMES PARA GRÁFICO E SELETOR
    ===================================================== */

    const nomesFatores = useMemo(() => {
        const nomes = fatores.map(fator => fator.nome);

        FATORES_PADRAO.forEach(nomePadrao => {
            const existe = nomes.some(
                nome =>
                    normalizarTexto(nome) ===
                    normalizarTexto(nomePadrao)
            );

            if (!existe) {
                nomes.push(nomePadrao);
            }
        });

        return nomes;
    }, [fatores]);

    /* =====================================================
       MANTÉM O FATOR SELECIONADO VÁLIDO
    ===================================================== */

    useEffect(() => {
        const fatorExiste = nomesFatores.some(
            nome =>
                normalizarTexto(nome) ===
                normalizarTexto(fatorSelecionado)
        );

        if (!fatorExiste) {
            const fatorPadrao = nomesFatores.find(
                nome =>
                    normalizarTexto(nome) === 'carga de trabalho'
            );

            setFatorSelecionado(
                fatorPadrao || nomesFatores[0] || ''
            );
        }
    }, [nomesFatores, fatorSelecionado]);

    /* =====================================================
       OPÇÕES DO FILTRO DE SETOR

       RH: todos os setores.
       Gestor: somente o próprio setor.
    ===================================================== */

    const setoresDropdown = useMemo(() => {
        if (ehGestor) {
            if (!perfilUsuario.setor) {
                return [];
            }

            return [{
                id: String(perfilUsuario.idSetor),
                nome: perfilUsuario.setor.nome || 'Meu setor'
            }];
        }

        return [
            { id: 'Todos', nome: 'Todos' },
            ...dados.setores.map(setor => ({
                id: String(setor.id),
                nome: setor.nome
            }))
        ];
    }, [
        ehGestor,
        perfilUsuario.idSetor,
        perfilUsuario.setor,
        dados.setores
    ]);

    /* =====================================================
       SETOR SELECIONADO

       Gestor: sempre o próprio setor.
       RH: respeita o filtro atual.
    ===================================================== */

    const setorSelecionado = useMemo(() => {
        if (ehGestor) {
            if (!perfilUsuario.idSetor) {
                return null;
            }

            return (
                dados.setores.find(
                    setor =>
                        Number(setor.id) ===
                        Number(perfilUsuario.idSetor)
                ) ||
                perfilUsuario.setor ||
                null
            );
        }

        if (filtros.opcao && filtros.opcao !== 'Todos') {
            return dados.setores.find(
                setor =>
                    String(setor.id) === String(filtros.opcao)
            ) || null;
        }

        const pesquisa = normalizarTexto(filtros.pesquisa);

        if (!pesquisa) {
            return null;
        }

        const setoresCorrespondentes = dados.setores.filter(
            setor =>
                normalizarTexto(setor.nome).includes(pesquisa)
        );

        if (setoresCorrespondentes.length === 1) {
            return setoresCorrespondentes[0];
        }

        return null;
    }, [
        ehGestor,
        perfilUsuario.idSetor,
        perfilUsuario.setor,
        dados.setores,
        filtros
    ]);

    /*
     * Gestor nunca usa null para representar todos os setores.
     * RH continua podendo usar null quando seleciona "Todos".
     */
    const idSetorSelecionado = ehGestor
        ? perfilUsuario.idSetor
        : setorSelecionado
            ? Number(setorSelecionado.id)
            : null;

    /* =====================================================
       PARTICIPAÇÕES DA ÚLTIMA AVALIAÇÃO
    ===================================================== */

    const participacoesUltimaAvaliacao = useMemo(() => {
        if (!ultimaAvaliacao) {
            return [];
        }

        return dados.participacoes.filter(
            participacao =>
                obterIdAvaliacao(participacao) ===
                Number(ultimaAvaliacao.id)
        );
    }, [dados.participacoes, ultimaAvaliacao]);

    /* =====================================================
       INDICADORES PRINCIPAIS
    ===================================================== */

    const mediasIndicadores = useMemo(() => {
        if (
            !ultimaAvaliacao ||
            (ehGestor && !idSetorSelecionado)
        ) {
            return {
                totalParticipantes: 0,
                satisfacaoGeral: null,
                mediasFatores: {},
                possuiDadosAnonimos: false
            };
        }

        return calcularIndicadores({
            participacoes: dados.participacoes,
            respostas: dados.respostas,
            idAvaliacao: ultimaAvaliacao.id,
            idSetor: idSetorSelecionado,
            fatores
        });
    }, [
        dados.participacoes,
        dados.respostas,
        ultimaAvaliacao,
        idSetorSelecionado,
        fatores,
        ehGestor
    ]);

    /* =====================================================
       EVOLUÇÃO HISTÓRICA
    ===================================================== */

const evolucao = useMemo(() => {
    if (ehGestor && !idSetorSelecionado) {
        return [];
    }

    return calcularEvolucao({
        avaliacoes: dados.avaliacoes,
        participacoes: dados.participacoes,
        respostas: dados.respostas,
        fatores,
        idSetor: idSetorSelecionado
    });
}, [
    dados.avaliacoes,
    dados.participacoes,
    dados.respostas,
    fatores,
    idSetorSelecionado,
    ehGestor
]);

    /* =====================================================
       COMPARAÇÃO POR SETOR

       RH: compara todos os setores.
       Gestor: recebe somente o próprio setor.
    ===================================================== */

    const comparacaoSetores = useMemo(() => {
        const fator = fatores.find(
            item =>
                normalizarTexto(item.nome) ===
                normalizarTexto(fatorSelecionado)
        );

        if (
            !fator ||
            !ultimaAvaliacao ||
            (ehGestor && !setorSelecionado)
        ) {
            return [];
        }

        const setoresParaComparacao = ehGestor
            ? [setorSelecionado]
            : dados.setores;

        return calcularComparacaoSetores({
            setores: setoresParaComparacao,
            participacoes: participacoesUltimaAvaliacao,
            respostas: dados.respostas,
            idAvaliacao: ultimaAvaliacao.id,
            idFator: fator.id
        });
    }, [
        dados.setores,
        dados.respostas,
        fatores,
        fatorSelecionado,
        ultimaAvaliacao,
        participacoesUltimaAvaliacao,
        ehGestor,
        setorSelecionado
    ]);

    /* =====================================================
       MÉDIAS DOS CARDS
    ===================================================== */

    const mediaComunicacao = obterMediaFator(
        mediasIndicadores.mediasFatores,
        'Comunicação'
    );

    const mediaReconhecimento = obterMediaFator(
        mediasIndicadores.mediasFatores,
        'Reconhecimento'
    );

    const mediaCargaTrabalho = obterMediaFator(
        mediasIndicadores.mediasFatores,
        'Carga de Trabalho'
    );

    /* =====================================================
       CARREGAMENTO
    ===================================================== */

    if (carregando) {
        return (
            <main className="pagina-indicadores">
                <div className="indicadores-mensagem">
                    Carregando indicadores...
                </div>
            </main>
        );
    }

    /* =====================================================
       TELA
    ===================================================== */

    return (
        <main className="pagina-indicadores">

            <BotaoCadastro
                titulo="Indicadores"
                descricao="Acompanhe os principais resultados da experiência e gestão dos colaboradores."
                textoBotao=""
            />

            {erro && (
                <div className="indicadores-erro">
                    {erro}
                </div>
            )}

            {/* FILTRO DE SETOR */}

            <section className="filtro-indicadores">
                {ehGestor ? (
                    <div className="setor-indicadores-gestor">
                        <strong>Setor:</strong>{' '}
                        {setorSelecionado?.nome ||
                            'Não foi possível identificar seu setor.'}
                    </div>
                ) : (
                    <Filtro
                        titulo="Pesquisar Setor"
                        placeholder="Buscar por nome"
                        nomeDropdown="Setor"
                        opcoesDropdown={setoresDropdown}
                        onFiltrosChange={setFiltros}
                        mostrarStatus={false}
                    />
                )}
            </section>

            {/* CARDS DE INDICADORES */}

            <section className="grade-cards-indicadores">

                <CardIndicador
                    titulo="MÉTRICA GERAL"
                    descricao="Satisfação Geral"
                    valor={`${formatarMedia(
                        mediasIndicadores.satisfacaoGeral
                    )} / 5,0`}
                    classificacao={obterClassificacao(
                        mediasIndicadores.satisfacaoGeral
                    )}
                    icone="✦"
                />

                <CardIndicador
                    titulo="INTERAÇÃO & ALINHAMENTO"
                    descricao="Comunicação"
                    valor={`${formatarMedia(mediaComunicacao)} / 5,0`}
                    classificacao={obterClassificacao(mediaComunicacao)}
                    icone="↔"
                />

                <CardIndicador
                    titulo="VALORIZAÇÃO"
                    descricao="Reconhecimento"
                    valor={`${formatarMedia(mediaReconhecimento)} / 5,0`}
                    classificacao={obterClassificacao(mediaReconhecimento)}
                    icone="★"
                />

                <CardIndicador
                    titulo="EQUILÍBRIO & ROTINA"
                    descricao="Carga de Trabalho"
                    valor={`${formatarMedia(mediaCargaTrabalho)} / 5,0`}
                    classificacao={obterClassificacao(mediaCargaTrabalho)}
                    icone="◷"
                />

            </section>

            {!mediasIndicadores.possuiDadosAnonimos && (
                <div className="indicadores-mensagem">
                    São necessários pelo menos 5 participantes distintos
                    para apresentar os indicadores deste grupo.
                </div>
            )}

            {/* GRÁFICO DE EVOLUÇÃO */}

            <section className="painel-indicadores">
                <GraficoEvolucao
                    dados={evolucao}
                    fatores={nomesFatores}
                    setorSelecionado={
                        setorSelecionado?.nome ||
                        (ehGestor
                            ? 'Setor não identificado'
                            : 'Todos os setores')
                    }
                    parametroMinimo={PARAMETRO_MINIMO}
                />
            </section>

            {/* COMPARAÇÃO POR SETOR */}

            <section className="painel-indicadores">
                <ComparacaoSetores
                    dados={comparacaoSetores}
                    fatores={nomesFatores}
                    fatorSelecionado={fatorSelecionado}
                    onFatorChange={setFatorSelecionado}
                    parametroMinimo={PARAMETRO_MINIMO}
                />
            </section>

        </main>
    );
}

export default Indicadores;
