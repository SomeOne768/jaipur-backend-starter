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
  db.saveGame(newGame)

  res.status(201).json({ id: newGame.id, name: newGame.name });
})

router.get("/", (req, res) => {
    //TODO retourner la liste des parties existantes

    const gameList = db.getGames().map(elt => ({ id: elt.id, name: elt.name }));
    res.status(201).json(gameList);
})


// création de la route /games/:gameId/players/:playerId/take-good
router.post("/:gameId/players/:playerId/take-good", (req, res) => {
    // console.log(req.body);
    // vérification du type des paramètres
    if (isNaN(req.params.gameId) || isNaN(req.params.playerId)) {
        // console.log("erreur de paramètres");
        return res.status(400).send("Bad request")
    }
    // récupération du jeu
    const games = db.getGames().find(elt => elt.id === parseInt(req.params.gameId));
    if (!games) {
        // console.log("game not found")
        return res.status(404).send("Game not found")
    }

    // récupération du paramètre take-good-payload
    const takeGoodPayload = req.body["good"];
    if (!takeGoodPayload) {
        // console.log("erreur de paramètres");
        return res.status(400).send("Bad request")
    }

    // get gameID
    const gameID = parseInt(req.params.gameId);

    // get playerID
    const playerID = parseInt(req.params.playerId);

    // if it's not the player's turn
    if (games.currentPlayerIndex !== playerID) {
        // console.log("Ce n'est pas votre tour");
        return res.status(400).send("Bad request")
    }

    // remove good from market
    const good = games.market.find(elt => elt == takeGoodPayload);

    if (!good) {
        // console.log(games.market)
        // console.log(takeGoodPayload)
        // console.log("good not found")
        return res.status(404).send("Good not found")
    }

    games.market = games.market.filter(elt => elt.id !== takeGoodPayload.good);


    // add good to player's hand
    games._players[playerID].hand.push(good);

    // remove camels from player's hand
    const tmp = games._players[playerID].hand.filter(elt => elt.id !== "camel");
    games._players[playerID].camelsCount += games._players[playerID].hand.length - tmp.length;

    games._players[playerID].hand = tmp;

    const returnGame = {
        currentPlayerIndex: (games.currentPlayerIndex == 1) ? 0:1,
        name: games.name,
        id: games.id,
        market: games.market,
        tokens: games.tokens,
        hand: games._players[playerID].hand,
        camelsCount: games._players[playerID].camelsCount,
        winnerIndex: undefined,
        bonusTokens: games._bonusTokens
    }

    // console.log(returnGame)
    res.status(201).json(returnGame);
})

// Création de la route POST /games/:gameId/players/:playerId/exchange.
router.post("/:gameId/players/:playerId/exchange", (req, res) => {
    // vérification du type des paramètres
    if (isNaN(req.params.gameId) || isNaN(req.params.playerId)) {
        // console.log("erreur de paramètres");
        return res.status(400).send("Bad request")
    }
    // récupération du jeu
    const games = db.getGames().find(elt => elt.id === parseInt(req.params.gameId));
    if (!games) {
        // console.log("game not found")
        return res.status(404).send("Game not found")
    }

    // vérification du joueur
    if (games.currentPlayerIndex !== parseInt(req.params.playerId)) {
        // console.log("Ce n'est pas votre tour");
        return res.status(400).send("Bad request")
    }

    // récupération du paramètre exchange-payload
    const exchangePayload = req.body;
    if (!exchangePayload) {
        return res.status(400).send("Bad request")
    }

    // get the "take" good
    // console.log("take : " , exchangePayload.take);
    // console.log("give: ", exchangePayload.give);
    // console.log("market: ", games.market);
    // console.log("hand: ", games._players[parseInt(req.params.playerId)].hand);
    const takeGood = games.market.find(elt => elt == exchangePayload.take);

    if (!takeGood) {
        // console.log("take good not found")
        return res.status(404).send("take good not found")
    }

    // get the "give" goods
    const giveGood = games._players[games.currentPlayerIndex].hand.find(elt => elt == exchangePayload.give);

    if (!giveGood) {
        // console.log(giveGood)
        // console.log("give good not found")
        return res.status(404).send("give good not found")
    }

    // remove the "take" good from the market
    games.market = games.market.filter(elt => elt == exchangePayload.take);

    // add the "take" good to the player's hand
    games._players[games.currentPlayerIndex].hand.push(takeGood);

    // remove the "give" good from the player's hand
    games._players[games.currentPlayerIndex].hand = games._players[games.currentPlayerIndex].hand.filter(elt => elt.id == exchangePayload.give);

    // add the "give" good to the market
    games.market.push(giveGood);


    const playerID = parseInt(req.params.playerId);
    const returnGame = {
        currentPlayerIndex: (games.currentPlayerIndex == 1) ? 0:1,
        name: games.name,
        id: games.id,
        market: games.market,
        tokens: games.tokens,
        hand: games._players[playerID].hand,
        camelsCount: games._players[playerID].camelsCount,
        winnerIndex: undefined,
        bonusTokens: games._bonusTokens
    }

    return res.status(200).send(returnGame);


})


