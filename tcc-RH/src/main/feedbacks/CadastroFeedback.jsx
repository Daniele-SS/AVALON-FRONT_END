
/********************************************************************************
 * Objetivo: Tela de cadastro de um novo Feedback.
 ********************************************************************************/

import { useEffect, useMemo, useRef, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import {
    buscarColaboradoresAtivos,
    cadastrarFeedback
} from './servicos/cadastroFeedbackApi';

import './css-feedbacks/cadastroFeedback.css';
import '../../componentes/cardNomePag/nomePag.css';

import PositivoIcone from './img/positivo-icon.svg';
import ReconhecimentoIcone from './img/reconhecimento-icon.svg';
import MelhoriaIcone from './img/melhoria-icon.svg';
import AcompanhamentoIcone from './img/acompanhamento-icon.svg';


//----------------- COMPONENTE PRINCIPAL ------------------//

function CadastroFeedback({ onVoltar, onSucesso }) {

    //----------------- ESTADOS ---------------------------//

    const [colaboradores, setColaboradores] = useState([]);

    const [formulario, setFormulario] = useState({
        id_colaborador_destinatario: '',
        tipo: '',
        data_feedback: new Date().toLocaleDateString('en-CA'),
        descricao: ''
    });

    const [pesquisaColaborador, setPesquisaColaborador] = useState('');
    const [dropdownAberto, setDropdownAberto] = useState(false);

    const dropdownRef = useRef(null);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');


    //----------------- TIPOS DE FEEDBACK -----------------//

    const tiposFeedback = [
        {
            id: 'POSITIVO',
            nome: 'Positivo',
            descricao: 'Feedback sobre um comportamento ou resultado positivo.',
            icone: <img src={PositivoIcone} alt="Ícone positivo" />
        },
        {
            id: 'MELHORIA',
            nome: 'Ponto de melhoria',
            descricao: 'Feedback relacionado a algo que pode ser aprimorado.',
            icone: <img src={MelhoriaIcone} alt="Ícone de melhoria" />
        },
        {
            id: 'RECONHECIMENTO',
            nome: 'Reconhecimento',
            descricao: 'Registro de reconhecimento pelo trabalho realizado.',
            icone: <img src={ReconhecimentoIcone} alt="Ícone de reconhecimento" />
        },
        {
            id: 'ACOMPANHAMENTO',
            nome: 'Acompanhamento',
            descricao: 'Registro de acompanhamento de uma situação ou evolução.',
            icone: <img src={AcompanhamentoIcone} alt="Ícone de acompanhamento" />
        }
    ];


    //----------------- BUSCAR COLABORADORES -------------//

    useEffect(() => {

        async function carregarColaboradores() {

            try {

                setCarregando(true);
                setErro('');

                const dados = await buscarColaboradoresAtivos();

                setColaboradores(dados);

            } catch (erro) {

                console.error(
                    'Erro ao buscar colaboradores:',
                    erro
                );

                setErro(
                    erro.message ||
                    'Não foi possível carregar os colaboradores.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarColaboradores();

    }, []);


    //----------------- FECHAR DROPDOWN AO CLICAR FORA ---//

    useEffect(() => {

        function fecharDropdown(evento) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(evento.target)
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


    //----------------- COLABORADOR SELECIONADO ----------//

    const colaboradorSelecionado = colaboradores.find(
        colaborador =>
            String(colaborador.id) ===
            String(formulario.id_colaborador_destinatario)
    );


    //----------------- NORMALIZAR TEXTO ------------------//

    function normalizarTexto(texto) {

        return String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

    }


    //----------------- FILTRAR COLABORADORES ------------//

    const colaboradoresFiltrados = useMemo(() => {

        const pesquisa = normalizarTexto(
            pesquisaColaborador
        );

        if (!pesquisa) {
            return colaboradores;
        }

        return colaboradores.filter(colaborador => {

            const nome = normalizarTexto(
                colaborador.nome
            );

            const matricula = normalizarTexto(
                colaborador.matricula
            );

            return (
                nome.includes(pesquisa) ||
                matricula.includes(pesquisa)
            );

        });

    }, [colaboradores, pesquisaColaborador]);


    //----------------- INICIAIS DO COLABORADOR ----------//

    function montarIniciais(nome) {

        if (!nome) {
            return 'CO';
        }

        const partesNome = nome.trim().split(' ');

        if (partesNome.length === 1) {

            return partesNome[0]
                .substring(0, 2)
                .toUpperCase();

        }

        return (
            partesNome[0][0] +
            partesNome[partesNome.length - 1][0]
        ).toUpperCase();

    }


    //----------------- PESQUISAR COLABORADOR ------------//

    function pesquisarColaborador(evento) {

        const valorPesquisa = evento.target.value;

        setPesquisaColaborador(valorPesquisa);
        setDropdownAberto(true);

        // Se alterar a pesquisa, remove a seleção anterior.
        if (
            colaboradorSelecionado &&
            valorPesquisa !== colaboradorSelecionado.nome
        ) {

            setFormulario(dadosAnteriores => ({
                ...dadosAnteriores,
                id_colaborador_destinatario: ''
            }));

        }

    }


    //----------------- SELECIONAR COLABORADOR -----------//

    function selecionarColaborador(colaborador) {

        setFormulario(dadosAnteriores => ({
            ...dadosAnteriores,
            id_colaborador_destinatario: String(
                colaborador.id
            )
        }));

        setPesquisaColaborador(colaborador.nome);
        setDropdownAberto(false);

    }


    //----------------- ATUALIZAR CAMPOS ------------------//

    function atualizarCampo(evento) {

        const { name, value } = evento.target;

        setFormulario(dadosAnteriores => ({
            ...dadosAnteriores,
            [name]: value
        }));

    }


    //----------------- SELECIONAR TIPO -------------------//

    function selecionarTipo(tipo) {

        setFormulario(dadosAnteriores => ({
            ...dadosAnteriores,
            tipo
        }));

    }


    //----------------- VALIDAR FORMULÁRIO ---------------//

    function validarFormulario() {

        if (!formulario.id_colaborador_destinatario) {

            return 'Selecione o colaborador que receberá o feedback.';

        }

        if (!formulario.tipo) {

            return 'Selecione o tipo do feedback.';

        }

        if (!formulario.data_feedback) {

            return 'Informe a data do feedback.';

        }

        if (!formulario.descricao.trim()) {

            return 'Escreva o conteúdo do feedback.';

        }

        if (formulario.descricao.trim().length > 800) {

            return 'A descrição deve possuir no máximo 800 caracteres.';

        }

        return '';

    }


    //----------------- SALVAR FEEDBACK -------------------//

    async function salvarFeedback(evento) {

        evento.preventDefault();

        const mensagemValidacao = validarFormulario();

        if (mensagemValidacao) {

            setErro(mensagemValidacao);
            setSucesso('');

            return;

        }

        try {

            setSalvando(true);

            setErro('');
            setSucesso('');


            //----------------- IDENTIFICAR USUÁRIO ---------//

            const usuarioSalvo = localStorage.getItem('usuario');

            if (!usuarioSalvo) {

                throw new Error(
                    'Não foi possível identificar o usuário autenticado. Faça login novamente.'
                );

            }

            const dadosUsuario = JSON.parse(usuarioSalvo);

            const usuario =
                dadosUsuario?.usuario ||
                dadosUsuario?.response?.usuario ||
                dadosUsuario;

            const idRemetente = Number(
                usuario.id_colaborador
            );

            if (!idRemetente || isNaN(idRemetente)) {

                throw new Error(
                    'O usuário autenticado não possui um colaborador vinculado.'
                );

            }


            //----------------- PREPARAR FEEDBACK -----------//

            const dadosFeedback = {

                id_colaborador_remetente: idRemetente,

                id_colaborador_destinatario: Number(
                    formulario.id_colaborador_destinatario
                ),

                tipo: formulario.tipo,

                descricao: formulario.descricao.trim(),

                data_feedback: formulario.data_feedback,

                ativo: 1

            };


            //----------------- CADASTRAR FEEDBACK ---------//

            await cadastrarFeedback(dadosFeedback);


            //----------------- FINALIZAÇÃO ----------------//

            setSucesso(
                'Feedback cadastrado com sucesso!'
            );

            // Chama o componente pai para atualizar a lista
            // e exibir a notificação de sucesso.
            if (onSucesso) {

                await onSucesso();

            } else if (onVoltar) {

                // Compatibilidade caso o componente seja
                // utilizado sem a propriedade onSucesso.
                onVoltar();

            }

        } catch (erro) {

            console.error(
                'Erro ao cadastrar feedback:',
                erro
            );

            setErro(
                erro.message ||
                'Não foi possível cadastrar o feedback.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- RETORNAR TELA ---------------------//

    return (

        <div className="pagina-cadastro-feedback">

            {/* CABEÇALHO DA PÁGINA */}

            <div className="cabecalho-novo-feedback">

                <BotaoCadastro
                    titulo="Novo Feedback"
                    descricao="Registre, acompanhe e consulte feedbacks entre gestores e colaboradores com foco em desenvolvimento contínuo e alinhamento de expectativas."
                >

                    <nav className="caminho-cadastro-feedback">

                        <button
                            type="button"
                            onClick={onVoltar}
                            disabled={salvando}
                        >
                            Feedbacks
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-feedback">
                            Novo Feedback
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* FORMULÁRIO */}

            <form
                className="formulario-feedback"
                onSubmit={salvarFeedback}
            >

                {/*----------------- ETAPA 1 -----------------*/}

                <section className="etapa-feedback">

                    <div className="cabecalho-etapa-feedback">

                        <div>

                            <span className="numero-etapa-feedback">
                                ETAPA 1
                            </span>

                            <h2>Colaborador & Contexto</h2>

                        </div>

                        <span className="etiqueta-etapa-feedback etiqueta-ativa-feedback">

                            <span className="ponto-etiqueta-feedback"></span>

                            Vinculação Ativa

                        </span>

                    </div>


                    <div className="campo-feedback">

                        <div className="linha-label-feedback">

                            <label htmlFor="destinatario-feedback">
                                Selecionar Colaborador *
                            </label>

                            <small>
                                {colaboradores.length.toLocaleString('pt-BR')} colaboradores
                            </small>

                        </div>


                        {/* SELEÇÃO PERSONALIZADA DO COLABORADOR */}

                        <div
                            className="dropdown-colaborador-feedback"
                            ref={dropdownRef}
                        >

                            <div className="input-colaborador-feedback">

                                <span className="icone-select-feedback">
                                    ♙
                                </span>

                                <input
                                    type="text"
                                    id="destinatario-feedback"
                                    value={pesquisaColaborador}
                                    onChange={pesquisarColaborador}
                                    onFocus={() => setDropdownAberto(true)}
                                    placeholder={
                                        carregando
                                            ? 'Carregando colaboradores...'
                                            : 'Digite o nome ou matrícula...'
                                    }
                                    autoComplete="off"
                                    disabled={carregando || salvando}
                                    aria-expanded={dropdownAberto}
                                    aria-haspopup="listbox"
                                    required={!formulario.id_colaborador_destinatario}
                                />

                                <span
                                    className={`seta-dropdown-feedback ${
                                        dropdownAberto ? 'aberto' : ''
                                    }`}
                                >
                                    ⌄
                                </span>

                            </div>


                            {/* LISTA DE RESULTADOS */}

                            {dropdownAberto && !carregando && !salvando && (

                                <div
                                    className="lista-dropdown-feedback"
                                    role="listbox"
                                >

                                    {colaboradoresFiltrados.length > 0 ? (

                                        colaboradoresFiltrados.map(colaborador => (

                                            <button
                                                key={colaborador.id}
                                                type="button"
                                                className="opcao-colaborador-feedback"
                                                role="option"
                                                aria-selected={
                                                    String(colaborador.id) ===
                                                    String(formulario.id_colaborador_destinatario)
                                                }
                                                onClick={() => selecionarColaborador(colaborador)}
                                            >

                                                <div className="icone-opcao-colaborador-feedback">
                                                    {montarIniciais(colaborador.nome)}
                                                </div>

                                                <div className="dados-opcao-colaborador-feedback">

                                                    <strong>
                                                        {colaborador.nome}
                                                    </strong>

                                                    <span>
                                                        Matrícula: {colaborador.matricula || 'Não informada'}
                                                    </span>

                                                </div>

                                            </button>

                                        ))

                                    ) : (

                                        <div className="dropdown-vazio-feedback">
                                            Nenhum colaborador encontrado.
                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* CARTÃO DO COLABORADOR SELECIONADO */}

                    {colaboradorSelecionado && (

                        <div className="cartao-colaborador-feedback">

                            <div className="informacoes-colaborador-feedback">

                                <div className="avatar-colaborador-feedback">
                                    {montarIniciais(colaboradorSelecionado.nome)}
                                </div>

                                <div className="dados-colaborador-feedback">

                                    <h3>
                                        {colaboradorSelecionado.nome}
                                    </h3>

                                    <p>
                                        Colaborador selecionado
                                    </p>

                                </div>

                                <span className="status-colaborador-feedback">

                                    <span></span>

                                    Ativo

                                </span>

                            </div>

                            <div className="aviso-vinculo-feedback">

                                <span>●</span>

                                Colaborador selecionado para receber o feedback

                            </div>

                        </div>

                    )}


                    {!carregando && colaboradores.length === 0 && !erro && (

                        <small className="aviso-sem-colaborador-feedback">
                            Não existem outros colaboradores ativos disponíveis.
                        </small>

                    )}

                </section>


                {/*----------------- ETAPA 2 -----------------*/}

                <section className="etapa-feedback">

                    <div className="cabecalho-etapa-feedback">

                        <div>

                            <span className="numero-etapa-feedback">
                                ETAPA 2
                            </span>

                            <h2>Classificação & Tipo de Feedback</h2>

                        </div>

                        <span className="descricao-etapa-feedback">
                            Defina a finalidade do feedback
                        </span>

                    </div>


                    <div className="campo-feedback">

                        <label>
                            Tipo de Feedback *
                        </label>

                        <div className="opcoes-tipo-feedback">

                            {tiposFeedback.map(tipo => (

                                <button
                                    key={tipo.id}
                                    type="button"
                                    className={`cartao-tipo-feedback ${
                                        formulario.tipo === tipo.id
                                            ? 'cartao-tipo-selecionado-feedback'
                                            : ''
                                    }`}
                                    onClick={() => selecionarTipo(tipo.id)}
                                    disabled={salvando}
                                >

                                    <div className="titulo-cartao-tipo-feedback">

                                        <span className="icone-tipo-feedback">
                                            {tipo.icone}
                                        </span>

                                        <strong>
                                            {tipo.nome}
                                        </strong>

                                        <span className="seletor-tipo-feedback">

                                            {formulario.tipo === tipo.id
                                                ? '✓'
                                                : ''}

                                        </span>

                                    </div>

                                    <p>
                                        {tipo.descricao}
                                    </p>

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* DATA */}

                    <div className="campo-data-feedback">

                        <label htmlFor="data-feedback">
                            Data do feedback *
                        </label>

                        <input
                            type="date"
                            id="data-feedback"
                            name="data_feedback"
                            value={formulario.data_feedback}
                            onChange={atualizarCampo}
                            disabled={salvando}
                            required
                        />

                    </div>

                </section>


                {/*----------------- ETAPA 3 -----------------*/}

                <section className="etapa-feedback">

                    <div className="cabecalho-etapa-feedback">

                        <div>

                            <span className="numero-etapa-feedback">
                                ETAPA 3
                            </span>

                            <h2>Conteúdo do Feedback</h2>

                        </div>

                        <span className="descricao-etapa-feedback">
                            Diretrizes de clareza ativa
                        </span>

                    </div>


                    {/* CONTEÚDO */}

                    <div className="campo-feedback">

                        <div className="linha-label-feedback">

                            <label htmlFor="descricao-feedback">
                                Conteúdo do feedback *
                            </label>

                            <small className="contador-feedback">
                                {formulario.descricao.length}/800 caracteres
                            </small>

                        </div>

                        <textarea
                            id="descricao-feedback"
                            name="descricao"
                            value={formulario.descricao}
                            onChange={atualizarCampo}
                            placeholder="Descreva o feedback com clareza, utilizando exemplos objetivos..."
                            rows="6"
                            maxLength="800"
                            disabled={salvando}
                            required
                        />

                        <small className="dica-descricao-feedback">

                            ⓘ Dica: Contextualize a situação com fatos objetivos,
                            comportamentos observados e o impacto gerado.

                        </small>

                    </div>

                </section>


                {/*----------------- MENSAGENS -----------------*/}

                {erro && (

                    <div className="mensagem-formulario-feedback erro-feedback">
                        {erro}
                    </div>

                )}

                {sucesso && (

                    <div className="mensagem-formulario-feedback sucesso-feedback">
                        {sucesso}
                    </div>

                )}


                {/*----------------- RODAPÉ -----------------*/}

                <BotaoSalvarCancelar
                    onCancelar={onVoltar}
                    onSalvar={salvarFeedback}
                    salvando={salvando}
                    textoBotao="Salvar Feedback"
                />

            </form>

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default CadastroFeedback;
