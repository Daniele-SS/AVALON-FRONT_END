
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';

import Dadospessoais from './componentes/dadospessoais.jsx';
import Dadosprofissionais from './componentes/dadosprofissionais.jsx';
import JornadaEscala from './componentes/jornadaEscala.jsx';

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

import './css-colaboradores/cadastroColaborador.css';


//----------------- DATA ATUAL ------------------------------//

function obterDataAtual() {

    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;

}


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

    // Guarda o ID para evitar cadastrar o colaborador novamente
    // se ocorrer um erro durante a criação do usuário.

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

        if (onVoltar) {
            onVoltar();
        }

    }


    //----------------- VALIDAR FORMULÁRIO -------------------//

    function validarDados() {

        if (!dados.nome.trim()) {
            alert('Informe o nome completo do colaborador.');
            return false;
        }

        if (!dados.email.trim()) {
            alert('Informe o e-mail do colaborador.');
            return false;
        }

        // Verifica o formato básico do e-mail.

        const email = dados.email.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Informe um endereço de e-mail válido.');
            return false;
        }

        // Verifica se o CPF contém 11 números.

        const cpf = dados.cpf.replace(/\D/g, '');

        if (cpf.length !== 11) {
            alert('Informe um CPF com 11 números.');
            return false;
        }

        if (!dados.matricula.trim()) {
            alert('Informe a matrícula do colaborador.');
            return false;
        }

        if (!dados.idCargo) {
            alert('Selecione um cargo.');
            return false;
        }

        if (!dados.idSetor) {
            alert('Selecione um setor.');
            return false;
        }

        if (!dados.tipoVinculo) {
            alert('Selecione o tipo de vínculo.');
            return false;
        }

        if (!dados.login.trim()) {
            alert('Informe o login de acesso.');
            return false;
        }

        if (!dados.senha.trim()) {
            alert('Informe a senha de acesso.');
            return false;
        }

        if (!dados.idJornadaEscala) {
            alert('Selecione uma jornada de trabalho.');
            return false;
        }

        if (!dados.idNivelAcesso) {
            alert('Selecione o nível de acesso.');
            return false;
        }

        return true;

    }


    //----------------- SALVAR CADASTRO ----------------------//

    async function salvarColaborador() {

        if (salvando || !validarDados()) {
            return;
        }

        setSalvando(true);

        // Mantém o ID disponível inclusive se a criação do usuário falhar.

        let idColaborador = idColaboradorCriado;

        try {

            //----------------- CADASTRAR COLABORADOR ----------//

            if (!idColaborador) {

                const dadosParaCadastro = {

                    matricula: dados.matricula.trim(),

                    nome: dados.nome.trim(),

                    email: dados.email.trim(),

                    cpf: dados.cpf.replace(/\D/g, ''),

                    telefone: dados.telefone
                        ? dados.telefone.replace(/\D/g, '')
                        : null,

                    data_nascimento: dados.dataNascimento || null,

                    // Preenche a data de admissão automaticamente.

                    data_admissao: obterDataAtual(),

                    data_desligamento:
                        dados.dataDesligamento || null,

                    status: Number(dados.status) === 1
                        ? 'Ativo'
                        : 'Inativo',

                    id_cargo: Number(dados.idCargo),

                    id_setor: Number(dados.idSetor),

                    id_jornada_escala: Number(
                        dados.idJornadaEscala
                    ),

                    tipo_vinculo: dados.tipoVinculo

                };

                const respostaCadastro = await enviarColaborador(
                    dadosParaCadastro
                );

                idColaborador = extrairIdColaborador(
                    respostaCadastro
                );

                // Se a API não retornar o ID, procura pela matrícula.

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
                        'A API não retornou o ID do colaborador. Verifique se ele foi cadastrado antes de tentar novamente.'
                    );

                }

                // Salva o ID para não duplicar o colaborador
                // caso a criação do usuário apresente um erro.

                setIdColaboradorCriado(idColaborador);

            }


            //----------------- CADASTRAR USUÁRIO --------------//

            // Usa o login e a senha preenchidos no formulário.

            const dadosParaUsuario = {

                id_colaborador: Number(idColaborador),

                id_nivel_acesso: Number(dados.idNivelAcesso),

                login: dados.login.trim(),

                senha: dados.senha

            };

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
                'Erro ao cadastrar colaborador ou usuário:',
                erro
            );

            if (idColaborador) {

                alert(
                    `O colaborador já foi cadastrado (ID ${idColaborador}), mas não foi possível concluir a criação do usuário.\n\nConfira o login, a senha e a mensagem da API antes de tentar novamente.\n\nErro: ${erro.message}`
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


    //----------------- TELA --------------------------------//

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

                <p>
                    Carregando as opções do cadastro...
                </p>

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

                    <div className="acoes-cadastro-colaborador">

                        <button
                            type="button"
                            onClick={voltar}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={salvarColaborador}
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando...'
                                : 'Salvar colaborador'}
                        </button>

                    </div>

                </>

            )}

        </>
    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroColaborador;
