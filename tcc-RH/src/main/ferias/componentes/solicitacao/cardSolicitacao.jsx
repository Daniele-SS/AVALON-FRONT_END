import './cardSolicitacao.css'
import SolicitacaoIcone from '../../img/solicitcao-icon.svg'

function CardSolicitacao() {

    return (
        <div className="card-solicitacao">

            <div className='cabecalho-card'>

                <div className='introducao'>

                    <div className='icone'>
                        <img src={SolicitacaoIcone} alt="icone de solicitação" />
                    </div>
                    <div className='nomes'>
                        <h2>Solicitações aguardando análise</h2>
                        <p>5 solicitações pendentes requerem verificação de escala e deferimento formal</p>
                    </div>
                </div>

                <button className='ver-tudo'>
                    <p>Ver todas as 5 pendências →</p>
                </button>

            </div>

            

        </div>
    );

} export default CardSolicitacao;