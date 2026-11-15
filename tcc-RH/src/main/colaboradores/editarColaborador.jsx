
import CadastroColaborador from './cadastroColaborador.jsx';


//----------------- COMPONENTE ------------------------------//

function EditarColaborador({
    colaborador,
    usuario,
    voltar,
    onSalvar,
    onNotificacao
}) {

    return (
        <CadastroColaborador
            modoEdicao={true}
            colaborador={colaborador}
            usuario={usuario}
            onVoltar={voltar}
            onSalvar={onSalvar}
            onNotificacao={onNotificacao}
        />
    );
}


//----------------- EXPORTAÇÃO ------------------------------//

export default EditarColaborador;
