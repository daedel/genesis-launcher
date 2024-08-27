import NavIcon from "./NavIcon";

interface NavLinkProrps {
    navText: string;
    navLink: string;
    navIcon?: string;
}


function NavLink({ navText, navLink, navIcon }: NavLinkProrps) {
    return (
        <a className="inline-flex items-center px-10 py-3 text-white uppercase font-medium font-['Barlow'] hover:text-[#544232] hover:bg-[#bda68c] rounded transition-colors" href={navLink} target="_blank">
            <div className="text-white">{navText}</div>
            {navIcon && <NavIcon svgPath={navIcon} />}
        </a>
    )
}

export default NavLink;