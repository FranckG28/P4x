import { OBJLoader } from '../three.js-master/examples/jsm/loaders/OBJLoader.js';
import { Box3, Vector3, Mesh } from '../three.js-master/build/three.module.js';

export default class OBJTool {

    _loader;

    constructor() {
        this._loader = new OBJLoader();
    }

    makeAngle(angle) {
        return angle * (Math.PI/180);
    }

    getObjectBox(object) {
        let box3 = new Box3().setFromObject(object);
        return box3;
    }

    getObjectSize(object) {
        let vector3 = new Vector3();
        this.getObjectBox(object).getSize(vector3);
        return vector3;
    }

    createOBJModel(model, material, scale) {

        const parentClass = this;

        const myPromise = function(resolve, reject) {

            parentClass._loader.load(
                model, 
                function(object) {

                    // Mise à l'echelle
                    let size = parentClass.getObjectSize(object)
                    let s = (1/ size.y) * scale
                    object.scale.set(s, s, s)
    
                    // Positionnement
                    let adjustedBox = parentClass.getObjectBox(object);
                    object.position.set(0, Math.abs(adjustedBox.min.y), 0)
    
                    // Material
                    object.traverse(function(child){
                        if (child instanceof Mesh) { 
                            child.material = material; }
                    })
    
                    resolve(object);
    
                },
                function(xhr) {},
                function (error) {
                    reject(error);
                }
            );
        }

        return new Promise(myPromise);

    }

}