import { Mesh, TextureLoader, RepeatWrapping } from '../three.js-master/build/three.module.js';

export default class TextureTool {

    _loader;

    constructor() {
        this._loader = new TextureLoader();
    }

    loadTexture(path) {

        const parentClass = this;

        const myPromise = function(resolve, reject) {

            parentClass._loader.load(
                // resource URL
                path,

                // onLoad callback
                function ( texture ) {

                    texture.wrapS = RepeatWrapping;
                    texture.wrapT = RepeatWrapping;
                    resolve(texture);
                        
                },

                // onProgress callback currently not supported
                undefined,

                // onError callback
                function ( err ) {
                    reject( 'An error happened.' );
                }
            );
        }

        return new Promise(myPromise);

    }

}