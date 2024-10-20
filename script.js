fetch('tracks_genres_updated.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const trackList = document.getElementById('track-list');

        if (Array.isArray(data)) {
            data.forEach(track => {
                const trackDiv = document.createElement('div');
                trackDiv.classList.add('track');
                
                const trackLink = document.createElement('a');
                trackLink.href = `https://www.google.com/search?q=${encodeURIComponent(track['Track Title'])}+${encodeURIComponent(track['Artist'])}`;
                trackLink.target = '_blank';
                trackLink.innerText = `${track['Track Title']} by ${track['Artist']}`;
                
                const genreSpan = document.createElement('span');
                genreSpan.classList.add('genre');
                genreSpan.innerText = track['Genres']; 
                
                trackDiv.appendChild(trackLink);
                trackDiv.appendChild(genreSpan);
                
                trackList.appendChild(trackDiv);
            });
        } else {
            console.error('Data is not an array:', data);
        }
    })
    .catch(error => console.error('Error loading JSON:', error));
