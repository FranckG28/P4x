import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3, Mesh } from '../three.js-master/build/three.module.js';

export default class GLTFTools {

    _loader;

    constructor() {
        this._loader = new GLTFLoader();
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

    createGLTFObject(model, scale) {

        const parentClass = this;

        const myPromise = function(resolve, reject) {

            parentClass._loader.load(
                model, 
                function(gltf) {

                    let object = gltf.scene

                    // Mise à l'echelle
                    let size = parentClass.getObjectSize(object)
                    let s = (1/ size.y) * scale
                    object.scale.set(s, s, s)
    
                    // Positionnement
                    object.position.set(0,0,0)

                    // Ombres
                    object.traverse( function( node ) {

                        if ( node.isMesh ) { node.castShadow = true; }

                    } );
                    
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