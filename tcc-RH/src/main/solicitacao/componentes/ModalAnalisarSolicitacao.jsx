
import { useState } from 'react';
import analisarSolicitacao from '../servicos/analisarSolicitacaoApi';
import './css-componentes/modalAnalisarSolicitacao.css';

function obterColaborador(ferias) {
    return Array.isArray(ferias.colaborador)
        ? ferias.colaborador[0] || {}
        : ferias.colaborador || {};
}

function formatarData(data) {
    if (!data) return '--/--/----';

    const partes = String(data).slice(0, 10).split('-');

    if (partes.length !== 3) return String(data);

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function ModalAnalisarSolicitacao({
    solicitacao,
    onFechar,
    onConcluida
}) {
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    if (!solicitacao) return null;

    const colaborador = obterColaborador(solicitacao);

    const nome =
        colaborador.nome ||
        colaborador.nome_completo ||
        colaborador.nome_colaborador ||
        'Colaborador';

    async function decidirSolicitacao(status) {
        setErro('');
        setCarregando(true);

        try {
            await analisarSolicitacao(solicitacao, status);

            if (onConcluida) {
                await onConcluida(status);
            }

            onFechar();
        } catch (erro) {
            setErro(erro.message || 'Não foi possível analisar a solicitação.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div
            className="solicitacao-modal-fundo"
            onMouseDown={evento => {
                if (evento.target === evento.currentTarget && !carregando) {
                    onFechar();
                }
            }}
        >
            <section
                className="solicitacao-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="solicitacao-modal-titulo"
            >
                <div className="solicitacao-modal-cabecalho">
                    <div>
                        <h2 id="solicitacao-modal-titulo">
                            Analisar solicitação
                        </h2>
                        <p>Confira as informações antes de tomar uma decisão.</p>
                    </div>

                    <button
                        type="button"
                        className="solicitacao-modal-fechar"
                        onClick={onFechar}
                        disabled={carregando}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <div className="solicitacao-modal-conteudo">
                    <div className="solicitacao-modal-colaborador">
                        <span>Colaborador</span>
                        <strong>{nome}</strong>
                    </div>

                    <div className="solicitacao-modal-dados">
                        <div>
                            <span>Data de início</span>
                            <strong>
                                {formatarData(solicitacao.data_inicio)}
                            </strong>
                        </div>

                        <div>
                            <span>Data de término</span>
                            <strong>
                                {formatarData(solicitacao.data_fim)}
                            </strong>
                        </div>

                        <div>
                            <span>Duração</span>
                            <strong>
                                {solicitacao.quantidade_dias || 0} dias
                            </strong>
                        </div>
                    </div>

                    <div className="solicitacao-modal-observacao">
                        <span>Observação do colaborador</span>

                        <p>
                            {solicitacao.observacao ||
                                'Nenhuma observação informada.'}
                        </p>
                    </div>

                    {erro && (
                        <div className="solicitacao-modal-erro">
                            {erro}
                        </div>
                    )}
                </div>

                <div className="solicitacao-modal-acoes">
                    <button
                        type="button"
                        className="solicitacao-modal-botao-recusar"
                        onClick={() =>
                            decidirSolicitacao('Recusado pelo Gestor')
                        }
                        disabled={carregando}
                    >
                        {carregando ? 'Processando...' : 'Recusar'}
                    </button>

                    <button
                        type="button"
                        className="solicitacao-modal-botao-aprovar"
                        onClick={() =>
                            decidirSolicitacao('Aprovado pelo Gestor')
                        }
                        disabled={carregando}
                    >
                        {carregando ? 'Processando...' : 'Aprovar'}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ModalAnalisarSolicitacao;
