// import M3 from "./M3.mjs"

/**
 * @implements {Iterable}
 */
export default class V2 {
    /** @type {Float32Array} */
    arr

    static ELEMENTS = 2
    static BYTES_PER_ELEMENT = Float32Array.BYTES_PER_ELEMENT
    static BYTE_LENGTH = V2.ELEMENTS*V2.BYTES_PER_ELEMENT

    //#region constructors

    /**
     * @param {...(V2 | Iterable | number | ArrayBuffer | Float32Array)} args
     * @returns {V2}
     */
    static new(...args){
        if(args[0] instanceof Object){
            if(args[0] instanceof V2){
                return V2.fromVals(args[0].arr[0], args[0].arr[1])
            }else if(Symbol.iterator in args[0]){
                const gen = args[0][Symbol.iterator]()
                return V2.fromVals(gen.next().value ?? 0, gen.next().value ?? 0)
            }else if(args[0] instanceof ArrayBuffer){
                return V2.fromArrayBuffer(args[0], args[1])
            }else if(args[0] instanceof Float32Array){
                return V2.fromFloat32Array(args[0], args[1])
            }
        }else{
            return V2.fromVals(args[0], args[1] ?? args[0])
        }
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    static fromVals(x = 0, y = 0) {
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = x
        v2.arr[1] = y
        return v2
    }
    /**
     * @param {number} r
     * @param {number} angle
     */
    static fromPolar(r = 0, angle = 0) {
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = r*Math.cos(angle)
        v2.arr[1] = r*Math.sin(angle)
        return v2
    }
    /**
     * @param {V2} a
     * @param {V2} b
     * @param {number} t
     */
    static lerp(a, b, t){
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = a.arr[0] * (1 - t) + b.arr[0] * t
        v2.arr[1] = a.arr[1] * (1 - t) + b.arr[1] * t
        return v2
    }
    /**
     * Copies by reference
     * @param {ArrayBuffer} arrayBuffer
     * @param {number=} byteOffset
     */
    static fromArrayBuffer(arrayBuffer = new ArrayBuffer(V2.BYTE_LENGTH), byteOffset = 0) {
        const v2 = new V2()
        v2.arr = new Float32Array(arrayBuffer, byteOffset, V2.ELEMENTS)
        return v2
    }
    /**
     * Copies by reference
     * @param {ArrayBuffer} arrayBuffer
     * @param {number=} count
     * @param {number=} byteOffset
     */
    static multipleFromArrayBuffer(
        arrayBuffer = new ArrayBuffer(V2.BYTE_LENGTH),
        count = Math.floor(arrayBuffer.byteLength/V2.BYTE_LENGTH),
        byteOffset = 0,
    ) {
        const arr = new Array(count)
        for(let i = 0; i < count; i++){
            const v2 = new V2()
            v2.arr = new Float32Array(arrayBuffer, byteOffset + i*V2.BYTES_PER_ELEMENT, V2.ELEMENTS)
            arr[i] = v2
        }
        return arr
    }
    /**
     * Copies by reference
     * @param {Float32Array} float32Array
     * @param {number=} offset
     */
    static fromFloat32Array(float32Array = new Float32Array(V2.ELEMENTS), offset = 0) {
        const v2 = new V2()
        v2.arr = new Float32Array(
            float32Array.buffer,
            float32Array.byteOffset + offset*Float32Array.BYTES_PER_ELEMENT,
            V2.ELEMENTS
        )
        return v2
    }
    /**
     * Copies by reference
     * @param {Float32Array} float32Array
     * @param {number=} count
     * @param {number=} offset
     */
    static multipleFromFloat32Array(
        float32Array = new Float32Array(V2.ELEMENTS),
        count = Math.floor(float32Array.length/V2.ELEMENTS),
        offset = 0,
    ) {
        const arr = new Array(count)
        for(let i = 0; i < count; i++){
            const v2 = new V2()
            v2.arr = new Float32Array(
                float32Array.buffer,
                float32Array.byteOffset + (offset + i)*Float32Array.BYTES_PER_ELEMENT,
                V2.ELEMENTS
            )
            arr[i] = v2
        }
        return arr
    }
    /**
     * @param {Array<number>} arr
     * @param {number} offset
     */
    static fromArray(
        arr = [0, 0,],
        offset = 0,
    ){
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = arr[offset]
        v2.arr[1] = arr[offset + 1]
        return v2
    }
    /**
     * Copies by value
     * @param {Array<number>} srcArray
     * @param {number} count
     * @param {number=} offset
     */
    static multipleFromArray(
        srcArray = [],
        count = 0,
        offset = 0,
    ){
        const arr = new Array(count)
        for(let i = 0; i < count; i++){
            const v2 = new V2()
            v2.arr = new Float32Array(V2.ELEMENTS)
            v2.arr[0] = srcArray[offset + 2*i]
            v2.arr[1] = srcArray[offset + 2*i + 1]
            arr[i] = v2
        }
        return arr
    }
    /**
     * Copies by value
     * @param {Iterable} iterable
     * @param {number=} offset
     */
    static fromIterable(
        iterable = [],
        offset = 0,
    ){
        const gen = iterable[Symbol.iterator]()
        for(let i = 0; i < offset; i++){
            gen.next()
        }
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = gen.next().value
        v2.arr[1] = gen.next().value
        return v2
    }
    /**
     * Copies by value
     * @param {Iterable} iterable
     * @param {number} count
     * @param {number=} offset
     */
    static multipleFromIterable(
        iterable = [],
        count = 0,
        offset = 0,
    ){
        const gen = iterable[Symbol.iterator]()
        for(let i = 0; i < offset; i++){
            gen.next()
        }
        const arr = new Array(count)
        for(let i = 0; i < count; i++){
            const v2 = new V2()
            v2.arr = new Float32Array(V2.ELEMENTS)
            v2.arr[0] = gen.next().value
            v2.arr[1] = gen.next().value
            arr[i] = v2
        }
        return arr
    }
    /**
     */
    static zero() {
        const v2 = new V2()
        v2.arr = new Float32Array(2)
        return v2
    }
    /**
     */
    static one() {
        const v2 = new V2()
        v2.arr = new Float32Array(2)
        v2.arr[0] = 1
        v2.arr[1] = 1
        return v2
    }

    //#endregion

    // #region changing array buffer

    /**
     * @param {ArrayBuffer} arrayBuffer
     * @param {number} byteOffset
     */
    setArrayBuffer(arrayBuffer, byteOffset = 0){
        this.arr = new Float32Array(arrayBuffer, byteOffset, V2.ELEMENTS)
        return this
    }

    /**
     * @param {Float32Array} float32Array
     * @param {number} offset
     */
    setFloat32Array(float32Array, offset){
        this.arr = new Float32Array(
            float32Array.buffer,
            float32Array.byteOffset + offset*Float32Array.BYTES_PER_ELEMENT,
            V2.ELEMENTS
        )
        return this
    }

    // #endregion

    //#region getters

    get x() {
        return this.arr[0]
    }
    get y() {
        return this.arr[1]
    }
    get xy() {
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = this.arr[0]
        v2.arr[1] = this.arr[1]
        return v2
    }
    get yx() {
        const v2 = new V2()
        v2.arr = new Float32Array(V2.ELEMENTS)
        v2.arr[0] = this.arr[1]
        v2.arr[1] = this.arr[0]
        return v2
    }

    get mag() {
        return Math.sqrt(this.arr[0]**2 + this.arr[1]**2)
    }
    get mag2(){
        return this.arr[0]**2 + this.arr[1]**2
    }
    get dir() {
        return Math.atan2(this.arr[1], this.arr[0])
    }

    //#endregion

    /**
     * @param {V2} vec
     */
    distance(vec) {
        return Math.sqrt((this.arr[0] - vec.arr[0])**2 + (this.arr[1] - vec.arr[1])**2)
    }

    //#region setters

    /**
     * @param {number | Iterable<number>} val
     */
    set x(val) {
        const itr = val[Symbol.iterator]
        if(itr){
            this.arr[0] = itr().next().value
        }else{
            this.arr[0] = val
        }
    }
    /**
     * @param {number | Iterable<number>} val
     */
    set y(val) {
        const itr = val[Symbol.iterator]
        if(itr){
            this.arr[1] = itr().next().value
        }else{
            this.arr[1] = val
        }
    }

    /**
     * @param {V2 | Iterable<number> | number} arg
     */
    set xy(arg) {
        let x, y
        if(arg instanceof V2){
            x = arg.arr[0]
            y = arg.arr[1]
        }else if(typeof arg == "object" && Symbol.iterator in arg){
            const gen = arg[Symbol.iterator]()
            x = gen.next().value ?? this.arr[0]
            y = gen.next().value ?? this.arr[1]
        }else{
            x = arg
            y = arg
        }
        this.arr[0] = x
        this.arr[1] = y
    }
    /**
     * @param {V2 | Iterable<number> | number} arg
     */
    set yx(arg) {
        let y, x
        if(arg instanceof V2){
            y = arg.arr[0]
            x = arg.arr[1]
        }else if(typeof arg == "object" && Symbol.iterator in arg){
            const gen = arg[Symbol.iterator]()
            y = gen.next().value ?? this.arr[0]
            x = gen.next().value ?? this.arr[1]
        }else{
            y = arg
            x = arg
        }
        this.arr[1] = y
        this.arr[0] = x
    }

    /**
     * @param {...(V2 | Iterable | number)} args
     */
    set(...args){
        let x, y
        if(args.length == 1){
            const arg = args[0]
            if(arg instanceof V2){
                x = arg.arr[0]
                y = arg.arr[1]
            }else if(typeof arg == "object" && Symbol.iterator in arg){
                const gen = arg[Symbol.iterator]()
                x = gen.next().value ?? 0
                y = gen.next().value ?? 0
            }else {
                x = arg
                y = arg
            }
        }else if(args.length == 2){
            x = args[0]
            y = args[1]
        }else {
            throw new TypeError("Unsupported argument count")
        }
        this.arr[0] = x
        this.arr[1] = y
        return this
    }
    /**
     * @param {V2} v2
     */
    setVec(v2 = this) {
        this.arr[0] = v2.arr[0]
        this.arr[1] = v2.arr[1]
        return this
    }
    /**
     * @param {Iterable} itr
     */
    setItr(itr){
        const gen = itr[Symbol.iterator]()
        this.arr[0] = gen.next().value ?? this.arr[0]
        this.arr[1] = gen.next().value ?? this.arr[1]
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    setVals(x = this.arr[0], y = this.arr[1]) {
        this.arr[0] = x
        this.arr[1] = y
        return this
    }
    /**
     * @param {number} num
     */
    setNum(num = 0) {
        this.arr[0] = num
        this.arr[1] = num
        return this
    }

    /**
     * @param {number} mag
     */
    set mag(mag) {
        const factor = mag/Math.sqrt(this.arr[0]**2 + this.arr[1]**2)
        this.arr[0] *= factor
        this.arr[1] *= factor
    }
    /**
     * @param {number} mag2
     */
    set mag2(mag2) {
        const factor = Math.sqrt(mag2/(this.arr[0]**2 + this.arr[1]**2))
        this.arr[0] *= factor
        this.arr[1] *= factor
    }
    /**
     * @param {number} dir
     */
    set dir(dir) {
        const mag = Math.sqrt(this.arr[0]**2 + this.arr[1]**2)
        this.arr[0] = mag*Math.sin(dir)
        this.arr[1] = mag*Math.cos(dir)
    }

    //#endregion

    /**
     * @returns {V2}
     */
    copy() {
        const v2 = new V2()
        v2.arr = new Float32Array(this.arr)
        return v2
    }

    //#region operations

    /**
     * @param {...(V2 | Iterable | number | ArrayBuffer | Float32Array)} args
     */
    add(...args){
        const vec = V2.new(...args)
        this.arr[0] += vec.arr[0]
        this.arr[1] += vec.arr[1]
        return this
    }
    /**
     * @param {V2} addend
     */
    addVec(addend = V2.zero()) {
        this.arr[0] += addend.arr[0]
        this.arr[1] += addend.arr[1]
        return this
    }
    /**
     * @param {Iterable} addend
     */
    addItr(addend = [0, 0]) {
        const gen = addend[Symbol.iterator]()
        this.arr[0] += gen.next().value ?? 0
        this.arr[1] += gen.next().value ?? 0
        return this
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    addVals(x = 0, y = 0) {
        this.arr[0] += x
        this.arr[1] += y
        return this
    }
    /**
     * @param {number} addend
     */
    addNum(addend = 0) {
        this.arr[0] += addend
        this.arr[1] += addend
        return this
    }
    /**
     * @param {...V2} addends
     */
    static sum(...addends) {
        const arr = new Float32Array(2)
        for(let i = 0; i < addends.length; i++) {
            arr[0] += addends[i].arr[0]
            arr[1] += addends[i].arr[1]
        }
        const sum = new V2()
        sum.arr = arr
        return sum
    }

    /**
     * @param {...(V2 | Iterable | number | ArrayBuffer | Float32Array)} args
     */
    sub(...args){
        const vec = V2.new(...args)
        this.arr[0] -= vec.arr[0]
        this.arr[1] -= vec.arr[1]
        return this
    }
    /**
     * @param {V2} subtrahend
     */
    subVec(subtrahend = V2.zero()) {
        this.arr[0] -= subtrahend.arr[0]
        this.arr[1] -= subtrahend.arr[1]
        return this
    }
    /**
     * @param {Iterable} subtrahend
     */
    subItr(subtrahend = [0, 0]) {
        const gen = subtrahend[Symbol.iterator]()
        this.arr[0] -= gen.next().value ?? 0
        this.arr[1] -= gen.next().value ?? 0
        return this
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    subVals(x = 0, y = 0) {
        this.arr[0] -= x
        this.arr[1] -= y
        return this
    }
    /**
     * @param {number} subtrahend
     */
    subNum(subtrahend = 0) {
        this.arr[0] -= subtrahend
        this.arr[1] -= subtrahend
        return this
    }

    /**
     */
    negate() {
        this.arr[0] = -this.arr[0]
        this.arr[1] = -this.arr[1]
        return this
    }

    /**
     * @param {...(V2 | Iterable | number | boolean | ArrayBuffer | Float32Array)} args
     */
    mult(...args){
        const vec = V2.new(...args)
        this.arr[0] *= vec.arr[0]
        this.arr[1] *= vec.arr[1]
        return this
    }
    /**
     * @param {V2} factor
     */
    multVec(factor = V2.one()) {
        this.arr[0] *= factor.arr[0]
        this.arr[1] *= factor.arr[1]
        return this
    }
    /**
     * @param {Iterable} factor
     */
    multItr(factor = [0, 0]) {
        const gen = factor[Symbol.iterator]()
        this.arr[0] *= gen.next().value ?? 0
        this.arr[1] *= gen.next().value ?? 0
        return this
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    multVals(x = 1, y = 1) {
        this.arr[0] *= x
        this.arr[1] *= y
        return this
    }
    /**
     * @param {number} factor
     */
    multNum(factor = 1) {
        this.arr[0] *= factor
        this.arr[1] *= factor
        return this
    }
    /**
     * @param {...V2} factors
     */
    static prod(...factors) {
        const arr = new Float32Array(2)
        for(let i = 0; i < factors.length; i++) {
            arr[0] *= factors[i].arr[0]
            arr[1] *= factors[i].arr[1]
        }
        const prod = new V2()
        prod.arr = arr
        return prod
    }

    /**
     * @param {...(V2 | Iterable | number | ArrayBuffer | Float32Array)} args
     */
    div(...args){
        const vec = V2.new(...args)
        this.arr[0] /= vec.arr[0]
        this.arr[1] /= vec.arr[1]
        return this
    }
    /**
     * @param {V2} divisor
     */
    divVec(divisor = V2.one()) {
        this.arr[0] /= divisor.arr[0]
        this.arr[1] /= divisor.arr[1]
        return this
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    divVals(x = 1, y = 1) {
        this.arr[0] /= x
        this.arr[1] /= y
        return this
    }
    /**
     * @param {number} divisor
     */
    divNum(divisor = 1) {
        this.arr[0] /= divisor
        this.arr[1] /= divisor
        return this
    }

    /**
     */
    invert() {
        this.arr[0] = 1/this.arr[0]
        this.arr[1] = 1/this.arr[1]
    }

    /**
     * @param {...(V2 | Iterable | number | ArrayBuffer | Float32Array)} args
     */
    dot(...args){
        const vec = V2.new(...args)
        return this.arr[0]*vec.arr[0] + this.arr[1]*vec.arr[1]
    }
    /**
     * @param {V2} v2
     */
    dotVec(v2 = this) {
        return this.arr[0]*v2.arr[0] + this.arr[1]*v2.arr[1]
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    dotVals(x = this.arr[0], y = this.arr[1]) {
        return this.arr[0]*x + this.arr[1]*y
    }

    /**
     * @param {...(V2 | Iterable | number | ArrayBuffer | Float32Array)} args
     */
    cross(...args){
        const vec = V2.new(...args)
        return this.arr[0]*vec.arr[1] - this.arr[1]*vec.arr[0]
    }
    /**
     * @param {V2} v2
     */
    crossVec(v2 = this) {
        return this.arr[0]*v2.arr[1] - this.arr[1]*v2.arr[0]
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    crossVals(x = this.arr[0], y = this.arr[1]) {
        return this.arr[0]*y - this.arr[1]*x
    }

    //#endregion

    // /**
    //  * @param {M3} m3
    //  */
    // applyTransform(m3 = M3.identity()) {
    //     const
    //         b0 = this.arr[0],
    //         b1 = this.arr[1]
    //     this.arr[0] = m3.arr[0]*b0 + m3.arr[4]*b1 + m3.arr[8]
    //     this.arr[1] = m3.arr[1]*b0 + m3.arr[5]*b1 + m3.arr[9]
    //     return this
    // }

    /**
     */
    abs() {
        this.arr[0] = Math.abs(this.arr[0])
        this.arr[1] = Math.abs(this.arr[1])
        return this
    }

    /**
     */
    greatestComponent() {
        return Math.max(this.arr[0], this.arr[1])
    }
    /**
     */
    leastComponent() {
        return Math.min(this.arr[0], this.arr[1])
    }

    /**
     */
    swapComponents() {
        const oldX = this.arr[0]
        this.arr[0] = this.arr[1]
        this.arr[1] = oldX
        return this
    }

    /**
     */
    normalize() {
        const len = Math.sqrt(this.arr[0]**2 + this.arr[1]**2)
        //const len = Math.hypot(this.arr[0], this.arr[1])
        if(len !== 0) {
            this.arr[0] /= len
            this.arr[1] /= len
        }
        return this
    }
    /**
     */
    toPolar() {
        this.arr[0] = Math.sqrt(this.arr[0]**2 + this.arr[1]**2)
        this.arr[1] = Math.atan2(this.arr[1], this.arr[0])
        return this
    }
    /**
     */
    fromPolar() {
        this.arr[0] = this.arr[0]*Math.cos(this.arr[1])
        this.arr[1] = this.arr[0]*Math.sin(this.arr[1])
        return this
    }
    /**
     * @param {number} angle
     */
    rotate(angle = 0) {
        const
            x = this.arr[0],
            y = this.arr[1],
            s = Math.sin(angle),
            c = Math.cos(angle)
        this.arr[0] = x*c - y*s
        this.arr[1] = x*s + y*c
        return this
    }

    /**
     */
    perp() {
        const x = this.arr[0]
        this.arr[0] = -this.arr[1]
        this.arr[1] = x
        return this
    }

    /**
     */
    isNaN() {
        return Number.isNaN(this.arr[0]) || Number.isNaN(this.arr[1])
    }

    /**
     */
    toString() {
        return `(${this.arr[0]}, ${this.arr[1]})`
    }

    /**
     * @yields {number}
     */
    *[Symbol.iterator]() {
        const y = this.arr[1]
        yield this.arr[0]
        yield y
    }
}

const name = "V" + "2"
window[name] = V2