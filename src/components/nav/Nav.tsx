import NavLink from "./NavLink";

import {discrod_svg_path} from "../../assets/svgs";


function NavSeparator(){
    return (
        <div className="bg-[#544232] w-px h-5">

        </div>
    )
}
function Nav() {

    return (
        <div className="py-5 px-28">
            <nav className="block">
                <div className="flex items-center justify-between">
                    <NavLink navText={"Wiki"} navLink={"https://genesis.presb.pl/"}/>
                    <NavSeparator/>
                    <NavLink navText={"Discord"} navLink={"https://genesis.presb.pl/"} navIcon={discrod_svg_path}/>
                    <NavSeparator/>
                    <NavLink navText={"Forum"} navLink={"https://genesis.presb.pl/"}/>
                </div>

            </nav>

        </div>
    )
}

export default Nav;