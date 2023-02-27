
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

    changePosition(x,y) {

        this.x = x;
        this.y = y;

    }

}

class IntermediatePoint extends Point {

    t = 0;

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

    updatePosition(t) {

        const t_ = t ? t : this.t

        this.x = this.p0.x * (1 - t_) + this.p1.x * t_;
        this.y = this.p0.y * (1 - t_) + this.p1.y * t_;

    }

    getPosition() {

        return { x: this.x, y:this.y };
    }

    get_t() {

        return this.t;

    }

}

class Segment {

    //t = null;

    // don't store locally anymore, just the reference
    //p0 = null;
    //p1 = null;

    p0_ref = null;
    p1_ref = null;

    generation = null;

    constructor(p0_ref, p1_ref, generation) {

        this.p0_ref = p0_ref;
        this.p1_ref = p1_ref;

        this.generation = generation;

    }

    // no need to update, just update the actual points.

    /*
    updateSegment(t) {

        this.p0_ref.updatePosition(t);
        this.p1_ref.updatePosition(t);

        this.p0 = p0_ref.getPosition();
        this.p1 = p1_ref.getPosition();

    }

    updatePositions(p0, p1) {

        this.p0 = p0;
        this.p1 = p1;

    }
    */

    getInitial() {
        const p0 = this.p0_ref.getPosition();
        return {x: p0.x, y: p0.y}
    }

    getFinal() {
        const p1 = this.p1_ref.getPosition();
        return {x: p1.x, y: p1.y}
    }

}

let interpolated_points, segments, sampled_segments, sampled_curve, curve_point;

