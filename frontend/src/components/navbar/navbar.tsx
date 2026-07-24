import { useContext } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router";



export default function Navbar(){
    const {darkMode, setDarkMode} = useContext(GlobalStatesContext);
    
    const buttonStyle = `${darkMode ? 'text-white' : 'text-black'} font-[5  00] cursor-pointer hover:underline underline-offset-5`;

    return <div className={`${darkMode ? 'bg-neutral-900 text-white' : 'bg-white text-black shadow-md/20'} 
    sticky flex flex-row items-center justify-end h-20 gap-5 pl-10 pr-10`}>
        <NavLink to='/websites' className={buttonStyle}>Websites</NavLink>
        <NavLink to='/deployments' className={buttonStyle}>Deployments</NavLink>
        <button onClick={() => setDarkMode(!darkMode)}
        className={`${darkMode ? 'bg-black' : 'bg-white shadow-md/20'} cursor-pointer p-2 rounded-md`}>
            Dark Mode <FontAwesomeIcon icon={darkMode ? faMoon : faSun}/>
        </button>
    </div>
}