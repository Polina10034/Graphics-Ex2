//////////////////////////////////////
// Graphics EX2
//Students: Eilon Cohen   312534266
//          Polina Polsky 323233262
//          Ariel Hadad   316464098
//////////////////////////////////////
//Script of all functions
//------------------------------------------------------------------------------------------------
//Load the page with all input values choosen by user on UI 
$(document).ready(function() {
    var objects = null;
    let srcShape = null;
    var reader;
    var canvas = $("canvas");
    var context = canvas[0].getContext('2d');
    var shapeSelected = $( 'input[name=shapeRadioBtn]:checked' ).val();
    var movex = $( 'input[name=movex]' ).val();
    var movey = $( 'input[name=movey]' ).val();
    var scale = $( 'input[name=scale]' ).val();
    var mirror = $( 'select[name=mirror]' ).val();
    var rotation = $( 'input[name=rotation]' ).val();
    var shearA = $( 'input[name=shearA]' ).val();
    var shearB = $( 'input[name=shearB]' ).val();
    var rotatepoint = $( 'input[name=rotatepoint]' ).is(":checked") ? true : false;
    var scalepoint = $( 'input[name=scalepoint]' ).is(":checked") ? true : false;

    // enter the value of the choosen transmittion to appropriate variable
    $('input[name=shapeRadioBtn]').change(function(){
        shapeSelected = $( 'input[name=shapeRadioBtn]:checked' ).val();
    });
    $('input[name=movex]').change(function(){
        movex = $( 'input[name=movex]' ).val();
    });
    $('input[name=movey]').change(function(){
        movey = $( 'input[name=movey]' ).val();
    });
    $('input[name=scale]').change(function(){
        scale = $( 'input[name=scale]' ).val();
    });
    $('select[name=mirror]').change(function(){
        mirror = $( 'select[name=mirror]' ).val();
    });
    $('input[name=rotation]').change(function(){
        rotation = $( 'input[name=rotation]' ).val();
    });
    $('input[name=shearA]').change(function(){
        shearA = $( 'input[name=shearA]' ).val();
    });
    $('input[name=shearB]').change(function(){
        shearB = $( 'input[name=shearB]' ).val();
    });
    $('input[name=rotatepoint]').click(function(){
        if($(this).is(":checked")){
            rotatepoint = true
        }
        else if($(this).is(":not(:checked)")){
            rotatepoint = false
        }
    });
    $('input[name=scalepoint]').click(function(){
        if($(this).is(":checked")){
            scalepoint = true
        }
        else if($(this).is(":not(:checked)")){
            scalepoint = false
        }
    });

    // 1. LoadFile() this function load the json file and draw the points of the boat on the canvas
    $('input[type=file]').on('change', event => {
        reader = new FileReader();
        reader.onload = event => {
            context.clearRect(0, 0, canvas.width(), canvas.height()); // 'make sure that the canvas is clear.
            try {
                objects = JSON.parse(event.target.result);
                srcShape = JSON.parse(event.target.result)
                drawObject(context, objects);
                resizeObjectsToCanvasSize(canvas, context, objects);
            } catch (error) {
                objects = null;
                alert("Failed to read the graphics data file!\n\n" + error);
            }
        }
        reader.readAsText(event.target.files[0]);
    });

    // 2. this function are manage the type of the choosen transformation
    canvas.click(function(e) {
        if(objects === null)
            return

        let elem = $(this);
        let xPos = e.pageX - elem.offset().left;
        let yPos = e.pageY - elem.offset().top;

        switch(shapeSelected) {
            case "translation":
                // this case wiil happen when translation transformation choosen.
                translation(objects, parseInt(movex), parseInt(movey));
                context.clearRect(0, 0, canvas.width(), canvas.height());
                drawObject(context, objects);
                break;

            case "scaling":
                // this case wiil happen when scaling transformation choosen.
                if(scalepoint) {
                    xPos = e.pageX - elem.offset().left;
                    yPos = e.pageY - elem.offset().top;
                }
                else {
                    xPos = canvas.width()/2;
                    yPos = canvas.height()/2;
                }

                translation(objects, -xPos, -yPos);
                transformation(objects, [[scale, 0],[0, scale]], true);
                translation(objects, xPos, yPos);
                context.clearRect(0, 0, canvas.width(), canvas.height());
                drawObject(context, objects);
                break;

            case "rotating":
                // this case wiil happen when rotating transformation choosen.
                if(rotatepoint) {
                    xPos = e.pageX - elem.offset().left;
                    yPos = e.pageY - elem.offset().top;
                }
                else {
                    xPos = canvas.width()/2;
                    yPos = canvas.height()/2;
                }

                let radian = rotation * Math.PI/180 // Convert degrees to radians
                translation(objects, -xPos, -xPos);
                transformation(objects, [[Math.cos(radian), Math.sin(radian)],[-Math.sin(radian), Math.cos(radian)]]);
                translation(objects, xPos, yPos);
                context.clearRect(0, 0, canvas.width(), canvas.height());
                drawObject(context, objects);
                break;

            case "mirroring":
                // this case wiil happen when mirroring transformation choosen.
                let mirrorMatrix
                // Chooses the mirror type (x, y or xy)
                switch(mirror) {
                    case "type1":
                        // x choosen
                        mirrorMatrix = [[-1, 0], [0, 1]]
                        transformation(objects, mirrorMatrix);
                        translation(objects, canvas.width(), 0);
                        break
                    case "type2":
                      // y choosen
                        mirrorMatrix = [[1, 0], [0, -1]]
                        transformation(objects, mirrorMatrix);
                        console.log(canvas.height)
                        translation(objects, 0, canvas.height());
                        break
                    case "type3":
                      // xy choosen
                        mirrorMatrix = [[-1, 0], [0, -1]]
                        transformation(objects, mirrorMatrix);
                        translation(objects, canvas.width(), canvas.height());
                        break
                }

                context.clearRect(0, 0, canvas.width(), canvas.height());
                drawObject(context, objects);
                break;

            case "shearing":
                // this case wiil happen when shearing transformation choosen.
                translation(objects, -canvas.width()/2, -canvas.height()/2);
                transformation(objects, [[1, shearA], [shearB, 1]]);
                translation(objects, canvas.width()/2, canvas.height()/2);
                context.clearRect(0, 0, canvas.width(), canvas.height());
                drawObject(context, objects);
                break;
            default:
                break;
        }
    });

    // Shear by swiping canvas
    //the beginning point oh shear
    let shearStart = {x: 0, y: 0};
    let shearEnd = {x: 0, y: 0};

    canvas.mousedown(e => {
        const canvas = document.querySelector('canvas')
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        shearStart = {x, y};
    });
    canvas.mouseup(e => {
        const ctx = document.querySelector('canvas')
        const rect = ctx.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        shearEnd = {x, y};
        const diffX = (shearEnd.x - shearStart.x) / 1000;
        const diffY = (shearEnd.y - shearStart.y) / 1000;
        if (shapeSelected == 'shearing') {
            transformation(objects, [[1, diffX], [diffY, 1]]);
            context.clearRect(0, 0, canvas.width(), canvas.height());
            drawObject(context, objects);
        }
    });

    // 3. when the user push on the reset button, the canvas clear and draw the boat again at the center of the canvas
    $( "#reset-button" ).click(function() {
        objects = JSON.parse(JSON.stringify(srcShape))
        context.clearRect(0, 0, canvas.width(), canvas.height()); // clear canvas on new file load
        drawObject(context, objects);
    });
});
// enter the coordinate of shape from the json file to item array
function translation(objects, movex, movey) {
    objects.forEach(item => {
        switch(item.type) {
            case "line":
                item.p1x = item.p1x + movex;
                item.p2x = item.p2x + movex;
                item.p1y = item.p1y + movey;
                item.p2y = item.p2y + movey;
                break;
            case "circle":
                item.centerx = item.centerx + movex;
                item.centery = item.centery + movey;
                break;
            case "curve":
                item.p1x = item.p1x + movex;
                item.p2x = item.p2x + movex;
                item.p3x = item.p3x + movex;
                item.p4x = item.p4x + movex;
                item.p1y = item.p1y + movey;
                item.p2y = item.p2y + movey;
                item.p3y = item.p3y + movey;
                item.p4y = item.p4y + movey;
                break;
        }
    })
}
// Performs the transform operation on a point
function transform(object, x, y, matrix) {
    let point = multiplyMatrixByVector(matrix, [object[x], object[y]])
    object[x] = point[0]
    object[y] = point[1]
}

