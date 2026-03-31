class Progress {
    constructor() {
        this.map.id = "Street";

        this.startingHeroX = 0;
        this.startingHeroY = 0;
        this.startingHeroDirection = "down";

        this.saveFileKey = "PizzaLegends_SaveFile1"
    }

    save() {
        window.localStorage.setItem(this.saveFileKey, JSON.stringify({
            mapId: this.mapId,
            startingHeroX: this.startingHeroX,
            startingHeroY: this.startingHeroY,
            startingHeroDirection: this.startingHeroDirection,
            playerState: {
                pizzas: playerState.pizzas,
                lineup: playerState.lineup,
                items: playerState.items,
                storyFlags: playerState.storyFlags
            }
        }))
    }

    getSaveFile() {

    }

    load() {
        
    }
}