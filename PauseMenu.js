class PauseMenu {
    constructor({progress, heroState, onComplete}) {
        this.progress = progress;
        this.heroState = heroState;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        if(pageKey === "root") {
            return [
                {
                    label: "Pizzas",
                    description: "Veja suas Pizzas",
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions("pizzas"));
                    }
                },
                {
                    label: "Salvar",
                    description: "Salve seu progresso",
                    handler: () => {
                        this.progress.updateHeroPosition(
                            this.heroState.x,
                            this.heroState.y,
                            this.heroState.direction
                        );
                        this.progress.save();
                        this.close();
                    }
                },
                {
                    label: "Sair do jogo",
                    description: "Voltar para a tela inicial",
                    handler: () => {
                        this.close();
                        this.fadeOut(() => {
                            window.location.reload();
                        });
                    }
                },
                {
                    label: "Fechar",
                    description: "Fechar o menu de pause",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        if(pageKey === "pizzas") {
            const lineupPizzas = playerState.lineup.map(id => {
                const {pizzaId} = playerState.pizzas[id];
                const base = Pizzas[pizzaId];

                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions(id));
                    }
                }
            });

            return [
                ...lineupPizzas,
                {
                    label: "Voltar",
                    description: "Voltar ao menu principal",
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions("root"));
                    }
                }
            ]
        }

        const unequipped = Object.keys(playerState.pizzas).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id => {
            const {pizzaId} = playerState.pizzas[id];
            const base = Pizzas[pizzaId];

            return {
                label: `Trocar por ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id);

                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            }
        })

        return [
            ...unequipped,
            {
                label: "Mova para o topo",
                description: "Mova esta pizza para o começo da lista",
                handler: () => {
                    playerState.moveToFront(pageKey);

                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            },
            {
                label: "Voltar",
                description: "Voltar ao menu de pizzas",
                handler: () => {
                    this.keyboardMenu.setOptions(this.getOptions("pizzas"));
                }
            }
        ]
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Menu de Pause</h2>    
        `)
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    fadeOut(callback) {
        const transition = document.querySelector(".screen-transition");
        transition.classList.add("active");
        setTimeout(() => {
            callback();
        }, 800);
    }

    async init(container) {
        this.createElement();

        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })

        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));
        
        container.appendChild(this.element);

        utils.wait(200);

        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }
}