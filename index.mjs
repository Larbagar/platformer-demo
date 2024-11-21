import {autoResizeCanvas, canvas, ctx} from "./canvasSetup.mjs"
import {Player} from "./Player.mjs"
import {Wall} from "./Wall.mjs"
import V2 from "./V2.mjs"
import {
    reflectPow,
    jumpPow,
    coyoteTime,
    accel,
    decel,
    speed,
    jumpBuffer,
    frameTime,
    gravity,
    cameraDamp, cameraSpeed, cameraLookahead, tolerance,
} from "./constants.mjs"
import {Arc} from "./Arc.mjs"
import Meth from "./Meth.mjs"
import {Sprite} from "./Sprite.mjs"

autoResizeCanvas()

const player = new Player(V2.new(0, 0))

const walls = new Set([
    new Wall(V2.new(20, 0), V2.new(-20, 0))
    // new Wall(V2.new(0, 300), V2.new(0, 0)),
    // new Wall(V2.new(500, 600), V2.new(0, 300), true, true),
    // new Wall(V2.new(1000, 600), V2.new(500, 600), true, true),
    // new Wall(V2.new(1150, 150), V2.new(1000, 600)),
])

const arcs = new Set([
    // new Arc(V2.new(500, 600), 0, 0.25*Meth.TAU, V2.new(500, 300).perp().dir),
    // new Arc(V2.new(600, 570), 0, -0.25*Meth.TAU, 0.25*Meth.TAU)
])

function serialize(){
    const obj = {
        walls: [],
        arcs: [],
    }
    for(const wall of walls){
        obj.walls.push({
            x0: wall.p0.x,
            y0: wall.p0.y,
            x1: wall.p1.x,
            y1: wall.p1.y,
            future0: wall.future0,
            future1: wall.future1,
        })
    }
    for(const arc of arcs){
        obj.arcs.push({
            x: arc.pos.x,
            y: arc.pos.y,
            r: arc.radius,
            start: arc.start,
            end: arc.end
        })
    }
    return JSON.stringify(obj)
}

function deserialize(dat){
    const obj = JSON.parse(dat)
    walls.clear()
    for(const wall of obj.walls){
        walls.add(new Wall(V2.new(wall.x0, wall.y0), V2.new(wall.x1, wall.y1), wall.future0, wall.future1))
    }
    for(const arc of obj.arcs){
        arcs.add(new Arc(V2.new(arc.x, arc.y), arc.r, arc.start, arc.end))
    }
}

const goomba = new Image()
goomba.src = "./goomba.png"

const sprites = new Set([
    new Sprite(goomba, V2.new(700, 500), V2.new(100, 100), Meth.TAU/8)
])

let jumpTime = 0
let direction = 0
let otherKey = false
addEventListener("keydown", e => {
    if(e.repeat){
        return
    }
    cameraEnabled = true
    if(e.code == "ArrowUp"){
        jumpTime = jumpBuffer
    }
    if(e.code == "ArrowLeft"){
        otherKey = direction > 0
        direction = -1
    }
    if(e.code == "ArrowRight"){
        otherKey = direction < 0
        direction = 1
    }
    if(e.code == "KeyR"){
        player.pos.xy = V2.zero()
        player.vel.xy = V2.zero()
    }
    if(e.code == "Enter"){
        deserialize(prompt("Level Data:", serialize()))
    }
})
addEventListener("keyup", e => {
    if(e.code == "ArrowLeft"){
        direction = otherKey
        otherKey = false
    }
    if(e.code == "ArrowRight"){
        direction = -otherKey
        otherKey = false
    }
})

function toWorld(vec){
    return vec.xy.sub(innerWidth / 2, innerHeight / 2).mult(devicePixelRatio).add(cameraPos)
}

function rayIntersectionTime(p0, d0, p1, d1){
    const diff = p1.xy.sub(p0)
    return (d1.x*diff.y - d1.y*diff.x) / (d1.x*d0.y - d1.y*d0.x)
}

function rayIntersection(p0, d0, p1, d1){
    return p0.xy.add(d0.xy.mult(rayIntersectionTime(p0, d0, p1, d1)))
}

function updateArc(arc, wall0, wall1, tanAbs){
    const
        origin = rayIntersection(
            wall0.p0, wall0.p1.xy.sub(wall0.p0),
            wall1.p1, wall1.p0.xy.sub(wall1.p1),
        ),
        p0 = wall0.p0.xy.sub(origin),
        p1 = wall1.p1.xy.sub(origin),
        tan = tanAbs.xy.sub(origin),
        mid = p0.xy.normalize().add(p1.xy.normalize()),
        norm = p0.xy.normalize().perp(),
        tRaw = (mid.dot(tan) + Meth.sqrt((mid.dot(tan))**2 - (mid.mag2 - mid.dot(norm) ** 2)*tan.mag2)) / (mid.mag2 - mid.dot(norm) ** 2),
        t = tRaw > 0 ? tRaw : 0,
        focus = mid.xy.mult(t).add(origin),
        radius = Meth.abs(mid.xy.mult(t).dot(norm))
    arc.pos = focus
    arc.radius = radius
    wall0.p1 = V2.fromPolar(radius, arc.start).add(arc.pos)
    wall1.p0 = V2.fromPolar(radius, arc.end).add(arc.pos)
}

