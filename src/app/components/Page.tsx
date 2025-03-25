'use client';

import { useEffect, useState } from 'react';
import { savedToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from './local_storage'
import { get } from 'http';

export default function PokemonSearch() {
    const [searchValue, setSearchValue] = useState('');
    const [infoContainer, setInfoContainer] = useState('');
    const [favoriteBtn, setFavoriteBtn] = useState('');
    const [currentNameOfPokemon, setCurrentNameOfPokemon] = useState<string>('');

    async function getPokemonData(name: string) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) {
            console.log('Pokemon not found');
            setInfoContainer(`<div class="flex justify-center text-white"><p>Pokémon not found</p></div>`)
            return;
        }
        const data = await response.json();
        setCurrentNameOfPokemon(data.name);
        return data;
    }

    async function getLocationData(pokemonId: number) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        const data = await response.json();
        return data;
    }

    async function getEvolutionChain(pokemonId: number) {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        return extractEvolutionChain(evolutionData.chain);
    }

    function extractEvolutionChain(chain: any) {
        let evolutionStages: string[] = [];
        function getEvolutionStages(evolutionChain: any) {
            if (!evolutionChain) return;
            evolutionStages.push(evolutionChain.species.name); // Add current evolution stage
            if (evolutionChain.evolves_to.length > 0) {
                getEvolutionStages(evolutionChain.evolves_to[0]); // Get the next stage
            }
        }
        getEvolutionStages(chain);
        return evolutionStages.length > 1 ? evolutionStages.join(" → ") : "N/A"; // If only one stage, return N/A
    }

    function updateInfoContainer(data: any, locationInfo: string, evolutionPath: string) {
        setInfoContainer(`
            <div class="flex flex-col lg:flex-row justify-between w-[90%] lg:w-[80%] m-auto">
                <div class="w-[100%] lg:w-[20%] flex flex-row lg:flex-col  justify-between">
                    <img class="w-[50%] lg:w-full aspect-square border-2 border-[#B3A125]" src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}">
                    <img class="w-[50%] lg:w-full aspect-square border-2 border-[#B3A125]" src="${data.sprites.other["official-artwork"].front_shiny}" alt="${data.name} Shiny">
                </div>
                <div class="w-[100%] lg:w-[79.5%] p-[40px] flex flex-col justify-between text-[white]" style="background-color: #4556D0;">
                    <p id="pokemonName">Name: ${data.name}</p>
                    <p>ID: #${data.id}</p>
                    <p>Height: ${data.height}</p>
                    <p>Weight: ${data.weight}</p>
                    <p>Base Experience: ${data.base_experience}</p>
                    <p>Abilities: ${data.abilities.map((ability: { ability: { name: string } }) => ability.ability.name).join(', ')}</p>
                    <p>Types: ${data.types.map((type: { type: { name: string } }) => type.type.name).join(', ')}</p>
                    <div class="w-[100%] h-[100px] overflow-y-auto border p-4">
                        <p>Moves: ${data.moves.map((move: { move: { name: string } }) => move.move.name).join(', ')}</p>
                    </div>
                    ${locationInfo}
                    <p>Evolutionary Path: ${evolutionPath}</p>
                </div>
            </div>
        `);
    }

    async function submit() {
        const nameOfPokemon = searchValue.toLowerCase();
        if (!nameOfPokemon) return;
        const data = await getPokemonData(nameOfPokemon);
        if (data.id > 649) {
            console.log(`Pokemon not found in Gen 1-5 ${data.id}`);
            setInfoContainer(`<div class="flex justify-center text-white"><p>Pokémon not found in Gen 1-5</p></div>`)
            return;
        }

        const locations = await getLocationData(data.id);
        let locationInfo = locations.length > 0
            ? `<p>Location: ${locations[0].location_area.name}</p>`
            : `<p>Location data not available for this Pokémon.</p>`;

        const evolutionPath = await getEvolutionChain(data.id);
        updateInfoContainer(data, locationInfo, evolutionPath);
        updateFavoriteButton(data.name.toLowerCase());// comeback to this latter
        setSearchValue('');
    }

    async function randomPoki() {
        const randomId: number = Math.floor(Math.random() * 649) + 1;
        const data = await getPokemonData(randomId.toString());
        const locations = await getLocationData(randomId);
        let locationInfo = locations.length > 0
            ? `<p>Location: ${locations[0].location_area.name}</p>`
            : `<p>Location data not available for this Pokémon.</p>`;
        const evolutionPath = await getEvolutionChain(data.id);
        updateInfoContainer(data, locationInfo, evolutionPath);
        updateFavoriteButton(data.name.toLowerCase());
    }

    function remove(pokemonName: string) {
        // Handle removing the Pokémon from the favorites list
        console.log(`Removing ${pokemonName} from favorites`);
        removeFromLocalStorage(pokemonName);
        // Remove the Pokémon from the UI
        const buttonElement = document.querySelector(`[data-name="${pokemonName}"]`);
        if (buttonElement) {
            buttonElement.closest('.flex')?.remove(); // Removes the parent container
        }
    }

    function go(pokemonName: string) {
        // Handle searching for the Pokémon
        console.log(`Going to Pokémon ${pokemonName}`);
        setSearchValue(pokemonName);
        submit(); // Trigger the search functionality
    }


    function displayFavorites() {
        console.log(`Display favorites button clicked`)
        const favorites = getFromLocalStorage();
        if (favorites.length === 0) {
            setInfoContainer(`<p class="flex justify-center mb-[10px] text-[white]">You have no favorite Pokémon.</p>`);
            return;
        }

        let favoritePokemon: string = `<div class="flex justify-center mb-[10px] text-[white]"><h1>Your Favorite Pokémon</h1></div>`
        favorites.forEach(pokemon => {
            getPokemonData(pokemon).then(data => {
                favoritePokemon += `
                    <div class="flex items-center justify-between border-b p-4 w-[90%] md:w-[40%] m-auto bg-[#4556D0]">
                        <h2 class="text-[white]">${data.name}</h2>
                        <div>
                            <button onClick={() => remove(data.name)} class="bg-red-500 text-white p-2 rounded-md hover:bg-red-700 remove_from_favorites" data-name="${data.name}">Remove</button>
                            <button onClick={() => go(data.name)} class="bg-green-500 text-white p-2 rounded-md hover:bg-green-700 go_to_that_pokemon" data-name="${data.name}">Go</button>
                        </div>
                    </div>
                `;
                setInfoContainer(favoritePokemon);
            })
        })
    }

    function favoriteBtnClick() {
        console.log(`Favorite button clicked`)
        const pokemon = currentNameOfPokemon;
        if (!pokemon) return;
        let favorites = getFromLocalStorage();
        if (favorites.includes(pokemon)) {
            removeFromLocalStorage(pokemon);
        } else {
            if (favorites.length >= 5) {
                console.log(`You can only have 5 favorite Pokémon.`);
                alert(`You can only have 5 favorite Pokémon.`);
                return;
            }
            savedToLocalStorage(pokemon);
        }
        updateFavoriteButton(pokemon);
    }

    const handleSearch = (e: any) => {
        if (e.key === 'Enter') {
            submit();
        }
    };

    function updateFavoriteButton(pokemon: string) {
        let favorites = getFromLocalStorage();

        if (favorites.includes(pokemon)) {
            setFavoriteBtn(`<svg class="w-[50px] h-[50px] fill-yellow-500" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>`)
        } else {
            setFavoriteBtn(`<svg class="w-[50px] h-[50px] fill-[#D9D9D9]" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>`)
        }
    }

    useEffect(() => {
        randomPoki();
    }
        , []);

    return (
        <div className="w-screen h-screen border-8 bg-[#3B4CCA] border-[#FFDE00] overflow-y-auto">
            <div className="w-[90%] md:w-[60%] flex flex-col sm:flex-row justify-center ml-auto mr-auto mt-[8rem]">
                <div className="w-[100%] sm:w-[90%] sm:mr-[10px]">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-black"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="userinput"
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Pokémon name"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <button
                            type="button"
                            id="submit"
                            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                            onClick={submit}
                        >
                            Search
                        </button>
                    </div>
                </div>
                <div className="flex justify-center mt-[20px] mb-[20px] sm:mt-0 sm:mb-0">
                    <button
                        id="favorite-btn"
                        onClick={favoriteBtnClick}
                        dangerouslySetInnerHTML={{ __html: favoriteBtn }}
                    />
                </div>
            </div>

            <div className="flex justify-center mt-[20px] mb-[20px]">
                <button
                    id="random"
                    className="bg-blue-500 text-white p-2.5 pl-4 pr-4 rounded-md hover:bg-blue-700"
                    onClick={randomPoki}
                >
                    Random
                </button>
                <button
                    id="displayFav"
                    className="bg-blue-500 text-white p-2.5 pl-4 pr-4 rounded-md hover:bg-blue-700 ml-2"
                    onClick={displayFavorites}
                >
                    Favorites
                </button>
            </div>

            <div
                id="infoContainer"
                dangerouslySetInnerHTML={{ __html: infoContainer }}//
            />
        </div>
    );

}
