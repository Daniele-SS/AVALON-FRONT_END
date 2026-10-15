
 //----------------- COLUNAS DA TABELA DE CARGOS ------------//

function criarColunasCargos(abrirEdicao) {

    return [

        {
            titulo: 'CARGO',
            campo: 'nome_cargo'
        },

        {
            titulo: 'SETOR',
            campo: 'nome_setor'
        },

        {
            titulo: 'COLABORADORES',
            campo: 'quantidade_colaboradores'
        },

        {
            titulo: 'STATUS',

            render: cargo => (

                <span
                    className={
                        Number(cargo.status) === 1
                            ? 'status status-ativo'
                            : 'status status-inativo'
                    }
                >
                    ● {Number(cargo.status) === 1 ? 'Ativo' : 'Inativo'}
                </span>

            )
        },

        {
            titulo: 'AÇÕES',

            render: cargo => (

                <button
                    type="button"
                    className="botao-visualizar"
                    onClick={() => abrirEdicao(cargo)}
                >
                    Visualizar
                </button>

            )
        }

    ];

}

//----------------- EXPORTAÇÃO ------------------------------//

export default criarColunasCargos;
