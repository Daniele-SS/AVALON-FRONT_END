
/********************************************************************************
 * Objetivo: Tela principal de gerenciamento de Feedbacks.
 ********************************************************************************/

import { useState, useEffect, useMemo } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';

import LinhaTempoFeedback from './componentes/LinhaTempoFeedback';
import DetalhesFeedback from './componentes/DetalhesFeedback';
import CadastroFeedback from './cadastroFeedback';

import buscarFeedbacks from './servicos/feedbacksApi';
import buscarRespostasFeedback from './servicos/respostasFeedbackApi';

import montarInformacoesFeedbacks from './funcoes/feedback/montarInformacoesFeedbacks';
import calcularIndicadoresFeedbacks from './funcoes/feedback/calcularIndicadoresFeedbacks';
import filtrarFeedbacks from './funcoes/feedback/filtrarFeedbacks';

import FeedbackIcone from './img/feedbackEsseMes.svg';
import PedenteIcone from './img/pedente.svg';
import RegistradoIcone from './img/registrado.svg';
import RespostaIcone from './img/resposta.svg';

import './css-feedbacks/feedbacks.css';
import '../../componentes/cardNomePag/nomePag.css';

function Feedbacks() {

    //----------------- ESTADOS ---------------------------//

    const [tela, setTela] = useState('lista');

    const [feedbacks, setFeedbacks] = useState([]);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [feedbackSelecionado, setFeedbackSelecionado] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');


    //----------------- OPÇÕES DE PERÍODO -----------------//

    const periodos = [
        { id: '7dias', nome: 'Últimos 7 dias' },
        { id: '30dias', nome: 'Últimos 30 dias' },
        { id: '6meses', nome: 'Últimos 6 meses' }
    ];


    //----------------- BUSCAR DADOS ----------------------//

    async function carregarDados() {

        try {

            setCarregando(true);
            setErro('');

            const [dadosFeedbacks, dadosRespostas] = await Promise.all([
                buscarFeedbacks(),
                buscarRespostasFeedback()
            ]);

            const informacoes = montarInformacoesFeedbacks(
                dadosFeedbacks,
                dadosRespostas
            );

            setFeedbacks(informacoes);

        } catch (erro) {

            console.error('Erro ao carregar feedbacks:', erro);

            setErro(erro.message || 'Erro ao carregar os feedbacks.');

        } finally {

            setCarregando(false);

        }

    }


    //----------------- EXECUTAR BUSCA --------------------//

    useEffect(() => {
        carregarDados();
    }, []);


    //----------------- ATUALIZAR FILTROS -----------------//

    function atualizarFiltros(novosFiltros) {
        setFiltros(novosFiltros);
    }


    //----------------- CALCULAR INDICADORES --------------//

    const indicadores = useMemo(() => {
        return calcularIndicadoresFeedbacks(feedbacks);
    }, [feedbacks]);


    //----------------- CONVERTER DATA --------------------//

    function converterData(data) {

        if (!data) return null;

        const dataTexto = String(data);
        const partes = dataTexto.substring(0, 10).split('-');

        if (partes.length === 3) {

            const [ano, mes, dia] = partes.map(Number);

            if (ano && mes && dia) {
                return new Date(ano, mes - 1, dia);
            }

        }

        const dataConvertida = new Date(data);

        if (isNaN(dataConvertida.getTime())) {
            return null;
        }

        return new Date(
            dataConvertida.getFullYear(),
            dataConvertida.getMonth(),
            dataConvertida.getDate()
        );

    }


    //----------------- FILTRAR FEEDBACKS -----------------//

    const feedbacksFiltrados = useMemo(() => {

        let resultado = filtrarFeedbacks(
            feedbacks,
            filtros.pesquisa,
            'Todos'
        );

        if (!filtros.opcao) {
            return resultado;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataInicial = new Date(hoje);

        if (filtros.opcao === '7dias') {
            dataInicial.setDate(hoje.getDate() - 6);
        } else if (filtros.opcao === '30dias') {
            dataInicial.setDate(hoje.getDate() - 29);
        } else if (filtros.opcao === '6meses') {
            dataInicial.setMonth(hoje.getMonth() - 6);
        }

        return resultado.filter(feedback => {

            const dataFeedback = converterData(feedback.data);

            if (!dataFeedback) return false;

            return (
                dataFeedback >= dataInicial &&
                dataFeedback <= hoje
            );

        });

    }, [feedbacks, filtros]);


    //----------------- ABRIR CADASTRO --------------------//

    function novoFeedback() {
        setFeedbackSelecionado(null);
        setTela('cadastro');
    }


    //----------------- FINALIZAR CADASTRO ----------------//

    async function finalizarCadastro() {

        await carregarDados();

        setTela('lista');

    }


    //----------------- VOLTAR PARA LISTAGEM --------------//

    function voltarListagem() {
        setTela('lista');
    }


    //----------------- EXIBIR CADASTRO -------------------//

    if (tela === 'cadastro') {

        return (
            <div className="pagina-feedbacks">

                <CadastroFeedback
                    onVoltar={voltarListagem}
                    onSucesso={finalizarCadastro}
                />

            </div>
        );

    }


    //----------------- TELA PRINCIPAL --------------------//

    return (

        <div className="pagina-feedbacks">

            <BotaoCadastro
                titulo="Feedbacks"
                descricao="Registre, acompanhe e consulte feedbacks entre gestores e colaboradores com foco em desenvolvimento contínuo e alinhamento de expectativas."
                textoBotao="Novo Feedback"
                onClick={novoFeedback}
            />


            {/*----------------- INDICADORES ----------------*/}

            <div className="indicadores-feedbacks">

                <Minicards
                    icone={FeedbackIcone}
                    numero={indicadores.feedbacksMes}
                    informacao="Feedbacks este mês"
                    corFundo="#F0F3FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={PedenteIcone}
                    numero={indicadores.pendentes}
                    informacao="Pendentes"
                    corFundo="#F0F3FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={RegistradoIcone}
                    numero={indicadores.registrados}
                    informacao="Registrados"
                    corFundo="#F0F3FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={RespostaIcone}
                    numero={`${indicadores.taxaResposta}%`}
                    informacao="Taxa de resposta"
                    corFundo="#F0F3FF"
                    layout="horizontal"
                />

            </div>


            {/*----------------- FILTRO ---------------------*/}

            <Filtro
                titulo="Pesquisar Feedbacks"
                placeholder="Buscar por nome do colaborador"
                nomeDropdown="Período"
                opcoesDropdown={periodos}
                mostrarStatus={false}
                onFiltrosChange={atualizarFiltros}
            />


            {/*----------------- LINHA DO TEMPO -------------*/}

            <div className="conteudo-feedbacks">

                <div className="cabecalho-linha-tempo">

                    <div>
                        <h3>Atividade Recente & Linha do Tempo</h3>
                        <span>Tempo real</span>
                    </div>

                    <small>
                        Exibindo {
                            feedbacksFiltrados.filter(item => item.ativo).length
                        } de {
                            feedbacks.filter(item => item.ativo).length
                        } registros
                    </small>

                </div>


                {carregando && (
                    <div className="mensagem-feedbacks">
                        Carregando feedbacks...
                    </div>
                )}


                {!carregando && erro && (

                    <div className="mensagem-erro-feedbacks">

                        <p>{erro}</p>

                        <button
                            type="button"
                            onClick={carregarDados}
                        >
                            Tentar novamente
                        </button>

                    </div>

                )}


                {!carregando && !erro && (

                    <LinhaTempoFeedback
                        feedbacks={feedbacksFiltrados.filter(
                            feedback => feedback.ativo
                        )}
                        onVisualizar={setFeedbackSelecionado}
                    />

                )}

            </div>


            {/*----------------- DETALHES --------------------*/}

            {feedbackSelecionado && (

                <DetalhesFeedback
                    feedback={feedbackSelecionado}
                    onFechar={() => setFeedbackSelecionado(null)}
                />

            )}

        </div>

    );

}

export default Feedbacks;
