import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";

interface Movie {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
}

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const moviesPerPage = 20;


  useEffect(() => {
  if (!query) {
    setMovies([]);
    return;
  }

  // 🔥 ล้างผลเก่าทันที
  setMovies([]);
  setLoading(true);

  fetch(`${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      const formatted = data.map((movie: any) => ({
        id: movie.movieId,
        image: movie.poster || "https://via.placeholder.com/300x450",
        title: movie.title,
        subtitle: `⭐ ${movie.avg_rating}`,
      }));

      setMovies(formatted);
      setCurrentPage(1);
    })
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
}, [query]);

  // Pagination Logic
  const indexOfLast = currentPage * moviesPerPage;
  const indexOfFirst = indexOfLast - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="px-12 py-10 pt-28">
        {loading ? (
  <p className="text-center text-gray-400 text-lg mt-10 animate-pulse">
    กำลังค้นหา...
  </p>
) : (
  <>
    {query && (
      <h2 className="text-3xl mb-8">
        ผลการค้นหา: "{query}"
      </h2>
    )}

    {movies.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {currentMovies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>
    ) : (
      <p className="text-gray-400 mt-10 text-center">
        ไม่พบภาพยนตร์ที่ค้นหา
      </p>
    )}
  </>
)}

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;