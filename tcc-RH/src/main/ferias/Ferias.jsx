//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import ModalAnalisarSolicitacao from './componentes/solicitacao/ModalAnalisarSolicitacao.jsx';

import CadastroFerias from './CadastroFerias.jsx';
import EditarFerias from './EditaFerias.jsx';

import CardSolicitacao from './componentes/solicitacao/cardSolicitacao.jsx';
import ModalSolicitacoes from './componentes/solicitacao/ModalSolicitacoes.jsx';

import '../../componentes/cardNomePag/nomePag.css';
import './css-ferias/ferias.css';

import buscarDadosFerias from './servicos/ferias.js';

import { calcularIndicadoresFerias } from './funcoes/ferias/calcularIndicadoresFerias.js';
import montarInformacoesFerias from './funcoes/ferias/montarInformacoesFerias.js';
import filtrarFerias from './funcoes/ferias/filtrarFerias.js';
import criarColunasFerias from './funcoes/ferias/colunaFerias.jsx';

import CalendarioIcone from './img/calendario-icon.svg';
import CaixaIcone from './img/caixa-icon.svg';
import ConfereIcone from './img/confere-icon.svg';
import GuardaSolIcone from './img/guardaSol-icon.svg';


//----------------- COMPONENTE -------------------------------//

function Ferias() {

    //----------------- ESTADOS ------------------------------//

    const [ferias, setFerias] = useState([]);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [tela, setTela] = useState('lista');

    const [feriasSelecionadas, setFeriasSelecionadas] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');

    // Controla a abertura do modal com todas as solicitações.
    const [modalSolicitacoesAberto, setModalSolicitacoesAberto] =
        useState(false);

    // Controla a abertura do modal para analisar uma solicitação.
    const [modalAnaliseAberto, setModalAnaliseAberto] =
        useState(false);


    //----------------- CARREGAR DADOS ------------------------//

    async function carregarDados() {

        setCarregando(true);
        setErro('');

        try {

            const dados = await buscarDadosFerias();

            setFerias(dados.ferias || []);

        } catch (erro) {

            console.error('Erro ao carregar férias:', erro);

            setErro(
                erro.message ||
                'Não foi possível carregar as férias.'
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- CARREGAR AO ABRIR ---------------------//

    useEffect(() => {

        carregarDados();

    }, []);


    //----------------- NAVEGAÇÃO ------------------------------//

    function abrirCadastro() {

        setTela('cadastro');

    }


    function abrirEdicao(feriasItem) {

        setFeriasSelecionadas(feriasItem);

        setTela('edicao');

    }


    function voltarParaLista() {

        setTela('lista');

        setFeriasSelecionadas(null);

        carregarDados();

    }


    //----------------- ATUALIZAR FILTROS ----------------------//

    function atualizarFiltros(novosFiltros) {

        setFiltros(novosFiltros);

    }


    //----------------- PREPARAR DADOS -------------------------//

    const feriasComInformacoes =
        montarInformacoesFerias(ferias);


    //----------------- FILTRAR DADOS --------------------------//

    const feriasParaLista = feriasComInformacoes.filter(feriasItem => {

        const origem =
            String(feriasItem.origem || '')
                .trim()
                .toUpperCase();

        const statusAprovacao =
            String(feriasItem.status_aprovacao || '')
                .trim()
                .toUpperCase();

        // Solicitações pendentes do gestor não aparecem
        // diretamente na tabela principal de férias.
        if (
            origem === 'GESTOR' &&
            statusAprovacao === 'PENDENTE'
        ) {

            return false;

        }

        return true;

    });

    const feriasFiltradas = filtrarFerias(
        feriasParaLista,
        filtros
    );


    //----------------- COLUNAS DA TABELA ----------------------//

    const colunas = criarColunasFerias(
        abrirEdicao
    );


    //----------------- INDICADORES ----------------------------//

    const {
        programado,
        emFeriasHoje,
        proximos30Dias,
        finalizadasNoAno
    } = calcularIndicadoresFerias(
        feriasComInformacoes
    );


    //----------------- SOLICITAÇÕES ---------------------------//
    //
    // Exibe somente solicitações que atendam às condições:
    //
    // origem = GESTOR
    // status_aprovacao = PENDENTE
    //
    // Férias cadastradas diretamente pelo RH não aparecem
    // nessa lista de solicitações pendentes.
    //

    const solicitacoes = feriasComInformacoes
        .filter(feriasItem => {

            const origem =
                String(feriasItem.origem || '')
                    .trim()
                    .toUpperCase();

            const statusAprovacao =
                String(feriasItem.status_aprovacao || '')
                    .trim()
                    .toUpperCase();

            return (
                origem === 'GESTOR' &&
                statusAprovacao === 'PENDENTE'
            );

        })
        .map(feriasItem => {

            const colaborador =
                Array.isArray(feriasItem.colaborador)
                    ? feriasItem.colaborador[0] || {}
                    : feriasItem.colaborador || {};

            return {

                id: feriasItem.id,

                nome:
                    feriasItem.nome_colaborador,

                codigo:
                    colaborador.matricula ||
                    colaborador.id ||
                    '---',

                foto: null,

                setor:
                    feriasItem.nome_setor,

                gestor:
                    feriasItem.nome_gestor ||
                    'Não informado',

                gestorCargo:
                    feriasItem.gestor_cargo ||
                    'Gestor',

                periodo:
                    `${feriasItem.data_inicio_formatada} – ${feriasItem.data_fim_formatada}`,

                duracao:
                    feriasItem.quantidade_dias,

                dataAbertura:
                    feriasItem.data_solicitacao ||
                    feriasItem.created_at ||
                    null,

                status:
                    'Pendente'

            };

        });


    //----------------- ANALISAR SOLICITAÇÃO ------------------//

    function analisarSolicitacao(solicitacao) {

        // Localiza o registro original das férias.
        const feriasOriginal = feriasComInformacoes.find(
            item => String(item.id) === String(solicitacao.id)
        );

        if (!feriasOriginal) {

            console.error(
                'Férias da solicitação não encontradas.'
            );

            setErro(
                'Não foi possível localizar essa solicitação.'
            );

            return;

        }

        // Guarda os dados originais da solicitação.
        setFeriasSelecionadas(feriasOriginal);

        // Fecha a lista de todas as solicitações.
        setModalSolicitacoesAberto(false);

        // Abre o modal específico de análise.
        setModalAnaliseAberto(true);

    }


    //----------------- VER TODAS SOLICITAÇÕES ----------------//

    function verTodasSolicitacoes() {

        setModalSolicitacoesAberto(true);

    }


    //----------------- FECHAR MODAL DE SOLICITAÇÕES ----------//

    function fecharModalSolicitacoes() {

        setModalSolicitacoesAberto(false);

    }


    //----------------- FECHAR MODAL DE ANÁLISE ---------------//

    function fecharModalAnalise() {

        setModalAnaliseAberto(false);

        setFeriasSelecionadas(null);

    }


    //----------------- CONCLUIR ANÁLISE ----------------------//

    async function concluirAnalise() {

        // Atualiza os dados depois da análise.
        await carregarDados();

        // Fecha o modal e limpa a solicitação selecionada.
        setModalAnaliseAberto(false);

        setFeriasSelecionadas(null);

    }


    //----------------- TELA DE CADASTRO -----------------------//

    if (tela === 'cadastro') {

        return (

            <CadastroFerias
                voltar={voltarParaLista}
            />

        );

    }


    //----------------- TELA DE EDIÇÃO -------------------------//

    if (tela === 'edicao') {

        return (

            <EditarFerias
                ferias={feriasSelecionadas}
                voltar={voltarParaLista}
            />

        );

    }


    //----------------- TELA PRINCIPAL -------------------------//

    return (

        <div className="pagina-ferias">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <BotaoCadastro
                titulo="Férias"
                descricao="Consulte e gerencie os períodos de férias dos colaboradores."
                textoBotao="Nova Férias"
                onClick={abrirCadastro}
            />


            {/* =================================================
                MINICARDS
            ================================================= */}

            <div className="minicard-ferias">


                {/* FÉRIAS PROGRAMADAS */}

                <Minicards
                    icone={CalendarioIcone}
                    numero={programado}
                    informacao="FÉRIAS PROGRAMADAS"
                    corFundo="#DBE1FF"
                    layout="vertical"
                />


                {/* EM FÉRIAS HOJE */}

                <Minicards
                    icone={GuardaSolIcone}
                    numero={emFeriasHoje}
                    informacao="EM FÉRIAS HOJE"
                    corFundo="#6FFBBE"
                    layout="vertical"
                />


                {/* PRÓXIMOS 30 DIAS */}

                <div className="minicard-proximos-30">

                    <Minicards
                        icone={CaixaIcone}
                        numero={proximos30Dias}
                        informacao="FÉRIAS NOS PRÓXIMOS 30 DIAS"
                        corFundo="#E2E7FF"
                        layout="vertical"
                    />

                </div>


                {/* FINALIZADAS NO ANO */}

                <Minicards
                    icone={ConfereIcone}
                    numero={finalizadasNoAno}
                    informacao="FINALIZADAS NO ANO"
                    corFundo="#EAEDFF"
                    layout="vertical"
                />

            </div>


            {/* =================================================
                CARD DE SOLICITAÇÕES
            ================================================= */}

            <CardSolicitacao
                solicitacoes={solicitacoes}
                onAnalisar={analisarSolicitacao}
                onVerTodas={verTodasSolicitacoes}
            />


            {/* =================================================
                MODAL DE TODAS AS SOLICITAÇÕES PENDENTES
            ================================================= */}

            {modalSolicitacoesAberto && (

                <ModalSolicitacoes
                    solicitacoes={solicitacoes}
                    onFechar={fecharModalSolicitacoes}
                    onAnalisar={analisarSolicitacao}
                />

            )}


            {/* =================================================
                MODAL DE ANÁLISE DA SOLICITAÇÃO
            ================================================= */}

            {modalAnaliseAberto && feriasSelecionadas && (

                <ModalAnalisarSolicitacao
                    ferias={feriasSelecionadas}
                    onFechar={fecharModalAnalise}
                    onConcluida={concluirAnalise}
                />

            )}


            {/* =================================================
                FILTROS
            ================================================= */}

            <Filtro
                titulo="Pesquisar Férias"
                placeholder="Buscar por nome, matrícula ou setor"
                nomeDropdown="Status"
                mostrarStatus={false}
                opcoesDropdown={[

                    {
                        id: 'Pendente',
                        nome: 'Pendente'
                    },

                    {
                        id: 'Férias',
                        nome: 'Férias'
                    },

                    {
                        id: 'Férias Finalizadas',
                        nome: 'Férias Finalizadas'
                    }

                ]}
                onFiltrosChange={atualizarFiltros}
            />


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (

                <p className="mensagem-erro-ferias">

                    {erro}

                </p>

            )}


            {/* =================================================
                TABELA
            ================================================= */}

            {carregando ? (

                <p>
                    Carregando férias...
                </p>

            ) : (

                <Tabela
                    titulo="Lista de Férias"
                    dados={feriasFiltradas}
                    colunas={colunas}
                />

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Ferias;