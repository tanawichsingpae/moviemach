import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import MovieCarousel from "@/components/MovieCarousel";
import FeaturedMovie from "@/components/FeaturedMovie";
import Footer from "@/components/Footer";

import featured1 from "@/assets/featured-1.jpg";

type Movie = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  genres: string;   // 👈 เพิ่มอันนี้
};

const Index = () => {
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filterMovies = (movies: Movie[]) => {
  if (selectedCategory === "All") return movies;

  return movies.filter((movie) => {
    if (!movie.genres) return false;

    const genreList = movie.genres.split("|");

    return genreList.includes(selectedCategory);
  });
};
  // 🔥 โหลด Top Rated จาก /movies
  useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/movies?page=1&limit=20`)
    .then((res) => res.json())
    .then((response) => {
      const formatted = response.data.map((movie: any) => ({
        id: movie.movieId,
        image: movie.poster
          ? movie.poster
          : "https://via.placeholder.com/300x450",
        title: movie.title,
        subtitle: `⭐ ${movie.avg_rating}`,
        genres: movie.genres,
      }));

      setTopMovies(formatted);
    })
    .catch((err) => console.error(err));
}, []);

  // 🔥 โหลด Recommend จาก KNIME
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/recommend/1`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((movie: any) => ({
          id: movie.movieId,
          image: movie.poster
            ? movie.poster
            : "https://via.placeholder.com/300x450",
          title: movie.title,
          subtitle: `⭐ ${movie.avg_rating}`,
          genres: movie.genres
        }));

        setRecommendedMovies(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoryFilter onChange={setSelectedCategory} />

      {/* 🔥 จาก KNIME */}
      <MovieCarousel
        title="Recommended For You"
        movies={filterMovies(recommendedMovies)}
        type="recommended"
      />

      {topMovies.length > 0 && (
  <FeaturedMovie
    image={topMovies[0].image}
    title={topMovies[0].title}
    subtitle={topMovies[0].subtitle}
  />
)}

      {/* 🔥 Top Rating */}
      <MovieCarousel
        title="Top Rated Movies"
        movies={filterMovies(topMovies)}
        type="top"
      />

      <Footer />
    </div>
  );
};

export default Index;