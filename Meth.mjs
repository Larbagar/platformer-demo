const Meth = Object.create(Math)

Meth.mod = function(dividend, divisor){
    return dividend - divisor * Math.floor(dividend / divisor)
}

Meth.TAU = 2 * Meth.PI

const name = "M" + "eth"
window[name] = Meth

export default Meth