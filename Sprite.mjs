export class Sprite {
    constructor(img, pos, size, rotation) {
        this.img = img
        this.pos = pos
        this.size = size
        this.rotation = rotation
    }
    draw(ctx){
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2)
        ctx.rotate(this.rotation)
        ctx.drawImage(this.img, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
    }
}