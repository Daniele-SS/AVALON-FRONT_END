//----------------- IMPORTAÇÕES ----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import CadastroSetor from './cadastroSetor.jsx';
import EditarSetor from './editarSetor.jsx';

import './css-setores/setores.css';

import SetoresAtivos from './img/setoresAtivos-icon.svg';
import iconeColaboradores from './img/colaboradores-icon.svg';
import SetoresInativos from './img/setoresInativos-icon.svg';


//----------------- API ------------------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- COMPONENTE -----------------------------//

function Setores() {

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

            const respostaSetores = await fetch(`${API}/setor`);
            const respostaColaboradores = await fetch(`${API}/colaborador`);
            const respostaUsuarios = await fetch(`${API}/usuario`);

            if (
                !respostaSetores.ok ||
                !respostaColaboradores.ok ||
                !respostaUsuarios.ok
            ) {
                throw new Error('Não foi possível carregar os dados.');
            }

            const dadosSetores = await respostaSetores.json();
            const dadosColaboradores = await respostaColaboradores.json();
            const dadosUsuarios = await respostaUsuarios.json();

            setSetores(dadosSetores.response?.setor || []);
            setColaboradores(dadosColaboradores.response?.colaborador || []);
            setUsuarios(dadosUsuarios.response?.usuario || []);

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


    //----------------- ABRIR EDIÇÃO ------------------------//

    function abrirEdicao(setor) {

        setSetorSelecionado(setor);
        setTelaAtual('edicao');

    }


    //----------------- VOLTAR PARA LISTA -------------------//

    function voltarParaLista() {

        setTelaAtual('lista');
        setSetorSelecionado(null);

        buscarDados();

    }


    //----------------- CONTAGEM DOS SETORES ----------------//

    const ativos = setores.filter(
        setor => Number(setor.status) === 1
    ).length;

    const inativos = setores.filter(
        setor => Number(setor.status) === 0
    ).length;


    //----------------- MONTAR DADOS DA TABELA --------------//

    const setoresComInformacoes = setores.map(setor => {

        // Busca os colaboradores deste setor
        const colaboradoresSetor = colaboradores.filter(colaborador => {

            const setorColaborador = Array.isArray(colaborador.setor)
                ? colaborador.setor[0]
                : colaborador.setor;

            const idSetor = colaborador.id_setor ?? setorColaborador?.id;

            return Number(idSetor) === Number(setor.id);

        });


        // Conta os cargos diferentes do setor
        const cargos = [];

        colaboradoresSetor.forEach(colaborador => {

            const classificacoes = colaborador.cargo?.classificacao || [];

            classificacoes.forEach(cargo => {

                if (!cargos.includes(cargo.id)) {
                    cargos.push(cargo.id);
                }

            });

            if (
                colaborador.id_cargo &&
                !cargos.includes(colaborador.id_cargo)
            ) {
                cargos.push(colaborador.id_cargo);
            }

        });


        // Procura o gestor responsável pelo setor
        const gestoresSetor = usuarios.filter(usuario => {

            const niveis = usuario.nivel_acesso?.nivel_acesso || [];

            const temNivelGestor = niveis.some(nivel =>
                nivel.nome === 'Gestor' &&
                Number(nivel.status) === 1
            );

            if (!temNivelGestor) {
                return false;
            }

            const colaboradoresUsuario = usuario.colaborador || [];

            return colaboradoresUsuario.some(colaboradorUsuario => {

                const colaboradorSetor = colaboradores.find(colaborador =>
                    Number(colaborador.id) === Number(colaboradorUsuario.id)
                );

                if (
                    !colaboradorSetor ||
                    colaboradorSetor.status !== 'Ativo'
                ) {
                    return false;
                }

                const setorColaborador = Array.isArray(colaboradorSetor.setor)
                    ? colaboradorSetor.setor[0]
                    : colaboradorSetor.setor;

                const idSetor =
                    colaboradorSetor.id_setor ?? setorColaborador?.id;

                return Number(idSetor) === Number(setor.id);

            });

        });


        // Nome do gestor encontrado
        const gestorResponsavel = gestoresSetor.map(usuario => {

            const colaboradorUsuario = (usuario.colaborador || []).find(item =>
                colaboradoresSetor.some(colaborador =>
                    Number(colaborador.id) === Number(item.id)
                )
            );

            return colaboradorUsuario?.nome;

        }).filter(Boolean).join(', ');


        // Retorna o setor com os dados calculados
        return {
            ...setor,

            quantidade_colaboradores: colaboradoresSetor.length,

            gestor_responsavel: gestorResponsavel || 'Não definido',

            quantidade_cargos: cargos.length,

            data_atualizacao: setor.data_atualizacao || '—'
        };

    });


   //----------------- FILTROS -----------------------------//

function receberFiltros(novosFiltros) {
    setFiltros(novosFiltros);
}

const setoresFiltrados = setoresComInformacoes.filter(setor => {

    const pesquisa = (filtros.pesquisa || '').toLowerCase().trim();

    // Pesquisa pelo nome
    const nome = (setor.nome || '').toLowerCase();

    // Pesquisa pelo código
    const codigo = String(setor.codigo || '').toLowerCase();

    // Pesquisa pelo gestor responsável
    const gestor = (setor.gestor_responsavel || '').toLowerCase();

    const correspondePesquisa =
        nome.includes(pesquisa) ||
        codigo.includes(pesquisa) ||
        gestor.includes(pesquisa);

    // Filtro por status
    const correspondeStatus =
        filtros.status === 'Todos' ||
        (
            filtros.status === 'Ativos' &&
            Number(setor.status) === 1
        ) ||
        (
            filtros.status === 'Inativos' &&
            Number(setor.status) === 0
        );

    // Filtro pelo setor selecionado no dropdown
    const correspondeOpcao =
        filtros.opcao === '' ||
        String(setor.id) === String(filtros.opcao);

    return (
        correspondePesquisa &&
        correspondeStatus &&
        correspondeOpcao
    );

});

    //----------------- NAVEGAÇÃO ---------------------------//

    if (telaAtual === 'cadastro') {

        return (
            <CadastroSetor
                voltar={voltarParaLista}
            />
        );

    }

    if (telaAtual === 'edicao') {

        return (
            <EditarSetor
                setor={setorSelecionado}
                voltar={voltarParaLista}
            />
        );

    }


    //----------------- COLUNAS DA TABELA -------------------//

    const colunasSetores = [

        {
            titulo: 'SETOR',
            campo: 'nome'
        },

        {
            titulo: 'COLABORADORES',
            campo: 'quantidade_colaboradores'
        },

        {
            titulo: 'GESTOR RESPONSÁVEL',
            campo: 'gestor_responsavel'
        },

        {
            titulo: 'CARGOS',
            campo: 'quantidade_cargos'
        },


        {
            titulo: 'STATUS',

            render: setor => (
                <span
                    className={
                        Number(setor.status) === 1
                            ? 'status status-ativo'
                            : 'status status-inativo'
                    }
                >
                    ● {Number(setor.status) === 1 ? 'Ativo' : 'Inativo'}
                </span>
            )
        },

        {
            titulo: 'AÇÕES',

            render: setor => (
                <button
                    type="button"
                    className="botao-visualizar"
                    onClick={() => abrirEdicao(setor)}
                >
                    Visualizar
                </button>
            )
        }

    ];


    //----------------- TELA PRINCIPAL ---------------------//

    return (
        <>

            <BotaoCadastro
                titulo="Setores"
                descricao="Gerencie os setores da empresa."
                textoBotao="Novo setor"
                onClick={() => setTelaAtual('cadastro')}
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


            {carregando && <p>Carregando dados...</p>}

        </>
    );

}


//----------------- EXPORTAÇÃO ----------------------------//

export default Setores;