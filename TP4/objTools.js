import { OBJLoader } from '../three.js-master/examples/jsm/loaders/OBJLoader.js';

export default class OBJTool {

    _loader;

    constructor() {
        this._loader = new OBJLoader();
    }

    makeAngle(angle) {
        return angle * (Math.PI/180);
    }

    getObjectBox(object) {
        let box3 = new THREE.Box3().setFromObject(object);
        return box3;
    }

    getObjectSize(object) {
        let vector3 = new THREE.Vector3();
        this.getObjectBox(object).getSize(vector3);
        return vector3;
    }

    createOBJModel(model, material, x, y, z, rX, rY, rZ, scale) {
        this._loader.load(
            model, 
            function(object) {

                // Mise à l'echelle
                let size = this.getObjectSize(object)
                let s = (1/ size.y) * scale
                object.scale.set(s, s, s)

                // Positionnement
                let adjustedBox = this.getObjectBox(object);
                object.position.set(x, Math.abs(adjustedBox.min.y)+y, z)
                scene.add(object)

                // Rotation
                object.rotateX(makeAngle(rX));
                object.rotateY(makeAngle(rY));
                object.rotateZ(makeAngle(rZ));

                // Material
                object.traverse(function(child){
                    if (child instanceof THREE.Mesh) { child.material = material; }
                })

            },
            function(xhr) {},
            function (error) {
                console.error(error);
            }
        );
    }


}