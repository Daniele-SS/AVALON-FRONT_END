//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import {
    buscarDadosCadastro,
    cadastrarCargo
} from './servicos/cadastroCargoApi.js';

import validarCargo from './funcoes/cadastroCargo/validarCargo.js';

import './css-cargos/cadastroCargo.css';


//----------------- COMPONENTE ------------------------------//

function CadastroCargo({ voltar }) {

    //----------------- ESTADOS -----------------------------//

    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(1);

    const [cargos, setCargos] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    // Erros individuais dos campos
    const [erroNome, setErroNome] = useState('');
    const [erroCodigo, setErroCodigo] = useState('');


    //----------------- BUSCAR DADOS ------------------------//

    useEffect(() => {

        async function carregarCargos() {

            try {

                const dadosCargos = await buscarDadosCadastro();

                setCargos(dadosCargos);

            } catch (erroApi) {

                setErro(
                    erroApi.message || 'Não foi possível carregar os cargos.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarCargos();

    }, []);


    //----------------- ALTERAR NOME -------------------------//

    function alterarNome(valor) {

        setNome(valor);

        // Limpa o erro visual ao começar a digitar
        if (erroNome) {

            setErroNome('');

        }

        setErro('');
        setSucesso('');

    }


    //----------------- ALTERAR CÓDIGO -----------------------//

    function alterarCodigo(valor) {

        setCodigo(valor.toUpperCase());

        // Limpa o erro visual ao começar a digitar
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

    function alterarStatus(novoStatus) {

        setStatus(Number(novoStatus));

        setErro('');
        setSucesso('');

    }


    //----------------- VALIDAÇÃO ---------------------------//

    const validacao = validarCargo(
        {
            nome,
            codigo,
            descricao,
            status
        },
        cargos
    );


    //----------------- CADASTRAR CARGO ---------------------//

    async function salvarCargo(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

        // Evita salvar durante o carregamento ou outro envio
        if (carregando || salvando) {

            return;

        }


        //----------------- VALIDAR DADOS -------------------//

        const resultado = validarCargo(
            {
                nome,
                codigo,
                descricao,
                status
            },
            cargos
        );


        //----------------- VALIDAR NOME --------------------//

        if (resultado.erros.nome) {

            // Mantém o texto digitado no campo
            setErroNome(resultado.erros.nome);

        } else {

            setErroNome('');

        }


        //----------------- VALIDAR CÓDIGO ------------------//

        if (resultado.erros.codigo) {

            // Mantém o texto digitado no campo
            setErroCodigo(resultado.erros.codigo);

        } else {

            setErroCodigo('');

        }


        //----------------- INTERROMPER SE INVÁLIDO ---------//

        if (!resultado.valido) {

            // Exibe erros gerais de descrição ou status
            if (
                resultado.erros.descricao ||
                resultado.erros.status
            ) {

                setErro(
                    resultado.erros.descricao ||
                    resultado.erros.status
                );

            }

            return;

        }


        //----------------- INICIAR SALVAMENTO --------------//

        setSalvando(true);

        try {

            const dadosCargo = {

                nome: nome.trim(),

                codigo: codigo.trim().toUpperCase(),

                descricao:
                    descricao.trim() ||
                    'Nenhuma descrição informada.',

                status: Number(status)

            };


            //----------------- ENVIAR PARA API --------------//

            await cadastrarCargo(dadosCargo);


            //----------------- ATUALIZAR LISTA --------------//

            const dadosCargos = await buscarDadosCadastro();

            setCargos(dadosCargos);


            //----------------- LIMPAR FORMULÁRIO ------------//

            setNome('');
            setCodigo('');
            setDescricao('');
            setStatus(1);

            setErroNome('');
            setErroCodigo('');
            setErro('');


            //----------------- EXIBIR SUCESSO ---------------//

            setSucesso('Cargo cadastrado com sucesso!');

        } catch (erroApi) {

            setErro(
                erroApi.message || 'Não foi possível cadastrar o cargo.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- TELA --------------------------------//

    return (

        <>

            {/* CABEÇALHO */}

            <div className="cabecalho-novo-cargo">

                <BotaoCadastro
                    titulo="Novo cargo"
                    descricao="Preencha as informações para cadastrar um novo cargo."
                >

                    <nav className="caminho-cadastro-cargo">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Cargos
                        </button>

                        <span className="seta">
                            &gt;
                        </span>

                        <span className="pagina-atual-cargo">
                            Novo cargo
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* FORMULÁRIO */}

            <form
                onSubmit={salvarCargo}
                noValidate
            >

                {/* INFORMAÇÕES DO CARGO */}

                <Informacoes
                    titulo="Informações do cargo"
                    descricaoCard="Preencha os dados do cargo."

                    nomeEntidade="cargo"

                    nome={nome}
                    setNome={alterarNome}
                    erroNome={erroNome}
                    limparErroNome={() => setErroNome('')}

                    codigo={codigo}
                    setCodigo={alterarCodigo}
                    erroCodigo={erroCodigo}
                    limparErroCodigo={() => setErroCodigo('')}

                    descricao={descricao}
                    setDescricao={alterarDescricao}

                    status={status}
                    setStatus={alterarStatus}

                    campos={[
                        'nome',
                        'codigo',
                        'descricao',
                        'status'
                    ]}
                />


                {/* REVISÃO DOS DADOS */}

                <Revisao
                    nome={nome}
                    codigo={codigo}
                    descricao={descricao}
                    status={status}

                    tituloNome="Nome do cargo"
                    tituloCodigo="Código do cargo"

                    mostrarResponsavel={false}

                    erro={erro}
                    sucesso={sucesso}
                />


                {/* BOTÕES */}

                <BotaoSalvarCancelar
                    onCancelar={voltar}
                    onSalvar={salvarCargo}
                    salvando={salvando}
                    textoBotao="Salvar cargo"
                />

            </form>


            {/* CARREGAMENTO */}

            {carregando && (

                <p>
                    Carregando dados...
                </p>

            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroCargo;