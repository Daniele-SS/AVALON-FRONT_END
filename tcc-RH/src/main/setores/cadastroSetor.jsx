//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import {
    buscarDadosCadastro,
    cadastrarSetor
} from './servicos/cadastroSetorApi.js';

import validarSetor from './funcoes/cadastroSetor/validarSetor.js';

import './css-setores/cadastroSetor.css';


//----------------- COMPONENTE ------------------------------//

function CadastroSetor({ voltar }) {


    //----------------- ESTADOS -----------------------------//

    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(1);

    const [setores, setSetores] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const [erroNome, setErroNome] = useState('');
    const [erroCodigo, setErroCodigo] = useState('');


    //----------------- BUSCAR DADOS ------------------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                const dadosSetores =
                    await buscarDadosCadastro();

                setSetores(dadosSetores);

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, []);


    //----------------- ALTERAR NOME -------------------------//

    function alterarNome(valor) {

        setNome(valor);

        if (erroNome) {
            setErroNome('');
        }

        setErro('');
        setSucesso('');

    }


    //----------------- ALTERAR CÓDIGO -----------------------//

    function alterarCodigo(valor) {

        setCodigo(valor);

        if (erroCodigo) {
            setErroCodigo('');
        }

        setErro('');
        setSucesso('');

    }


    //----------------- ALTERAR DESCRIÇÃO --------------------//

    function alterarDescricao(valor) {

        setDescricao(valor);

        setErro('');
        setSucesso('');

    }


    //----------------- ALTERAR STATUS -----------------------//

    function alterarStatus(valor) {

        setStatus(valor);

        setErro('');
        setSucesso('');

    }


    //----------------- SALVAR SETOR ------------------------//

    async function salvarSetor(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');


        //----------------- VALIDAR --------------------------//

        const resultado = validarSetor(
            nome,
            codigo,
            setores
        );


        //----------------- VALIDAR NOME ---------------------//

        if (resultado.nomeComErro) {

            setErroNome(
                resultado.erroNome
            );

        } else {

            setErroNome('');

        }


        //----------------- VALIDAR CÓDIGO -------------------//

        if (resultado.codigoComErro) {

            setErroCodigo(
                resultado.erroCodigo
            );

        } else {

            setErroCodigo('');

        }


        //----------------- FORMULÁRIO INVÁLIDO -------------//

        if (
            resultado.nomeComErro ||
            resultado.codigoComErro ||
            carregando ||
            salvando
        ) {

            return;

        }


        //----------------- SALVAR ---------------------------//

        setSalvando(true);

        try {

            const dadosSetor = {

                nome: nome.trim(),

                codigo: codigo.trim(),

                descricao:
                    descricao.trim() ||
                    'Nenhuma descrição informada.',

                status: Number(status)

            };


            await cadastrarSetor(dadosSetor);


            //----------------- SUCESSO ----------------------//

            setSucesso(
                'Setor cadastrado com sucesso!'
            );


            //----------------- ATUALIZAR LISTA -------------//

            const dadosSetores =
                await buscarDadosCadastro();

            setSetores(dadosSetores);


            //----------------- LIMPAR FORMULÁRIO ------------//

            setNome('');
            setCodigo('');
            setDescricao('');
            setStatus(1);

            setErroNome('');
            setErroCodigo('');


        } catch (erroApi) {

            setErro(
                erroApi.message
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- TELA --------------------------------//

    return (

        <>

            <div className="cabecalho-novo-setor">

                <BotaoCadastro
                    titulo="Novo setor"
                    descricao="Gerencie dados cadastrais, vínculos funcionais e status operacionais dos colaboradores."
                >

                    <nav className="caminho-cadastro-setor">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Setores
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-setor">
                            Novo setor
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            <form onSubmit={salvarSetor}>


                <Informacoes

                    titulo="Informações do setor"

                    descricaoCard="Dados de identificação institucional e classificação organizacional."

                    nomeEntidade="setor"


                    /* NOME */

                    nome={nome}

                    setNome={alterarNome}

                    erroNome={erroNome}

                    limparErroNome={() =>
                        setErroNome('')
                    }


                    /* CÓDIGO */

                    codigo={codigo}

                    setCodigo={alterarCodigo}

                    erroCodigo={erroCodigo}

                    limparErroCodigo={() =>
                        setErroCodigo('')
                    }


                    /* DESCRIÇÃO */

                    descricao={descricao}

                    setDescricao={alterarDescricao}


                    /* STATUS */

                    status={status}

                    setStatus={alterarStatus}


                    /* CAMPOS */

                    campos={[
                        'nome',
                        'codigo',
                        'descricao',
                        'status'
                    ]}

                />


                <Revisao

                    nome={nome}

                    codigo={codigo}

                    descricao={descricao}

                    status={status}

                    tituloNome="Nome do setor"

                    tituloCodigo="Código do setor"

                    mostrarResponsavel={false}

                    erro={erro}

                    sucesso={sucesso}

                />


                <BotaoSalvarCancelar

                    onCancelar={voltar}

                    onSalvar={salvarSetor}

                    salvando={salvando}

                    textoBotao="Salvar setor"

                />

            </form>


            {carregando && (

                <p>
                    Carregando dados...
                </p>

            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroSetor;