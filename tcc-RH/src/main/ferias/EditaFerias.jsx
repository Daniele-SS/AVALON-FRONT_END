
import CadastroFerias from './CadastroFerias.jsx';

function EditarFerias({
    ferias,
    voltar,
    onSucesso
}) {

    return (

        <CadastroFerias
            ferias={ferias}
            voltar={voltar}
            onSucesso={onSucesso}
            modoEdicao={true}
        />

    );

}

export default EditarFerias;
