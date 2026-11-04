
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CadastroBeneficio from './CadastroBeneficio.jsx';
import EditarBeneficio from './EditarBeneficio.jsx';

import CardBeneficio from './componentes/CardBeneficio.jsx';

import buscarBeneficios from './servicos/beneficiosApi.js';

import buscarBeneficiosColaboradores
    from './servicos/beneficioColaboradorApi.js';

import montarInformacoesBeneficios
    from './funcoes/beneficio/montarInformacoesBeneficios.js';

import filtrarBeneficios
    from './funcoes/beneficio/filtrarBeneficios.js';

import calcularIndicadoresBeneficios
    from './funcoes/beneficio/calcularIndicadoresBeneficios.js';

import './css-beneficios/beneficios.css';


//----------------- ÍCONES DOS MINICARDS --------------------//

import BeneficiosAtivos
    from '../cargos/img/cargosAtivos-icon.svg';

import BeneficiosCadastrados
    from '../cargos/img/cargosInativos-icon.svg';

import ColaboradoresBeneficiados
    from '../cargos/img/colaboradores-icon.svg';


//----------------- COMPONENTE ------------------------------//

function Beneficios() {

    //----------------- ESTADOS -----------------------------//

    const [beneficios, setBeneficios] = useState([]);
    const [vinculos, setVinculos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [tela, setTela] = useState('lista');

    // Guarda o benefício selecionado para edição.
    const [beneficioSelecionado, setBeneficioSelecionado] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');


    //----------------- CARREGAR COLABORADORES ----------------//

    async function buscarColaboradores() {

        const API =
            'http://localhost:8080/v1/senai/avalon';

        const token = localStorage.getItem('access_token');

        const resposta = await fetch(
            `${API}/colaborador`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && {
                        Authorization: `Bearer ${token}`
                    })
                }
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok || dados.status === false) {
            throw new Error(
                dados.message ||
                dados.mensagem ||
                'Não foi possível carregar os colaboradores.'
            );
        }

        return dados.response?.colaborador || [];
    }


    //----------------- CARREGAR DADOS -----------------------//

    async function carregarDados() {

        setCarregando(true);
        setErro('');

        try {

            const [
                dadosBeneficios,
                dadosVinculos,
                dadosColaboradores
            ] = await Promise.all([
                buscarBeneficios(),
                buscarBeneficiosColaboradores(),
                buscarColaboradores()
            ]);

            setBeneficios(dadosBeneficios);
            setVinculos(dadosVinculos);
            setColaboradores(dadosColaboradores);

        } catch (erro) {

            setErro(
                erro.message ||
                'Não foi possível carregar os benefícios.'
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- EFEITO INICIAL -----------------------//

    useEffect(() => {
        carregarDados();
    }, []);


    //----------------- NAVEGAÇÃO ----------------------------//

    // Abre a tela de cadastro.
    function abrirCadastro() {

        setBeneficioSelecionado(null);

        setTela('cadastro');

    }


    // Abre a tela de edição com o benefício selecionado.
    function abrirEdicao(beneficio) {

        setBeneficioSelecionado(beneficio);

        setTela('edicao');

    }


    // Retorna para a listagem.
    async function voltarParaLista() {

        setTela('lista');

        setBeneficioSelecionado(null);

        await carregarDados();

    }


    //----------------- FILTROS ------------------------------//

    function atualizarFiltros(novosFiltros) {
        setFiltros(novosFiltros);
    }


    //----------------- INFORMAÇÕES DOS BENEFÍCIOS ------------//

    const informacoesBeneficios = montarInformacoesBeneficios(
        beneficios,
        vinculos,
        colaboradores
    );

    const beneficiosComInformacoes =
        informacoesBeneficios.beneficios || [];

    const beneficiosFiltrados = filtrarBeneficios(
        beneficiosComInformacoes,
        filtros
    );


    //----------------- INDICADORES --------------------------//

    const indicadores = calcularIndicadoresBeneficios(
        beneficios
    );

    const totalColaboradoresBeneficiados =
        informacoesBeneficios.totalColaboradoresBeneficiados || 0;


    //----------------- TELA DE CADASTRO ---------------------//

    if (tela === 'cadastro') {

        return (

            <div className="pagina-beneficios">

                <CadastroBeneficio
                    voltar={voltarParaLista}
                />

            </div>

        );

    }


    //----------------- TELA DE EDIÇÃO -----------------------//

    if (tela === 'edicao' && beneficioSelecionado) {

        return (

            <div className="pagina-beneficios">

                <EditarBeneficio
                    beneficio={beneficioSelecionado}
                    voltar={voltarParaLista}
                />

            </div>

        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <div className="pagina-beneficios">

            {/* CABEÇALHO DA PÁGINA */}

            <BotaoCadastro
                titulo="Benefícios"
                descricao="Gerencie os benefícios disponibilizados pela organização e acompanhe os colaboradores vinculados."
                textoBotao="Cadastrar benefício"
                onClick={abrirCadastro}
            />


            {/* MINICARDS */}

            <div className="container-minicards">

                <Minicards
                    icone={BeneficiosAtivos}
                    numero={indicadores.totalAtivos}
                    informacao="Total de benefícios ativos"
                    layout="horizontal"
                />

                <Minicards
                    icone={BeneficiosCadastrados}
                    numero={indicadores.totalCadastrados}
                    informacao="Total de benefícios cadastrados"
                    layout="horizontal"
                />

                <Minicards
                    icone={ColaboradoresBeneficiados}
                    numero={totalColaboradoresBeneficiados}
                    informacao="Total de colaboradores beneficiados"
                    layout="horizontal"
                />

            </div>


            {/* FILTROS */}

            <Filtro
                titulo="Pesquisar Benefício"
                placeholder="Buscar pelo nome do benefício"
                nomeDropdown="Disponibilidade"
                opcoesDropdown={[
                    {
                        id: 'TODOS',
                        nome: 'Todos os colaboradores'
                    },
                    {
                        id: 'SETOR',
                        nome: 'Por setor'
                    },
                    {
                        id: 'CARGO',
                        nome: 'Por cargo'
                    }
                ]}
                onFiltrosChange={atualizarFiltros}
            />


            {/* MENSAGEM DE ERRO */}

            {erro && (

                <p className="mensagem-erro-beneficios">
                    {erro}
                </p>

            )}


            {/* LISTA DE BENEFÍCIOS */}

            {carregando ? (

                <p className="mensagem-carregamento-beneficios">
                    Carregando benefícios...
                </p>

            ) : (

                <>

                    {beneficiosFiltrados.length > 0 ? (

                        <div className="grade-beneficios">

                            {beneficiosFiltrados.map(beneficio => (

                                <CardBeneficio
                                    key={beneficio.id}
                                    beneficio={beneficio}
                                    onVerDetalhes={abrirEdicao}
                                />

                            ))}

                        </div>

                    ) : (

                        <div className="beneficios-vazios">

                            <h3>
                                Nenhum benefício encontrado
                            </h3>

                            <p>
                                Tente alterar a pesquisa ou os filtros
                                selecionados.
                            </p>

                        </div>

                    )}

                </>

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Beneficios;
