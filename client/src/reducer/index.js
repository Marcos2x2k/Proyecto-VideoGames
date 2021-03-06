// ** ACÁ EN REDUCER CREO MI ESTADO INICIAL - 
// ** Y HAGO LA LOGICA DE MIS FILTRADOS
const initialState = {
    games : [],    
    allGames:[],
    genres:[],
    platforms:[],
    gamesDetails: [],
    gamesDelete: [],
}

export default function rootReducer(state =  initialState, action){ //action.payload llega las opciones del select
    switch(action.type){
        
        case 'GET_GAMES':
            return{
                ...state, // guardamos el estado anterior como buena practica
                games: action.payload,  
                //Asi creamos en JSON - var json = await axios.get("http://localhost:3001/dogs",{});
                // el payload lo creamos en actions como payload: json.data
                allGames: action.payload
            }      
        case 'GET_NAME_GAMES':
            return{
                ...state,
                games: action.payload
            }      
        case 'GET_GENRES':            
            return{
                ...state,                
                genres: action.payload
            }  
        case 'GET_PLATFORMS':            
            return{
                ...state,                
                platforms: action.payload
            } 
        case 'FILTER_GAMES_BY_GENRES':
            const allStateGames = state.games
            const tempGames = allStateGames.filter(p => {
                if(p.genre){ // info viene como [{name:..},{name:..},{name:..}]
                    const genres = p.genre.map( p => p.name)
                    return genres.includes(action.payload)}
                if (p.genre) { //info viene como string
                    return p.genre.includes(action.payload)
                }
                // return null
            })           
            return {
                ...state,
                games: action.payload === 'sinFiltro' ? allStateGames : tempGames,
                // ? es entonces// : es sino // es un ternario
            }
        case 'POST_GAMES'://No se declara en actions, se declara en el reducer. 
                          //en action solo se trae la ruta
                 return{
                    ...state
                 }
                
        case 'GET_DETAILS_GAMES':            
                return {
                    ...state,
                    gamesDetails: action.payload
                }

        case 'FILTER_CREATED':                
                // uso ternario
                const allGameApiDB = state.allGames
                const createFilter = action.payload === 'created' ? allGameApiDB.filter(p => p.createInDb) : state.allGames.filter(p => !p.createInDb)
                return{
                   ...state,
                   games: action.payload === 'all' ? allGameApiDB : createFilter
                }
                // const createGames = action.payload === 'created' ? allGames : allGames.filter(p => p.status.createInDb) : state.allGames.filter(p => !p.status.createInDb)
                // return{
                //    ...state,
                //    games: createGames 
                // }
        case 'ORDER_BY_NAME':
                let sortedArr = action.payload === 'asc' ?
                state.games.sort(function(a,b){
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                }) :
                state.games.sort(function(a,b){
                    if (a.name > b.name) {
                        return -1;
                    }
                    if (a.name < b.name) {
                        return 1;
                    }
                    return 0;
                })        
                
                return{
                   ...state,
                   games: sortedArr // paso al estado el ordenamiento
            }
            case 'ORDER_BY_RATING':
                let RsortedArr = action.payload === 'rasd' ?
                state.games.sort(function(a,b){
                    if (a.rating > b.rating) {
                        return 1;
                    }
                    if (a.rating < b.rating) {
                        return -1;
                    }
                    return 0;
                }) :
                state.games.sort(function(a,b){
                    if (a.rating > b.rating) {
                        return -1;
                    }
                    if (a.rating < b.rating) {
                        return 1;
                    }
                    return 0;
                })        
                
                return{
                   ...state,
                   games: RsortedArr // paso al estado el ordenamiento
            }
        default:
                return state;
        }
    }