export class Arc {
    constructor(pos, radius, start = 0, end = 2*Math.PI) {
        this.pos = pos
        this.radius = radius
        this.start = start
        this.end = end
    }
    draw(ctx){
        ctx.strokeStyle = "white"
        const n = 4
        for(let i = 0; i < n; i++) {
            const brightness = 255*(1 - i/n)
            ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness})`
            ctx.beginPath()
            ctx.arc(this.pos.x, this.pos.y, Math.max(0, this.radius + 2*i*(2*(this.end - this.start > 0) - 1)), this.start, this.end, this.end < this.start)
            ctx.stroke()
        }
    }
}