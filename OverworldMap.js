class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;

        this.cutsceneSpaces = config.cutsceneSpaces || {};

        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;

        this.isPaused = false;
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
        );
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
        );
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            let object = this.gameObjects[key];
            object.id = key;
            object.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;
        for(let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this
            })

            const result = await eventHandler.init();
            if(result === "LOST_BATTLE") {
                break;
            }

        }

        this.isCutscenePlaying = false;
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
        })

        if(!this.isCutscenePlaying && match && match.talking.length) {
            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf];
                })
            })

            relevantScenario && this.startCutscene(relevantScenario.events);

            //this.startCutscene(match.talking[0].events);
        }
    }


    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];

        if(!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events);
        }
    }

    addWall(x,y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall(x,y) {
        delete this.walls[`${x},${y}`];
    }

    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        
        const {x,y} = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x,y); 
    }
}

window.OverworldMaps = {
    DemoRoom: {
        lowerSrc: "images/maps/DemoLower.png",
        upperSrc: "images/maps/DemoUpper.png",
        gameObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6)
            },
            npcA: {
                type: "Person",
                x: utils.withGrid(7),
                y: utils.withGrid(9),
                src: "images/characters/people/npc1.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 800 },
                    {type: "stand", direction: "up", time: 800 },
                    {type: "stand", direction: "right", time: 1200 },
                    {type: "stand", direction: "up", time: 300 }
                ],
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            {type: "textMessage", text: "Erio não é o máximo?", faceHero: "npcA"}
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "Vou te esmagar!", faceHero: "npcA" },
                            {type: "battle", enemyId: "beth"},
                            {type: "addStoryFlag", flag: "DEFEATED_BETH"},
                            {type: "textMessage", text: "Você me esmagou como pimenta fraca.", faceHero: "npcA"}
                            //{ type: "textMessage", text: "Vai embora!" },
                            //{ who: "hero", type: "walk", direction: "up" },
                        ]
                    }
                ]
            },
            npcC: {
                type: "Person",
                x: utils.withGrid(4),
                y: utils.withGrid(8),
                src: "images/characters/people/npc1.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 500},
                    {type: "stand", direction: "down", time: 500},
                    {type: "stand", direction: "right", time: 500},
                    {type: "stand", direction: "up", time: 500},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "up"}
                ]
            },
            npcB: {
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(5),
                src: "images/characters/people/erio.png",
                /*behaviorLoop: [
                    { type: "walk", direction: "left" },
                    { type: "stand", direction: "up", time: 800 },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "down" }
                ]*/
               talking: [
                {
                    events: [
                        {type: "textMessage", text: "BAHAHA!", faceHero: "npcB"},
                        {type: "addStoryFlag", flag: "TALKED_TO_ERIO"}
                        //{type: "battle", enemyId: "erio"}
                    ]
                }
               ]
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                storyFlag: "USED_PIZZA_STONE",
                pizzas: ["v001", "f001"]
            }
        },
        walls: {
            [utils.asGridCoord(7,6)]: true,
            [utils.asGridCoord(8,6)]: true,
            [utils.asGridCoord(7,7)]: true,
            [utils.asGridCoord(8,7)]: true
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7,4)]: [
                {
                    events: [
                        {who: "npcB", type: "walk", direction: "left"},
                        {who: "npcB", type: "stand", direction: "up", time: 500},
                        {type: "textMessage", text: "Você não pode ficar ai dentro!"},
                        {who: "npcB", type: "walk", direction: "right"},
                        {who: "hero", type: "walk", direction: "down"},
                        {who: "hero", type: "walk", direction: "left"}
                    ]
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(2),
                            y: utils.withGrid(2),
                            direction: "down"
                        }
                    ]
                }
            ]
        }
    },
    Kitchen: {
        id: "Kitchen",
        lowerSrc: "images/maps/KitchenLower.png",
        upperSrc: "images/maps/KitchenUpper.png",
        gameObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(10),
                y: utils.withGrid(5)
            },
            kitchenNpcA: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(5),
                direction: "up",
                src: "images/characters/people/npc8.png",
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "**Ele não quer falar com você**"}
                        ]
                    }
                ]
            },
            kitchenNpcB: {
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(6),
                src: "images/characters/people/npc3.png",
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "As pessoas aqui levam seus trabalhos muito a serio", faceHero: "kitchenNpcB"}
                        ]
                    }
                ],
                behaviorLoop: [
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "stand", direction: "up", time: 500},
                    {type: "stand", direction: "left", time: 500}
                ]
            },
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "DiningRoom",
                            x: utils.withGrid(7),
                            y: utils.withGrid(3),
                            direction: "down"
                        }
                    ]
                }
            ],
            [utils.asGridCoord(10,6)]: [
                {
                    disqualify: ["SEEN_INTRO"],
                    events: [
                        {type: "addStoryFlag", flag: "SEEN_INTRO"},
                        {type: "textMessage", text: "*No seu primeiro dia como pizzaiolo em um estabelecimento famoso da cidade, você está cortando ingredientes.*"},
                        {type: "walk", who: "kitchenNpcA", direction: "down"},
                        {type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
                        {type: "stand", who: "hero", direction: "left", time: 200},
                        {type: "textMessage", text: "Hum. Esse é o seu melhor trabalho?"},
                        {type: "textMessage", text: "Esses pepperonis estão completamente instáveis! Os formatos dos pimentões estão todos errados!"},
                        {type: "textMessage", text: "Nem me fale dos cogumelos."},
                        {type: "textMessage", text: "Você nunca vai se dar bem no ramo da pizzas!"},
                        {type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
                        {type: "walk", who: "kitchenNpcA", direction: "up"},
                        {type: "stand", who: "kitchenNpcA", direction: "up", time: 300},
                        {type: "stand", who: "hero", direction: "down", time: 400},
                        {type: "textMessage", text: "*A competição é acirrada! Você deve dedicar algum tempo a aprimorar sua equipe de pizzaiolos e suas habilidades.*"},
                        {type: "changeMap", map: "Street", x: utils.withGrid(5), y: utils.withGrid(10), direction: "down"}
                    ]
                }
            ]
        },
        walls: {
            [utils.asGridCoord(2,4)]: true,
            [utils.asGridCoord(3,4)]: true,
            [utils.asGridCoord(5,4)]: true,
            [utils.asGridCoord(6,4)]: true,
            [utils.asGridCoord(7,4)]: true,
            [utils.asGridCoord(8,4)]: true,
            [utils.asGridCoord(11,4)]: true,
            [utils.asGridCoord(11,5)]: true,
            [utils.asGridCoord(12,5)]: true,
            [utils.asGridCoord(1,5)]: true,
            [utils.asGridCoord(1,6)]: true,
            [utils.asGridCoord(1,7)]: true,
            [utils.asGridCoord(1,9)]: true,
            [utils.asGridCoord(2,9)]: true,
            [utils.asGridCoord(6,7)]: true,
            [utils.asGridCoord(7,7)]: true,
            [utils.asGridCoord(9,7)]: true,
            [utils.asGridCoord(10,7)]: true,
            [utils.asGridCoord(9,9)]: true,
            [utils.asGridCoord(10,9)]: true,
            [utils.asGridCoord(3,10)]: true,
            [utils.asGridCoord(4,10)]: true,
            [utils.asGridCoord(6,10)]: true,
            [utils.asGridCoord(7,10)]: true,
            [utils.asGridCoord(8,10)]: true,
            [utils.asGridCoord(11,10)]: true,
            [utils.asGridCoord(12,10)]: true,
            [utils.asGridCoord(0,8)]: true,
            [utils.asGridCoord(5,11)]: true,
            [utils.asGridCoord(4,3)]: true,
            [utils.asGridCoord(9,4)]: true,
            [utils.asGridCoord(10,4)]: true,
            [utils.asGridCoord(13,6)]: true,
            [utils.asGridCoord(13,7)]: true,
            [utils.asGridCoord(13,8)]: true,
            [utils.asGridCoord(13,9)]: true
        }
    },
    Street: {
        id: "Street",
        lowerSrc: "images/maps/StreetLower.png",
        upperSrc: "images/maps/StreetUpper.png",
        gameObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(30),
                y: utils.withGrid(10)
            },
            streetNpcA: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(11),
                src: "images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "stand", direction: "right", time: 1400},
                    {type: "stand", direction: "up", time: 900}
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Todos os pizzaiolos ambiciosos se reúnem na Avenida Anchovas.", faceHero: "streetNpcA"}
                        ]
                    }
                ]
            }
        },
        cutsceneSpaces: {
            [utils.asGridCoord(29,9)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10),
                            direction: "up"
                        }
                    ]
                }
            ]
        }
    }
}