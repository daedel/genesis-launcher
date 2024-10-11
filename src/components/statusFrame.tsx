

function StatusFrame({ downloaded, downloadSpeed, timeLeft }: {
    downloaded: string;
    downloadSpeed: string;
    timeLeft: string;
}) {

    return (
        <div className="flex flex-col justify-center w-[25%] h-[110px] absolute top-16 bg-status_frame bg-no-repeat bg-cover left-1/2 -translate-x-1/2">
            <p className="text-lg font-light font-serif text-[#BDA68C] uppercase italic mt-2">Pobieranie | GRA</p>
            <p className="text-xs font-light font-sans text-[#BDA68C] mt-2">{downloaded} / {downloadSpeed}</p>
            <p className="text-xs font-light font-sans text-[#BDA68C] mt-1">Pozostały czas: {timeLeft}</p>

        </div>
    )
}
export default StatusFrame;
