
 //----------------- IMPORTAÇÕES ----------------------------//

import './cardRegra.css';


//----------------- COMPONENTE ------------------------------//

function CardRegra({ regra }) {

    const fator = regra.fator_psicossocial
        ?.psicossocialFator;


    //----------------- INFORMAÇÕES --------------------------//

    const classificacao = String(
        regra.classificacao || ''
    ).toUpperCase();

    const statusAtivo = Number(regra.ativo) === 1;

    const valorReferencial = Number(
        regra.valor_referencial
    ).toFixed(2).replace('.', ',');

    const operador = regra.operador || '<';


    //----------------- CLASSE DA CLASSIFICAÇÃO -------------//

    function obterClasseClassificacao() {

        if (classificacao === 'PRIORIDADE') {
            return 'prioridade';
        }

        if (classificacao === 'ATENÇÃO') {
            return 'atencao';
        }

        return 'normal';

    }


    //----------------- TELA DO CARD -------------------------//

    return (

        <div className="card-regra">

            {/* CABEÇALHO */}

            <div className="cabecalho-regra">

                <div className="titulo-regra">

                    <span className="indicador-regra"></span>

                    <h3>
                        Regra #{String(regra.id).padStart(2, '0')}
                        {' • '}
                        {fator?.nome || 'Fator não identificado'}
                    </h3>

                </div>

            </div>


            {/* INFORMAÇÕES DA REGRA */}

            <div className="informacoes-resumo-regra">

                <span className="categoria-regra">
                    Fator psicossocial
                </span>

                <span
                    className={`status-regra ${
                        statusAtivo ? 'ativa' : 'inativa'
                    }`}
                >
                    {statusAtivo ? 'Ativa' : 'Inativa'}
                </span>

            </div>


            {/* CONDIÇÃO E RESULTADO */}

            <div className="detalhes-regra">

                {/* DADO */}

                <div className="item-detalhe-regra">

                    <span>DADO</span>

                    <strong>
                        {fator?.nome || 'Não informado'}
                    </strong>

                </div>


                {/* CONDIÇÃO */}

                <div className="item-detalhe-regra">

                    <span>CONDIÇÃO</span>

                    <strong>
                        Média {operador} {valorReferencial}
                    </strong>

                </div>


                {/* RESULTADO */}

                <div
                    className={`item-detalhe-regra resultado-regra ${
                        obterClasseClassificacao()
                    }`}
                >

                    <span>RESULTADO</span>

                    <strong>
                        <span className="ponto-resultado"></span>
                        {classificacao || 'Não informado'}
                    </strong>

                </div>


                {/* AÇÃO AUTOMÁTICA */}

                <div className="item-detalhe-regra acao-regra">

                    <span>AÇÃO AUTOMÁTICA</span>

                    <strong>
                        {regra.acao || 'Nenhuma ação definida'}
                    </strong>

                </div>

            </div>

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CardRegra;
