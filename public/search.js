document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');

    
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchQuery = document.getElementById('searchQuery').value.trim();

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ searchQuery })
            });

            if (response.ok) {
                const results = await response.json();
                console.log(results); // Check the results in the console
            } else {
                console.error('Error fetching search results');
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    });
});
