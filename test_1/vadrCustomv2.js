points=[167,1636,1637,1640,1641,3105,3108,3109,3112,3113,3114,3115,3116,3117,3118,3119,4575,4589,4590,4591,4592,6042,6043,6044,6062,6063,6064,7509,7510,7511,7535,7536,8967,8968,8969,8970,8971,8972,8973,8974,8975,8976,8977,8978,9006,9007,10437,10477,10478,11908,11948,13379,13419,14850,14889,16320,16359,17790,17829,19260,19299,20730,20769,22238],unitBoxDim=2.5,convertFactors=[1470,147,1],intensityArray=[2,2,1,2,2,1,2,1,1,2,1,2,1,2,1,1,1,1,2,1,1,2,1,2,1,2,1,1,2,1,2,1,4,2,2,1,2,1,2,1,2,2,1,2,1,1,1,1,1,1,2,1,1,2,1,4,1,1,1,1,1,1,1,1],boundingBox=[17,-1,-1199];

function GetRainbowTexture(){
    var textureColors = [
        [0, 0, 0],
        [13, 0, 254],
        [14, 38, 252],
        [0, 55, 255],
        [1, 96, 226],
        [3, 157, 137],
        [12, 226, 54],
        [17, 255, 15],
        [109, 254, 6],
        [219, 255, 3],
        [255, 227, 8],
        [253, 153, 24],
        [241, 93, 36],
        [239, 67, 38],
        [239, 51, 38],
        [239, 41, 38]
    ];
    heatmapTexture = new Uint8Array(16 * 2 * 3).fill(0);
    for (var i = 0; i < 16; i++) {
        heatmapTexture[3 * i] = textureColors[i][0];
        heatmapTexture[3 * i + 1] = textureColors[i][1];
        heatmapTexture[3 * i + 2] = textureColors[i][2];
        heatmapTexture[3 * (i + 16)] = textureColors[i][0];
        heatmapTexture[3 * (i + 16) + 1] = textureColors[i][1];
        heatmapTexture[3 * (i + 16) + 2] = textureColors[i][2];
    }
    heatmapTexture = new THREE.DataTexture(heatmapTexture, 16, 2, THREE.RGBFormat);
    heatmapTexture.minFilter = THREE.LinearFilter;
    heatmapTexture.magFilter = THREE.LinearFilter;
    heatmapTexture.needsUpdate = true;
    return heatmapTexture;
}

