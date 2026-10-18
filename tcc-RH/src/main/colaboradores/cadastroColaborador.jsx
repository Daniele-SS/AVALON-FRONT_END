
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import Dadospessoais from './componentes/dadospessoais.jsx';
import Dadosprofissionais from './componentes/dadosprofissionais.jsx';
import JornadaEscala from './componentes/jornadaEscala.jsx';
import Confirmacao from './confirmacao.jsx';

import {
    buscarCargos,
    buscarSetores,
    buscarNiveisAcesso,
    buscarJornadas,
    buscarColaboradores,
    cadastrarColaborador as enviarColaborador,
    cadastrarUsuario,
    extrairIdColaborador
} from './servicos/cadastroColaboradoresApi.js';

import validarColaborador from './funcoes/cadastroColaborador/validarColaborador.js';
import montarDadosColaborador from './funcoes/cadastroColaborador/montarDadosColaborador.js';
import montarDadosUsuario from './funcoes/cadastroColaborador/montarDadosUsuario.js';

import './css-colaboradores/cadastroColaborador.css';


//----------------- COMPONENTE ------------------------------//

function CadastroColaborador({ onVoltar, onSalvar }) {

    //----------------- ESTADOS -----------------------------//

    const [dados, setDados] = useState({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        dataNascimento: '',
        dataDesligamento: '',
        status: 1,

        matricula: '',
        idCargo: '',
        idSetor: '',
        tipoVinculo: '',
        login: '',
        senha: '',
        idNivelAcesso: '',
        idJornadaEscala: ''
    });

    const [cargos, setCargos] = useState([]);
    const [setores, setSetores] = useState([]);
    const [niveisAcesso, setNiveisAcesso] = useState([]);
    const [jornadas, setJornadas] = useState([]);

    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const [idColaboradorCriado, setIdColaboradorCriado] = useState(null);


    //----------------- CARREGAR OPÇÕES ----------------------//

    useEffect(() => {

        async function carregarOpcoes() {
            setCarregandoOpcoes(true);

            try {
                const [
                    listaCargos,
                    listaSetores,
                    listaNiveis,
                    listaJornadas
                ] = await Promise.all([
                    buscarCargos(),
                    buscarSetores(),
                    buscarNiveisAcesso(),
                    buscarJornadas()
                ]);

                setCargos(listaCargos);
                setSetores(listaSetores);
                setNiveisAcesso(listaNiveis);
                setJornadas(listaJornadas);

            } catch (erro) {
                console.error(
                    'Erro ao carregar opções do cadastro:',
                    erro
                );

                alert(
                    'Não foi possível carregar as opções do cadastro. Verifique se a API está funcionando.'
                );

            } finally {
                setCarregandoOpcoes(false);
            }
        }

        carregarOpcoes();

    }, []);


    //----------------- VOLTAR -------------------------------//

    function voltar() {

        if (salvando) {
            return;
        }

        if (mostrarConfirmacao) {
            setMostrarConfirmacao(false);
            return;
        }

        if (onVoltar) {
            onVoltar();
        }
    }


    //----------------- AVANÇAR PARA REVISÃO ----------------//

    function avancarParaConfirmacao() {

        if (salvando || !validarColaborador(dados)) {
            return;
        }

        setMostrarConfirmacao(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }


    //----------------- CONFIRMAR E CADASTRAR ----------------//

    async function salvarColaborador() {

        if (salvando) {
            return;
        }

        setSalvando(true);

        let idColaborador = idColaboradorCriado;

        try {

            //----------------- CADASTRAR COLABORADOR ----------//

            if (!idColaborador) {

                const dadosParaCadastro = montarDadosColaborador(dados);

                const respostaCadastro = await enviarColaborador(
                    dadosParaCadastro
                );

                idColaborador = extrairIdColaborador(
                    respostaCadastro
                );

                if (!idColaborador) {

                    const colaboradores = await buscarColaboradores();

                    const colaboradorEncontrado = colaboradores.find(
                        (colaborador) =>
                            String(colaborador.matricula) ===
                            String(dados.matricula.trim())
                    );

                    idColaborador =
                        colaboradorEncontrado?.id_colaborador ??
                        colaboradorEncontrado?.id ??
                        null;
                }

                if (!idColaborador) {
                    throw new Error(
                        'O colaborador pode ter sido cadastrado, mas a API não retornou seu ID. Verifique o registro antes de tentar novamente.'
                    );
                }

                setIdColaboradorCriado(idColaborador);
            }


            //----------------- CRIAR USUÁRIO ------------------//

            const dadosParaUsuario = montarDadosUsuario(
                dados,
                idColaborador
            );

            await cadastrarUsuario(dadosParaUsuario);


            //----------------- CONCLUSÃO ----------------------//

            alert(
                'Colaborador e usuário cadastrados com sucesso!'
            );

            if (onSalvar) {
                await onSalvar();
            }

            if (onVoltar) {
                onVoltar();
            }

        } catch (erro) {

            console.error(
                'Erro ao confirmar o cadastro do colaborador:',
                erro
            );

            if (idColaborador) {

                alert(
                    `O colaborador já foi cadastrado (ID ${idColaborador}), mas não foi possível concluir a criação do usuário.\n\nVerifique a mensagem da API antes de tentar novamente.\n\nErro: ${erro.message}`
                );

            } else {

                alert(
                    `Não foi possível concluir o cadastro.\n\nErro: ${erro.message}`
                );
            }

        } finally {
            setSalvando(false);
        }
    }


    //----------------- TELA DE CONFIRMAÇÃO ------------------//

    if (mostrarConfirmacao) {
        return (
            <Confirmacao
                dados={dados}
                cargos={cargos}
                setores={setores}
                niveisAcesso={niveisAcesso}
                jornadas={jornadas}
                onVoltar={() => setMostrarConfirmacao(false)}
                onEditarEtapa={() => {
                    setMostrarConfirmacao(false);
                }}
                onConfirmar={salvarColaborador}
                salvando={salvando}
            />
        );
    }


    //----------------- FORMULÁRIO ---------------------------//

    return (
        <>
            <div className="cabecalho-novo-colaborador">

                <BotaoCadastro
                    titulo="Novo colaborador"
                    descricao="Cadastre os dados pessoais e profissionais do colaborador."
                >
                    <nav className="caminho-cadastro-colaborador">

                        <button
                            type="button"
                            onClick={voltar}
                            disabled={salvando}
                        >
                            Colaboradores
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-colaborador">
                            Novo colaborador
                        </span>

                    </nav>
                </BotaoCadastro>

            </div>


            {carregandoOpcoes ? (

                <p>Carregando as opções do cadastro...</p>

            ) : (

                <>
                    <Dadospessoais
                        dados={dados}
                        setDados={setDados}
                    />

                    <Dadosprofissionais
                        dados={dados}
                        setDados={setDados}
                        cargos={cargos}
                        setores={setores}
                        niveisAcesso={niveisAcesso}
                    />

                    <JornadaEscala
                        dados={dados}
                        setDados={setDados}
                        jornadas={jornadas}
                    />

                    <BotaoSalvarCancelar
                        onCancelar={voltar}
                        onSalvar={avancarParaConfirmacao}
                        salvando={salvando}
                        textoBotao="Revisar cadastro"
                    />
                </>

            )}
        </>
    );
}

export default CadastroColaborador;
