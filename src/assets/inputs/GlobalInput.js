

export const GlobalInput=({name,label,type,value,onChange,error})=>{

    return (
        <div>
            <label className="font-medium">
                {label}
            </label>
            <input
                name={name}
                onChange={onChange}
                value={value || ""}
                type={type}
                required
                className={`w-full mt-2 px-3 py-2 border ${
                    error ? "border-red-500" : value ? "border-green-900" : "border-gray-300"
                } rounded-lg`}/>
            {error&& <p className="text-red-500 text-sm mt-1">{error}</p>}


        </div>
    )
}