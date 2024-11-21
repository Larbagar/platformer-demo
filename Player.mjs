import V2 from "./V2.mjs"

export class Player {
    constructor(pos) {
        this.pos = pos
        this.vel = V2.zero()
        this.size = 0
    }
    draw(ctx){
        ctx.strokeStyle = "white"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, 10, 0, 2*Math.PI)
        ctx.stroke()
    }
}