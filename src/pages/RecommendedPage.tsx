import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RecommendedPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/recommend/${id}?limit=30000`)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white px-10 py-16">
      <h1 className="text-3xl font-bold mb-10">
        หนังที่คล้ายกับเรื่องนี้
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.movieId}
            onClick={() => navigate(`/movie/${movie.movieId}`)}
            className="cursor-pointer group"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="rounded-xl group-hover:scale-105 transition"
            />
            <p className="mt-2 text-sm truncate">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedPage;