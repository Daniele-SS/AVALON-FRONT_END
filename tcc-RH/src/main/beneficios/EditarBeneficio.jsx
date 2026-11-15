
import CadastroBeneficio from './CadastroBeneficio.jsx';

function EditarBeneficio({ beneficio, voltar, onSucesso }) {

    return (

        <CadastroBeneficio
            beneficio={beneficio}
            voltar={voltar}
            onSucesso={onSucesso}
            modoEdicao={true}
        />

    );

}

export default EditarBeneficio;
