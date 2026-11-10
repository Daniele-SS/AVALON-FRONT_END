//----------------- IMPORTAÇÕES -----------------------------//

import './css-componentes/cardDocumento.css'


//----------------- COMPONENTE ------------------------------//

function CardDocumento({ documento, onVisualizar }) {

    //----------------- DADOS DO DOCUMENTO ------------------//

    const colaborador = documento.colaborador?.[0] || {};

    const nomeColaborador = colaborador.nome || 'Colaborador não informado';

    const setor = colaborador.setor?.[0]?.nome || 'Setor não informado';

    const cargo = colaborador.cargo?.nome || 'Cargo não informado';

    const ativo = Number(documento.ativo) === 1;

    const tipo = documento.tipo_documento || 'Outros';


    //----------------- IDENTIFICAR TIPO DO DOCUMENTO --------//

    function identificarTipo() {

        switch (tipo) {

            case 'Contrato':
            case 'Aditivo Contratual':
                return 'contrato';

            case 'Termo':
                return 'termo';

            case 'Recibo':
                return 'recibo';

            case 'Avaliação':
                return 'avaliacao';

            default:
                return 'outros';

        }

    }


    //----------------- IDENTIFICAR FORMATO DO ARQUIVO --------//

    function identificarFormatoArquivo() {

        // Utiliza o caminho do arquivo.
        // Caso não exista, utiliza o nome do documento.

        const arquivo = documento.caminho_arquivo || documento.nome || '';

        // Remove parâmetros e fragmentos de URLs.

        const caminhoLimpo = arquivo.split(/[?#]/)[0];

        // Identifica a extensão do arquivo.

        const extensao = caminhoLimpo
            .split('/')
            .pop()
            .split('.')
            .pop()
            .toLowerCase();

        switch (extensao) {

            case 'pdf':
                return 'pdf';

            case 'doc':
            case 'docx':
                return 'word';

            case 'xls':
            case 'xlsx':
            case 'csv':
                return 'excel';

            case 'ppt':
            case 'pptx':
                return 'powerpoint';

            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
            case 'bmp':
            case 'svg':
                return 'imagem';

            default:
                return null;

        }

    }


    //----------------- ÍCONE DO DOCUMENTO ------------------//

    function obterIcone() {

        const formato = identificarFormatoArquivo();

        // Formatos conhecidos.

        if (formato === 'pdf') return 'PDF';

        if (formato === 'word') return 'DOC';

        if (formato === 'excel') return 'XLS';

        if (formato === 'powerpoint') return 'PPT';

        if (formato === 'imagem') return 'IMG';


        // Formatos desconhecidos: mantém as abreviações atuais.

        const classe = identificarTipo();

        if (classe === 'contrato') return 'CON';

        if (classe === 'termo') return 'TER';

        if (classe === 'recibo') return 'REC';

        if (classe === 'avaliacao') return 'AVA';

        return 'DOC';

    }


    //----------------- CLASSE VISUAL DO ÍCONE ----------------//

    function obterClasseIcone() {

        const formato = identificarFormatoArquivo();

        // Formatos conhecidos recebem cores próprias.

        if (formato) {
            return `arquivo-${formato}`;
        }

        // Formatos desconhecidos mantêm as cores anteriores.

        return identificarTipo();

    }


    //----------------- COMPONENTE VISUAL -------------------//

    return (

        <div className={`card-documento ${!ativo ? 'documento-arquivado' : ''}`}>

            {/* ÍCONE */}

            <div className={`card-documento-icone ${obterClasseIcone()}`}>

                <span>{obterIcone()}</span>

            </div>


            {/* INFORMAÇÕES PRINCIPAIS */}

            <div className="card-documento-conteudo">

                <div className="card-documento-cabecalho">

                    <h3 title={documento.nome}>
                        {documento.nome}
                    </h3>

                    <span className={`tipo-documento ${identificarTipo()}`}>
                        {tipo.toUpperCase()}
                    </span>

                </div>


                {/* INFORMAÇÕES DO COLABORADOR */}

                <div className="card-documento-informacoes">

                    <span className="nome-colaborador" title={nomeColaborador}>
                        {nomeColaborador}
                    </span>

                    <span className="separador-documento">•</span>

                    <span title={setor}>
                        {setor}
                    </span>

                    <span className="separador-documento">•</span>

                    <span title={cargo}>
                        {cargo}
                    </span>

                </div>

            </div>


            {/* STATUS E AÇÃO */}

            <div className="card-documento-rodape">

                <span className={`status-documento ${ativo ? 'ativo' : 'arquivado'}`}>
                    {ativo ? 'Ativo' : 'Arquivado'}
                </span>

                <button
                    type="button"
                    className="botao-visualizar-documento"
                    onClick={() => onVisualizar?.(documento)}
                    title="Visualizar documento"
                >
                    Visualizar
                </button>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CardDocumento;