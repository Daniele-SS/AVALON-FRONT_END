//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CardJornada from './componente/cardJornada.jsx';
import CadastroJornada from './cadastroJornada.jsx';
import EditarJornada from './editarJornada.jsx';

import buscarDadosJornadaEscala from './servicos/jornadaEscala.js';
import filtrarJornadas from './funcoes/jornada/filtrarJornada.js';
import montarInformacoesJornadas from './funcoes/jornada/informacoesJornadas.js';

import './css-jornadaEscala/jornadaEscala.css';
import RelogioIcone from './img/relogio-icon.svg';


//----------------- COMPONENTE ------------------------------//

function JornadaEscala() {

    const [jornadas, setJornadas] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [diasSemana, setDiasSemana] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [telaAtual, setTelaAtual] = useState('lista');

    // Guarda a jornada que será editada.
    const [jornadaSelecionada, setJornadaSelecionada] = useState(null);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- BUSCAR DADOS -------------------------//

    async function carregarDados() {

        setCarregando(true);
        setErro('');

        try {

            const dados = await buscarDadosJornadaEscala();

            setJornadas(dados.jornadas);
            setColaboradores(dados.colaboradores);
            setDiasSemana(dados.diasSemana);

        } catch (erroApi) {

            console.error('Erro ao buscar jornadas:', erroApi);

            setErro(
                erroApi.message ||
                'Não foi possível carregar as jornadas.'
            );

        } finally {

            setCarregando(false);

        }
    }


    //----------------- CARREGAMENTO INICIAL -----------------//

    useEffect(() => {
        carregarDados();
    }, []);


    //----------------- INDICADORES --------------------------//

    const informacoes = montarInformacoesJornadas(
        jornadas,
        colaboradores
    );

    const opcoesJornadas = jornadas.map((jornada) => ({
        id: String(jornada.id),
        nome: jornada.nome
    }));

    const jornadasFiltradas = filtrarJornadas(
        jornadas,
        filtros
    );


    //----------------- FILTROS ------------------------------//

    function receberFiltros(novosFiltros) {

        setFiltros({
            pesquisa: novosFiltros.pesquisa || '',
            status: novosFiltros.status || 'Todos',
            opcao: novosFiltros.opcao || ''
        });
    }


    //----------------- ABRIR CADASTRO -----------------------//

    function abrirCadastro() {

        setJornadaSelecionada(null);
        setTelaAtual('cadastro');
    }


    //----------------- ABRIR EDIÇÃO -------------------------//

    function abrirEdicao(jornada) {

        setJornadaSelecionada(jornada);
        setTelaAtual('edicao');
    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    async function voltarParaLista() {

        setTelaAtual('lista');
        setJornadaSelecionada(null);

        setFiltros({
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        });

        await carregarDados();
    }


    //----------------- TELA DE CADASTRO ---------------------//

    if (telaAtual === 'cadastro') {

        return (
            <CadastroJornada
                voltar={voltarParaLista}
            />
        );
    }


    //----------------- TELA DE EDIÇÃO -----------------------//

    if (telaAtual === 'edicao') {

        return (
            <EditarJornada
                jornada={jornadaSelecionada}
                diasSemana={diasSemana}
                voltar={voltarParaLista}
            />
        );
    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (
        <>

            {/* CABEÇALHO */}

            <BotaoCadastro
                titulo="Jornada e Escala"
                descricao="Gerencie e consulte os horários e a jornada dos colaboradores da organização."
                textoBotao="Nova Jornada"
                onClick={abrirCadastro}
            />


            {/* PAINEL DE JORNADAS */}

            <div className="painel-jornadas">

                <div className="informacoes-jornadas">

                    <div className="icone-jornadas">

                        <img
                            src={RelogioIcone}
                            alt="Ícone de relógio"
                        />

                    </div>

                    <div className="texto-jornadas">

                        <h2>Jornadas de trabalho</h2>

                        <p className="descricao-jornadas">
                            As jornadas definem a matriz temporal de
                            cumprimento obrigatório: o horário de entrada
                            e saída, vinculadas às escalas de equipe.
                        </p>

                        <div className="conceito-jornadas">

                            <span>Conceito estrutural:</span>

                            <div className="card-conceito-jornadas">

                                <strong>Jornada</strong>

                                <p>= horário fixo + dias ativos</p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* INDICADORES */}

                <div className="indicadores-jornadas">

                    <div className="indicador-jornadas">

                        <h3>Modelos</h3>

                        <strong>
                            {carregando
                                ? '—'
                                : informacoes.totalJornadas}
                        </strong>

                        <p>Cadastrados</p>

                    </div>

                    <div className="indicador-jornadas">

                        <h3>Ativas</h3>

                        <strong>
                            {carregando
                                ? '—'
                                : informacoes.jornadasAtivas}
                        </strong>

                        <p>Em operação</p>

                    </div>

                    <div className="indicador-jornadas">

                        <h3>Vínculos</h3>

                        <strong>
                            {carregando
                                ? '—'
                                : `${informacoes.percentualVinculos}%`}
                        </strong>

                        <p>Com escalas</p>

                    </div>

                </div>

            </div>


            {/* FILTROS */}

            <Filtro
                titulo="Pesquisar Jornada"
                placeholder="Buscar por nome da jornada"
                nomeDropdown="Jornada"
                opcoesDropdown={opcoesJornadas}
                onFiltrosChange={receberFiltros}
            />


            {/* LISTA DE JORNADAS */}

            <div className="lista-jornadas">

                {carregando && (
                    <p>Carregando jornadas...</p>
                )}

                {!carregando && erro && (
                    <p>{erro}</p>
                )}

                {!carregando &&
                    !erro &&
                    jornadasFiltradas.length === 0 && (
                        <p>Nenhuma jornada encontrada.</p>
                    )}

                {!carregando &&
                    !erro &&
                    jornadasFiltradas.length > 0 && (

                        <div className="grade-jornadas">

                            {jornadasFiltradas.map((jornada) => (

                                <CardJornada
                                    key={jornada.id}
                                    jornada={jornada}
                                    diasSemana={diasSemana}
                                    onVerDetalhes={abrirEdicao}
                                />

                            ))}

                        </div>

                    )}

            </div>

        </>
    );
}


//----------------- EXPORTAÇÃO ------------------------------//

export default JornadaEscala;