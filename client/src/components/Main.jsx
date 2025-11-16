import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Main = () => {
    const nav = useNavigate();

    const {userData, isLoggedin} = useContext(AppContext);

    return (
        <div className="flex flex-col items-center mt-20 px-4 text-center text-slate-800">
            <h1>Hey {userData ? userData.name : "developer"}!</h1>
            <h2>Welcome to our app.</h2>
            <p className="px-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore earum sapiente reiciendis nesciunt nulla quidem rerum a officia! Vitae, voluptatibus magnam voluptate quos tenetur nam provident. Officiis possimus velit eius?</p>
            {!isLoggedin && 
                <button className="mt-2 border border-gray-500 rounded-lg px-4 py-2 hover:bg-gray-100" onClick={() => nav("/login")}>Get Started</button>}
        </div>
    )
}

export default Main;