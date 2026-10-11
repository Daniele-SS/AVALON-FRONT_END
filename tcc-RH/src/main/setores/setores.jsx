import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import './css-setores/setores.css';

import SetoresAtivos from './img/setoresAtivos-icon.svg';
import iconeColaboradores from './img/colaboradores-icon.svg';
import SetoresInativos from './img/setoresInativos-icon.svg';

function Setores() {

    // Guarda os setores recebidos da API.
    const [setores, setSetores] = useState([]);

    // Guarda os filtros selecionados.
    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    // Busca os setores na API.
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

    // Ação do botão Novo setor.
    function novoSetor() {
        console.log('Botão Novo Setor clicado!');
    }

    // Atualiza os filtros.
    function receberFiltros(novosFiltros) {
        setFiltros(novosFiltros);
    }

    // Conta os setores ativos.
    const ativos = setores.filter(setor => setor.status === 1).length;

    // Conta os setores inativos.
    const inativos = setores.filter(setor => setor.status === 0).length;

    return (
        <>
            <BotaoCadastro
                titulo="Setores"
                descricao="Gerencie os setores da empresa."
                textoBotao="Novo setor"
                onClick={novoSetor}
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
        </>
    );
}

export default Setores;