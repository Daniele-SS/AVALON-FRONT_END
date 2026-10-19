
import CadastroColaborador from './cadastroColaborador.jsx';

//----------------- COMPONENTE ------------------------------//

function EditarColaborador({
    colaborador,
    usuario,
    voltar,
    onSalvar
}) {
    return (
        <CadastroColaborador
            modoEdicao={true}
            colaborador={colaborador}
            usuario={usuario}
            onVoltar={voltar}
            onSalvar={onSalvar}
        />
    );
}

//----------------- EXPORTAÇÃO ------------------------------//

export default EditarColaborador;
