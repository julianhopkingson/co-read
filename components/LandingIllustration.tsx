export function LandingIllustration() {
    return (
        <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto">
            {/* Main Circle - Night Sky */}
            <div className="absolute inset-0 rounded-full bg-[#1e293b] overflow-hidden shadow-2xl ring-4 ring-offset-4 ring-offset-background ring-slate-100 border border-slate-700">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#334155]" />

                {/* Stars */}
                <div className="absolute w-full h-full opacity-60">
                    <div className="absolute top-[20%] left-[20%] w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_white]" />
                    <div className="absolute top-[30%] right-[30%] w-1 h-1 bg-white rounded-full shadow-[0_0_3px_white]" />
                    <div className="absolute top-[15%] right-[15%] w-0.5 h-0.5 bg-white rounded-full" />
                    <div className="absolute bottom-[30%] left-[10%] w-1 h-1 bg-white rounded-full opacity-50" />
                    <div className="absolute top-[50%] left-[80%] w-0.5 h-0.5 bg-white rounded-full" />
                    {/* Shooting Star */}
                    <div className="absolute top-[10%] left-[40%] w-8 h-px bg-gradient-to-r from-transparent via-white to-transparent -rotate-45 opacity-30" />
                </div>

                {/* Moon */}
                <div className="absolute top-12 left-10 w-14 h-14 bg-gray-200 rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.2)] opacity-90">
                    <div className="absolute top-3 left-4 w-2 h-2 bg-gray-300 rounded-full/50" />
                    <div className="absolute bottom-4 right-3 w-4 h-4 bg-gray-300 rounded-full/50" />
                </div>

                {/* Central Rocket / Tower */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-12 h-40">
                    {/* Rocket Body */}
                    <div className="w-full h-full bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-t-full flex items-center justify-center shadow-lg relative">
                        {/* Strip */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 h-full bg-indigo-300/20" />
                        {/* Window */}
                        <div className="w-4 h-4 rounded-full bg-cyan-200 mt-4 shadow-[0_0_5px_cyan]" />
                    </div>
                    {/* Wings */}
                    <div className="absolute bottom-0 -left-3 w-3 h-12 bg-indigo-700 rounded-tl-lg skew-y-12 origin-bottom-right" />
                    <div className="absolute bottom-0 -right-3 w-3 h-12 bg-indigo-700 rounded-tr-lg -skew-y-12 origin-bottom-left" />
                </div>

                {/* Satellite / Tower */}
                <div className="absolute bottom-0 right-[20%] w-8 h-32 bg-slate-700 rounded-t-lg opacity-80 z-0 flex flex-col items-center">
                    <div className="w-0.5 h-full bg-slate-600" />
                    <div className="absolute top-4 w-4 h-2 bg-blue-500 shadow-[0_0_8px_blue]" />
                    <div className="absolute -top-6 w-0.5 h-6 bg-slate-500" />
                    <div className="absolute -top-6 w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                </div>

                {/* Mountains */}
                <div className="absolute bottom-0 left-[-20%] right-[-20%] h-24 bg-[#0f172a] transform -skew-y-3 opacity-90" />
                <div className="absolute bottom-[-10px] left-[-20%] right-[-20%] h-24 bg-black transform skew-y-2 opacity-80" />
            </div>
        </div>
    );
}
