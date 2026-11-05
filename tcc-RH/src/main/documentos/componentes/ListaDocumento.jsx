
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import CardDocumento from './CardDocumento.jsx';

import './listaDocumentos.css';


//----------------- COMPONENTE ------------------------------//

function ListaDocumentos({
    documentos = [],
    onVisualizar,
    itensPorPagina = 8
}) {

    //----------------- ESTADO DA PAGINAÇÃO ------------------//

    const [paginaAtual, setPaginaAtual] = useState(1);


    //----------------- CALCULAR PAGINAÇÃO ------------------//

    const totalPaginas = Math.ceil(
        documentos.length / itensPorPagina
    );

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;

    const indiceFinal = paginaAtual * itensPorPagina;

    const documentosPagina = documentos.slice(
        indiceInicial,
        indiceFinal
    );


    //----------------- AJUSTAR PÁGINA ATUAL -----------------//

    useEffect(() => {

        setPaginaAtual(1);

    }, [documentos]);


    //----------------- NAVEGAR ENTRE PÁGINAS ---------------//

    function mudarPagina(pagina) {

        if (pagina >= 1 && pagina <= totalPaginas) {

            setPaginaAtual(pagina);

        }

    }


    //----------------- PRIMEIRO REGISTRO --------------------//

    const primeiroRegistro = documentos.length === 0
        ? 0
        : indiceInicial + 1;


    //----------------- ÚLTIMO REGISTRO ----------------------//

    const ultimoRegistro = Math.min(
        indiceFinal,
        documentos.length
    );


    //----------------- COMPONENTE VISUAL -------------------//

    return (

        <section className="card-lista-documentos">


            {/* CABEÇALHO */}

            <header className="cabecalho-lista-documentos">

                <h2>Lista de Documentos</h2>

                <div className="total-documentos">

                    <span>
                        {documentos.length} resultados encontrados
                    </span>

                    <button
                        type="button"
                        className="botao-menu-documentos"
                        title="Opções da lista"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </div>

            </header>


            {/* LISTAGEM */}

            <div className="area-lista-documentos">

                {documentosPagina.length > 0 ? (

                    <div className="lista-documentos">

                        {documentosPagina.map((documento) => (

                            <CardDocumento
                                key={documento.id}
                                documento={documento}
                                onVisualizar={onVisualizar}
                            />

                        ))}

                    </div>

                ) : (

                    <div className="lista-documentos-vazia">

                        <h3>Nenhum documento encontrado</h3>

                        <p>
                            Não existem documentos disponíveis com os filtros selecionados.
                        </p>

                    </div>

                )}

            </div>


            {/* RODAPÉ E PAGINAÇÃO */}

            <footer className="rodape-lista-documentos">

                <span className="texto-paginacao-documentos">

                    Mostrando {primeiroRegistro}–{ultimoRegistro} de {documentos.length} documentos

                </span>


                {/* BOTÕES DE PAGINAÇÃO */}

                {totalPaginas > 0 && (

                    <div className="paginacao-documentos">

                        {/* VOLTAR */}

                        <button
                            type="button"
                            className="botao-pagina-documentos"
                            disabled={paginaAtual === 1}
                            onClick={() => mudarPagina(paginaAtual - 1)}
                        >
                            ‹
                        </button>


                        {/* NÚMEROS DAS PÁGINAS */}

                        {Array.from(
                            { length: totalPaginas },
                            (_, indice) => indice + 1
                        ).map(pagina => (

                            <button
                                key={pagina}
                                type="button"
                                className={`botao-pagina-documentos ${
                                    paginaAtual === pagina ? 'pagina-documento-ativa' : ''
                                }`}
                                onClick={() => mudarPagina(pagina)}
                            >
                                {pagina}
                            </button>

                        ))}


                        {/* AVANÇAR */}

                        <button
                            type="button"
                            className="botao-pagina-documentos"
                            disabled={paginaAtual >= totalPaginas}
                            onClick={() => mudarPagina(paginaAtual + 1)}
                        >
                            ›
                        </button>

                    </div>

                )}

            </footer>

        </section>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default ListaDocumentos;
