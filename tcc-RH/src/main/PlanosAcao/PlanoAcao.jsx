
import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CardPlanoAcao from './componentes/CardPlanoAcao.jsx';

import CadastroPlanoAcao from './cadastroPlanoAcao.jsx';

import './css-planoAcao/planoAcao.css';

import filtrarPlanosAcao from './funcoes/planoAcao/filtrarPlanosAcao.js';

import montarInformacoesPlanosAcao from './funcoes/planoAcao/montarInformacoesPlanosAcao.js';

import {
    calcularIndicadoresPlanosAcao
} from './funcoes/planoAcao/calcularIndicadoresPlanosAcao.js';

import { listarPlanosAcao } from './servicos/planosAcaoApi.js';
import { listarTarefasPlano } from './servicos/tarefasPlanoApi.js';

// Ícones dos indicadores
import PlanosAtivosIcone from './img/planosAtivos-icon.svg';
import AcoesAndamentoIcone from './img/acoesAndamento-icon.svg';
import ProximosPrazosIcone from './img/proximosPrazos-icon.svg';
import AcoesAtrasadasIcone from './img/acoesAtrasadas-icon.svg';


//----------------- COMPONENTE PRINCIPAL -------------------//

function PlanoAcao() {

    //----------------- ESTADOS ------------------------------//

    const [planos, setPlanos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Controla a tela atual.
    const [telaAtual, setTelaAtual] = useState('lista');

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- CARREGAR PLANOS E TAREFAS ------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                setCarregando(true);
                setErro('');

                const [dadosPlanos, dadosTarefas] = await Promise.all([
                    listarPlanosAcao(),
                    listarTarefasPlano()
                ]);

                const planosComInformacoes =
                    montarInformacoesPlanosAcao(
                        dadosPlanos,
                        dadosTarefas
                    );

                setPlanos(planosComInformacoes);

            } catch (error) {

                setErro(
                    error.message ||
                    'Não foi possível carregar os planos de ação.'
                );

            } finally {

                setCarregando(false);

            }
        }

        carregarDados();

    }, []);


    //----------------- ABRIR CADASTRO -----------------------//

    function novoPlano() {

        setTelaAtual('cadastro');

    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    function voltarParaLista() {

        setTelaAtual('lista');

    }


    //----------------- FILTRAR PLANOS ------------------------//

    const planosFiltrados = filtrarPlanosAcao(
        planos,
        filtros
    );


    //----------------- SETORES DO DROPDOWN -------------------//

    const setores = [
        ...new Map(
            planos
                .map((plano) => {

                    const setor = Array.isArray(plano.setor)
                        ? plano.setor[0]
                        : plano.setor;

                    return setor;

                })
                .filter((setor) => setor && setor.nome)
                .map((setor) => [
                    setor.id,
                    {
                        id: setor.nome,
                        nome: setor.nome
                    }
                ])
        ).values()
    ];


    //----------------- INDICADORES ---------------------------//

    const indicadores = calcularIndicadoresPlanosAcao(planos);


    //----------------- TELA DE CADASTRO ---------------------//

    if (telaAtual === 'cadastro') {

        return (
            <CadastroPlanoAcao
                voltar={voltarParaLista}
            />
        );

    }


    //----------------- TELA PRINCIPAL ------------------------//

    return (

        <div className="tela-plano-acao">

            {/* CABEÇALHO */}

            <BotaoCadastro
                titulo="Plano de Ação"
                descricao="Transforme situações identificadas em ações acompanháveis e mensuráveis."
                textoBotao="Novo Plano"
                onClick={novoPlano}
            />


            {/* MINICARDS */}

            <div className="indicadores-plano-acao">

                <Minicards
                    icone={PlanosAtivosIcone}
                    numero={indicadores.planosAtivos}
                    informacao="Planos ativos"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={AcoesAndamentoIcone}
                    numero={indicadores.tarefasAndamento}
                    informacao="Ações em andamento"
                    corFundo="#EAF2FF"
                    layout="horizontal"
                />

                <Minicards
                    icone={ProximosPrazosIcone}
                    numero={indicadores.proximosPrazos}
                    informacao="Próximos prazos"
                    corFundo="#FFF4E5"
                    layout="horizontal"
                />

                <Minicards
                    icone={AcoesAtrasadasIcone}
                    numero={indicadores.tarefasAtrasadas}
                    informacao="Ações atrasadas"
                    corFundo="#FFECEC"
                    layout="horizontal"
                />

            </div>


            {/* FILTROS */}

            <div className="filtro-plano-acao">

                <Filtro
                    titulo="Pesquisar Plano de Ação"
                    placeholder="Buscar por nome"
                    nomeDropdown="Setor"
                    opcoesDropdown={setores}
                    onFiltrosChange={setFiltros}
                />

            </div>


            {/* LISTA DE PLANOS */}

            <div className="lista-planos-acao">

                {carregando ? (

                    <div className="mensagem-planos-vazios">
                        <p>Carregando planos de ação...</p>
                    </div>

                ) : erro ? (

                    <div className="mensagem-planos-vazios">
                        <h3>Não foi possível carregar os planos</h3>
                        <p>{erro}</p>
                    </div>

                ) : planosFiltrados.length > 0 ? (

                    planosFiltrados.map((plano) => (

                        <CardPlanoAcao
                            key={plano.id}
                            plano={plano}
                        />

                    ))

                ) : (

                    <div className="mensagem-planos-vazios">

                        <h3>Nenhum plano encontrado</h3>

                        <p>
                            Não encontramos planos de ação com os
                            filtros selecionados.
                        </p>

                    </div>

                )}

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default PlanoAcao;
