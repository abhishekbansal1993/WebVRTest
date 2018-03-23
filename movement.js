// params
const velocity = 2.5;

// init variables
let _movementCamera = null;
let _movementObject = null;
let _shouldMove = false;

// operation variables
let _movementCameraDirection = new THREE.Vector3();
let lastUnix = null;

const _getUnix = () => {

    if (Date.now){

        return Date.now();

    }else{

        return (new date).getTime();

    }

}

const _getDelta = () => {

    if (lastUnix){

        const delta = _getUnix() - lastUnix;
        lastUnix += delta;
        return delta;

    }else{

        lastUnix = _getUnix();
        return 0;

    }

}

const toggleMovement = () => {

    _shouldMove = !_shouldMove;

};

const setMovementCamera = (newCamera) => {

    _movementCamera = newCamera;

};

const setMovementObject = (newObject) => {

    _movementObject = newObject;

};

const moveCamera = () => {

    if (_movementCamera && _movementObject && _shouldMove){

        const timeDelta = _getDelta();
        _movementCamera.getWorldDirection(_movementCameraDirection);
        _movementCameraDirection.y = 0;
        _movementCameraDirection.normalize();
        _movementCameraDirection.multiplyScalar(timeDelta * velocity / 1000);
        _movementObject.position.add(_movementCameraDirection);

    }

};