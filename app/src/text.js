class Text {
    constructor(x, y, z, value, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.value = value;
        this.color = color;
        this.time = Date.now();
    }
}

export default Text;