let previousWall = null
let newWall = null
let modifyArc = null
let modifyWall0 = null
let modifyWall1 = null
const snapDist = 25
let cameraEnabled = true
let lastPos = null
addEventListener("mousedown", e => {
    cameraEnabled = false
    const pos = toWorld(V2.new(e.clientX, e.clientY))
    if(e.button == 0){
        let closestDist = snapDist
        previousWall = null
        for(const wall of walls){
            const dist = pos.distance(wall.p1)
            if(dist < closestDist){
                closestDist = dist
                pos.xy = wall.p1
                previousWall = wall
            }
        }
        for(const arc of arcs){
            const dist = Math.abs(pos.distance(arc.pos) - arc.radius)
            if(dist < closestDist){
                modifyWall0 = null
                modifyWall1 = null
                for(const wall of walls){
                    if(V2.fromPolar(arc.radius, arc.start).add(arc.pos).distance(wall.p1) < tolerance){
                        modifyWall0 = wall
                    }
                    if(V2.fromPolar(arc.radius, arc.end).add(arc.pos).distance(wall.p0) < tolerance){
                        modifyWall1 = wall
                    }
                }
                if(modifyWall0 && modifyWall1) {
                    closestDist = dist
                    modifyArc = arc
                }
            }
        }
        if(!modifyArc) {
            newWall = new Wall(pos, pos.xy)
            walls.add(newWall)
        }
    }
    lastPos = pos
})
addEventListener("mousemove", e => {
    const pos = toWorld(V2.new(e.clientX, e.clientY))
    if(modifyArc){
        updateArc(modifyArc, modifyWall0, modifyWall1, pos)
    }
    if(newWall){
        newWall.p1 = pos
    }
    if(e.buttons & 0b10 && lastPos){
        for(const wall of walls){
            const t0 = rayIntersectionTime(wall.p0, wall.p1.xy.sub(wall.p0), lastPos, lastPos.xy.sub(pos))
            const t1 = rayIntersectionTime(lastPos, lastPos.xy.sub(pos), wall.p0, wall.p1.xy.sub(wall.p0))
            if(0 <= t0 && t0 <= 1 && 0 <= t1 && t1 <= 1){
                for(const arc of arcs){
                    if(
                        V2.fromPolar(arc.radius, arc.start).add(arc.pos).distance(wall.p1) < tolerance ||
                        V2.fromPolar(arc.radius, arc.end).add(arc.pos).distance(wall.p0) < tolerance
                    ){
                        arcs.delete(arc)
                    }
                }
                walls.delete(wall)
            }
        }
    }
    lastPos = pos
})
addEventListener("contextmenu", e => {
    e.preventDefault()
})

function connectWalls(wall0, wall1){
    const start = wall0.p0.xy.sub(wall0.p1).perp().dir
    const end = wall1.p0.xy.sub(wall1.p1).perp().dir
    const diff = Meth.mod(end - start, Meth.TAU)
    if(diff < Meth.TAU / 2){
        wall0.future1 = true
        wall1.future0 = true
        arcs.add(new Arc(wall0.p1, 0, start, start + diff))
    }else{
        wall0.future1 = false
        wall1.future0 = false
        arcs.add(new Arc(wall0.p1, 0, start + Meth.TAU / 2, start + Meth.TAU / 2 + diff - Meth.TAU))
    }

}

addEventListener("mouseup", e => {
    const pos = toWorld(V2.new(e.clientX, e.clientY))
    if(newWall) {
        let nextWall
        let closestDist = snapDist
        for (const wall of walls) {
            const dist = pos.distance(wall.p0)
            if (dist < closestDist) {
                nextWall = wall
                pos.xy = wall.p0
                closestDist = dist
            }
        }
        newWall.p1.xy = pos
        if (nextWall == newWall) {
            walls.delete(newWall)
        } else {
            if (nextWall) {
                connectWalls(newWall, nextWall)
            }
            if (previousWall) {
                connectWalls(previousWall, newWall)
            }
        }
        newWall = null
    }
    if(modifyArc){
        updateArc(modifyArc, modifyWall0, modifyWall1, pos)
        modifyArc = null
    }
    lastPos = pos
})