THREE.VadrObjectShader = function(depthTest) {
    this.uniforms = {
        "constFactor": {
            value: 1
        },
        "lowerBound": {
            type: "v3",
            value: new THREE.Vector3(0, 0, 0)
        },
        "conversionFactor": {
            type: "v3",
            value: new THREE.Vector3(0, 0, 0)
        },
        "boxDataTextureXY": {
            value: null
        },
        "boxDataTextureZI": {
            value: null
        },
        "heatmapTexture": {
            value: GetRainbowTexture()
        },
        "textureValid": { value: 0 },
        "boxScale": { value: 1 },
    };
    this.vertexShader = [
        "precision mediump float;",
        "precision mediump int;",

        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",
        "uniform float boxScale;",
        "uniform vec3 lowerBound;",

        "attribute vec3 position;",
        "varying vec3 f_position;",

        "void main() {",
        "   vec4 sourcePos = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);",
        "   gl_Position = sourcePos;",
        // "   f_position = vec3(position.xyz);",
        "   f_position = vec3(((position.xyz - lowerBound) / boxScale - 0.5) / 255.);",
        "}"
    ].join("\n");
    this.fragmentShader = [
        "precision mediump float;",
        "precision mediump int;",
        "varying vec3 f_position;",

        "uniform float textureValid;",
        "uniform float constFactor;",

        "uniform vec3 conversionFactor;",

        "uniform sampler2D heatmapTexture;",
        "uniform sampler2D boxDataTextureXY;",
        "uniform sampler2D boxDataTextureZI;",

        "void main(){",

        "   if (textureValid == 0.){",
        "       gl_FragColor = vec4(.5, .5, .5, 1.);",
        "   } else {",
        "   float sumIntensity = 0.;",
        "   for (int i = 0; i < 8; i++){",
        "       float iFloat = float(i) + 0.5;",
        // "       float iFloat = 1.5;",
        "       for (int j = 0; j < 4; j++){",
        "           float jFloat = float(j) + 0.5;",
        // "           float jFloat = 0.5;",
        "           vec2 texPosition = vec2(iFloat / 8., jFloat / 8.);",
        "           vec4 tempPixelXY = texture2D(boxDataTextureXY, texPosition);",
        "           vec4 tempPixelZI = texture2D(boxDataTextureZI, texPosition);",
        // "           float positionIndex = 16711680. * tempPixel.x + 65280. * tempPixel.y + 255. * tempPixel.z;",
        // // "           float positionIndex = 1636.;",
        // "           float positionX = 1.;",
        // "           float positionY = 1.;",
        // "           float positionZ = 1.;",
        "           float positionX = 256. * tempPixelXY.x + tempPixelXY.y;",
        "           float positionY = 256. * tempPixelXY.z + tempPixelXY.w;",
        "           float positionZ = 256. * tempPixelZI.x + tempPixelZI.y;",
        "           vec3 positionVertex = vec3(positionX, positionY, positionZ);",
        // "           vec3 positionVertex = vec3(0.0, 0.0, 0.0);",
        "           float diffSquare = distance(positionVertex, f_position);",
        "           diffSquare = 0.01 + diffSquare * diffSquare;",

        "           float invertDiff = tempPixelZI.w / diffSquare;",
        "           sumIntensity = sumIntensity + invertDiff  * 0.2;",
        // "           sumIntensity = positionX;",
        "       }",
        "       }",
        // "           if (sumIntensity > 1.0){",
        // // "           if (texture2D(heatmapTexture, vec2(2.5 / 16., .5 / 16.)).x == 14. / 255.){",
        // "           gl_FragColor = vec4(1., 0., 0., 1.);",
        // "           }else{",
        // "           gl_FragColor = vec4(0., 1., 0., 1.);",
        // "           }",
        "   vec2 colorTex = vec2(sumIntensity, 0.5);",
        "   gl_FragColor = texture2D(heatmapTexture, colorTex);",
        "   }",
        "}",
    ].join("\n");
    this.depthTest = true;
    this.depthWrite = true;
    this.transparent = false;
    this.blending = THREE.CustomBlending;
    this.blendEquation = THREE.AddEquation;
    this.blendSrc = THREE.SrcAlphaFactor;
    this.blendDst = THREE.OneFactor;
    this.blendSrcAlpha = THREE.OneMinusDstAlphaFactor;
    this.blendDstAlpha = THREE.OneFactor;
    // this.side = THREE.DoubleSide;
}

//converts the index into 3d coordinate (in data aggreagte box space)
function getPointFromIndex(pointIndex, conversionFactors){
    var point = [ 0, 0, 0 ];
    point[0] = Math.floor(pointIndex / conversionFactors[0]);
    point[1] = pointIndex - point[0] * conversionFactors[0];
    point[2] = point[1] % conversionFactors[1];
    point[1] = Math.floor(point[1] / conversionFactors[1]);
    return point;
}


// converts an integer into 16 bits (2 values, 8 bit left and 8 bit right)
function get2xUintValue(intengerValue){
    return [Math.floor(intengerValue / 256), intengerValue % 256];
}

