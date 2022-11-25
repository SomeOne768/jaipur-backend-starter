import * as gameService from "./gameService"

// jest.mock("./gameService");


describe("Game service", () => {
  test("should put camels from hand to herd", () => {
    // TODO
    let game = {
      _players: [
        { hand: ["camel", "camel", "gold"], camelsCount: 0 },
        { hand: ["gold", "gold", "gold"], camelsCount: 0 }
      ]
    };

    gameService.putCamelsFromHandToHerd(game);
    expect(game).toEqual(
      {
        _players: [
          { hand: ["gold"], camelsCount: 2 },
          { hand: ["gold", "gold", "gold"], camelsCount: 0 }
        ]
      });

    // console.log(game);

    // gameService.putCamelsFromHandToHerd(game);
    // expect(game._players[0].hand).toEqual(["gold"]);
    // expect(game._players[1].hand).toEqual(["gold", "gold", "gold"]);
    // expect(game._players[0].camelsCount).toEqual(2);
    // expect(game._players[1].camelsCount).toEqual(0);
  })

  test("should draw cards", () => {
    // TODO
    let deck = [];
    deck.push("diamonds");

    let carte = gameService.drawCards(deck, 1);
    expect(carte).toEqual(["diamonds"]);
    expect(deck).toEqual([]);

    deck.push("diamonds");
    deck.push("diamonds");
    deck.push("diamonds");
    carte = gameService.drawCards(deck, 3);
    expect(carte).toEqual(["diamonds", "diamonds", "diamonds"]);
    expect(deck).toEqual([]);


    deck.push("diamonds");
    deck.push("diamonds");
    deck.push("diamonds");
    carte = gameService.drawCards(deck, 0);
    expect(carte).toEqual([]);
    expect(deck).toEqual(["diamonds", "diamonds", "diamonds"]);
  })

  test("should init a deck", () => {
    // TODO

    let deck = gameService.initDeck();
    expect(deck.filter(elt => elt === "diamonds").length).toEqual(6);
    expect(deck.filter(elt => elt === "gold").length).toEqual(6);
    expect(deck.filter(elt => elt === "silver").length).toEqual(6);
    expect(deck.filter(elt => elt === "cloth").length).toEqual(8);
    expect(deck.filter(elt => elt === "spice").length).toEqual(8);
    expect(deck.filter(elt => elt === "leather").length).toEqual(10);
    expect(deck.filter(elt => elt === "camel").length).toEqual(11 - 3);
  })



  test("should create a game", () => {
    // TODO

    let game = gameService.createGame("name");
    let game2 = gameService.createGame("name2");

    // On vérifie que le nom est correctement renseigné
    expect(game.name).toEqual("name");

    //On vrifie que l'indice est bien incrémenter
    let diff = game2.id - game.id;
    expect(diff > 0).toBe(true);

    //On vérifie qu'il est bien incrémenter de 1 à chaque création
    expect(diff).toEqual(1);

    // Le marché doit contenir 3 chameaux
    expect(game.market.filter(elt => elt === 'camel'));

    // Il doit egalement avoir deux autres cartes
    expect(game.market.length).toEqual(5);

    // doit ocntenir 2 joueurs et chacun doit avoir 5 cartes
    expect(game._players[0].hand.length + game._players[0].camelsCount).toEqual(5);
    expect(game._players[1].hand.length + game._players[1].camelsCount).toEqual(5);
    expect(game.tokens).toEqual(
      {
        "diamonds": [7, 7, 5, 5, 5],
        "gold": [6, 6, 5, 5, 5],
        "silver": [5, 5, 5, 5, 5],
        "cloth": [5, 3, 3, 2, 2, 1, 1],
        "spice": [5, 3, 3, 2, 2, 1, 1],
        "leather": [4, 3, 2, 1, 1, 1, 1, 1, 1],
      });

    // Au départ il n'y a pas de vainqueur et c'est au joueur 0 de commencer
    // expect(game.currentPlayerIndex).toEqual(0); Ce n'est plus vrai - random ajouter ici
    expect(game.winnerId).toEqual(undefined);

  })

  test("should sell card", () => {

    // La création d'une game a été testé
    let game = gameService.createGame("test");
    let gameReference = Object.assign({}, game);

    
    // Test vente vide

    gameService.sellCards(game, []);
    expect(game).toEqual(gameReference);
  })

})