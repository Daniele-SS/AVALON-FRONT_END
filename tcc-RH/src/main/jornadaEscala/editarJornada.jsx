
 //----------------- IMPORTAÇÕES -----------------------------//

import CadastroJornada from './cadastroJornada.jsx';


//----------------- COMPONENTE ------------------------------//

function EditarJornada({
    jornada,
    diasSemana,
    voltar,
    onSucesso
}) {

    return (

        <CadastroJornada
            jornada={jornada}
            diasSemana={diasSemana}
            voltar={voltar}
            onSucesso={onSucesso}
            modoEdicao={true}
        />

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default EditarJornada;
