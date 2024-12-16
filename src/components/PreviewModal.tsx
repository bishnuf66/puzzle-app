import { useEffect, useState } from "react";

interface PreviewModalProps {
  imgUrl: string;
  closePreviewModal: () => void;
}

function PreviewModal({ imgUrl, closePreviewModal }: PreviewModalProps) {
  const [timeLeft, setTimeLeft] = useState(5); // Initialize with 5 seconds

  useEffect(() => {
    console.log("Modal mounted timer will start");
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          closePreviewModal();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => {
      console.log("Modal unmounted clearing timer");
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ">
      <div className="relative bg-white p-4 rounded shadow-lg max-w-1/2 max-h-1/2">
        {/* Close Button */}
        <div
          onClick={closePreviewModal}
          className="text-right text-red-500 cursor-pointer"
        >
          Close
        </div>

        {/* Timer Overlay */}
        <div className="relative left-1/2 transform -translate-x-1/2  text-black text-lg font-bold px-3 py-1 text-center">
          {timeLeft} seconds left
        </div>

        {/* Image */}
        <img src={imgUrl} alt="Preview" className="max-w-full max-h-96" />
      </div>
    </div>
  );
}

export default PreviewModal;
