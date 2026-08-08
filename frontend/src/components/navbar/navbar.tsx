import { useContext, useEffect, useRef, useState } from "react"
import { GlobalStatesContext } from "../../contexts/GlobalStatesContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faPlus, faSun } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router";



export default function Navbar() {
    const { darkMode, setDarkMode } = useContext(GlobalStatesContext);
    const [dropDowns, setDropDowns] = useState({
        deployments: false,
    })


    const dropdownButtonStyle = `${darkMode ? 'bg-black hover:bg-neutral-900' : 'bg-white hover:bg-gray-200'} cursor-pointer block w-40 p-2 duration-75 ease-out rounded-xs`

    const buttonStyle = ({ isActive }) => `${isActive ? `${darkMode ? 'text-white' : 'text-black'} underline`
        : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`} 
    font-[500] cursor-pointer hover:underline underline-offset-5 select-none`;

    const deploymentsDropdown = useRef(null);

    useEffect(() => {
        function handleClickOutside(e, ref, target: string) {
            if (ref.current && !ref.current.contains(e.target)) {
                setDropDowns(prev => ({ ...prev, [target]: false }));
            }
        }

        const handleClickDeployments = (e) => handleClickOutside(e, deploymentsDropdown, 'deployments');

        document.addEventListener('mousedown', handleClickDeployments)

        return () => {
            document.removeEventListener('mousedown', handleClickDeployments);
        }
    }, [])

    return <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-black shadow-md/20'} 
    sticky top-0 left-0 flex flex-row items-center justify-end h-20 gap-5 pl-10 pr-10 z-10`}>
        <NavLink to='/config' className={buttonStyle}>Config</NavLink>
        <NavLink to='/websites' className={buttonStyle}>Tracked websites</NavLink>
        <NavLink to='/deployments' 
        className={buttonStyle}>Deployments</NavLink>
        <div className="relative">
        <button onClick={() => setDropDowns({ ...dropDowns, deployments: !dropDowns.deployments })}
            className={`${darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-white hover:bg-gray-200'} cursor-pointer p-1 ring-2 ring-neutral-700 rounded-x text-[14px] duration-75 ease-out`}>
                <FontAwesomeIcon icon={faPlus}/></button>
            {dropDowns.deployments &&
                <div ref={deploymentsDropdown}
                    className={`${darkMode ? 'bg-black' : 'bg-white'} absolute top-9 right-0 p-2 ring-1 ring-neutral-700 text-[14px] rounded-md`} >
                    <NavLink to='/newDeployment' onClick={() => setDropDowns({ ...dropDowns, deployments: false })}
                        className={dropdownButtonStyle} >New deployment</NavLink>
                </div>}
        </div>
        <button onClick={() => {
            setDarkMode(!darkMode)
            localStorage.setItem('darkMode', JSON.stringify(!darkMode));
        }}
            className={`${darkMode ? 'bg-black' : 'bg-white shadow-md/20'} cursor-pointer p-2 rounded-md`}>
            {darkMode ? 'Dark' : 'Light'} mode <FontAwesomeIcon icon={darkMode ? faMoon : faSun} />
        </button>
    </div>
}