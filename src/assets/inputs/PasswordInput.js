import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";
import {useState} from "react";

 export const PasswordInput = ({ name, label, value, onChange, error }) => {
     const [showPassword, setShowPassword] = useState({});

     return (
        <div>
            <label className="font-medium">{label}</label>
            <div className="relative mt-2">
                <input
                    name={name}
                    value={value}
                    onChange={onChange}
                    type={showPassword[name] ? "text" : "password"}
                    required
                    className={`w-full px-8 py-2 pr-10 border rounded-lg ${
                        error ? "border-red-500" : value ? "border-green-900" : "border-gray-300"
                    }`}
                />
                <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                    onClick={() =>
                        setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }))
                    }
                >
          {showPassword[name] ? (

              <AiOutlineEye size={24} />
          ) : (
              <AiOutlineEyeInvisible size={24} />
          )}
        </span>
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
};