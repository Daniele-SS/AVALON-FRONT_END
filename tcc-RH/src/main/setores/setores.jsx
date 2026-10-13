//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import CadastroSetor from './cadastroSetor.jsx';
import EditarSetor from './editarSetor.jsx';

import buscarDadosSetores from './servicos/setoresApi.js';
import montarInformacoesSetores from './funcoes/setor/informacoesSetores.js';
import filtrarSetores from './funcoes/setor/filtrarSetores.js';
import criarColunasSetores from './funcoes/setor/colunaSetores.jsx';

import './css-setores/setores.css';

import SetoresAtivos from './img/setoresAtivos-icon.svg';
import iconeColaboradores from './img/colaboradores-icon.svg';
import SetoresInativos from './img/setoresInativos-icon.svg';


//----------------- COMPONENTE ------------------------------//

function Setores() {

    //----------------- ESTADOS -----------------------------//

    const [setores, setSetores] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [telaAtual, setTelaAtual] = useState('lista');
    const [setorSelecionado, setSetorSelecionado] = useState(null);


    //----------------- BUSCAR DADOS ------------------------//

    async function buscarDados() {

        setCarregando(true);

        try {

            const dados = await buscarDadosSetores();

            setSetores(dados.setores);
            setColaboradores(dados.colaboradores);
            setUsuarios(dados.usuarios);

        } catch (erro) {

            console.log('Erro ao buscar dados:', erro);

        } finally {

            setCarregando(false);

        }

    }


    //----------------- INICIALIZAÇÃO -----------------------//

    useEffect(() => {

        buscarDados();

    }, []);


    //----------------- NAVEGAÇÃO ----------------------------//

    function abrirCadastro() {

        setTelaAtual('cadastro');

    }


    function abrirEdicao(setor) {

        setSetorSelecionado(setor);
        setTelaAtual('edicao');

    }


    function voltarParaLista() {

        setTelaAtual('lista');
        setSetorSelecionado(null);

        buscarDados();

    }


    //----------------- CONTAGEM DOS SETORES -----------------//

    const ativos = setores.filter(
        setor => Number(setor.status) === 1
    ).length;

    const inativos = setores.filter(
        setor => Number(setor.status) === 0
    ).length;


    //----------------- INFORMAÇÕES DOS SETORES --------------//

    const setoresComInformacoes = montarInformacoesSetores(
        setores,
        colaboradores,
        usuarios
    );


    //----------------- FILTROS ------------------------------//

    function receberFiltros(novosFiltros) {

        setFiltros(novosFiltros);

    }


    const setoresFiltrados = filtrarSetores(
        setoresComInformacoes,
        filtros
    );


    //----------------- COLUNAS DA TABELA --------------------//

    const colunasSetores = criarColunasSetores(abrirEdicao);


    //----------------- CADASTRO -----------------------------//

    if (telaAtual === 'cadastro') {

        return (
            <CadastroSetor
                voltar={voltarParaLista}
            />
        );

    }


    //----------------- EDIÇÃO -------------------------------//

    if (telaAtual === 'edicao') {

        return (
            <EditarSetor
                setor={setorSelecionado}
                voltar={voltarParaLista}
            />
        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <>

            {/* CABEÇALHO */}

            <BotaoCadastro
                titulo="Setores"
                descricao="Gerencie os setores da empresa."
                textoBotao="Novo setor"
                onClick={abrirCadastro}
            />


            {/* MINICARDS */}

            <div className="container-minicards">

                <Minicards
                    icone={SetoresAtivos}
                    numero={setores.length}
                    informacao="Total de setores cadastrados"
                    corFundo="#EFF4FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={iconeColaboradores}
                    numero={ativos}
                    informacao="Total de setores ativos"
                    corFundo="#E1FFEC"
                    layout="horizontal"
                />

                <Minicards
                    icone={SetoresInativos}
                    numero={inativos}
                    informacao="Total de setores inativos"
                    corFundo="#E5EEFF"
                    layout="horizontal"
                />

            </div>


            {/* FILTROS */}

            <Filtro
                titulo="Pesquisar Setor"
                placeholder="Buscar por nome do setor"
                nomeDropdown="Setor"
                opcoesDropdown={setores}
                onFiltrosChange={receberFiltros}
            />


            {/* TABELA */}

            <Tabela
                titulo="Lista de Setores"
                dados={setoresFiltrados}
                colunas={colunasSetores}
            />


            {/* CARREGAMENTO */}

            {carregando && <p>Carregando dados...</p>}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Setores;