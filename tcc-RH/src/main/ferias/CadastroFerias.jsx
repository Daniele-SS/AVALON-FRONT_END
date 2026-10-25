import { useEffect, useMemo, useRef, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import {
    buscarColaboradoresFerias,
    buscarUsuariosGestores
} from './servicos/colaboradoresFerias.js';

import { cadastrarFerias } from './servicos/cadastroFerias.js';

import validarFerias from './funcoes/cadastroFerias/validarFerias.js';
import calcularDiasFerias from './funcoes/cadastroFerias/calcularDiasFerias.js';

import ampulhetaIcone from './img/ampulheta-icon.svg'
import calendarioInicioIcone from './img/calendarioInicio-icon.svg'
import calendarioFimIcone from './img/calendarioFim-icon.svg'
import colaborador from './img/colaborador-icon.svg'


import './css-ferias/cadastroFerias.css';

const LIMITE_ANUAL_FERIAS = 30;

function obterPrimeiroItem(valor) {
    return Array.isArray(valor)
        ? valor[0] ?? null
        : valor ?? null;
}

function obterSetor(colaborador) {
    const setor = obterPrimeiroItem(colaborador?.setor);
    return setor?.nome || 'Não informado';
}

function obterCargo(colaborador) {
    const cargo = colaborador?.cargo;

    const classificacao = Array.isArray(cargo?.classificacao)
        ? cargo.classificacao[0]
        : cargo?.classificacao;

    return classificacao?.nome || 'Não informado';
}

function obterNivelAcesso(usuario) {
    const nivel = usuario?.nivel_acesso;

    const lista = Array.isArray(nivel?.nivel_acesso)
        ? nivel.nivel_acesso
        : Array.isArray(nivel)
            ? nivel
            : [];

    return lista[0]?.nome || '';
}

function colaboradorDoUsuario(usuario) {
    return Array.isArray(usuario?.colaborador)
        ? usuario.colaborador[0] ?? null
        : usuario?.colaborador ?? null;
}

function normalizarColaboradores(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados?.response?.colaborador)) {
        return dados.response.colaborador;
    }

    if (Array.isArray(dados?.response?.colaboradores)) {
        return dados.response.colaboradores;
    }

    if (Array.isArray(dados?.colaborador)) {
        return dados.colaborador;
    }

    if (Array.isArray(dados?.colaboradores)) {
        return dados.colaboradores;
    }

    return [];
}

function normalizarUsuarios(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados?.response?.usuario)) {
        return dados.response.usuario;
    }

    if (Array.isArray(dados?.usuario)) {
        return dados.usuario;
    }

    return [];
}

