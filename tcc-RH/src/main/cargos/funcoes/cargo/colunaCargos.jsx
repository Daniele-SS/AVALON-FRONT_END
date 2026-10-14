//----------------- COLUNAS DA TABELA DE CARGOS -------------//

function criarColunasCargos(abrirEdicao) {
    return [
        {
            titulo: 'Cargo',
            campo: 'nome_cargo'
        },
        {
            titulo: 'Setor',
            campo: 'nome_setor'
        },
        {
            titulo: 'Colaboradores',
            campo: 'quantidade_colaboradores'
        },
        {
            titulo: 'Status',
            render: cargo => (
                <span
                    className={
                        Number(cargo.status) === 1
                            ? 'status-cargo ativo'
                            : 'status-cargo inativo'
                    }
                >
                    {Number(cargo.status) === 1 ? 'Ativo' : 'Inativo'}
                </span>
            )
        },
        {
            titulo: 'Visualizar',
            render: cargo => (
                <button
                    type="button"
                    className="botao-visualizar-cargo"
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