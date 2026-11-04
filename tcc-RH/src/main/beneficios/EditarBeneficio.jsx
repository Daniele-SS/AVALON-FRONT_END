
import CadastroBeneficio from './CadastroBeneficio.jsx';

function EditarBeneficio({ beneficio, voltar }) {

    return (

        <CadastroBeneficio
            beneficio={beneficio}
            voltar={voltar}
            modoEdicao={true}
        />

    );

}

export default EditarBeneficio;
