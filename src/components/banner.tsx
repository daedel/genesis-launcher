import logo from "../assets/logo.webp";
import PlayButton from "./playButton";


function Banner() {

    return (
        <div className="flex bg-hero bg-cover pt-7 h-60 justify-around">
            <div className="block">
                <a href="https://genesis.presb.pl" className="">
                    <img src={logo} className="object-scale-down w-60" ></img>
                </a>
            </div>
            <PlayButton/>
        </div>
    )
}

export default Banner;