// Objects transformation function according to given matrix, scaleRadius true will also scale the circle radius
function transformation(objects, matrix, scaleRadius=false) {
    objects.forEach(item => {
        switch(item.type) {
            case "line":
                transform(item, "p1x", "p1y", matrix);
                transform(item, "p2x", "p2y", matrix);
                break;
            case "circle":
                transform(item, "centerx", "centery", matrix);
                if(scaleRadius)
                    item.radius = item.radius*matrix[0][0];
                break;
            case "curve":
                transform(item, "p1x", "p1y", matrix);
                transform(item, "p2x", "p2y", matrix);
                transform(item, "p3x", "p3y", matrix);
                transform(item, "p4x", "p4y", matrix);
                break;
        }
    })
}
// Validates that object contains all required fields, writes missing field errors into errorArray
function validate(object, errorArray) {
    let errorFlag = true; // true if no errors
    const lineFields = ["p1x", "p1y", "p2x", "p2y"]
    const circleFields = ["centerx", "centery", "radius"]
    const curveFields = ["p1x", "p1y", "p2x", "p2y", "p3x", "p3y", "p4x", "p4y"]
    if(typeof(object.type) === "undefined") {
        errorArray.push("Object missing type field ( " + JSON.stringify(object) + " )");
        return false
    }
    switch(object.type) {
        case "line":
            lineFields.forEach((field) => {
                if(typeof(object[field]) === "undefined") {
                    errorArray.push(object.type + " missing " + field + " field ( " + JSON.stringify(object) + " )");
                    errorFlag = false;
                }
            })
            break;
        case "circle":
            circleFields.forEach((field) => {
                if(typeof(object[field]) === "undefined") {
                    errorArray.push(object.type + " missing " + field + " field ( " + JSON.stringify(object) + " )");
                    errorFlag = false;
                }
            })
            break;
        case "curve":
            curveFields.forEach((field) => {
                if(typeof(object[field]) === "undefined") {
                    errorArray.push(object.type + " missing " + field + " field ( " + JSON.stringify(object) + " )");
                    errorFlag = false;
                }
            })
            break;
        default:
            alert("File contains object with unknown type!");
            break;
    }
    return errorFlag;
}