function CadastroFerias({ voltar }) {
    const [colaboradores, setColaboradores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
    const [pesquisaColaborador, setPesquisaColaborador] = useState('');
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [observacao, setObservacao] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [carregandoColaboradores, setCarregandoColaboradores] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState('');
    const [erros, setErros] = useState({});

    const dropdownRef = useRef(null);

    useEffect(() => {
        async function carregarDados() {
            setCarregandoColaboradores(true);
            setErroCarregamento('');

            try {
                const [dadosColaboradores, dadosUsuarios] =
                    await Promise.all([
                        buscarColaboradoresFerias(),
                        buscarUsuariosGestores()
                    ]);

                const listaColaboradores =
                    normalizarColaboradores(dadosColaboradores);

                const listaUsuarios =
                    normalizarUsuarios(dadosUsuarios);

                const colaboradoresAtivos =
                    listaColaboradores.filter((colaborador) => {
                        const status = String(
                            colaborador?.status ?? ''
                        ).toLowerCase();

                        return (
                            status === 'ativo' ||
                            status === '1' ||
                            colaborador?.status === 1
                        );
                    });

                setColaboradores(colaboradoresAtivos);
                setUsuarios(listaUsuarios);
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
        function fecharDropdown(evento) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(evento.target)
            ) {
                setDropdownAberto(false);
            }
        }

        document.addEventListener('mousedown', fecharDropdown);

        return () => {
            document.removeEventListener('mousedown', fecharDropdown);
        };
    }, []);


    function obterIniciais(nome) {
        return String(nome || '')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte.charAt(0))
            .join('')
            .toUpperCase();
    }


    const colaboradoresFiltrados = useMemo(() => {
        const pesquisa = pesquisaColaborador.trim().toLowerCase();

        if (!pesquisa) {
            return colaboradores;
        }

        return colaboradores.filter((colaborador) => {
            const nome = String(colaborador?.nome || '').toLowerCase();
            const matricula = String(colaborador?.matricula || '').toLowerCase();

            return (
                nome.includes(pesquisa) ||
                matricula.includes(pesquisa)
            );
        });
    }, [colaboradores, pesquisaColaborador]);

    const gestorSelecionado = useMemo(() => {
        if (!colaboradorSelecionado) {
            return null;
        }

        const gestorExplicito =
            colaboradorSelecionado?.gestor ??
            colaboradorSelecionado?.gestor_imediato ??
            colaboradorSelecionado?.gestorImediato;

        if (gestorExplicito) {
            return gestorExplicito;
        }

        const setorColaborador = obterSetor(colaboradorSelecionado)
            .trim()
            .toLowerCase();

        if (
            !setorColaborador ||
            setorColaborador === 'não informado'
        ) {
            return null;
        }

        const gestoresDoMesmoSetor = usuarios
            .filter((usuario) => {
                const nivel = obterNivelAcesso(usuario)
                    .trim()
                    .toLowerCase();

                if (nivel !== 'gestor') {
                    return false;
                }

                const colaboradorGestor =
                    colaboradorDoUsuario(usuario);

                if (!colaboradorGestor) {
                    return false;
                }

                const status = String(
                    colaboradorGestor.status ?? ''
                ).toLowerCase();

                if (
                    status !== 'ativo' &&
                    status !== '1'
                ) {
                    return false;
                }

                const setorGestor = obterSetor(colaboradorGestor)
                    .trim()
                    .toLowerCase();

                return setorGestor === setorColaborador;
            })
            .map((usuario) => colaboradorDoUsuario(usuario))
            .filter(Boolean);

        return gestoresDoMesmoSetor.length === 1
            ? gestoresDoMesmoSetor[0]
            : null;
    }, [colaboradorSelecionado, usuarios]);

    const quantidadeDias = useMemo(
        () => calcularDiasFerias(dataInicio, dataFim),
        [dataInicio, dataFim]
    );

    const saldoDisponivel = Math.max(
        0,
        LIMITE_ANUAL_FERIAS - quantidadeDias
    );

    const dataMinima = useMemo(() => {
        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }, []);

    const nomeColaborador =
        colaboradorSelecionado?.nome || '';

    const matriculaColaborador =
        colaboradorSelecionado?.matricula || 'Não informado';

    const cargoColaborador =
        colaboradorSelecionado
            ? obterCargo(colaboradorSelecionado)
            : 'Não informado';

    const setorColaborador =
        colaboradorSelecionado
            ? obterSetor(colaboradorSelecionado)
            : 'Não informado';

    function selecionarColaborador(colaborador) {
        setColaboradorSelecionado(colaborador);
        setPesquisaColaborador(colaborador?.nome || '');
        setDropdownAberto(false);

        setErros((errosAtuais) => ({
            ...errosAtuais,
            colaborador: ''
        }));
    }

    function alterarPesquisaColaborador(evento) {
        const valor = evento.target.value;

        setPesquisaColaborador(valor);
        setDropdownAberto(true);

        if (
            colaboradorSelecionado &&
            valor !== colaboradorSelecionado.nome
        ) {
            setColaboradorSelecionado(null);
        }

        if (erros.colaborador) {
            setErros((errosAtuais) => ({
                ...errosAtuais,
                colaborador: ''
            }));
        }
    }

    function alterarDataInicio(evento) {
        setDataInicio(evento.target.value);

        setErros((errosAtuais) => ({
            ...errosAtuais,
            dataInicio: '',
            dataFim: '',
            periodo: ''
        }));
    }

    function alterarDataFim(evento) {
        setDataFim(evento.target.value);

        setErros((errosAtuais) => ({
            ...errosAtuais,
            dataFim: '',
            periodo: ''
        }));
    }

    function alterarObservacao(evento) {
        const valor = evento.target.value;

        if (valor.length <= 300) {
            setObservacao(valor);
        }
    }

    function validarFormulario() {
        const resultado = validarFerias({
            colaborador: colaboradorSelecionado,
            dataInicio,
            dataFim,
            quantidadeDias,
            saldoDisponivel,
            observacao,
            limiteAnual: LIMITE_ANUAL_FERIAS
        });

        setErros(resultado.erros);

        return resultado.valido;
    }

    async function salvarFerias() {
        if (salvando || !validarFormulario()) {
            return;
        }

        setSalvando(true);

        try {
            await cadastrarFerias({
                id_colaborador: Number(colaboradorSelecionado.id),
                data_inicio: dataInicio,
                data_fim: dataFim,
                quantidade_dias: Number(quantidadeDias),
                observacao: observacao.trim()
            });

            alert('Férias cadastradas com sucesso!');

            await voltar();
        } catch (erro) {
            console.error('Erro ao cadastrar férias:', erro);

            alert(
                erro.message ||
                'Não foi possível cadastrar as férias.'
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="cadastro-ferias">

            <div className="cabecalho-nova-ferias">
                <BotaoCadastro
                    titulo="Nova Férias"
                    descricao="Informe o colaborador e o período para agendamento cadastral de férias."
                >
                    <nav className="caminho-cadastro-ferias">
                        <button type="button" onClick={voltar}>
                            Férias
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-ferias">
                            Férias
                        </span>
                    </nav>
                </BotaoCadastro>
            </div>

            <section className="cartao-cadastro-ferias">

                <div className="cabecalho-card-ferias">
                    <h2>Seleção do Colaborador</h2>
                </div>

                <div className="campo-ferias">

                    <label htmlFor="pesquisa-colaborador-ferias">
                        Colaborador
                        <span className="obrigatorio">*</span>
                    </label>

                    <div
                        className="dropdown-colaborador-ferias"
                        ref={dropdownRef}
                    >
                        <div
                            className={`input-colaborador-ferias ${erros.colaborador
                                ? 'input-ferias-erro'
                                : ''
                                }`}
                        >
                            <img src={colaborador} alt="" />

                            <input
                                id="pesquisa-colaborador-ferias"
                                type="text"
                                value={pesquisaColaborador}
                                onChange={alterarPesquisaColaborador}
                                onFocus={() => setDropdownAberto(true)}
                                placeholder={
                                    carregandoColaboradores
                                        ? 'Carregando colaboradores...'
                                        : 'Digite o nome ou matrícula do colaborador'
                                }
                                autoComplete="off"
                                disabled={carregandoColaboradores}
                            />

                            {colaboradorSelecionado && (
                                <span className="status-ativo-ferias">
                                    ● Ativo no sistema
                                </span>
                            )}

                            <span className="seta-dropdown-ferias">
                                ▾
                            </span>
                        </div>

                        {dropdownAberto && !carregandoColaboradores && (
                            <div className="lista-dropdown-ferias">

                                {colaboradoresFiltrados.length === 0 ? (
                                    <div className="dropdown-vazio-ferias">
                                        Nenhum colaborador encontrado.
                                    </div>
                                ) : (
                                    colaboradoresFiltrados.map((colaborador) => (
                                        <button
                                            type="button"
                                            key={colaborador.id}
                                            className="opcao-colaborador-ferias"
                                            onClick={() =>
                                                selecionarColaborador(colaborador)
                                            }
                                        >
                                            <span className="icone-opcao-colaborador">
                                                {obterIniciais(colaborador.nome)}
                                            </span>

                                            <span className="dados-opcao-colaborador">
                                                <strong>
                                                    {colaborador.nome}
                                                </strong>

                                                <small>
                                                    {colaborador.matricula}
                                                </small>
                                            </span>
                                        </button>
                                    ))
                                )}

                            </div>
                        )}
                    </div>

                    {erros.colaborador && (
                        <small className="mensagem-erro-ferias">
                            {erros.colaborador}
                        </small>
                    )}

                    {erroCarregamento && (
                        <small className="mensagem-erro-ferias">
                            {erroCarregamento}
                        </small>
                    )}
                </div>

                <div className="informacoes-colaborador-ferias">

                    <div className="info-colaborador-ferias">
                        <span className="rotulo-info-ferias">
                            NOME COMPLETO
                        </span>

                        <strong>
                            {nomeColaborador || 'Não selecionado'}
                        </strong>

                        <small>
                            Matrícula: {matriculaColaborador}
                        </small>
                    </div>

                    <div className="info-colaborador-ferias">
                        <span className="rotulo-info-ferias">
                            CARGO ATUAL
                        </span>

                        <strong>
                            {cargoColaborador}
                        </strong>

                        <small>
                            Vínculo:{' '}
                            {colaboradorSelecionado?.tipo_vinculo ||
                                'Não informado'}
                        </small>
                    </div>

                    <div className="info-colaborador-ferias">
                        <span className="rotulo-info-ferias">
                            SETOR / SQUAD
                        </span>

                        <strong>
                            {setorColaborador}
                        </strong>

                        <small>
                            {colaboradorSelecionado
                                ? 'Setor do colaborador'
                                : 'Não informado'}
                        </small>
                    </div>

                    <div className="info-colaborador-ferias">
                        <span className="rotulo-info-ferias">
                            GESTOR IMEDIATO
                        </span>

                        <strong>
                            {gestorSelecionado?.nome ||
                                'Gestor não vinculado'}
                        </strong>

                        <small>
                            {gestorSelecionado
                                ? obterCargo(gestorSelecionado)
                                : 'Nenhum gestor vinculado'}
                        </small>
                    </div>

                </div>

                <div className="mensagem-vinculo-ferias">
                    <span>✓</span>
                    Dados vinculados automaticamente à ficha cadastral do
                    colaborador no NexusHR.
                </div>

            </section>

            <section className="cartao-cadastro-ferias">

                <div className="cabecalho-card-ferias">
                    <div>
                        <h2>Período de Férias</h2>

                        <p>
                            Definição do intervalo de gozo e duração
                        </p>
                    </div>
                </div>

                <div className="campos-periodo-ferias">

                    <div className="campo-ferias">

                        <label htmlFor="data-inicio-ferias">
                            Data de início
                            <span className="obrigatorio">*</span>
                        </label>

                        <div
                            className={`input-data-ferias ${erros.dataInicio
                                ? 'input-ferias-erro'
                                : ''
                                }`}
                        >
                            <img src={calendarioInicioIcone} alt="Calendario" />

                            <input
                                id="data-inicio-ferias"
                                type="date"
                                value={dataInicio}
                                min={dataMinima}
                                onChange={alterarDataInicio}
                                aria-invalid={Boolean(erros.dataInicio)}
                            />
                        </div>

                        {erros.dataInicio && (
                            <small className="mensagem-erro-ferias">
                                {erros.dataInicio}
                            </small>
                        )}

                    </div>

                    <div className="campo-ferias">

                        <label htmlFor="data-fim-ferias">
                            Data de término
                            <span className="obrigatorio">*</span>
                        </label>

                        <div
                            className={`input-data-ferias ${erros.dataFim
                                ? 'input-ferias-erro'
                                : ''
                                }`}
                        >
                            <img src={calendarioFimIcone} alt="Calendario" />


                            <input
                                id="data-fim-ferias"
                                type="date"
                                value={dataFim}
                                min={dataInicio || dataMinima}
                                onChange={alterarDataFim}
                                aria-invalid={Boolean(erros.dataFim)}
                            />
                        </div>

                        {erros.dataFim && (
                            <small className="mensagem-erro-ferias">
                                {erros.dataFim}
                            </small>
                        )}

                    </div>

                </div>

                {erros.periodo && (
                    <div className="erro-periodo-ferias">
                        {erros.periodo}
                    </div>
                )}

                <div
                    className={`resumo-ferias ${saldoDisponivel === 0
                        ? 'saldo-esgotado-ferias'
                        : ''
                        }`}
                >
                    <div className="icone-resumo-ferias">
                        <img src={ampulhetaIcone} alt="Ampulheta" />
                    </div>

                    <div className="texto-resumo-ferias">
                        <strong>
                            {quantidadeDias}
                            <span> dias de férias calculados</span>
                        </strong>

                        <small>
                            ✓ Saldo disponível:
                            <b> {saldoDisponivel} dias</b>
                        </small>
                    </div>

                    <div className="limite-anual-ferias">
                        <span>Férias anuais</span>

                        <strong>
                            {LIMITE_ANUAL_FERIAS} dias
                        </strong>

                        <small>
                            Utilizado: {quantidadeDias} dias
                        </small>
                    </div>
                </div>

            </section>

            <section className="cartao-cadastro-ferias">

                <div className="cabecalho-card-ferias observacao-cabecalho-ferias">
                    <div>
                        <h2>Observações Internas</h2>

                        <p>
                            Informações complementares e alinhamentos internos
                            (opcional)
                        </p>
                    </div>

                    <span className="icone-observacao-ferias">
                        ☰
                    </span>
                </div>

                <div className="campo-observacao-ferias">
                    <textarea
                        value={observacao}
                        onChange={alterarObservacao}
                        maxLength={300}
                        placeholder="Digite uma observação interna..."
                    />
                </div>

                <div className="rodape-observacao-ferias">
                    <span>
                        Visível apenas para RH, Gestão Direta e Auditoria
                    </span>

                    <strong>
                        {observacao.length} / 300
                    </strong>
                </div>

            </section>

            <div className="botoes-cadastro-ferias">
                <BotaoSalvarCancelar
                    onCancelar={voltar}
                    onSalvar={salvarFerias}
                    salvando={salvando}
                    textoBotao="Salvar férias"
                />
            </div>

        </div>
    );
}

export default CadastroFerias;