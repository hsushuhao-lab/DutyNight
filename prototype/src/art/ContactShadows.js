import { DataTexture, FloatType, RedFormat, RepeatWrapping, Vector3 } from 'three';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

/** Fixed sampling preserves contact shading across screenshot runs. */
export class ContactShadows extends SSAOPass {
  generateSampleKernel(size) {
    for (let i=0;i<size;i++) {
      const z=(i+.5)/size, angle=i*2.399963229728653, radius=Math.sqrt(1-z*z);
      this.kernel.push(new Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,z).multiplyScalar(.1+.9*(i/size)**2));
    }
  }
  generateRandomKernelRotations() {
    let seed=20260917;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const simplex=new SimplexNoise({random});
    const data=Float32Array.from({length:16},()=>simplex.noise3d(random()*2-1,random()*2-1,0));
    this.noiseTexture=new DataTexture(data,4,4,RedFormat,FloatType);
    this.noiseTexture.wrapS=this.noiseTexture.wrapT=RepeatWrapping;
    this.noiseTexture.needsUpdate=true;
  }
}
