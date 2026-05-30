import { CiCircleCheck } from "react-icons/ci";

function LoginSuccesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl transition-all border border-gray-100 animate-scale-in">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-green-50 p-3 text-green-500 animate-pulse">
            <CiCircleCheck size={64} className="stroke-[0.5]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Login Successful
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            You have successfully logged in to the system.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all cursor-pointer"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginSuccesModal;
