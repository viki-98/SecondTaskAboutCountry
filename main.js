const fetchDataBtn = document.getElementById('fetchDataBtn');
const searchDataBtn = document.getElementById('searchDataBtn');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loader');
const countryHelper = document.getElementById('country-helper');
let countryHelperArr = [];
const baseUrl = 'https://restcountries.com/v3.1';

//Function need to prepare available countries for searching helper.
populateCountryForHelper();

//Function calling API base on url parameter. @baseUrl + @url.
async function fetchData(url) {
    try {
        toogleLoader(true);
        const response = await fetch(`${baseUrl}${url}`);
        setTimeout(() => {
            toogleLoader(false);
        }, 1000);
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

//Function creating general countries info, like population and so on.
function totalCountriesInfo(data) {
    let totalPopulation = 0;

    for (const country of data) {
        totalPopulation += country.population;
    }

    const averagePopulation = Math.floor(totalPopulation / data.length);

    let results = `
      <div class="total-information-block">Total countries result: <b>${data.length}</b></div> 
      <div class="total-information-block">Total Countries Population: <b>${totalPopulation}</b></div> 
      <div class="total-information-block">Average Population: <b>${averagePopulation}</b></div>
  `;

    const el = document.getElementById('countriesInfo');
    el.innerHTML = results;
}

//Function calling API for all countries and displaying all related information.
async function getAllCountries() {
    try {
        const data = await fetchData('/all');
        totalCountriesInfo(data);
        getCountryAndPopulation(data);
        getRegion(data);
        // populateCountryForHelper(data);
    } catch (error) {
        console.log(error);
    }
}

//Function calling API for specific country and displaying information about this country.
async function getCountryDetails() {
    try {
        const searchValue = document.getElementById('searchInput').value;
        const data = await fetchData(`/name/${searchValue}`);
        totalCountriesInfo(data);
        getCountryAndPopulation(data);
        getRegion(data);
    } catch (error) {
        console.log(error);
    }
}

//Function creating country and population table.
function getCountryAndPopulation(data) {
    let tableStructure = `
      <tr >
          <th class="table-cell">Country Name</th>
          <th class="table-cell">Number of citizens</th>
      </tr>
       `;

    let countryAndPopulation = '';

    for (const country of data) {
        countryAndPopulation += dataHtml(country);
    }

    const tableHeader = document.getElementById('table_head');
    const tableBody = document.getElementById('table_body');

    tableHeader.innerHTML = tableStructure;
    tableBody.innerHTML = countryAndPopulation;
}

//Function creating entries for country and population table.
function dataHtml(data) {
    return `
          <tr class="table-body">
              <td class="table-cell">${data.name.common}</td>
              <td class="table-cell">${data.population}</td>
          </tr>
       `;
}

//Function creating table to display region statistics.
function getRegion(data) {
    let regionTableStructure = `
      <tr>
          <th class="table-cell">Region</th>
          <th class="table-cell">Number of countries</th>
      </tr>
      `;

    let regionCount = {};

    for (const country of data) {
        if (!regionCount[country.region]) {
            regionCount[country.region] = 0;
        }
        regionCount[country.region]++;
    }

    let regionStats = getRegionStats(regionCount);

    const tableHeader = document.getElementById('table-head_region');
    const tableBody = document.getElementById('table-body_region');

    tableHeader.innerHTML = regionTableStructure;
    tableBody.innerHTML = regionStats;
}

//Function creating entries for region statistics table.
function getRegionStats(regionCount) {
    let regionStats = '';
    for (const region in regionCount) {
        regionStats += `
          <tr>
              <td class="table-cell">${region}</td>
              <td class="table-cell">${regionCount[region]}</td>
          </tr>

      `;
    }
    return regionStats;
}

//Function adding/removing loading icon base on @isLoaderShown flag.
function toogleLoader(isLoaderShown) {
    if (isLoaderShown) {
        loader.classList.add('show-loader');
    } else {
        loader.classList.remove('show-loader');
    }
}

//Function adding paragraph for additional tables.
function showParagraph() {
    const infoParagraph = document.getElementById('paragraph');
    infoParagraph.classList.add('show-paragraph');
}

//Function preparing data for country helper.
async function populateCountryForHelper() {
    const data = await fetchData('/all');
    let countryForHelper = [];

    for (const country of data) {
        countryForHelper.push(country.name.official);
    }
    countryHelperArr = countryForHelper;
}

//Event for show all button.
fetchDataBtn.addEventListener('click', () => {
    showParagraph();
    getAllCountries();
});

//Event for search button.
searchDataBtn.addEventListener('click', () => {
    showParagraph();
    getCountryDetails();
});

//Event for input field, need to run country helper mechanism.
searchInput.addEventListener('keyup', (e) => {
    let value = e.target.value;
    let filteredArr = countryHelperArr
        .filter((item) => {
            return item.includes(value);
        })
        .slice(0, 10);

    let countryHelperElements = '';

    filteredArr.forEach((element) => {
        countryHelperElements += setItemsForCountryHelper(element);
    });

    const countryHelper = document.getElementById('country-helper');
    countryHelper.innerHTML = countryHelperElements;
    onClickSelectedCountry();
    if (filteredArr.length === 0) {
        toggleCountryHelper(false);
        return;
    }
    toggleCountryHelper(true);
});

//Function creating entries for country helper selection.
function setItemsForCountryHelper(element) {
    return `
          <div class="country-helper-item" >
              ${element}
          </div>
       `;
}

//Function adding event listener for every country helper entries.
//Event listener need to set up selected value from country helper to input field.
function onClickSelectedCountry() {
    const countryHelperItems = document.getElementsByClassName(
        'country-helper-item'
    );

    Array.from(countryHelperItems).forEach((item) => {
        item.addEventListener('click', (e) => {
            searchInput.value = e.target.innerText;
            toggleCountryHelper(false);
        });
    });
}

//Function displaying country helper based on flag @isCountryHelperShown
function toggleCountryHelper(isCountryHelperShown) {
    if (isCountryHelperShown) {
        countryHelper.classList.add('show-country-helper');
    } else {
        countryHelper.classList.remove('show-country-helper');
    }
}

