class Vision {
    hiddenUnderFog: boolean = false; // Is this hidden under fog?
    visionRange: number = 0; // How far can this actor see? (Circle radius)
    lightSourceRange: number = 0; // How much light is given off? (Intensity purpose)
    lightSourceAlwaysVisible: boolean = false // Is this light source always visible? (Even under shroud)
                                            // If false, this may look weird with large torches, since our light FOV may expand drastically upon discovery.
                                            // May have applications in rooms we wish to reveal everything.
                                            // May want to reveal the light source instead when vision radius overlaps, not when we can see it.
                                            // May want to reveal the light source instead when we have line of sight vision of its light, or itself.
    blocksVision: boolean = false; // Does it block vision & light sources?

    constructor() { }
}