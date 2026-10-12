//----------------- IMPORTAÇÕES ----------------------------//

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import './css-setores/cadastroSetor.css';

//----------------- COMPONENTE -----------------------------//

function CadastroSetor({ voltar }) {
    return (
        <>
            <div className="cabecalho-novo-setor">
                <BotaoCadastro
                    titulo="Novo setor"
                    descricao="Gerencie dados cadastrais, vínculos funcionais e status operacionais dos colaboradores."
                >
                    <nav className="caminho-cadastro-setor">
                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Setores
                        </button>

                        <span className='seta'>&gt;</span>

                        <span className="pagina-atual-setor">
                            Novo setor
                        </span>
                    </nav>
                </BotaoCadastro>
            </div>

            {/* Mantenha aqui os campos do seu formulário */}
        </>
    );
}

//----------------- EXPORTAÇÃO -----------------------------//

export default CadastroSetor;