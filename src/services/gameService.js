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
    for (let i = 0; i < 11 - 3; i++)deck.push("camel");

    // Retourner le tableau remplis


    return shuffle(deck)
}

// Pioche count cartes d'un deck.
export function drawCards(deck, count = 1) {
    //shift ou pop
    // TODO
    // Créer un tableau vide
    let cartePioche = []

    // Pour chaque carte à piocher:
    //  Retirer la carte piochée du deck et la mettre dans le tableau
    for (let i = 0; i < count; i++)cartePioche.push(deck.pop());

    // Retourner le tableau contenant les cartes piochées
    return cartePioche
}

// Déplace les chameaux de la main d'un joueur (_players[i].hand) vers son enclos (_players[i].camelsCount).
export function putCamelsFromHandToHerd(game) {
    // TODO
    // Pour chaque joueur:
    //  Pour chaque chameau dans la main du joueur
    //  Enlever le chameau de la main et le mettre dans l'enclos
    for (let i = 0; i < 2; i++) {
        //On les compte
        let tmp = game._players[i].hand.filter(elt => elt != "camel")
        game._players[i].camelsCount += game._players[i].hand.length - tmp.length
        game._players[i].hand = tmp
    }
}

// Créer un objet game.
export function createGame(name) {
    // TODO
    // Initialiser un nouveau deck avec la fonction précédente
    const deck = initDeck();

    // Créer le marché avec 3 chameaux et 2 cartes piochés du deck
    let market = shuffle(["camel", "camel", "camel", deck.pop(), deck.pop()])

    // Générer un nouvel identifiant pour la partie
    let id = db.getGames().length + 1;
    // Pour chaque joueur:

    //  Créer la main en piochant 5 cartes du deck
    let j1 = [], j2 = [];
    for (let i = 0; i < 5; i++) {
        j1.push(deck.pop());
        j2.push(deck.pop());
    }

    //  Initialiser l'enclos à 0
    // -fait dans la création classe

    //  Initialiser le score à 0
    // -fait dans la création classe

    // Créer les objets contenant les jetons
    // -fait dans la cration classe

    // Rassembler le tout pour créer la partie

    const game = new Game(id, name, deck, market)
    game._players[0].hand = j1;
    game._players[1].hand = j2;

    // Mettre les chameaux des mains des joueurs dans leurs enclos avec la fonction précédente
    putCamelsFromHandToHerd(game);

    //sauvegarder la partie
    db.saveGame(game);

    // Retourner la partie 
    return game;
}

class Game {
    constructor(id, name, deck, market) {
        // identifiant de la partie
        this.id = id;
        this.name = name;
        // pioche
        this._deck = deck;

        // marché
        this.market = market;
        this._players =
            [
                {
                    // main
                    "hand": [],
                    // nombre de chameaux
                    "camelsCount": 0,
                    // Score actuel
                    "score": 0
                },
                {
                    "hand": [],
                    "camelsCount": 0,
                    "score": 0
                }
            ];
        this.currentPlayerIndex = Math.floor(Math.random() * 2);
        this.tokens = {
            "diamonds": [7, 7, 5, 5, 5],
            "gold": [6, 6, 5, 5, 5],
            "silver": [5, 5, 5, 5, 5],
            "cloth": [5, 3, 3, 2, 2, 1, 1],
            "spice": [5, 3, 3, 2, 2, 1, 1],
            "leather": [4, 3, 2, 1, 1, 1, 1, 1, 1],
        };

        // ne pas oublier de les mélanger au début de la partie
        this._bonusTokens = {
            "3": shuffle([2, 1, 2, 3, 1, 2, 3]),
            "4": shuffle([4, 6, 6, 4, 5, 5]),
            "5": shuffle([8, 10, 9, 8, 10])
        };
        // Identifiant du gagnant si la partie est terminée sinon vaut undefined.
        this.winnerId = undefined;
    }
}

export function saveGame(game)
{
    db.saveGame(game);
}

// export function isValid(sell) {
//     // Check all card are the same
//     let s = new Set(sell)

