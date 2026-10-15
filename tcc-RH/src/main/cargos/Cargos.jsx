//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import CadastroCargo from './cadastroCargo.jsx';
import EditarCargo from './editarCargo.jsx';

import buscarDadosCargos from './servicos/cargosApi.js';

import montarInformacoesCargos from './funcoes/cargo/montarInformacoesCargos.js';
import filtrarCargos from './funcoes/cargo/filtrarCargos.js';
import criarColunasCargos from './funcoes/cargo/colunaCargos.jsx';

import './css-cargos/cargos.css';


import CargosAtivos from './img/cargosAtivos-icon.svg';
import iconeColaboradores from './img/colaboradores-icon.svg';
import CargosInativos from './img/cargosInativos-icon.svg';

//----------------- COMPONENTE ------------------------------//

function Cargos() {

    const [cargos, setCargos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [setores, setSetores] = useState([]);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [tela, setTela] = useState('lista');
    const [cargoSelecionado, setCargoSelecionado] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    //----------------- CARREGAR DADOS ----------------------//

    async function carregarDados() {
        setCarregando(true);
        setErro('');

        try {
            const dados = await buscarDadosCargos();

            setCargos(dados.cargos);
            setColaboradores(dados.colaboradores);
            setSetores(dados.setores);
        } catch (erro) {
            setErro(erro.message || 'Não foi possível carregar os cargos.');
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    //----------------- NAVEGAÇÃO ---------------------------//

    function abrirCadastro() {
        setTela('cadastro');
    }

    function abrirEdicao(cargo) {
        setCargoSelecionado(cargo);
        setTela('edicao');
    }

    function voltarParaLista() {
        setTela('lista');
        setCargoSelecionado(null);
        carregarDados();
    }

    //----------------- FILTROS -----------------------------//

    function atualizarFiltros(novosFiltros) {
        setFiltros(novosFiltros);
    }

    //----------------- INFORMAÇÕES DA TABELA ---------------//

    const cargosComInformacoes = montarInformacoesCargos(
        cargos,
        colaboradores,
        setores
    );

    const cargosFiltrados = filtrarCargos(
        cargosComInformacoes,
        filtros
    );

    const colunas = criarColunasCargos(abrirEdicao);

    const cargosAtivos = cargos.filter(
        cargo => Number(cargo.status) === 1
    ).length;

    const cargosInativos = cargos.filter(
        cargo => Number(cargo.status) === 0
    ).length;

    //----------------- CADASTRO ----------------------------//

    if (tela === 'cadastro') {
        return <CadastroCargo voltar={voltarParaLista} />;
    }

    //----------------- EDIÇÃO ------------------------------//

    if (tela === 'edicao') {
        return (
            <EditarCargo
                cargo={cargoSelecionado}
                voltar={voltarParaLista}
            />
        );
    }

    //----------------- TELA PRINCIPAL ----------------------//


    return (
        <div className="pagina-cargos">

            <BotaoCadastro
                titulo="Cargos"
                descricao="Gerencie os cargos e acompanhe os colaboradores vinculados."
                textoBotao="Cadastrar cargo"
                onClick={abrirCadastro}
            />

            <div className="container-minicards">

                <Minicards
                    icone={CargosAtivos}
                    numero={cargos.length}
                    informacao="Total de cargos cadastrados"
                    layout="horizontal"
                />

                <Minicards
                    icone={iconeColaboradores}
                    numero={cargosAtivos}
                    informacao="Total de cargos ativos"
                    layout="horizontal"
                />

                <Minicards
                    icone={CargosInativos}
                    numero={cargosInativos}
                    informacao="Total de cargos inativos"
                    layout="horizontal"
                />

            </div>

            <Filtro
                titulo="Pesquisar Cargo"
                placeholder="Buscar por nome do cargo"
                nomeDropdown="Cargo"
                opcoesDropdown={cargos.map(cargo => ({
                    id: cargo.id,
                    nome: cargo.nome
                }))}
                onFiltrosChange={atualizarFiltros}
            />

            {erro && (
                <p className="mensagem-erro-cargos">
                    {erro}
                </p>
            )}

            {carregando ? (
                <p>Carregando cargos...</p>
            ) : (
                <Tabela
                    titulo="Lista de Cargos"
                    dados={cargosFiltrados}
                    colunas={colunas}
                />
            )}

        </div>
    );

}

//----------------- EXPORTAÇÃO ------------------------------//

export default Cargos;