import NavIcon from "./NavIcon";

interface NavLinkProrps {
    navText: string;
    navLink: string;
    navIcon?: string;
}


function NavLink({ navText, navLink, navIcon }: NavLinkProrps) {
    return (
        <a className="inline-flex ml-5 items-center py-2 px-5 text-white text-[13px] font-thin uppercase font-['Barlow'] hover:text-[#544232] hover:bg-[#bda68c] rounded transition-colors" href={navLink} target="_blank">
            <div className="text-white">{navText}</div>
            {navIcon && <NavIcon svgPath={navIcon} />}
        </a>
    )
}

export default NavLink;