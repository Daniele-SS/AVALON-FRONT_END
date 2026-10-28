
/* ============================================================
   OBJETIVO: Exibir os dados e analisar uma solicitação de férias.
   ARQUIVO: componentes/solicitacao/ModalAnalisarSolicitacao.jsx
============================================================ */

import { useState } from 'react';
import './modalAnalisarSolicitacao.css';

import atualizarStatusFerias from '../../servicos/analisarFerias.js';

function ModalAnalisarSolicitacao({
    ferias,
    onFechar,
    onConcluida
}) {
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [confirmacao, setConfirmacao] = useState('');

    if (!ferias) {
        return null;
    }

    const colaborador = Array.isArray(ferias.colaborador)
        ? ferias.colaborador[0] || {}
        : ferias.colaborador || {};

    const nome =
        ferias.nome_colaborador ||
        colaborador.nome ||
        colaborador.nome_completo ||
        'Colaborador';

    const matricula =
        colaborador.matricula ||
        colaborador.id ||
        'Não informada';

    const setor =
        ferias.nome_setor ||
        colaborador.nome_setor ||
        colaborador.setor?.nome ||
        'Não informado';

    const observacao =
        ferias.observacao ||
        'Nenhuma mensagem foi anexada à solicitação.';

    function formatarData(data) {
        if (!data) return 'Não informada';

        const texto = String(data);
        const dataSimples = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (dataSimples) {
            return `${dataSimples[3]}/${dataSimples[2]}/${dataSimples[1]}`;
        }

        const convertida = new Date(data);

        if (Number.isNaN(convertida.getTime())) {
            return 'Não informada';
        }

        return convertida.toLocaleDateString('pt-BR');
    }

    function gerarIniciais(texto) {
        const partes = String(texto || 'Colaborador').trim().split(/\s+/);

        if (partes.length === 1) {
            return partes[0].slice(0, 2).toUpperCase();
        }

        return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
    }

    function formatarPeriodo() {
        return `${formatarData(ferias.data_inicio)} → ${formatarData(ferias.data_fim)}`;
    }

    function calcularRetorno() {
        if (!ferias.data_fim) return 'Não informado';

        const data = new Date(`${String(ferias.data_fim).slice(0, 10)}T12:00:00`);

        if (Number.isNaN(data.getTime())) return 'Não informado';

        // Considera o dia seguinte ao último dia de férias.
        data.setDate(data.getDate() + 1);

        return data.toLocaleDateString('pt-BR');
    }


async function decidirSolicitacao(novoStatus) {
    setErro('');
    setConfirmacao('');
    setCarregando(true);

    try {
        // Envia a decisão para a API.
        const resultado = await atualizarStatusFerias(
            ferias,
            novoStatus
        );

        console.log(
            'Resultado da análise de férias:',
            resultado
        );

        // Exibe a confirmação conforme a decisão realizada.
        setConfirmacao(
            novoStatus === 'Aprovado pelo RH'
                ? 'Solicitação aprovada com sucesso.'
                : 'Solicitação rejeitada com sucesso.'
        );

        // Atualiza a listagem somente após a API confirmar o sucesso.
        if (onConcluida) {
            await onConcluida();
        }

    } catch (erroRequisicao) {
        console.error(
            'Erro ao analisar solicitação de férias:',
            erroRequisicao
        );

        setErro(
            erroRequisicao.message ||
            'Não foi possível analisar a solicitação.'
        );

    } finally {
        setCarregando(false);
    }
}


    function impedirFechamento(evento) {
        evento.stopPropagation();
    }

    return (
        <div className="analise-ferias-fundo" onClick={onFechar}>
            <section
                className="analise-ferias-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="analise-ferias-titulo"
                onClick={impedirFechamento}
            >
                <button
                    type="button"
                    className="analise-ferias-fechar"
                    onClick={onFechar}
                    aria-label="Fechar análise"
                    disabled={carregando}
                >
                    ×
                </button>

                {/* IDENTIFICAÇÃO DO COLABORADOR */}
                <header className="analise-ferias-colaborador">
                    <div className="analise-ferias-avatar">
                        {colaborador.foto ? (
                            <img src={colaborador.foto} alt={`Foto de ${nome}`} />
                        ) : (
                            gerarIniciais(nome)
                        )}
                    </div>

                    <div className="analise-ferias-identificacao">
                        <span className="analise-ferias-etiqueta">
                            COLABORADOR TITULAR
                        </span>
                        <h2 id="analise-ferias-titulo">{nome}</h2>
                        <p>
                            Matrícula: {matricula}
                            <span> • </span>
                            {colaborador.tipo_vinculo || 'Vínculo não informado'}
                        </p>
                        <p className="analise-ferias-setor">Setor: {setor}</p>
                    </div>

                    <span className="analise-ferias-status-colaborador">
                        {colaborador.status || 'Ativo'}
                    </span>
                </header>

                {/* DADOS DA SOLICITAÇÃO */}
                <div className="analise-ferias-conteudo">
                    <h3 className="analise-ferias-subtitulo">
                        <span aria-hidden="true">▣</span>
                        Dados da solicitação
                    </h3>

                    <div className="analise-ferias-periodo">
                        <div className="analise-ferias-dias">
                            <strong>{ferias.quantidade_dias || 0}</strong>
                            <span>DIAS</span>
                        </div>

                        <div className="analise-ferias-periodo-texto">
                            <span>PERÍODO DE GOZO SOLICITADO</span>
                            <strong>{formatarPeriodo()}</strong>
                            <p>
                                {ferias.quantidade_dias || 0} dias solicitados
                            </p>
                        </div>

                        <div className="analise-ferias-retorno">
                            <span>RETORNO PREVISTO</span>
                            <strong>{calcularRetorno()}</strong>
                            <p>Dia seguinte ao término</p>
                        </div>
                    </div>

                    <div className="analise-ferias-metadados">
                        <div className="analise-ferias-metadado">
                            <span>DATA DE PROTOCOLO</span>
                            <strong>
                                {formatarData(
                                    ferias.data_solicitacao ||
                                    ferias.created_at ||
                                    ferias.data_criacao
                                )}
                            </strong>
                            <p>Data registrada pela solicitação</p>
                        </div>

                        <div className="analise-ferias-metadado">
                            <span>ORIGEM DO REQUERIMENTO</span>
                            <strong>
                                {ferias.origem || 'Solicitação de férias'}
                            </strong>
                            <p>{nome}</p>
                        </div>
                    </div>

                    {/* PARECER DO GESTOR: SOMENTE SE DISPONÍVEL */}
                    {(
                        ferias.parecer_gestor ||
                        ferias.observacao_gestor ||
                        ferias.nome_gestor
                    ) && (
                        <div className="analise-ferias-parecer">
                            <h4>Parecer prévio do Gestor Imediato</h4>
                            {ferias.nome_gestor && (
                                <p>{ferias.nome_gestor}</p>
                            )}
                            <p>
                                {ferias.parecer_gestor ||
                                    ferias.observacao_gestor ||
                                    'Parecer do gestor registrado.'}
                            </p>
                        </div>
                    )}

                    {/* MENSAGEM DA SOLICITAÇÃO */}
                    <div className="analise-ferias-mensagem">
                        <h4>❞ Mensagem anexada pelo colaborador</h4>
                        <p>{observacao}</p>
                    </div>

                    {erro && (
                        <p className="analise-ferias-erro" role="alert">
                            {erro}
                        </p>
                    )}

                    {confirmacao && (
                        <p className="analise-ferias-sucesso" role="status">
                            {confirmacao}
                        </p>
                    )}
                </div>

                {/* AÇÕES */}
                <footer className="analise-ferias-acoes">
                    <button
                        type="button"
                        className="analise-ferias-rejeitar"
                        onClick={() => decidirSolicitacao('Recusado pelo RH')}
                        disabled={carregando || Boolean(confirmacao)}
                    >
                        {carregando ? 'Processando...' : 'Rejeitar Solicitação'}
                    </button>

                    <button
                        type="button"
                        className="analise-ferias-aprovar"
                        onClick={() => decidirSolicitacao('Aprovado pelo RH')}
                        disabled={carregando || Boolean(confirmacao)}
                    >
                        {carregando ? 'Processando...' : 'Aprovar Solicitação'}
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default ModalAnalisarSolicitacao;