// Receives data of the boat that containing matrix of coordinates of lines circles and curves, the function draws them according to object type
function drawObject(context, data) {
    let errorArray = []
    Promise.all(data.map(item => {
        if(typeof(item.color) === "undefined")
            context.strokeStyle = "black";
        else
            context.strokeStyle = item.color;

        if(validate(item, errorArray))
            switch(item.type) {
                case "line":
                    drawLine(context, item.p1x, item.p1y, item.p2x, item.p2y);
                    break;
                case "circle":
                    drawCircle(context, item.centerx, item.centery, item.radius);
                    break;
                case "curve":
                    drawBezierCurve(context, item.p1x, item.p1y, item.p2x, item.p2y, item.p3x, item.p3y, item.p4x, item.p4y, 500);
                    break;
                default:
                    alert("File contains object with unknown type!")
                    break;
            }
    })).then(() => {if(errorArray.length > 0) alert("File contains errors!\n\n" + errorArray)})
}
// Function finds the max coordinate values of the object, and performs scaling operation to resize them to canvas size
function resizeObjectsToCanvasSize(canvas, context, data) {
    let errorArray = []
    let xMax = 0
    let yMax = 0
    Promise.all(data.map(item => {
        if(validate(item, errorArray))
            switch(item.type) {
                case "line":
                    if(item.p1x > xMax)
                        xMax = item.p1x;
                    if(item.p2x > xMax)
                        xMax = item.p2x;
                    if(item.p1y > yMax)
                        yMax = item.p1y;
                    if(item.p2y > yMax)
                        yMax = item.p2y;
                    break;
                case "circle":
                    if(item.centerx + item.radius > xMax)
                        xMax = item.centerx + item.radius;
                    if(item.centery + item.radius > yMax)
                        yMax = item.centery + item.radius;
                    break;
                case "curve":
                    if(item.p1x > xMax)
                        xMax = item.p1x;
                    if(item.p2x > xMax)
                        xMax = item.p2x;
                    if(item.p1y > yMax)
                        yMax = item.p1y;
                    if(item.p2y > yMax)
                        yMax = item.p2y;
                    if(item.p3x > xMax)
                        xMax = item.p3x;
                    if(item.p4x > xMax)
                        xMax = item.p4x;
                    if(item.p3y > yMax)
                        yMax = item.p3y;
                    if(item.p4y > yMax)
                        yMax = item.p4y;
                    break;
                default:
                    break;
            }
    })).then(() => {
        let max = xMax > yMax ? xMax : yMax;
        transformation(data, [[canvas.width() / max, 0],[0, canvas.width() / max]], true);
        context.clearRect(0, 0, canvas.width(), canvas.height());
        drawObject(context, data);
    })
}


