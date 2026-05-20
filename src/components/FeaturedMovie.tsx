import { Play, Info, Star } from "lucide-react";

interface FeaturedMovieProps {
  image: string;
  title: string;
  subtitle: string;
}

const FeaturedMovie = ({ image, title, subtitle }: FeaturedMovieProps) => {
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[600px] overflow-hidden">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 overlay-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-32 overlay-gradient-bottom" />

      <div className="relative z-10 flex flex-col justify-end h-full min-h-[500px] md:min-h-[600px] px-6 md:px-12 pb-16 max-w-xl">
        <h2 className="font-display text-4xl md:text-6xl tracking-wide text-foreground mb-3">
          {title}
        </h2>
        <p className="text-sm text-secondary-foreground/60 mb-6 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity">
            <Play className="w-4 h-4 fill-current" />
            PLAY
          </button>
          <button className="w-10 h-10 rounded-full border border-foreground/30 flex items-center justify-center hover:bg-foreground/10 transition-colors">
            <Info className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMovie;
