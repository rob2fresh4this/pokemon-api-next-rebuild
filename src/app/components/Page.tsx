'use client';

import { useState } from 'react';

export default function PokemonSearch() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
    };

    return (
        <div className="w-screen h-screen border-8 bg-[#3B4CCA] border-[#FFDE00] overflow-y-auto">
            <div className="w-[90%] md:w-[60%] flex flex-col sm:flex-row justify-center ml-auto mr-auto mt-[8rem]">
                <div className="w-[100%] sm:w-[90%] sm:mr-[10px]">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="userinput"
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Pokémon name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            type="button"
                            id="submit"
                            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>
                </div>
                <div className="flex justify-center mt-[20px] mb-[20px] sm:mt-0 sm:mb-0">
                    <button id="favorite-btn">
                        <svg className="w-[50px] h-[50px] fill-[#D9D9D9]" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex justify-center mt-[20px] mb-[20px]">
                <button id="random" className="bg-blue-500 text-white p-2.5 pl-4 pr-4 rounded-md hover:bg-blue-700">Random</button>
                <button id="displayFav" className="bg-blue-500 text-white p-2.5 pl-4 pr-4 rounded-md hover:bg-blue-700 ml-2">Favorites</button>
            </div>

            <div id="infoContainer"></div>
        </div>
    );
}