addEventListener("wheel", e => {
    cameraEnabled = false
    cameraPos.add(e.deltaX, e.deltaY)
})

let surfaceNorm = null
let surfaceTime = 0
let surfaceVel = null


function simulate(dt){
    const dv = V2.zero()
    dv.y += gravity
    const targetVel = direction*speed
    const frictionType = (player.vel.x - targetVel)*direction > 0
    const friction = accel*(1 - frictionType) + decel*frictionType
    dv.x += (targetVel - player.vel.x)*friction
    if(surfaceTime > 0 && jumpTime > 0){
        player.vel.add(surfaceNorm.xy.mult(jumpPow - surfaceVel*reflectPow))
        jumpTime = 0
        surfaceTime = 0
    }


    jumpTime -= dt
    surfaceTime -= dt

    player.vel.add(dv.mult(dt))
    const nextVel = player.vel.xy.mult(dt)
    for(const wall of walls){
        const para = wall.p1.xy.sub(wall.p0).normalize()
        const perp = para.xy.perp()
        const currentDist = player.pos.xy.sub(wall.p0).dot(perp) - player.size
        const futureDist = player.pos.xy.add(nextVel).sub(wall.p0).dot(perp) - player.size
        if(
            currentDist + tolerance >= 0 &&
            futureDist - tolerance < 0 &&
            futureDist < currentDist &&
            player.pos.xy.add(nextVel.xy.mult(wall.future0)).sub(wall.p0).dot(para) >= 0 &&
            player.pos.xy.add(nextVel.xy.mult(wall.future1)).sub(wall.p1).dot(para) <= 0
        ){
            surfaceVel = player.vel.dot(perp)
            nextVel.sub(perp.xy.mult(futureDist))
            surfaceNorm = perp
            surfaceTime = coyoteTime
            player.vel.sub(perp.xy.mult(surfaceVel))
        }
    }
    for(const arc of arcs){
        const currentDir = player.pos.xy.sub(arc.pos).normalize()
        const futureDir = player.pos.xy.add(nextVel).sub(arc.pos).normalize()

        // Concave (positive, based on future)
        if(Meth.mod(futureDir.dir - arc.start, Meth.TAU) <= arc.end - arc.start){
            const dir = futureDir
            const currentDist = arc.radius - player.size - player.pos.xy.sub(arc.pos).dot(dir)
            const futureDist = arc.radius - player.size - player.pos.xy.add(nextVel).sub(arc.pos).dot(dir)
            if(
                currentDist + tolerance >= 0 &&
                futureDist - tolerance < 0 &&
                futureDist < currentDist
            ){
                const norm = dir.xy.negate()
                surfaceVel = player.vel.dot(norm)
                player.vel.sub(norm.xy.mult(surfaceVel))
                nextVel.sub(norm.xy.mult(futureDist))
                surfaceNorm = norm
                surfaceTime = coyoteTime
            }
        }

        // Convex (negative, based on present)
        if(Meth.mod(arc.start - currentDir.dir, Meth.TAU) <= arc.start - arc.end){
            const dir = currentDir
            const currentDist = player.pos.xy.sub(arc.pos).dot(dir) - player.size - arc.radius
            const futureDist = player.pos.xy.add(nextVel).sub(arc.pos).dot(dir) - player.size - arc.radius
            if(
                currentDist + tolerance >= 0 &&
                futureDist - tolerance < 0 &&
                futureDist < currentDist
            ){
                surfaceVel = player.vel.dot(dir)
                player.vel.sub(dir.xy.mult(surfaceVel))
                nextVel.sub(dir.xy.mult(futureDist))
                surfaceNorm = dir
                surfaceTime = coyoteTime
            }
        }
    }
    player.pos.add(nextVel)

    const cameraAccel = V2.zero()
    if(cameraEnabled) {
        cameraAccel.add(player.pos.xy.add(player.vel.xy.mult(cameraLookahead)).sub(cameraPos).mult(cameraSpeed))
    }
    cameraAccel.sub(cameraVel.xy.mult(cameraDamp))
    cameraVel.add(cameraAccel.xy.mult(dt))
    cameraPos.add(cameraVel.xy.mult(dt))
}

const cameraPos = V2.zero()
const cameraVel = V2.zero()

let t = performance.now()
let simTime = t
function render() {
    t = performance.now()
    while(simTime < t){
        simulate(frameTime)
        simTime += frameTime
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width/2, canvas.height/2)
    ctx.translate(-cameraPos.x, -cameraPos.y)
    player.draw(ctx)
    for (const wall of walls) {
        wall.draw(ctx)
    }
    for(const arc of arcs){
        arc.draw(ctx)
    }
    for(const sprite of sprites){
        sprite.draw(ctx)
    }
    ctx.restore()
    requestAnimationFrame(render)
}
requestAnimationFrame(render)