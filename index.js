const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let selectedTypes = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  // Previous button
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 prevButton" value="${currentPage - 1}"><</button>
    `);
  }

  let startPage = Math.max(1, currentPage - 2); // Display 2 pages before the current page
  let endPage = Math.min(startPage + 4, numPages); // Display 4 pages in total


  for (let i = startPage; i <= endPage; i++) {
    if (i == currentPage) { // Highlight current page
      $('#pagination').append(`
      <button class="btn btn-info page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
    } else {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
      `);
    }
  }

  // Next button
  if (currentPage < numPages) {
    $('#pagination').append(`
        <button class="btn btn-primary page ml-1 nextButton" value="${currentPage + 1}">></button>
      `);
  }

  // Show count information
  $('#pagination').append(`
    <div class="countInfo">Displayed: ${PAGE_SIZE} | Total Pokémons: ${pokemons.length}</div>
  `);
  ;
}

// Function to display the count information
const showCountInfo = (currentPage, numPages, pokemons) => {
  $('.countInfo').text(`Displayed: ${PAGE_SIZE} | Total Pokémons: ${pokemons.length}`);
};


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })

  // Show count information
  showCountInfo(currentPage, Math.ceil(pokemons.length / PAGE_SIZE), pokemons.length);

}

const setup = async () => {

  $('#pokeCards').empty()
  // Fetch list of Pokemon
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  // Fetch types of Pokemon
  let typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
  types = typesResponse.data.results;

  // Create the checkbox group for types
  const typeCheckboxGroup = types.map(type => `
    <div class="form-check form-check-inline">
      <input class="form-check-input typeCheckbox" type="checkbox" value="${type.name}" id="${type.name}">
      <label class="form-check-label" for="${type.name}">
        ${type.name}
      </label>
    </div>
  `).join('');

  // Append the checkbox group to the page
  $('#typeFilter').append(typeCheckboxGroup);




  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

  // Event listener for previous button
  $('body').on('click', '.prevButton', async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons)

    updatePaginationDiv(currentPage, numPages)
  }
  );

  // Event listener for next button
  $('body').on('click', '.nextButton', async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons)

    updatePaginationDiv(currentPage, numPages)
  }
  );

  // Event listener for type checkboxes
  $('body').on('change', '.typeCheckbox', async function () {
    const selectedTypes = $('.typeCheckbox:checked').map(function () {
      return $(this).val();
    }).get();

    // Filter pokemons based on selected types
    filteredPokemons = pokemons.filter(pokemonName=> {
      const pokemon = pokemons.find(p => p.name === pokemonName);
      if (!pokemon) return false; // Pokemon not found
      const res = axios.get(pokemon.url);
      const types = res.data.types.map(typeData => typeData.type.name);
      for (const type of types) {
        if (selectedTypes.includes(type)) {
          return true;
        }
      }
      return false;
    });

    // Update pagination and display filtered pokemons
    currentPage = 1;
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
    updatePaginationDiv(currentPage, numPages);
  });


}

$(document).ready(setup)
