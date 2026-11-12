import { useEffect,useState } from "react";
import { ArrowUpRight,ArrowRight,Search,MapPin,CalendarDays,BedDouble,Heart } from "lucide-react";
import { apartmentAPI } from "../services/api";
import { getImage } from "../utils/apartmentImages";
import ApartmentDetails from "../components/ApartmentDetails";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
export default function Home({ isLoggedIn, onLogout }) {
 const navigate = useNavigate();
 const [apartments,setApartments]=useState([]);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const [favorites,setFavorites]=useState([]);
 const [city,setCity]=useState('');
 const [bedrooms,setBedrooms]=useState('');
 const [checkIn,setCheckIn]=useState('');
 const [checkOut,setCheckOut]=useState('');
 const [selected,setSelected]=useState(null);
 async function loadApartments(filters={}){setLoading(true);setError('');try{setApartments(await apartmentAPI.getAll(filters));}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{loadApartments();},[]);
 function handleSearch(event){event.preventDefault();if(Boolean(checkIn)!==Boolean(checkOut)){setError('Please select both check-in and check-out dates.');return;}const d=new Date();const today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');if(checkIn&&(checkIn<today||checkOut<=checkIn)){setError('Please choose valid check-in and check-out dates.');return;}loadApartments({city,bedrooms,check_in:checkIn,check_out:checkOut});document.getElementById('residences')?.scrollIntoView({behavior:'smooth'});}
 function toggleFavorite(id){setFavorites(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);}
 return <>
 <Navbar isLoggedIn={isLoggedIn} onSignOut={onLogout} />

      <section id="home" className="relative flex min-h-[760px] items-center overflow-hidden bg-[#373e36]">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90"
          alt="Modern apartment interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 lg:px-10">
          <p className="mb-7 text-xs uppercase tracking-[0.3em] text-white/80">
            A considered way to stay
          </p>
          <h1 className="font-serif text-[clamp(4rem,8vw,8rem)] leading-[0.99] tracking-[-0.055em] text-white">
            Spaces to
            <br />
            <span className="italic">call yours.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-8 text-white/85">
            Discover thoughtfully selected apartments that feel less like
            somewhere to stay, and more like somewhere to belong.
          </p>
          <a
            href="#residences"
            className="mt-10 inline-flex items-center gap-3 border-b border-white/80 pb-2 text-sm text-white"
          >
            Discover our residences <ArrowUpRight size={17} />
          </a>
        </div>
      </section>


      <section className="relative z-20 mx-auto -mt-12 max-w-6xl px-5">
        <form
          onSubmit={handleSearch}
          className="grid gap-5 rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.09)] backdrop-blur-2xl md:grid-cols-5 md:items-end"
        >
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <MapPin size={15} /> City
            </span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Any city"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <CalendarDays size={15} /> Check-in
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <CalendarDays size={15} /> Check-out
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <BedDouble size={15} /> Bedrooms
            </span>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#303b33] px-6 py-4 text-sm text-white transition hover:bg-[#465649]"
          >
            <Search size={17} /> Search
          </button>
        </form>
      </section>


      <section id="residences" className="mx-auto max-w-7xl px-6 pb-28 pt-32 lg:px-10">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#7a8779]">
          The collection
        </p>
        <h2 className="mb-12 font-serif text-5xl tracking-[-0.04em] md:text-6xl">
          Stay somewhere
          <br />
          <span className="italic text-[#7c897b]">extraordinary.</span>
        </h2>

        {loading && (
          <p role="status" className="py-12 text-stone-500">
            Finding beautiful spaces...
          </p>
        )}

        {error && (
          <p role="alert" className="mb-8 text-red-700">{error}</p>
        )}

        {!loading && !error && apartments.length === 0 && (
          <div className="rounded-3xl border border-stone-200 p-12 text-center">
            <h3 className="font-serif text-3xl">No residences found.</h3>
            <p className="mt-3 text-stone-500">
              Try different filters or check back for new listings.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {apartments.map((apartment) => (
              <article key={apartment.id} className="group">
                <div className="relative aspect-[4/4.5] overflow-hidden rounded-[20px] bg-stone-200">
                  <img
                    src={getImage(apartment.id)}
                    alt={`Illustrative interior for ${apartment.title}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(apartment.id)}
                    aria-label={`Favorite ${apartment.title}`}
                    aria-pressed={favorites.includes(apartment.id)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl"
                  >
                    <Heart
                      size={18}
                      fill={favorites.includes(apartment.id) ? "#303b33" : "none"}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(apartment)}
                    aria-label={`View ${apartment.title}`}
                    className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white"
                  >
                    <ArrowUpRight size={19} />
                  </button>
                </div>

                <div className="mt-5">
                  <h3 className="font-serif text-2xl">{apartment.title}</h3>
                  <p className="mt-2 flex items-center gap-1 text-sm text-stone-500">
                    <MapPin size={14} />
                    {apartment.city} · {apartment.address}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
                  <p className="text-sm text-stone-500">
                    {apartment.bedrooms} bedroom{apartment.bedrooms !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">
                      PKR {Number(apartment.price_per_night).toLocaleString()}
                    </span>
                    <span className="text-stone-500"> / night</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>


      <section id="about" className="bg-[#e9ebe5]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <img
            src="https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85"
            alt="Thoughtfully designed interior"
            className="aspect-[4/5] w-full rounded-[24px] object-cover"
          />
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.25em] text-[#788577]">
              More than a place
            </p>
            <h2 className="font-serif text-5xl leading-[1.1] tracking-[-0.04em]">
              Feel at home,
              <br />
              <span className="italic text-[#7c897b]">wherever you are.</span>
            </h2>
            <p className="mt-8 max-w-md leading-8 text-stone-600">
              We believe the best stays are the ones that make you feel
              connected. Every space is selected with comfort and thoughtful
              living in mind.
            </p>
            <a
              href="#residences"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#303b33] px-7 py-4 text-sm text-white"
            >
              Explore the collection <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>


 <Footer />
 <ApartmentDetails
   apartment={selected}
   onClose={() => setSelected(null)}
   isLoggedIn={isLoggedIn}
   onSignIn={() => { setSelected(null); navigate("/login"); }}
 />
 </>;
}