function prepare_interpolated_points() {

    interpolated_points = [];
    segments = [];

    // p[generation][i]

    p = [
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

}

// creating a sampled database to help drawing the segments "shadow" and the actual curve

function prepare_point_segment_samples() {

    sampled_segments = [];
    sampled_curve = [];

    curve_point = interpolated_points[interpolated_points.length-1];

    for (let t = 0; t <= 1000; t++) {
    
        interpolated_points.forEach(point => {
    
            point.updatePosition(t/1000);
    
        })
    
        if (t % 10 == 0) {
            
            segments.forEach(segment => {
    
                const {x: x0, y: y0} = segment.getInitial();
                const {x: x1, y: y1} = segment.getFinal();
    
                const generation = segment.generation;
    
                const sampled_segment = { t: t/ 1000, x0, y0, x1, y1, generation }
    
                sampled_segments.push(sampled_segment);
    
            })
    
        }
    
        const {x, y} = curve_point.getPosition();
    
        sampled_curve.push({x, y, sampled_t: t/1000 });
    
    }



}


// resets interpolated points to t = 0;
function reset_positions() {

    curve_point.updatePosition(0);
    interpolated_points.forEach(point => { point.updatePosition(0); })

}

function setup() {
    prepare_interpolated_points();
    prepare_point_segment_samples();
    reset_positions();
}

setup();


//console.log( {initial_points, p, interpolated_points, segments, sampled_curve, sampled_segments });


// svg
// we only create the svg elements, afterwards, the transition of visual changes will be handled by css

initial_points.forEach( (point,i) => {
    
    const new_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    new_circle.classList.add('initial-point');

    new_circle.setAttribute('cx', point.x);
    new_circle.setAttribute('cy', point.y);
    new_circle.setAttribute('r', 10);

    svg.appendChild(new_circle);

    if ( i < initial_points.length - 1) {

        const new_line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        new_line.setAttribute('x1', point.x);
        new_line.setAttribute('y1', point.y);

        new_line.setAttribute('x2', initial_points[i+1].x);
        new_line.setAttribute('y2', initial_points[i+1].y);

        new_line.classList.add('control-polygon');

        svg.append(new_line);

    }


})

// canvas

const c = cv.getContext('2d');

function render_control_points() {

    initial_points.forEach(point => {

        c.beginPath();
        c.strokeStyle = 'white';
        c.fillStyle = 'white';
        c.arc(point.x, point.y, 10, 0, Math.PI * 2);
        c.fill();
        c.stroke();

    })

}

render_control_points();

function render_interpolated_points() {

    interpolated_points.forEach( (point,i) => {

        const {x, y} = point.getPosition();

        let color;

        if (i == interpolated_points.length - 1) {
            color = 'magenta';
        } else {
            color = point.generation == 1 ? 'cyan' : 'yellow' 
        }

        c.beginPath();
        c.strokeStyle = color;
        c.fillStyle = color;
        c.arc(x, y, 5, 0, Math.PI * 2);
        c.fill();
        c.stroke();


    })

}

function render_sampled_segments() {

    const current_t = curve_point.get_t();

    const segments_to_render = sampled_segments.filter(d => d.t <= current_t);

    segments_to_render.forEach(segment => {

        const {x0, y0, x1, y1, generation, t} = segment;

        let alpha = Math.pow(t / current_t, 2);
        alpha = alpha < .1 ? 0 : alpha;

        c.beginPath();
        c.strokeStyle = generation == 1 ? 'cyan' : 'yellow';
        //c.fillStyle = 'lightcoral';
        c.globalAlpha = fade ? alpha : .5;
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.lineWidth = 1;
        c.stroke();
        c.closePath();
        c.globalAlpha = 1;

    })

}

function render_sampled_curve() {

    const current_t = curve_point.get_t();

    const points_to_render = sampled_curve.filter(d => d.sampled_t <= current_t);

    const p0 = points_to_render[0];
    const {x0, y0} = p0;

    c.beginPath();
    c.strokeStyle = "magenta"
    c.lineWidth = 2;
    //c.fillStyle = 'lightcoral';
    c.moveTo(x0, y0);

    points_to_render.forEach(point => {

        const {x,y} = point;
        c.lineTo(x,y);

    })

    c.stroke();
    c.closePath();

}

function clear_canvas() {
    c.fillStyle = "#263238";
    //c.globalAlpha = .7;
    c.fillRect(0, 0, w, h);
    //c.globalAlpha = 1;
}

const older_segments = [];

//render_interpolated_points();

function render_segments() {

    segments.forEach(segment => {

        const {x: x0, y: y0} = segment.getInitial();
        const {x: x1, y: y1} = segment.getFinal();

        //older_segments.push()

        c.beginPath();
        c.strokeStyle = segment.generation == 1 ? 'cyan' : 'yellow';
        //c.fillStyle = 'lightcoral';
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.lineWidth = 2;
        c.stroke();
        c.closePath();

    })

}

function render_curtain() {
    const {x, y} = curve_point.getPosition();

    c.fillStyle = "#263238";
    c.fillRect(x, 0, w-x, h);

}

function render_curve() {

    const {x, y} = p[0][0].getPosition();

    const {x: x1, y: y1} = p[0][1].getPosition();
    const {x: x2, y: y2} = p[0][2].getPosition();
    const {x: x3, y: y3} = p[0][3].getPosition();

    c.beginPath();
    c.moveTo(x,y)
    c.strokeStyle = 'magenta';
    c.fillStyle = 'magenta';
    c.lineWidth = 10;
    c.bezierCurveTo(x1,y1,x2,y2,x3,y3);
    c.stroke();


}

// usar flags aqui para definir
let segs = true;
let fade = true;
let curve = true;

function render() {

    clear_canvas();

    /*
    if (curve) {
        render_curve();
        render_curtain();
    }*/


    render_control_points();

    render_sampled_segments();
    if (segs) render_segments();

    render_interpolated_points();

    render_sampled_curve();

}


gsap.to(interpolated_points, {
    t : 1,
    duration: 4,
    yoyo: true,
    repeat: 10,
    //ease: 'none',

    onUpdate: () => {
        interpolated_points.forEach(point => point.updatePosition());
        render();
    }
})

