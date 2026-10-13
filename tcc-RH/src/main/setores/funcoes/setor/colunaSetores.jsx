//----------------- COLUNAS DOS SETORES ---------------------//

function criarColunasSetores(abrirEdicao) {

    return [

        {
            titulo: 'SETOR',
            campo: 'nome'
        },

        {
            titulo: 'COLABORADORES',
            campo: 'quantidade_colaboradores'
        },

        {
            titulo: 'GESTOR RESPONSÁVEL',
            campo: 'gestor_responsavel'
        },

        {
            titulo: 'CARGOS',
            campo: 'quantidade_cargos'
        },

        {
            titulo: 'STATUS',

            render: setor => (

                <span
                    className={
                        Number(setor.status) === 1
                            ? 'status status-ativo'
                            : 'status status-inativo'
                    }
                >
                    ● {Number(setor.status) === 1 ? 'Ativo' : 'Inativo'}
                </span>

            )
        },

        {
            titulo: 'AÇÕES',

            render: setor => (

                <button
                    type="button"
                    className="botao-visualizar"
                    onClick={() => abrirEdicao(setor)}
                >
                    Visualizar
                </button>

            )
        }

    ];

}


//----------------- EXPORTAÇÃO ------------------------------//

export default criarColunasSetores;