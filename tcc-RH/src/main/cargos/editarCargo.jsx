//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';

import { buscarDadosCadastro } from './servicos/editarCargoApi.js';
import { atualizarCargo } from './servicos/editarCargoApi.js';

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

    const [alertaAberto, setAlertaAberto] = useState(false);


    //----------------- CARREGAR CARGO ----------------------//

    useEffect(() => {

        if (cargo) {
            setNome(cargo.nome || cargo.nome_cargo || '');
            setCodigo(cargo.codigo || '');
            setDescricao(cargo.descricao || '');
            setStatus(Number(cargo.status ?? 1));
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


    //----------------- VALIDAR CARGO -----------------------//

    const validacao = validarCargo(
        { nome, codigo, descricao, status },
        cargos,
        cargo?.cargo_id ?? cargo?.id
    );

    const formularioValido =
        validacao.valido &&
        !carregando &&
        !salvando;


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

        if (!formularioValido) {
            setErro('Verifique o nome, o código e a descrição do cargo.');
            return;
        }

        setSalvando(true);

        try {

            await atualizarCargo(cargo.cargo_id ?? cargo.id, {
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim(),
                status: Number(status)
            });

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

                        <button type="button" onClick={voltar}>
                            Cargos
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-cargo">
                            Editar cargo
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            <form onSubmit={salvarAlteracoes}>

                <Informacoes
                    titulo="Informações do cargo"
                    descricaoCard="Edite os dados de identificação e classificação do cargo."
                    nomeEntidade="cargo"
                    nome={nome}
                    setNome={setNome}
                    codigo={codigo}
                    setCodigo={setCodigo}
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
                    voltar={voltar}
                    salvando={salvando || carregando}
                    formularioValido={formularioValido}
                    textoBotao="Salvar alterações"
                />

            </form>


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