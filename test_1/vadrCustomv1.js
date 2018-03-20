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
        "boxDataTexture": {
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
        "   f_position = vec3((position.xyz - lowerBound) / boxScale - 0.5);",
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
        "uniform sampler2D boxDataTexture;",

        "void main(){",

        "   if (textureValid == 0.){",
        "       gl_FragColor = vec4(.5, .5, .5, 1.);",
        "   } else {",
        "   float sumIntensity = 0.;",
        "   for (int i = 0; i < 8; i++){",
        "       float iFloat = float(i) + 0.5;",
        "       for (int j = 0; j < 8; j++){",
        "           float jFloat = float(j) + 0.5;",
        "           vec2 texPosition = vec2(iFloat / 8., jFloat / 8.);",
        "           vec4 tempPixel = texture2D(boxDataTexture, texPosition);",
        "           float positionIndex = 16711680. * tempPixel.x + 65280. * tempPixel.y + 255. * tempPixel.z;",
        "           float positionX = 0.;",
        "           float positionY = 0.;",
        "           float positionZ = 0.;",
        "           positionX = positionIndex / conversionFactor.x;",
        "           positionY = fract(positionX) * conversionFactor.x / conversionFactor.y;",
        "           positionX = floor(positionX);",
        "           positionZ = fract(positionY) * conversionFactor.y;",
        "           positionY = floor(positionY);",
        "           vec3 positionVertex = vec3(positionX, positionY, positionZ);",
        "           float diffSquare = distance(positionVertex, f_position);",
        "           diffSquare = 0.01 + diffSquare * diffSquare;",

        "           float invertDiff = tempPixel.w / diffSquare;",
        "           sumIntensity = sumIntensity + invertDiff  * 0.2;",
        "       }",
        "       }",
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


function createDataTexture(pointsArray, intensityArray, maxIntensity){
    if (pointsArray.length > 8 * 8){
        console.log("Way too many points to handle, taking first 8 * 8 points");
    }
    var dataTexture = new Uint8Array(8 * 8 * 4).fill(0);
    for ( var i = 0; i < 8 * 8; i++ ) {

        if ( i < pointsArray.length ){

            var tempPoint = this.get3xUint8Value(pointsArray[i]);
            dataTexture[4 * i] = tempPoint[0];
            dataTexture[4 * i + 1] = tempPoint[1];
            dataTexture[4 * i + 2] = tempPoint[2];
            dataTexture[4 * i + 3] = intensityArray[i] / maxIntensity * 255;                

        } else
            break;

    }
    dataTexture = new THREE.DataTexture(dataTexture, 8, 8, THREE.RGBAFormat);
    dataTexture.minFilter = THREE.NearestFilter;
    dataTexture.magFilter = THREE.NearestFilter;
    dataTexture.needsUpdate = true;
    console.log(dataTexture.image);
    return dataTexture;
}

function updateMaterial(materialObject, dataTexture){

    materialObject.uniforms['boxDataTexture'].value = dataTexture;
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
        var dataTexture = createDataTexture(points, intensityArray, maxIntensity);
    
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