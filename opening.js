const cv_op_container = document.querySelector('.canvas-container-opening');
const cv_op = document.querySelector('.opening');

const h_op = +window.getComputedStyle(cv_op_container).height.slice(0,-2);
const w_op = +window.getComputedStyle(cv_container).width.slice(0,-2);



cv_op.setAttribute('height', h_op);
cv_op.setAttribute('width', w_op);

const ctxOp = cv_op.getContext('2d');

const noise = new SimplexNoise();

// returns a value between -1 and 1
console.log(noise.noise2D(200, 300));

const op_first_points = {

    p0_x: 0.3 * w_op, 
    p0_y: 0.7 * h_op, 
    p1_x: 0.3 * w_op, 
    p1_y: 0.1 * h_op, 
    p2_x: 0.7 * w_op, 
    p2_y: 0.1 * h_op, 
    p3_x: 0.7 * w_op, 
    p3_y: 0.7 * h_op

};

const op_array = [];

//console.log(op_array);

const r = .2 * h_op;

for (let n = 0; n < 100; n++ ) {

    // const w0 = noise.noise2D(last[0][0], last[0][1]);
    // const w1 = noise.noise2D(last[1][0], last[1][1]);
    // const w2 = noise.noise2D(last[2][0], last[2][1]);
    // const w3 = noise.noise2D(last[3][0], last[3][1]);

    const ang0 = Math.random() * Math.PI;
    const ang1 = Math.random() * Math.PI;
    const ang2 = Math.random() * Math.PI;
    const ang3 = Math.random() * Math.PI;

    //console.log([ang0, ang1]);

    const n = Math.random() * r;

    const op_new_points = {

        p0_x : op_first_points.p0_x + Math.cos(ang0) * n, 
        p0_y : op_first_points.p0_y + Math.sin(ang0) * n,
        p1_x : op_first_points.p1_x + Math.cos(ang1) * n, 
        p1_y : op_first_points.p1_y + Math.sin(ang1) * n,
        p2_x : op_first_points.p2_x + Math.cos(ang2) * n, 
        p2_y : op_first_points.p2_y + Math.sin(ang2) * n,
        p3_x : op_first_points.p3_x + Math.cos(ang3) * n, 
        p3_y : op_first_points.p3_y + Math.sin(ang3) * n,
        color: `hsl(${n * 13 % 360}, 80%, 60%)`

    };

    console.log(op_new_points);

    //console.log(op_new_points);

    op_array.push(op_new_points);

}

function render_op() {

    ctxOp.fillStyle = '#333';
    ctxOp.fillRect(0, 0, w_op, h_op);

    op_array.forEach(c => {

        //ctxOp.lineWidth = 2;
        ctxOp.globalAlpha = .5;
        ctxOp.lineWidth = 5;
        ctxOp.beginPath()
        ctxOp.arc(c.p0_x, c.p0_y, 4, 0, 2*Math.PI);
        ctxOp.strokeStyle = c.color;
        ctxOp.fillStyle = c.color;
        ctxOp.stroke();
        ctxOp.fill();

        /*
        ctxOp.beginPath();
        ctxOp.lineWidth = 1;
        ctxOp.moveTo(c.p0_x, c.p0_y);
        ctxOp.lineTo(c.p1_x, c.p1_y);
        ctxOp.arc(c.p1_x, c.p1_y, 4, 0, 2*Math.PI);
        ctxOp.stroke();
        ctxOp.closePath();


        ctxOp.beginPath();
        ctxOp.lineWidth = 5;
        ctxOp.arc(c.p2_x, c.p2_y, 4, 0, 2*Math.PI);
        //ctxOp.strokeStyle = c.color;
        //ctxOp.fillStyle = c.color;
        ctxOp.stroke();
        ctxOp.fill();
        ctxOp.closePath();

        ctxOp.beginPath();
        ctxOp.lineWidth = 1;
        ctxOp.moveTo(c.p2_x, c.p2_y);
        ctxOp.lineTo(c.p3_x, c.p3_y);
        ctxOp.arc(c.p1_x, c.p1_y, 4, 0, 2*Math.PI);
        ctxOp.stroke();
        //ctxOp.fill();
        ctxOp.closePath();*/

        ctxOp.beginPath();
        ctxOp.lineWidth = 5;
        ctxOp.arc(c.p3_x, c.p3_y, 4, 0, 2*Math.PI);
        ctxOp.strokeStyle = c.color;
        ctxOp.fillStyle = c.color;
        //ctxOp.stroke();
        ctxOp.fill();
        ctxOp.closePath();

    
        ctxOp.strokeStyle = c.color;
        ctxOp.lineWidth = 5;
        ctxOp.beginPath();
        ctxOp.moveTo(c.p0_x, c.p0_y);
        ctxOp.bezierCurveTo(c.p1_x, c.p1_y, c.p2_x, c.p2_y, c.p3_x, c.p3_y);
        ctxOp.stroke();
        ctxOp.closePath();
        
    });

}

