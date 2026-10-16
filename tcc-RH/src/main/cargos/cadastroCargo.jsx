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


    //----------------- BUSCAR DADOS ------------------------//

    useEffect(() => {

        async function carregarCargos() {

            try {

                const dadosCargos = await buscarDadosCadastro();

                setCargos(dadosCargos);

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarCargos();

    }, []);


    //----------------- VALIDAÇÃO ---------------------------//

    const validacao = validarCargo(
        { nome, codigo, descricao, status },
        cargos
    );

    const formularioValido =
        validacao.valido &&
        !carregando &&
        !salvando;


    //----------------- CADASTRAR CARGO ---------------------//

    async function salvarCargo(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

        if (!formularioValido) {

            setErro('Verifique o nome, o código e a descrição do cargo.');

            return;

        }

        setSalvando(true);

        try {

            const dadosCargo = {
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim() || 'Nenhuma descrição informada.',
                status: Number(status)
            };

            await cadastrarCargo(dadosCargo);

            setSucesso('Cargo cadastrado com sucesso!');

            const dadosCargos = await buscarDadosCadastro();

            setCargos(dadosCargos);

            setNome('');
            setCodigo('');
            setDescricao('');
            setStatus(1);

        } catch (erroApi) {

            setErro(erroApi.message);

        } finally {

            setSalvando(false);

        }

    }


    //----------------- TELA --------------------------------//

    return (

        <>

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

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-cargo">
                            Novo cargo
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            <form onSubmit={salvarCargo}>

                <Informacoes
                    titulo="Informações do cargo"
                    descricaoCard="Preencha os dados do cargo."
                    nomeEntidade="cargo"
                    nome={nome}
                    setNome={setNome}
                    codigo={codigo}
                    setCodigo={setCodigo}
                    descricao={descricao}
                    setDescricao={setDescricao}
                    status={status}
                    setStatus={setStatus}
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
                    onSalvar={salvarCargo}
                    salvando={salvando}
                    textoBotao="Salvar cargo"
                />

            </form>


            {carregando && (
                <p>Carregando dados...</p>
            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroCargo;