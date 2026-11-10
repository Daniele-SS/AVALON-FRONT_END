
import './css-componentes/janelaVisualizacaoDocumento.css';


//----------------- IDENTIFICAR FORMATO DO ARQUIVO ----------------//

function identificarFormato(documento, tipoArquivo) {

    const caminho = documento?.caminho_arquivo || '';

    const extensao = caminho.includes('.')
        ? caminho.split('.').pop().toLowerCase()
        : '';

    const mime = (tipoArquivo || '').toLowerCase();


    // PDF
    if (extensao === 'pdf' || mime.includes('pdf')) {
        return { nome: 'PDF', classe: 'pdf' };
    }


    // WORD
    if (
        ['doc', 'docx'].includes(extensao) ||
        mime.includes('word')
    ) {
        return { nome: 'DOC', classe: 'word' };
    }


    // EXCEL
    if (
        ['xls', 'xlsx', 'csv'].includes(extensao) ||
        mime.includes('excel') ||
        mime.includes('spreadsheet')
    ) {
        return { nome: 'XLS', classe: 'excel' };
    }


    // POWERPOINT
    if (
        ['ppt', 'pptx'].includes(extensao) ||
        mime.includes('presentation') ||
        mime.includes('powerpoint')
    ) {
        return { nome: 'PPT', classe: 'powerpoint' };
    }


    // IMAGENS
    if (
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extensao) ||
        mime.startsWith('image/')
    ) {
        return { nome: 'IMG', classe: 'imagem' };
    }


    // OUTROS FORMATOS
    return { nome: 'FILE', classe: 'outros' };

}


//----------------- COMPONENTE DE VISUALIZAÇÃO ----------------//

function JanelaVisualizacaoDocumento({
    documento,
    urlDocumento,
    tipoArquivo,
    carregando,
    erro,
    onFechar,
    onBaixar,
    onArquivar,
    onDesarquivar
}) {

    //----------------- IDENTIFICAÇÃO DO ARQUIVO ----------------//

    const formato = identificarFormato(documento, tipoArquivo);


    //----------------- VERIFICAR STATUS -----------------------//

    // 0 = Arquivado
    // 1 = Ativo
    const documentoArquivado = Number(documento?.ativo) === 0;


    //----------------- COMPONENTE ----------------------------//

    return (

        <div className="fundo-visualizacao-documento">

            <div
                className="card-visualizacao-documento"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-visualizacao-documento"
            >

                {/*----------------- CABEÇALHO -----------------*/}

                <div className="cabecalho-visualizacao-documento">

                    <div className={`icone-visualizacao-documento icone-arquivo-${formato.classe}`}>
                        <span>{formato.nome}</span>
                    </div>

                    <div className="titulo-visualizacao-documento">

                        <span className="categoria-visualizacao-documento">
                            PRÉ-VISUALIZAÇÃO
                        </span>

                        <h2 id="titulo-visualizacao-documento">
                            {documento?.nome || 'Documento'}
                        </h2>

                    </div>

                    <button
                        type="button"
                        className="fechar-visualizacao-documento"
                        onClick={onFechar}
                        title="Fechar visualização"
                    >
                        &times;
                    </button>

                </div>


                {/*----------------- ÁREA DE VISUALIZAÇÃO -----------------*/}

                <div className="area-visualizacao-documento">

                    {/* CARREGAMENTO */}

                    {carregando && (
                        <div className="mensagem-visualizacao-documento">
                            <p>Carregando documento...</p>
                        </div>
                    )}


                    {/* ERRO */}

                    {!carregando && erro && (
                        <div className="mensagem-erro-visualizacao">
                            <p>{erro}</p>
                        </div>
                    )}


                    {/* PDF */}

                    {!carregando &&
                        !erro &&
                        urlDocumento &&
                        tipoArquivo?.includes('pdf') && (

                            <iframe
                                src={urlDocumento}
                                title={`Pré-visualização de ${documento?.nome || 'documento'}`}
                                className="iframe-visualizacao-documento"
                            />
                        )
                    }


                    {/* IMAGENS */}

                    {!carregando &&
                        !erro &&
                        urlDocumento &&
                        (
                            tipoArquivo === 'imagem' ||
                            tipoArquivo?.startsWith('image/')
                        ) && (

                            <img
                                src={urlDocumento}
                                alt={documento?.nome || 'Documento'}
                                className="imagem-visualizacao-documento"
                            />
                        )
                    }


                    {/* OUTROS FORMATOS */}

                    {!carregando &&
                        !erro &&
                        urlDocumento &&
                        !tipoArquivo?.includes('pdf') &&
                        !tipoArquivo?.startsWith('image/') &&
                        tipoArquivo !== 'imagem' && (

                            <div className="documento-sem-visualizacao">

                                <p>
                                    A pré-visualização deste formato
                                    não está disponível no navegador.
                                </p>

                                <p>
                                    Baixe o documento para abrir o arquivo.
                                </p>

                            </div>
                        )
                    }

                </div>


                {/*----------------- RODAPÉ -----------------*/}

                <div className="botoes-visualizacao-documento">

                    {/* ARQUIVAR OU DESARQUIVAR */}

                    <button
                        type="button"
                        className="botao-cancelar-visualizacao"
                        onClick={
                            documentoArquivado
                                ? onDesarquivar
                                : onArquivar
                        }
                    >
                        {documentoArquivado
                            ? 'Desarquivar Documento'
                            : 'Arquivar Documento'
                        }
                    </button>


                    {/* BAIXAR DOCUMENTO */}

                    <button
                        type="button"
                        className="botao-confirmar-visualizacao"
                        onClick={onBaixar}
                        disabled={!urlDocumento}
                    >
                        Baixar documento
                    </button>

                </div>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO -------------------------------//

export default JanelaVisualizacaoDocumento;
