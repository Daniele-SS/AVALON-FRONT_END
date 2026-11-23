
import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';

import CardPlanoAcao from './componentes/CardPlanoAcao.jsx';
import AcompanhamentoPlanoAcao from './AcompanhamentoPlanoAcao.jsx';

import montarInformacoesPlanosAcao from './funcoes/planoAcao/montarInformacoesPlanosAcao.js';

import { listarPlanosAcao } from './servicos/planosAcaoApi.js';
import { listarTarefasPlano } from './servicos/tarefasPlanoApi.js';

import './css-planoAcao/planoAcaoGestor.css';


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


//----------------- IDENTIFICAR ID DO COLABORADOR -----------//

function obterIdColaborador(usuario) {

    const idColaborador =
        usuario?.id_colaborador ??
        usuario?.colaborador?.id ??
        usuario?.colaborador?.id_colaborador;

    if (
        idColaborador === undefined ||
        idColaborador === null ||
        idColaborador === ''
    ) {
        return null;
    }

    return String(idColaborador);

}


//----------------- IDENTIFICAR RESPONSÁVEL DO PLANO -------//

function obterIdResponsavelPlano(plano) {

    const colaborador = Array.isArray(plano?.colaborador)
        ? plano.colaborador[0]
        : plano?.colaborador;

    const idResponsavel =
        plano?.id_colaborador ??
        plano?.id_responsavel ??
        plano?.id_responsavel_plano ??
        colaborador?.id ??
        colaborador?.id_colaborador;

    if (
        idResponsavel === undefined ||
        idResponsavel === null ||
        idResponsavel === ''
    ) {
        return null;
    }

    return String(idResponsavel);

}


//----------------- COMPONENTE PRINCIPAL -------------------//

function PlanoAcaoGestor() {

    const [planos, setPlanos] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');

    const [planoSelecionado, setPlanoSelecionado] = useState(null);



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

    }

    //----------------- CARREGAR PLANOS E TAREFAS ------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                setCarregando(true);
                setErro('');

                const usuario = obterUsuarioLogado();

                const idColaborador =
                    obterIdColaborador(usuario);

                // Não carrega planos sem identificar o Gestor.
                if (!idColaborador) {

                    setPlanos([]);

                    setErro(
                        'Não foi possível identificar o colaborador Gestor logado.'
                    );

                    return;

                }

                const [dadosPlanos, dadosTarefas] = await Promise.all([
                    listarPlanosAcao(),
                    listarTarefasPlano()
                ]);

                const planosComInformacoes =
                    montarInformacoesPlanosAcao(
                        dadosPlanos,
                        dadosTarefas
                    );

                // Mostra somente planos atribuídos
                // ao colaborador Gestor logado.
                const planosDoGestor =
                    planosComInformacoes.filter((plano) => {

                        const idResponsavel =
                            obterIdResponsavelPlano(plano);

                        return idResponsavel === idColaborador;

                    });

                setPlanos(planosDoGestor);

            } catch (error) {

                console.error(
                    'Erro ao carregar planos do Gestor:',
                    error
                );

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


    //----------------- ACOMPANHAMENTO ------------------------//

    function abrirAcompanhamento(plano) {
        setPlanoSelecionado(plano);
    }

    function fecharAcompanhamento() {
        setPlanoSelecionado(null);
    }


    //----------------- COMPONENTE ---------------------------//

    return (

        <div className="tela-plano-acao-gestor">

            <BotaoCadastro
                titulo="Plano de Ação"
                descricao="Acompanhe os planos de ação e as tarefas da sua equipe."
            />


            <div className="lista-plano-acao-gestor">

                {carregando ? (

                    <div className="mensagem-plano-gestor">
                        <p>Carregando seus planos de ação...</p>
                    </div>

                ) : erro ? (

                    <div className="mensagem-plano-gestor mensagem-plano-gestor-erro">

                        <h3>Não foi possível carregar os planos</h3>

                        <p>{erro}</p>

                    </div>

                ) : planos.length > 0 ? (

                    planos.map((plano) => (

                        <CardPlanoAcao
                            key={plano.id}
                            plano={plano}
                            onClick={() => abrirAcompanhamento(plano)}
                        />

                    ))

                ) : (

                    <div className="mensagem-plano-gestor">

                        <h3>Nenhum plano atribuído</h3>

                        <p>
                            Você ainda não possui planos de ação atribuídos
                            para acompanhar.
                        </p>

                    </div>

                )}

            </div>


            {planoSelecionado && (

                <AcompanhamentoPlanoAcao
                    plano={planoSelecionado}
                    perfil="Gestor"
                    onFechar={fecharAcompanhamento}
                    onPlanoAtualizado={atualizarPlanoNaLista}
                />

            )}

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default PlanoAcaoGestor;
