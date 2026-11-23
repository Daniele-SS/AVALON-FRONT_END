
import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import CardPlanoAcao from './componentes/CardPlanoAcao.jsx';

import CadastroPlanoAcao from './cadastroPlanoAcao.jsx';
import AcompanhamentoPlanoAcao from './AcompanhamentoPlanoAcao.jsx';
import PlanoAcaoGestor from './PlanoAcaoGestor.jsx';

import './css-planoAcao/planoAcao.css';

import filtrarPlanosAcao from './funcoes/planoAcao/filtrarPlanosAcao.js';

import montarInformacoesPlanosAcao from './funcoes/planoAcao/montarInformacoesPlanosAcao.js';

import {
    calcularIndicadoresPlanosAcao
} from './funcoes/planoAcao/calcularIndicadoresPlanosAcao.js';

import { listarPlanosAcao } from './servicos/planosAcaoApi.js';
import { listarTarefasPlano } from './servicos/tarefasPlanoApi.js';

import PlanosAtivosIcone from './img/planosAtivos-icon.svg';
import AcoesAndamentoIcone from './img/acoesAndamento-icon.svg';
import ProximosPrazosIcone from './img/proximosPrazos-icon.svg';
import AcoesAtrasadasIcone from './img/acoesAtrasadas-icon.svg';


//----------------- IDENTIFICAR USUÁRIO --------------------//

function obterUsuarioLogado() {

    try {

        const usuarioSalvo =
            localStorage.getItem('usuario') ||
            localStorage.getItem('usuarioLogin');

        if (!usuarioSalvo) {
            return null;
        }

        const dadosUsuario = JSON.parse(usuarioSalvo);

        let usuario =
            dadosUsuario?.usuario ||
            dadosUsuario?.response?.usuario ||
            dadosUsuario;

        if (Array.isArray(usuario)) {
            usuario = usuario[0];
        }

        return usuario || null;

    } catch (erro) {

        console.error(
            'Erro ao identificar usuário logado:',
            erro
        );

        return null;

    }

}


//----------------- IDENTIFICAR PERFIL ---------------------//

function usuarioEhGestor(usuario) {

    const nivelAcesso = usuario?.nivel_acesso;

    // Formato atual do usuário:
    // nivel_acesso: { id: 2, nome: 'Gestor', status: true }

    if (
        nivelAcesso?.nome?.toLowerCase() === 'gestor'
    ) {
        return true;
    }

    // Compatibilidade com outros formatos
    // que podem retornar o nível em uma lista.

    const niveis = Array.isArray(nivelAcesso)
        ? nivelAcesso
        : Array.isArray(nivelAcesso?.nivel_acesso)
            ? nivelAcesso.nivel_acesso
            : [];

    return niveis.some((nivel) => {

        return (
            nivel?.nome?.toLowerCase() === 'gestor' &&
            (
                nivel.status === 1 ||
                nivel.status === '1' ||
                nivel.status === true
            )
        );

    });

}


//----------------- COMPONENTE PRINCIPAL -------------------//

function PlanoAcao() {

    const usuario = obterUsuarioLogado();

    // Gestor acessa sua tela exclusiva.
    if (usuarioEhGestor(usuario)) {
        return <PlanoAcaoGestor />;
    }

    // RH continua acessando a tela administrativa.
    return <PlanoAcaoRH />;

}


//----------------- TELA DO RH -----------------------------//

function PlanoAcaoRH() {

    const [planos, setPlanos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [telaAtual, setTelaAtual] = useState('lista');

    const [planoSelecionado, setPlanoSelecionado] = useState(null);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- ATUALIZAR PLANO NA LISTA ------------//

    function atualizarPlanoNaLista(planoAtualizado) {

        setPlanos((planosAtuais) =>
            planosAtuais.map((plano) =>
                String(plano.id) === String(planoAtualizado.id)
                    ? {
                        ...plano,
                        ...planoAtualizado
                    }
                    : plano
            )
        );

        // Também atualiza o plano que está aberto no modal.
        setPlanoSelecionado((planoAtual) => {

            if (
                planoAtual &&
                String(planoAtual.id) === String(planoAtualizado.id)
            ) {
                return {
                    ...planoAtual,
                    ...planoAtualizado
                };
            }

            return planoAtual;

        });

    }


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


    //----------------- ACOMPANHAMENTO ------------------------//

    function abrirAcompanhamento(plano) {
        setPlanoSelecionado(plano);
    }

    function fecharAcompanhamento() {
        setPlanoSelecionado(null);
    }

    function voltarParaLista() {
        setTelaAtual('lista');
    }


    //----------------- FILTROS -------------------------------//

    const planosFiltrados = filtrarPlanosAcao(
        planos,
        filtros
    );


    //----------------- SETORES -------------------------------//

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


    //----------------- CADASTRO ------------------------------//

    if (telaAtual === 'cadastro') {

        return (
            <CadastroPlanoAcao
                voltar={voltarParaLista}
            />
        );

    }


    //----------------- TELA DO RH -----------------------------//

    return (

        <div className="tela-plano-acao">

            <BotaoCadastro
                titulo="Plano de Ação"
                descricao="Transforme situações identificadas em ações acompanháveis e mensuráveis."
                textoBotao="Novo Plano"
                onClick={novoPlano}
            />


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


            <div className="filtro-plano-acao">

                <Filtro
                    titulo="Pesquisar Plano de Ação"
                    placeholder="Buscar por nome"
                    nomeDropdown="Setor"
                    opcoesDropdown={setores}
                    onFiltrosChange={setFiltros}
                />

            </div>


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
                            onClick={() => abrirAcompanhamento(plano)}
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


            {planoSelecionado && (

                <AcompanhamentoPlanoAcao
                    plano={planoSelecionado}
                    perfil="RH"
                    onFechar={fecharAcompanhamento}
                    onPlanoAtualizado={atualizarPlanoNaLista}
                />

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default PlanoAcao;