// drawCricle receieves context, center point and radius length
function drawCircle(context, centerX, centerY, radius){
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
}
// drawLine receives context and 2 points
function drawLine(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
    context.closePath();
}


// multiplyMatrixByVector returns an array representing the vector that results from multiplying matrix m by vector v
function multiplyMatrixByVector(m, v) {
    result = new Array(m.length);
    for (let i = 0; i < m.length; i++) {
        result[i] = 0;
        for (let j = 0; j < v.length; j++) {
            result[i] += m[i][j] * v[j];
        }
    }
    return result;
}

// calculateCurvePoint returns the value (rounded down) of a 3rd degree polinomial with the given coefficients and x value
function calculateCurvePoint(coeffs, x) {
    return Math.floor(Math.pow(x, 3) * coeffs[0] + Math.pow(x, 2) * coeffs[1] + x * coeffs[2] + coeffs[3])
}

// drawBezierCurve receives context, p1 is starting point with control point p2, p4 is end point with control point p3
function drawBezierCurve(context, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, lines) {
    const bezierMatrix = [[-1, 3, -3, 1], [3, -6, 3, 0], [-3, 3, 0, 0], [1, 0, 0, 0]];
    const pointVectorX = [p1x, p2x, p3x, p4x];
    const pointVectorY = [p1y, p2y, p3y, p4y];

    const cx = multiplyMatrixByVector(bezierMatrix, pointVectorX);
    const cy = multiplyMatrixByVector(bezierMatrix, pointVectorY);

    step = 1/lines;
    for(let t = 0; Math.floor((t+step)*100)/100 <= 1; t+=step) {
        let startX = calculateCurvePoint(cx, 1-t);
        let startY = calculateCurvePoint(cy, 1-t);
        let endX = calculateCurvePoint(cx, 1-(t+step));
        let endY = calculateCurvePoint(cy, 1-(t+step));

        drawLine(context, startX, startY, endX, endY);
        if(Math.floor((t+step)*100)/100 === 1)
            break
    }
}
