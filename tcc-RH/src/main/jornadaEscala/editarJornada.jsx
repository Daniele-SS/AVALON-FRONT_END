
 //----------------- IMPORTAÇÕES -----------------------------//

import CadastroJornada from './cadastroJornada.jsx';


//----------------- COMPONENTE ------------------------------//

function EditarJornada({ jornada, diasSemana, voltar }) {

    return (

        <CadastroJornada
            jornada={jornada}
            diasSemana={diasSemana}
            voltar={voltar}
            modoEdicao={true}
        />

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default EditarJornada;
