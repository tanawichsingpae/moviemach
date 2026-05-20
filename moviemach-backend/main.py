from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import requests
import os
import re
from dotenv import load_dotenv

# =========================
# Setup
# =========================

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # สำหรับโปรเจกต์เรียน
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_KEY = os.getenv("TMDB_API_KEY")

# =========================
# Load Data
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

rec_df = pd.read_csv(os.path.join(BASE_DIR, "recommendations.csv"))
movies_df = pd.read_csv(os.path.join(BASE_DIR, "movies.csv"))
ratings_df = pd.read_csv(os.path.join(BASE_DIR, "ratings.csv"))

# =========================
# Average Rating
# =========================

avg_ratings = (
    ratings_df
    .groupby("movieId")["rating"]
    .mean()
    .reset_index()
)

avg_ratings.rename(columns={"rating": "avg_rating"}, inplace=True)

movies_df = movies_df.merge(
    avg_ratings,
    on="movieId",
    how="left"
)

movies_df["avg_rating"] = movies_df["avg_rating"].fillna(0).round(1)

# =========================
# Fix KNIME format
# =========================

rec_df.columns = rec_df.columns.str.strip()
movies_df.columns = movies_df.columns.str.strip()

rec_df["movieId"] = (
    rec_df["source_id"]
    .astype(str)
    .str.replace("Row", "", regex=False)
    .astype(int)
)

rec_df["recommended_movieId"] = rec_df["neighbor_id"].astype(int)
rec_df["distance"] = rec_df["distance"].abs()

# =========================
# Extract year
# =========================

movies_df["year"] = movies_df["title"].str.extract(r"\((\d{4})\)")
movies_df["year"] = pd.to_numeric(movies_df["year"], errors="coerce")

# =========================
# Poster Cache
# =========================

poster_cache = {}

def get_movie_data(title):
    if title in poster_cache:
        return poster_cache[title]

    if not TMDB_KEY:
        return {"poster": None, "overview": None, "trailer": None}

    match = re.search(r"\((\d{4})\)", title)
    year = match.group(1) if match else None
    clean_title = re.sub(r"\(\d{4}\)", "", title).strip()

    # 🔎 ค้นหาหนัง
    search_url = (
        f"https://api.themoviedb.org/3/search/movie"
        f"?api_key={TMDB_KEY}"
        f"&query={clean_title}"
        f"&language=th-TH"
    )

    if year:
        search_url += f"&year={year}"

    try:
        search_result = requests.get(search_url, timeout=5).json()
    except:
        return {"poster": None, "overview": None, "trailer": None}

    poster = None
    overview = None
    trailer = None

    if search_result.get("results"):
        movie_data = search_result["results"][0]
        tmdb_id = movie_data.get("id")

        poster_path = movie_data.get("poster_path")
        if poster_path:
            poster = f"https://image.tmdb.org/t/p/w500{poster_path}"

        overview = movie_data.get("overview")

        # 🎬 ดึง video
        video_url = (
            f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos"
            f"?api_key={TMDB_KEY}"
        )

        video_result = requests.get(video_url, timeout=5).json()

        if video_result.get("results"):
            for video in video_result["results"]:
                if video["site"] == "YouTube" and video["type"] == "Trailer":
                    trailer = video["key"]
                    break

    result = {
        "poster": poster,
        "overview": overview,
        "trailer": trailer
    }

    poster_cache[title] = result
    return result
# =========================
# API Routes
# =========================

@app.get("/")
def root():
    return {"message": "MovieMach API running 🚀"}

from fastapi import HTTPException

@app.get("/movie/{movie_id}")
def get_movie(movie_id: int):
    movie = movies_df[movies_df["movieId"] == movie_id]

    if movie.empty:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie = movie.iloc[0]

    tmdb_data = get_movie_data(movie["title"])

    return {
        "movieId": int(movie["movieId"]),
        "title": movie["title"],
        "genres": movie["genres"],
        "avg_rating": float(movie["avg_rating"]),
        "poster": tmdb_data["poster"],
        "overview": tmdb_data["overview"] or "ไม่มีคำอธิบาย",
        "trailer": tmdb_data["trailer"]
    }

