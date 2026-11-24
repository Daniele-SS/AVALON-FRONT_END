
import { useCallback, useEffect, useState } from 'react';

import '../../componentes/cardNomePag/nomePag.css';
import './css-solicitacao/solicitacao.css';

import CardSolicitacao from './componentes/CardSolicitacao';
import ModalAnalisarSolicitacao from './componentes/ModalAnalisarSolicitacao';

import buscarSolicitacoes from './servicos/solicitacaoApi';

function Solicitacao() {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const carregarSolicitacoes = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const dados = await buscarSolicitacoes();
            setSolicitacoes(dados);
        } catch (erro) {
            setErro(
                erro.message ||
                'Não foi possível carregar as solicitações.'
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarSolicitacoes();
    }, [carregarSolicitacoes]);

    async function concluirAnalise() {
        setSolicitacaoSelecionada(null);
        await carregarSolicitacoes();
    }

    return (
        <main className="solicitacao-pagina">
            <div className="card-tiulo">
                <div className="titulo-descricao">
                    <h2>Solicitações</h2>
                    <p>
                        Visualize as solicitações dos colaboradores vinculados
                        às equipes sob sua responsabilidade.
                    </p>
                </div>
            </div>

            <section className="solicitacao-listagem">
                <div className="solicitacao-listagem-cabecalho">
                    <div>
                        <h2>Solicitações pendentes</h2>
                        <p>
                            Solicitações de férias aguardando sua análise.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="solicitacao-botao-atualizar"
                        onClick={carregarSolicitacoes}
                        disabled={carregando}
                    >
                        {carregando ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </div>

                {!carregando && !erro && (
                    <div className="solicitacao-contador">
                        {solicitacoes.length === 1
                            ? '1 solicitação pendente'
                            : `${solicitacoes.length} solicitações pendentes`}
                    </div>
                )}

                {carregando && (
                    <div className="solicitacao-mensagem">
                        Carregando solicitações...
                    </div>
                )}

                {!carregando && erro && (
                    <div className="solicitacao-mensagem solicitacao-mensagem-erro">
                        <p>{erro}</p>

                        <button
                            type="button"
                            onClick={carregarSolicitacoes}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!carregando && !erro && solicitacoes.length === 0 && (
                    <div className="solicitacao-vazia">
                        <h3>Nenhuma solicitação pendente</h3>
                        <p>
                            Quando um colaborador solicitar férias,
                            a solicitação aparecerá aqui para análise.
                        </p>
                    </div>
                )}

                {!carregando && !erro && solicitacoes.length > 0 && (
                    <div className="solicitacao-lista-cards">
                        {solicitacoes.map(solicitacao => (
                            <CardSolicitacao
                                key={solicitacao.id}
                                solicitacao={solicitacao}
                                onAnalisar={setSolicitacaoSelecionada}
                            />
                        ))}
                    </div>
                )}
            </section>

            {solicitacaoSelecionada && (
                <ModalAnalisarSolicitacao
                    solicitacao={solicitacaoSelecionada}
                    onFechar={() => setSolicitacaoSelecionada(null)}
                    onConcluida={concluirAnalise}
                />
            )}
        </main>
    );
}

export default Solicitacao;
