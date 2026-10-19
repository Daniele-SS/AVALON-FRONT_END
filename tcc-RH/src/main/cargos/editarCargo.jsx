//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';

import {
    buscarDadosCadastro,
    atualizarCargo
} from './servicos/editarCargoApi.js';

import validarCargo from './funcoes/editarCargo/validarCargo.js';

import './css-cargos/cadastroCargo.css';


//----------------- COMPONENTE ------------------------------//

function EditarCargo({ cargo, voltar }) {

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

    // Erros específicos dos campos
    const [erroNome, setErroNome] = useState('');
    const [erroCodigo, setErroCodigo] = useState('');

    // Alerta de inativação
    const [alertaAberto, setAlertaAberto] = useState(false);


    //----------------- CARREGAR CARGO ----------------------//

    useEffect(() => {

        if (cargo) {

            setNome(cargo.nome || cargo.nome_cargo || '');
            setCodigo(cargo.codigo || '');
            setDescricao(cargo.descricao || '');
            setStatus(Number(cargo.status ?? 1));

            setErroNome('');
            setErroCodigo('');
            setErro('');
            setSucesso('');

        }

    }, [cargo]);


    //----------------- BUSCAR CARGOS -----------------------//

    useEffect(() => {

        async function carregarCargos() {

            try {

                const dados = await buscarDadosCadastro();

                setCargos(dados);

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarCargos();

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


    //----------------- VALIDAR CARGO -----------------------//

    const validacao = validarCargo(
        { nome, codigo, descricao, status },
        cargos,
        cargo?.cargo_id ?? cargo?.id ?? null
    );


    //----------------- ALTERAR STATUS ----------------------//

    function alterarStatus(novoStatus) {

        if (Number(novoStatus) === 0) {
            setAlertaAberto(true);
            return;
        }

        setStatus(Number(novoStatus));

    }


    //----------------- CONFIRMAR INATIVAÇÃO ----------------//

    function confirmarInativacao() {

        setStatus(0);
        setAlertaAberto(false);

    }


    //----------------- SALVAR ALTERAÇÕES -------------------//

    async function salvarAlteracoes(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

        if (!cargo) {

            setErro('Nenhum cargo foi selecionado para edição.');

            return;

        }

        if (carregando || salvando) {
            return;
        }

        // Valida novamente os dados antes de enviar
        const resultado = validarCargo(
            { nome, codigo, descricao, status },
            cargos,
            cargo.cargo_id ?? cargo.id
        );


        //----------------- VALIDAR NOME ---------------------//

        if (resultado.erros.nome) {

            setNome('');
            setErroNome(resultado.erros.nome);

        } else {

            setErroNome('');

        }


        //----------------- VALIDAR CÓDIGO -------------------//

        if (resultado.erros.codigo) {

            setCodigo('');
            setErroCodigo(resultado.erros.codigo);

        } else {

            setErroCodigo('');

        }


        //----------------- IMPEDIR ENVIO --------------------//

        if (!resultado.valido) {

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


        //----------------- ATUALIZAR CARGO ------------------//

        setSalvando(true);

        try {

            const dadosCargo = {
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim() || 'Nenhuma descrição informada.',
                status: Number(status)
            };

            await atualizarCargo(
                cargo.cargo_id ?? cargo.id,
                dadosCargo
            );

            setSucesso('Cargo atualizado com sucesso!');

            voltar();

        } catch (erroApi) {

            setErro(erroApi.message);

        } finally {

            setSalvando(false);

        }

    }


    //----------------- VERIFICAR CARGO ---------------------//

    if (!cargo) {
        return <p>Nenhum cargo foi selecionado para edição.</p>;
    }


    //----------------- TELA --------------------------------//

    return (

        <>

            <div className="cabecalho-novo-cargo">

                <BotaoCadastro
                    titulo="Editar cargo"
                    descricao="Atualize os dados cadastrais e o status do cargo."
                >

                    <nav className="caminho-cadastro-cargo">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Cargos
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-cargo">
                            Editar cargo
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* noValidate permite mostrar nossos erros personalizados */}

            <form
                onSubmit={salvarAlteracoes}
                noValidate
            >

                <Informacoes
                    titulo="Informações do cargo"
                    descricaoCard="Edite os dados de identificação e classificação do cargo."

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
                    setDescricao={setDescricao}

                    status={status}
                    setStatus={alterarStatus}

                    campos={['nome', 'codigo', 'descricao', 'status']}
                />


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
                titulo="Inativar cargo?"
                entidade="cargo"

                mensagem="Ao inativar este cargo, ele não poderá ser utilizado em novos cadastros. O histórico dos registros existentes será preservado."

                informacoes={[
                    {
                        titulo: 'Cargo selecionado:',
                        valor: `${nome} (${codigo})`
                    },
                    {
                        titulo: 'Colaboradores impactados:',
                        valor: cargo.quantidade_colaboradores
                            ?? cargo.colaboradores?.length
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


            {carregando && (
                <p>Carregando dados...</p>
            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default EditarCargo;