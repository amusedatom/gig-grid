export interface Song {
    id: string;
    name: string;
    artist: string;
}

export interface SongDisplay extends Song {
    display: string;
}

/**
 * Master song database
 */
export const SONG_DATABASE: Record<string, Omit<Song, 'id'>> = {
    // Drum & Bass Classics
    "dnb1": { name: "Tarantula", artist: "Pendulum" },
    "dnb2": { name: "End Credits", artist: "Chase & Status" },
    "dnb3": { name: "Rock It", artist: "Sub Focus" },
    "dnb4": { name: "Come Alive", artist: "Netsky" },
    "dnb5": { name: "If We Ever", artist: "High Contrast" },
    "dnb6": { name: "Climax", artist: "Camo & Krooked" },
    "dnb7": { name: "Afterglow", artist: "Wilkinson" },
    "dnb8": { name: "Nobody to Love", artist: "Sigma" },
    "dnb9": { name: "Heartbeat Loud", artist: "Andy C" },
    "dnb10": { name: "Drop It Down", artist: "Calibre" },
    "dnb11": { name: "Stigma", artist: "Noisia" },
    "dnb12": { name: "Suicide Bassline", artist: "Mefjus" },
    "dnb13": { name: "UK", artist: "Dimension" },
    "dnb14": { name: "Bunker", artist: "Culture Shock" },
    "dnb15": { name: "Long Gone Memory", artist: "Friction" },
    "dnb16": { name: "Stepped Outside", artist: "Loadstar" },
    "dnb17": { name: "The Trip", artist: "Logistics" },
    "dnb18": { name: "Sweet Harmony", artist: "Danny Byrd" },
    "dnb19": { name: "Brown Paper Bag", artist: "Roni Size" },
    "dnb20": { name: "Inner City Life", artist: "Goldie" },
    "dnb21": { name: "Horizons", artist: "LTJ Bukem" },
    "dnb22": { name: "LK", artist: "DJ Marky" },
    "dnb23": { name: "Touch", artist: "Hybrid Minds" },
    "dnb24": { name: "Souvenirs", artist: "Etherwood" },
    "dnb25": { name: "Freefall", artist: "Metrik" },
    "dnb26": { name: "Watercolour", artist: "Pendulum" },
    "dnb27": { name: "Blind Faith", artist: "Chase & Status" },
    "dnb28": { name: "Tidal Wave", artist: "Sub Focus" },
    "dnb29": { name: "Rio", artist: "Netsky" },
    "dnb30": { name: "Remind Me", artist: "High Contrast" },

    // House Classics
    "hs1": { name: "One More Time", artist: "Daft Punk" },
    "hs2": { name: "Show Me Love", artist: "Robin S" },
    "hs3": { name: "Finally", artist: "CeCe Peniston" },
    "hs4": { name: "Gypsy Woman", artist: "Crystal Waters" },
    "hs5": { name: "Promised Land", artist: "Joe Smooth" },
    "hs6": { name: "Can You Feel It", artist: "Mr. Fingers" },
    "hs7": { name: "Your Love", artist: "Frankie Knuckles" },
    "hs8": { name: "French Kiss", artist: "Lil Louis" },
    "hs9": { name: "Good Life", artist: "Inner City" },
    "hs10": { name: "Big Fun", artist: "Inner City" },
    "hs11": { name: "Ride on Time", artist: "Black Box" },
    "hs12": { name: "Pump Up The Jam", artist: "Technotronic" },
    "hs13": { name: "Rhythm Is a Dancer", artist: "Snap!" },
    "hs14": { name: "What Is Love", artist: "Haddaway" },
    "hs15": { name: "Be My Lover", artist: "La Bouche" },
    "hs16": { name: "Around The World", artist: "Daft Punk" },
    "hs17": { name: "Music Sounds Better", artist: "Stardust" },
    "hs18": { name: "Lady", artist: "Modjo" },
    "hs19": { name: "Groovejet", artist: "Spiller" },
    "hs20": { name: "Sing It Back", artist: "Moloko" },

    // Techno
    "tc1": { name: "Strings of Life", artist: "Derrick May" },
    "tc2": { name: "Energy Flash", artist: "Joey Beltram" },
    "tc3": { name: "Voodoo Ray", artist: "A Guy Called Gerald" },
    "tc4": { name: "Papua New Guinea", artist: "The Future Sound of London" },
    "tc5": { name: "Spastik", artist: "Plastikman" },
    "tc6": { name: "The Bells", artist: "Jeff Mills" },
    "tc7": { name: "Mentasm", artist: "Second Phase" },
    "tc8": { name: "Acperience 1", artist: "Hardfloor" },
    "tc9": { name: "Clear", artist: "Cybotron" },
    "tc10": { name: "No UFOs", artist: "Model 500" },

    // Dubstep
    "db1": { name: "Scary Monsters", artist: "Skrillex" },
    "db2": { name: "Midnight Request Line", artist: "Skream" },
    "db3": { name: "Night", artist: "Benga & Coki" },
    "db4": { name: "Anti War Dub", artist: "Digital Mystikz" },
    "db5": { name: "In For the Kill (Skream Remix)", artist: "La Roux" },
    "db6": { name: "Cockney Thug", artist: "Rusko" },
    "db7": { name: "I Need Air", artist: "Magnetic Man" },
    "db8": { name: "Bass Cannon", artist: "Flux Pavilion" },
    "db9": { name: "Cracks (Flux Pavilion Remix)", artist: "Freestylers" },
    "db10": { name: "Gold Dust", artist: "DJ Fresh" },

    // Trance
    "tr1": { name: "Adagio for Strings", artist: "Tiësto" },
    "tr2": { name: "Silence", artist: "Delerium" },
    "tr3": { name: "For An Angel", artist: "Paul van Dyk" },
    "tr4": { name: "Children", artist: "Robert Miles" },
    "tr5": { name: "Café Del Mar", artist: "Energy 52" },
    "tr6": { name: "9PM", artist: "ATB" },
    "tr7": { name: "Sandstorm", artist: "Darude" },
    "tr8": { name: "Kernkraft 400", artist: "Zombie Nation" },
    "tr9": { name: "Saltwater", artist: "Chicane" },
    "tr10": { name: "Heaven", artist: "DJ Sammy" },

    // UK Garage
    "ukg1": { name: "Re-Rewind", artist: "Artful Dodger" },
    "ukg2": { name: "21 Seconds", artist: "So Solid Crew" },
    "ukg3": { name: "Flowers", artist: "Sweet Female Attitude" },
    "ukg4": { name: "Fill Me In", artist: "Craig David" },
    "ukg5": { name: "7 Days", artist: "Craig David" },
    "ukg6": { name: "Battle", artist: "Wookie" },
    "ukg7": { name: "Sincere", artist: "MJ Cole" },
    "ukg8": { name: "Buddy X", artist: "Neneh Cherry" },
    "ukg9": { name: "Gabriel", artist: "Roy Davis Jr" },
    "ukg10": { name: "Booo!", artist: "Sticky" },

    // Bass Music / Future Bass
    "fb1": { name: "Core", artist: "RL Grime" },
    "fb2": { name: "Shelter", artist: "Porter Robinson & Madeon" },
    "fb3": { name: "Say My Name", artist: "ODESZA" },
    "fb4": { name: "Divinity", artist: "Porter Robinson" },
    "fb5": { name: "Rushing Back", artist: "Flume" },
    "fb6": { name: "Never Be Like You", artist: "Flume" },
    "fb7": { name: "You & Me", artist: "Disclosure" },
    "fb8": { name: "Latch", artist: "Disclosure" },
    "fb9": { name: "Innerbloom", artist: "RÜFÜS DU SOL" },
    "fb10": { name: "On My Mind", artist: "Diplo & SIDEPIECE" }
};

