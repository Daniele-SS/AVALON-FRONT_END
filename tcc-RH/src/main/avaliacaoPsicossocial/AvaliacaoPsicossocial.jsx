//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CardAvaliacao from './componentes/CardAvaliacao.jsx';

import buscarDadosAvaliacaoPsicossocial from './servico/avaliacoesApi.js';

import filtrarAvaliacoes from './funcoes/avaliacao/filtrarAvaliacoes.js';
import montarInformacoesAvaliacoes from './funcoes/avaliacao/montarInformacoesAvaliacoes.js';

import './css-avaliacaoPsicossocial/avaliacaoPsicossocial.css';

//----------------- ÍCONES DOS MINICARDS --------------------//

import AvaliacoesIcone from './img/avaliacoes-icon.svg';
import AtencaoIcone from './img/atencao-icon.svg';
import ParticipantesIcone from './img/participantes-icon.svg';


// --------------------------------------------------------- //
// COMPONENTE
// --------------------------------------------------------- //

function AvaliacaoPsicossocial() {

    const [avaliacoes, setAvaliacoes] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);

    // Estados para armazenar os setores e cargos.
    const [avaliacoesSetores, setAvaliacoesSetores] = useState([]);
    const [avaliacoesCargos, setAvaliacoesCargos] = useState([]);

    // Estado para armazenar os colaboradores cadastrados.
    const [colaboradores, setColaboradores] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [telaAtual, setTelaAtual] = useState('lista');
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    // ----------------------------------------------------- //
    // CARREGAR DADOS
    // ----------------------------------------------------- //

    async function carregarDados() {

        setCarregando(true);
        setErro('');

        try {

            const dados = await buscarDadosAvaliacaoPsicossocial();

            setAvaliacoes(dados.avaliacoes || []);

            setParticipacoes(dados.participacoes || []);

            // Armazena os vínculos entre avaliações e setores.
            setAvaliacoesSetores(dados.avaliacoesSetores || []);

            // Armazena os vínculos entre avaliações e cargos.
            setAvaliacoesCargos(dados.avaliacoesCargos || []);

            // Armazena os colaboradores cadastrados.
            setColaboradores(dados.colaboradores || []);

        } catch (erro) {

            setErro(
                erro.message || 'Não foi possível carregar as avaliações.'
            );

        } finally {

            setCarregando(false);

        }

    }


    // ----------------------------------------------------- //
    // CARREGAR DADOS AO ABRIR A TELA
    // ----------------------------------------------------- //

    useEffect(() => {
        carregarDados();
    }, []);


    // ----------------------------------------------------- //
    // NAVEGAÇÃO
    // ----------------------------------------------------- //

    function abrirCadastro() {
        console.log('Abrir cadastro de avaliação');
    }


    function abrirDetalhes(avaliacao) {
        setAvaliacaoSelecionada(avaliacao);
        setTelaAtual('detalhes');
    }


    function voltarParaLista() {
        setTelaAtual('lista');
        setAvaliacaoSelecionada(null);
        carregarDados();
    }


    // ----------------------------------------------------- //
    // FILTROS
    // ----------------------------------------------------- //

    function receberFiltros(novosFiltros) {
        setFiltros(novosFiltros);
    }


    // ----------------------------------------------------- //
    // INFORMAÇÕES
    // ----------------------------------------------------- //

    const informacoes = montarInformacoesAvaliacoes(
        avaliacoes,
        participacoes
    );


    // ----------------------------------------------------- //
    // CONTAGEM DE AVALIAÇÕES ATIVAS
    // ----------------------------------------------------- //

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

        return hoje >= inicio && hoje <= fim;

    }).length;


    // ----------------------------------------------------- //
    // COLABORADORES PARTICIPANTES
    // ----------------------------------------------------- //

    // Conta os colaboradores que já concluíram uma participação.
    // Não exibe nomes nem respostas individuais.

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


    // ----------------------------------------------------- //
    // APLICAR FILTROS
    // ----------------------------------------------------- //

    const avaliacoesFiltradas = filtrarAvaliacoes(
        avaliacoes,
        filtros
    );


    // ----------------------------------------------------- //
    // TELA DE DETALHES
    // ----------------------------------------------------- //

    if (telaAtual === 'detalhes') {

        return (

            <div className="pagina-avaliacao-psicossocial">

                <button
                    className="botao-voltar-avaliacao"
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


    // ----------------------------------------------------- //
    // TELA PRINCIPAL
    // ----------------------------------------------------- //

    return (

        <div className="pagina-avaliacao-psicossocial">

            <BotaoCadastro
                titulo="Avaliação Psicossocial"
                descricao="Acompanhe as avaliações e monitore os fatores psicossociais no ambiente de trabalho."
                textoBotao="Nova Avaliação"
                onClick={abrirCadastro}
            />


            {/* ------------------------------------------------ */}
            {/* MINICARDS                                         */}
            {/* ------------------------------------------------ */}

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


            {/* ------------------------------------------------ */}
            {/* FILTROS                                           */}
            {/* ------------------------------------------------ */}

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


            {/* ------------------------------------------------ */}
            {/* ERRO                                              */}
            {/* ------------------------------------------------ */}

            {erro && (

                <p className="mensagem-avaliacoes-psicossociais erro-avaliacoes-psicossociais">
                    {erro}
                </p>

            )}


            {/* ------------------------------------------------ */}
            {/* LISTA DE AVALIAÇÕES                               */}
            {/* ------------------------------------------------ */}

            <section className="secao-avaliacoes-andamento">

                <h2 className="titulo-secao-avaliacoes">
                    <span>⌛</span>
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

                                // Envia os vínculos de setores e cargos.
                                avaliacoesSetores={avaliacoesSetores}
                                avaliacoesCargos={avaliacoesCargos}

                                // Envia os colaboradores para calcular o público elegível.
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


// --------------------------------------------------------- //
// EXPORTAÇÃO
// --------------------------------------------------------- //

export default AvaliacaoPsicossocial;