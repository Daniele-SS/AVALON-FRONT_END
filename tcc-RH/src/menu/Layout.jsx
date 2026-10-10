import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../header/header';

function Layout() {
    return (
        <div className="layout-sistema">
            <Sidebar />

            <div className="area-direita">
                <Header />

                <main className="conteudo-principal">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;