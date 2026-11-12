
//----------------- IMPORTAÇÕES -----------------------------//

import { useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/BotaoSalvarCancelar.jsx';

import cadastrarRegra from './servicos/cadastroRegraApi.js';

import './css-motorRegras/acaoRegra.css';


//----------------- OPÇÕES DE CLASSIFICAÇÃO -----------------//

const opcoesClassificacao = [
    { valor: 'NORMAL', nome: 'Normal' },
    { valor: 'ATENÇÃO', nome: 'Atenção' },
    { valor: 'PRIORIDADE', nome: 'Prioridade' }
];


//----------------- COMPONENTE ------------------------------//

function AcaoRegra({ condicao, voltar, concluir }) {

    //----------------- ESTADOS -----------------------------//

    const [classificacao, setClassificacao] = useState('NORMAL');

    const [acao, setAcao] = useState('');

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');


    //----------------- SALVAR REGRA -------------------------//

    async function salvarRegra() {

        // Verifica se os dados da condição foram recebidos.
        if (!condicao) {

            setErro('Os dados da condição não foram encontrados.');

            return;

        }

        // Verifica se a ação foi preenchida.
        if (!acao.trim()) {

            setErro('Descreva a ação que será executada.');

            return;

        }

        try {

            setSalvando(true);

            setErro('');

            // Organiza todos os dados para o cadastro.
            const dadosRegra = {

                id_psicossocial_fator: condicao.id_psicossocial_fator,

                operador: condicao.operador,

                valor_referencial: condicao.valor_referencia,

                classificacao: classificacao,

                acao: acao.trim(),

                ativo: 1

            };

            // Envia os dados para o backend.
            await cadastrarRegra(dadosRegra);

            alert('Regra cadastrada com sucesso!');

            // Retorna à listagem e atualiza os dados.
            if (concluir) {

                await concluir();

            }

        } catch (erroApi) {

            console.error('Erro ao cadastrar regra:', erroApi);

            setErro(
                erroApi.message || 'Não foi possível cadastrar a regra.'
            );

        } finally {

            setSalvando(false);

        }

    }


    //----------------- TELA --------------------------------//

    return (

        <>

            {/* CABEÇALHO */}

            <div className="cabecalho-cadastro-regra">

                <BotaoCadastro

                    titulo="Nova Regra"

                    descricao="Automatize a identificação de situações que precisam de atenção."

                >

                    <nav className="caminho-cadastro-regra">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Motor de Regras
                        </button>

                        <span className="seta">&gt;</span>

                        <span>
                            Nova Regra
                        </span>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-regra">
                            Definir Ação
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* CONTEÚDO PRINCIPAL */}

            <main className="conteudo-cadastro-regra">

                <section className="cartao-condicao-regra">

                    {/* CABEÇALHO */}

                    <div className="cabecalho-condicao-regra">

                        <h2>Defina a ação</h2>

                        <p>
                            Escolha a classificação e descreva a ação
                            que deverá ser executada quando a condição
                            for identificada.
                        </p>

                    </div>


                    {/* RESUMO DA CONDIÇÃO */}

                    {condicao && (

                        <div className="resumo-condicao-regra">

                            <h3>Condição configurada</h3>

                            <p>
                                <strong>Fator:</strong> {condicao.nome_fator}
                            </p>

                            <p>
                                <strong>Operador:</strong> {condicao.operador}
                            </p>

                            <p>
                                <strong>Valor de referência:</strong> {condicao.valor_referencia}
                            </p>

                        </div>

                    )}


                    {/* CLASSIFICAÇÃO */}

                    <div className="campo-acao-regra">

                        <label htmlFor="classificacao-acao-regra">
                            CLASSIFICAÇÃO
                        </label>

                        <select
                            id="classificacao-acao-regra"
                            value={classificacao}
                            onChange={(evento) =>
                                setClassificacao(evento.target.value)
                            }
                        >

                            {opcoesClassificacao.map((opcao) => (

                                <option
                                    key={opcao.valor}
                                    value={opcao.valor}
                                >
                                    {opcao.nome}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* DESCRIÇÃO DA AÇÃO */}

                    <div className="campo-acao-regra">

                        <label htmlFor="descricao-acao-regra">
                            AÇÃO A SER EXECUTADA
                        </label>

                        <textarea
                            id="descricao-acao-regra"
                            value={acao}
                            onChange={(evento) => {
                                setAcao(evento.target.value);
                                setErro('');
                            }}
                            placeholder="Descreva o que o sistema deverá fazer quando esta condição for identificada."
                            rows={5}
                            maxLength={500}
                        />

                        <small>
                            {acao.length}/500 caracteres
                        </small>

                    </div>


                    {/* ERRO */}

                    {erro && (

                        <p className="mensagem-erro-regra">
                            {erro}
                        </p>

                    )}


                    {/* BOTÕES */}

                    <BotaoSalvarCancelar

                        voltar={voltar}

                        onSalvar={salvarRegra}

                        salvando={salvando}

                        textoBotao="Cadastrar Regra"

                        formularioValido={
                            Boolean(condicao) &&
                            Boolean(classificacao) &&
                            Boolean(acao.trim())
                        }

                    />

                </section>

            </main>

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default AcaoRegra;
