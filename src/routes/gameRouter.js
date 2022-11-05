import express from "express"
import * as gameService from "../services/gameService"
import * as db from "../database"

const router = express.Router()

// Ecoute la requête POST /games.
router.post("/", (req, res) => {
// TODO retourner le status 404 si le nom n'existe pas
if (!req.body.name) return res.status(400).send("Not found");

const newGame = gameService.createGame(req.body.name);
db.saveGame(newGame)

res.status(201).json({ id: newGame.id, name: newGame.name });
})

router.get("/", (req, res) =>{
//TODO retourner la liste des parties existantes

const gameList = db.getGames().map(elt => ({id: elt.id, name: elt.name}));
res.status(201).json(gameList);
})


// création de la route /games/:gameId/players/:playerId/take-good
router.post("/:gameId/players/:playerId/take-good", (req, res) => {
    // vérification du type des paramètres
    if (isNaN(req.params.gameId) || isNaN(req.params.playerId)) {
        return res.status(400).send("Bad request")
    }
    // récupération du jeu
    const games = db.getGames().find(elt => elt.id === parseInt(req.params.gameId));
    if (!games) {
        return res.status(404).send("Game not found")
    }

    // récupération du paramètre take-good-payload
    const takeGoodPayload = req.body["take-good-payload"];
    if (!takeGoodPayload) {
        return res.status(400).send("Bad request")
    }

    // get gameID
    const gameID = parseInt(req.params.gameId);

    // get playerID
    const playerID = parseInt(req.params.playerId);

    // if it's not the player's turn
    if (games.currentPlayerIndex !== playerID) {
        return res.status(400).send("Bad request")
    }

    // remove good from market
    const good = games.market.find(elt => elt.id === takeGoodPayload.good);

    if (!good) {
        return res.status(404).send("Good not found")
    }

    games.market = games.market.filter(elt => elt.id !== takeGoodPayload.good);


    // add good to player's hand
    games.hand.push(good);

    // remove camels from player's hand
    const tmp = games.hand.filter(elt => elt.id !== "Camel");
    games.camelsCount += games.hand.length - tmp.length;

    games.hand = tmp;

    res.status(201).json(games);
})

// Création de la route POST /games/:gameId/players/:playerId/exchange.
router.post("/:gameId/players/:playerId/exchange", (req, res) => {
    // vérification du type des paramètres
    if (isNaN(req.params.gameId) || isNaN(req.params.playerId)) {
        return res.status(400).send("Bad request")
    }
    // récupération du jeu
    const games = db.getGames().find(elt => elt.id === parseInt(req.params.gameId));
    if (!games) {
        return res.status(404).send("Game not found")
    }

    // vérification du joueur
    if (games.currentPlayerIndex !== parseInt(req.params.playerId)) {
        return res.status(400).send("Bad request")
    }

    // récupération du paramètre exchange-payload
    const exchangePayload = req.body["exchange-payload"];
    if (!exchangePayload) {
        return res.status(400).send("Bad request")
    }

    // get the "take" good
    const takeGood = games.market.find(elt => elt.id === exchangePayload.take);

    if (!takeGood || takeGood.length !== 2) {
        return res.status(404).send("Good not found")
    }

    // get the "give" goods
    const giveGood = player.hand.find(elt => elt.id === exchangePayload.give);

    if (!giveGood || giveGood.length !== 2) {
        return res.status(404).send("Good not found")
    }

    // remove the "take" good from the market
    games.market = games.market.filter(elt => elt.id !== exchangePayload.take);

    // add the "take" good to the player's hand
    games.hand.push(takeGood);

    // remove the "give" good from the player's hand
    games.hand = games.hand.filter(elt => elt.id !== exchangePayload.give);

    // add the "give" good to the market
    games.market.push(giveGood);

    
})


// Création de la route POST /games/:gameId/players/:playerId/take-camels
router.post("/:gameId/players/:playerId/take-camels", (req, res) => {
    // vérification du type des paramètres
    if (isNaN(req.params.gameId) || isNaN(req.params.playerId)) {
        return res.status(400).send("Bad request")
    }
    // récupération du jeu
    const games = db.getGames().find(elt => elt.id === parseInt(req.params.gameId));
    if (!games) {
        return res.status(404).send("Game not found")
    }

    // vérification du joueur
    if (games.currentPlayerIndex !== parseInt(req.params.playerId)) {
        return res.status(400).send("Bad request")
    }

    // vérification si c'est au tour du joueur
    if (games.currentPlayerIndex !== parseInt(req.params.playerId)) {
        return res.status(400).send("Bad request")
    }

    // récupération des chameaux du marché
    const camels = games.market.filter(elt => elt.id === "Camel");

    // ajout des chameaux à l'enclos
    games.camelsCount += camels.length;

    // suppression des chameaux du marché
    games.market = games.market.filter(elt => elt.id !== "Camel");

    // remplacement des chameaux par des biens aléatoires
    const randomGoods = gameService.drawCards(games.market, camels.length);
    games.market.push(randomGoods);

    res.status(201).json(games);
})


export default router