@app.get("/recommend/{movie_id}")
def recommend(movie_id: int):

    selected_movie = movies_df[movies_df["movieId"] == movie_id]
    if selected_movie.empty:
        return []

    selected_genre_set = set(selected_movie.iloc[0]["genres"].split("|"))

    all_recs = rec_df[rec_df["movieId"] == movie_id]

    if all_recs.empty:
        return []

    results = []

    for _, row in all_recs.iterrows():

        rec_movie = movies_df[
            movies_df["movieId"] == row["recommended_movieId"]
        ]

        if rec_movie.empty:
            continue

        rec_data = rec_movie.iloc[0]

        rec_genre_set = set(rec_data["genres"].split("|"))
        common_genres = selected_genre_set.intersection(rec_genre_set)

        tmdb_data = get_movie_data(rec_data["title"]) or {}

        results.append({
            "movieId": int(rec_data["movieId"]),
            "title": rec_data["title"],
            "poster": tmdb_data.get("poster"),
            "avg_rating": rec_data.get("avg_rating"),
            "distance": row["distance"],
            "genre_match": len(common_genres),
            "genres": rec_data["genres"]
        })

    # 🔥 เอา distance เป็นหลักก่อน
    sorted_results = sorted(
        results,
        key=lambda x: (x["distance"], -x["genre_match"])
    )

    return sorted_results[:15]  # 👈 เพิ่มเป็น 15 เรื่อง

@app.get("/recommend_all/{movie_id}")
def recommend_all(movie_id: int):
    selected_movie = movies_df[movies_df["movieId"] == movie_id]

    if selected_movie.empty:
        return []

    selected_genres = selected_movie.iloc[0]["genres"]
    selected_genre_set = set(selected_genres.split("|"))

    all_recs = rec_df[rec_df["movieId"] == movie_id]

    temp_list = []

    for _, row in all_recs.iterrows():

        rec_movie = movies_df[
            movies_df["movieId"] == row["recommended_movieId"]
        ]

        if rec_movie.empty:
            continue

        rec_data = rec_movie.iloc[0]

        rec_genre_set = set(rec_data["genres"].split("|"))
        common_genres = selected_genre_set.intersection(rec_genre_set)
        tmdb_data = get_movie_data(rec_data["title"])

        temp_list.append({
            "movieId": int(rec_data["movieId"]),
            "title": rec_data["title"],
            "poster": tmdb_data["poster"],
            "avg_rating": rec_data["avg_rating"],
            "distance": row["distance"],
            "genre_match": len(common_genres),
            "genres": rec_data["genres"]   # 🔥 เพิ่มบรรทัดนี้
        })

    sorted_results = sorted(
        temp_list,
        key=lambda x: (-x["genre_match"], x["distance"])
    )
    return sorted_results
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import requests
import os
import re
from dotenv import load_dotenv

# =========================
# Setup
# =========================

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # สำหรับโปรเจกต์เรียน
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_KEY = os.getenv("TMDB_API_KEY")

# =========================
# Load Data
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

rec_df = pd.read_csv(os.path.join(BASE_DIR, "recommendations.csv"))
movies_df = pd.read_csv(os.path.join(BASE_DIR, "movies.csv"))
ratings_df = pd.read_csv(os.path.join(BASE_DIR, "ratings.csv"))

# =========================
# Average Rating
# =========================

avg_ratings = (
    ratings_df
    .groupby("movieId")["rating"]
    .mean()
    .reset_index()
)

avg_ratings.rename(columns={"rating": "avg_rating"}, inplace=True)

movies_df = movies_df.merge(
    avg_ratings,
    on="movieId",
    how="left"
)

movies_df["avg_rating"] = movies_df["avg_rating"].fillna(0).round(1)

# =========================
# Fix KNIME format
# =========================

rec_df.columns = rec_df.columns.str.strip()
movies_df.columns = movies_df.columns.str.strip()

rec_df["movieId"] = (
    rec_df["source_id"]
    .astype(str)
    .str.replace("Row", "", regex=False)
    .astype(int)
)

rec_df["recommended_movieId"] = rec_df["neighbor_id"].astype(int)
rec_df["distance"] = rec_df["distance"].abs()

# =========================
# Extract year
# =========================

movies_df["year"] = movies_df["title"].str.extract(r"\((\d{4})\)")
movies_df["year"] = pd.to_numeric(movies_df["year"], errors="coerce")

# =========================
# Poster Cache
# =========================

poster_cache = {}

