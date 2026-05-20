import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star, Clock, Calendar, Play, Plus, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/movie/${id}`)
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
  }, [id]);
  useEffect(() => {
  if (!id) return;

  setRecommended([]); // 👈 เคลียร์ของเก่าก่อน

  fetch(`${import.meta.env.VITE_API_URL}/recommend/${id}`)
    .then((res) => res.json())
    .then((data) => setRecommended(data))
    .catch((err) => console.error(err));
}, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  // แยกปีออกจาก title เช่น "Aladdin (1992)"
  const yearMatch = movie.title?.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : "";
  const cleanTitle = movie.title?.replace(/\(\d{4}\)/, "").trim();

  const genres = movie.genres ? movie.genres.split("|") : [];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ================= HERO BACKDROP ================= */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={movie.backdrop || movie.poster}
          alt={cleanTitle}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-16 lg:px-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">

            {/* Poster */}
            <img
              src={movie.poster}
              alt={`${cleanTitle} poster`}
              className="hidden w-56 rounded-lg shadow-2xl ring-1 ring-border md:block lg:w-64"
            />

            {/* Info */}
            <div className="flex flex-1 flex-col gap-4">
              <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                {cleanTitle}
              </h1>

              {movie.tagline && (
                <p className="text-sm italic text-muted-foreground md:text-base">
                  {movie.tagline}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <Star className="h-4 w-4 fill-current" />
                  {movie.avg_rating || "N/A"}
                </span>

                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {year}
                  </span>
                )}

                {movie.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {movie.runtime}
                  </span>
                )}

                {movie.maturity && (
                  <Badge variant="outline" className="text-xs">
                    {movie.maturity}
                  </Badge>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {genres.map((g: string) => (
                  <Badge key={g} className="bg-white/10 text-white">
                    {g}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-2 flex gap-3">
                {movie.trailer && (
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => setShowTrailer(true)}
                    >
                    <Play className="h-5 w-5 fill-current" />
                    Play Trailer
                    </Button>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DETAILS ================= */}
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-4 text-xl font-bold">เรื่องย่อ</h2>
            <p className="leading-relaxed text-muted-foreground">
              {movie.overview || "ไม่มีคำอธิบาย"}
            </p>
          </div>

          <div className="space-y-6">
            {movie.director && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  ผู้กำกับ
                </h3>
                <p className="font-medium">{movie.director}</p>
              </div>
            )}

            {movie.cast && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  นักแสดง
                </h3>
                <ul className="space-y-1">
                  {movie.cast.map((s: string) => (
                    <li key={s} className="font-medium">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ================= RECOMMENDED ================= */}
{recommended.length > 0 && (
  <div className="px-6 md:px-16 lg:px-24 pb-20">
    <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold">
        หนังที่คุณอาจจะชอบ
    </h2>

    <button
        onClick={() => navigate(`/movies/recommended/${id}`)}
        className="text-sm text-primary hover:underline"
    >
        View All
    </button>
    </div>

    <div className="flex gap-6 overflow-x-auto">
      {recommended.map((rec) => (
        <div
          key={rec.movieId}
          onClick={() => navigate(`/movie/${rec.movieId}`)}
          className="group w-44 shrink-0 cursor-pointer"
        >
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={rec.poster}
              alt={rec.title}
              className="rounded-xl group-hover:scale-110 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition" />
          </div>

          <p className="mt-2 text-sm text-zinc-300 group-hover:text-white truncate">
            {rec.title}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
      {/* ================= TRAILER MODAL ================= */}
{showTrailer && movie.trailer && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={() => setShowTrailer(false)}
  >
    <div
      className="relative w-full max-w-4xl aspect-video"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute -top-10 right-0 text-white text-2xl"
        onClick={() => setShowTrailer(false)}
      >
        ✕
      </button>

      <iframe
        className="w-full h-full rounded-xl shadow-2xl"
        src={`https://www.youtube.com/embed/${movie.trailer}?autoplay=1`}
        title="Movie Trailer"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  </div>
)}

    </div>
  );
};

export default MovieDetail;