import loginIMG from "./img/icone-login.svg";
import emailIcone from "./img/icone-email.svg";
import senhaIcone from "./img/icone-senha.svg";
import ilustracao from "./img/ilustacao.svg";

function Login() {

    return (
        <div className="login-lado-direito-esquerdo">

            <div className="lado-esquerdo">

            <div className="login-dados">
                <img src={loginIMG} alt="login icone" />
                <h2>Central do Funcionário</h2>
                <p className="sub-titulo">Gestão e Experiência do Colaborador</p>

                <p className="titulo">Faça seu login</p>
                <p className="descricao">Acesse sua conta para continuar</p>

                <div className="email">
                    <label htmlFor="email">E-mail</label>
                    <div className="input-com-icone">
                        <img src={emailIcone} alt="email icone" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Digite seu e-mail"
                        />
                    </div>
                </div>

                <div className="senha">
                    <label htmlFor="senha">Senha</label>
                    <div className="input-com-icone">
                        <img src={senhaIcone} alt="senha icone" />
                        <input
                            id="senha"
                            type="password"
                            name="senha"
                            placeholder="Digite sua senha"
                        />
                    </div>
                </div>

            </div>
            </div>


            <div className="lado-direito">
                <img src={ilustracao} alt="ilustração" />

            </div>
        </div>


    );

}


export default Login;