

function StatusFrame({ downloaded, downloadSpeed, timeLeft }: {
    downloaded: string;
    downloadSpeed: string;
    timeLeft: string;
}) {

    return (
        <div className="absolute flex flex-col justify-center w-[200px] h-[110px] top-[44px] bg-status_frame bg-no-repeat bg-contain left-1/2 -translate-x-1/2 z-10">
            <p className="text-xs font-light font-serif text-[#BDA68C] uppercase italic mt-1">Pobieranie | GRA</p>
            <p className="text-xs font-light font-sans text-[#BDA68C] mt-1">{downloaded} / {downloadSpeed}</p>
            <p className="text-xs font-light font-sans text-[#BDA68C] mt-1">Pozostały czas: {timeLeft}</p>

        </div>
    )
}
export default StatusFrame;
