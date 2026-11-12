
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { getImage } from "../utils/apartmentImages";
import BookingForm from "./BookingForm";

export default function ApartmentDetails({
  apartment,
  onClose,
  isLoggedIn,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!apartment) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [apartment, onClose]);

  if (!apartment) return null;

  function handleSignIn() {
    onClose();
    navigate("/login");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apartment-dialog-title"
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#f8f7f4] p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close apartment details"
          className="absolute right-5 top-5 z-10 rounded-full bg-white p-2"
        >
          <X size={20} />
        </button>

        <img
          src={getImage(apartment.id)}
          alt={`Illustrative interior for ${apartment.title}`}
          className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover"
        />

        <h2
          id="apartment-dialog-title"
          className="font-serif text-4xl"
        >
          {apartment.title}
        </h2>

        <p className="mt-3 text-sm text-stone-500">
          {apartment.address}, {apartment.city}
        </p>

        <p className="mt-6 leading-7 text-stone-600">
          {apartment.description ||
            "A thoughtfully selected space for your next stay."}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
          <span>
            {apartment.bedrooms} bedroom
            {apartment.bedrooms !== 1 ? "s" : ""}
          </span>

          <strong>
            PKR {Number(apartment.price_per_night).toLocaleString()} / night
          </strong>
        </div>

        <BookingForm
          key={apartment.id}
          apartment={apartment}
          isLoggedIn={isLoggedIn}
          onSignIn={handleSignIn}
        />
      </div>
    </div>
  );
}
