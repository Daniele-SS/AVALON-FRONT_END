
/********************************************************************************
 * Objetivo: Criar as colunas da tabela Minha Equipe.
 ********************************************************************************/

function criarColunasEquipe(abrirVisualizacao) {

    return [

        //----------------- COLABORADOR ----------------------//

        {
            titulo: 'COLABORADOR',
            campo: 'nome'
        },


        //----------------- MATRÍCULA ------------------------//

        {
            titulo: 'MATRÍCULA',
            campo: 'matricula'
        },


        //----------------- CARGO ----------------------------//

        {
            titulo: 'CARGO',
            campo: 'nome_cargo'
        },


        //----------------- SETOR ----------------------------//

        {
            titulo: 'SETOR',
            campo: 'nome_setor'
        },


        //----------------- GESTOR DIRETO --------------------//

        {
            titulo: 'GESTOR DIRETO',
            campo: 'gestor_direto'
        },


        //----------------- STATUS ---------------------------//

        {
            titulo: 'STATUS',

            render: colaborador => {

                const ativo =
                    String(colaborador.status)
                        .trim()
                        .toLowerCase() === 'ativo';

                return (

                    <span className={
                        ativo
                            ? 'status status-ativo'
                            : 'status status-inativo'
                    }>

                        ● {ativo ? 'Ativo' : 'Inativo'}

                    </span>

                );

            }
        },


        //----------------- AÇÕES ----------------------------//

        {
            titulo: 'AÇÕES',

            render: colaborador => (

                <button
                    type="button"
                    className="botao-visualizar"
                    onClick={() => abrirVisualizacao(colaborador)}
                >
                    Visualizar
                </button>

            )
        }

    ];

}


//----------------- EXPORTAÇÃO ------------------------------//

export default criarColunasEquipe;
