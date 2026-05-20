import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";

interface Movie {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
}

const MoviesPage = () => {
  const { type } = useParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const moviesPerPage = 20;

  useEffect(() => {
  if (!type) return;

  let url = "";

  if (type === "recommended") {
    url = `${import.meta.env.VITE_API_URL}/recommend/1?limit=50`;
  } else if (type === "top") {
    url = `${import.meta.env.VITE_API_URL}/movies?page=1&limit=50`;
  } else {
    return; // กันกรณี type แปลก ๆ
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {

      const movieArray =
        type === "recommended"
          ? data
          : data.data;

      const formatted = movieArray.map((movie: any) => ({
        id: movie.movieId,
        image: movie.poster || "https://via.placeholder.com/300x450",
        title: movie.title,
        subtitle: `⭐ ${movie.avg_rating}`,
      }));

      setMovies(formatted);
    })
    .catch((err) => console.error(err));
}, [type]);

  // Pagination Logic
  const indexOfLast = currentPage * moviesPerPage;
  const indexOfFirst = indexOfLast - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="px-12 py-10">
        <h2 className="text-3xl mb-8 capitalize">{type} Movies</h2>

        {/* 5 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {currentMovies.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10 gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-primary text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {index + 1}
            </button>
          ))}

          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 bg-gray-700 text-white rounded"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MoviesPage;