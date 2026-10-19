//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';

import { buscarDadosCadastro } from './servicos/cadastroSetorApi.js';
import { atualizarSetor } from './servicos/editarSetorApi.js';

import validarSetor from './funcoes/editarSetor/validarSetor.js';

import './css-setores/cadastroSetor.css';


//----------------- COMPONENTE ------------------------------//

function EditarSetor({ setor, voltar }) {

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

    // Erros específicos dos campos
    const [erroNome, setErroNome] = useState('');
    const [erroCodigo, setErroCodigo] = useState('');

    // Alerta de inativação
    const [alertaAberto, setAlertaAberto] = useState(false);


    //----------------- CARREGAR SETOR ----------------------//

    useEffect(() => {

        if (setor) {

            setNome(setor.nome || '');
            setCodigo(setor.codigo || '');
            setDescricao(setor.descricao || '');
            setStatus(Number(setor.status));

            // Limpa os erros ao selecionar outro setor
            setErroNome('');
            setErroCodigo('');

            setErro('');
            setSucesso('');

            setAlertaAberto(false);

        }

    }, [setor]);


    //----------------- BUSCAR SETORES ----------------------//

    useEffect(() => {

        async function carregarSetores() {

            try {

                const dadosSetores = await buscarDadosCadastro();

                setSetores(dadosSetores);

            } catch (erroApi) {

                setErro(
                    erroApi.message || 'Não foi possível carregar os setores.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarSetores();

    }, []);


    //----------------- ALTERAR NOME -------------------------//

    function alterarNome(valor) {

        setNome(valor);

        // Remove o erro visual quando começar a digitar
        if (erroNome) {
            setErroNome('');
        }

        setErro('');
        setSucesso('');

    }


    //----------------- ALTERAR CÓDIGO -----------------------//

    function alterarCodigo(valor) {

        setCodigo(valor.toUpperCase());

        // Remove o erro visual quando começar a digitar
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


    //----------------- VALIDAÇÃO ----------------------------//

    const validacao = validarSetor(
        nome,
        codigo,
        setores,
        setor?.id ?? null
    );

    const nomeValido = validacao.nomeValido;
    const codigoValido = validacao.codigoValido;

    const nomeDuplicado = validacao.nomeDuplicado;
    const codigoDuplicado = validacao.codigoDuplicado;

    const formularioValido =
        nomeValido &&
        codigoValido &&
        !nomeDuplicado &&
        !codigoDuplicado &&
        !carregando &&
        !salvando;


    //----------------- ALTERAR STATUS -----------------------//

    function alterarStatus(novoStatus) {

        if (Number(novoStatus) === 0 && status !== 0) {

            setAlertaAberto(true);

            return;

        }

        setStatus(Number(novoStatus));

        setErro('');
        setSucesso('');

    }


    //----------------- CONFIRMAR INATIVAÇÃO -----------------//

    function confirmarInativacao() {

        setStatus(0);

        setAlertaAberto(false);

        setErro('');
        setSucesso('');

    }


    //----------------- ATUALIZAR SETOR ----------------------//

    async function salvarAlteracoes(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

        // Verifica se existe um setor selecionado
        if (!setor) {

            setErro('Nenhum setor foi selecionado para edição.');

            return;

        }

        // Impede o envio durante o carregamento ou outro salvamento
        if (carregando || salvando) {

            return;

        }

        //----------------- VALIDAR DADOS -------------------//

        const resultado = validarSetor(
            nome,
            codigo,
            setores,
            setor.id
        );


        //----------------- VALIDAR NOME --------------------//

        if (resultado.nomeComErro) {

            // Mantém o valor digitado no campo
            setErroNome(resultado.erroNome);

        } else {

            setErroNome('');

        }


        //----------------- VALIDAR CÓDIGO ------------------//

        if (resultado.codigoComErro) {

            // Mantém o valor digitado no campo
            setErroCodigo(resultado.erroCodigo);

        } else {

            setErroCodigo('');

        }


        //----------------- INTERROMPER SE INVÁLIDO ---------//

        if (
            resultado.nomeComErro ||
            resultado.codigoComErro
        ) {

            return;

        }


        //----------------- INICIAR SALVAMENTO --------------//

        setSalvando(true);

        try {

            const dadosSetor = {

                nome: nome.trim(),

                codigo: codigo.trim().toUpperCase(),

                descricao: descricao.trim() || 'Nenhuma descrição informada.',

                status: Number(status)

            };


            //----------------- ENVIAR PARA API --------------//

            await atualizarSetor(setor.id, dadosSetor);


            //----------------- SUCESSO ---------------------//

            setSucesso('Setor atualizado com sucesso!');

            setErroNome('');
            setErroCodigo('');

            voltar();

        } catch (erroApi) {

            setErro(
                erroApi.message || 'Não foi possível atualizar o setor.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- VERIFICAR SETOR ----------------------//

    if (!setor) {

        return <p>Nenhum setor foi selecionado para edição.</p>;

    }


    //----------------- TELA ---------------------------------//

    return (

        <>

            {/* CABEÇALHO */}

            <div className="cabecalho-novo-setor">

                <BotaoCadastro
                    titulo="Editar setor"
                    descricao="Atualize os dados cadastrais e o status do setor."
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
                            Editar setor
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* FORMULÁRIO */}

            <form
                onSubmit={salvarAlteracoes}
                noValidate
            >

                {/* INFORMAÇÕES DO SETOR */}

                <Informacoes
                    titulo="Informações do setor"
                    descricaoCard="Edite os dados de identificação e classificação do setor."

                    nomeEntidade="setor"

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

                    tituloNome="Nome do setor"
                    tituloCodigo="Código do setor"

                    mostrarResponsavel={false}

                    erro={erro}
                    sucesso={sucesso}
                />


                {/* BOTÕES */}

                <BotaoSalvarCancelar
                    onCancelar={voltar}
                    onSalvar={salvarAlteracoes}
                    salvando={salvando}
                    textoBotao="Salvar alteração"
                />

            </form>


            {/* ALERTA DE INATIVAÇÃO */}

            <Alerta
                aberto={alertaAberto}
                titulo="Inativar setor?"
                entidade="setor"

                mensagem="Ao inativar este setor, ele não poderá ser utilizado em novos cadastros. Os colaboradores atualmente vinculados continuarão associados ao setor e seu histórico será preservado."

                informacoes={[
                    {
                        titulo: 'Setor selecionado:',
                        valor: `${nome} (${codigo})`
                    },
                    {
                        titulo: 'Colaboradores impactados:',
                        valor:
                            setor.quantidade_colaboradores
                            ?? setor.colaboradores?.length
                            ?? 'Não informado',
                        tipo: 'colaboradores'
                    },
                    {
                        titulo: 'Política de integridade:',
                        tipo: 'integridade'
                    }
                ]}

                textoBotao="Inativar"

                cancelar={() => setAlertaAberto(false)}

                confirmar={confirmarInativacao}
            />


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

export default EditarSetor;