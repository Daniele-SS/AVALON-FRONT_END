//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import AlertaNotificacao from '../../componentes/alerta/Alerta.jsx';

import CardAvaliacao from './componentes/CardAvaliacao.jsx';
import CadastroAvaliacao from './cadastroAvaliacao.jsx';

import buscarDadosAvaliacaoPsicossocial from './servico/avaliacoesApi.js';
import cadastrarAvaliacaoPsicossocial from './servico/cadastroAvaliacaoApi.js';

import filtrarAvaliacoes from './funcoes/avaliacao/filtrarAvaliacoes.js';
import montarInformacoesAvaliacoes from './funcoes/avaliacao/montarInformacoesAvaliacoes.js';

import './css-avaliacaoPsicossocial/avaliacaoPsicossocial.css';


//----------------- ÍCONES DOS MINICARDS --------------------//

import AvaliacoesIcone from './img/avaliacoes-icon.svg';
import AtencaoIcone from './img/atencao-icon.svg';
import ParticipantesIcone from './img/participantes-icon.svg';
import AmpulhetaIcone from './img/ampulheta-icon.svg';


//----------------- COMPONENTE PRINCIPAL -------------------//

function AvaliacaoPsicossocial() {

    //----------------- ESTADOS -----------------------------//

    const [avaliacoes, setAvaliacoes] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);

    const [avaliacoesSetores, setAvaliacoesSetores] = useState([]);
    const [avaliacoesCargos, setAvaliacoesCargos] = useState([]);

    const [colaboradores, setColaboradores] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [telaAtual, setTelaAtual] = useState('lista');
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);

    // Controla as notificações de sucesso e erro.
    const [alertaNotificacao, setAlertaNotificacao] = useState({
        tipo: '',
        mensagem: ''
    });

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- CONTROLAR NOTIFICAÇÃO ---------------//

    function exibirNotificacao(tipo, mensagem) {

        setAlertaNotificacao({
            tipo,
            mensagem
        });

    }


    function fecharNotificacao() {

        setAlertaNotificacao({
            tipo: '',
            mensagem: ''
        });

    }


    //----------------- CARREGAR DADOS ----------------------//

    async function carregarDados() {

        try {

            setCarregando(true);
            setErro('');

            const dados = await buscarDadosAvaliacaoPsicossocial();

            setAvaliacoes(dados.avaliacoes || []);
            setParticipacoes(dados.participacoes || []);

            setAvaliacoesSetores(dados.avaliacoesSetores || []);
            setAvaliacoesCargos(dados.avaliacoesCargos || []);

            setColaboradores(dados.colaboradores || []);

        } catch (erro) {

            console.error('Erro ao carregar avaliações:', erro);

            setErro(
                erro.message || 'Não foi possível carregar as avaliações.'
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- CARREGAMENTO INICIAL ----------------//

    useEffect(() => {

        carregarDados();

    }, []);


    //----------------- NAVEGAÇÃO ---------------------------//

    function abrirCadastro() {

        fecharNotificacao();

        setTelaAtual('cadastro');

    }


    function abrirDetalhes(avaliacao) {

        setAvaliacaoSelecionada(avaliacao);
        setTelaAtual('detalhes');

    }


    //----------------- CONCLUIR CADASTRO -------------------//

    async function concluirCadastro(mensagem) {

        setTelaAtual('lista');
        setAvaliacaoSelecionada(null);

        setFiltros({
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        });

        await carregarDados();

        exibirNotificacao('sucesso', mensagem);

    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    async function voltarParaLista() {

        setTelaAtual('lista');
        setAvaliacaoSelecionada(null);

        setFiltros({
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        });

        await carregarDados();

    }


    //----------------- CADASTRAR AVALIAÇÃO -----------------//

    async function salvarAvaliacao(dadosAvaliacao) {

        try {

            // Envia os dados para o backend.
            await cadastrarAvaliacaoPsicossocial(dadosAvaliacao);

        } catch (erro) {

            console.error('Erro ao cadastrar avaliação:', erro);

            // Devolve o erro para a tela de cadastro.
            throw erro;

        }

    }


    //----------------- FILTROS -----------------------------//

    function receberFiltros(novosFiltros) {

        setFiltros({
            pesquisa: novosFiltros.pesquisa || '',
            status: novosFiltros.status || 'Todos',
            opcao: novosFiltros.opcao || ''
        });

    }


    //----------------- INFORMAÇÕES -------------------------//

    const informacoes = montarInformacoesAvaliacoes(
        avaliacoes,
        participacoes
    );


    //----------------- CONTAGEM DE AVALIAÇÕES ATIVAS --------//

    const avaliacoesAtivas = avaliacoes.filter((avaliacao) => {

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const inicio = avaliacao.data_inicio
            ? new Date(avaliacao.data_inicio)
            : null;

        const fim = avaliacao.data_fim
            ? new Date(avaliacao.data_fim)
            : null;

        if (!inicio || !fim) {
            return false;
        }

        inicio.setHours(0, 0, 0, 0);
        fim.setHours(0, 0, 0, 0);

        return (
            Number(avaliacao.status) !== 1 &&
            hoje >= inicio &&
            hoje <= fim
        );

    }).length;


    //----------------- COLABORADORES PARTICIPANTES ----------//

    const colaboradoresParticipantes = new Set(

        participacoes

            .filter((participacao) => Number(participacao.status) === 1)

            .flatMap((participacao) => {

                let colaboradoresParticipacao = participacao.colaborador || [];

                if (!Array.isArray(colaboradoresParticipacao)) {
                    colaboradoresParticipacao = [colaboradoresParticipacao];
                }

                return colaboradoresParticipacao

                    .map((colaborador) =>
                        colaborador.id_colaborador ?? colaborador.id
                    )

                    .filter((id) => id != null);

            })

    ).size;


    //----------------- APLICAR FILTROS ---------------------//

    const avaliacoesFiltradas = filtrarAvaliacoes(
        avaliacoes,
        filtros
    );


    //----------------- TELA DE CADASTRO --------------------//

    if (telaAtual === 'cadastro') {

        return (

            <div className="pagina-avaliacao-psicossocial">

                <CadastroAvaliacao
                    voltar={voltarParaLista}
                    onSalvar={salvarAvaliacao}
                    onSucesso={concluirCadastro}
                />

            </div>

        );

    }


    //----------------- TELA DE DETALHES --------------------//

    if (telaAtual === 'detalhes') {

        return (

            <div className="pagina-avaliacao-psicossocial">

                <button
                    className="botao-voltar-avaliacao"
                    type="button"
                    onClick={voltarParaLista}
                >
                    ← Voltar para avaliações
                </button>

                <h2>{avaliacaoSelecionada?.titulo}</h2>

                <p>
                    {avaliacaoSelecionada?.descricao}
                </p>

            </div>

        );

    }


    //----------------- TELA PRINCIPAL ----------------------//

    return (

        <div className="pagina-avaliacao-psicossocial">


            {/* NOTIFICAÇÃO DE SUCESSO OU ERRO */}

            <AlertaNotificacao
                tipo={alertaNotificacao.tipo}
                mensagem={alertaNotificacao.mensagem}
                onFechar={fecharNotificacao}
            />


            {/* CABEÇALHO */}

            <BotaoCadastro
                titulo="Avaliação Psicossocial"
                descricao="Acompanhe as avaliações e monitore os fatores psicossociais no ambiente de trabalho."
                textoBotao="Nova Avaliação"
                onClick={abrirCadastro}
            />


            {/* MINICARDS */}

            <div className="container-minicards">

                <Minicards
                    icone={AvaliacoesIcone}
                    numero={avaliacoesAtivas}
                    informacao="Avaliações Ativas"
                    corFundo="#EFF4FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={AtencaoIcone}
                    numero="--"
                    informacao="Situações em atenção"
                    corFundo="#FFF5E5"
                    layout="horizontal"
                />

                <Minicards
                    icone={ParticipantesIcone}
                    numero={colaboradoresParticipantes}
                    informacao="Colaboradores participantes"
                    corFundo="#E1FFEC"
                    layout="horizontal"
                />

            </div>


            {/* FILTROS */}

            <div className="filtros-avaliacoes-psicossociais">

                <Filtro
                    titulo="Pesquisar Avaliação"
                    placeholder="Buscar por título da avaliação"
                    nomeDropdown="Avaliação"
                    opcoesDropdown={avaliacoes.map((avaliacao) => ({
                        id: String(avaliacao.id),
                        nome: avaliacao.titulo
                    }))}
                    onFiltrosChange={receberFiltros}
                />

            </div>


            {/* ERRO DE CARREGAMENTO */}

            {erro && (

                <p className="mensagem-avaliacoes-psicossociais erro-avaliacoes-psicossociais">
                    {erro}
                </p>

            )}


            {/* LISTA DE AVALIAÇÕES */}

            <section className="secao-avaliacoes-andamento">

                <h2 className="titulo-secao-avaliacoes">

                    <img src={AmpulhetaIcone} alt="ampulheta" />

                    Avaliações

                </h2>


                {carregando ? (

                    <p className="mensagem-avaliacoes-psicossociais">
                        Carregando avaliações...
                    </p>

                ) : avaliacoesFiltradas.length === 0 ? (

                    <p className="mensagem-avaliacoes-psicossociais">
                        Nenhuma avaliação encontrada.
                    </p>

                ) : (

                    <div className="grade-avaliacoes-psicossociais">

                        {avaliacoesFiltradas.map((avaliacao) => (

                            <CardAvaliacao
                                key={avaliacao.id}
                                avaliacao={avaliacao}
                                participacoes={participacoes}
                                avaliacoesSetores={avaliacoesSetores}
                                avaliacoesCargos={avaliacoesCargos}
                                colaboradores={colaboradores}
                                onVerDetalhes={() => abrirDetalhes(avaliacao)}
                            />

                        ))}

                    </div>

                )}

            </section>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default AvaliacaoPsicossocial;