
/----------------- IMPORTAÇÕES -----------------------------/

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import AlertaNotificacao from '../../componentes/alerta/Alerta.jsx';

import CardPesquisa from './componentes/CardPesquisa.jsx';
import CadastroPesquisa from './CadastroPesquisa.jsx';
import AcompanhamentoPesquisa from './AcompanhamentoPesquisa.jsx';

import {
    buscarDadosPesquisas
} from './servicos/pesquisasApi.js';

// APIs utilizadas no acompanhamento
import {
    listarPerguntas,
    listarRespostas,
    listarPesquisaResultados
} from './servicos/acompanhamentoPesquisaApi.js';

import montarInformacoesPesquisas from './funcoes/pesquisa/montarInformacoesPesquisas.js';

import filtrarPesquisas from './funcoes/pesquisa/filtrarPesquisas.js';

import './css-pesquisas/pesquisas.css';

import ConcluidoIcon from './img/concluido-icon.svg';
import PedenteIcon from './img/Pedente-icon.svg';
import CadastroIcon from './img/cadastro-icon.svg';


//----------------- TELA PESQUISAS -------------------------//

function Pesquisas() {


    //----------------- ESTADOS -----------------------------//

    const [pesquisas, setPesquisas] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);
    const [pesquisaSetores, setPesquisaSetores] = useState([]);
    const [pesquisaCargos, setPesquisaCargos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);

    // Dados utilizados no acompanhamento
    const [perguntas, setPerguntas] = useState([]);
    const [respostas, setRespostas] = useState([]);
    const [pesquisaResultados, setPesquisaResultados] = useState([]);

    // Carregamento e erro da listagem
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Carregamento e erro dos resultados
    const [carregandoAcompanhamento, setCarregandoAcompanhamento] = useState(false);
    const [erroAcompanhamento, setErroAcompanhamento] = useState('');

    const [alertaNotificacao, setAlertaNotificacao] = useState(null);

    // Controla se a tela de cadastro está aberta.
    const [telaCadastro, setTelaCadastro] = useState(false);

    // Controla a tela atual da funcionalidade.
    const [telaAtual, setTelaAtual] = useState('lista');

    // Guarda a pesquisa selecionada para acompanhamento.
    const [pesquisaSelecionada, setPesquisaSelecionada] = useState(null);

    // Atualiza os dados da listagem após cadastrar.
    const [atualizarLista, setAtualizarLista] = useState(0);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- CARREGAR DADOS DA LISTAGEM -----------//

    useEffect(() => {

        async function carregarDados() {

            try {

                setCarregando(true);
                setErro('');

                const dados = await buscarDadosPesquisas();

                setPesquisas(dados.pesquisas || []);
                setParticipacoes(dados.participacoes || []);
                setPesquisaSetores(dados.pesquisaSetores || []);
                setPesquisaCargos(dados.pesquisaCargos || []);
                setColaboradores(dados.colaboradores || []);

            } catch (error) {

                console.error('Erro ao carregar pesquisas:', error);

                setErro(error.message || 'Erro ao carregar pesquisas.');

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, [atualizarLista]);


    //----------------- CARREGAR DADOS DO ACOMPANHAMENTO ----//

    useEffect(() => {

        // Só busca os dados quando uma pesquisa estiver selecionada
        // e a tela de acompanhamento estiver aberta.
        if (
            telaAtual !== 'acompanhamento' ||
            !pesquisaSelecionada
        ) {
            return;
        }

        async function carregarDadosAcompanhamento() {

            try {

                setCarregandoAcompanhamento(true);
                setErroAcompanhamento('');

                // Busca perguntas, respostas e resultados consolidados.
                const [
                    perguntasApi,
                    respostasApi,
                    resultadosApi
                ] = await Promise.all([
                    listarPerguntas(),
                    listarRespostas(),
                    listarPesquisaResultados()
                ]);

                // Guarda os dados recebidos das APIs.
                setPerguntas(perguntasApi || []);
                setRespostas(respostasApi || []);
                setPesquisaResultados(resultadosApi || []);

            } catch (error) {

                console.error(
                    'Erro ao carregar dados do acompanhamento:',
                    error
                );

                setErroAcompanhamento(
                    error.message ||
                    'Erro ao carregar os resultados da pesquisa.'
                );

            } finally {

                setCarregandoAcompanhamento(false);

            }

        }

        carregarDadosAcompanhamento();

    }, [telaAtual, pesquisaSelecionada]);


    //----------------- NOVA PESQUISA -----------------------//

    function novaPesquisa() {

        setErro('');
        setTelaCadastro(true);

    }


    //----------------- VOLTAR PARA LISTAGEM ---------------//

    function voltarParaListagem() {

        setTelaCadastro(false);
        setTelaAtual('lista');
        setPesquisaSelecionada(null);

        // Limpa os dados do acompanhamento anterior.
        setPerguntas([]);
        setRespostas([]);
        setPesquisaResultados([]);
        setErroAcompanhamento('');

    }


    //----------------- ABRIR ACOMPANHAMENTO ----------------//

    function abrirAcompanhamento(pesquisa) {

        // Limpa os dados anteriores antes de abrir outra pesquisa.
        setPerguntas([]);
        setRespostas([]);
        setPesquisaResultados([]);
        setErroAcompanhamento('');

        setPesquisaSelecionada(pesquisa);
        setTelaAtual('acompanhamento');

    }


    //----------------- PESQUISA CADASTRADA ----------------//

    function pesquisaCadastrada() {

        setTelaCadastro(false);
        setTelaAtual('lista');

        setAlertaNotificacao({
            tipo: 'sucesso',
            mensagem: 'Pesquisa cadastrada com sucesso!'
        });

        // Recarrega pesquisas, participações, vínculos e colaboradores.
        setAtualizarLista(valor => valor + 1);

    }


    //----------------- RECEBER FILTROS --------------------//

    function receberFiltros(novosFiltros) {

        setFiltros(prevFiltros => ({
            ...prevFiltros,
            ...novosFiltros
        }));

    }


    //----------------- MONTAR INFORMAÇÕES -----------------//

    const informacoes = montarInformacoesPesquisas(
        pesquisas,
        participacoes
    );

    const pesquisasFiltradas = filtrarPesquisas(
        pesquisas,
        filtros
    );


    //----------------- TELA DE CADASTRO -------------------//

    if (telaCadastro) {

        return (

            <CadastroPesquisa
                voltar={voltarParaListagem}
                aoCadastrar={pesquisaCadastrada}
            />

        );

    }


    //----------------- TELA DE ACOMPANHAMENTO --------------//

    if (telaAtual === 'acompanhamento' && pesquisaSelecionada) {

        return (

            <AcompanhamentoPesquisa
                pesquisa={pesquisaSelecionada}
                participacoes={participacoes}
                pesquisaSetores={pesquisaSetores}
                pesquisaCargos={pesquisaCargos}
                colaboradores={colaboradores}

                // Dados buscados pelas APIs de acompanhamento
                perguntas={perguntas}
                respostas={respostas}
                pesquisaResultados={pesquisaResultados}

                // Estados de carregamento e erro
                carregando={carregandoAcompanhamento}
                erro={erroAcompanhamento}

                onVoltar={voltarParaListagem}
            />

        );

    }


    //----------------- RENDERIZAR LISTAGEM ----------------//

    return (

        <div className="pagina-pesquisas">

            {/* CABEÇALHO */}

            <BotaoCadastro
                titulo="Pesquisas"
                descricao="Crie pesquisas, acompanhe a participação e analise a percepção dos colaboradores com garantia de sigilo estatístico."
                textoBotao="Nova Pesquisa"
                onClick={novaPesquisa}
            />


            {/* MINICARDS */}

            <div className="container-minicards-pesquisas">

                <Minicards
                    icone={CadastroIcon}
                    numero={informacoes.totalPesquisas}
                    informacao="Pesquisas cadastradas"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={ConcluidoIcon}
                    numero={informacoes.participacoesConcluidas}
                    informacao="Participações concluídas"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={PedenteIcon}
                    numero={informacoes.participacoesPendentes}
                    informacao="Participações pendentes"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

            </div>


            {/* FILTROS */}

            <div className="filtros-pesquisas">

                <Filtro
                    titulo="Pesquisar"
                    placeholder="Buscar pesquisa..."
                    nomeDropdown="Situação"
                    opcoesDropdown={[
                        { id: 'Todos', nome: 'Todos' },
                        { id: 'Agendada', nome: 'Agendada' },
                        { id: 'Em andamento', nome: 'Em andamento' },
                        { id: 'Encerrada', nome: 'Encerrada' }
                    ]}
                    onFiltrosChange={receberFiltros}
                />

            </div>


            {/* LISTA DE PESQUISAS */}

            <section className="secao-pesquisas">

                <div className="cabecalho-secao-pesquisas">

                    <h2>Pesquisas</h2>

                    <span>
                        {pesquisasFiltradas.length} pesquisa(s)
                    </span>

                </div>


                {carregando && (

                    <p className="mensagem-pesquisas">
                        Carregando pesquisas...
                    </p>

                )}


                {!carregando && erro && (

                    <div className="mensagem-erro-pesquisas">

                        <p>{erro}</p>

                    </div>

                )}


                {!carregando && !erro && pesquisasFiltradas.length === 0 && (

                    <p className="mensagem-pesquisas">
                        Nenhuma pesquisa encontrada.
                    </p>

                )}


                {!carregando && !erro && pesquisasFiltradas.length > 0 && (

                    <div className="grade-pesquisas">

                        {pesquisasFiltradas.map(pesquisa => (

                            <CardPesquisa
                                key={pesquisa.id}
                                pesquisa={pesquisa}
                                participacoes={participacoes}
                                pesquisaSetores={pesquisaSetores}
                                pesquisaCargos={pesquisaCargos}
                                colaboradores={colaboradores}
                                onVerAcompanhamento={() =>
                                    abrirAcompanhamento(pesquisa)
                                }
                            />

                        ))}

                    </div>

                )}

            </section>


            {/* NOTIFICAÇÃO */}

            {alertaNotificacao && (

                <AlertaNotificacao
                    tipo={alertaNotificacao.tipo}
                    mensagem={alertaNotificacao.mensagem}
                    onFechar={() => setAlertaNotificacao(null)}
                />

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Pesquisas;
