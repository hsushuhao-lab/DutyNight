export class AssetLoadQueue {
  constructor() {
    this.pending=[];
    this.active=0;
    this.optionalActive=0;
  }

  enqueue(load,{optional=false}={}) {
    return new Promise((resolve,reject)=>{
      this.pending.push({load,optional,resolve,reject});
      queueMicrotask(()=>this.drain());
    });
  }

  drain() {
    while(this.active<3) {
      let index=this.pending.findIndex(job=>!job.optional);
      if(index<0&&this.optionalActive===0)index=this.pending.findIndex(job=>job.optional);
      if(index<0)return;
      const job=this.pending.splice(index,1)[0];
      this.active++;
      if(job.optional)this.optionalActive++;
      Promise.resolve().then(job.load).then(job.resolve,job.reject).finally(()=>{
        this.active--;
        if(job.optional)this.optionalActive--;
        this.drain();
      });
    }
  }
}

export const assetLoadQueue=new AssetLoadQueue();
