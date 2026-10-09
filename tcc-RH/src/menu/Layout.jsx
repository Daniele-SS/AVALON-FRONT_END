import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
    return (
        <div className="layout-sistema">
            <Sidebar />

            <main className="conteudo-principal">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout