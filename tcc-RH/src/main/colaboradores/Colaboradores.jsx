
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import CadastroColaborador from './cadastroColaborador.jsx';

import buscarDadosColaboradores from './servicos/colaboradoresApi.js';

import montarInformacoesColaboradores from './funcoes/colaborador/informacoesColaboradores.js';

import filtrarColaboradores from './funcoes/colaborador/filtrarColaboradores.js';

import criarColunasColaboradores from './funcoes/colaborador/colunaColaboradores.jsx';

import './css-colaboradores/colaboradores.css';

import ColaboradoresAtivos from './img/colaboradoresAtivos-icon.svg';
import IconeColaboradores from './img/colaboradores-icon.svg';
import ColaboradoresInativos from './img/colaboradoresInativos-icon.svg';


//----------------- COMPONENTE ------------------------------//

function Colaboradores() {

    //----------------- ESTADOS -----------------------------//

    const [colaboradores, setColaboradores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [tela, setTela] = useState('lista');

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- BUSCAR DADOS ------------------------//

    async function buscarDados() {

        setCarregando(true);

        try {

            const dados = await buscarDadosColaboradores();

            setColaboradores(dados.colaboradores || []);
            setUsuarios(dados.usuarios || []);

        } catch (erro) {

            console.error(
                'Erro ao buscar dados dos colaboradores:',
                erro
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- INICIALIZAÇÃO -----------------------//

    useEffect(() => {

        buscarDados();

    }, []);


    //----------------- ABRIR CADASTRO -----------------------//

    function abrirCadastro() {

        setTela('cadastro');

    }


    //----------------- VOLTAR PARA LISTA -------------------//

    function voltarParaLista() {

        setTela('lista');

    }


    //----------------- EXIBIR CADASTRO ---------------------//

    if (tela === 'cadastro') {

        return (
            <CadastroColaborador
                onVoltar={voltarParaLista}
            />
        );

    }


    //----------------- CONTAGEM DOS COLABORADORES -----------//

    const ativos = colaboradores.filter(colaborador => {

        return String(colaborador.status)
            .trim()
            .toLowerCase() === 'ativo';

    }).length;


    const inativos = colaboradores.filter(colaborador => {

        return String(colaborador.status)
            .trim()
            .toLowerCase() === 'inativo';

    }).length;


    //----------------- INFORMAÇÕES DOS COLABORADORES --------//

    const colaboradoresComInformacoes =
        montarInformacoesColaboradores(
            colaboradores,
            usuarios
        );


    //----------------- FILTROS ------------------------------//

    function receberFiltros(novosFiltros) {

        setFiltros(novosFiltros);

    }


    const colaboradoresFiltrados = filtrarColaboradores(
        colaboradoresComInformacoes,
        filtros
    );


    //----------------- COLUNAS DA TABELA --------------------//

    const colunasColaboradores =
        criarColunasColaboradores();


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <>

            {/* CABEÇALHO */}

            <BotaoCadastro
                titulo="Colaboradores"
                descricao="Gerencie os dados cadastrais e os vínculos dos colaboradores da empresa."
                textoBotao="Novo colaborador"
                onClick={abrirCadastro}
            />


            {/* MINICARDS */}

            <div className="container-minicards">

                <Minicards
                    icone={IconeColaboradores}
                    numero={colaboradores.length}
                    informacao="Total de colaboradores cadastrados"
                    corFundo="#EFF4FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={ColaboradoresAtivos}
                    numero={ativos}
                    informacao="Total de colaboradores ativos"
                    corFundo="#E1FFEC"
                    layout="horizontal"
                />

                <Minicards
                    icone={ColaboradoresInativos}
                    numero={inativos}
                    informacao="Total de colaboradores inativos"
                    corFundo="#E5EEFF"
                    layout="horizontal"
                />

            </div>


            {/* FILTROS */}

            <Filtro
                titulo="Pesquisar colaborador"
                placeholder="Buscar por nome ou matrícula"
                nomeDropdown="Colaborador"
                opcoesDropdown={colaboradoresComInformacoes}
                onFiltrosChange={receberFiltros}
            />


            {/* CARREGAMENTO OU TABELA */}

            {carregando ? (

                <p>Carregando colaboradores...</p>

            ) : (

                <Tabela
                    titulo="Lista de Colaboradores"
                    dados={colaboradoresFiltrados}
                    colunas={colunasColaboradores}
                />

            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Colaboradores;
