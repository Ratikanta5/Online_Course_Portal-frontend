const InputField = ({ label, icon, value, onChange, type, placeholder }) => (
  <div>
    <label className="text-sm font-medium text-gray-800">{label}</label>

    <div className="relative mt-1">
      <div className="absolute left-3 top-3">{icon}</div>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className="
          w-full pl-12 pr-4 py-3 rounded-lg 
          border border-gray-300 bg-white
          focus:ring-2 focus:ring-blue-400
          outline-none
        "
      />
    </div>
  </div>
);

export default InputField;
