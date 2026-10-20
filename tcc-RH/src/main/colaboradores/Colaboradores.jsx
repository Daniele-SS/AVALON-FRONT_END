//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import CadastroColaborador from './cadastroColaborador.jsx';
import EditarColaborador from './editarColaborador.jsx';
import VisualizarColaborador from './visualizarColaborador.jsx';

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

    const [colaboradorSelecionado, setColaboradorSelecionado] =
        useState(null);

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

            return dados;

        } catch (erro) {
            console.error(
                'Erro ao buscar dados dos colaboradores:',
                erro
            );

            throw erro;

        } finally {
            setCarregando(false);
        }
    }


    //----------------- INICIALIZAÇÃO -----------------------//

    useEffect(() => {
        buscarDados().catch(() => {
            // O erro já foi registrado em buscarDados.
        });
    }, []);


    //----------------- ABRIR CADASTRO -----------------------//

    function abrirCadastro() {
        setTela('cadastro');
    }


    //----------------- ABRIR VISUALIZAÇÃO ------------------//

    function abrirVisualizacao(colaborador) {
        setColaboradorSelecionado(colaborador);
        setTela('visualizacao');
    }


    //----------------- ABRIR EDIÇÃO ------------------------//

    function abrirEdicao() {
        if (!colaboradorSelecionado) {
            alert('Selecione um colaborador para editar.');
            return;
        }

        setTela('edicao');
    }


    //----------------- VOLTAR PARA LISTA -------------------//

    function voltarParaLista() {
        setTela('lista');
        setColaboradorSelecionado(null);
    }


    //----------------- VOLTAR PARA VISUALIZAÇÃO -------------//

    function voltarParaVisualizacao() {
        setTela('visualizacao');
    }


    //----------------- ATUALIZAR APÓS A EDIÇÃO --------------//

    async function atualizarDadosDepoisDaEdicao(idColaborador) {
        try {
            const dadosAtualizados = await buscarDadosColaboradores();

            const listaColaboradores =
                dadosAtualizados.colaboradores || [];

            const listaUsuarios =
                dadosAtualizados.usuarios || [];

            setColaboradores(listaColaboradores);
            setUsuarios(listaUsuarios);

            const colaboradoresComInformacoes =
                montarInformacoesColaboradores(
                    listaColaboradores,
                    listaUsuarios
                );

            const colaboradorAtualizado =
                colaboradoresComInformacoes.find((item) => {
                    const id =
                        item.id_colaborador ??
                        item.id ??
                        item.idColaborador;

                    return String(id) === String(idColaborador);
                });

            if (colaboradorAtualizado) {
                setColaboradorSelecionado(colaboradorAtualizado);
            }

        } catch (erro) {
            console.error(
                'Erro ao atualizar os dados após a edição:',
                erro
            );

            alert(
                'As alterações foram enviadas, mas não foi possível atualizar a visualização. Tente abrir o colaborador novamente.'
            );
        }
    }


    //----------------- LOCALIZAR USUÁRIO --------------------//

    function localizarUsuarioDoColaborador(colaborador) {
        if (!colaborador) {
            return null;
        }

        const idColaborador =
            colaborador.id_colaborador ??
            colaborador.id ??
            colaborador.idColaborador;

        return usuarios.find((usuario) => {

            // Algumas respostas podem trazer o vínculo diretamente.
            const idDireto =
                usuario.id_colaborador ??
                usuario.idColaborador;

            if (
                idDireto != null &&
                String(idDireto) === String(idColaborador)
            ) {
                return true;
            }

            // Outras respostas trazem os colaboradores relacionados.
            let colaboradoresUsuario = usuario.colaborador || [];

            if (!Array.isArray(colaboradoresUsuario)) {
                colaboradoresUsuario = [colaboradoresUsuario];
            }

            return colaboradoresUsuario.some((item) => {
                const id =
                    item.id_colaborador ??
                    item.id ??
                    item.idColaborador;

                return String(id) === String(idColaborador);
            });
        }) || null;
    }


    //----------------- EXIBIR CADASTRO ---------------------//

    if (tela === 'cadastro') {
        return (
            <CadastroColaborador
                onVoltar={voltarParaLista}
                onSalvar={buscarDados}
            />
        );
    }


//----------------- EXIBIR EDIÇÃO -----------------------//

if (tela === 'edicao') {

    const usuarioSelecionado =
        colaboradorSelecionado?.usuario || null;

    return (
        <EditarColaborador
            colaborador={colaboradorSelecionado}
            usuario={usuarioSelecionado}
            voltar={voltarParaVisualizacao}
            onSalvar={atualizarDadosDepoisDaEdicao}
        />
    );
}


    //----------------- EXIBIR VISUALIZAÇÃO -----------------//

    if (tela === 'visualizacao') {
        return (
            <VisualizarColaborador
                colaborador={colaboradorSelecionado}
                voltar={voltarParaLista}
                onEditar={abrirEdicao}
            />
        );
    }


    //----------------- CONTAGEM DOS COLABORADORES -----------//

    const ativos = colaboradores.filter((colaborador) => {
        return String(colaborador.status)
            .trim()
            .toLowerCase() === 'ativo';
    }).length;

    const inativos = colaboradores.filter((colaborador) => {
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
        criarColunasColaboradores(abrirVisualizacao);


    //----------------- TELA PRINCIPAL -----------------------//

    return (
        <>
            <BotaoCadastro
                titulo="Colaboradores"
                descricao="Gerencie os dados cadastrais e os vínculos dos colaboradores da empresa."
                textoBotao="Novo colaborador"
                onClick={abrirCadastro}
            />

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

            <Filtro
                titulo="Pesquisar colaborador"
                placeholder="Buscar por nome ou matrícula"
                nomeDropdown="Colaborador"
                opcoesDropdown={colaboradoresComInformacoes}
                onFiltrosChange={receberFiltros}
            />

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

export default Colaboradores;