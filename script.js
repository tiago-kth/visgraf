
/* init */

const cv_container = document.querySelector('.canvas-container');
const cv = document.querySelector('canvas');
const svg = document.querySelector('svg');

const h = +window.getComputedStyle(cv_container).height.slice(0,-2);
const w = +window.getComputedStyle(cv_container).width.slice(0,-2);

console.log(w,h);

svg.setAttribute('height', h);
svg.setAttribute('width', w);
svg.setAttribute('viewbox', `0 0 ${w} ${h}`);

cv.setAttribute('height', h);
cv.setAttribute('width', w);


const initial_points = [
    {
        x: 200,
        y: 300
    },

    {
        x: 400,
        y: 200
    },

    {
        x: 500,
        y: 100
    },

    {
        x: 600,
        y: 400
    }
];

class Point {

    name = null;

    x = null;
    y = null;

    constructor(name, x, y) {

        this.name = name;
        this.x = x;
        this.y = y;

    }

    getPosition() {

        return { x: this.x, y: this.y };
    }

}

class IntermediatePoint extends Point {

    t = null;

    generation = null;

    p0 = null;
    p1 = null;

    constructor(name, p0, p1, generation) {

        const {x, y} = p0;

        super(name, x, y);

        this.p0 = p0;
        this.p1 = p1;

        this.x = p0.x;
        this.y = p0.y;

        this.generation = generation;

    }

    updatePosition() {

        this.x = this.p0.x * (1 - this.t) + this.p1.x * this.t;
        this.y = this.p0.y * (1 - this.t) + this.p1.y * this.t;

    }

    getPosition() {

        return { x: this.x, y:this.y };
    }

}

class Segment {

    t = null;

    p0 = null;
    p1 = null;

    p0_ref = null;
    p1_ref = null;

    generation = null;

    constructor(p0_ref, p1_ref, generation) {

        this.p0_ref = p0_ref;
        this.p1_ref = p1_ref;

        this.p0 = p0_ref.getPosition();
        this.p1 = p1_ref.getPosition();

        this.generation = generation;

    }

    updatePositions(p0, p1) {

        this.p0 = p0;
        this.p1 = p1;

    }

    getInitial() {
        return {x: this.p0.x, y: this.p0.y}
    }

    getFinal() {
        return {x: this.p1.x, y: this.p1.y}
    }

}

const interpolated_points = [];
const segments = [];

// p[generation][i]
const p = [
    []
];

initial_points.forEach( (point,i) => {

    p[0].push(new Point('p' + i, point.x, point.y ));
    
})

const n = initial_points.length;

for (let generation = 1; generation <= n - 1; generation++) {

    const last_gen = ( generation == n - 1 );

    p.push([]);

    for (let i = 0; i < n - generation; i++ ) {

        const point = new IntermediatePoint('p' + generation + 'i', p[generation-1][i], p[generation-1][i+1], generation);
        p[generation].push(point);
        interpolated_points.push(point);

        if (i > 0) {

            const segment = new Segment(p[generation][i-1], p[generation][i], generation);

            segments.push(segment);

        }

    }

}

console.log( {initial_points, p, interpolated_points, segments });

const c = cv.getContext('2d');

function render_control_points() {

    initial_points.forEach(point => {

        c.beginPath();
        c.strokeStyle = 'yellow';
        c.fillStyle = 'yellow';
        c.arc(point.x, point.y, 10, 0, Math.PI * 2);
        c.fill();
        c.stroke();

    })

}

render_control_points();

function render_interpolated_points() {

    interpolated_points.forEach(point => {

        const {x, y} = point.getPosition();

        c.beginPath();
        c.strokeStyle = 'cyan';
        c.fillStyle = 'cyan';
        c.arc(x, y, 5, 0, Math.PI * 2);
        c.fill();
        c.stroke();


    })

}

render_interpolated_points();

function render_segments() {

    segments.forEach(segment => {

        const {x: x0, y: y0} = segment.getInitial();
        const {x: x1, y: y1} = segment.getFinal();

        console.log(x0, y0, x1, y1);

        c.beginPath();
        c.strokeStyle = 'coral';
        c.fillStyle = 'coral';
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.stroke();
        c.closePath();


    })

}

render_segments();

