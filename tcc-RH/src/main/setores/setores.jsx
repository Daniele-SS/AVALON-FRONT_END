//----------------- IMPORTAÇÕES ----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';
import Tabela from '../../componentes/cardTabela/tabela.jsx';

import CadastroSetor from './cadastroSetor.jsx';

import './css-setores/setores.css';

import SetoresAtivos from './img/setoresAtivos-icon.svg';
import iconeColaboradores from './img/colaboradores-icon.svg';
import SetoresInativos from './img/setoresInativos-icon.svg';

//----------------- FIM DAS IMPORTAÇÕES --------------------//


function Setores() {

    //----------------- VARIÁVEIS DE ESTADO -----------------//

    // Armazena os setores recebidos da API.
    const [setores, setSetores] = useState([]);

    // Armazena os valores dos filtros selecionados.
    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

   // Controla qual tela será exibida.
    const [telaAtual, setTelaAtual] = useState('lista');

    //----------------- FIM DAS VARIÁVEIS DE ESTADO --------//



    //----------------- BUSCA DOS SETORES -------------------//

    // Busca os setores cadastrados na API.
    useEffect(() => {
        fetch('http://localhost:8080/v1/senai/avalon/setor')
            .then(resposta => resposta.json())
            .then(dados => {
                setSetores(dados.response.setor);
            })
            .catch(erro => {
                console.log('Erro ao buscar setores:', erro);
            });
    }, []);

    //----------------- FIM DA BUSCA DOS SETORES ------------//


        //----------------- NAVEGAÇÃO ENTRE TELAS ---------------//

    // Exibe a tela de cadastro no lugar da listagem.
    if (telaAtual == 'cadastro') {
        return (
            <CadastroSetor
                voltar={() => setTelaAtual('lista')}
            />
        );
    }

    //----------------- FIM DA NAVEGAÇÃO --------------------//


    //----------------- ATUALIZAÇÃO DOS FILTROS -------------//

    // Recebe e atualiza os filtros selecionados.
    function receberFiltros(novosFiltros) {
        setFiltros(novosFiltros);
    }

    //----------------- FIM DA ATUALIZAÇÃO DOS FILTROS ------//


    //----------------- PARA O FILTRO -----------------------//

    // Conta os setores ativos e inativos.
    const ativos = setores.filter(setor => setor.status === 1).length;
    const inativos = setores.filter(setor => setor.status === 0).length;

    // Filtra os setores conforme os valores selecionados.
    const setoresFiltrados = setores.filter(setor => {

        // Nome do setor e texto digitado na pesquisa.
        const nome = setor.nome.toLowerCase();
        const pesquisa = filtros.pesquisa.toLowerCase();

        // Verifica se o nome corresponde à pesquisa.
        const correspondeNome = nome.includes(pesquisa);

        // Verifica se o status corresponde ao filtro.
        const correspondeStatus =
            filtros.status === 'Todos' ||
            (filtros.status === 'Ativos' && setor.status === 1) ||
            (filtros.status === 'Inativos' && setor.status === 0);

        // Verifica se o setor corresponde à opção selecionada.
        const correspondeOpcao =
            filtros.opcao === '' ||
            String(setor.id) === filtros.opcao;

        // Retorna os setores que atendem a todos os filtros.
        return correspondeNome && correspondeStatus && correspondeOpcao;
    });

    //----------------- FIM DO FILTRO -----------------------//


    //----------------- CONFIGURAÇÃO DA TABELA --------------//

    // Define as colunas e as informações exibidas na tabela.
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
            titulo: 'ATUALIZAÇÃO',
            campo: 'data_atualizacao'
        },
        {
            titulo: 'STATUS',
            render: setor => (
                <span
                    className={
                        setor.status === 1
                            ? 'status status-ativo'
                            : 'status status-inativo'
                    }
                >
                    ● {setor.status === 1 ? 'Ativo' : 'Inativo'}
                </span>
            )
        },
        {
            titulo: 'AÇÕES',
            render: setor => (
                <button
                    className="botao-visualizar"
                    onClick={() => console.log(setor)}
                >
                    Visualizar
                </button>
            )
        }
    ];

    //----------------- FIM DA CONFIGURAÇÃO DA TABELA -------//


    //----------------- EXIBIÇÃO DA PÁGINA ------------------//

    return (
        <>
            <BotaoCadastro
                titulo="Setores"
                descricao="Gerencie os setores da empresa."
                textoBotao="Novo setor"
                onClick={() => setTelaAtual('cadastro')}
            />

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

            <Filtro
                titulo="Pesquisar Setor"
                placeholder="Buscar por nome do setor"
                nomeDropdown="Setor"
                opcoesDropdown={setores}
                onFiltrosChange={receberFiltros}
            />

            <Tabela
                titulo="Lista de Setores"
                dados={setoresFiltrados}
                colunas={colunasSetores}
            />
        </>
    );

    //----------------- FIM DA EXIBIÇÃO DA PÁGINA -----------//
}


//----------------- EXPORTAÇÃO DO COMPONENTE ---------------//

export default Setores;

//----------------- FIM DA EXPORTAÇÃO ----------------------//