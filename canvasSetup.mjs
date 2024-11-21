const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

function resize(){
    canvas.width = innerWidth*devicePixelRatio
    canvas.height = innerHeight*devicePixelRatio
}

function autoResizeCanvas(){
    addEventListener("resize", resize)
    resize()
}

export {canvas, ctx, autoResizeCanvas}