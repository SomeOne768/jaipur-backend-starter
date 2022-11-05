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

    // récupération du joueur
    const player = games._players.find(elt => elt.id === parseInt(req.params.playerId));
    if (!player) {
        return res.status(404).send("Player not found")
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
    const good = games._market.find(elt => elt.id === takeGoodPayload.good);

    if (!good) {
        return res.status(404).send("Good not found")
    }

    games.market = games.market.filter(elt => elt.id !== takeGoodPayload.good);


    // add good to player's hand
    player.hand.push(good);

    // remove camels from player's hand
    const tmp = player.hand.filter(elt => elt.id !== "Camel");
    player.camelsCount += player.hand.length - tmp.length;

    player.hand = tmp;

    res.status(201).json(games);
})

export default router