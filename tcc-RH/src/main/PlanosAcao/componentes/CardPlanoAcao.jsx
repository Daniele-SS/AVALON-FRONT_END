
import './css-componentes/cardPlanoAcao.css';

import {
    classificarPlano
} from '../funcoes/planoAcao/calcularIndicadoresPlanosAcao.js';


//----------------- FORMATAR DATA --------------------------//

function formatarData(data) {

    if (!data) {
        return 'Data não definida';
    }

    const dataSeparada = String(data).split('T')[0];
    const partes = dataSeparada.split('-');

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


//----------------- COMPONENTE -----------------------------//

function CardPlanoAcao({ plano }) {

    const setor = Array.isArray(plano.setor)
        ? plano.setor[0]
        : plano.setor;

    const fator =
        plano.psicossocial_fator?.psicossocialFator ||
        plano.psicossocial_fator ||
        null;

    const colaborador = plano.colaborador || null;

    const nomeResponsavel = colaborador?.nome ||
        'Responsável não definido';

    const nomeSetor = setor?.nome ||
        'Setor não informado';

    const nomeFator = fator?.nome ||
        'Fator psicossocial não informado';

    // Se o plano já foi concluído manualmente,
    // classificarPlano retorna Concluído.
    // A data não conclui o plano automaticamente.
    const classificacao = classificarPlano(plano);

    const iniciais =
        nomeResponsavel === 'Responsável não definido'
            ? '--'
            : nomeResponsavel
                .split(' ')
                .filter(Boolean)
                .map((nome) => nome[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();


    //----------------- PROGRESSO DAS TAREFAS ---------------//

    const tarefasPlano = Array.isArray(plano.tarefasPlano)
        ? plano.tarefasPlano
        : [];

    const totalTarefas = Number(plano.totalTarefas) ||
        tarefasPlano.length;

    const tarefasConcluidas = tarefasPlano.length > 0
        ? tarefasPlano.filter(
            (tarefa) => Number(tarefa.status) === 1
        ).length
        : Number(plano.tarefasConcluidas) || 0;

    const progresso = totalTarefas > 0
        ? Math.min(
            100,
            Math.round(
                (tarefasConcluidas / totalTarefas) * 100
            )
        )
        : 0;


    //----------------- CARD -------------------------------//

    return (

        <div className="card-plano-acao">

            {/* CLASSIFICAÇÃO E SETOR */}

            <div className="identificacao-plano">

                <span
                    className={`classificacao-plano ${classificacao.classeStatus}`}
                >

                    <span className="ponto-classificacao"></span>

                    {classificacao.statusVisual}

                </span>

                <span className="setor-plano">
                    {nomeSetor}
                </span>

            </div>


            {/* TÍTULO */}

            <h3 className="titulo-plano-acao">
                {plano.titulo || 'Plano sem título'}
            </h3>


            {/* FATOR PSICOSSOCIAL */}

            <p className="origem-plano-acao">
                Fator psicossocial: {nomeFator}
            </p>


            {/* RESPONSÁVEL E PRAZO */}

            <div className="informacoes-responsavel-plano">

                <div className="avatar-responsavel-plano">
                    {iniciais}
                </div>

                <span className="nome-responsavel-plano">
                    {nomeResponsavel}
                </span>

                <span className="data-prazo-plano">
                    <span className="icone-calendario">▣</span>

                    {formatarData(plano.data_fim)}
                </span>

            </div>


            {/* OBJETIVO */}

            {plano.objetivo && (

                <p className="origem-plano-acao">
                    Objetivo: {plano.objetivo}
                </p>

            )}


            {/* PROGRESSO DAS AÇÕES */}

            <div className="progresso-plano-acao">

                <div className="informacoes-progresso-plano">

                    <span>
                        {tarefasConcluidas} de {totalTarefas} ações
                    </span>

                    <span>
                        {progresso}%
                    </span>

                </div>

                <div
                    className="barra-progresso-plano"
                    role="progressbar"
                    aria-label="Progresso das ações do plano"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={progresso}
                >

                    <div
                        className="preenchimento-progresso-plano"
                        style={{
                            width: `${progresso}%`
                        }}
                    />

                </div>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default CardPlanoAcao;
