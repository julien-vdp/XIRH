import { NextRequest, NextResponse } from 'next/server';

type OmdbSearchItem = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
};

type OmdbSearchResponse = {
  Response: 'True' | 'False';
  Search?: OmdbSearchItem[];
  Error?: string;
};

type OmdbTitleResponse = {
  Response: 'True' | 'False';
  imdbID?: string;
  Title?: string;
  Year?: string;
  Poster?: string;
  Runtime?: string;
  Error?: string;
};

const omdbUrl = 'https://www.omdbapi.com/';

function getApiKey() {
  return process.env.OMDB_API_KEY?.trim();
}

function unavailableResponse() {
  return NextResponse.json(
    { error: 'La recherche IMDb n’est pas encore configurée sur le serveur.' },
    { status: 503 },
  );
}

function posterUrl(poster: string | undefined) {
  return poster && poster !== 'N/A' ? poster : null;
}

export async function GET(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) return unavailableResponse();

  const id = request.nextUrl.searchParams.get('id')?.trim();
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!id && (!query || query.length < 2)) {
    return NextResponse.json({ error: 'Saisissez au moins deux caractères.' }, { status: 400 });
  }

  const endpoint = new URL(omdbUrl);
  endpoint.searchParams.set('apikey', apiKey);
  endpoint.searchParams.set('type', 'movie');
  endpoint.searchParams.set(id ? 'i' : 's', id ?? query!);

  try {
    const response = await fetch(endpoint, { next: { revalidate: 300 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'IMDb est temporairement indisponible.' }, { status: 502 });
    }

    if (id) {
      const movie = (await response.json()) as OmdbTitleResponse;
      if (movie.Response !== 'True' || !movie.imdbID || !movie.Title) {
        return NextResponse.json({ error: movie.Error ?? 'Film introuvable.' }, { status: 404 });
      }

      const duration = Number.parseInt(movie.Runtime ?? '', 10);
      return NextResponse.json({
        movie: {
          imdbId: movie.imdbID,
          title: movie.Title,
          year: movie.Year ?? '',
          posterUrl: posterUrl(movie.Poster),
          durationMin: Number.isFinite(duration) ? duration : 120,
        },
      });
    }

    const results = (await response.json()) as OmdbSearchResponse;
    if (results.Response !== 'True') {
      return NextResponse.json({ movies: [], message: results.Error ?? 'Aucun film trouvé.' });
    }

    return NextResponse.json({
      movies: (results.Search ?? []).slice(0, 5).map((movie) => ({
        imdbId: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        posterUrl: posterUrl(movie.Poster),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'IMDb est temporairement indisponible.' }, { status: 502 });
  }
}
