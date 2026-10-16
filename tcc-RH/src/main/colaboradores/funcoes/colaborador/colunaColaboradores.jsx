//----------------- COLUNAS DOS COLABORADORES --------------//

function criarColunasColaboradores(abrirEdicao) {

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

                const statusAtivo =
                    String(colaborador.status).trim().toLowerCase() === 'ativo';

                return (

                    <span
                        className={
                            statusAtivo
                                ? 'status status-ativo'
                                : 'status status-inativo'
                        }
                    >

                        ● {statusAtivo ? 'Ativo' : 'Inativo'}

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
                    onClick={() => abrirEdicao(colaborador)}
                >
                    Visualizar
                </button>

            )
        }

    ];

}


//----------------- EXPORTAÇÃO ------------------------------//

export default criarColunasColaboradores;