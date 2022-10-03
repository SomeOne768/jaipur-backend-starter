import * as db from "../database"
import { shuffle } from "lodash"

// Créer et retourne un deck mélangé avec 3 chameaux en moins.
export function initDeck() {
    // TODO
    // Créer un tableau vide
    let deck = []
    // Ajouter les diamants, l'or, l'argent, les tissus, les épices, le cuir et les chameaux




    for (let i = 0; i < 6; i++)deck.push("diamonds");
    for (let i = 0; i < 6; i++)deck.push("gold");
    for (let i = 0; i < 6; i++) deck.push("silver");
    for (let i = 0; i < 8; i++)deck.push("cloth");
    for (let i = 0; i < 8; i++)deck.push("spice");
    for (let i = 0; i < 10; i++)deck.push("leather");
    for (let i = 0; i < 11 - 3; i++)deck.push("Camel");

    // Retourner le tableau remplis


    return shuffle(deck)
}

// Pioche x cartes d'un deck.
export function drawCards(deck, count = 1) {
    //shift ou pop
    // TODO
    // Créer un tableau vide
    let cartePioche = []

    // Pour chaque carte à piocher:
    //  Retirer la carte piochée du deck et la mettre dans le tableau
    for (let i = 0; i < count; i++)cartePioche = deck.pop();

    // Retourner le tableau contenant les cartes piochées
    return cartePioche
}

// Déplace les chameaux de la main d'un joueur (_players[i].hand) vers son enclos (_players[i].camelsCount).
export function putCamelsFromHandToHerd(game) {
    // TODO
    // Pour chaque joueur:
    //  Pour chaque chameau dans la main du joueur
    //  Enlever le chameau de la main et le mettre dans l'enclos
    for(let i=0; i<2; i++){
        //On les compte
        let tmp = game._players[i].hand.filter(elt => elt != "Camel")
        game._players[i].camelsCount += game._players[i].hand.length - tmp.length
        game._players[i].hand = tmp       
    }
}

// Créer un objet game.
export function createGame(name) {
    // TODO
    // Initialiser un nouveau deck avec la fonction précédente
    // Créer le marché avec 3 chameaux et 2 cartes piochés du deck
    // Générer un nouvel identifiant pour la partie
    // Pour chaque joueur:
    //  Créer la main en piochant 5 cartes du deck
    //  Initialiser l'enclos à 0
    //  Initialiser le score à 0
    // Créer les objets contenant les jetons
    // Rassembler le tout pour créer la partie
    // Mettre les chameaux des mains des joueurs dans leurs enclos avec la fonction précédente
    // Retourner la partie 
    return {}
}