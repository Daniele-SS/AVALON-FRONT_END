//----------------- IMPORTAÇÕES -----------------------------//

import { useState } from 'react';

import './modalSolicitacoes.css';

import AnalisarIcone from '../../img/analisar-icon.svg';
import SolicitacaoIcone from '../../img/solicitcao-icon.svg';
import Filtro from '../../../../componentes/cardFiltros/filtros.jsx';


//----------------- COMPONENTE ------------------------------//

function ModalSolicitacoes({
    solicitacoes = [],
    onFechar,
    onAnalisar
}) {

    //----------------- ESTADOS -----------------------------//

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });


    //----------------- GERAR INICIAIS -----------------------//

    // Gera as iniciais do nome do colaborador.
    function gerarIniciais(nome) {

        if (!nome) {
            return '??';
        }

        const partesNome = nome.trim().split(/\s+/);

        if (partesNome.length === 1) {
            return partesNome[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            partesNome[0][0] +
            partesNome[partesNome.length - 1][0]
        ).toUpperCase();
    }


    //----------------- FORMATAR DATA ------------------------//

    // Formata a data de abertura.
    function formatarData(data) {

        if (!data) {
            return 'Não informada';
        }

        const textoData = String(data);

        // Evita problemas de fuso horário com YYYY-MM-DD.
        const dataSimples = textoData.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

        if (dataSimples) {
            return `${dataSimples[3]}/${dataSimples[2]}/${dataSimples[1]}`;
        }

        const dataConvertida = new Date(data);

        if (Number.isNaN(dataConvertida.getTime())) {
            return 'Não informada';
        }

        return dataConvertida.toLocaleDateString('pt-BR');
    }


    //----------------- IMPEDIR FECHAMENTO -------------------//

    // Impede que o clique dentro do modal feche o fundo.
    function impedirFechamento(evento) {
        evento.stopPropagation();
    }


    //----------------- ATUALIZAR PESQUISA -------------------//

    // Recebe os filtros atualizados do componente Filtro.
    function atualizarFiltros(novosFiltros) {

        setFiltros(novosFiltros);

    }


    //----------------- FILTRAR SOLICITAÇÕES -----------------//

    // Filtra por nome, matrícula ou setor enquanto digita.
    const solicitacoesFiltradas = solicitacoes.filter((solicitacao) => {

        const pesquisa = String(
            filtros.pesquisa || ''
        )
            .trim()
            .toLowerCase();

        // Se a pesquisa estiver vazia, mostra todas.
        if (!pesquisa) {
            return true;
        }

        const nome = String(
            solicitacao.nome || ''
        ).toLowerCase();

        const matricula = String(
            solicitacao.codigo || ''
        ).toLowerCase();

        const setor = String(
            solicitacao.setor || ''
        ).toLowerCase();

        return (
            nome.includes(pesquisa) ||
            matricula.includes(pesquisa) ||
            setor.includes(pesquisa)
        );

    });


    //----------------- RETORNO ------------------------------//

    return (

        <div
            className="modal-solicitacoes-fundo"
            onClick={onFechar}
        >

            <div
                className="modal-solicitacoes"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-solicitacoes"
                onClick={impedirFechamento}
            >

                {/* CABEÇALHO */}

                <div className="modal-solicitacoes-cabecalho">

                    {/* TÍTULO */}

                    <div className="modal-solicitacoes-titulo">

                        <div className="modal-solicitacoes-icone">

                            <img
                                src={SolicitacaoIcone}
                                alt=""
                            />

                        </div>

                        <h2 id="titulo-modal-solicitacoes">
                            Solicitações aguardando análise
                        </h2>

                    </div>


                    {/* BOTÃO FECHAR */}

                    <button
                        type="button"
                        className="modal-solicitacoes-fechar"
                        onClick={onFechar}
                        aria-label="Fechar solicitações"
                    >
                        ×
                    </button>


                    {/* PESQUISA ABAIXO DO TÍTULO */}

                    <div className="modal-solicitacoes-pesquisa">

                        <Filtro
                            titulo="Pesquisar solicitações"
                            placeholder="Buscar por nome, matrícula ou setor"
                            mostrarStatus={false}
                            onFiltrosChange={atualizarFiltros}
                        />

                    </div>

                </div>


                {/* LISTA DE SOLICITAÇÕES */}

                <div className="modal-solicitacoes-lista">

                    {solicitacoesFiltradas.length > 0 ? (

                        solicitacoesFiltradas.map((solicitacao) => (

                            <article
                                className="modal-solicitacao-item"
                                key={solicitacao.id}
                            >

                                {/* DADOS DO COLABORADOR */}

                                <div className="modal-solicitacao-topo">

                                    <div className="modal-solicitacao-colaborador">

                                        <div className="modal-solicitacao-avatar">

                                            {solicitacao.foto ? (

                                                <img
                                                    src={solicitacao.foto}
                                                    alt={`Foto de ${solicitacao.nome}`}
                                                />

                                            ) : (

                                                gerarIniciais(solicitacao.nome)

                                            )}

                                        </div>

                                        <div className="modal-solicitacao-identificacao">

                                            <div className="modal-solicitacao-nome">

                                                <strong>
                                                    {solicitacao.nome}
                                                </strong>

                                                <span>
                                                    #{solicitacao.codigo}
                                                </span>

                                            </div>

                                            <p>
                                                Setor: {solicitacao.setor}
                                                {' • '}
                                                {solicitacao.gestorCargo || 'Gestor'}
                                                {': '}
                                                {solicitacao.gestor}
                                            </p>

                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    <span className="modal-solicitacao-status">

                                        <span className="modal-solicitacao-status-ponto"></span>

                                        Pendente de análise

                                    </span>

                                </div>


                                {/* PERÍODO E DURAÇÃO */}

                                <div className="modal-solicitacao-informacoes">

                                    <div className="modal-solicitacao-informacao">

                                        <label>
                                            Período Solicitado:
                                        </label>

                                        <strong>
                                            {solicitacao.periodo}
                                        </strong>

                                    </div>

                                    <div className="modal-solicitacao-informacao">

                                        <label>
                                            Duração &amp; Abertura:
                                        </label>

                                        <strong>
                                            {solicitacao.duracao} dias
                                            {' • '}
                                            {formatarData(solicitacao.dataAbertura)}
                                        </strong>

                                    </div>

                                </div>


                                {/* RODAPÉ */}

                                <div className="modal-solicitacao-rodape">

                                    <span className="modal-solicitacao-sem-sobreposicao">

                                        <span className="modal-solicitacao-check">
                                            ✓
                                        </span>

                                        Sem sobreposição crítica no turno

                                    </span>

                                    <button
                                        type="button"
                                        className="modal-solicitacao-analisar"
                                        onClick={() => onAnalisar?.(solicitacao)}
                                    >

                                        Analisar solicitação

                                        <img
                                            src={AnalisarIcone}
                                            alt=""
                                        />

                                    </button>

                                </div>

                            </article>

                        ))

                    ) : (

                        /* MENSAGEM QUANDO NÃO ENCONTRA RESULTADOS */

                        <div className="modal-solicitacoes-vazio">

                            <p>
                                {solicitacoes.length > 0
                                    ? 'Nenhuma solicitação encontrada para essa pesquisa.'
                                    : 'Não existem solicitações aguardando análise.'}
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default ModalSolicitacoes;