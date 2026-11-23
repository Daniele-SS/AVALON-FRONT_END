
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import AlertaNotificacao from '../../componentes/alerta/Alerta.jsx';

import CardPesquisa from './componentes/CardPesquisa.jsx';
import CadastroPesquisa from './CadastroPesquisa.jsx';

import {
    buscarDadosPesquisas
} from './servicos/pesquisasApi.js';

import montarInformacoesPesquisas from './funcoes/pesquisa/montarInformacoesPesquisas.js';

import filtrarPesquisas from './funcoes/pesquisa/filtrarPesquisas.js';

import './css-pesquisas/pesquisas.css';

import ConcluidoIcon from './img/concluido-icon.svg';
import PedenteIcon from './img/Pedente-icon.svg';
import CadastroIcon from './img/cadastro-icon.svg';


//----------------- TELA PESQUISAS -------------------------//

function Pesquisas() {

    const [pesquisas, setPesquisas] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);
    const [pesquisaSetores, setPesquisaSetores] = useState([]);
    const [pesquisaCargos, setPesquisaCargos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [alertaNotificacao, setAlertaNotificacao] = useState(null);

    // Controla se a tela de cadastro está aberta.
    const [telaCadastro, setTelaCadastro] = useState(false);

    // Atualiza os dados da listagem após cadastrar.
    const [atualizarLista, setAtualizarLista] = useState(0);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- CARREGAR DADOS ----------------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                setCarregando(true);
                setErro('');

                const dados = await buscarDadosPesquisas();

                setPesquisas(dados.pesquisas);
                setParticipacoes(dados.participacoes);
                setPesquisaSetores(dados.pesquisaSetores);
                setPesquisaCargos(dados.pesquisaCargos);
                setColaboradores(dados.colaboradores);

            } catch (error) {

                console.error('Erro ao carregar pesquisas:', error);

                setErro(error.message || 'Erro ao carregar pesquisas.');

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, [atualizarLista]);


    //----------------- NOVA PESQUISA -----------------------//

    function novaPesquisa() {

        setErro('');
        setTelaCadastro(true);

    }


    //----------------- VOLTAR PARA LISTAGEM ---------------//

    function voltarParaListagem() {

        setTelaCadastro(false);

    }


    //----------------- PESQUISA CADASTRADA ----------------//

    function pesquisaCadastrada() {

        setTelaCadastro(false);

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


    //----------------- RENDERIZAR LISTAGEM ----------------//

    return (

        <div className="pagina-pesquisas">

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

export default Pesquisas;
