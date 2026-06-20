class InteractionPoint extends GameObject {
    constructor(config) {
        config.hasSprite = false;
        super(config);
        //this.storyFlag = config.storyFlag;
        //this.events = config.events || [];
    }

    mount(map) {
        this.isMounted = true;
    }
}