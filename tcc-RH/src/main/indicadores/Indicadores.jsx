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

function normalizarTexto(texto = '') {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function obterDataAvaliacao(avaliacao) {
    return (
        avaliacao?.data_fim ||
        avaliacao?.data_final ||
        avaliacao?.data_inicio ||
        avaliacao?.data ||
        avaliacao?.created_at ||
        ''
    );
}

function obterStatusAvaliacao(avaliacao) {
    return (
        avaliacao?.status?.nome ||
        avaliacao?.status?.descricao ||
        avaliacao?.status ||
        avaliacao?.situacao?.nome ||
        avaliacao?.situacao ||
        avaliacao?.estado?.nome ||
        avaliacao?.estado ||
        ''
    );
}

function avaliacaoEncerrada(avaliacao) {
    const status = obterStatusAvaliacao(avaliacao);

    if (Number(status) === 1) {
        return true;
    }

    if (Number(status) === 0) {
        return false;
    }

    const texto = normalizarTexto(status);

    return (
        texto.includes('encerrad') ||
        texto.includes('concluid') ||
        texto.includes('finalizad')
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
        participacao?.id_avaliacao ??
        participacao?.avaliacao?.id
    );
}

function obterNomeFator(regra) {
    return (
        regra?.factor_psicossocial?.nome ||
        regra?.fator_psicossocial?.nome ||
        regra?.motor_regras?.fator_psicossocial?.nome ||
        regra?.motor_regras?.factor_psicossocial?.nome ||
        regra?.nome_fator ||
        ''
    );
}

function obterIdFator(regra) {
    return Number(
        regra?.factor_psicossocial?.id ??
        regra?.fator_psicossocial?.id ??
        regra?.motor_regras?.fator_psicossocial?.id ??
        regra?.motor_regras?.factor_psicossocial?.id ??
        regra?.motor_regras?.id_psicossocial_fator ??
        regra?.id_psicossocial_fator
    );
}

function obterMediaFator(mediasFatores = {}, nomeFator) {
    if (!mediasFatores || !nomeFator) {
        return null;
    }

    const chave = Object.keys(mediasFatores).find(
        item =>
            normalizarTexto(item) === normalizarTexto(nomeFator)
    );

    if (!chave) {
        return null;
    }

    const valor = mediasFatores[chave];

    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    if (typeof valor === 'object') {
        const media = valor.media ?? valor.valor ?? valor.mediaFator;

        return media === null || media === undefined
            ? null
            : Number(media);
    }

    const numero = Number(String(valor).replace(',', '.'));

    return Number.isFinite(numero) ? numero : null;
}

function formatarMedia(media) {
    if (media === null || media === undefined || media === '') {
        return '—';
    }

    const numero = Number(media);

    return Number.isFinite(numero)
        ? numero.toFixed(1).replace('.', ',')
        : '—';
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

    useEffect(() => {
        const usuario = JSON.parse(
            localStorage.getItem('usuario') || '{}'
        );

        const nivelAcesso = usuario?.nivel_acesso?.nome || '';

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro('');

                const resultado = await buscarDadosIndicadores(usuario);

                let setorGestor = resultado.setorGestor || null;

                if (normalizarTexto(nivelAcesso) === 'gestor') {
                    const idSetor = Number(
                        setorGestor?.id ??
                        setorGestor?.id_setor
                    );

                    if (Number.isFinite(idSetor) && idSetor > 0) {
                        const setorCadastrado = resultado.setores.find(
                            setor => Number(setor.id) === idSetor
                        );

                        setorGestor = {
                            ...(setorCadastrado || {}),
                            ...(setorGestor || {}),
                            id: idSetor
                        };
                    } else {
                        setorGestor = null;
                    }
                }

                setPerfilUsuario({
                    nivel: nivelAcesso,
                    idSetor: setorGestor
                        ? Number(setorGestor.id)
                        : null,
                    setor: setorGestor
                });

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

        const correspondentes = dados.setores.filter(
            setor =>
                normalizarTexto(setor.nome).includes(pesquisa)
        );

        return correspondentes.length === 1
            ? correspondentes[0]
            : null;
    }, [
        ehGestor,
        perfilUsuario.idSetor,
        perfilUsuario.setor,
        dados.setores,
        filtros
    ]);

    const idSetorSelecionado = ehGestor
        ? perfilUsuario.idSetor
        : setorSelecionado
            ? Number(setorSelecionado.id)
            : null;

    const ultimaAvaliacao = useMemo(() => {
        if (!dados.avaliacoes.length) {
            return null;
        }

        const participacoesFiltradas =
            dados.participacoes.filter(participacao => {
                if (
                    idSetorSelecionado === null ||
                    idSetorSelecionado === undefined
                ) {
                    return true;
                }

                return (
                    obterIdSetorParticipacao(participacao) ===
                    Number(idSetorSelecionado)
                );
            });

        const idsParticipacoes = new Set(
            participacoesFiltradas
                .map(participacao => Number(participacao.id))
                .filter(id => Number.isFinite(id) && id > 0)
        );

        const idsAvaliacoesComRespostas = new Set();

        dados.respostas.forEach(resposta => {
            const valor = Number(
                String(resposta?.valor ?? '').replace(',', '.')
            );

            const idParticipacao = Number(
                resposta?.id_avaliacao_participacao ??
                resposta?.avaliacao_participacao?.id
            );

            if (
                !Number.isFinite(valor) ||
                valor < 1 ||
                valor > 5 ||
                !idsParticipacoes.has(idParticipacao)
            ) {
                return;
            }

            const participacao = participacoesFiltradas.find(
                item => Number(item.id) === idParticipacao
            );

            if (!participacao) {
                return;
            }

            const idAvaliacao = obterIdAvaliacao(participacao);

            if (Number.isFinite(idAvaliacao) && idAvaliacao > 0) {
                idsAvaliacoesComRespostas.add(idAvaliacao);
            }
        });

        const avaliacoesComRespostas = dados.avaliacoes.filter(
            avaliacao =>
                avaliacaoEncerrada(avaliacao) &&
                idsAvaliacoesComRespostas.has(Number(avaliacao.id))
        );

        if (!avaliacoesComRespostas.length) {
            return null;
        }

        return [...avaliacoesComRespostas].sort((a, b) => {
            const dataA = new Date(obterDataAvaliacao(a)).getTime();
            const dataB = new Date(obterDataAvaliacao(b)).getTime();

            return (
                (Number.isFinite(dataB) ? dataB : 0) -
                (Number.isFinite(dataA) ? dataA : 0)
            );
        })[0];
    }, [
        dados.avaliacoes,
        dados.participacoes,
        dados.respostas,
        idSetorSelecionado
    ]);

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

    const comparacaoSetores = useMemo(() => {
        const fator = fatores.find(
            item =>
                normalizarTexto(item.nome) ===
                normalizarTexto(fatorSelecionado)
        );

        if (!fator || (ehGestor && !setorSelecionado)) {
            return [];
        }

        return calcularComparacaoSetores({
            setores: ehGestor
                ? [setorSelecionado]
                : dados.setores,
            avaliacoes: dados.avaliacoes,
            participacoes: dados.participacoes,
            respostas: dados.respostas,
            idFator: fator.id
        });
    }, [
        dados.setores,
        dados.avaliacoes,
        dados.participacoes,
        dados.respostas,
        fatores,
        fatorSelecionado,
        ehGestor,
        setorSelecionado
    ]);

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

    if (carregando) {
        return (
            <main className="pagina-indicadores">
                <div className="indicadores-mensagem">
                    Carregando indicadores...
                </div>
            </main>
        );
    }

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

            <section className="grade-cards-indicadores">
                <CardIndicador
                    titulo="MÉTRICA GERAL"
                    descricao="Satisfação Geral"
                    valor={`${formatarMedia(mediasIndicadores.satisfacaoGeral)} / 5,0`}
                    classificacao={obterClassificacao(mediasIndicadores.satisfacaoGeral)}
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
                    É necessário pelo menos 1 participante com
                    respostas válidas para apresentar os indicadores
                    deste grupo.
                </div>
            )}

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