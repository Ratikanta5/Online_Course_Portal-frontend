import { motion } from "framer-motion";

const SubmitButton = ({ text }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    className="
      w-full py-3 bg-blue-600 text-white font-semibold 
      rounded-lg shadow-md hover:bg-blue-700 transition
    "
  >
    {text}
  </motion.button>
);
export default SubmitButton;
