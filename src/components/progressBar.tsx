

interface ProgressBarProps {
    completed: Number,
}

function ProgressBar({ completed }: ProgressBarProps) {
    return ( 
        <div className="flex mt-20 mx-10 bg-[#e0e0de] h-8 rounded-lg">
            <div
                className="px-10 h-[100%] bg-[#76c7c0] w-0 rounded-lg"
                style={{ width: `${completed}%` }}
            ></div>
        </div>
    )

}
export default ProgressBar;