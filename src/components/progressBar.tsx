

interface ProgressBarProps {
    completed: number,
    status: string
}

function ProgressBar({ completed, status }: ProgressBarProps) {
    let color = 'text-white';
    if (completed > 45) {
        color = 'text-black';
    }
    console.log('completed: ', completed)
    console.log('color: ', color)

    return (
        <div className="flex items-center justify-center w-full px-10">
            <div className="relative bg-progress-bg bg-auto bg-no-repeat h-14 w-full px-[1.35rem]" style={{ backgroundSize: "100% 100%"}}>
            <div
                className="bg-progress-fill bg-cover bg-no-repeat left-0 w-full h-full mt-2.5"
                style={{ clipPath: `inset(0 ${(100 - completed)}% 0 0)`, backgroundSize: "100% 65%" }}
            ></div>
            <p className={"absolute text-center left-1/2 -translate-x-1/2 top-[0.67rem] text-[15px] " + color }>{status}</p>
        </div>
        </div>
        
    )
    // clipPath: `inset(0 ${(100 - completed)}% 0 0)`
}
export default ProgressBar;