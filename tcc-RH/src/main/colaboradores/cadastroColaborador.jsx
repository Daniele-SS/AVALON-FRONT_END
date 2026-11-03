
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import Dadospessoais from './componentes/dadospessoais.jsx';
import Dadosprofissionais from './componentes/dadosprofissionais.jsx';
import JornadaEscala from './componentes/jornadaEscala.jsx';
import BeneficiosColaborador from './componentes/BeneficiosColaborador.jsx';
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

import {
    buscarBeneficiosColaborador,
    cadastrarBeneficioColaborador,
    editarBeneficioColaborador,
    excluirBeneficioColaborador
} from './servicos/beneficioColaboradorApi.js';

import validarColaborador from './funcoes/cadastroColaborador/validarColaborador.js';
import montarDadosColaborador from './funcoes/cadastroColaborador/montarDadosColaborador.js';
import montarDadosUsuario from './funcoes/cadastroColaborador/montarDadosUsuario.js';

import './css-colaboradores/cadastroColaborador.css';


//----------------- VERIFICAR SE ESTÁ ATIVO -----------------//

function estaAtivo(item) {
    const status = item?.status;

    return (
        status === 1 ||
        status === '1' ||
        String(status).toLowerCase() === 'ativo' ||
        String(status).toLowerCase() === 'ativa'
    );
}


//----------------- FILTRAR OPÇÕES --------------------------//

