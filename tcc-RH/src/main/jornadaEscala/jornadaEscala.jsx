
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import CardJornada from './componente/cardJornada.jsx';
import buscarDadosJornadaEscala from './servicos/jornadaEscala.js';

import './css-jornadaEscala/jornadaEscala.css';

import RelogioIcone from './img/relogio-icon.svg';


//----------------- COMPONENTE ------------------------------//

function JornadaEscala() {

    //----------------- ESTADOS -----------------------------//

    const [jornadas, setJornadas] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [diasSemana, setDiasSemana] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- BUSCAR DADOS DA API -----------------//

    useEffect(() => {

        async function buscarDados() {

            try {

                setCarregando(true);
                setErro('');

                const dados = await buscarDadosJornadaEscala();

                setJornadas(dados.jornadas);
                setColaboradores(dados.colaboradores);
                setDiasSemana(dados.diasSemana);

            } catch (erro) {

                setErro(erro.message);

            } finally {

                setCarregando(false);

            }

        }

        buscarDados();

    }, []);


    //----------------- INDICADORES --------------------------//

    // Total de jornadas cadastradas

    const totalJornadas = jornadas.length;


    // Total de jornadas ativas

    const jornadasAtivas = jornadas.filter(
        jornada => Number(jornada.status) === 1
    ).length;


    //----------------- CALCULAR JORNADAS UTILIZADAS --------//

    // Conta quantas jornadas possuem pelo menos
    // um colaborador vinculado

    const jornadasUtilizadas = jornadas.filter(jornada => {

        return colaboradores.some(colaborador => {

            const jornadasDoColaborador =
                colaborador.jornada_escala || [];

            return jornadasDoColaborador.some(
                jornadaColaborador =>
                    Number(jornadaColaborador.id) === Number(jornada.id)
            );

        });

    }).length;


    //----------------- CALCULAR PERCENTUAL -----------------//

    // Porcentagem de jornadas utilizadas

    const percentualVinculos = totalJornadas > 0
        ? Math.round(
            (jornadasUtilizadas / totalJornadas) * 100
        )
        : 0;


    //----------------- OPÇÕES DO FILTRO --------------------//

    const opcoesJornadas = jornadas.map(jornada => ({
        id: String(jornada.id),
        nome: jornada.nome
    }));


    //----------------- RECEBER FILTROS ---------------------//

    function receberFiltros(novosFiltros) {

        setFiltros(novosFiltros);

    }


    //----------------- FILTRAR JORNADAS --------------------//

    const jornadasFiltradas = jornadas.filter(jornada => {

        const nomeJornada = String(
            jornada.nome || ''
        ).toLowerCase();

        const pesquisa = filtros.pesquisa.toLowerCase();

        const correspondePesquisa =
            nomeJornada.includes(pesquisa);

        const correspondeStatus =
            filtros.status === 'Todos' ||
            (
                filtros.status === 'Ativos' &&
                Number(jornada.status) === 1
            ) ||
            (
                filtros.status === 'Inativos' &&
                Number(jornada.status) === 0
            );

        const correspondeOpcao =
            filtros.opcao === '' ||
            String(jornada.id) === filtros.opcao;

        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeOpcao
        );

    });


    //----------------- NOVA JORNADA ------------------------//

    function novaJornada() {

        console.log('Botão Nova Jornada clicado!');

    }


    //----------------- TELA --------------------------------//

    return (
        <>

            {/* CARD INICIAL */}

            <BotaoCadastro
                titulo="Jornada e Escala"
                descricao="Gerencie e consulte os horários e a jornada dos colaboradores da organização."
                textoBotao="Nova Jornada"
                onClick={novaJornada}
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


                {/* INDICADORES À DIREITA */}

                <div className="indicadores-jornadas">

                    {/* TOTAL DE JORNADAS */}

                    <div className="indicador-jornadas">

                        <h3>Modelos</h3>

                        <strong>
                            {carregando ? '—' : totalJornadas}
                        </strong>

                        <p>Cadastrados</p>

                    </div>


                    {/* JORNADAS ATIVAS */}

                    <div className="indicador-jornadas">

                        <h3>Ativas</h3>

                        <strong>
                            {carregando ? '—' : jornadasAtivas}
                        </strong>

                        <p>Em operação</p>

                    </div>


                    {/* PERCENTUAL DE JORNADAS UTILIZADAS */}

                    <div className="indicador-jornadas">

                        <h3>Vínculos</h3>

                        <strong>
                            {carregando ? '—' : `${percentualVinculos}%`}
                        </strong>

                        <p>Com escalas</p>

                    </div>

                </div>

            </div>


            {/* FILTRO DE JORNADAS */}

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

                {!carregando && !erro && jornadasFiltradas.length === 0 && (
                    <p>Nenhuma jornada encontrada.</p>
                )}

                {!carregando && !erro && jornadasFiltradas.length > 0 && (

                    <div className="grade-jornadas">

                        {jornadasFiltradas.map(jornada => (

                            <CardJornada
                                key={jornada.id}
                                jornada={jornada}
                                diasSemana={diasSemana}
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
