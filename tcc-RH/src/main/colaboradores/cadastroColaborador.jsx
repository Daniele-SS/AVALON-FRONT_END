
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

import {
    editarColaborador,
    editarUsuario
} from './servicos/editarColaborador.js';

import validarColaborador from './funcoes/cadastroColaborador/validarColaborador.js';
import montarDadosColaborador from './funcoes/cadastroColaborador/montarDadosColaborador.js';
import montarDadosUsuario from './funcoes/cadastroColaborador/montarDadosUsuario.js';

import './css-colaboradores/cadastroColaborador.css';


//----------------- COMPONENTE ------------------------------//

function CadastroColaborador({
    onVoltar,
    onSalvar,
    modoEdicao = false,
    colaborador = null,
    usuario = null
}) {

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


    //----------------- FORMATAR DATA ------------------------//

    function formatarData(data) {

        if (!data) {
            return '';
        }

        return String(data).split('T')[0];
    }


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
                    'Erro ao carregar opções do formulário:',
                    erro
                );

                alert(
                    'Não foi possível carregar as opções do formulário. Verifique se a API está funcionando.'
                );

            } finally {

                setCarregandoOpcoes(false);

            }
        }

        carregarOpcoes();

    }, []);


    //----------------- PREENCHER OS DADOS DA EDIÇÃO ----------//

    useEffect(() => {

        if (!modoEdicao || !colaborador) {
            return;
        }

        // O setor pode vir como uma lista ou um objeto.
        const setor = Array.isArray(colaborador.setor)
            ? colaborador.setor[0]
            : colaborador.setor;

        // O cargo pode vir dentro de cargo.classificacao.
        let cargo = colaborador.cargo;

        if (Array.isArray(cargo?.classificacao)) {
            cargo = cargo.classificacao[0];
        }

        // A jornada pode vir como uma lista ou um objeto.
        const jornada = Array.isArray(colaborador.jornada_escala)
            ? colaborador.jornada_escala[0]
            : colaborador.jornada_escala;

        // O nível de acesso pode vir dentro de outra lista.
        let nivel = usuario?.nivel_acesso;

        if (Array.isArray(nivel?.nivel_acesso)) {
            nivel = nivel.nivel_acesso[0];
        }

        setDados({

            nome: colaborador.nome ?? '',
            email: colaborador.email ?? '',
            cpf: colaborador.cpf ?? '',
            telefone: colaborador.telefone ?? '',

            dataNascimento: formatarData(
                colaborador.data_nascimento
            ),

            dataDesligamento: formatarData(
                colaborador.data_desligamento
            ),

            status:
                String(colaborador.status).toLowerCase() === 'inativo' ||
                    Number(colaborador.status) === 0
                    ? 0
                    : 1,

            matricula: colaborador.matricula ?? '',

            idCargo:
                colaborador.id_cargo ??
                cargo?.id_cargo ??
                cargo?.id ??
                '',

            idSetor:
                colaborador.id_setor ??
                setor?.id_setor ??
                setor?.id ??
                '',

            tipoVinculo: colaborador.tipo_vinculo ?? '',

            login: usuario?.login ?? '',

            // Não preencher a senha atual no formulário.
            senha: '',

            idNivelAcesso:
                usuario?.id_nivel_acesso ??
                nivel?.id_nivel_acesso ??
                nivel?.id ??
                '',

            idJornadaEscala:
                colaborador.id_jornada_escala ??
                jornada?.id_jornada_escala ??
                jornada?.id ??
                ''

        });

    }, [modoEdicao, colaborador, usuario]);


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


    //----------------- VALIDAR EDIÇÃO -----------------------//

    function validarEdicao() {

        if (!dados.nome.trim()) {
            alert('Informe o nome do colaborador.');
            return false;
        }

        if (!dados.email.trim()) {
            alert('Informe o e-mail do colaborador.');
            return false;
        }

        if (!dados.cpf || dados.cpf.replace(/\D/g, '').length !== 11) {
            alert('Informe um CPF válido com 11 números.');
            return false;
        }

        if (!dados.matricula.trim()) {
            alert('Informe a matrícula do colaborador.');
            return false;
        }

        if (!dados.idCargo) {
            alert('Selecione o cargo do colaborador.');
            return false;
        }

        if (!dados.idSetor) {
            alert('Selecione o setor do colaborador.');
            return false;
        }

        if (!dados.tipoVinculo) {
            alert('Selecione o tipo de vínculo do colaborador.');
            return false;
        }

        if (!dados.idJornadaEscala) {
            alert('Selecione a jornada do colaborador.');
            return false;
        }

        if (!dados.idNivelAcesso) {
            alert('Selecione o nível de acesso do usuário.');
            return false;
        }

        if (!dados.login.trim()) {
            alert('Informe o login do usuário.');
            return false;
        }

        return true;
    }


    //----------------- AVANÇAR PARA REVISÃO ----------------//

    function avancarParaConfirmacao() {

        if (salvando) {
            return;
        }

        if (modoEdicao) {

            if (!validarEdicao()) {
                return;
            }

            salvarColaborador();
            return;
        }

        if (!validarColaborador(dados)) {
            return;
        }

        setMostrarConfirmacao(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }


    //----------------- SALVAR CADASTRO OU EDIÇÃO -------------//

    async function salvarColaborador() {

        if (salvando) {
            return;
        }

        setSalvando(true);

        let idColaborador = idColaboradorCriado;

        try {

            //----------------- MODO DE EDIÇÃO ----------------//

            if (modoEdicao) {

                idColaborador =
                    colaborador?.id_colaborador ??
                    colaborador?.id ??
                    colaborador?.idColaborador;

                const idUsuario = usuario?.id;

                if (!idColaborador) {
                    throw new Error(
                        'Não foi possível identificar o colaborador que será editado.'
                    );
                }

                if (!idUsuario) {
                    throw new Error(
                        'Não foi possível identificar o usuário de acesso que será editado.'
                    );
                }

                // Atualiza os dados do colaborador existente.
                await editarColaborador(
                    idColaborador,
                    dados,
                    colaborador
                );

                // Atualiza o usuário existente.
                await editarUsuario(
                    idUsuario,
                    dados,
                    idColaborador,
                    usuario
                );

                alert('Colaborador atualizado com sucesso!');

                if (onSalvar) {
                    await onSalvar(idColaborador);
                }

                if (onVoltar) {
                    await onVoltar();
                }

                return;
            }


            //----------------- MODO DE CADASTRO ----------------//

            if (!idColaborador) {

                const dadosParaCadastro =
                    montarDadosColaborador(dados);

                const respostaCadastro = await enviarColaborador(
                    dadosParaCadastro
                );

                idColaborador = extrairIdColaborador(
                    respostaCadastro
                );

                if (!idColaborador) {

                    const colaboradores = await buscarColaboradores();

                    const colaboradorEncontrado = colaboradores.find(
                        (item) =>
                            String(item.matricula) ===
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


            //----------------- CONCLUSÃO DO CADASTRO -----------//

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
                modoEdicao
                    ? 'Erro ao editar colaborador:'
                    : 'Erro ao confirmar o cadastro do colaborador:',
                erro
            );

            alert(
                `Não foi possível ${modoEdicao ? 'atualizar' : 'concluir o cadastro de'
                } o colaborador.\n\nErro: ${erro.message}`
            );

        } finally {

            setSalvando(false);

        }
    }


    //----------------- TELA DE CONFIRMAÇÃO ------------------//

    if (!modoEdicao && mostrarConfirmacao) {

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


    //----------------- TÍTULOS DA TELA ----------------------//

    const tituloPagina = modoEdicao
        ? 'Editar colaborador'
        : 'Novo colaborador';

    const descricaoPagina = modoEdicao
        ? 'Atualize os dados pessoais e profissionais do colaborador.'
        : 'Cadastre os dados pessoais e profissionais do colaborador.';


    //----------------- FORMULÁRIO ---------------------------//

    return (
        <>

            {/* CABEÇALHO */}

            <div className="cabecalho-novo-colaborador">

                <BotaoCadastro
                    titulo={tituloPagina}
                    descricao={descricaoPagina}
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
                            {tituloPagina}
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* CAMPOS DO FORMULÁRIO */}

            {carregandoOpcoes ? (

                <p>Carregando as opções do formulário...</p>

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
                        modoEdicao={modoEdicao}
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
                        textoBotao={
                            modoEdicao
                                ? 'Salvar alterações'
                                : 'Revisar cadastro'
                        }
                    />

                </>

            )}

        </>
    );
}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroColaborador;
