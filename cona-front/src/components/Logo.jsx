import logo from "@/assets/CONA.png";

export default function Logo({
                                 className = "mx-auto w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-card",
                                 imgClassName = "w-full h-full object-contain"
                             }) {
    return (
        <div className={className}>
            <img src={logo} alt="CONA" className={imgClassName}/>
        </div>
    );
}
