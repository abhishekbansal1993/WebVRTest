// params
const velocity = 2.5;

// init variables
let movementCamera = null;
let movementObject = null;

// operation variables
movementCameraDirection = new THREE.Vector3();
let lastUnix = null;

const getUnix = () => {

    if (Date.now){

        return Date.now();

    }else{

        return (new date).getTime();

    }

}

const getDelta = () => {

    if (lastUnix){

        const delta = getUnix() - lastUnix;
        lastUnix += delta;
        return delta;

    }else{

        lastUnix = getUnix();
        return 0;

    }

}

const setMovementCamera = (newCamera) => {

    movementCamera = newCamera;

}   

const setMovementObject = (newObject) => {

    movementObject = newObject;

}

const moveCamera = () => {

    if (movementCamera && movementObject){

        const timeDelta = getDelta();
        movementCamera.getWorldDirection(movementCameraDirection);
        movementCameraDirection.y = 0;
        movementCameraDirection.normalize();
        movementCameraDirection.multiplyScalar(timeDelta * velocity / 1000);
        movementObject.position.add(movementCameraDirection);

    }

}