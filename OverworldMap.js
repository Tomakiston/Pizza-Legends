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
            },
            streetNpcB: {
                type: "Person",
                x: utils.withGrid(31),
                y: utils.withGrid(12),
                src: "images/characters/people/npc7.png",
                behaviorLoop: [
                    {type: "stand", direction: "up", time: 400},
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "down", time: 400},
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "right", time: 800}
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Não consigo decidir qual são meus ingredientes favoritos.", faceHero: "streetNpcB"}
                        ]
                    }
                ]
            },
            streetNpcC: {
                type: "Person",
                x: utils.withGrid(22),
                y: utils.withGrid(10),
                src: "images/characters/people/npc8.png",
                talking: [
                    {
                        required: ["streetBattle"],
                        events: [
                            {type: "textMessage", text: "Você é bastante capaz.", faceHero: "streetNpcC"}
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "Você devia ter ficado em casa!", faceHero: "streetNpcC"},
                            {type: "battle", enemyId: "streetBattle"},
                            {type: "addStoryFlag", flag: "streetBattle"}
                        ]
                    }
                ]
            }
        },
        walls: function() {
            let walls = {};
            ["4,9", "5,8", "6,9", "7,9", "8,9", "9,9", "10,9", "11,9", "12,9", "13,8", "14,8", "15,7",
                "16,7", "17,7", "18,7", "19,7", "20,7", "21,7", "22,7", "23,7", "24,7", "24,6", "24,5", "26,5", "26,6", "26,7", "27,7", "28,8", "28,9", "29,8", "30,9", "31,9", "32,9", "33,9",
                "16,9", "17,9", "25,9", "26,9", "16,10", "17,10", "25,10", "26,10", "16,11", "17,11", "25,11", "26,11",
                "18,11","19,11",
                "4,14", "5,14", "6,14", "7,14", "8,14", "9,14", "10,14", "11,14", "12,14", "13,14", "14,14", "15,14", "16,14", "17,14", "18,14", "19,14", "20,14", "21,14", "22,14", "23,14",
                "24,14", "25,14", "26,14", "27,14", "28,14", "29,14", "30,14", "31,14", "32,14", "33,14",
                "3,10", "3,11", "3,12", "3,13", "34,10", "34,11", "34,12", "34,13",
                "29,8","25,4",
            ].forEach(coord => {
                let [x,y] = coord.split(",");
                walls[utils.asGridCoord(x,y)] = true;
            })
            return walls;
        }(),
        cutsceneSpaces: {
            [utils.asGridCoord(5,9)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "DiningRoom",
                            x: utils.withGrid(6),
                            y: utils.withGrid(12),
                            direction: "up"
                        }
                    ]
                }
            ],
            [utils.asGridCoord(29,9)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Shop",
                            x: utils.withGrid(5),
                            y: utils.withGrid(12),
                            direction: "up"
                        }
                    ]
                }
            ],
            [utils.asGridCoord(25,5)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "StreetNorth",
                            x: utils.withGrid(7),
                            y: utils.withGrid(16),
                            direction: "up"
                        }
                    ]
                }
            ]
        }
    },
    Shop: {
        id: "Shop",
        lowerSrc: "images/maps/PizzaShopLower.png",
        upperSrc: "images/maps/PizzaShopUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(7)
            },
            shopNpcA: {
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(5),
                src: "images/characters/people/erio.png",
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Todas as rivalidades entre chefes tem sido boas para os negocios.", faceHero: "shopNpcA"}
                        ]
                    }
                ]
            },
            shopNpcB: {
                type: "Person",
                x: utils.withGrid(5),
                y: utils.withGrid(9),
                src: "images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 400},
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Qual pá de pizza me tornará um chef melhor?", faceHero: "shopNpcB"}
                        ]
                    }
                ]
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(1),
                y: utils.withGrid(4),
                storyFlag: "STONE_SHOP",
                pizzas: ["v002", "f002"]
            },
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,12)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Street",
                            x: utils.withGrid(29),
                            y: utils.withGrid(9),
                            direction: "down"
                        }
                    ]
                }
            ],
        },
        walls: {
            [utils.asGridCoord(2,4)]: true,
            [utils.asGridCoord(2,5)]: true,
            [utils.asGridCoord(2,6)]: true,
            [utils.asGridCoord(3,6)]: true,
            [utils.asGridCoord(4,6)]: true,
            [utils.asGridCoord(5,6)]: true,
            [utils.asGridCoord(7,6)]: true,
            [utils.asGridCoord(8,6)]: true,
            [utils.asGridCoord(9,6)]: true,
            [utils.asGridCoord(9,5)]: true,
            [utils.asGridCoord(9,4)]: true,
            [utils.asGridCoord(3,8)]: true,
            [utils.asGridCoord(3,9)]: true,
            [utils.asGridCoord(3,10)]: true,
            [utils.asGridCoord(4,8)]: true,
            [utils.asGridCoord(4,9)]: true,
            [utils.asGridCoord(4,10)]: true,
            [utils.asGridCoord(7,8)]: true,
            [utils.asGridCoord(7,9)]: true,
            [utils.asGridCoord(8,8)]: true,
            [utils.asGridCoord(8,9)]: true,
            [utils.asGridCoord(1,12)]: true,
            [utils.asGridCoord(2,12)]: true,
            [utils.asGridCoord(3,12)]: true,
            [utils.asGridCoord(4,12)]: true,
            [utils.asGridCoord(6,12)]: true,
            [utils.asGridCoord(7,12)]: true,
            [utils.asGridCoord(8,12)]: true,
            [utils.asGridCoord(9,12)]: true,
            [utils.asGridCoord(10,12)]: true,
            [utils.asGridCoord(0,4)]: true,
            [utils.asGridCoord(0,5)]: true,
            [utils.asGridCoord(0,6)]: true,
            [utils.asGridCoord(0,7)]: true,
            [utils.asGridCoord(0,8)]: true,
            [utils.asGridCoord(0,9)]: true,
            [utils.asGridCoord(0,10)]: true,
            [utils.asGridCoord(0,11)]: true,
            [utils.asGridCoord(11,4)]: true,
            [utils.asGridCoord(11,5)]: true,
            [utils.asGridCoord(11,6)]: true,
            [utils.asGridCoord(11,7)]: true,
            [utils.asGridCoord(11,8)]: true,
            [utils.asGridCoord(11,9)]: true,
            [utils.asGridCoord(11,10)]: true,
            [utils.asGridCoord(11,11)]: true,
            [utils.asGridCoord(1,3)]: true,
            [utils.asGridCoord(2,3)]: true,
            [utils.asGridCoord(3,3)]: true,
            [utils.asGridCoord(4,3)]: true,
            [utils.asGridCoord(5,3)]: true,
            [utils.asGridCoord(6,3)]: true,
            [utils.asGridCoord(7,3)]: true,
            [utils.asGridCoord(8,3)]: true,
            [utils.asGridCoord(9,3)]: true,
            [utils.asGridCoord(10,3)]: true,
            [utils.asGridCoord(5,13)]: true
        }
    },
    GreenKitchen: {
        id: "GreenKitchen",
        lowerSrc: "images/maps/GreenKitchenLower.png",
        upperSrc: "images/maps/GreenKitchenUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(8)
            },
            greenKitchenNpcA: {
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(8),
                src: "images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "stand", direction: "up", time: 400},
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "down", time: 400},
                    {type: "stand", direction: "left", time: 800}
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "O Chefe Root usa os melhores temperos", faceHero: "greenKitchenNpcA"}
                        ]
                    }
                ]
            }
        }
    }
}