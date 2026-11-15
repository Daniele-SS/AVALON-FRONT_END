
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';
import AlertaNotificacao from '../../componentes/alerta/Alerta.jsx';

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

    const [alerta, setAlerta] = useState({
        tipo: '',
        mensagem: ''
    });


    //----------------- EXIBIR NOTIFICAÇÃO -------------------//

    function mostrarNotificacao(tipo, mensagem) {
        setAlerta({
            tipo,
            mensagem
        });
    }


    //----------------- FECHAR NOTIFICAÇÃO -------------------//

    function fecharNotificacao() {
        setAlerta({
            tipo: '',
            mensagem: ''
        });
    }


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
        fecharNotificacao();
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
            mostrarNotificacao(
                'atencao',
                'Selecione um colaborador para editar.'
            );

            return;
        }

        fecharNotificacao();
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

            const idDireto =
                usuario.id_colaborador ??
                usuario.idColaborador;

            if (
                idDireto != null &&
                String(idDireto) === String(idColaborador)
            ) {
                return true;
            }

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


    //----------------- ALERTA -------------------------------//

    const alertaElemento = alerta.mensagem ? (
        <AlertaNotificacao
            tipo={alerta.tipo}
            mensagem={alerta.mensagem}
            onFechar={fecharNotificacao}
        />
    ) : null;


    //----------------- EXIBIR CADASTRO ---------------------//

    if (tela === 'cadastro') {
        return (
            <>
                {alertaElemento}

                <CadastroColaborador
                    onVoltar={voltarParaLista}
                    onSalvar={buscarDados}
                    onNotificacao={mostrarNotificacao}
                />
            </>
        );
    }


    //----------------- EXIBIR EDIÇÃO -----------------------//

    if (tela === 'edicao') {
        const usuarioSelecionado =
            localizarUsuarioDoColaborador(colaboradorSelecionado);

        return (
            <>
                {alertaElemento}

                <EditarColaborador
                    colaborador={colaboradorSelecionado}
                    usuario={usuarioSelecionado}
                    voltar={voltarParaVisualizacao}
                    onSalvar={atualizarDadosDepoisDaEdicao}
                    onNotificacao={mostrarNotificacao}
                />
            </>
        );
    }


    //----------------- EXIBIR VISUALIZAÇÃO -----------------//

    if (tela === 'visualizacao') {
        return (
            <>
                {alertaElemento}

                <VisualizarColaborador
                    colaborador={colaboradorSelecionado}
                    voltar={voltarParaLista}
                    onEditar={abrirEdicao}
                />
            </>
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
            {alertaElemento}

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
