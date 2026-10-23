
 //----------------- COLUNAS DA TABELA DE FÉRIAS ------------//

 function criarColunasFerias(abrirEdicao) {

    return [

        {
            titulo: 'COLABORADORES',
            campo: 'nome_colaborador'
        },

        {
            titulo: 'SETOR',
            campo: 'nome_setor'
        },

        {
            titulo: 'CARGO',
            campo: 'nome_cargo'
        },

        {
            titulo: 'INÍCIO',
            campo: 'data_inicio_formatada'
        },

        {
            titulo: 'FIM',
            campo: 'data_fim_formatada'
        },

        {
            titulo: 'DURAÇÃO',
            campo: 'quantidade_dias',
            render: ferias => `${ferias.quantidade_dias} dias`
        },

        {
            titulo: 'STATUS',

            render: ferias => {

                const status = ferias.status || 'Pendente';

                const classeStatus = status
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '-');

                return (
                    <span className={`status status-${classeStatus}`}>
                        ● {status}
                    </span>
                );

            }
        },

        {
            titulo: 'AÇÕES',

            render: ferias => (

                <button
                    type="button"
                    className="botao-visualizar"
                    onClick={() => abrirEdicao(ferias)}
                >
                    Editar
                </button>

            )
        }

    ];

}


//----------------- EXPORTAÇÃO ------------------------------//

export default criarColunasFerias;
