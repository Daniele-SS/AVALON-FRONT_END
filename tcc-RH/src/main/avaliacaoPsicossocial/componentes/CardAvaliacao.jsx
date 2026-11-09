//----------------- IMPORTAÇÕES -----------------------------//

import './cardAvaliacao.css';


//----------------- COMPONENTE ------------------------------//

function CardAvaliacao({
    avaliacao,
    participacoes = [],
    avaliacoesSetores = [],
    avaliacoesCargos = [],
    colaboradores = [],
    onVerDetalhes
}) {


    //----------------- STATUS DA AVALIAÇÃO -----------------//

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataInicio = avaliacao.data_inicio
        ? new Date(avaliacao.data_inicio)
        : null;

    const dataFim = avaliacao.data_fim
        ? new Date(avaliacao.data_fim)
        : null;

    if (dataInicio) dataInicio.setHours(0, 0, 0, 0);
    if (dataFim) dataFim.setHours(0, 0, 0, 0);

    let statusAvaliacao = 'Agendada';

    if (
        Number(avaliacao.status) === 1 ||
        (dataFim && hoje > dataFim)
    ) {
        statusAvaliacao = 'Encerrada';

    } else if (
        dataInicio &&
        dataFim &&
        hoje >= dataInicio &&
        hoje <= dataFim
    ) {
        statusAvaliacao = 'Em andamento';
    }


    //----------------- FORMATAÇÃO DAS DATAS ---------------//

    function formatarData(data) {

        if (!data) return 'Não informada';

        return new Date(data).toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
        });

    }


    //----------------- PARTICIPAÇÕES -----------------------//

    const participacoesAvaliacao = participacoes.filter(
        (participacao) =>
            Number(participacao.avaliacao?.id) ===
            Number(avaliacao.id)
    );


    // Quantidade de participações concluídas.

    const participacoesConcluidas = participacoesAvaliacao.filter(
        (participacao) =>
            Number(participacao.status) === 1
    ).length;


    //----------------- SETORES VINCULADOS ------------------//

    const vinculosSetor = avaliacoesSetores.filter(
        (item) =>
            Number(item.avaliacao?.id) ===
            Number(avaliacao.id)
    );

    const nomesSetores = vinculosSetor.flatMap(
        (item) => {

            return (item.setor || []).map(
                (setor) => setor.nome
            );

        }
    );


    // Guarda os IDs dos setores vinculados à avaliação.

    const idsSetores = vinculosSetor.flatMap(
        (item) => {

            return (item.setor || []).map(
                (setor) => Number(setor.id)
            );

        }
    );


    //----------------- CARGOS VINCULADOS -------------------//

    const vinculosCargo = avaliacoesCargos.filter(
        (item) =>
            Number(item.avaliacao?.id) ===
            Number(avaliacao.id)
    );

    const nomesCargos = vinculosCargo
        .map((item) => item.cargo?.nome)
        .filter(Boolean);


    // Guarda os IDs dos cargos vinculados à avaliação.

    const idsCargos = vinculosCargo
        .map((item) => Number(item.cargo?.id))
        .filter((id) => !Number.isNaN(id));


    //----------------- COLABORADORES ELEGÍVEIS --------------//

    // Considera somente colaboradores ativos.

    const colaboradoresAtivos = colaboradores.filter(
        (colaborador) =>
            colaborador.status === 'Ativo'
    );


    // Calcula o público elegível conforme a avaliação.

    let colaboradoresElegiveis = [];

    if (avaliacao.publico_selecionado === 'TODOS') {

        // Todos os colaboradores ativos.

        colaboradoresElegiveis = colaboradoresAtivos;

    } else if (avaliacao.publico_selecionado === 'SETOR') {

        // Somente colaboradores dos setores selecionados.

        colaboradoresElegiveis = colaboradoresAtivos.filter(
            (colaborador) => {

                const setoresColaborador = colaborador.setor || [];

                return setoresColaborador.some(
                    (setor) =>
                        idsSetores.includes(Number(setor.id))
                );

            }
        );

    } else if (avaliacao.publico_selecionado === 'CARGO') {

        // Somente colaboradores dos cargos selecionados.

        colaboradoresElegiveis = colaboradoresAtivos.filter(
            (colaborador) => {

                return idsCargos.includes(
                    Number(colaborador.cargo?.id)
                );

            }
        );

    }


    // Total de colaboradores que podem participar.

    const totalColaboradoresElegiveis = colaboradoresElegiveis.length;


    //----------------- PERCENTUAL DE PARTICIPAÇÃO ---------//

    const percentualParticipacao = totalColaboradoresElegiveis > 0
        ? Math.round(
            (participacoesConcluidas / totalColaboradoresElegiveis) * 100
        )
        : 0;


    //----------------- PÚBLICO DA AVALIAÇÃO ---------------//

    let publicoAvaliacao = 'Não informado';

    if (avaliacao.publico_selecionado === 'TODOS') {

        publicoAvaliacao = 'Todos os colaboradores';

    } else if (avaliacao.publico_selecionado === 'SETOR') {

        publicoAvaliacao = nomesSetores.length > 0
            ? nomesSetores.join(', ')
            : 'Setor não informado';

    } else if (avaliacao.publico_selecionado === 'CARGO') {

        publicoAvaliacao = nomesCargos.length > 0
            ? nomesCargos.join(', ')
            : 'Cargo não informado';

    }


    //----------------- TELA --------------------------------//

    return (

        <article className="card-avaliacao-psicossocial">

            {/* CABEÇALHO */}

            <div className="cabecalho-card-avaliacao">

                <div className="informacoes-superiores-avaliacao">

                    {/* STATUS */}

                    <span
                        className={`status-card-avaliacao ${
                            statusAvaliacao
                                .toLowerCase()
                                .replace(' ', '-')
                        }`}
                    >
                        {statusAvaliacao}
                    </span>


                    {/* SETOR OU CARGO */}

                    <span className="publico-card-avaliacao">

                        <span className="icone-publico-avaliacao">
                            ▦
                        </span>

                        {publicoAvaliacao}

                    </span>

                </div>

            </div>


            {/* TÍTULO */}

            <h3 className="titulo-card-avaliacao">
                {avaliacao.titulo}
            </h3>


            {/* INFORMAÇÕES DA AVALIAÇÃO */}

            <div className="informacoes-card-avaliacao">

                {/* PERÍODO DE COLETA */}

                <div className="item-informacao-avaliacao">

                    <span className="titulo-informacao-avaliacao">
                        Período de coleta
                    </span>

                    <strong className="valor-informacao-avaliacao">

                        {formatarData(avaliacao.data_inicio)}

                        {' → '}

                        {formatarData(avaliacao.data_fim)}

                    </strong>

                </div>


                {/* PÚBLICO-ALVO */}

                <div className="item-informacao-avaliacao">

                    <span className="titulo-informacao-avaliacao">
                        Público-alvo
                    </span>

                    <strong className="valor-informacao-avaliacao">
                        {totalColaboradoresElegiveis} colaboradores elegíveis
                    </strong>

                </div>

            </div>


            {/* PARTICIPAÇÃO */}

            <div className="participacao-card-avaliacao">

                <div className="cabecalho-participacao-avaliacao">

                    <span>
                        Participação registrada: {participacoesConcluidas} de {totalColaboradoresElegiveis}
                    </span>

                    <strong>
                        {percentualParticipacao}% concluído
                    </strong>

                </div>


                {/* BARRA DE PROGRESSO */}

                <div className="barra-participacao-avaliacao">

                    <div
                        className="progresso-participacao-avaliacao"
                        style={{
                            width: `${percentualParticipacao}%`
                        }}
                    />

                </div>

            </div>


            {/* RODAPÉ */}

            <div className="rodape-card-avaliacao">

                <span
                    className="detalhes-card-avaliacao"
                    onClick={onVerDetalhes}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(evento) => {

                        if (
                            evento.key === 'Enter' ||
                            evento.key === ' '
                        ) {

                            evento.preventDefault();
                            onVerDetalhes();

                        }

                    }}
                >

                    Ver acompanhamento

                    <span className="seta-detalhes-avaliacao">
                        →
                    </span>

                </span>

            </div>

        </article>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CardAvaliacao;