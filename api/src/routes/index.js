const express = require('express');
const router = express.Router();
// const router = Router();

// Importar todos los routerrs;
// Ejemplo: const authrouterr = require('./auth.js');
//defino el middleware que me trae el body de las petisiones
router.use(express.json())
const axios = require('axios');

// aca defino models y me los traigo de la BD
const { Game, Genre} = require('../db.js'); //importo los modelos conectados
const {API_KEY} = process.env;

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () => {
    try {
        // API:
        let Page1 = axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=1`);
        let Page2 = axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=2`);
        let Page3 = axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=3`);
        let Page4 = axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=4`);
        let Page5 = axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=5`);

        let pageALL = await Promise.all([Page1, Page2, Page3, Page4, Page5]);                                            

        Page1 = pageALL[0].data.results;
        Page2 = pageALL[1].data.results;
        Page3 = pageALL[2].data.results;
        Page4 = pageALL[3].data.results;
        Page5 = pageALL[4].data.results;       

        let apiHtml = Page1.concat(Page2).concat(Page3).concat(Page4).concat(Page5);                  
            
        let ApiInfo = apiHtml.map(p => {
        return { // ya la retorno con campos iguales a mi DB
        id: p.id,//.map(p=>p),
        name:p.name,        
        description:p.description,        
        platform:p.platforms.map(a=>a),
        genre:p.genres.map(a=>a),
        image:p.background_image,
        released:p.released, //Fecha de lanzamiento
        rating:p.rating,
        //ratings: p.ratings.map(a=>a),        
    }})
        return ApiInfo;
    } 
    catch (error) 
        {console.log(error);
    }
};

const getDbInfo = async () => {    
    const infoDB = await Game.findAll({
            include: {
                model: Genre,
                attributes: ['name'],
                through: {
                    attributes:[],
                },
            },
        });
        return infoDB;    
    }
    // return await Games.findAll({  //traigo la info de mi base de datos
    //     include: {  // ademas de todo traeme temperament 
    //         model: Genres,
    //         attributes: ['name'],
    //         through: { // va siempre en las llamadas y comprueba que llame atributo name en este caso 
    //             attributes: [],
    //         },
    //     }
    // })

const getAllGames = async () => {
    //const getAllVgames = async() => {
        try {
            const apiInfo = await getApiInfo();
            const dbInfo = await getDbInfo();            
            const infoTotal = apiInfo.concat(dbInfo);    
            // console.log("Soy infoTotal >>> ", infoTotal);
            return infoTotal;    
        } catch (error) {
            console.log(error);
        }
    };
//     const apiInfo = await getApiInfo();
//     const dbInfo = await getDbInfo();
//     const infoTotal = apiInfo.concat(dbInfo);
//     return infoTotal;
// };

// router.get('/', async (req, res) => {
//     const name = req.query.name
//     if (!name) {
//         return res.status(200).send(await getAllGames());
//     }else {
//         const game = getAllGames.filter(e=>e.name.toLowerCase().include(name));
//         return res.status(200).send(game);
//     }
// })
// [ ] GET /videogames:
// Obtener un listado de los videojuegos, Debe devolver solo los datos necesarios para la ruta principal
router.get('/games', async (req, res) => {
    const name = req.query.name; //req query busca si hay un name por query
    const gamesAll = await getAllGames();
    if (name) {
        //tolowerCase hace que la busqueda en minus/mayusc no afecte al resultado
        const gamesName = await gamesAll.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
        gamesName.length? // preguntamos si hay algo
            res.status(200).send(gamesName) :
            res.status(404).send('NO EXISTE EL JUEGO BUSCADO');
    }else{
        res.status(200).send(gamesAll)
    }
});

router.get('/genres', async (req, res) => {
    var apiHtml = await axios.get(`https://api.rawg.io/api/genres?key=${API_KEY}`)
    // ** para llamar por plataforma 
    const genres = apiHtml.data.results.map(p => p.name) 
    const genre1 = await genres.filter(p => p.length > 0); // para verificar q no traiga nada vacio    
    //recorro todo buscando y me traigo los generos de la base de datos busca o lo crea si no existe
    genre1.forEach(p => { 
        if (p!==undefined) Genre.findOrCreate({where:{name:p}})
    })  
    const allGenres = await Genre.findAll();           
    // console.log ("ALL GENRES"+ allGenres)        
    res.send(allGenres);
    });
// router.get('/games?search={name}', async (req, res) => {});

router.get("/games/:id", async (req, res) => {
    const id = req.params.id;
    const GamesTotal = await getAllGames();    
    //console.log (GamesTotal)
    if (id){
        const gamesId = await GamesTotal.filter((p) => p.id == id)
        // ME TRAE CON OTROS ID DIFERENTES AL DE LA API
        console.log(gamesId)        
        gamesId.length ? 
                res.status(200).send(gamesId) : 
                res.status(404).send('NO EXISTE EL JUEGO BUSCADO')        
    } 
});

router.post('/newGames', async (req, res) => {
    /// ** traigo lo q me pide por Body ** 
    let{       
        name,        
        description,        
        platform,
        genre,
        image,
        rating,
        released,
        createInDb,
    } = req.body

    let gamesCreated = await Game.create({ 
        name,        
        description,        
        platform,
        genre,
        image,
        rating,
        released,
        createInDb,
        })
    
        let genresDb = await Genre.findAll({
            where: { name: genre }
        })
        gamesCreated.addGenres(genresDb)
        res.send('Video Juego Creado')
});

module.exports = router;
