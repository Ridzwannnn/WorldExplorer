const fs = require('fs');
const path = require('path');

const itineraryPath = path.join(__dirname, 'Files');
if (!fs.existsSync(itineraryPath)) {
    fs.mkdirSync(itineraryPath);
}

document.addEventListener('DOMContentLoaded', () => {
    const itineraryForm = document.getElementById('itineraryForm');
    const activityForm = document.getElementById('activityForm');
    const itinerariesDiv = document.getElementById('itineraries');
    const btnEdit = document.getElementById('btnEdit');
    const btnCreate = document.getElementById('btnCreate');
    const btnRead = document.getElementById('btnRead');
    const btnDelete = document.getElementById('btnDelete');
    let currentFile = null;

    // Load itineraries from the directory
    function loadItineraries() {
        fs.readdir(itineraryPath, (err, files) => {
            if (err) {
                console.error("Could not list the directory.", err);
                return;
            }

            itinerariesDiv.innerHTML = '';
            files.forEach((file) => {
                const itineraryDiv = document.createElement('div');
                itineraryDiv.className = 'itinerary-item';
                itineraryDiv.innerHTML = `
                    <h3>${file.replace(/_/g, ' ').replace('.txt', '')}</h3>
                    <button class="view" onclick="readItinerary('${file}')">View</button>
                    <button class="edit" onclick="editItinerary('${file}')">Edit</button>
                    <button class="delete" onclick="deleteItinerary('${file}')">Delete</button>
                `;
                itinerariesDiv.appendChild(itineraryDiv);
            });
        });
    }

    // Read itinerary details from file
    window.readItinerary = (fileName) => {
        const filePath = path.join(itineraryPath, fileName);
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                alert("Error: " + err.message);
                return;
            }
            const [destination, date, ...details] = data.split('\n').map(line => line.split(': ')[1]);
            alert(`Destination: ${destination}\nDate: ${date}\nActivities: ${details.join(', ')}`);
        });
    };

    // Edit the selected itinerary
    window.editItinerary = (fileName) => {
        const filePath = path.join(itineraryPath, fileName);
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                alert("Error: " + err.message);
                return;
            }
            const [destination, date, ...details] = data.split('\n').map(line => line.split(': ')[1]);
            document.getElementById('countryData').value = destination;
            document.getElementById('dateInput').value = date;
            document.getElementById('activityInput').value = details.join(', ');
            btnEdit.style.display = 'inline';
            currentFile = fileName;
        });
    };

    // Submit the itinerary form to create or update an itinerary
    itineraryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const destination = document.getElementById('countryData').value;
        const date = document.getElementById('dateInput').value;
        const activities = document.getElementById('activityInput').value.split(',').map(act => act.trim());

        const fileName = currentFile || `${destination.replace(/\s+/g, '_')}_${date}.txt`;
        const content = `Destination: ${destination}\nDate: ${date}\nActivities: ${activities.join(', ')}`;
        const filePath = path.join(itineraryPath, fileName);

        fs.writeFile(filePath, content, (err) => {
            if (err) {
                alert("Error: " + err.message);
                return;
            }
            alert(`${currentFile ? "Updated" : "Created"} successfully!`);
            itineraryForm.reset();
            btnEdit.style.display = 'none';
            currentFile = null;
            loadItineraries();
        });
    });

    // Button to save changes when editing
    btnEdit.addEventListener('click', () => {
        itineraryForm.dispatchEvent(new Event('submit'));
    });

    // Delete the selected itinerary
    window.deleteItinerary = (fileName) => {
        const filePath = path.join(itineraryPath, fileName);
        fs.unlink(filePath, (err) => {
            if (err) {
                alert("Error: " + err.message);
                return;
            }
            alert(`${fileName} deleted successfully!`);
            loadItineraries();
        });
    };

    loadItineraries();
});

//---------------------------------------------------------------------------------------------------------------------------

// Sample API URL for fetching country data
const apiUrl = 'https://restcountries.com/v3.1/name/';

document.getElementById('search-button').addEventListener('click', async () => {
    const countryName = document.getElementById('country-input').value.trim();
    if (countryName) {
        await fetchCountryInfo(countryName);
    } else {
        alert('Please enter a country name');
    }
});

async function fetchCountryInfo(countryName) {
    try {
        const response = await fetch(apiUrl + countryName);
        if (!response.ok) throw new Error('Country not found');
        
        const countries = await response.json();
        displayCountryInfo(countries[0]);
        await fetchNeighboringCountries(countries[0].borders); // Fetch neighbors using borders
    } catch (error) {
        document.getElementById('country-info').innerHTML = `<p>${error.message}</p>`;
    }
}

function displayCountryInfo(country) {
    const countryInfoDiv = document.getElementById('country-info');
    countryInfoDiv.innerHTML = `
        <h2>${country.name.common}</h2>
        <div style="display: flex; align-items: center;">
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" width="200" style="margin-right: 20px;">
            <img src="${country.coatOfArms?.svg || ''}" alt="Coat of Arms of ${country.name.common}" width="200">
        </div>
        <p><strong>Area:</strong> ${country.area} km²</p>
        <p><strong>Continent:</strong> ${country.continents.join(', ')}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Subregion:</strong> ${country.subregion}</p>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Languages:</strong> ${Object.values(country.languages).join(', ')}</p>
        <p><strong>Time Zone:</strong> ${country.timezones.join(', ')}</p>
        <p><strong>Population:</strong> ${country.population}</p>
        <p><strong>Location:</strong> ${country.latlng[0]}, ${country.latlng[1]}</p>
        <p><strong>View on Map:</strong> <a href="https://www.google.com/maps?q=${country.name.common}" target="_blank">Click here</a></p>
    `;
}

// New function to fetch neighboring countries
async function fetchNeighboringCountries(borders) {
    if (!borders || borders.length === 0) {
        document.getElementById('neighbors-info').innerHTML = '<p>No neighboring countries found.</p>';
        return;
    }

    const neighborsDiv = document.getElementById('neighbors-info');
    neighborsDiv.innerHTML = ''; // Clear previous neighbors

    for (const border of borders) {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${border}`);
            if (!response.ok) throw new Error('Neighbor country not found');
            const neighbor = await response.json();
            const neighborData = neighbor[0];

            neighborsDiv.innerHTML += `
                <div>
                    <h3>${neighborData.name.common}</h3>
                    <img src="${neighborData.flags.svg}" alt="Flag of ${neighborData.name.common}" width="100">
                    <img src="${neighborData.coatOfArms?.svg || ''}" alt="Coat of Arms of ${neighborData.name.common}" width="100">
                </div>
            `;
        } catch (error) {
            console.error(error.message);
        }
    }
}