console.log(op_array);

function update_points() {

    ctxOp.fillStyle = '#333';
    ctxOp.fillRect(0, 0, w_op, h_op);

    console.log(props.color);

    op_array.forEach(coords => {

        //const n = Math.random() * r;

        //console.log('antes', coords);

        const w0 = noise.noise2D(coords[0][0], coords[0][1]);
        const w1 = noise.noise2D(coords[1][0], coords[1][1]);
        const w2 = noise.noise2D(coords[2][0], coords[2][1]);
        const w3 = noise.noise2D(coords[3][0], coords[3][1]);

        const w = [w0, w1, w2, w3];
        console.log(w);

        coords.forEach( (point,i) => {

            point[0] = point[0] * Math.cos(Math.PI * w[i]) * n;
            point[1] = point[1] * Math.sin(Math.PI * w[i]) * n;

            ctxOp.beginPath()
            ctxOp.arc(point[0], [point[1]], 2, 0, 2*Math.PI);
            ctxOp.strokeStyle = props.color;
            ctxOp.fillStyle = props.color;
            ctxOp.stroke();
            ctxOp.fill();
            ctxOp.closePath();

        });

        //console.log('depois', coords);

        ctxOp.beginPath();
        ctxOp.moveTo(coords[0][0], coords[0][1]);
        ctxOp.bezierCurveTo(coords[1][0], coords[1][1], coords[2][0], coords[2][1], coords[3][0], coords[3][1]);
        ctxOp.stroke();
        ctxOp.closePath();

    })
}

const inc = 100;

function get_future_position(i, set, p) {

    const w = (Math.random() - 0.5 ) * 2;//noise.noise2D(set[p + '_x'], set[p + '_y']);
    return [
        inc * Math.cos(Math.PI * w) + set[p + '_x'],
        inc * Math.sin(Math.PI * w) + set[p + '_y']
    ];

}

render_op();


gsap.to(op_array, {

    p0_x : (i, set) => w_op - get_future_position(i, set, 'p0')[0],
    p0_y : (i, set) => h_op - get_future_position(i, set, 'p0')[1],
    p1_x : (i, set) => get_future_position(i, set, 'p1')[0],
    p1_y : (i, set) => h_op - get_future_position(i, set, 'p1')[1],
    p2_x : (i, set) => get_future_position(i, set, 'p2')[0],
    p2_y : (i, set) => h_op - get_future_position(i, set, 'p2')[1],
    p3_x : (i, set) => w_op - get_future_position(i, set, 'p3')[0],
    p3_y : (i, set) => h_op - get_future_position(i, set, 'p3')[1],

    color: 'hsl(180, 100%, 50%)',

    duration: 5,
    repeat: 4,
    yoyo: true,

    ease: 'none',

    onUpdate: () => render_op()

})