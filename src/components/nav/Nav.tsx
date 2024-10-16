import NavLink from "./NavLink";
import wiki_icon from "../../assets/wiki_icon.svg";
import discord_icon from "../../assets/discord_icon.svg";
import forum_icon from "../../assets/forum_icon.svg";



function NavSeparator(){
    return (
        <div className="pl-[1px] mx-3 bg-[#544232] w-[0px] h-5 z-1000"></div>
    )
}
function Nav() {

    return (
        <div className="py-0 px-48">
            <nav className="block">
                <div className="flex items-center justify-center">
                    <NavLink navText={"Wiki"} navLink={"https://genesis.presb.pl/"} navIcon={wiki_icon}/>
                    <NavSeparator/>
                    <NavLink navText={"Discord"} navLink={"https://genesis.presb.pl/"} navIcon={discord_icon}/>
                    <NavSeparator/>
                    <NavLink navText={"Forum"} navLink={"https://genesis.presb.pl/"} navIcon={forum_icon}/>
                </div>

            </nav>

        </div>
    )
}

export default Nav;