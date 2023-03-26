
/* init */

const cv_container = document.querySelector('.canvas-container');
const cv = document.querySelector('.the-canvas');
const svg = document.querySelector('svg');
//const el_controls = document.querySelector('.controls');
//const H = wind

const h = +window.getComputedStyle(cv_container).height.slice(0,-2);
const w = +window.getComputedStyle(cv_container).width.slice(0,-2);

const ratio = h/w;

let h_canvas = h;
let w_canvas = w;

/*
if (w <= 800) {
    w_canvas = 800;
    h_canvas = ratio * w_canvas;
}*/

//console.log(w,h);
console.log('Welcome! :)');

svg.setAttribute('height', h);
svg.setAttribute('width', w);
svg.setAttribute('viewbox', `0 0 ${w_canvas} ${h_canvas}`);
svg.style.width = w + 'px';
svg.style.height = h + 'px';

cv.setAttribute('height', h_canvas);
cv.setAttribute('width', w_canvas);
cv.style.width = w + 'px';
cv.style.height = h + 'px';


const initial_points = [
    {
        x: 0.1 * w,
        y: 0.8 * h
    },

    {
        x: 0.3 * w,
        y: 0.3 * h
    },

    {
        x: 0.7 * w,
        y: 0.3 * h
    },

    {
        x: 0.9 * w,
        y: 0.8 * h
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

        const t_ = t == undefined ? this.t : t;

        this.x = this.p0.x * (1 - t_) + this.p1.x * t_;
        this.y = this.p0.y * (1 - t_) + this.p1.y * t_;

        this.t = t_;

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


// resets interpolated points to t = 0; or a different t...
function reset_positions(t = 0) {

    //console.log(t);

    //curve_point.updatePosition(t);
    //console.log(curve_point, 'here');
    interpolated_points.forEach(point => { point.updatePosition(t); })
    //console.log(curve_point, 'after here');

}

function setup(t) {
    prepare_interpolated_points();
    prepare_point_segment_samples();
    reset_positions(t);
}

setup();


//console.log( {initial_points, p, interpolated_points, segments, sampled_curve, sampled_segments });


// svg
// we only create the svg elements, afterwards, the transition of visual changes will be handled by css

initial_points.forEach( (point,i) => {
    
    const new_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    new_circle.classList.add('initial-point', 'draggable');
    new_circle.dataset.id = i;

    new_circle.setAttribute('cx', point.x);
    new_circle.setAttribute('cy', point.y);
    new_circle.setAttribute('r', 10);

    svg.appendChild(new_circle);

    /*
    if ( i < initial_points.length - 1) {

        const new_line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        new_line.setAttribute('x1', point.x);
        new_line.setAttribute('y1', point.y);

        new_line.setAttribute('x2', initial_points[i+1].x);
        new_line.setAttribute('y2', initial_points[i+1].y);

        new_line.classList.add('control-polygon');

        svg.append(new_line);

    }*/


});

const dialog_new_point = {

    margin: 20,

    pos : null,

    el : document.querySelector('.dialog-new-point'),

    btn_yes : document.querySelector('.dialog-new-point button.yes'),

    btn_no : document.querySelector('.dialog-new-point button.no'),

    init_buttons : () => {
        dialog_new_point.btn_yes.addEventListener('click', dialog_new_point.handler_yes);

        dialog_new_point.btn_no.addEventListener('click', dialog_new_point.handler_no);
    },

    fire : (pos) => {
        dialog_new_point.pos = pos;
        dialog_new_point.el.classList.add('yes-no');
        dialog_new_point.move_dialog(pos);
        dialog_new_point.create_circle(pos);
    },

    unfire : () => {

        dialog_new_point.el.classList.remove('yes-no');

        // dialog_new_point.btn_yes.removeEventListener('click', dialog_new_point.handler_yes);

        // dialog_new_point.btn_yes.removeEventListener('click', dialog_new_point.handler_no);

    },

    create_circle : (pos) => {

        let tentative_circle = document.querySelector('.tentative-point');

        let no_previous_circle = tentative_circle == null;

        //console.log(no_previous_circle, tentative_circle);

        if (no_previous_circle) {
            tentative_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        }

        tentative_circle.classList.add('tentative-point');
        tentative_circle.setAttribute('cx', pos.x);
        tentative_circle.setAttribute('cy', pos.y);
        tentative_circle.setAttribute('r', 10);

        if (no_previous_circle) svg.appendChild(tentative_circle);

    },

    remove_circle : () => {

        let tentative_circle = document.querySelector('.tentative-point');

        tentative_circle.remove();

    },

    convert_circle : () => {

        let tentative_circle = document.querySelector('.tentative-point');

        const nof_circles = document.querySelectorAll('.initial-point').length;

        //console.log(tentative_circle);
        tentative_circle.dataset.id = nof_circles;
        tentative_circle.classList.remove('tentative-point');
        tentative_circle.classList.add('initial-point', 'draggable');
        dialog_new_point.reset_movement();


    },

    handler_yes : (e) => {
        const pos = dialog_new_point.pos;
        //console.log('yes, sir');
        dialog_new_point.convert_circle();
        update_new_point(pos);
        dialog_new_point.unfire();

    },

    handler_no : (e) => {
        //console.log('no, sir');
        dialog_new_point.unfire();
        dialog_new_point.reset_movement();
        dialog_new_point.remove_circle();
    },

    reset_movement : () => {

        dialog_new_point.el.style.transform = '';

    },

    move_dialog : (pos) => {

        const x = pos.x;
        const y = pos.y;

        const {width, height} = dialog_new_point.get_size();

        // from right to left!
        let tentative_x = (w - x - width/2);
        //console.log(w, x, tentative_x, width);

        if (tentative_x < 0) tentative_x = dialog_new_point.margin;

        if (tentative_x + width > w) tentative_x = w - width - dialog_new_point.margin;

        let tentative_y = y - height - dialog_new_point.margin;

        dialog_new_point.el.style.transform = `translate(${-tentative_x}px, ${tentative_y}px)`;

    },

    get_size : () => {
        
        const {width, height} = dialog_new_point.el.getBoundingClientRect();

        return {width, height};

    }

}

dialog_new_point.init_buttons();

function makeDraggable() {

    // https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
    // super good!

    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);

    function getMousePosition(e) {
        const CTM = svg.getScreenCTM();
        return {
          x: (e.clientX - CTM.e) / CTM.a,
          y: (e.clientY - CTM.f) / CTM.d
        };
      }

    let selectedCircle;
    let id;
    let coord;

    function startDrag(e) {

        if (e.target.classList.contains('draggable')) {
            selectedCircle = e.target;
            id = +selectedCircle.getAttributeNS(null, 'data-id');
            selectedCircle.classList.add('dragging');
            pause_animation();
        } else {
            const pos = getMousePosition(e) 
            dialog_new_point.fire(pos);
            //console.log(e);
        }

    }
    function drag(e) {

        if (selectedCircle) {

            e.preventDefault();
            coord = getMousePosition(e);
            selectedCircle.setAttributeNS(null, "cx", coord.x);
            selectedCircle.setAttributeNS(null, "cy", coord.y);
            update_static(id, coord);

        }

    }

    function endDrag(e) {

        //resume_animation();

        if (selectedCircle) {
            selectedCircle.classList.remove('dragging');
            selectedCircle = null;
            
        }

    }
}

makeDraggable()

// canvas

const c = cv.getContext('2d');

function render_control_points() {

    initial_points.forEach( (point,i) => {

        c.beginPath();
        c.strokeStyle = 'white';
        c.fillStyle = 'white';
        c.arc(point.x, point.y, 10, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        if ( i < initial_points.length - 1) {

            c.beginPath();
            c.moveTo(point.x, point.y);
            c.lineTo(initial_points[i+1].x, initial_points[i+1].y);
            c.lineWidth = 1;
            c.stroke();
            c.closePath();
    
        }

    })

}

render_control_points();

// render_control_points();
function get_color(generation) {
    let max_gen = initial_points.length - 1;
    let nof_new_colors = max_gen - 3;

    const t_color = (generation - 1) / (nof_new_colors + 1);
    
    const color_rgb = {
            r : ( (1 - t_color) * 0 + t_color * 255 ),// % 255,
            g : ( (1 - t_color) * 255 + t_color * 255 ),// % 255,
            b : ( (1 - t_color) * 255 + t_color * 0 )// % 255 
        }
        //color = point.generation == 1 ? 'cyan' : 'yellow'
    return color_rgb;
}

function render_interpolated_points() {

    interpolated_points.forEach( (point,i) => {

        const {x, y} = point.getPosition();

        // let max_gen = initial_points.length - 1;
        // let nof_new_colors = max_gen - 3;

        // const t_color = (point.generation - 1) / (nof_new_colors + 1);
        // let color_rgb = {};
        // console.log(nof_new_colors, point.generation - 1, t_color);

        if (i == interpolated_points.length - 1) {
            color_rgb = {r: 255, g: 0, b: 255};
        } else {
            color_rgb = get_color(point.generation);
            // color_rgb = {
            //     r : ( (1 - t_color) * 0 + t_color * 255 ),// % 255,
            //     g : ( (1 - t_color) * 255 + t_color * 255 ),// % 255,
            //     b : ( (1 - t_color) * 255 + t_color * 0 )// % 255
            //}
            //color = point.generation == 1 ? 'cyan' : 'yellow'

        }

        //console.log(nof_new_colors, point.generation - 1, t_color, color_rgb);

        c.beginPath();
        c.strokeStyle = `rgb(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b})`;
        c.fillStyle = `rgb(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b})`;
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

        const color_rgb = get_color(generation);

        c.beginPath();
        c.strokeStyle = `rgb(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b})`;//generation == 1 ? 'cyan' : 'yellow';
        //c.fillStyle = 'lightcoral';
        c.globalAlpha = render_flags.fade ? alpha : .5;
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
    c.lineWidth = 4;
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

        const color_rgb = get_color(segment.generation);



        c.beginPath();
        c.strokeStyle = `rgb(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b})`;//generation == 1 ? 'cyan' : 'yellow';
        //c.strokeStyle = segment.generation == 1 ? 'cyan' : 'yellow';
        //c.fillStyle = 'lightcoral';
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.lineWidth = 3;
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
const render_flags = {

    segments : true,
    past_segments : true,
    points : true,
    fade : true

}


function render() {

    clear_canvas();

    /*
    if (curve) {
        render_curve();
        render_curtain();
    }*/

    render_control_points();
    if (render_flags.past_segments) render_sampled_segments();
    if (render_flags.segments) render_segments();
    if (render_flags.points) render_interpolated_points();

    render_sampled_curve();

}

function tick() {

    interpolated_points.forEach(point => point.updatePosition());
    render();
    const t = curve_point.get_t();
    update_slider_t(t);

}

let tl = new gsap.timeline()
  .to(interpolated_points, {
        t : 1,

        duration: 4,
        yoyo: true,
        repeat: 20,
        //ease: 'none',
    
        onUpdate: tick,

        onRepeat: () => {
            indo = !indo;
        }
    })
    .pause();

let indo = true;
let flag_t_manually_changed = false;


function fixes_timeline(t_atual) {

    //const t_atual = curve_point.get_t();

    if (indo) {

        //indo = false;

        tl = gsap.timeline().fromTo(interpolated_points, {t: t_atual}, {
            t : 1,
    
            duration: 4 * (1 - t_atual),
            //ease: 'none',
        
            onUpdate: tick,
            onComplete: () => indo = !indo

        })
        .to(interpolated_points, {

            t : 0,

            duration: 4,
            yoyo: true,
            repeat: 20,
            //ease: 'none',
        
            onUpdate: tick,
    
            onRepeat: () => indo = !indo

        });

    } else {

        //indo = true;

        tl = gsap.timeline().fromTo(interpolated_points, {t: t_atual}, {
            t : 0,
    
            duration: 4 * (t_atual),
            //ease: 'none',
        
            onUpdate: tick,
            onComplete: () => indo = !indo

        })
        .to(interpolated_points, {

            t : 1,

            duration: 4,
            yoyo: true,
            repeat: 20,
            //ease: 'none',
        
            onUpdate: tick,
    
            onRepeat: () => indo = !indo

        });

    }

}

function update_static(id, coord) {

    tl.pause();
    initial_points[id] = coord;
    const t_atual = curve_point.get_t();
    setup(t_atual);
    render();

}

function update_new_point(pos) {

    //console.log(pos);
    //tl.pause();
    pause_animation();
    initial_points.push({x: pos.x, y: pos.y});
    const t_atual = curve_point.get_t();
    setup(t_atual);
    render();

}

function pause_animation() {
    tl.pause();
    //self.el.dataset.mode = 'paused';
    inputs['play_pause_btn'].el.dataset.mode = 'paused';
}

function resume_animation() {
    inputs['play_pause_btn'].el.dataset.mode = 'playing';
    tl.play();
    //self.el.dataset.mode = 'playing';

}

function update(id = null) {
    tl.pause();
    initial_points[1].x = 350;
    initial_points[1].y = 150;
    initial_points.push({x: 500, y: 600});
    const t_atual = curve_point.get_t();
    setup(t_atual);
    fixes_timeline(t_atual);

}

// UI

// helper
function update_slider_t_label(t) {

    const slider_t_label = document.querySelector('.slider-wrapper span.label');
    const t_formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t);
    
    slider_t_label.textContent = t_formatted;
    slider_t_label.style.left = Math.round(t * 100) + '%';

}

function update_slider_t(t) {

    const slider = inputs['slider'].el;
    slider.value = t;
    update_slider_t_label(t);

}


class UI_component {

    ref = null;
    el = null;

    type = null;
    handler = null;

    constructor(ref, type_event, handler) {

        this.ref = ref;
        this.el = document.querySelector(ref);
        this.type = type_event;
        this.handler = handler;

        this.monitor();


    }

    monitor() {

        this.el.addEventListener(this.type, e => this.handler(this));

    }

}
const inputs_parameters = [

    {
        name: 'play_pause_btn',
        ref: '.controls .btn-play',
        type: 'click',
        handler: (self) => {

            if (self.el.dataset.mode == 'paused') {
                
                const t = +inputs['slider'].el.value;
                
                reset_positions(t);
                fixes_timeline(t);

                resume_animation();

            } else {

                pause_animation()
            }

        }
    },

    {
        name: 'slider',
        ref: 'input[type="range"]',
        type: 'input',
        handler: (self) => {

            const t = self.el.value;
            update_slider_t_label(t);
            reset_positions(t);
            render();
            flag_t_manually_changed = true;
    
        }
    },

    {
        name: 'points',
        ref: '#ctrl-points',
        type: 'click',
        handler: (self) => {

            const flag = self.el.name; // segments, points, past_segments
            render_flags[flag] = self.el.checked;
            render();

        }
    },

    {
        name: 'segments',
        ref: '#ctrl-segments',
        type: 'click',
        handler: (self) => {

            const flag = self.el.name; // segments, points, past_segments
            render_flags[flag] = self.el.checked;
            //console.log(flag, self.el.checked);
            render();

        }
    },

    {
        name: 'past_segments',
        ref: '#ctrl-past-segments',
        type: 'click',
        handler: (self) => {

            const flag = self.el.name; // segments, points, past_segments
            render_flags[flag] = self.el.checked;
            render();

        }
    },

    {
        name: 'fade',
        ref: 'select#ctrl-past-segments-fade',
        type: 'change',
        handler: (self) => {

            render_flags['fade'] = self.el.value == 'fade';
            //console.log(self.el.value);
            render();

        }
    }


]

const inputs = {};

inputs_parameters.forEach(input_parameter => {

    inputs[input_parameter.name] = new UI_component(input_parameter.ref, input_parameter.type, input_parameter.handler);

})

