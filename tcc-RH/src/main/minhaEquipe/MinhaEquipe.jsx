
/********************************************************************************
 * Objetivo: Tela Minha Equipe.
 ********************************************************************************/

import { useState, useEffect, useMemo } from 'react';

import './css-minhaEquipe/minhaEquipe.css';

import Filtro from '../../componentes/cardFiltros/filtros';
import Tabela from '../../componentes/cardTabela/Tabela';
import Minicards from '../../componentes/minicard/minicard';

import buscarDadosEquipe from './servicos/minhaEquipeApi';

import montarInformacoesEquipe from './funcoes/equipe/montarInformacoesEquipe';
import filtrarEquipe from './funcoes/equipe/filtrarEquipe';
import criarColunasEquipe from './funcoes/equipe/colunaEquipe';

import colaborador from '../colaboradores/img/colaboradores-icon.svg';
import Setor from '../setores/img/setoresAtivos-icon.svg';


//----------------- COMPONENTE ------------------------------//

function MinhaEquipe() {

    //----------------- ESTADOS -----------------------------//

    const [equipe, setEquipe] = useState([]);
    const [gestor, setGestor] = useState(null);

    const [ehGestor, setEhGestor] = useState(false);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [colaboradorSelecionado, setColaboradorSelecionado] =
        useState(null);


    //----------------- CARREGAR DADOS ----------------------//

    useEffect(() => {

        async function carregarEquipe() {

            try {

                setCarregando(true);
                setErro('');

                const dados = await buscarDadosEquipe();

                const resultado = montarInformacoesEquipe(
                    dados.colaboradores,
                    dados.usuarios
                );

                setEhGestor(resultado.ehGestor);
                setGestor(resultado.gestor);
                setEquipe(resultado.equipe);

            } catch (erro) {

                console.error(
                    'Erro ao carregar Minha Equipe:',
                    erro
                );

                setErro(erro.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarEquipe();

    }, []);


    //----------------- FILTRAR EQUIPE -----------------------//

    const equipeFiltrada = useMemo(() => {

        return filtrarEquipe(equipe, filtros);

    }, [equipe, filtros]);


    //----------------- OPÇÕES DE CARGOS ---------------------//

    const opcoesCargos = useMemo(() => {

        const cargos = equipe
            .map(colaborador => colaborador.nome_cargo)
            .filter(cargo =>
                cargo && cargo !== 'Não definido'
            );

        return [...new Set(cargos)]
            .sort()
            .map(cargo => ({
                id: cargo,
                nome: cargo
            }));

    }, [equipe]);


    //----------------- COLUNAS ------------------------------//

    const colunas = useMemo(() => {

        return criarColunasEquipe(
            setColaboradorSelecionado
        );

    }, []);


    //----------------- FECHAR VISUALIZAÇÃO ------------------//

    function fecharVisualizacao() {

        setColaboradorSelecionado(null);

    }


    //----------------- TELA -------------------------------//

    return (

        <div className="pagina-minha-equipe">


            {/* CABEÇALHO */}

            <div className="card-tiulo">

                <div className="titulo-descricao">

                    <h2>Minha equipe</h2>

                    <p>
                        Visualize os colaboradores vinculados
                        às equipes sob sua responsabilidade.
                    </p>

                </div>

            </div>


            {/* CARREGAMENTO */}

            {carregando && (

                <div className="mensagem-equipe">
                    Carregando informações da equipe...
                </div>

            )}


            {/* ERRO */}

            {!carregando && erro && (

                <div className="mensagem-equipe mensagem-erro">
                    {erro}
                </div>

            )}


            {/* NÃO É GESTOR */}

            {!carregando && !erro && !ehGestor && (

                <div className="mensagem-equipe">

                    <h3>Acesso não disponível</h3>

                    <p>
                        A tela Minha Equipe está disponível
                        somente para usuários com nível de acesso Gestor.
                    </p>

                </div>

            )}


            {/* GESTOR */}

            {!carregando && !erro && ehGestor && (

                <>

                    {/* MINICARDS */}

                    <div className="minicard-equipe">

                        {/* TOTAL DE COLABORADORES */}

                        <Minicards
                            icone={colaborador}
                            numero={equipe.length}
                            informacao="Total colaboradores"
                            corFundo="#E7FAEF"
                            layout="horizontal"
                        />


                        {/* SETOR */}

                        <Minicards
                            icone={Setor}
                            numero={gestor?.nome_setor || 'Não definido'}
                            informacao="Setor atribuído"
                            corFundo="#E4ECFF"
                            layout="horizontal"
                        />


                        {/* GESTOR */}

                        <Minicards
                            icone={colaborador}
                            numero={gestor?.nome || 'Não definido'}
                            informacao="Gestor"
                            corFundo="#E4ECFF"
                            layout="horizontal"
                        />

                    </div>


                    {/* FILTROS */}

                    <Filtro
                        titulo="Pesquisar colaboradores"
                        placeholder="Buscar por nome, matrícula ou e-mail..."
                        nomeDropdown="Cargo"
                        opcoesDropdown={opcoesCargos}
                        onFiltrosChange={setFiltros}
                    />


                    {/* TABELA */}

                    <Tabela
                        key={JSON.stringify(filtros)}
                        titulo="Lista de colaboradores da minha equipe"
                        dados={equipeFiltrada}
                        colunas={colunas}
                        itensPorPagina={8}
                    />

                </>

            )}


            {/* VISUALIZAÇÃO DO COLABORADOR */}

            {colaboradorSelecionado && (

                <div
                    className="fundo-modal-equipe"
                    onClick={fecharVisualizacao}
                >

                    <div
                        className="modal-equipe"
                        onClick={evento => evento.stopPropagation()}
                    >

                        {/* CABEÇALHO DO MODAL */}

                        <div className="cabecalho-modal-equipe">

                            <h2>Dados do colaborador</h2>

                            <button
                                type="button"
                                onClick={fecharVisualizacao}
                            >
                                ×
                            </button>

                        </div>


                        {/* INFORMAÇÕES DO COLABORADOR */}

                        <div className="dados-modal-equipe">

                            <div className="card-informacao-equipe">

                                <span>Nome</span>

                                <strong>
                                    {colaboradorSelecionado.nome || 'Não informado'}
                                </strong>

                            </div>


                            <div className="card-informacao-equipe">

                                <span>E-mail</span>

                                <strong>
                                    {colaboradorSelecionado.email || 'Não informado'}
                                </strong>

                            </div>


                            <div className="card-informacao-equipe">

                                <span>Matrícula</span>

                                <strong>
                                    {colaboradorSelecionado.matricula || 'Não informado'}
                                </strong>

                            </div>


                            <div className="card-informacao-equipe">

                                <span>Cargo</span>

                                <strong>
                                    {colaboradorSelecionado.nome_cargo || 'Não informado'}
                                </strong>

                            </div>


                            <div className="card-informacao-equipe">

                                <span>Setor</span>

                                <strong>
                                    {colaboradorSelecionado.nome_setor || 'Não informado'}
                                </strong>

                            </div>


                            <div className="card-informacao-equipe">

                                <span>Gestor direto</span>

                                <strong>
                                    {colaboradorSelecionado.gestor_direto || 'Não informado'}
                                </strong>

                            </div>


                            <div className="card-informacao-equipe">

                                <span>Status</span>

                                <strong>
                                    {colaboradorSelecionado.status || 'Não informado'}
                                </strong>

                            </div>

                        </div>


                        {/* BOTÃO FECHAR */}

                        <button
                            type="button"
                            className="botao-fechar-modal"
                            onClick={fecharVisualizacao}
                        >
                            Fechar
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default MinhaEquipe;