// Création de la route POST /games/:gameId/players/:playerId/take-camels
router.post("/:gameId/players/:playerId/take-camels", (req, res) => {
    // vérification du type des paramètres
    if (isNaN(req.params.gameId) || isNaN(req.params.playerId)) {
        console.log("erreur de paramètres");
        // return res.status(400).send("Bad request")
    }
    // récupération du jeu
    const games = db.getGames().find(elt => elt.id === parseInt(req.params.gameId));
    if (!games) {
        console.log("game not found")
        // return res.status(404).send("Game not found")
    }

    // vérification du joueur
    if (games.currentPlayerIndex !== parseInt(req.params.playerId)) {
        console.log("Ce n'est pas votre tour");
        // return res.status(400).send("Bad request")
    }

    // vérification si c'est au tour du joueur
    if (games.currentPlayerIndex !== parseInt(req.params.playerId)) {
        console.log("Ce n'est pas votre tour");
        // return res.status(400).send("Bad request")
    }

    // récupération des chameaux du marché 
    const camels = games.market.filter(elt => elt == "camel");

    // ajout des chameaux à l'enclos
    games._players[games.currentPlayerIndex].camelsCount += camels.length;

    // suppression des chameaux du marché
    games.market = games.market.filter(elt => elt != "camel");

    // remplacement des chameaux par des biens aléatoires
    const randomGoods = gameService.drawCards(games._deck, camels.length);
    games.market.push(...randomGoods);

    // console.log(games.market);

    const playerID = parseInt(req.params.playerId);
    const returnGame = {
        currentPlayerIndex: (games.currentPlayerIndex == 1) ? 0:1,
        name: games.name,
        id: games.id,
        market: games.market,
        tokens: games.tokens,
        hand: games._players[playerID].hand,
        camelsCount: games._players[playerID].camelsCount,
        winnerIndex: undefined,
        bonusTokens: games._bonusTokens
    }
    console.log(returnGame);
    gameService.saveGame(games)
    res.status(201).json(returnGame);
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
  }
  db.clear();
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(gameList))
  res.status(200).send("Game deleted with success");
  // console.log("Laaa")
})


// [1] En tant que joueur, je peux vendre des cartes [api] [règles]
router.post("/:gameId/players/:playerId/sell", (req, res) => {

  if (!Number.isInteger(parseInt(req.params.gameId)) || !Number.isInteger(parseInt(req.params.playerId))) {
    // console.log("Mauvais parametre");
    return res.status(400).send("Uncorrect arguments");
  }

  // Find the game
  const game = db.getGames().filter(game => game.id == req.params.gameId)[0];
  if (!game) {
    // console.log("Game not found");
    return res.status(404).send("Game not found.");
  }

  // Si la partie est terminée on ne peut rien faire
  if (!gameService.isEnded(game)) {

    // Permettre l’action uniquement si la transaction est valide (voir “Restriction lors d’une vente”)
    if (!gameService.isValid(req.body)) {
      console.log("Vente invalide");
      console.log(req.body)
      return res.status(404).send("Unvalid sell");
    }

    // Permettre l’action uniquement si c’est le tour du joueur.
    if (game.currentPlayerIndex != req.params.playerId) {
      return res.status(404).send("This is not your turn, you're not allowed to do it");
    }

    //On vend les cartes
    console.log(req.body)
    gameService.sellCards(game, req.body);

    //On regarde si la partie est terminée pour la clore
    if(gameService.isEnded(game))
    {
      console.log("Le jeu est terminé");
      gameService.closeGame(game);
    }
    //sauvegarder les changements
    gameService.saveGame(game);
  }
  else{
    console.log("La partie est terminée");
  }


  let i = game.currentPlayerIndex;
  let gameReturn = {
    currentPlayerIndex: (i==0)? 1:0,
    name: game.name,
    id: game.id,
    market: game.market,
    tokens: game.tokens,
    hand: game._players[i].hand,
    camelsCount: game._players[i].camelsCount,
    winnerIndex: game.winnerId,
    winnerId: game.winnerId,
    bonusTokens: game._bonusTokens
  }

  return res.status(200).json(gameReturn);
})


export default router