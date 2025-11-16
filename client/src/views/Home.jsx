import Navbar from "../components/Navbar"
import Main from "../components/Main"

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen ">
            <Navbar />
            <Main />
        </div>
    )
}

export default Home