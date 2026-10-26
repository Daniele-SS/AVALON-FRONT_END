import { useEffect, useMemo, useRef, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';
import SelecaoColaborador from './componentes/cadastro/SelecaoColaborador.jsx';
import ObservacoesFerias from './componentes/cadastro/ObservacoesFerias.jsx';
import PeriodoFerias from './componentes/cadastro/PeriodoFerias.jsx';
import {
    buscarColaboradoresFerias,
    buscarUsuariosGestores
} from './servicos/colaboradoresFerias.js';

import {
    obterSetor,
    obterCargo,
    obterNivelAcesso,
    colaboradorDoUsuario,
    normalizarColaboradores,
    normalizarUsuarios
} from './funcoes/cadastroFerias/auxiliaresFerias.js';


import { cadastrarFerias } from './servicos/cadastroFerias.js';
import editarFeriasApi from './servicos/editarFerias.js';

import validarFerias from './funcoes/cadastroFerias/validarFerias.js';
import calcularDiasFerias from './funcoes/cadastroFerias/calcularDiasFerias.js';
import buscarGestorColaborador from './funcoes/cadastroFerias/buscarGestorColaborador.js';



import './css-ferias/cadastroFerias.css';

const LIMITE_ANUAL_FERIAS = 30;



function CadastroFerias({
    voltar,
    ferias = null,
    modoEdicao = false
}) {

    const [colaboradores, setColaboradores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [
        colaboradorSelecionado,
        setColaboradorSelecionado
    ] = useState(null);

    const [
        pesquisaColaborador,
        setPesquisaColaborador
    ] = useState('');

    const [
        dropdownAberto,
        setDropdownAberto
    ] = useState(false);

    const [
        dataInicio,
        setDataInicio
    ] = useState('');

    const [
        dataFim,
        setDataFim
    ] = useState('');

    const [
        observacao,
        setObservacao
    ] = useState('');

    const [
        salvando,
        setSalvando
    ] = useState(false);

    const [
        carregandoColaboradores,
        setCarregandoColaboradores
    ] = useState(true);

    const [
        erroCarregamento,
        setErroCarregamento
    ] = useState('');

    const [
        erros,
        setErros
    ] = useState({});

    const [
        idFerias,
        setIdFerias
    ] = useState(null);

    const dropdownRef = useRef(null);

    useEffect(() => {

        async function carregarDados() {

            setCarregandoColaboradores(true);
            setErroCarregamento('');

            try {

                const [
                    dadosColaboradores,
                    dadosUsuarios
                ] = await Promise.all([
                    buscarColaboradoresFerias(),
                    buscarUsuariosGestores()
                ]);

                const listaColaboradores =
                    normalizarColaboradores(
                        dadosColaboradores
                    );

                const listaUsuarios =
                    normalizarUsuarios(
                        dadosUsuarios
                    );

                const colaboradoresAtivos =
                    listaColaboradores.filter(
                        colaborador => {

                            const status =
                                String(
                                    colaborador?.status ?? ''
                                ).toLowerCase();

                            return (
                                status === 'ativo' ||
                                status === '1' ||
                                colaborador?.status === 1
                            );
                        }
                    );

                setColaboradores(
                    colaboradoresAtivos
                );

                setUsuarios(
                    listaUsuarios
                );

            } catch (erro) {

                console.error(
                    'Erro ao carregar dados para cadastro de férias:',
                    erro
                );

                setErroCarregamento(
                    erro.message ||
                    'Não foi possível carregar os colaboradores.'
                );

            } finally {

                setCarregandoColaboradores(false);

            }
        }

        carregarDados();

    }, []);

    useEffect(() => {

        if (
            !modoEdicao ||
            !ferias
        ) {
            return;
        }

        setIdFerias(
            ferias.id != null
                ? Number(ferias.id)
                : null
        );

        setDataInicio(
            String(
                ferias.data_inicio || ''
            ).substring(0, 10)
        );

        setDataFim(
            String(
                ferias.data_fim || ''
            ).substring(0, 10)
        );

        setObservacao(
            ferias.observacao || ''
        );

        setErros({});

    }, [
        modoEdicao,
        ferias
    ]);

    useEffect(() => {

        if (
            !modoEdicao ||
            !ferias ||
            colaboradores.length === 0
        ) {
            return;
        }

        const colaboradorFerias =
            Array.isArray(ferias.colaborador)
                ? ferias.colaborador[0]
                : ferias.colaborador;

        const idColaborador =
            ferias.id_colaborador ??
            colaboradorFerias?.id;

        if (
            idColaborador == null
        ) {
            return;
        }

        const colaboradorEncontrado =
            colaboradores.find(
                colaborador =>
                    Number(colaborador.id) ===
                    Number(idColaborador)
            );

        if (!colaboradorEncontrado) {
            return;
        }

        setColaboradorSelecionado(
            colaboradorEncontrado
        );

        setPesquisaColaborador(
            colaboradorEncontrado.nome || ''
        );

    }, [
        modoEdicao,
        ferias,
        colaboradores
    ]);

    useEffect(() => {

        function fecharDropdown(evento) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    evento.target
                )
            ) {
                setDropdownAberto(false);
            }
        }

        document.addEventListener(
            'mousedown',
            fecharDropdown
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                fecharDropdown
            );

        };

    }, []);



    const colaboradoresFiltrados =
        useMemo(() => {

            const pesquisa =
                pesquisaColaborador
                    .trim()
                    .toLowerCase();

            if (!pesquisa) {
                return colaboradores;
            }

            return colaboradores.filter(
                colaborador => {

                    const nome =
                        String(
                            colaborador?.nome || ''
                        ).toLowerCase();

                    const matricula =
                        String(
                            colaborador?.matricula || ''
                        ).toLowerCase();

                    return (
                        nome.includes(pesquisa) ||
                        matricula.includes(pesquisa)
                    );
                }
            );

        }, [
            colaboradores,
            pesquisaColaborador
        ]);

    const gestorSelecionado = useMemo(
        () =>
            buscarGestorColaborador(
                colaboradorSelecionado,
                usuarios
            ),
        [
            colaboradorSelecionado,
            usuarios
        ]
    );

    const quantidadeDias =
        useMemo(
            () =>
                calcularDiasFerias(
                    dataInicio,
                    dataFim
                ),
            [
                dataInicio,
                dataFim
            ]
        );

    const saldoDisponivel =
        Math.max(
            0,
            LIMITE_ANUAL_FERIAS -
            quantidadeDias
        );

    const dataMinima =
        useMemo(() => {

            if (
                modoEdicao &&
                dataInicio
            ) {
                return dataInicio;
            }

            const hoje = new Date();

            const ano =
                hoje.getFullYear();

            const mes =
                String(
                    hoje.getMonth() + 1
                ).padStart(2, '0');

            const dia =
                String(
                    hoje.getDate()
                ).padStart(2, '0');

            return `${ano}-${mes}-${dia}`;

        }, [
            modoEdicao,
            dataInicio
        ]);

    const nomeColaborador =
        colaboradorSelecionado?.nome || '';

    const matriculaColaborador =
        colaboradorSelecionado?.matricula ||
        'Não informado';

    const cargoColaborador =
        colaboradorSelecionado
            ? obterCargo(
                colaboradorSelecionado
            )
            : 'Não informado';

    const setorColaborador =
        colaboradorSelecionado
            ? obterSetor(
                colaboradorSelecionado
            )
            : 'Não informado';

    function selecionarColaborador(
        colaborador
    ) {

        setColaboradorSelecionado(
            colaborador
        );

        setPesquisaColaborador(
            colaborador?.nome || ''
        );

        setDropdownAberto(false);

        setErros(
            errosAtuais => ({
                ...errosAtuais,
                colaborador: ''
            })
        );

    }

    function alterarPesquisaColaborador(
        evento
    ) {

        const valor =
            evento.target.value;

        setPesquisaColaborador(
            valor
        );

        setDropdownAberto(true);

        if (
            colaboradorSelecionado &&
            valor !==
            colaboradorSelecionado.nome
        ) {

            setColaboradorSelecionado(
                null
            );

        }

        if (erros.colaborador) {

            setErros(
                errosAtuais => ({
                    ...errosAtuais,
                    colaborador: ''
                })
            );

        }

    }

    function alterarDataInicio(
        evento
    ) {

        setDataInicio(
            evento.target.value
        );

        setErros(
            errosAtuais => ({
                ...errosAtuais,
                dataInicio: '',
                dataFim: '',
                periodo: ''
            })
        );

    }

    function alterarDataFim(
        evento
    ) {

        setDataFim(
            evento.target.value
        );

        setErros(
            errosAtuais => ({
                ...errosAtuais,
                dataFim: '',
                periodo: ''
            })
        );

    }

    function alterarObservacao(
        evento
    ) {

        const valor =
            evento.target.value;

        if (
            valor.length <= 300
        ) {

            setObservacao(
                valor
            );

        }

    }

    function validarFormulario() {

        const resultado =
            validarFerias({
                colaborador:
                    colaboradorSelecionado,

                dataInicio,

                dataFim,

                quantidadeDias,

                saldoDisponivel,

                observacao,

                limiteAnual:
                    LIMITE_ANUAL_FERIAS
            });

        setErros(
            resultado.erros
        );

        return resultado.valido;
    }

    async function salvarFerias() {

        if (
            salvando ||
            !validarFormulario()
        ) {
            return;
        }

        if (
            modoEdicao &&
            idFerias == null
        ) {

            alert(
                'Não foi possível identificar as férias que serão editadas.'
            );

            return;
        }

        setSalvando(true);

        try {

            const dadosFerias = {

                id_colaborador:
                    Number(
                        colaboradorSelecionado.id
                    ),

                data_inicio:
                    dataInicio,

                data_fim:
                    dataFim,

                quantidade_dias:
                    Number(
                        quantidadeDias
                    ),

                observacao:
                    observacao.trim()

            };

            if (modoEdicao) {

                await editarFeriasApi(
                    idFerias,
                    dadosFerias
                );

                alert(
                    'Férias atualizadas com sucesso!'
                );

                await voltar();

                return;
            }

            await cadastrarFerias({

                ...dadosFerias,

                origem:
                    'RH',

                status_aprovacao:
                    'APROVADA',

                status:
                    'PENDENTE'

            });

            alert(
                'Férias cadastradas com sucesso!'
            );

            await voltar();

        } catch (erro) {

            console.error(
                modoEdicao
                    ? 'Erro ao editar férias:'
                    : 'Erro ao cadastrar férias:',
                erro
            );

            alert(
                erro.message ||
                (
                    modoEdicao
                        ? 'Não foi possível atualizar as férias.'
                        : 'Não foi possível cadastrar as férias.'
                )
            );

        } finally {

            setSalvando(false);

        }

    }

    return (

        <div className="cadastro-ferias">

            <div className="cabecalho-nova-ferias">

                <BotaoCadastro

                    titulo={
                        modoEdicao
                            ? 'Editar Férias'
                            : 'Nova Férias'
                    }

                    descricao={
                        modoEdicao
                            ? 'Atualize os dados e o período das férias do colaborador.'
                            : 'Informe o colaborador e o período para agendamento cadastral de férias.'
                    }

                >

                    <nav className="caminho-cadastro-ferias">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Férias
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-ferias">

                            {modoEdicao
                                ? 'Editar Férias'
                                : 'Nova Férias'
                            }

                        </span>

                    </nav>

                </BotaoCadastro>

            </div>

            <SelecaoColaborador
                colaboradorSelecionado={colaboradorSelecionado}
                pesquisaColaborador={pesquisaColaborador}
                dropdownAberto={dropdownAberto}
                dropdownRef={dropdownRef}
                erros={erros}
                carregandoColaboradores={carregandoColaboradores}
                erroCarregamento={erroCarregamento}
                colaboradoresFiltrados={colaboradoresFiltrados}
                nomeColaborador={nomeColaborador}
                matriculaColaborador={matriculaColaborador}
                cargoColaborador={cargoColaborador}
                setorColaborador={setorColaborador}
                gestorSelecionado={gestorSelecionado}
                alterarPesquisaColaborador={
                    alterarPesquisaColaborador
                }
                selecionarColaborador={
                    selecionarColaborador
                }
                setDropdownAberto={
                    setDropdownAberto
                }
                obterCargo={obterCargo}
            />

            <PeriodoFerias
                dataInicio={dataInicio}
                dataFim={dataFim}
                dataMinima={dataMinima}
                quantidadeDias={quantidadeDias}
                saldoDisponivel={saldoDisponivel}
                LIMITE_ANUAL_FERIAS={LIMITE_ANUAL_FERIAS}
                erros={erros}
                alterarDataInicio={alterarDataInicio}
                alterarDataFim={alterarDataFim}
            />

            <ObservacoesFerias
                observacao={observacao}
                alterarObservacao={alterarObservacao}
            />

            <div className="botoes-cadastro-ferias">

                <BotaoSalvarCancelar
                    onCancelar={
                        voltar
                    }
                    onSalvar={
                        salvarFerias
                    }
                    salvando={
                        salvando
                    }
                    textoBotao={
                        modoEdicao
                            ? 'Salvar alterações'
                            : 'Salvar férias'
                    }
                />

            </div>

        </div>

    );
}

export default CadastroFerias;