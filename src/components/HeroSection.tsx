import { Play, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [movie, setMovie] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
  const baseMovieId = 1;

  fetch(`${import.meta.env.VITE_API_URL}/movie/${baseMovieId}`)
    .then((res) => res.json())
    .then((data) => {
      setMovie(data);
    })
    .catch((err) => console.error("Movie fetch error:", err));
}, []);

if (!movie) return null;
const genres = movie.genres ? movie.genres.split("|") : [];
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      
      <img
        src={movie.poster}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-12 pb-24 max-w-2xl">
        
        <h2 className="text-5xl md:text-7xl text-white mb-4">
          {movie.title}
        </h2>

        <p className="text-sm text-gray-300 mb-2">
          ⭐ {movie.avg_rating}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {genres.map((g: string) => (
            <span
              key={g}
              className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs rounded-full"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/movie/${movie.movieId}`)}
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            VIEW DETAILS
          </button>

          <button
            onClick={() => navigate(`/movie/${movie.movieId}`)}
            className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;