// encodes 3d position and intensity values in two textures of 32 bit width each
// X and Y get 16 bits(XY, ZW) each of first teture
// Z and I get 16 bits(XY, ZW) each of second texture
function createDataTexture(pointsArray, intensityArray, maxIntensity, conversionFactors){
    if (pointsArray.length > 8 * 8){
        console.log("Way too many points to handle, taking first 8 * 8 points");
    }

    var dataTextureXY = new Uint8Array(8 * 8 * 4).fill(0);
    var dataTextureZI = new Uint8Array(8 * 8 * 4).fill(0);
    for ( var i = 0; i < 8 * 8; i++ ) {

        if ( i < pointsArray.length ){

            var tempPoint = getPointFromIndex(pointsArray[i], conversionFactors);
            tempPoint = [ get2xUintValue(tempPoint[0]), get2xUintValue(tempPoint[1]), get2xUintValue(tempPoint[2]) ];
            dataTextureXY[4 * i] = tempPoint[0][0];
            dataTextureXY[4 * i + 1] = tempPoint[0][1];
            dataTextureXY[4 * i + 2] = tempPoint[1][0];
            dataTextureXY[4 * i + 3] = tempPoint[1][1];                
            dataTextureZI[4 * i] = tempPoint[2][0];
            dataTextureZI[4 * i + 1] = tempPoint[2][1];
            dataTextureZI[4 * i + 2] = 0;
            dataTextureZI[4 * i + 3] = intensityArray[i] / maxIntensity * 255;                

        } else
            break;

    }
    dataTextureXY = new THREE.DataTexture(dataTextureXY, 8, 8, THREE.RGBAFormat);
    dataTextureXY.minFilter = THREE.NearestFilter;
    dataTextureXY.magFilter = THREE.NearestFilter;
    dataTextureXY.needsUpdate = true;
    dataTextureZI = new THREE.DataTexture(dataTextureZI, 8, 8, THREE.RGBAFormat);
    dataTextureZI.minFilter = THREE.NearestFilter;
    dataTextureZI.magFilter = THREE.NearestFilter;
    dataTextureZI.needsUpdate = true;
    console.log(dataTextureXY.image, dataTextureZI.image);
    return [ dataTextureXY, dataTextureZI ];
}

function updateMaterial(materialObject, dataTexture){

    materialObject.uniforms['boxDataTextureXY'].value = dataTexture[0];
    materialObject.uniforms['boxDataTextureZI'].value = dataTexture[1];
    // materialObject.uniforms['intensityMax'].value = pointsData[0];
    materialObject.uniforms['textureValid'].value = 1;
    materialObject.uniforms['boxScale'].value = unitBoxDim;
    materialObject.uniforms['lowerBound'].value = new THREE.Vector3(boundingBox[0], 
                                                    boundingBox[1], boundingBox[2]);
    materialObject.uniforms['conversionFactor'].value = new THREE.Vector3(convertFactors[0], 
                                                    convertFactors[1], convertFactors[2]);
    materialObject.needsUpdate = true;

}

function generateHeatmap(){
    if (model){
        var maxIntensity = 0;
        var numberOfPoints = points.length;
        if (numberOfPoints > 8 * 8){
            console.log("Way too many points to handle, taking first 8 * 8 points");
            numberOfPoints = 8 * 8;
        }
        for ( var i = 0; i < numberOfPoints; i++ ){

            maxIntensity = maxIntensity > intensityArray[i] ? maxIntensity : intensityArray[i];

        }

        maxIntensity = maxIntensity > 0 ? maxIntensity : 1;
        var dataTexture = createDataTexture(points, intensityArray, maxIntensity, convertFactors);
    
        for ( var i = 0; i < model.children.length; i++ ){

            var modelChild = model.children[i];
            if (modelChild.material.type == "RawShaderMaterial"){
                updateMaterial(modelChild.material, dataTexture);
            }
            else if (modelChild.material.type == "MultiMaterial"){
                for (var j = 0; j < modelChild.material.materials.length; j++){
                    updateMaterial(modelChild.material.materials[j], dataTexture);
                }
            }else if(modelChild.material.constructor == Array){
                for (var j = 0; j < modelChild.material.length; j++){
                    updateMaterial(modelChild.material[j], dataTexture);
                }
            }else{
                console.log(modelChild.material);
            }
        }
    }
}

function get3xUint8Value(value, relativeMaxValue){
    var returnValue = [0, 0, 0];
    returnValue[0] = Math.floor(value / (256 * 256));
    returnValue[1] = value % (256 * 256);
    returnValue[2] = returnValue[1] % 256;
    returnValue[1] = Math.floor(returnValue[1] / 256);
    return returnValue;
}