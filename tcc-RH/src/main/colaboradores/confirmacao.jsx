
 //----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';

import buscarDadosColaboradores from './servicos/colaboradoresApi.js';
import buscarDadosJornadaEscala from '../jornadaEscala/servicos/jornadaEscala.js';

import {
    localizarPorId,
    obterDataAtual,
    formatarData,
    formatarCpf,
    formatarTelefone
} from './funcoes/confirmacao/formatacaoConfirmacao.js';

import {
    encontrarGestorDoSetor
} from './funcoes/confirmacao/gestorConfirmacao.js';

import {
    DIAS_DA_SEMANA,
    diaPertenceAJornada,
    obterChaveDia,
    obterStatusDia
} from './funcoes/confirmacao/jornadaConfirmacao.js';

import './css-colaboradores/confirmacao.css';


//----------------- CARD DE INFORMAÇÃO ------------------------------//

function Informacao({ titulo, valor }) {
    return (
        <div className="informacao-confirmacao">
            <span className="titulo-informacao-confirmacao">
                {titulo}
            </span>

            <span className="valor-informacao-confirmacao">
                {valor || 'Não informado'}
            </span>
        </div>
    );
}


//----------------- CABEÇALHO DE SEÇÃO -----------------------------//

function CabecalhoSecao({
    numero,
    titulo,
    descricao,
    etapa,
    onEditarEtapa,
    onVoltar,
    salvando
}) {
    return (
        <div className="cabecalho-cartao-confirmacao">
            <div className="titulo-cartao-confirmacao">
                <div className="icone-cartao-confirmacao">
                    {numero}
                </div>

                <div>
                    <h2>{titulo}</h2>
                    <p>{descricao}</p>
                </div>
            </div>

            <button
                type="button"
                className="botao-editar-confirmacao"
                onClick={() => {
                    if (onEditarEtapa) {
                        onEditarEtapa(etapa);
                    } else if (onVoltar) {
                        onVoltar();
                    }
                }}
                disabled={salvando}
            >
                Editar etapa {etapa}
            </button>
        </div>
    );
}


//----------------- TELA DE CONFIRMAÇÃO ----------------------------//

