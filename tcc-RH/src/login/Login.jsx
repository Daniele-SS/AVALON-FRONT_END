
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import loginIMG from "./img/icone-login.svg";
import emailIcone from "./img/icone-email.svg";
import senhaIcone from "./img/icone-senha.svg";
import ilustracao from "./img/ilustacao.svg";

function Login() {
    const navegar = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function entrar() {
        setMensagemErro('');

        if (!email.trim() || !senha) {
            setMensagemErro('Preencha o login e a senha.');
            return;
        }

        try {
            setCarregando(true);

            const resposta = await fetch(
                'http://localhost:8080/v1/senai/avalon/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        login: email.trim(),
                        senha: senha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                setMensagemErro(
                    dados.message ||
                    dados.mensagem ||
                    'Login ou senha inválidos.'
                );
                return;
            }

            const token =
                dados.access_token ||
                dados.response?.access_token;

            if (!token) {
                setMensagemErro(
                    'A API não retornou o token de autenticação.'
                );
                return;
            }

            localStorage.setItem('access_token', token);

            navegar('/dashboard');

        } catch (erro) {
            console.error('Erro ao fazer login:', erro);

            setMensagemErro(
                'Não foi possível conectar à API.'
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="login-lado-direito-esquerdo">
            <div className="lado-esquerdo">
                <div className="login-dados">
                    <img src={loginIMG} alt="login icone" />

                    <h2>Central do Funcionário</h2>
                    <p className="sub-titulo">
                        Gestão e Experiência do Colaborador
                    </p>

                    <p className="titulo">Faça seu login</p>
                    <p className="descricao">
                        Acesse sua conta para continuar
                    </p>

                    <div className="email">
                        <label htmlFor="email">E-mail</label>

                        <div className="input-com-icone">
                            <img src={emailIcone} alt="" />

                            <input
                                id="email"
                                type="text"
                                name="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                            />
                        </div>
                    </div>

                    <div className="senha">
                        <label htmlFor="senha">Senha</label>

                        <div className="input-com-icone">
                            <img src={senhaIcone} alt="" />

                            <input
                                id="senha"
                                type="password"
                                name="senha"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={(evento) => setSenha(evento.target.value)}
                            />
                        </div>
                    </div>

                    <div className="recuperar-senha-container">
                        <p className="recuperar-senha">
                            Esqueci minha senha
                        </p>
                    </div>

                    {mensagemErro && (
                        <p
                            style={{
                                color: '#d32f2f',
                                fontSize: '14px'
                            }}
                        >
                            {mensagemErro}
                        </p>
                    )}

                    <div className="btn-entrar">
                        <button
                            type="button"
                            onClick={entrar}
                            disabled={carregando}
                        >
                            {carregando ? 'Entrando...' : 'Entrar'}
                        </button>
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
