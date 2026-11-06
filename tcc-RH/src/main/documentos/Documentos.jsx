//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Minicards from '../../componentes/minicard/minicard.jsx';
import Filtro from '../../componentes/cardFiltros/filtros.jsx';

import buscarDocumentos from './servicos/documentosApi.js';

import ListaDocumentos from './componentes/ListaDocumento.jsx';
import CadastroDocumento from './cadastroDocumento.jsx';

import calcularIndicadoresDocumentos from './funcoes/documento/calcularIndicadoresDocumentos.js';
import montarInformacoesDocumentos from './funcoes/documento/montarInformacoesDocumentos.js';
import filtrarDocumentos from './funcoes/documento/filtrarDocumentos.js';

import './css-documentos/documentos.css';


//----------------- COMPONENTE PRINCIPAL --------------------//

function Documentos() {

    //----------------- ESTADOS ----------------------------//

    const [documentos, setDocumentos] = useState([]);

    const [filtros, setFiltros] = useState({
        pesquisa: '',
        status: 'Todos',
        opcao: ''
    });

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Controla qual tela será exibida.
    const [telaAtual, setTelaAtual] = useState('lista');


    //----------------- TIPOS DE DOCUMENTOS ----------------//

    const tiposDocumento = [
        'Contrato',
        'Termo',
        'Aditivo Contratual',
        'Comunicação',
        'Recibo',
        'Avaliação',
        'Documento',
        'Política',
        'Advertência',
        'Rescisão',
        'Outros'
    ];


    //----------------- CARREGAR DOCUMENTOS ----------------//

    async function carregarDados() {

        try {

            setCarregando(true);
            setErro('');

            const dados = await buscarDocumentos();

            setDocumentos(dados);

        } catch (error) {

            console.error('Erro ao carregar documentos:', error);

            setErro(
                error.message || 'Não foi possível carregar os documentos.'
            );

        } finally {

            setCarregando(false);

        }

    }


    //----------------- CARREGAMENTO INICIAL ----------------//

    useEffect(() => {

        carregarDados();

    }, []);


    //----------------- INDICADORES -------------------------//

    const indicadores = calcularIndicadoresDocumentos(documentos);

    const informacoes = montarInformacoesDocumentos(indicadores);


    //----------------- FILTRAR DOCUMENTOS ------------------//

    const documentosFiltrados = filtrarDocumentos(
        documentos,
        filtros
    );


    //----------------- ATUALIZAR FILTROS -------------------//

    function atualizarFiltros(novosFiltros) {

        setFiltros({
            pesquisa: novosFiltros.pesquisa || '',
            status: novosFiltros.status || 'Todos',
            opcao: novosFiltros.opcao || ''
        });

    }


    //----------------- ABRIR CADASTRO -----------------------//

    function novoDocumento() {

        setTelaAtual('cadastro');

    }


    //----------------- VOLTAR PARA LISTAGEM -----------------//

    async function voltarParaLista() {

        setTelaAtual('lista');

        setFiltros({
            pesquisa: '',
            status: 'Todos',
            opcao: ''
        });

        await carregarDados();

    }


    //----------------- VISUALIZAR DOCUMENTO ----------------//

    function visualizarDocumento(documento) {

        if (!documento.caminho_arquivo) {

            alert('O caminho deste documento não foi encontrado.');

            return;

        }

        window.open(
            documento.caminho_arquivo,
            '_blank',
            'noopener,noreferrer'
        );

    }


    //----------------- TELA DE CADASTRO ---------------------//

    if (telaAtual === 'cadastro') {

        return (

            <CadastroDocumento
                voltar={voltarParaLista}
            />

        );

    }


    //----------------- TELA PRINCIPAL -----------------------//

    return (

        <div className="pagina-documentos">


            {/* CABEÇALHO DA PÁGINA */}

            <BotaoCadastro
                titulo="Documentos"
                descricao="Centralize, organize e audite os arquivos e comprovantes dos colaboradores em um repositório corporativo unificado."
                textoBotao="Novo Documento"
                onClick={novoDocumento}
            />


            {/* MINICARDS */}

            <div className="indicadores-documentos">

                {informacoes.map((informacao) => (

                    <Minicards
                        key={informacao.id}
                        icone={informacao.icone}
                        numero={informacao.numero}
                        informacao={informacao.informacao}
                        corFundo={informacao.corFundo}
                        layout="horizontal"
                    />

                ))}

            </div>


            {/* FILTROS */}

            <div className="filtros-documentos">

                <Filtro
                    titulo="Pesquisar Documento"
                    placeholder="Pesquisar por nome, colaborador ou tipo..."
                    nomeDropdown="Tipo de Documento"
                    opcoesDropdown={tiposDocumento}
                    onFiltrosChange={atualizarFiltros}
                />

            </div>


            {/* CONTEÚDO */}

            <div className="conteudo-documentos">


                {/* CARREGAMENTO */}

                {carregando && (

                    <div className="mensagem-documentos">

                        <p>Carregando documentos...</p>

                    </div>

                )}


                {/* ERRO */}

                {!carregando && erro && (

                    <div className="erro-documentos">

                        <p>{erro}</p>

                        <button
                            type="button"
                            onClick={carregarDados}
                        >
                            Tentar novamente
                        </button>

                    </div>

                )}


                {/* LISTAGEM */}

                {!carregando && !erro && (

                    <ListaDocumentos
                        documentos={documentosFiltrados}
                        onVisualizar={visualizarDocumento}
                    />

                )}

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default Documentos;