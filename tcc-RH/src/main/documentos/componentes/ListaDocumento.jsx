
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useRef, useState } from 'react';

import CardDocumento from './CardDocumento.jsx';

import './css-componentes/listaDocumentos.css';


//----------------- COMPONENTE ------------------------------//

function ListaDocumentos({
    documentos = [],
    onVisualizar,
    itensPorPagina = 8
}) {

    //----------------- ESTADO DA PAGINAÇÃO ------------------//

    const [paginaAtual, setPaginaAtual] = useState(1);

    // Guarda a identificação dos documentos para detectar
    // quando a lista realmente muda, sem resetar a página
    // a cada renderização.
    const assinaturaAnterior = useRef('');


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


    //----------------- IDENTIFICAR MUDANÇA NA LISTA ----------//

    const assinaturaDocumentos = documentos
        .map(documento => documento.id_documento || documento.id)
        .join(',');


    //----------------- AJUSTAR PÁGINA QUANDO A LISTA MUDA ----//

    useEffect(() => {

        if (assinaturaAnterior.current !== assinaturaDocumentos) {

            assinaturaAnterior.current = assinaturaDocumentos;

            setPaginaAtual(1);

        }

    }, [assinaturaDocumentos]);


    //----------------- AJUSTAR PÁGINA SE DIMINUIR O TOTAL ----//

    useEffect(() => {

        if (totalPaginas === 0) {

            setPaginaAtual(1);

            return;

        }

        if (paginaAtual > totalPaginas) {

            setPaginaAtual(totalPaginas);

        }

    }, [totalPaginas, paginaAtual]);


    //----------------- GRUPO DE PÁGINAS ---------------------//

    // Exibe somente 5 números por vez.
    // Exemplo: 1 até 5, depois 6 até 10.
    const paginasPorGrupo = 5;

    const primeiraPaginaGrupo =
        Math.floor((paginaAtual - 1) / paginasPorGrupo) *
        paginasPorGrupo + 1;

    const ultimaPaginaGrupo = Math.min(
        primeiraPaginaGrupo + paginasPorGrupo - 1,
        totalPaginas
    );

    const paginasVisiveis = [];

    for (
        let pagina = primeiraPaginaGrupo;
        pagina <= ultimaPaginaGrupo;
        pagina++
    ) {

        paginasVisiveis.push(pagina);

    }


    //----------------- NAVEGAR PARA UMA PÁGINA ---------------//

    function mudarPagina(pagina) {

        if (pagina >= 1 && pagina <= totalPaginas) {

            setPaginaAtual(pagina);

        }

    }


    //----------------- PRÓXIMO GRUPO -------------------------//

    function proximoGrupo() {

        if (ultimaPaginaGrupo < totalPaginas) {

            // Vai diretamente para a primeira página
            // do próximo grupo.
            mudarPagina(ultimaPaginaGrupo + 1);

        }

    }


    //----------------- GRUPO ANTERIOR ------------------------//

    function grupoAnterior() {

        if (primeiraPaginaGrupo > 1) {

            // Volta para a última página do grupo anterior.
            mudarPagina(primeiraPaginaGrupo - 1);

        }

    }


    //----------------- VISUALIZAR DOCUMENTO -----------------//

    function visualizar(documento) {

        console.log('Documento selecionado:', documento);

        if (typeof onVisualizar !== 'function') {

            console.error('A função onVisualizar não foi recebida.');

            return;

        }

        onVisualizar(documento);

    }


    //----------------- PRIMEIRO REGISTRO ---------------------//

    const primeiroRegistro = documentos.length === 0
        ? 0
        : indiceInicial + 1;


    //----------------- ÚLTIMO REGISTRO ----------------------//

    const ultimoRegistro = Math.min(
        indiceFinal,
        documentos.length
    );


    //----------------- COMPONENTE VISUAL --------------------//

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
                                key={
                                    documento.id_documento ||
                                    documento.id
                                }
                                documento={documento}
                                onVisualizar={() =>
                                    visualizar(documento)
                                }
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


                        {/* GRUPO ANTERIOR */}

                        <button
                            type="button"
                            className="botao-pagina-documentos"
                            disabled={primeiraPaginaGrupo === 1}
                            onClick={grupoAnterior}
                            title="Páginas anteriores"
                        >
                            ‹
                        </button>


                        {/* NÚMEROS DAS PÁGINAS */}

                        {paginasVisiveis.map(pagina => (

                            <button
                                key={pagina}
                                type="button"
                                className={`botao-pagina-documentos ${
                                    paginaAtual === pagina
                                        ? 'pagina-documento-ativa'
                                        : ''
                                }`}
                                onClick={() => mudarPagina(pagina)}
                            >
                                {pagina}
                            </button>

                        ))}


                        {/* PRÓXIMO GRUPO */}

                        <button
                            type="button"
                            className="botao-pagina-documentos"
                            disabled={ultimaPaginaGrupo >= totalPaginas}
                            onClick={proximoGrupo}
                            title="Próximas páginas"
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