//     if (s.size != 1)
//         return false;

//     if ((sell[0] == "diamonds" && sell.length < 2) || (sell[0] == ("gold") && sell.length < 2) || (sell[0] == "silver" && sell.length < 2))
//         return false;

//     return true;
// }

export function isValid(hand, sell) {
    if (sell.count < 1)
    {
        console.log("Vente vide");
        return false;
    }

    if ((sell.good == "diamonds" && sell.count < 2) || (sell.good == ("gold") && sell.count < 2) || (sell.good == "silver" && sell.count < 2))
    {
        console.log("Ces ventes nécessite au moins 2 cartes de ce type")
        return false;
    }

    if(hand.filter(elt => elt == sell.good).length < sell.count)
    {
        console.log("Nombre invalide, vous ne disposez pas assez de cartes de ce type");
        return false;
    }
    return true;
}


// export function sellCards(game, sell) {
//     //On compte le nombre de carte vendu et leur type
//     let n = sell.length;
//     let type = sell[0];

//     //On pioche
//     let cartesPiochees = [];
//     let i = 0;
//     while (i < n && sell.length > 0) {
//         cartesPiochees.push(game.tokens[type].pop());
//         i++;
//     }

//     //On regarde si on peut piocher des jetons bonus
//     if (n == 3)
//         cartesPiochees.push(game._bonusTokens['3'].pop());
//     else if (n == 4)
//         cartesPiochees.push(game._bonusTokens['4'].pop());
//     else if (n > 4)
//         cartesPiochees.push(game._bonusTokens['5'].pop());

//     //On évalue le nouveau score
//     let sum = cartesPiochees.reduce((acc, cur) => acc + cur, 0)
//     game._players[game.currentPlayerIndex].score += sum;
// }


export function sellCards(game, sell) {
    //On compte le nombre de carte vendu et leur type

    //On pioche
    let cartesPiochees = [];
    let i = 0;

    while (i < sell.count && game.tokens[sell.good].length > 0) {
        cartesPiochees.push(game.tokens[sell.good].pop());
        i++;
    }

    // On retire les cartes de la main du joueur
    for(const carte of cartesPiochees)
    {
        let index = game._players[ game.currentPlayerIndex ].hand.find(elt => elt == carte);
        game._players[ game.currentPlayerIndex ].hand.splice(index, 1);
    }

    //On regarde si on peut piocher des jetons bonus
    if (sell.count == 3)
        cartesPiochees.push(game._bonusTokens['3'].pop());
    else if (sell.count == 4)
        cartesPiochees.push(game._bonusTokens['4'].pop());
    else if (sell.count > 4)
        cartesPiochees.push(game._bonusTokens['5'].pop());

    //On évalue le nouveau score
    let sum = cartesPiochees.reduce((acc, cur) => acc + cur, 0)

    game._players[game.currentPlayerIndex].score += sum;
}


export function isEnded(game) {
    if (!game.winnerId)
        return false;

    // On compte le nombre type de jeton épuisé
    let n = 0;
    for (let i = 0; i < game.tokens.length; i++) {
        if (game.tokens[i].length == 0)
            n++;
    }

    if (n >= 3)
        return true;

    //Pas assez de carte pour completer le marche
    if (game.deck.length == 0 && game.market.length < 5)
        return true


    //Autrement la partie n'est pas terminée
    return false
}

export function closeGame(game) //decompter les points
{
    //On souhaite cloturer la manche

    //on compte le nombre de chameau pour attribuer les points
    if(game._players[0].camelsCount > game._players[1].camelsCount)
        game._players[0].score += 5;
    else if(game._players[0].camelsCount < game._players[1].camelsCount)
        game._players[1].score += 5;
    //else -On considere que personne ne gagne
    
    // On compare seulement en fonction du score pour attribuer le jeton 

    if(game._players[0].score > game._players[1].score) // On ne traite ici pas l'égalité : flemme
    {
        game.winnerId = 0;
    }
    else
    {
        game.winnerId = 1;
    }

}