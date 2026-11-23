
/****************************************************************
 * Objetivo: Relacionar tarefas aos planos e montar seus dados
 *           de progresso para exibição no frontend.
 ****************************************************************/

//----------------- MONTAR INFORMAÇÕES -------------------------//

function montarInformacoesPlanosAcao(planos, tarefas) {
    return planos.map((plano) => {
        const tarefasPlano = tarefas.filter((tarefa) => {
            const idPlanoTarefa =
                tarefa.id_plano_acao ??
                tarefa.plano_acao?.id;

            return Number(idPlanoTarefa) === Number(plano.id);
        });

        const tarefasConcluidas = tarefasPlano.filter(
            (tarefa) => Number(tarefa.status) === 1
        ).length;

        const tarefasAndamento = tarefasPlano.filter(
            (tarefa) => Number(tarefa.status) === 0
        ).length;

        const totalTarefas = tarefasPlano.length;

        const progresso = totalTarefas > 0
            ? Math.round((tarefasConcluidas / totalTarefas) * 100)
            : 0;

        return {
            ...plano,
            tarefasPlano,
            totalTarefas,
            tarefasConcluidas,
            tarefasAndamento,
            progresso
        };
    });
}

//----------------- EXPORTAÇÃO ---------------------------------//

export default montarInformacoesPlanosAcao;