function filtrarOpcoes(lista, idAtual, modoEdicao, obterId) {
    return lista.filter((item) => {

        // As opções ativas aparecem tanto no cadastro quanto na edição.
        if (estaAtivo(item)) {
            return true;
        }

        // Na edição, mantém a opção inativa já vinculada.
        if (
            modoEdicao &&
            idAtual !== null &&
            idAtual !== undefined &&
            idAtual !== ''
        ) {
            return String(obterId(item)) === String(idAtual);
        }

        // No cadastro, opções inativas não aparecem.
        return false;
    });
}


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

    const [erros, setErros] = useState({});

    const [cargos, setCargos] = useState([]);
    const [setores, setSetores] = useState([]);
    const [niveisAcesso, setNiveisAcesso] = useState([]);
    const [jornadas, setJornadas] = useState([]);

    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const [idColaboradorCriado, setIdColaboradorCriado] = useState(null);

    // Benefícios selecionados no formulário.
    const [beneficiosSelecionados, setBeneficiosSelecionados] = useState([]);

    // Vínculos que já existem na API.
    const [vinculosBeneficios, setVinculosBeneficios] = useState([]);


    //----------------- FORMATAR DATA ------------------------//

    function formatarData(data) {
        if (!data) {
            return '';
        }

        return String(data).split('T')[0];
    }


    //----------------- ATUALIZAR CAMPO E LIMPAR ERRO --------//

    function aoAlterarCampo(campo, valor) {
        setDados((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor
        }));

        setErros((errosAtuais) => {
            if (!errosAtuais[campo]) {
                return errosAtuais;
            }

            const novosErros = { ...errosAtuais };

            delete novosErros[campo];

            return novosErros;
        });
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

                // Identificar o setor atual do colaborador.
                const setorAtual = Array.isArray(colaborador?.setor)
                    ? colaborador.setor[0]
                    : colaborador?.setor;

                // Identificar o cargo atual do colaborador.
                let cargoAtual = colaborador?.cargo;

                if (Array.isArray(cargoAtual?.classificacao)) {
                    cargoAtual = cargoAtual.classificacao[0];
                }

                // Identificar a jornada atual do colaborador.
                const jornadaAtual = Array.isArray(
                    colaborador?.jornada_escala
                )
                    ? colaborador.jornada_escala[0]
                    : colaborador?.jornada_escala;


                //----------------- IDS ATUAIS -----------------//

                const idCargoAtual =
                    colaborador?.id_cargo ??
                    cargoAtual?.id_cargo ??
                    cargoAtual?.id ??
                    '';

                const idSetorAtual =
                    colaborador?.id_setor ??
                    setorAtual?.id_setor ??
                    setorAtual?.id ??
                    '';

                const idJornadaAtual =
                    colaborador?.id_jornada_escala ??
                    jornadaAtual?.id_jornada_escala ??
                    jornadaAtual?.id ??
                    '';


                //----------------- FILTRAR CARGOS --------------//

                const cargosFiltrados = filtrarOpcoes(
                    listaCargos,
                    idCargoAtual,
                    modoEdicao,
                    (cargo) => cargo.id_cargo ?? cargo.id
                );

                setCargos(cargosFiltrados);


                //----------------- FILTRAR SETORES ------------//

                const setoresFiltrados = filtrarOpcoes(
                    listaSetores,
                    idSetorAtual,
                    modoEdicao,
                    (setor) => setor.id_setor ?? setor.id
                );

                setSetores(setoresFiltrados);


                //----------------- NÍVEIS DE ACESSO ------------//

                setNiveisAcesso(listaNiveis);


                //----------------- FILTRAR JORNADAS -----------//

                const jornadasFiltradas = filtrarOpcoes(
                    listaJornadas,
                    idJornadaAtual,
                    modoEdicao,
                    (jornada) =>
                        jornada.id_jornada_escala ?? jornada.id
                );

                setJornadas(jornadasFiltradas);

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

    }, [modoEdicao, colaborador]);


    //----------------- PREENCHER OS DADOS DA EDIÇÃO ----------//

    useEffect(() => {

        if (!modoEdicao || !colaborador) {
            return;
        }

        const setor = Array.isArray(colaborador.setor)
            ? colaborador.setor[0]
            : colaborador.setor;

        let cargo = colaborador.cargo;

        if (Array.isArray(cargo?.classificacao)) {
            cargo = cargo.classificacao[0];
        }

        const jornada = Array.isArray(colaborador.jornada_escala)
            ? colaborador.jornada_escala[0]
            : colaborador.jornada_escala;

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

        setErros({});

    }, [modoEdicao, colaborador, usuario]);


    //----------------- CARREGAR BENEFÍCIOS DA EDIÇÃO -----------//

    useEffect(() => {

        if (!modoEdicao || !colaborador) {
            return;
        }

        let componenteAtivo = true;

        async function carregarBeneficiosVinculados() {

            try {
                const lista = await buscarBeneficiosColaborador();

                const idColaborador =
                    colaborador.id_colaborador ??
                    colaborador.id ??
                    colaborador.idColaborador;

                const vinculosDoColaborador = lista.filter((vinculo) => {

                    const colaboradoresVinculados = Array.isArray(
                        vinculo.colaborador
                    )
                        ? vinculo.colaborador
                        : [vinculo.colaborador];

                    return colaboradoresVinculados.some((item) =>
                        String(item?.id) === String(idColaborador)
                    );
                });

                if (!componenteAtivo) {
                    return;
                }

                setVinculosBeneficios(vinculosDoColaborador);

                // Carregar os benefícios que possuem vínculo ativo.
                const beneficiosAtivos = vinculosDoColaborador
                    .filter((vinculo) =>
                        vinculo.ativo === true ||
                        vinculo.ativo === 1 ||
                        vinculo.ativo === '1'
                    )
                    .flatMap((vinculo) =>
                        (vinculo.beneficio?.beneficios || []).map(
                            (beneficio) => String(beneficio.id)
                        )
                    );

                setBeneficiosSelecionados([
                    ...new Set(beneficiosAtivos)
                ]);

            } catch (erro) {

                console.error(
                    'Erro ao carregar benefícios do colaborador:',
                    erro
                );

                if (componenteAtivo) {
                    alert(
                        'Não foi possível carregar os benefícios vinculados ao colaborador.'
                    );
                }
            }
        }

        carregarBeneficiosVinculados();

        return () => {
            componenteAtivo = false;
        };

    }, [modoEdicao, colaborador]);


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


    //----------------- VALIDAR FORMULÁRIO -------------------//

    function validarFormulario() {

        const resultado = validarColaborador(
            dados,
            modoEdicao
        );

        setErros(resultado.erros);

        if (!resultado.valido) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            return false;
        }

        return true;
    }


    //----------------- AVANÇAR PARA REVISÃO ----------------//

    function avancarParaConfirmacao() {

        if (salvando) {
            return;
        }

        if (!validarFormulario()) {
            return;
        }

        if (modoEdicao) {
            salvarColaborador();
            return;
        }

        setMostrarConfirmacao(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }


    //----------------- OBTER DATA ATUAL ---------------------//

    function obterDataAtual() {

        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }


    //----------------- SALVAR BENEFÍCIOS DO COLABORADOR ------//

    async function salvarBeneficiosColaborador(idColaborador) {

        const dataAtual = obterDataAtual();

        const idsSelecionados = beneficiosSelecionados.map(
            (id) => String(id)
        );

        // Identificar os vínculos que já estão ativos.
        const vinculosAtivos = vinculosBeneficios.filter((vinculo) =>
            vinculo.ativo === true ||
            vinculo.ativo === 1 ||
            vinculo.ativo === '1'
        );

        // Identificar os benefícios que já estão vinculados.
        const idsJaVinculados = vinculosAtivos.flatMap((vinculo) =>
            (vinculo.beneficio?.beneficios || []).map(
                (beneficio) => String(beneficio.id)
            )
        );

        //----------------- EXCLUIR DESMARCADOS ----------------//

        for (const vinculo of vinculosAtivos) {

            const beneficiosDoVinculo =
                vinculo.beneficio?.beneficios || [];

            const possuiBeneficioSelecionado =
                beneficiosDoVinculo.some((beneficio) =>
                    idsSelecionados.includes(String(beneficio.id))
                );

            // Excluir o vínculo somente quando nenhum benefício
            // daquele vínculo continuar selecionado.
            if (!possuiBeneficioSelecionado) {
                await excluirBeneficioColaborador(vinculo.id);
            }
        }


        //----------------- CADASTRAR OU REATIVAR ----------------//

        for (const idBeneficio of idsSelecionados) {

            // Se já existe um vínculo ativo, não cadastrar novamente.
            if (idsJaVinculados.includes(idBeneficio)) {
                continue;
            }

            // Verificar se existe um vínculo antigo inativo.
            const vinculoInativo = vinculosBeneficios.find((vinculo) => {

                const beneficioRelacionado =
                    vinculo.beneficio?.beneficios || [];

                const pertenceAoBeneficio = beneficioRelacionado.some(
                    (beneficio) =>
                        String(beneficio.id) === idBeneficio
                );

                const estaInativo =
                    vinculo.ativo === false ||
                    vinculo.ativo === 0 ||
                    vinculo.ativo === '0';

                return pertenceAoBeneficio && estaInativo;
            });

            const dadosVinculo = {
                id_beneficio: Number(idBeneficio),
                id_colaborador: Number(idColaborador),
                data_inicio: vinculoInativo?.data_inicio || dataAtual,
                data_fim: null,
                ativo: true
            };

            if (vinculoInativo) {

                // Reativar o vínculo que já existe.
                await editarBeneficioColaborador(
                    vinculoInativo.id,
                    dadosVinculo
                );

            } else {

                // Criar um novo vínculo.
                await cadastrarBeneficioColaborador(
                    dadosVinculo
                );

            }
        }
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

                await editarColaborador(
                    idColaborador,
                    dados,
                    colaborador
                );

                await editarUsuario(
                    idUsuario,
                    dados,
                    idColaborador,
                    usuario
                );

                // Sincronizar os benefícios selecionados.
                await salvarBeneficiosColaborador(idColaborador);

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


            //----------------- SALVAR BENEFÍCIOS ---------------//

            await salvarBeneficiosColaborador(idColaborador);


            //----------------- CONCLUSÃO DO CADASTRO -----------//

            alert(
                'Colaborador, usuário e benefícios cadastrados com sucesso!'
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
                `Não foi possível ${modoEdicao
                    ? 'atualizar'
                    : 'concluir o cadastro do'
                } colaborador.\n\nErro: ${erro.message}`
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
                beneficiosSelecionados={beneficiosSelecionados}
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
                        erros={erros}
                        aoAlterarCampo={aoAlterarCampo}
                    />

                    <Dadosprofissionais
                        dados={dados}
                        setDados={setDados}
                        cargos={cargos}
                        setores={setores}
                        niveisAcesso={niveisAcesso}
                        modoEdicao={modoEdicao}
                        erros={erros}
                        aoAlterarCampo={aoAlterarCampo}
                    />

                    <JornadaEscala
                        dados={dados}
                        setDados={setDados}
                        jornadas={jornadas}
                        erros={erros}
                        aoAlterarCampo={aoAlterarCampo}
                    />

                    <BeneficiosColaborador
                        dados={dados}
                        beneficiosSelecionados={beneficiosSelecionados}
                        setBeneficiosSelecionados={setBeneficiosSelecionados}
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
