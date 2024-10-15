

function NavIcon({ svgPath }: { svgPath: string }) {

    return (
        <div className="flex items-center w-7 ml-3 justify-center">

            <img src={svgPath} className="size-6"></img>

        </div>
    )
}

export default NavIcon;