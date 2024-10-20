const CLIENT_ID = '5cbf9885282d43bb9d2937dd8e58bf85';
const CLIENT_SECRET = 'eddf77e4d1ef48bfbb55a27784db8c25';

let tracksData; // Declare globally
let accessToken; // To store the access token

// Function to get access token
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    accessToken = data.access_token;
}

// Fetch tracks data and access token
document.addEventListener('DOMContentLoaded', async () => {
    await getAccessToken(); // Get access token first

    fetch('tracks_genres_updated.json')
        .then(response => response.json())
        .then(data => {
            tracksData = data; // Store the tracks data
        })
        .catch(error => console.error('Error loading JSON:', error));

    document.getElementById('song-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting

        const userSongs = Array.from(event.target.elements)
            .filter(input => input.tagName === 'INPUT') // Get input elements
            .map(input => input.value.trim()); // Get their values

        const songDetails = userSongs.map(song => {
            const [title, artist] = song.split(' - '); // Split input into title and artist
            return { title: title.trim(), artist: artist ? artist.trim() : '' }; // Return object
        });

        // Fetch Spotify genres for user songs and compare
        fetchSpotifyGenresAndCompare(songDetails);
    });
});

// Function to fetch Spotify genres and compare with JSON
async function fetchSpotifyGenresAndCompare(songDetails) {
    const userGenres = new Set();
    const userArtists = new Set();

    for (const { title, artist } of songDetails) {
        const track = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}%20artist:${encodeURIComponent(artist)}&type=track`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const trackData = await track.json();

        if (trackData.tracks.items.length > 0) {
            const trackInfo = trackData.tracks.items[0];
            const artistId = trackInfo.artists[0].id;

            // Fetch artist genres
            const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const artistData = await artistResponse.json();
            artistData.genres.forEach(genre => userGenres.add(genre)); // Add genres to userGenres
            userArtists.add(trackInfo.artists[0].name); // Add artist to userArtists
        }
    }

    // Cross-reference with existing genres and artists
    const commonGenres = new Set();
    const commonArtists = new Set();

    tracksData.forEach(track => {
        // Check for common genres
        track['Genres'].split(', ').forEach(genre => {
            if (userGenres.has(genre)) {
                commonGenres.add(genre);
            }
        });

        // Check for common artists
        const artistNames = track['Artist'].split(', '); // Assuming multiple artists are comma-separated
        artistNames.forEach(artist => {
            if (userArtists.has(artist.trim())) {
                commonArtists.add(artist.trim());
            }
        });
    });

    // Display results
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h2>Results:</h2>`;
    resultDiv.innerHTML += `<p>You have common genres: ${Array.from(commonGenres).join(', ') || 'None'}</p>`;
    resultDiv.innerHTML += `<p>You have common artists: ${Array.from(commonArtists).join(', ') || 'None'}</p>`;
}
