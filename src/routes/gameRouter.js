import express from "express"
import * as gameService from "../services/gameService"

const router = express.Router()

// Ecoute la requête POST /games.
router.post("/", (req, res) => {
  // TODO retourner le status 404 si le nom n'existe pas
  if (!req.body.name) return res.status(400).send("Not found");
  
  const newGame = gameService.createGame(req.body.name)
  res.status(201).json({ id: newGame.id, name: newGame.name })
})

export default router