export default function Confirmacao({
    dados = {},
    cargos = [],
    setores = [],
    niveisAcesso = [],
    jornadas = [],
    onVoltar,
    onConfirmar,
    onEditarEtapa,
    salvando = false
}) {
    const [usuarios, setUsuarios] = useState([]);
    const [diasSemana, setDiasSemana] = useState([]);

    //----------------- CARREGAR DADOS ------------------------------//

    useEffect(() => {
        let componenteAtivo = true;

        async function carregarDados() {
            try {
                const [
                    dadosColaboradores,
                    dadosJornadas
                ] = await Promise.all([
                    buscarDadosColaboradores(),
                    buscarDadosJornadaEscala()
                ]);

                if (!componenteAtivo) {
                    return;
                }

                setUsuarios(dadosColaboradores?.usuarios || []);
                setDiasSemana(dadosJornadas?.diasSemana || []);
            } catch (erro) {
                console.error(
                    'Erro ao carregar dados da confirmação:',
                    erro
                );

                if (componenteAtivo) {
                    setUsuarios([]);
                    setDiasSemana([]);
                }
            }
        }

        carregarDados();

        return () => {
            componenteAtivo = false;
        };
    }, []);

    //----------------- DADOS PESSOAIS -----------------------------//

    const nome = dados.nome || 'Nome não informado';
    const email = dados.email || 'Não informado';
    const login = dados.login || dados.email || 'Não informado';

    const statusAtivo =
        dados.status === 1 ||
        dados.status === '1' ||
        dados.status === true ||
        dados.status === 'Ativo';

    //----------------- DADOS PROFISSIONAIS ------------------------//

    const nomeCargo = localizarPorId(cargos, dados.idCargo);
    const nomeSetor = localizarPorId(setores, dados.idSetor);

    const nomeNivelAcesso = localizarPorId(
        niveisAcesso,
        dados.idNivelAcesso
    );

    const nomeJornada = localizarPorId(
        jornadas,
        dados.idJornadaEscala
    );

    //----------------- GESTOR RESPONSÁVEL -------------------------//

    const gestorResponsavel = encontrarGestorDoSetor(
        usuarios,
        dados.idSetor
    );

    //----------------- DATA DE ADMISSÃO ---------------------------//

    const dataAdmissao = formatarData(
        dados.dataAdmissao ||
        dados.data_admissao ||
        obterDataAtual()
    );

    //----------------- JORNADA E ESCALA ---------------------------//

    const diasDaJornada = diasSemana.filter((registro) =>
        diaPertenceAJornada(registro, dados.idJornadaEscala)
    );

    const diasParaExibir = DIAS_DA_SEMANA.map((dia) => {
        const registroDia = diasDaJornada.find(
            (registro) => obterChaveDia(registro) === dia.chave
        );

        return {
            ...dia,
            status: obterStatusDia(registroDia)
        };
    });

    //----------------- EXIBIÇÃO -------------------------------//

    return (
        <div className="pagina-confirmacao">

            <div className="cabecalho-confirmacao">
                <BotaoCadastro
                    titulo="Revise os dados do colaborador"
                    descricao="Confira todas as informações antes de confirmar o cadastro."
                >
                    <nav className="caminho-cadastro-colaborador">
                        <button
                            type="button"
                            onClick={onVoltar}
                            disabled={salvando}
                        >
                            Colaboradores
                        </button>

                        <span className="seta">&gt;</span>

                        <button
                            type="button"
                            onClick={onVoltar}
                            disabled={salvando}
                        >
                            Novo Cadastro
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-colaborador">
                            Revisão
                        </span>
                    </nav>
                </BotaoCadastro>
            </div>

            {/* ETAPA 01 - DADOS PESSOAIS */}

            <CabecalhoSecao
                numero="01"
                titulo="Dados pessoais"
                descricao="Informações básicas do colaborador"
                etapa={1}
                onEditarEtapa={onEditarEtapa}
                onVoltar={onVoltar}
                salvando={salvando}
            />

            <section className="cartao-confirmacao">
                <div className="perfil-confirmacao">
                    <div className="avatar-confirmacao">
                        {nome !== 'Nome não informado'
                            ? nome.charAt(0).toUpperCase()
                            : '?'}
                    </div>

                    <div className="dados-perfil-confirmacao">
                        <div className="nome-status-confirmacao">
                            <h3>{nome}</h3>

                            <span
                                className={
                                    statusAtivo
                                        ? 'status-confirmacao status-ativo'
                                        : 'status-confirmacao status-inativo'
                                }
                            >
                                {statusAtivo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>

                        <p>{email}</p>
                    </div>
                </div>

                <div className="dados-pessoais-detalhes-confirmacao">
                    <Informacao
                        titulo="CPF"
                        valor={formatarCpf(dados.cpf)}
                    />

                    <Informacao
                        titulo="Data de nascimento"
                        valor={formatarData(
                            dados.dataNascimento ||
                            dados.data_nascimento
                        )}
                    />

                    <Informacao
                        titulo="Telefone celular"
                        valor={formatarTelefone(
                            dados.telefone ||
                            dados.telefoneCelular ||
                            dados.telefone_celular
                        )}
                    />
                </div>
            </section>

            {/* ETAPA 02 - INFORMAÇÕES PROFISSIONAIS */}

            <CabecalhoSecao
                numero="02"
                titulo="Informações profissionais"
                descricao="Dados do vínculo profissional"
                etapa={2}
                onEditarEtapa={onEditarEtapa}
                onVoltar={onVoltar}
                salvando={salvando}
            />

            <section className="cartao-confirmacao">
                <div className="dados-pessoais-detalhes-confirmacao">
                    <Informacao
                        titulo="Matrícula"
                        valor={dados.matricula}
                    />

                    <Informacao
                        titulo="Cargo"
                        valor={nomeCargo}
                    />

                    <Informacao
                        titulo="Setor/Departamento"
                        valor={nomeSetor}
                    />

                    <Informacao
                        titulo="Gestor responsável"
                        valor={gestorResponsavel}
                    />

                    <Informacao
                        titulo="Data de admissão"
                        valor={dataAdmissao}
                    />

                    <Informacao
                        titulo="Tipo de vínculo"
                        valor={
                            dados.tipoVinculo ||
                            dados.tipo_vinculo ||
                            'Não informado'
                        }
                    />
                </div>
            </section>

            {/* ETAPA 03 - JORNADA E ESCALA */}

            <CabecalhoSecao
                numero="03"
                titulo="Jornada e escala"
                descricao="Configuração da jornada de trabalho"
                etapa={3}
                onEditarEtapa={onEditarEtapa}
                onVoltar={onVoltar}
                salvando={salvando}
            />

            <section className="cartao-confirmacao cartao-jornada-confirmacao">
                <div className="painel-jornada-confirmacao">
                    <h3 className="nome-jornada-confirmacao">
                        {nomeJornada}
                    </h3>

                    <div className="dias-jornada-confirmacao">
                        {diasParaExibir.map((dia) => (
                            <div
                                key={dia.chave}
                                className={`mini-card-dia-confirmacao ${
                                    dia.status === 'Ativo'
                                        ? 'dia-confirmacao-ativo'
                                        : dia.status === 'Folga'
                                            ? 'dia-confirmacao-folga'
                                            : 'dia-confirmacao-indefinido'
                                }`}
                                title={`${dia.nome}: ${dia.status}`}
                            >
                                <span className="sigla-dia-confirmacao">
                                    {dia.sigla}
                                </span>

                                <span className="status-dia-confirmacao">
                                    {dia.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ETAPA 04 - ACESSO À PLATAFORMA */}

            <CabecalhoSecao
                numero="04"
                titulo="Acesso à plataforma"
                descricao="Configuração de acesso do colaborador"
                etapa={4}
                onEditarEtapa={onEditarEtapa}
                onVoltar={onVoltar}
                salvando={salvando}
            />

            <section className="cartao-confirmacao">
                <div className="grade-informacoes-confirmacao">
                    <Informacao
                        titulo="Login"
                        valor={login}
                    />

                    <Informacao
                        titulo="Nível de acesso"
                        valor={nomeNivelAcesso}
                    />
                </div>

                <div className="aviso-acesso-confirmacao">
                    <span className="icone-aviso-confirmacao">i</span>

                    <p>
                        O login será utilizado para acessar a plataforma.
                        As permissões serão definidas conforme o nível de
                        acesso selecionado para o colaborador.
                    </p>
                </div>
            </section>

            {/* CONVITE PARA A PLATAFORMA */}

            <section className="cartao-convite-confirmacao">
                <div className="icone-convite-confirmacao">
                    <span>✉</span>
                </div>

                <div className="texto-convite-confirmacao">
                    <h2>Convite para a plataforma</h2>

                    <p>
                        Após a confirmação, o cadastro será enviado para
                        processamento. O envio de e-mail de acesso depende
                        da integração configurada no sistema.
                    </p>
                </div>
            </section>

            {/* NOTA DE SEGURANÇA */}

            <div className="nota-seguranca-confirmacao">
                <span>🔒</span>

                <p>
                    Confira todos os dados antes de confirmar. As informações
                    serão utilizadas conforme as permissões de acesso e as
                    regras de privacidade da plataforma.
                </p>
            </div>

            {/* AÇÕES FINAIS */}

            <div className="acoes-confirmacao">
                <button
                    type="button"
                    className="botao-voltar-confirmacao"
                    onClick={onVoltar}
                    disabled={salvando}
                >
                    Voltar para edição
                </button>

                <button
                    type="button"
                    className="botao-confirmar-confirmacao"
                    onClick={onConfirmar}
                    disabled={salvando || !onConfirmar}
                >
                    {salvando
                        ? 'Salvando cadastro...'
                        : 'Confirmar cadastro'}
                </button>
            </div>

        </div>
    );
}
