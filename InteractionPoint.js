class InteractionPoint extends GameObject {
    constructor(config) {
        config.hasSprite = false;
        super(config);
    }

    mount(map) {
        this.isMounted = true;
    }
}