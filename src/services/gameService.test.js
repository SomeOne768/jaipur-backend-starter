import * as gameService from "./gameService"

// jest.mock("./gameService");


describe("Game service", () => {
  test("should put camels from hand to herd", () => {
    // TODO
    let game = { 
        _players: [
            { hand: ["Camel", "Camel", "gold"], camelsCount : 0 },
            { hand: ["gold", "gold", "gold"], camelsCount : 0 }
        ]};
    
    gameService.putCamelsFromHandToHerd(game)
    expect( game ).toEqual( 
            { _players: [
                { hand: ["gold"], camelsCount : 2 },
                { hand: ["gold", "gold", "gold"], camelsCount : 0 }
            ]});

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
    expect(deck.filter(elt => elt === "Camel").length).toEqual(11-3);
  })
})