def get_movie_data(title):
    if title in poster_cache:
        return poster_cache[title]

    if not TMDB_KEY:
        return {"poster": None, "overview": None, "trailer": None}

    match = re.search(r"\((\d{4})\)", title)
    year = match.group(1) if match else None
    clean_title = re.sub(r"\(\d{4}\)", "", title).strip()

    # 🔎 ค้นหาหนัง
    search_url = (
        f"https://api.themoviedb.org/3/search/movie"
        f"?api_key={TMDB_KEY}"
        f"&query={clean_title}"
        f"&language=th-TH"
    )

    if year:
        search_url += f"&year={year}"

    try:
        search_result = requests.get(search_url, timeout=5).json()
    except:
        return {"poster": None, "overview": None, "trailer": None}

    poster = None
    overview = None
    trailer = None

    if search_result.get("results"):
        movie_data = search_result["results"][0]
        tmdb_id = movie_data.get("id")

        poster_path = movie_data.get("poster_path")
        if poster_path:
            poster = f"https://image.tmdb.org/t/p/w500{poster_path}"

        overview = movie_data.get("overview")

        # 🎬 ดึง video
        video_url = (
            f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos"
            f"?api_key={TMDB_KEY}"
        )

        video_result = requests.get(video_url, timeout=5).json()

        if video_result.get("results"):
            for video in video_result["results"]:
                if video["site"] == "YouTube" and video["type"] == "Trailer":
                    trailer = video["key"]
                    break

    result = {
        "poster": poster,
        "overview": overview,
        "trailer": trailer
    }

    poster_cache[title] = result
    return result
# =========================
# API Routes
# =========================

@app.get("/")
def root():
    return {"message": "MovieMach API running 🚀"}

from fastapi import HTTPException

@app.get("/movie/{movie_id}")
def get_movie(movie_id: int):
    movie = movies_df[movies_df["movieId"] == movie_id]

    if movie.empty:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie = movie.iloc[0]

    tmdb_data = get_movie_data(movie["title"])

    return {
        "movieId": int(movie["movieId"]),
        "title": movie["title"],
        "genres": movie["genres"],
        "avg_rating": float(movie["avg_rating"]),
        "poster": tmdb_data["poster"],
        "overview": tmdb_data["overview"] or "ไม่มีคำอธิบาย",
        "trailer": tmdb_data["trailer"]
    }

from fastapi import Query

@app.get("/recommend/{movie_id}")
def recommend(
    movie_id: int,
    limit: int = Query(7, ge=1)
):
    selected_movie = movies_df[movies_df["movieId"] == movie_id]

    if selected_movie.empty:
        return []

    selected_genres = selected_movie.iloc[0]["genres"] or ""
    selected_genre_set = set(selected_genres.split("|"))

    all_recs = rec_df[rec_df["movieId"] == movie_id]

    temp_list = []

    for _, row in all_recs.iterrows():

        rec_movie = movies_df[
            movies_df["movieId"] == row["recommended_movieId"]
        ]

        if rec_movie.empty:
            continue

        rec_data = rec_movie.iloc[0]

        rec_genres = rec_data["genres"] or ""
        rec_genre_set = set(rec_genres.split("|"))
        common_genres = selected_genre_set.intersection(rec_genre_set)

        tmdb_data = get_movie_data(rec_data["title"])

        temp_list.append({
            "movieId": int(rec_data["movieId"]),
            "title": rec_data["title"],
            "poster": tmdb_data["poster"],
            "avg_rating": rec_data["avg_rating"],
            "distance": row["distance"],
            "genre_match": len(common_genres),
            "genres": rec_genres
        })

    sorted_results = sorted(
        temp_list,
        key=lambda x: (-x["genre_match"], x["distance"])
    )

    return sorted_results[:limit]
from fastapi import Query

@app.get("/movies")
def get_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1)
):
    # เรียงตาม rating ก่อน
    sorted_movies = movies_df.sort_values(
        by="avg_rating",
        ascending=False
    )

    total = len(sorted_movies)

    start = (page - 1) * limit
    end = start + limit

    paginated_movies = sorted_movies.iloc[start:end]

    results = []

    for _, movie in paginated_movies.iterrows():
        tmdb_data = get_movie_data(movie["title"])

        results.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": movie["genres"],
            "avg_rating": float(movie["avg_rating"]),
            "poster": tmdb_data["poster"]
        })

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total // limit) + (1 if total % limit > 0 else 0),
        "data": results
    }
@app.get("/search")
def search(q: str):

    results = movies_df[
        movies_df["title"].str.contains(q, case=False, na=False)
    ].head(8)

    output = []

    for _, row in results.iterrows():

        tmdb_data = get_movie_data(row["title"])

        output.append({
            "movieId": int(row["movieId"]),
            "title": row["title"],
            "genres": row["genres"],
            "avg_rating": float(row["avg_rating"]),
            "poster": tmdb_data["poster"]
        })

    return output

@app.get("/")
def root():
    return {"status": "ok"}