//----------------- IMPORTAÇÕES -----------------------------//

import CadastroFerias from './CadastroFerias.jsx';


//----------------- COMPONENTE ------------------------------//

function EditarFerias({
    ferias,
    voltar
}) {

    return (

        <CadastroFerias
            ferias={ferias}
            voltar={voltar}
            modoEdicao={true}
        />

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default EditarFerias;