export class Wall {
    constructor(p0, p1, future0 = false, future1 = false) {
        this.p0 = p0
        this.p1 = p1
        this.future0 = future0
        this.future1 = future1
    }
    draw(ctx){
        const norm = this.p1.xy.sub(this.p0).normalize().perp().mult(-2)
        const n = 4
        for(let i = 0; i < n; i++) {
            const brightness = 255*(1 - i/n)
            ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness})`
            ctx.beginPath()
            ctx.moveTo(this.p0.x + norm.x * i, this.p0.y + norm.y * i)
            ctx.lineTo(this.p1.x + norm.x * i, this.p1.y + norm.y * i)
            ctx.stroke()
        }
    }
}