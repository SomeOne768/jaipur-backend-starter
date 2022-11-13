import express from "express"
import * as gameService from "../services/gameService"
import * as db from "../database"
import fs from "fs"
import path from "path"

const DATABASE_FILE = path.join(__dirname, "../../storage/database.json")

const router = express.Router()

// Ecoute la requête POST /games.
router.post("/", (req, res) => {
  // TODO retourner le status 404 si le nom n'existe pas
  if (!req.body.name) return res.status(404).send("Not found");

  const newGame = gameService.createGame(req.body.name);
  // db.saveGame(newGame) // ajouter à la fonciton de création

  res.status(201).json({ id: newGame.id, name: newGame.name });
})

router.get("/", (req, res) => {
//TODO retourner la liste des parties existantes

  const gameList = db.getGames().map(elt => ({ id: elt.id, name: elt.name }));
  res.status(200).json(gameList);
})


router.get("/:gameID/players/:playerId", (req, res) => {

  if (!req.params.gameID || !req.params.playerId) return res.status(404).send("Uncorrect arguments");
  if (!Number.isInteger(parseInt(req.params.gameID)) || !Number.isInteger(parseInt(req.params.playerId))) return res.status(404).send("Uncorrect type of arguments");
  if (parseInt(req.params.playerId) < 0 || parseInt(req.params.playerId) > 1) return res.status(404).send("Uncorrect value for player Id. Must be 0 or 1");

  const gameList = db.getGames().filter(game => game.id == req.params.gameID);
  if (gameList.length == 0) return res.status(404).send("Game not found");
  let retour = gameList.map(elt => (
    {
      currentPlayerIndex: parseInt(req.params.playerId),
      name: elt.name,
      id: elt.id,
      market: elt.market,
      tokens: elt.tokens,
      hand: elt._players[req.params.playerId].hand,
      camelsCount: elt._players[req.params.playerId].camelsCount,
      winnerIndex: elt.winnerId,
      bonusTokens: elt._bonusTokens
    }))
  res.status(200).json(retour[0]);
  return retour[0];

})


router.delete("/:gameID", (req, res) => {
  // console.log(Number.isInteger(parseInt(req.params.gameID)))
  if (!Number.isInteger(parseInt(req.params.gameID))) return res.status(404).send("Uncorrect arguments, must be integer");

  let gameList = db.getGames();

  // if (gameList.filter(game => game.id == req.params.gameId).length == 0) return res.status(404).send("This game doesn't exist.");
  // //Pour l'instant on considère que l'on peut tout supprimer

  let gameIndex = gameList.findIndex((g) => g.id == parseInt(req.params.gameID))
  // console.log(gameIndex)
  if (gameIndex >= 0) gameList.splice(gameIndex, 1);
  else return res.status(404).send("This game doesn't exist.");

  try {
    fs.mkdirSync(path.dirname(DATABASE_FILE))

  } catch (e) {
    // Do nothing if fails
    console.log("probleme dans le try")
  }
  db.clear();
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(gameList))
  res.status(200).send("Game deleted with success");
  console.log("Laaa")
})


// [1] En tant que joueur, je peux vendre des cartes [api] [règles]



router.post("/:gameId/players/:playerId/sell", (req, res) =>
{
    if(!isNaN(req.params.gameId) || !isNaN(req.params.playerId))
    {
        return res.status(400).send("Uncorrect arguments");
    }

    // Find the game
    const game = db.getGames().filter(game => game.id === req.params.gameId);
    if(!game)
    {
        return res.status(404).send("Game not found.");
    }

    // Permettre l’action uniquement si la transaction est valide (voir “Restriction lors d’une vente”)
    if(!gameService.isValid(sell))
    {
        return res.status(404).send("Unvalid sell");
    }

    // Permettre l’action uniquement si c’est le tour du joueur.
    if(game.currentPlayerIndex != req.params.playerId)
    {
        return res.status(404).send("This is not your turn, you're not allowed to do it");
    }

    //On vend les cartes
    gameService.sellCards(game, sell);

    //sauvegarder
    return res.status(200).json({});

})


export default router