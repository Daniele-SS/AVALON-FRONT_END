import { useState } from 'react';

import './tabela.css';

function Tabela({
    titulo,
    dados = [],
    colunas = [],
    itensPorPagina = 8
}) {

    const [paginaAtual, setPaginaAtual] = useState(1);

    // Calcula a paginação.
    const totalPaginas = Math.ceil(dados.length / itensPorPagina);

    const dadosPagina = dados.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
    );

    return (
        <section className="card-tabela">

            {/* Cabeçalho */}
            <header className="cabecalho-tabela">
                <h2>{titulo}</h2>

                <span>
                    {dados.length} resultados encontrados
                </span>
            </header>

            {/* Tabela */}
            <div className="area-tabela">

                <table className="tabela">

                    <thead>
                        <tr>
                            {colunas.map(coluna => (
                                <th key={coluna.titulo}>
                                    {coluna.titulo}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>

                        {dadosPagina.map((item, indice) => (

                            <tr key={item.id ?? indice}>

                                {colunas.map(coluna => (

                                    <td key={coluna.titulo}>
                                        {coluna.render
                                            ? coluna.render(item)
                                            : item[coluna.campo] ?? '—'}
                                    </td>

                                ))}

                            </tr>

                        ))}

                        {dadosPagina.length === 0 && (
                            <tr>
                                <td colSpan={colunas.length}>
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>

            </div>

            {/* Rodapé */}
            <footer className="rodape-tabela">

                <span>
                    Mostrando {
                        dados.length === 0
                            ? 0
                            : (paginaAtual - 1) * itensPorPagina + 1
                    }–{
                        Math.min(
                            paginaAtual * itensPorPagina,
                            dados.length
                        )
                    } de {dados.length} registros
                </span>

                <div className="paginacao">

                    <button
                        disabled={paginaAtual === 1}
                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                    >
                        ‹
                    </button>

                    {Array.from(
                        { length: totalPaginas },
                        (_, indice) => indice + 1
                    ).map(pagina => (

                        <button
                            key={pagina}
                            className={
                                paginaAtual === pagina
                                    ? 'pagina-ativa'
                                    : ''
                            }
                            onClick={() => setPaginaAtual(pagina)}
                        >
                            {pagina}
                        </button>

                    ))}

                    <button
                        disabled={paginaAtual >= totalPaginas}
                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                    >
                        ›
                    </button>

                </div>

            </footer>

        </section>
    );
}

export default Tabela;