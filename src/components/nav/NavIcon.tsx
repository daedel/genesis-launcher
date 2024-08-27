

function NavIcon({ svgPath }: { svgPath: string }) {

    return (
        <div className="flex items-center w-7 mx-3 justify-center">

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 22" height="100%" width="100%">
                <path fill="currentColor" d={svgPath}></path>
            </svg>

        </div>
    )
}

export default NavIcon;