/**
 * Get all songs as an array
 * @returns Array of SongDisplay objects
 */
export function getAllSongs(): SongDisplay[] {
    return Object.entries(SONG_DATABASE).map(([id, song]) => ({
        id,
        name: song.name,
        artist: song.artist,
        display: `${song.artist} - ${song.name}`
    }));
}

/**
 * Get song by ID
 * @param id - Song ID
 * @returns SongDisplay object or null if not found
 */
export function getSongById(id: string): SongDisplay | null {
    const song = SONG_DATABASE[id];
    if (!song) return null;

    return {
        id,
        name: song.name,
        artist: song.artist,
        display: `${song.artist} - ${song.name}`
    };
}

/**
 * Get multiple songs by IDs
 * @param ids - Array of song IDs
 * @returns Array of SongDisplay objects
 */
export function getSongsByIds(ids: string[]): SongDisplay[] {
    return ids.map(id => getSongById(id)).filter((song): song is SongDisplay => song !== null);
}

/**
 * Search songs by query
 * @param query - Search query
 * @returns Array of matching SongDisplay objects
 */
export function searchSongs(query: string): SongDisplay[] {
    if (!query || query.trim() === '') {
        return getAllSongs();
    }

    const lowerQuery = query.toLowerCase();
    const allSongs = getAllSongs();

    return allSongs.filter(song => {
        const searchText = `${song.name} ${song.artist}`.toLowerCase();
        return searchText.includes(lowerQuery);
    });
}
