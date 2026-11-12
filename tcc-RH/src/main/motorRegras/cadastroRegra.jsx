
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/BotaoSalvarCancelar.jsx';

import CondicaoRegra from './componentes/CondicaoRegra.jsx';
import ResultadoCondicaoRegra from './componentes/ResultadoCondicaoRegra.jsx';

import buscarFatoresAvaliacao from './servicos/avaliacaoFatorApi.js';

import validarCondicao from './funcoes/cadastroRegras/validarRegra.js';

import './css-motorRegras/cadastroRegra.css';


//----------------- COMPONENTE -------------------------------//

function CadastroRegra({ voltar, continuar }) {

    //----------------- ESTADOS DOS FATORES -------------------//

    const [fatores, setFatores] = useState([]);

    const [carregandoFatores, setCarregandoFatores] = useState(true);

    const [erroFatores, setErroFatores] = useState('');


    //----------------- ESTADOS DA CONDIÇÃO -------------------//

    // O fator guarda o ID retornado pela API.
    const [fator, setFator] = useState('');

    const [operador, setOperador] = useState('<');

    const [valorReferencia, setValorReferencia] = useState('2.5');


    //----------------- ESTADOS DE VALIDAÇÃO -----------------//

    const [erroValor, setErroValor] = useState('');


    //----------------- BUSCAR FATORES DA API ----------------//

    useEffect(() => {

        async function carregarFatores() {

            try {

                setCarregandoFatores(true);

                setErroFatores('');

                const fatoresEncontrados = await buscarFatoresAvaliacao();

                setFatores(fatoresEncontrados);

                // Seleciona automaticamente o primeiro fator disponível.
                if (fatoresEncontrados.length > 0) {

                    setFator(String(fatoresEncontrados[0].id));

                } else {

                    setFator('');

                }

            } catch (erro) {

                console.error('Erro ao buscar fatores:', erro);

                setErroFatores(
                    'Não foi possível carregar os fatores psicossociais.'
                );

            } finally {

                setCarregandoFatores(false);

            }

        }

        carregarFatores();

    }, []);


    //----------------- FATOR SELECIONADO --------------------//

    // Recupera o nome do fator usando o ID selecionado.
    const fatorSelecionado = fatores.find(
        (item) => String(item.id) === String(fator)
    );


    //----------------- ALTERAR VALOR DE REFERÊNCIA -----------//

    function alterarValorReferencia(valor) {

        // Permite apagar o campo enquanto o usuário digita.
        if (valor === '') {

            setValorReferencia('');

            setErroValor('');

            return;

        }

        // Aceita somente números e uma casa decimal.
        if (!/^\d*\.?\d*$/.test(valor)) {

            return;

        }

        setValorReferencia(valor);

        setErroValor('');

    }


    //----------------- CONTINUAR PARA AÇÃO ------------------//

    function continuarParaAcao() {

        // Verifica se existe um fator selecionado.
        if (!fatorSelecionado) {

            alert('Selecione um fator psicossocial.');

            return;

        }

        // Valida o valor de referência.
        const resultadoValidacao = validarCondicao(
            valorReferencia,
            []
        );

        if (!resultadoValidacao.valido) {

            setErroValor(resultadoValidacao.erroValor);

            return;

        }

        setErroValor('');


        // Organiza os dados para enviar à próxima etapa.
        const dadosCondicao = {

            fator: Number(fator),

            id_psicossocial_fator: Number(fator),

            nome_fator: fatorSelecionado.nome,

            operador,

            valor_referencia: Number(valorReferencia)

        };


        // Envia os dados para a próxima etapa.
        if (continuar) {

            continuar(dadosCondicao);

        }

    }


    //----------------- TELA ----------------------------------//

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

                        <span className="pagina-atual-regra">
                            Nova Regra
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* CONTEÚDO PRINCIPAL */}

            <main className="conteudo-cadastro-regra">

                <section className="cartao-condicao-regra">


                    {/* CABEÇALHO DA CONDIÇÃO */}

                    <div className="cabecalho-condicao-regra">

                        <h2>Defina a condição</h2>

                        <p>
                            Informe quando esta regra deverá ser acionada
                            automaticamente pelo sistema.
                        </p>

                    </div>


                    {/* COMPONENTE DA CONDIÇÃO */}

                    <CondicaoRegra

                        fator={fator}
                        setFator={setFator}

                        fatores={fatores}
                        carregandoFatores={carregandoFatores}
                        erroFatores={erroFatores}

                        operador={operador}
                        setOperador={setOperador}

                        valorReferencia={valorReferencia}
                        alterarValorReferencia={alterarValorReferencia}

                        erroValor={erroValor}

                    />


                    {/* RESULTADO DA CONDIÇÃO */}

                    <ResultadoCondicaoRegra

                        fator={fatorSelecionado?.nome || ''}

                        operador={operador}

                        valorReferencia={valorReferencia}

                    />


                    {/* AVISO INFORMATIVO */}

                    <div className="aviso-motor-regras">

                        <span className="icone-aviso-regra">
                            ⓘ
                        </span>

                        <p>
                            O Motor de Regras permite configurar condições
                            para identificar situações que precisam de
                            atenção e executar ações automaticamente.
                        </p>

                    </div>


                    {/* BOTÕES */}

                    <BotaoSalvarCancelar

                        voltar={voltar}

                        onSalvar={continuarParaAcao}

                        textoBotao="Continuar para Ação"

                        formularioValido={
                            !erroValor &&
                            Boolean(fator) &&
                            !carregandoFatores &&
                            !erroFatores
                        }

                    />

                </section>

            </main>

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroRegra;
